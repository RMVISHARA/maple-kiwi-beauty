import { pool, query, withTransaction } from "@/lib/db";
import { attachUploadToProduct, attachAdditionalUploadToProduct, attachUploadToVariant } from "@/lib/images";
import { normalizeOrigin, ORIGINS } from "@/lib/origins";
import { findBadgePreset } from "@/lib/badges";
import { ensureCategory } from "@/lib/categories";

// Columns fetched for listings — excludes image_data blob for performance.
const PRODUCT_COLUMNS = `
  id, name, brand, origin, category, badge, badge_color, discount_percent, subtitle,
  reviews_count, price, original_price, size_value, measure_unit, package_type, image, image_mime_type,
  target_customers, climate_benefit, in_stock, stock_quantity, show_stock, expiry_date, created_at
`;

// Variant columns — excludes image_data blob for performance.
const VARIANT_COLUMNS = `
  id, product_id, size_value, measure_unit, package_type, price, original_price, discount_percent,
  stock_quantity, in_stock, expiry_date, image, sort_order
`;

// Fields that must never reach customers/storefront. Stripped by toPublicProduct.
const ADMIN_ONLY_FIELDS = ["expiryDate"];

// Largest value a MySQL INT column can hold. Prices/counts above this would
// overflow the column (errno 1264 "Out of range value"), so we reject them with
// a clear message instead of letting the raw DB error surface as a 500.
const INT_MAX = 2147483647;
// size_value is DECIMAL(8,2) -> max 999999.99.
const SIZE_MAX = 999999.99;

function validationError(message) {
  return Object.assign(new Error(message), { status: 400 });
}

// Coerce a value to a whole number within [min, max]. Returns null for empty
// values when allowNull is set, or defaultValue when provided. Throws a 400-style
// error (with a friendly message) for non-numbers or out-of-range values.
function toIntInRange(value, { field, min = 0, max = INT_MAX, allowNull = false, defaultValue } = {}) {
  if (value === null || value === undefined || value === "") {
    if (allowNull) return null;
    if (defaultValue !== undefined) return defaultValue;
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw validationError(`${field} must be a valid number.`);
  }
  const rounded = Math.round(n);
  if (rounded < min || rounded > max) {
    throw validationError(`${field} must be between ${min.toLocaleString()} and ${max.toLocaleString()}.`);
  }
  return rounded;
}

// Coerce a value to a decimal within [min, max], or null when empty.
function toDecimalOrNull(value, { field, min = 0, max = SIZE_MAX } = {}) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw validationError(`${field} must be a valid number.`);
  }
  if (n < min || n > max) {
    throw validationError(`${field} must be between ${min} and ${max}.`);
  }
  return n;
}

