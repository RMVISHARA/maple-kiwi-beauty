"use client";

import React, { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { useCart } from "@/context/CartContext";
import { SlidersHorizontal } from "lucide-react";

// In-app static products database matching the user's requirements
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
    targetCustomers: "Everyone using skincare products.",
    climateBenefit: "Broad-spectrum SPF 50 protection infused with prebiotic oat to soothe skin. Sweat and water-resistant, making it perfect for Sri Lanka's warm outdoors and tropical beaches."
  }
];

export default function ProductGrid({ searchQuery }) {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [
    "All",
    "Anti Aging",
    "Brightening",
    "Acne & Oil Control",
    "Hydration",
    "Sun Protection"
  ];

  // Filtering and Sorting logic combined
  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS_DATA];

    // Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.subtitle.toLowerCase().includes(query)
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
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <section id="all-products" className="max-w-7xl mx-auto px-4 md:px-6 py-12 scroll-mt-20">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-3xl font-bold mb-1.5 text-brand-espresso">
            All Products
          </h2>
          <p className="text-xs text-brand-espresso/60 font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} · tap{" "}
            <span className="inline-flex items-center justify-center p-0.5 bg-brand-espresso/5 rounded border border-brand-border text-[10px] font-bold">i</span>{" "}
            on any card for benefits
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <label htmlFor="sort" className="text-xs font-semibold text-brand-espresso/70 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Sort by:
          </label>
          <select
            id="sort"
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
              onAddToCart={addToCart}
            />
          ))}
        </div>
      ) : (
        <div className="w-full text-center py-20 bg-brand-card rounded-2xl border border-brand-border/40 p-8">
          <p className="text-base font-semibold text-brand-espresso/60 mb-2">
            No products found matching "{searchQuery}"
          </p>
          <p className="text-xs text-brand-espresso/40">
            Try adjusting your search terms or choosing another category.
          </p>
        </div>
      )}

      {/* Benefits Details Modal popup */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </section>
  );
}
