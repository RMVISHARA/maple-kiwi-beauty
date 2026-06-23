import { NextResponse } from "next/server";

// Static fallback data so the frontend works immediately without running MySQL
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: "Retinol 1% in Squalane",
    brand: "THE ORDINARY",
    origin: "CANADA",
    category: "Anti Aging",
    badge: "BESTSELLER",
    discountPercent: 17,
    subtitle: "Anti Aging - Age 25+ - Anti-aging skincare",
    reviewsCount: 1248,
    price: 4800,
    originalPrice: 5800,
    image: "/images/products/retinol.png",
    benefits: [
      "Helps reduce fine lines and wrinkles.",
      "Improves skin texture.",
      "Supports collagen production.",
      "Popular anti aging product."
    ],
    targetCustomers: "Age 25+ and customers interested in anti-aging skincare.",
    climateBenefit: "Formulated in squalane, which mimics skin's natural oils. This provides rich anti-aging support without blocking pores or feeling heavy in Sri Lanka's humid weather."
  },
  {
    id: 2,
    name: "Ascorbyl Glucoside Solution 12%",
    brand: "THE ORDINARY",
    origin: "CANADA",
    category: "Brightening",
    badge: "SALE",
    discountPercent: 15,
    subtitle: "Brightening - Pigmentation & uneven skin tone",
    reviewsCount: 876,
    price: 3900,
    originalPrice: 4600,
    image: "/images/products/vit_c.png",
    benefits: [
      "Brightens dull skin.",
      "Helps reduce dark spots.",
      "Antioxidant protection.",
      "Evens skin tone."
    ],
    targetCustomers: "People with pigmentation and uneven skin tone.",
    climateBenefit: "A water-soluble Vitamin C derivative that is incredibly stable and lightweight. Ideal for brightening and UV antioxidant protection in tropical sunshine without leaving an oily residue."
  },
  {
    id: 3,
    name: "Niacinamide 10% + Zinc 1%",
    brand: "THE ORDINARY",
    origin: "CANADA",
    category: "Acne & Oil Control",
    badge: "TOP RATED",
    discountPercent: null,
    subtitle: "Acne & Oil Control - Oily and combination skin types",
    reviewsCount: 2103,
    price: 3500,
    originalPrice: null,
    image: "/images/products/niacinamide.png",
    benefits: [
      "Reduces appearance of pores.",
      "Controls excess oil.",
      "Helps with acne-prone skin.",
      "Improves skin barrier."
    ],
    targetCustomers: "Oily and combination skin types.",
    climateBenefit: "An absolute essential for Sri Lanka's climate. Niacinamide regulates sebum production while Zinc calms inflammation, preventing breakouts caused by sweat and humidity."
  },
  {
    id: 4,
    name: "Hyaluronic Acid 2% + B5",
    brand: "THE ORDINARY",
    origin: "CANADA",
    category: "Hydration",
    badge: "CLIMATE PICK",
    discountPercent: 16,
    subtitle: "Hydration - Men and women of all ages",
    reviewsCount: 1654,
    price: 4200,
    originalPrice: 5000,
    image: "/images/products/hyaluronic.png",
    benefits: [
      "Deep hydration.",
      "Makes skin look plumper.",
      "Suitable for all skin types.",
      "Excellent for Sri Lanka's warm climate."
    ],
    targetCustomers: "Men and women of all ages.",
    climateBenefit: "Provides deep hydration by binding water to the skin without using heavy emollients. Absorbs instantly and leaves skin feeling plump, fresh, and cooled in warm climates."
  },
  {
    id: 5,
    name: "Protect + Hydrate SPF 50 Sunscreen",
    brand: "AVEENO",
    origin: "CANADA",
    category: "Sun Protection",
    badge: "ESSENTIAL",
    discountPercent: 17,
    subtitle: "Sun Protection - Everyone using skincare products",
    reviewsCount: 934,
    price: 6500,
    originalPrice: 7800,
    image: "/images/products/sunscreen.png",
    benefits: [
      "Protects against UV damage.",
      "Helps prevent premature aging.",
      "Essential daily skincare product.",
      "Suitable for tropical weather."
    ],
    targetCustomers: "Everyone using skincare products.",
    climateBenefit: "Broad-spectrum SPF 50 protection infused with prebiotic oat to soothe skin. Sweat and water-resistant, making it perfect for Sri Lanka's warm outdoors and tropical beaches."
  }
];

export async function GET(request) {
  try {
    // -------------------------------------------------------------
    // DATABASE CONNECTION TEMPLATE FOR BACKEND DEVELOPER:
    // To connect MySQL:
    // 1. Run: npm install mysql2
    // 2. Add connection environment variables to .env.local
    // 3. Uncomment the block below and replace the return statement.
    // -------------------------------------------------------------
    
    /*
    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'maple_kiwi_beauty'
    });

    // Fetch all products
    const [productsRows] = await connection.query('SELECT * FROM products');
    
    // Fetch all benefits
    const [benefitsRows] = await connection.query('SELECT * FROM product_benefits');
    
    await connection.end();

    // Map benefits into their respective products
    const products = productsRows.map(prod => {
      return {
        id: prod.id,
        name: prod.name,
        brand: prod.brand,
        origin: prod.origin,
        category: prod.category,
        badge: prod.badge,
        discountPercent: prod.discount_percent,
        subtitle: prod.subtitle,
        reviewsCount: prod.reviews_count,
        price: prod.price,
        originalPrice: prod.original_price,
        image: prod.image,
        targetCustomers: prod.target_customers,
        climateBenefit: prod.climate_benefit,
        benefits: benefitsRows
          .filter(b => b.product_id === prod.id)
          .map(b => b.benefit)
      };
    });

    return NextResponse.json(products);
    */

    // Return fallback products for client testing out-of-the-box
    return NextResponse.json(FALLBACK_PRODUCTS);
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
