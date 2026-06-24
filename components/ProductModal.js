"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, Check, Star, ShoppingBag, Globe, SunMoon } from "lucide-react";

export default function ProductModal({ product, onClose, onAddToCart }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-brand-cream text-brand-espresso max-w-3xl w-full rounded-2xl overflow-hidden border border-brand-border shadow-2xl relative flex flex-col md:flex-row animate-slide-up max-h-[90vh] md:max-h-[85vh]">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-2 bg-brand-cream/90 hover:bg-brand-rose hover:text-brand-cream text-brand-espresso rounded-full transition-colors shadow-sm"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image & Origin badge */}
        <div className="w-full md:w-1/2 bg-brand-card relative p-8 flex items-center justify-center min-h-[300px] md:min-h-full border-b md:border-b-0 md:border-r border-brand-border">
          {/* Sale/Discount Badge */}
          {product.discountPercent && (
            <span className="absolute top-4 left-4 bg-brand-rose text-brand-cream text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              -{product.discountPercent}% Off
            </span>
          )}
          
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 256px, 320px"
              priority
            />
          </div>

          {/* Country of Origin Tag */}
          <div className="absolute bottom-4 left-4 bg-brand-cream border border-brand-border rounded-full py-1.5 px-3 flex items-center gap-1.5 shadow-sm text-xs font-semibold">
            <span>🍁</span>
            <span className="tracking-wide uppercase text-[10px] text-brand-espresso/80">
              Imported from Canada
            </span>
          </div>
        </div>

        {/* Right Side: Detailed Product Specs & Benefits */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between max-h-[50vh] md:max-h-full">
          <div>
            {/* Category / Brand */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-rose">
                {product.brand}
              </span>
              {product.badge && (
                <span className="bg-brand-espresso text-brand-cream text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-2">
              {product.name}
            </h3>

            {/* Subtitle / Focus */}
            <p className="text-xs text-brand-espresso/60 font-semibold uppercase tracking-wider mb-4">
              Focus: {product.subtitle.split(" - ")[0]}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-5 pb-5 border-b border-brand-border/60">
              <div className="flex text-brand-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-brand-espresso">5.0</span>
              <span className="text-xs text-brand-espresso/50">({product.reviewsCount} reviews)</span>
            </div>

            {/* Benefits Checklist */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-3 flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5" /> Key Skin Benefits
              </h4>
              <ul className="space-y-2.5">
                {product.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-brand-espresso/80">
                    <span className="p-0.5 bg-brand-rose/10 text-brand-rose rounded-full mt-0.5 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Audience */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-2.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-rose" /> Target Customers
              </h4>
              <p className="text-xs md:text-sm text-brand-espresso/70 leading-relaxed pl-6">
                {product.targetCustomers}
              </p>
            </div>

            {/* Climate Suitability */}
            <div className="bg-brand-rose/5 border border-brand-rose/10 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-1.5 flex items-center gap-1.5">
                <SunMoon className="w-4 h-4 shrink-0" /> Climate Compatibility
              </h4>
              <p className="text-xs text-brand-espresso/70 leading-relaxed">
                {product.climateBenefit || "Specifically selected for Sri Lanka's tropical climate. Lightweight formulation that absorbs rapidly without clogging pores under warm, humid conditions."}
              </p>
            </div>
          </div>

          {/* Bottom Pricing & Checkout trigger */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between gap-4 mt-auto">
            <div>
              <span className="block text-[10px] uppercase font-bold text-brand-espresso/45 leading-none">
                Price
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl md:text-2xl font-bold text-brand-rose">
                  LKR {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-brand-espresso/40 line-through">
                    LKR {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="flex-grow bg-brand-rose hover:bg-brand-rose-hover text-brand-cream font-semibold text-sm py-3 px-5 rounded-full flex items-center justify-center gap-2 transition-all shadow hover:shadow-md active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini Sparkles SVG Helper
function SparklesIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </svg>
  );
}
