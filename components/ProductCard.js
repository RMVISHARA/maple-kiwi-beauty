"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Info, ShoppingBag } from "lucide-react";
import { getOriginEmoji } from "@/lib/origins";
import { formatMeasurementLabel } from "@/lib/measurement";
import { hasVariants, getPriceFrom, buildVariantOptions } from "@/lib/variants";

import ProductBadge from "./ProductBadge";

export function getProductSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function ProductCard({ product, onOpenModal, onAddToCart }) {
  const multiVariant = hasVariants(product);
  const optionCount = multiVariant ? buildVariantOptions(product).length : 1;
  // With variants, "out of stock" only when every option is out of stock.
  const outOfStock = multiVariant
    ? buildVariantOptions(product).every((o) => !o.inStock)
    : product.inStock === false;
  const showStockCount = !multiVariant && product.showStock && product.stockQuantity != null && !outOfStock;
  const lowStock = showStockCount && product.stockQuantity <= 10;
  const measurementLabel = formatMeasurementLabel(product);
  const priceFrom = multiVariant ? getPriceFrom(product) : product.price;

  return (
    <div className="bg-brand-card rounded-2xl overflow-hidden border border-brand-border/60 hover:border-brand-rose/25 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group relative">
      {/* Top Badges and Action Icons */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1.5 items-start">
          {outOfStock && (
            <span className="text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full shadow-sm bg-brand-espresso text-brand-cream">
              Out of Stock
            </span>
          )}
          {product.badge && !outOfStock && (
            <ProductBadge text={product.badge} color={product.badgeColor} />
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
            className="p-1.5 bg-brand-card/90 backdrop-blur hover:bg-brand-rose hover:text-brand-cream text-brand-espresso rounded-full shadow-md transition-all active:scale-90"
            title="View benefits & info"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Image section */}
      <Link 
        href={`/products/${product.id}-${getProductSlug(product.name)}`}
        className="w-full aspect-square bg-brand-cream/40 relative overflow-hidden flex items-center justify-center p-6 border-b border-brand-border/30 cursor-pointer block"
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
      </Link>

      {/* Product Info Section */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Brand & Origin Badge */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-espresso/60">
              {product.brand}
            </span>
            <div className="bg-brand-rose/5 border border-brand-rose/10 text-brand-rose rounded-full px-2 py-0.5 flex items-center gap-1 text-[9px] font-bold">
              <span>{getOriginEmoji(product.origin)}</span> {product.origin}
            </div>
          </div>

          {/* Title */}
          <h4 className="leading-snug mb-1 line-clamp-1">
            <Link 
              href={`/products/${product.id}-${getProductSlug(product.name)}`}
              className="font-serif font-bold text-sm md:text-base text-brand-espresso hover:text-brand-rose transition-colors"
            >
              {product.name}
            </Link>
          </h4>

          {/* Subtitle / Focus description */}
          <p className="text-[11px] text-brand-espresso/50 leading-relaxed mb-2 line-clamp-2 min-h-[32px]">
            {product.subtitle}
          </p>

          {/* Size / measurement */}
          {multiVariant ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mb-2 rounded-full bg-brand-rose/10 border border-brand-rose/20 text-brand-rose">
              {optionCount} sizes available
            </span>
          ) : (
            measurementLabel && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mb-2 rounded-full bg-brand-espresso/5 border border-brand-border/60 text-brand-espresso/70">
                {measurementLabel}
              </span>
            )
          )}

          {/* Remaining stock (only if admin enabled showing it) */}
          {showStockCount && (
            <p className={`text-[10px] font-bold mb-2 ${lowStock ? "text-brand-rose" : "text-brand-espresso/55"}`}>
              {lowStock ? `Only ${product.stockQuantity} left in stock` : `${product.stockQuantity} in stock`}
            </p>
          )}
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
              {multiVariant && (
                <span className="block text-[9px] font-bold uppercase tracking-wide text-brand-espresso/45 leading-none mb-0.5">
                  From
                </span>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm md:text-base font-bold text-brand-rose">
                  LKR {priceFrom.toLocaleString()}
                </span>
                {!multiVariant && product.originalPrice && (
                  <span className="text-[10px] text-brand-espresso/45 line-through">
                    {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                if (outOfStock) return;
                // With multiple options the customer must pick a size first.
                if (multiVariant) onOpenModal(product);
                else onAddToCart(product);
              }}
              disabled={outOfStock}
              className={`p-2 rounded-full transition-all duration-300 shadow flex items-center justify-center shrink-0 ${
                outOfStock
                  ? "bg-brand-espresso/20 text-brand-cream/70 cursor-not-allowed"
                  : "bg-brand-espresso hover:bg-brand-rose text-brand-cream hover:shadow-md active:scale-95"
              }`}
              title={outOfStock ? "Out of stock" : multiVariant ? "Choose a size" : "Add to cart"}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
