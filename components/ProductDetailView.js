"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Star, ShoppingBag, Globe, SunMoon, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductReviews from "@/components/ProductReviews";
import ProductBadge from "@/components/ProductBadge";
import { useCart } from "@/context/CartContext";
import { buildVariantOptions, getDefaultOption } from "@/lib/variants";

export default function ProductDetailView({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewStats, setReviewStats] = useState({ count: product.reviewsCount, average: "5.0" });

  const options = buildVariantOptions(product);
  const hasChoices = options.length > 1;
  const [selectedKey, setSelectedKey] = useState(() => getDefaultOption(product)?.key || "base");
  const selected = options.find((o) => o.key === selectedKey) || options[0];

  const variantImage = selected?.image;
  const baseImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const productImages = variantImage && !baseImages.includes(variantImage)
    ? [variantImage, ...baseImages]
    : baseImages;

  useEffect(() => {
    if (selected?.image) {
      const idx = productImages.indexOf(selected.image);
      if (idx !== -1) {
        setActiveImageIndex(idx);
      }
    }
  }, [selected?.image]);

  const measurement = selected?.measurement || "";
  const packageLabel = selected?.packageLabel || null;
  const measurementLabel = selected?.label || "";

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
          setReviewStats({ count: data.length, average: avg.toFixed(1) });
        }
      })
      .catch(() => {});
  }, [product.id]);

  const currentPrice = selected?.price ?? product.price;
  const currentOriginalPrice = selected?.originalPrice || null;
  const currentImage = selected?.image || product.image;
  const currentDiscount = selected?.discountPercent ?? (selected?.isBase ? product.discountPercent : null);
  const optionOutOfStock = selected ? !selected.inStock : product.inStock === false;
  const optionStock = selected?.stockQuantity;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-cream text-brand-espresso">
      {/* Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main product presentation */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Back Link */}
        <button
          onClick={() => router.push("/#all-products")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-espresso/60 hover:text-brand-rose transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all products
        </button>

        {/* Breadcrumbs */}
        <nav className="text-[11px] font-bold uppercase tracking-wider text-brand-espresso/45 mb-8 flex items-center gap-2">
          <a href="/" className="hover:text-brand-rose transition-colors">Home</a>
          <span>/</span>
          <a href="/#all-products" className="hover:text-brand-rose transition-colors">Products</a>
          <span>/</span>
          <span className="text-brand-rose">{product.category}</span>
        </nav>

        {/* Product Split Section */}
        <div className="bg-brand-card border border-brand-border/60 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row mb-12">
          {/* Left Column: Image & Origin Tag */}
          <div className="w-full md:w-1/2 bg-brand-cream/10 p-8 md:p-12 flex flex-col items-center justify-center relative min-h-[420px] md:min-h-full border-b md:border-b-0 md:border-r border-brand-border/50">
            {currentDiscount && (
              <span className="absolute top-6 left-6 bg-brand-rose text-[#FAF7F2] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm animate-pulse z-10">
                -{currentDiscount}% Off
              </span>
            )}

            {/* Slider Wrapper */}
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                {productImages.length > 1 && (
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-brand-cream/80 hover:bg-brand-cream border border-brand-border rounded-full shadow-md z-10 text-brand-espresso hover:text-brand-rose active:scale-95 transition-all cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <div className="relative w-full h-full">
                  <Image
                    src={productImages[activeImageIndex] || product.image}
                    alt={`${product.name} - View ${activeImageIndex + 1}`}
                    fill
                    className="object-contain transition-all duration-300"
                    sizes="(max-width: 768px) 288px, 384px"
                    priority
                  />
                </div>

                {productImages.length > 1 && (
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-brand-cream/80 hover:bg-brand-cream border border-brand-border rounded-full shadow-md z-10 text-brand-espresso hover:text-brand-rose active:scale-95 transition-all cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Thumbnail indicators */}
              {productImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 flex-wrap z-10">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-12 h-12 rounded-lg border-2 overflow-hidden transition-all bg-white relative shrink-0 cursor-pointer ${
                        activeImageIndex === index ? "border-brand-rose scale-105" : "border-brand-border/40 hover:border-brand-espresso/20"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`View ${index + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="absolute bottom-6 left-6 bg-brand-cream border border-brand-border rounded-full py-2 px-4 flex items-center gap-1.5 shadow-sm text-xs font-semibold z-10">
              <span>{product.origin === "NZ" || product.origin === "NEW ZEALAND" ? "🥝" : "🍁"}</span>
              <span className="tracking-wide uppercase text-[10px] text-brand-espresso/80">
                Imported from {product.origin === "NZ" || product.origin === "NEW ZEALAND" ? "New Zealand" : "Canada"}
              </span>
            </div>
          </div>

          {/* Right Column: Information, Specs, Checkout */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between">
            <div>
              {/* Category / Brand */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-brand-rose">
                  {product.brand}
                </span>
                {product.badge && (
                  <ProductBadge text={product.badge} color={product.badgeColor} />
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-3 text-brand-espresso">
                {product.name}
              </h1>

              {/* Subtitle / Focus */}
              <p className="text-xs md:text-sm text-brand-espresso/60 font-semibold uppercase tracking-wider mb-6 pb-5 border-b border-brand-border/60">
                Primary Focus: {product.subtitle.split(" - ")[0]}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(Number(reviewStats.average)) ? "fill-current" : "fill-none opacity-30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-brand-espresso">{reviewStats.average}</span>
                <span className="text-xs text-brand-espresso/50">
                  ({reviewStats.count} verified review{reviewStats.count !== 1 ? "s" : ""})
                </span>
              </div>

              {/* Variant selector (shown when the product has multiple options) */}
              {hasChoices && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-3.5 flex items-center gap-1.5">
                    📏 Choose Size / Option
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {options.map((opt) => {
                      const isActive = opt.key === selectedKey;
                      const soldOut = !opt.inStock;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={soldOut}
                          onClick={() => setSelectedKey(opt.key)}
                          className={`text-left px-4 py-3 rounded-xl border transition-all duration-300 min-w-[120px] active:scale-95 ${
                            soldOut
                              ? "border-brand-border/50 bg-brand-card text-brand-espresso/30 cursor-not-allowed line-through"
                              : isActive
                              ? "bg-brand-espresso text-brand-cream border-brand-espresso shadow-md cursor-pointer"
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
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-3.5 flex items-center gap-1.5">
                    📏 Size &amp; Packaging
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {measurement && (
                      <div className="text-center px-5 py-3 rounded-xl border border-brand-espresso bg-brand-espresso text-brand-cream shadow-md">
                        <span className="block text-base font-bold leading-none">{measurement}</span>
                        <span className="block text-[9px] font-normal opacity-75 mt-1 leading-none uppercase tracking-wider">
                          Net content
                        </span>
                      </div>
                    )}
                    {packageLabel && (
                      <div className="text-center px-5 py-3 rounded-xl border border-brand-border/60 bg-brand-card text-brand-espresso/80">
                        <span className="block text-base font-bold leading-none">{packageLabel}</span>
                        <span className="block text-[9px] font-normal opacity-75 mt-1 leading-none uppercase tracking-wider">
                          Packaging
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description Spec Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pt-6 border-t border-brand-border/60">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-2.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-brand-rose" /> Skin Suitability
                  </h4>
                  <p className="text-xs md:text-sm text-brand-espresso/75 leading-relaxed">
                    {product.targetCustomers}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose mb-2.5 flex items-center gap-1.5">
                    <SunMoon className="w-3.5 h-3.5 text-brand-rose" /> Climate Formulation
                  </h4>
                  <p className="text-xs md:text-sm text-brand-espresso/75 leading-relaxed">
                    {product.climateBenefit || "Specifically selected for Sri Lanka's tropical climate. Formulated to resist sweating and pore blocking."}
                  </p>
                </div>
              </div>

            </div>

            {/* Price & Add to Cart Block */}
            <div className="pt-6 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="self-start sm:self-center">
                <span className="block text-[10px] uppercase font-bold text-brand-espresso/45 leading-none mb-1">
                  Total Price{measurement ? ` (${measurement})` : ""}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl md:text-3xl font-bold text-brand-rose">
                    LKR {currentPrice.toLocaleString()}
                  </span>
                  {currentOriginalPrice && (
                    <span className="text-sm text-brand-espresso/40 line-through">
                      LKR {currentOriginalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.showStock && optionStock != null && !optionOutOfStock && (
                  <span className={`block text-[11px] font-bold mt-1.5 ${optionStock <= 10 ? "text-brand-rose" : "text-brand-espresso/55"}`}>
                    {optionStock <= 10
                      ? `Only ${optionStock} left in stock`
                      : `${optionStock} in stock`}
                  </span>
                )}
              </div>

              <button
                disabled={optionOutOfStock}
                onClick={() => {
                  if (optionOutOfStock) return;
                  addToCart({
                    ...product,
                    selectedSize: measurementLabel,
                    selectedOptionKey: selected?.key,
                    selectedVariantId: selected?.variantId ?? null,
                    price: currentPrice,
                    originalPrice: currentOriginalPrice,
                    image: currentImage,
                  });
                }}
                className={`w-full sm:w-auto sm:flex-grow font-bold text-sm py-4 px-8 rounded-full flex items-center justify-center gap-2.5 transition-all shadow active:scale-98 ${
                  optionOutOfStock
                    ? "bg-brand-espresso/20 text-brand-cream/70 cursor-not-allowed"
                    : "bg-brand-rose hover:bg-brand-rose-hover text-[#FAF7F2] hover:shadow-lg cursor-pointer"
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> {optionOutOfStock ? "Sold Out" : "Add to Shopping Bag"}
              </button>
            </div>

          </div>
        </div>

        {/* Benefits Checklist section */}
        <div className="bg-brand-card border border-brand-border/60 rounded-3xl p-8 md:p-12 mb-12">
          <h3 className="font-serif text-2xl font-bold mb-6 text-brand-espresso">
            Key Product Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 text-xs md:text-sm text-brand-espresso/80">
                <span className="p-1 bg-brand-rose/10 text-brand-rose rounded-full shrink-0">
                  <Check className="w-4 h-4" />
                </span>
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Reviews */}
        <ProductReviews productId={product.id} productName={product.name} />
      </main>

      {/* Cart Slider */}
      <CartDrawer />

      {/* Footer */}
      <Footer />
    </div>
  );
}
