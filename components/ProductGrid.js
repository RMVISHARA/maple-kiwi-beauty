"use client";

import React, { useState, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { matchesOriginFilter } from "@/lib/origins";
import { FALLBACK_CATEGORIES } from "@/lib/categoryData";
import { SlidersHorizontal } from "lucide-react";

// Fallback data used only if the /api/products request fails (e.g. MySQL offline).
export const PRODUCTS_DATA = [
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
    climateBenefit: "Broad-spectrum SPF 50 protection infused with prebiotic oat to soothe skin. Sweat and water-resistant, making it perfect for Sri Lanka's warm outdoors and tropical beaches."
  },
  {
    id: 6,
    name: "Certified Organic Rosehip Oil",
    brand: "TRILOGY",
    origin: "NEW ZEALAND",
    category: "Hydration",
    badge: "ORGANIC",
    discountPercent: 15,
    subtitle: "Hydration - Pure organic cold-pressed rosehip oil",
    reviewsCount: 412,
    price: 5800,
    originalPrice: 6800,
    image: "/images/products/rosehip_oil.png",
    benefits: [
      "Promotes skin elasticity and firmness.",
      "Nourishes and deeply moisturizes.",
      "Helps reduce the appearance of scars and stretch marks.",
      "Rich in essential fatty acids and antioxidants."
    ],
    targetCustomers: "Dry, dehydrated, and aging skin types.",
    climateBenefit: "Certified organic cold-pressed rosehip oil that delivers intense hydration and nourishment to dry skin. Extremely lightweight and fast-absorbing, perfect for locking in moisture in tropical settings."
  },
  {
    id: 7,
    name: "Aura Manuka Honey Treatment Mask",
    brand: "ANTIPODES",
    origin: "NEW ZEALAND",
    category: "Acne & Oil Control",
    badge: "BIOACTIVE",
    discountPercent: 15,
    subtitle: "Acne & Oil Control - Purifying and hydrating treatment mask",
    reviewsCount: 328,
    price: 7200,
    originalPrice: 8500,
    image: "/images/products/manuka_mask.png",
    benefits: [
      "Antibacterial manuka honey helps clear blemishes.",
      "Calms skin inflammation and redness.",
      "Deeply hydrates and softens.",
      "Refreshing vanilla and mandarin scent."
    ],
    targetCustomers: "Acne-prone, blemish-prone, and sensitive skin types.",
    climateBenefit: "Formulated with premium New Zealand manuka honey, this bioactive mask targets blemishes and calms redness. It cleanses deeply while drawing moisture into the skin, preventing dryness from tropical heat."
  },
  {
    id: 8,
    name: "Rotorua Mud Face Pack with Royal Jelly",
    brand: "WILD FERNS",
    origin: "NEW ZEALAND",
    category: "Brightening",
    badge: "DETOX",
    discountPercent: 15,
    subtitle: "Brightening - Detoxifying and pore-refining facial pack",
    reviewsCount: 186,
    price: 4900,
    originalPrice: 5800,
    image: "/images/products/rotorua_mud.png",
    benefits: [
      "Purifies pores and absorbs excess sebum.",
      "Royal jelly nourishes and brightens skin.",
      "Promotes cell regeneration and a glowing complexion.",
      "Rich in natural volcanic minerals."
    ],
    climateBenefit: "Made with mineral-rich thermal mud from Rotorua, New Zealand, this mask detoxifies the skin and refines pores. It absorbs excess sebum and removes dead skin cells, restoring a bright, glowing complexion."
  },
  {
    id: 9,
    name: "Avocado Pear Nourishing Night Cream",
    brand: "ANTIPODES",
    origin: "NEW ZEALAND",
    category: "Anti Aging",
    badge: "COLLAGEN BOOST",
    discountPercent: 15,
    subtitle: "Anti Aging - Collagen-boosting nourishing night cream",
    reviewsCount: 254,
    price: 6900,
    originalPrice: 8200,
    image: "/images/products/avocado_cream.png",
    benefits: [
      "Boosts skin collagen production naturally.",
      "Deeply nourishes with organic avocado oil.",
      "Reduces fine lines and visible signs of aging.",
      "Enriched with aromatic sandalwood and patchouli."
    ],
    targetCustomers: "Dry, mature, and aging skin types.",
    climateBenefit: "Infused with nutrient-rich New Zealand avocado pear oil and bioactive extract, this night cream naturally stimulates collagen production. It restores skin elasticity overnight without clogging pores in humid weather."
  },
  {
    id: 10,
    name: "Manuka Honey Protective SPF 30 Sunscreen",
    brand: "WILD FERNS",
    origin: "NEW ZEALAND",
    category: "Sun Protection",
    badge: "PROTECTIVE",
    discountPercent: 15,
    subtitle: "Sun Protection - Daily sun protective lotion with Manuka Honey",
    reviewsCount: 198,
    price: 5500,
    originalPrice: 6500,
    image: "/images/products/manuka_sunscreen.png",
    benefits: [
      "Protects against harmful UVA and UVB rays.",
      "Active manuka honey naturally hydrates and heals.",
      "Absorbs quickly with no greasy residue or white cast.",
      "Sweat-resistant and perfect for daily wear in hot climates."
    ],
    targetCustomers: "All skin types needing daily UV protection.",
    climateBenefit: "Formulated with New Zealand active manuka honey, this daily sunscreen offers broad-spectrum SPF 30 protection while soothing and repairing sun-stressed skin. Lightweight and non-greasy."
  }
];