// Format a MySQL DATE (returned as a JS Date or string) to "YYYY-MM-DD" or null.
function formatDateOnly(value) {
  if (!value) return null;
  if (typeof value === "string") return value.slice(0, 10);
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Remove admin-only fields (e.g. expiryDate) before sending a product to the
// public storefront so customers never see internal stock data. The remaining
// stock count is only kept when the admin opted to show it (showStock).
export function toPublicProduct(product) {
  if (!product) return product;
  const clone = { ...product };
  for (const field of ADMIN_ONLY_FIELDS) delete clone[field];
  if (!clone.showStock) delete clone.stockQuantity;
  if (Array.isArray(clone.variants)) {
    clone.variants = clone.variants.map((v) => {
      const cv = { ...v };
      delete cv.expiryDate;
      if (!clone.showStock) delete cv.stockQuantity;
      return cv;
    });
  }
  return clone;
}

// Normalize a variant payload coming from the admin form into DB-ready values.
function normalizeVariantInput(v) {
  return {
    size: toDecimalOrNull(v.size, { field: "Variant size" }),
    unit: v.unit || null,
    packageType: v.packageType || null,
    price: toIntInRange(v.price, { field: "Variant price", min: 0 }),
    originalPrice: toIntInRange(v.originalPrice, { field: "Variant original price", min: 0, allowNull: true }),
    discountPercent: toIntInRange(v.discountPercent, { field: "Variant discount percent", min: 0, max: 100, allowNull: true }),
    stockQuantity: toIntInRange(v.stockQuantity, { field: "Variant stock quantity", min: 0, allowNull: true }),
    inStock: v.inStock === false ? 0 : 1,
    expiryDate: v.expiryDate || null,
    image: v.image || null,
  };
}

function mapVariantRow(row) {
  return {
    id: row.id,
    size: row.size_value === undefined || row.size_value === null ? null : Number(row.size_value),
    unit: row.measure_unit ?? null,
    packageType: row.package_type ?? null,
    price: row.price,
    originalPrice: row.original_price,
    discountPercent: row.discount_percent,
    stockQuantity:
      row.stock_quantity === undefined || row.stock_quantity === null ? null : Number(row.stock_quantity),
    inStock: row.in_stock === undefined ? true : !!row.in_stock,
    expiryDate: formatDateOnly(row.expiry_date),
    image: row.image || null,
  };
}

// Insert one variant row inside a transaction; returns { variantId, uploadId }.
async function insertVariant(conn, productId, v, sortOrder) {
  const nv = normalizeVariantInput(v);
  const [res] = await conn.execute(
    `INSERT INTO product_variants
      (product_id, size_value, measure_unit, package_type, price, original_price, discount_percent,
       stock_quantity, in_stock, expiry_date, image, sort_order)
     VALUES
      (:productId, :size, :unit, :packageType, :price, :originalPrice, :discountPercent,
       :stockQuantity, :inStock, :expiryDate, :image, :sortOrder)`,
    {
      productId,
      size: nv.size,
      unit: nv.unit,
      packageType: nv.packageType,
      price: nv.price,
      originalPrice: nv.originalPrice,
      discountPercent: nv.discountPercent,
      stockQuantity: nv.stockQuantity,
      inStock: nv.inStock,
      expiryDate: nv.expiryDate,
      // When an upload is attached later it sets the image URL; store any static path meanwhile.
      image: v.imageUploadId ? null : nv.image,
      sortOrder,
    }
  );
  return { variantId: res.insertId, uploadId: v.imageUploadId || null };
}

// Static fallback data so the storefront keeps working even when MySQL/XAMPP
// is not running. The API flags responses served from here with a header.
export const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Retinol 1% in Squalane",
    brand: "THE ORDINARY",
    origin: "CANADA",
    category: "Anti Aging",
    badge: "BESTSELLER",
    badgeColor: "#3d2f27",
    discountPercent: 17,
    subtitle: "Anti Aging - Age 25+ - Anti-aging skincare",
    reviewsCount: 1248,
    price: 4800,
    originalPrice: 5800,
    size: 30,
    unit: "ml",
    packageType: "dropper",
    image: "/images/products/retinol.png",
    benefits: [
      "Helps reduce fine lines and wrinkles.",
      "Improves skin texture.",
      "Supports collagen production.",
      "Popular anti aging product.",
    ],
    targetCustomers: "Age 25+ and customers interested in anti-aging skincare.",
    climateBenefit:
      "Formulated in squalane, which mimics skin's natural oils. This provides rich anti-aging support without blocking pores or feeling heavy in Sri Lanka's humid weather.",
  },
  {
    id: 2,
    name: "Ascorbyl Glucoside Solution 12%",
    brand: "THE ORDINARY",
    origin: "CANADA",
    category: "Brightening",
    badge: "SALE",
    badgeColor: "#c4726e",
    discountPercent: 15,
    subtitle: "Brightening - Pigmentation & uneven skin tone",
    reviewsCount: 876,
    price: 3900,
    originalPrice: 4600,
    size: 30,
    unit: "ml",
    packageType: "dropper",
    image: "/images/products/vit_c.png",
    benefits: [
      "Brightens dull skin.",
      "Helps reduce dark spots.",
      "Antioxidant protection.",
      "Evens skin tone.",
    ],
    targetCustomers: "People with pigmentation and uneven skin tone.",
    climateBenefit:
      "A water-soluble Vitamin C derivative that is incredibly stable and lightweight. Ideal for brightening and UV antioxidant protection in tropical sunshine without leaving an oily residue.",
  },
  {
    id: 3,
    name: "Niacinamide 10% + Zinc 1%",
    brand: "THE ORDINARY",
    origin: "CANADA",
    category: "Acne & Oil Control",
    badge: "TOP RATED",
    badgeColor: "#8A9A86",
    discountPercent: null,
    subtitle: "Acne & Oil Control - Oily and combination skin types",
    reviewsCount: 2103,
    price: 3500,
    originalPrice: null,
    size: 30,
    unit: "ml",
    packageType: "dropper",
    image: "/images/products/niacinamide.png",
    benefits: [
      "Reduces appearance of pores.",
      "Controls excess oil.",
      "Helps with acne-prone skin.",
      "Improves skin barrier.",
    ],
    targetCustomers: "Oily and combination skin types.",
    climateBenefit:
      "An absolute essential for Sri Lanka's climate. Niacinamide regulates sebum production while Zinc calms inflammation, preventing breakouts caused by sweat and humidity.",
  },
  {
    id: 4,
    name: "Hyaluronic Acid 2% + B5",
    brand: "THE ORDINARY",
    origin: "CANADA",
    category: "Hydration",
    badge: "CLIMATE PICK",
    badgeColor: "#4B6F44",
    discountPercent: 16,
    subtitle: "Hydration - Men and women of all ages",
    reviewsCount: 1654,
    price: 4200,
    originalPrice: 5000,
    size: 30,
    unit: "ml",
    packageType: "dropper",
    image: "/images/products/hyaluronic.png",
    benefits: [
      "Deep hydration.",
      "Makes skin look plumper.",
      "Suitable for all skin types.",
      "Excellent for Sri Lanka's warm climate.",
    ],
    targetCustomers: "Men and women of all ages.",
    climateBenefit:
      "Provides deep hydration by binding water to the skin without using heavy emollients. Absorbs instantly and leaves skin feeling plump, fresh, and cooled in warm climates.",
  },
  {
    id: 5,
    name: "Protect + Hydrate SPF 50 Sunscreen",
    brand: "AVEENO",
    origin: "CANADA",
    category: "Sun Protection",
    badge: "ESSENTIAL",
    badgeColor: "#8FBC8F",
    discountPercent: 17,
    subtitle: "Sun Protection - Everyone using skincare products",
    reviewsCount: 934,
    price: 6500,
    originalPrice: 7800,
    size: 88,
    unit: "ml",
    packageType: "tube",
    image: "/images/products/sunscreen.png",
    benefits: [
      "Protects against UV damage.",
      "Helps prevent premature aging.",
      "Essential daily skincare product.",
      "Suitable for tropical weather.",
    ],
    targetCustomers: "Everyone using skincare products.",
    climateBenefit:
      "Broad-spectrum SPF 50 protection infused with prebiotic oat to soothe skin. Sweat and water-resistant, making it perfect for Sri Lanka's warm outdoors and tropical beaches.",
  },
  {
    id: 6,
    name: "Certified Organic Rosehip Oil",
    brand: "TRILOGY",
    origin: "NEW ZEALAND",
    category: "Hydration",
    badge: "ORGANIC",
    badgeColor: "#4B6F44",
    discountPercent: 15,
    subtitle: "Hydration - Pure organic cold-pressed rosehip oil",
    reviewsCount: 412,
    price: 5800,
    originalPrice: 6800,
    size: 45,
    unit: "ml",
    packageType: "dropper",
    image: "/images/products/rosehip_oil.png",
    benefits: [
      "Promotes skin elasticity and firmness.",
      "Nourishes and deeply moisturizes.",
      "Helps reduce the appearance of scars and stretch marks.",
      "Rich in essential fatty acids and antioxidants.",
    ],
    targetCustomers: "Dry, dehydrated, and aging skin types.",
    climateBenefit:
      "Certified organic cold-pressed rosehip oil that delivers intense hydration and nourishment to dry skin. Extremely lightweight and fast-absorbing, perfect for locking in moisture in tropical settings.",
  },
  {
    id: 7,
    name: "Aura Manuka Honey Treatment Mask",
    brand: "ANTIPODES",
    origin: "NEW ZEALAND",
    category: "Acne & Oil Control",
    badge: "BIOACTIVE",
    badgeColor: "#8A9A86",
    discountPercent: 15,
    subtitle: "Acne & Oil Control - Purifying and hydrating treatment mask",
    reviewsCount: 328,
    price: 7200,
    originalPrice: 8500,
    size: 75,
    unit: "ml",
    packageType: "tube",
    image: "/images/products/manuka_mask.png",
    benefits: [
      "Antibacterial manuka honey helps clear blemishes.",
      "Calms skin inflammation and redness.",
      "Deeply hydrates and softens.",
      "Refreshing vanilla and mandarin scent.",
    ],
    targetCustomers: "Acne-prone, blemish-prone, and sensitive skin types.",
    climateBenefit:
      "Formulated with premium New Zealand manuka honey, this bioactive mask targets blemishes and calms redness. It cleanses deeply while drawing moisture into the skin, preventing dryness from tropical heat.",
  },
  {
    id: 8,
    name: "Rotorua Mud Face Pack with Royal Jelly",
    brand: "WILD FERNS",
    origin: "NEW ZEALAND",
    category: "Brightening",
    badge: "DETOX",
    badgeColor: "#3d2f27",
    discountPercent: 15,
    subtitle: "Brightening - Detoxifying and pore-refining facial pack",
    reviewsCount: 186,
    price: 4900,
    originalPrice: 5800,
    size: 95,
    unit: "g",
    packageType: "jar",
    image: "/images/products/rotorua_mud.png",
    benefits: [
      "Purifies pores and absorbs excess sebum.",
      "Royal jelly nourishes and brightens skin.",
      "Promotes cell regeneration and a glowing complexion.",
      "Rich in natural volcanic minerals.",
    ],
    targetCustomers: "Dull, oily, and clogged skin types.",
    climateBenefit:
      "Made with mineral-rich thermal mud from Rotorua, New Zealand, this mask detoxifies the skin and refines pores. It absorbs excess sebum and removes dead skin cells, restoring a bright, glowing complexion.",
  },
  {
    id: 9,
    name: "Avocado Pear Nourishing Night Cream",
    brand: "ANTIPODES",
    origin: "NEW ZEALAND",
    category: "Anti Aging",
    badge: "COLLAGEN BOOST",
    badgeColor: "#2E473B",
    discountPercent: 15,
    subtitle: "Anti Aging - Collagen-boosting nourishing night cream",
    reviewsCount: 254,
    price: 6900,
    originalPrice: 8200,
    size: 60,
    unit: "ml",
    packageType: "jar",
    image: "/images/products/avocado_cream.png",
    benefits: [
      "Boosts skin collagen production naturally.",
      "Deeply nourishes with organic avocado oil.",
      "Reduces fine lines and visible signs of aging.",
      "Enriched with aromatic sandalwood and patchouli.",
    ],
    targetCustomers: "Dry, mature, and aging skin types.",
    climateBenefit:
      "Infused with nutrient-rich New Zealand avocado pear oil and bioactive extract, this night cream naturally stimulates collagen production. It restores skin elasticity overnight without clogging pores in humid weather.",
  },
  {
    id: 10,
    name: "Manuka Honey Protective SPF 30 Sunscreen",
    brand: "WILD FERNS",
    origin: "NEW ZEALAND",
    category: "Sun Protection",
    badge: "PROTECTIVE",
    badgeColor: "#D4AF37",
    discountPercent: 15,
    subtitle: "Sun Protection - Daily sun protective lotion with Manuka Honey",
    reviewsCount: 198,
    price: 5500,
    originalPrice: 6500,
    size: 100,
    unit: "ml",
    packageType: "tube",
    image: "/images/products/manuka_sunscreen.png",
    benefits: [
      "Protects against harmful UVA and UVB rays.",
      "Active manuka honey naturally hydrates and heals.",
      "Absorbs quickly with no greasy residue or white cast.",
      "Sweat-resistant and perfect for daily wear in hot climates.",
    ],
    targetCustomers: "All skin types needing daily UV protection.",
    climateBenefit:
      "Formulated with New Zealand active manuka honey, this daily sunscreen offers broad-spectrum SPF 30 protection while soothing and repairing sun-stressed skin. Lightweight and non-greasy.",
  },
];

