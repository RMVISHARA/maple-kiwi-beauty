"use client";

import React from "react";
import Image from "next/image";
import { Star, Info, ShoppingBag } from "lucide-react";

export default function ProductCard({ product, onOpenModal, onAddToCart }) {
  // Color configuration for specific badges
  const getBadgeStyles = (badge) => {
    switch (badge?.toUpperCase()) {
      case "BESTSELLER":
        return "bg-brand-espresso text-brand-cream";
      case "SALE":
        return "bg-brand-rose text-brand-cream";
      case "TOP RATED":
        return "bg-[#8A9A86] text-white"; // soft sage green
      case "CLIMATE PICK":
        return "bg-[#4B6F44] text-white"; // forest green
      case "ESSENTIAL":
        return "bg-[#8FBC8F] text-brand-espresso"; // light sea green
      default:
        return "bg-brand-espresso text-brand-cream";
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-brand-border/60 hover:border-brand-rose/25 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group relative">
      {/* Top Badges and Action Icons */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className={`text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm ${getBadgeStyles(product.badge)}`}>
              {product.badge}
            </span>
          )}
        </div>
        
        <div className="flex flex-col gap-1.5 items-end pointer-events-auto">
          {product.discountPercent && (
            <span className="bg-brand-rose/90 text-brand-cream text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shadow-sm">
              -{product.discountPercent}%
            </span>
          )}
          
          {/* Info trigger */}
          <button
            onClick={() => onOpenModal(product)}
            className="p-1.5 bg-white/90 backdrop-blur hover:bg-brand-rose hover:text-brand-cream text-brand-espresso rounded-full shadow-md transition-all active:scale-90"
            title="View benefits & info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Image section */}
      <div 
        onClick={() => onOpenModal(product)}
        className="w-full aspect-square bg-[#FAF7F2]/40 relative overflow-hidden flex items-center justify-center p-6 border-b border-brand-border/30 cursor-pointer"
      >
        <div className="relative w-full h-full transition-transform duration-500 group-hover:scale-105">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 250px"
          />
        </div>
      </div>

      {/* Product Info Section */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Brand & Origin Badge */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-espresso/60">
              {product.brand}
            </span>
            <div className="bg-brand-rose/5 border border-brand-rose/10 text-brand-rose rounded-full px-2 py-0.5 flex items-center gap-1 text-[9px] font-bold">
              <span>🍁</span> {product.origin}
            </div>
          </div>

          {/* Title */}
          <h4 
            onClick={() => onOpenModal(product)}
            className="font-serif font-bold text-sm md:text-base text-brand-espresso hover:text-brand-rose cursor-pointer transition-colors leading-snug mb-1 line-clamp-1"
          >
            {product.name}
          </h4>

          {/* Subtitle / Focus description */}
          <p className="text-[11px] text-brand-espresso/50 leading-relaxed mb-3 line-clamp-2 min-h-[32px]">
            {product.subtitle}
          </p>
        </div>

        <div>
          {/* Stars & Reviews count */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-brand-gold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-[10px] font-bold text-brand-espresso/80">
              ({product.reviewsCount.toLocaleString()})
            </span>
          </div>

          {/* Pricing & Add to Cart button */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-brand-border/40">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm md:text-base font-bold text-brand-rose">
                  LKR {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-[10px] text-brand-espresso/45 line-through">
                    {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onAddToCart(product)}
              className="bg-brand-espresso hover:bg-brand-rose text-brand-cream p-2 rounded-full transition-all duration-300 shadow hover:shadow-md active:scale-95 flex items-center justify-center shrink-0"
              title="Add to cart"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
