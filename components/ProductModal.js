"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Check, Star, ShoppingBag, Globe, SunMoon } from "lucide-react";
import ProductBadge from "./ProductBadge";
import { buildVariantOptions, getDefaultOption } from "@/lib/variants";

export default function ProductModal({ product, onClose, onAddToCart }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const options = product ? buildVariantOptions(product) : [];
  const hasChoices = options.length > 1;
  const [selectedKey, setSelectedKey] = useState(() => (product ? getDefaultOption(product)?.key || "base" : "base"));

  if (!product) return null;

  const selected = options.find((o) => o.key === selectedKey) || options[0];
  const measurement = selected?.measurement || "";
  const packageLabel = selected?.packageLabel || null;
  const measurementLabel = selected?.label || "";
  const currentPrice = selected?.price ?? product.price;
  const currentOriginalPrice = selected?.originalPrice || null;
  const currentImage = selected?.image || product.image;
  const currentDiscount = selected?.discountPercent ?? (selected?.isBase ? product.discountPercent : null);
  const optionOutOfStock = selected ? !selected.inStock : product.inStock === false;
  const optionStock = selected?.stockQuantity;

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
          {currentDiscount && (
            <span className="absolute top-4 left-4 bg-brand-rose text-brand-cream text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              -{currentDiscount}% Off
            </span>
          )}
          
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <Image
              src={currentImage}
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
                <ProductBadge text={product.badge} color={product.badgeColor} />
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

            {/* Variant selector */}
            {hasChoices && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-3 flex items-center gap-1.5">
                  📏 Choose Size / Option
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {options.map((opt) => {
                    const isActive = opt.key === selectedKey;
                    const soldOut = !opt.inStock;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        disabled={soldOut}
                        onClick={() => setSelectedKey(opt.key)}
                        className={`text-left px-3.5 py-2.5 rounded-xl border transition-all duration-300 min-w-[104px] active:scale-95 ${
                          soldOut
                            ? "border-brand-border/50 bg-brand-card text-brand-espresso/30 cursor-not-allowed line-through"
                            : isActive
                            ? "bg-brand-espresso text-brand-cream border-brand-espresso shadow-sm cursor-pointer"
                            : "bg-brand-card text-brand-espresso/75 border-brand-border/60 hover:border-brand-rose/25 hover:text-brand-rose cursor-pointer"
                        }`}
                      >
                        <span className="block text-sm font-bold leading-tight">{opt.label}</span>
                        <span className={`block text-[11px] mt-1 leading-none ${isActive ? "text-brand-cream/80" : "text-brand-espresso/50"}`}>
                          {soldOut ? "Sold out" : `LKR ${opt.price.toLocaleString()}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size / Measurement (single-option products) */}
            {!hasChoices && (measurement || packageLabel) && (
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-3 flex items-center gap-1.5">
                  📏 Size &amp; Packaging
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {measurement && (
                    <div className="text-center px-4 py-2.5 rounded-xl border border-brand-espresso bg-brand-espresso text-brand-cream shadow-sm">
                      <span className="block text-sm font-bold leading-none">{measurement}</span>
                      <span className="block text-[9px] font-normal opacity-75 mt-1 leading-none uppercase tracking-wider">
                        Net content
                      </span>
                    </div>
                  )}
                  {packageLabel && (
                    <div className="text-center px-4 py-2.5 rounded-xl border border-brand-border/60 bg-brand-card text-brand-espresso/80">
                      <span className="block text-sm font-bold leading-none">{packageLabel}</span>
                      <span className="block text-[9px] font-normal opacity-75 mt-1 leading-none uppercase tracking-wider">
                        Packaging
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Pricing & Checkout trigger */}
          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between gap-4 mt-auto">
            <div>
              <span className="block text-[10px] uppercase font-bold text-brand-espresso/45 leading-none">
                Price{measurement ? ` (${measurement})` : ""}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl md:text-2xl font-bold text-brand-rose">
                  LKR {currentPrice.toLocaleString()}
                </span>
                {currentOriginalPrice && (
                  <span className="text-xs text-brand-espresso/40 line-through">
                    LKR {currentOriginalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.showStock && optionStock != null && !optionOutOfStock && (
                <span className={`block text-[10px] font-bold mt-1 ${optionStock <= 10 ? "text-brand-rose" : "text-brand-espresso/55"}`}>
                  {optionStock <= 10 ? `Only ${optionStock} left` : `${optionStock} in stock`}
                </span>
              )}
            </div>

            <button
              disabled={optionOutOfStock}
              onClick={() => {
                if (optionOutOfStock) return;
                onAddToCart({
                  ...product,
                  selectedSize: measurementLabel,
                  selectedOptionKey: selected?.key,
                  selectedVariantId: selected?.variantId ?? null,
                  price: currentPrice,
                  originalPrice: currentOriginalPrice,
                  image: currentImage,
                });
                onClose();
              }}
              className={`flex-grow font-semibold text-sm py-3.5 px-5 rounded-full flex items-center justify-center gap-2 transition-all shadow active:scale-98 ${
                optionOutOfStock
                  ? "bg-brand-espresso/20 text-brand-cream/70 cursor-not-allowed"
                  : "bg-brand-rose hover:bg-brand-rose-hover text-brand-cream hover:shadow-md"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {optionOutOfStock ? "Sold Out" : "Add to Cart"}
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