// Map a raw DB row (+ benefit list + variants) to the camelCase shape the frontend expects.
function mapProductRow(row, benefits = [], additionalImages = [], variants = []) {
  const primaryImage = row.image || "/images/products/placeholder.png";
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    origin: normalizeOrigin(row.origin) || ORIGINS.CANADA,
    category: row.category,
    badge: row.badge,
    badgeColor: row.badge_color ?? findBadgePreset(row.badge)?.bg ?? null,
    discountPercent: row.discount_percent,
    subtitle: row.subtitle,
    reviewsCount: row.reviews_count,
    price: row.price,
    originalPrice: row.original_price,
    size: row.size_value === undefined || row.size_value === null ? null : Number(row.size_value),
    unit: row.measure_unit ?? null,
    packageType: row.package_type ?? null,
    image: primaryImage,
    targetCustomers: row.target_customers,
    climateBenefit: row.climate_benefit,
    inStock: row.in_stock === undefined ? true : !!row.in_stock,
    stockQuantity: row.stock_quantity === undefined || row.stock_quantity === null ? null : Number(row.stock_quantity),
    showStock: !!row.show_stock,
    expiryDate: formatDateOnly(row.expiry_date),
    benefits,
    images: [primaryImage, ...additionalImages],
    variants,
  };
}

