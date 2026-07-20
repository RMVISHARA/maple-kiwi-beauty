"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import HeroReviewCarousel from "@/components/HeroReviewCarousel";

const HERO_BACKGROUNDS = [
  "/images/hero_bg.png",
  "/images/hero_bg_natural_pure_you_2.png",
];

const BACKGROUND_ROTATE_MS = 5000;

export default function Hero() {
  const [activeBackground, setActiveBackground] = useState(0);

  useEffect(() => {
    if (HERO_BACKGROUNDS.length <= 1) return;

    const timer = setInterval(() => {
      setActiveBackground((current) => (current + 1) % HERO_BACKGROUNDS.length);
    }, BACKGROUND_ROTATE_MS);

    return () => clearInterval(timer);
  }, []);

  const handleScrollToProducts = (e) => {
    e.preventDefault();
    const productsSection = document.getElementById("all-products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // WhatsApp prefilled message link (replace with actual phone number if needed)
  const whatsappNumber = "+94771234567"; // Placeholder for Sri Lanka
  const whatsappMessage = encodeURIComponent(
    "Hello Maple & Kiwi Beauty! I'm interested in learning more about your premium skincare essentials from Canada & New Zealand."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <section className="group relative w-full h-[600px] md:h-[650px] flex items-center justify-start overflow-hidden bg-[#2B2421] dark:bg-[#1C1613]">
      {/* Auto-rotating background images with dark tint overlay */}
      <div className="absolute inset-0 overflow-hidden">
        {HERO_BACKGROUNDS.map((background, index) => (
          <div
            key={background}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeBackground ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={index !== activeBackground}
          >
            {/* Same slow hover zoom as the original single-photo hero */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 group-hover:scale-105"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(43, 36, 33, 0.9) 20%, rgba(43, 36, 33, 0.75) 50%, rgba(43, 36, 33, 0.4) 100%), url('${background}')`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Floating dust/particles or glow effect for rich aesthetics */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-rose/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto w-full px-4 md:px-6 z-10 text-[#FAF7F2] animate-slide-up">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10 lg:gap-10 xl:gap-12">
        <div className="max-w-2xl lg:max-w-xl xl:max-w-2xl text-left shrink-0">
          {/* Subtitle Accent Line */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-brand-rose">
              Premium Beauty Essentials
            </span>
            <div className="w-12 h-[1px] bg-brand-rose" />
            <span className="text-[10px] md:text-xs font-semibold text-[#FAF7F2]/75">
              Canada · New Zealand
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif font-medium text-5xl md:text-7xl mb-6 tracking-tight leading-none text-white">
            Natural. Pure. <span className="text-brand-rose italic font-light">You.</span>
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base text-[#FAF7F2]/80 leading-relaxed mb-8 max-w-xl">
            Maple & Kiwi Beauty brings high quality skincare, beauty, and wellness products from Canada and New Zealand directly to Sri Lanka. Our mission is to provide authentic, trusted, and effective beauty solutions that help you look and feel your best.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
            <a
              href="#all-products"
              onClick={handleScrollToProducts}
              className="bg-brand-rose hover:bg-brand-rose-hover text-[#FAF7F2] font-semibold text-sm py-3.5 px-6 rounded-full inline-flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-brand-rose/25 active:scale-95 group"
            >
              Shop 5 Essentials
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-whatsapp hover:bg-brand-whatsapp-hover text-white font-semibold text-sm py-3.5 px-6 rounded-full inline-flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-brand-whatsapp/25 active:scale-95"
            >
              {/* Custom SVG WhatsApp Icon for premium brand identity */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.437.002 9.861-4.416 9.863-9.864.001-2.639-1.02-5.12-2.875-6.979C16.398 1.895 13.91 .874 11.272.874c-5.442 0-9.866 4.42-9.869 9.869-.001 1.836.505 3.631 1.47 5.228l-.968 3.535 3.628-.952zm11.387-5.464c-.3-.149-1.774-.874-2.047-.973-.272-.1-.471-.149-.669.149-.198.3-.769.973-.942 1.172-.173.198-.347.223-.647.074-.3-.149-1.265-.467-2.41-1.487-.89-.793-1.49-1.773-1.664-2.07-.173-.3-.018-.462.13-.61.135-.133.3-.347.45-.52.15-.173.2-.3.3-.5.1-.198.05-.372-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.774-.726 2.022-1.429.247-.703.247-1.306.173-1.43-.075-.124-.272-.198-.57-.347z"/>
              </svg>
              Chat with Us
            </a>
          </div>

          {/* Quick Trust Items */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-[#FAF7F2]/70 font-semibold border-t border-[#FAF7F2]/10 pt-6">
            <span className="inline-flex items-center gap-1.5">
              🍁 Canada Authentic
            </span>
            <span className="inline-flex items-center gap-1.5">
              🥝 NZ Certified
            </span>
            <span className="inline-flex items-center gap-1.5">
              📦 Islandwide Delivery
            </span>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 items-center justify-end min-w-0 pl-4">
          <HeroReviewCarousel />
        </div>
        </div>
      </div>
    </section>
  );
}