export default function ProductGrid({
  searchQuery,
  products: externalProducts,
  isLoading: externalLoading,
  originFilter = null,
  sectionId = "all-products",
  title = "All Products",
  subtitle = null,
  icon = null,
  emptyMessage = null,
}) {
  const { addToCart } = useCart();
  const { user, openAuth } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [internalProducts, setInternalProducts] = useState(PRODUCTS_DATA);
  const [internalLoading, setInternalLoading] = useState(true);
  const [filterCategories, setFilterCategories] = useState(
    () => ["All", ...FALLBACK_CATEGORIES.map((c) => c.name)]
  );

  const products = externalProducts ?? internalProducts;
  const isLoading = externalLoading ?? internalLoading;
  const sortSelectId = `sort-${sectionId}`;

  // Fetch products when not supplied by a parent (standalone usage).
  useEffect(() => {
    if (externalProducts) return undefined;

    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          setInternalProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products from API, using fallback:", err);
      } finally {
        if (active) setInternalLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [externalProducts]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          setFilterCategories(["All", ...data.map((c) => c.name)]);
        }
      } catch (err) {
        console.error("Failed to load categories from API, using fallback:", err);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = filterCategories;

  // Filtering and Sorting logic combined
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (originFilter) {
      result = result.filter((product) => matchesOriginFilter(product, originFilter));
    }

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    const query = (searchQuery || "").trim().toLowerCase();
    if (query !== "") {
      result = result.filter(
        (product) =>
          (product.name?.toLowerCase() || "").includes(query) ||
          (product.brand?.toLowerCase() || "").includes(query) ||
          (product.category?.toLowerCase() || "").includes(query) ||
          (product.subtitle?.toLowerCase() || "").includes(query)
      );
    }

    // Sort products
    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Top Rated":
        result.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case "Featured":
      default:
        // Keep default order (by ID)
        result.sort((a, b) => a.id - b.id);
        break;
    }

    return result;
  }, [products, originFilter, selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product) => {
    if (!user) {
      openAuth("signin");
      return;
    }
    addToCart(product);
  };

  if (isLoading) {
    return (
      <section id={sectionId} className="max-w-7xl mx-auto px-4 md:px-6 py-12 scroll-mt-20">
        <div className="py-20 text-center text-brand-espresso/40 text-sm">Loading products…</div>
      </section>
    );
  }

  return (
    <section id={sectionId} className="max-w-7xl mx-auto px-4 md:px-6 py-12 scroll-mt-20">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {icon ? <span className="text-2xl">{icon}</span> : null}
            <h2 className="font-serif text-3xl font-bold text-brand-espresso">
              {title}
            </h2>
          </div>
          {subtitle ? (
            <p className="text-sm text-brand-espresso/70 mb-1">{subtitle}</p>
          ) : null}
          <p className="text-xs text-brand-espresso/60 font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            {" · tap "}
            <span className="inline-flex items-center justify-center p-0.5 bg-brand-espresso/5 rounded border border-brand-border text-[10px] font-bold">i</span>
            {" on any card for benefits"}
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <label htmlFor={sortSelectId} className="text-xs font-semibold text-brand-espresso/70 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sort by:
          </label>
          <select
            id={sortSelectId}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-brand-cream border border-brand-border text-xs font-bold text-brand-espresso rounded-full py-1.5 px-4 focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose cursor-pointer transition-colors"
          >
            <option>Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Top Rated</option>
          </select>
        </div>
      </div>

      {/* Category Selection Tabs (Horizontal scrolling on mobile) */}
      <div className="w-full overflow-x-auto no-scrollbar mb-8 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-center gap-2 pb-1.5 md:pb-0 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-xs font-semibold py-2 px-5 rounded-full border transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-brand-espresso text-brand-cream border-brand-espresso shadow-sm"
                  : "bg-brand-card text-brand-espresso/75 border-brand-border/60 hover:border-brand-rose/25 hover:text-brand-rose"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Card Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenModal={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="w-full text-center py-20 bg-brand-card rounded-2xl border border-brand-border/40 p-8">
          <p className="text-base font-semibold text-brand-espresso/60 mb-2">
            {searchQuery?.trim()
              ? `No products found matching "${searchQuery.trim()}"`
              : emptyMessage || "No products in this collection yet."}
          </p>
          {searchQuery?.trim() ? (
            <p className="text-xs text-brand-espresso/40">
              Try adjusting your search terms or choosing another category.
            </p>
          ) : null}
        </div>
      )}

      {/* Benefits Details Modal popup */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  );
}