export async function getAllProducts() {
  const productRows = await query(`SELECT ${PRODUCT_COLUMNS} FROM products ORDER BY id ASC`);
  const benefitRows = await query("SELECT * FROM product_benefits");
  const imageRows = await query("SELECT product_id, image FROM product_images ORDER BY id ASC");
  const variantRows = await query(
    `SELECT ${VARIANT_COLUMNS} FROM product_variants ORDER BY product_id ASC, sort_order ASC, id ASC`
  );

  return productRows.map((row) =>
    mapProductRow(
      row,
      benefitRows.filter((b) => b.product_id === row.id).map((b) => b.benefit),
      imageRows.filter((img) => img.product_id === row.id).map((img) => img.image),
      variantRows.filter((v) => v.product_id === row.id).map(mapVariantRow)
    )
  );
}

export async function getProductById(id) {
  const productRows = await query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = :id`, { id });
  if (productRows.length === 0) return null;

  const benefitRows = await query(
    "SELECT benefit FROM product_benefits WHERE product_id = :id",
    { id }
  );

  const imageRows = await query(
    "SELECT image FROM product_images WHERE product_id = :id ORDER BY id ASC",
    { id }
  );

  const variantRows = await query(
    `SELECT ${VARIANT_COLUMNS} FROM product_variants WHERE product_id = :id ORDER BY sort_order ASC, id ASC`,
    { id }
  );

  return mapProductRow(
    productRows[0],
    benefitRows.map((b) => b.benefit),
    imageRows.map((img) => img.image),
    variantRows.map(mapVariantRow)
  );
}

export async function createProduct(data) {
  const {
    name,
    brand,
    origin = "CANADA",
    category,
    badge = null,
    badgeColor = null,
    discountPercent = null,
    subtitle,
    reviewsCount = 0,
    price,
    originalPrice = null,
    size = null,
    unit = null,
    packageType = null,
    image,
    imageUploadId = null,
    additionalImageUploadIds = [],
    targetCustomers,
    climateBenefit = null,
    inStock = true,
    stockQuantity = null,
    showStock = false,
    expiryDate = null,
    benefits = [],
    variants = [],
  } = data;

  const categoryName = await ensureCategory(category);
  if (!categoryName) {
    throw new Error("Category is required");
  }

  // Validate/clamp numeric fields up front so an out-of-range value (e.g. a price
  // with too many digits) fails with a clear 400 instead of a raw DB 500.
  const priceValue = toIntInRange(price, { field: "Price", min: 0 });
  const originalPriceValue = toIntInRange(originalPrice, { field: "Original price", min: 0, allowNull: true });
  const discountValue = toIntInRange(discountPercent, { field: "Discount percent", min: 0, max: 100, allowNull: true });
  const reviewsValue = toIntInRange(reviewsCount, { field: "Reviews count", min: 0, defaultValue: 0 });
  const stockValue = toIntInRange(stockQuantity, { field: "Stock quantity", min: 0, allowNull: true });
  const sizeValue = toDecimalOrNull(size, { field: "Size" });

  const variantAttachTasks = [];
  const productId = await withTransaction(async (conn) => {
    const [result] = await conn.execute(
      `INSERT INTO products
        (name, brand, origin, category, badge, badge_color, discount_percent, subtitle,
         reviews_count, price, original_price, size_value, measure_unit, package_type,
         image, target_customers, climate_benefit, in_stock,
         stock_quantity, show_stock, expiry_date)
       VALUES
        (:name, :brand, :origin, :category, :badge, :badgeColor, :discountPercent, :subtitle,
         :reviewsCount, :price, :originalPrice, :sizeValue, :measureUnit, :packageType,
         :image, :targetCustomers, :climateBenefit, :inStock,
         :stockQuantity, :showStock, :expiryDate)`,
      {
        name,
        brand,
        origin: normalizeOrigin(origin) || ORIGINS.CANADA,
        category: categoryName,
        badge,
        badgeColor,
        discountPercent: discountValue,
        subtitle,
        reviewsCount: reviewsValue,
        price: priceValue,
        originalPrice: originalPriceValue,
        sizeValue,
        measureUnit: unit || null,
        packageType: packageType || null,
        image: image || "/images/products/placeholder.png",
        targetCustomers,
        climateBenefit,
        inStock: inStock ? 1 : 0,
        stockQuantity: stockValue,
        showStock: showStock ? 1 : 0,
        expiryDate: expiryDate || null,
      }
    );

    const newId = result.insertId;

    for (const benefit of benefits) {
      await conn.execute(
        "INSERT INTO product_benefits (product_id, benefit) VALUES (:productId, :benefit)",
        { productId: newId, benefit }
      );
    }

    let order = 0;
    for (const v of Array.isArray(variants) ? variants : []) {
      const task = await insertVariant(conn, newId, v, order++);
      if (task.uploadId) variantAttachTasks.push(task);
    }

    return newId;
  });

  if (imageUploadId) {
    const attached = await attachUploadToProduct(productId, imageUploadId);
    if (!attached) {
      throw new Error("Uploaded image not found. Please upload the image again.");
    }
  } else if (!image) {
    throw new Error("Product image is required.");
  }

  // Attach additional image uploads
  if (Array.isArray(additionalImageUploadIds) && additionalImageUploadIds.length > 0) {
    for (const uploadId of additionalImageUploadIds) {
      await attachAdditionalUploadToProduct(productId, uploadId);
    }
  }

  for (const task of variantAttachTasks) {
    const attached = await attachUploadToVariant(task.variantId, task.uploadId);
    if (!attached) {
      throw new Error("An uploaded variant image was not found. Please upload it again.");
    }
  }

  return productId;
}

export async function updateProduct(id, data) {
  const existing = await query(`SELECT ${PRODUCT_COLUMNS} FROM products WHERE id = :id`, { id });
  if (existing.length === 0) return false;

  const current = existing[0];
  const pick = (key, col) => (key in data ? data[key] : current[col]);
  const categoryName =
    "category" in data ? await ensureCategory(data.category) : current.category;
  if ("category" in data && !categoryName) {
    throw new Error("Category is required");
  }
  const merged = {
    name: pick("name", "name"),
    brand: pick("brand", "brand"),
    origin: normalizeOrigin(pick("origin", "origin")) || ORIGINS.CANADA,
    category: categoryName,
    badge: pick("badge", "badge"),
    badgeColor: pick("badgeColor", "badge_color"),
    discountPercent: toIntInRange(pick("discountPercent", "discount_percent"), { field: "Discount percent", min: 0, max: 100, allowNull: true }),
    subtitle: pick("subtitle", "subtitle"),
    reviewsCount: toIntInRange(pick("reviewsCount", "reviews_count"), { field: "Reviews count", min: 0, defaultValue: 0 }),
    price: toIntInRange(pick("price", "price"), { field: "Price", min: 0 }),
    originalPrice: toIntInRange(pick("originalPrice", "original_price"), { field: "Original price", min: 0, allowNull: true }),
    sizeValue: toDecimalOrNull("size" in data ? data.size : current.size_value, { field: "Size" }),
    measureUnit: ("unit" in data ? data.unit : current.measure_unit) || null,
    packageType: ("packageType" in data ? data.packageType : current.package_type) || null,
    image: pick("image", "image"),
    targetCustomers: pick("targetCustomers", "target_customers"),
    climateBenefit: pick("climateBenefit", "climate_benefit"),
    inStock: ("inStock" in data ? data.inStock : !!current.in_stock) ? 1 : 0,
    stockQuantity: toIntInRange("stockQuantity" in data ? data.stockQuantity : current.stock_quantity, { field: "Stock quantity", min: 0, allowNull: true }),
    showStock: ("showStock" in data ? data.showStock : !!current.show_stock) ? 1 : 0,
    expiryDate:
      ("expiryDate" in data ? data.expiryDate : formatDateOnly(current.expiry_date)) || null,
  };

  const variantAttachTasks = [];
  await withTransaction(async (conn) => {
    await conn.execute(
      `UPDATE products SET
        name = :name, brand = :brand, origin = :origin, category = :category,
        badge = :badge, badge_color = :badgeColor, discount_percent = :discountPercent, subtitle = :subtitle,
        reviews_count = :reviewsCount, price = :price, original_price = :originalPrice,
        size_value = :sizeValue, measure_unit = :measureUnit, package_type = :packageType,
        image = :image, target_customers = :targetCustomers, climate_benefit = :climateBenefit,
        in_stock = :inStock, stock_quantity = :stockQuantity, show_stock = :showStock, expiry_date = :expiryDate
       WHERE id = :id`,
      { ...merged, id }
    );

    // New upload is attached after the transaction (see below).
    if ("image" in data && !data.imageUploadId && !String(data.image).startsWith("/api/products/")) {
      // Switched to a static file path — drop any stored blob.
      await conn.execute(
        "UPDATE products SET image_data = NULL, image_mime_type = NULL WHERE id = :id",
        { id }
      );
    }

    if (Array.isArray(data.benefits)) {
      await conn.execute("DELETE FROM product_benefits WHERE product_id = :id", { id });
      for (const benefit of data.benefits) {
        await conn.execute(
          "INSERT INTO product_benefits (product_id, benefit) VALUES (:id, :benefit)",
          { id, benefit }
        );
      }
    }

    // Sync additional images in DB: delete any existing image records not in the submitted data.images array.
    if ("images" in data && Array.isArray(data.images)) {
      const [rows] = await conn.execute(
        "SELECT id, image FROM product_images WHERE product_id = :id",
        { id }
      );
      for (const row of rows) {
        if (!data.images.includes(row.image)) {
          await conn.execute("DELETE FROM product_images WHERE id = :imageId", { imageId: row.id });
        }
      }
    }

    // Upsert variants only when the caller sent a variants array. Existing rows
    // are updated by id (preserving stored images), new rows inserted, and any
    // omitted rows deleted.
    if (Array.isArray(data.variants)) {
      const [existingRows] = await conn.execute(
        "SELECT id FROM product_variants WHERE product_id = :id",
        { id }
      );
      const existingIds = new Set(existingRows.map((r) => r.id));
      const keepIds = [];
      let order = 0;

      for (const v of data.variants) {
        const sortOrder = order++;
        const vid = Number(v.id);
        if (vid && existingIds.has(vid)) {
          const nv = normalizeVariantInput(v);
          await conn.execute(
            `UPDATE product_variants SET
               size_value = :size, measure_unit = :unit, package_type = :packageType, price = :price,
               original_price = :originalPrice, discount_percent = :discountPercent,
               stock_quantity = :stockQuantity, in_stock = :inStock, expiry_date = :expiryDate,
               image = :image, sort_order = :sortOrder
             WHERE id = :vid AND product_id = :id`,
            {
              size: nv.size,
              unit: nv.unit,
              packageType: nv.packageType,
              price: nv.price,
              originalPrice: nv.originalPrice,
              discountPercent: nv.discountPercent,
              stockQuantity: nv.stockQuantity,
              inStock: nv.inStock,
              expiryDate: nv.expiryDate,
              image: v.imageUploadId ? null : nv.image,
              sortOrder,
              vid,
              id,
            }
          );
          // Switched to a static path (no new upload) — drop any stored blob.
          if (!v.imageUploadId && v.image && !String(v.image).startsWith("/api/products/variants/")) {
            await conn.execute(
              "UPDATE product_variants SET image_data = NULL, image_mime_type = NULL WHERE id = :vid",
              { vid }
            );
          }
          if (v.imageUploadId) variantAttachTasks.push({ variantId: vid, uploadId: v.imageUploadId });
          keepIds.push(vid);
        } else {
          const task = await insertVariant(conn, id, v, sortOrder);
          if (task.uploadId) variantAttachTasks.push(task);
          keepIds.push(task.variantId);
        }
      }

      if (keepIds.length > 0) {
        const placeholders = keepIds.map((_, i) => `:k${i}`).join(", ");
        const params = { id };
        keepIds.forEach((k, i) => {
          params[`k${i}`] = k;
        });
        await conn.execute(
          `DELETE FROM product_variants WHERE product_id = :id AND id NOT IN (${placeholders})`,
          params
        );
      } else {
        await conn.execute("DELETE FROM product_variants WHERE product_id = :id", { id });
      }
    }
  });

  if (data.imageUploadId) {
    const attached = await attachUploadToProduct(id, data.imageUploadId);
    if (!attached) {
      throw new Error("Uploaded image not found. Please upload the image again.");
    }
  }

  // Attach new additional image uploads
  if (Array.isArray(data.additionalImageUploadIds) && data.additionalImageUploadIds.length > 0) {
    for (const uploadId of data.additionalImageUploadIds) {
      await attachAdditionalUploadToProduct(id, uploadId);
    }
  }

  for (const task of variantAttachTasks) {
    const attached = await attachUploadToVariant(task.variantId, task.uploadId);
    if (!attached) {
      throw new Error("An uploaded variant image was not found. Please upload it again.");
    }
  }

  return true;
}

export async function deleteProduct(id) {
  const [result] = await pool.execute("DELETE FROM products WHERE id = :id", { id });
  return result.affectedRows > 0;
}
