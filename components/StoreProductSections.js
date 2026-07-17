"use client";

import React, { useState, useEffect } from "react";
import ProductGrid, { PRODUCTS_DATA } from "@/components/ProductGrid";
import { ORIGINS } from "@/lib/origins";

export default function StoreProductSections({ searchQuery }) {
  const [products, setProducts] = useState(PRODUCTS_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load products from API, using fallback:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div id="all-products" className="scroll-mt-20">
      <ProductGrid
        products={products}
        isLoading={isLoading}
        searchQuery={searchQuery}
        originFilter={ORIGINS.CANADA}
        sectionId="canada-collection"
        title="Canada Collection"
        subtitle="Clinical skincare essentials from leading Canadian brands."
        icon="🍁"
      />
      <ProductGrid
        products={products}
        isLoading={isLoading}
        searchQuery={searchQuery}
        originFilter={ORIGINS.NEW_ZEALAND}
        sectionId="new-zealand-collection"
        title="New Zealand Collection"
        subtitle="Pure botanical care with native ingredients from New Zealand."
        icon="🥝"
        emptyMessage="No New Zealand products yet. Check back soon for certified organic botanical skincare."
      />
    </div>
  );
}
