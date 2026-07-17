"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Collections from "@/components/Collections";
import StoreProductSections from "@/components/StoreProductSections";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [prevSearchQuery, setPrevSearchQuery] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  useEffect(() => {
    const currentTrimmed = searchQuery.trim();
    const prevTrimmed = prevSearchQuery.trim();
    
    // Only trigger scroll when search transitions from empty to typing
    if (currentTrimmed !== "" && prevTrimmed === "") {
      const element = document.getElementById("all-products");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setPrevSearchQuery(searchQuery);
  }, [searchQuery, prevSearchQuery]);

  return (
    <div id="home" className="min-h-screen flex flex-col justify-between bg-brand-cream text-brand-espresso selection:bg-brand-rose/20 selection:text-brand-rose">
      {/* Dynamic Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Collection Promos */}
        <Collections />

        {/* Brand Story (About Us) Section */}
        <section id="about-us" className="max-w-7xl mx-auto px-4 md:px-6 py-16 scroll-mt-20">
          <div className="bg-brand-card rounded-3xl border border-brand-border/50 p-8 md:p-12 shadow-sm relative overflow-hidden">
            {/* Background absolute subtle accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-rose/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
              {/* Left Side: Brand Text Story */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-2">
                  <span className="bg-brand-rose/10 text-brand-rose text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                    Our Heritage & Mission
                  </span>
                </div>
                
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-espresso leading-tight">
                  Pristine Sourcing, <br />
                  <span className="text-brand-rose italic font-light">Honest Skincare.</span>
                </h2>
                
                <p className="text-sm md:text-base text-brand-espresso/80 leading-relaxed font-serif italic border-l-2 border-brand-rose/40 pl-4">
                  "Maple & Kiwi Beauty brings high quality skincare, beauty, and wellness products from Canada and New Zealand directly to Sri Lanka. Our mission is to provide authentic, trusted, and effective beauty solutions that help you look and feel your best."
                </p>

                <p className="text-xs md:text-sm text-brand-espresso/70 leading-relaxed">
                  We believe that what you put on your skin should be as pure and restorative as the pristine environments they come from. By handpicking leading clinical formulas from Canada, like advanced molecular serums, alongside New Zealand's certified organic botanical skincare, we bridge the gap between scientific efficacy and natural purity.
                </p>
                
                <p className="text-xs md:text-sm text-brand-espresso/70 leading-relaxed">
                  Every formulation in our catalog is carefully vetted to guarantee 100% authenticity and suitability for skin exposed to the humid, tropical environment of Sri Lanka. We source only directly from verified creators, ensuring clean, fresh, and highly effective cosmetics for your daily self-care ritual.
                </p>
              </div>

              {/* Right Side: Trust Info Cards */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-brand-cream/40 p-5 rounded-2xl border border-brand-border/30 space-y-2">
                  <span className="text-2xl">🍁</span>
                  <h4 className="font-serif font-bold text-sm text-brand-espresso">Canada Imports</h4>
                  <p className="text-[11px] text-brand-espresso/60 leading-relaxed">
                    Clinically backed serums, stable vitamin formulations, and dermatologist-tested hydrators sourced from leading lab brands.
                  </p>
                </div>

                <div className="bg-brand-cream/40 p-5 rounded-2xl border border-brand-border/30 space-y-2">
                  <span className="text-2xl">🥝</span>
                  <h4 className="font-serif font-bold text-sm text-brand-espresso">NZ Botanicals</h4>
                  <p className="text-[11px] text-brand-espresso/60 leading-relaxed">
                    Organic, plant-based remedies, bio-active elements, and natural sun protective care imported from pristine ecosystems.
                  </p>
                </div>

                <div className="bg-brand-cream/40 p-5 rounded-2xl border border-brand-border/30 space-y-2 sm:col-span-2">
                  <h4 className="font-serif font-bold text-sm text-brand-espresso flex items-center gap-1.5">
                    <span>✨</span> Our Purity Guarantee
                  </h4>
                  <p className="text-[11px] text-brand-espresso/60 leading-relaxed">
                    We guarantee zero counterfeits, strict quality temperature-controlled shipping, and clean, cruelty-free cosmetic items that are certified for safety.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Origin & Trust Showcase Section */}
        <section className="bg-[#2B2421] dark:bg-[#1C1613] text-[#FAF7F2] py-20 px-4 md:px-6 relative overflow-hidden">
          {/* Subtle decorative background overlays */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-rose/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto text-center relative z-10">
            <span className="bg-brand-rose/20 text-brand-rose text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full border border-brand-rose/30">
              Direct Sourcing & Trust
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
              100% Authentic Canadian & New Zealand Cosmetics
            </h2>
            <p className="text-sm md:text-base text-[#FAF7F2]/80 max-w-2xl mx-auto mb-16 leading-relaxed">
              We import our entire catalog directly from verified brand laboratories and official suppliers in Canada and New Zealand. No middle distributors, no compromises on quality.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
              {/* Canada Card */}
              <div className="bg-[#FAF7F2]/5 rounded-3xl p-8 lg:p-10 border border-[#FAF7F2]/10 relative hover:border-brand-rose/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl filter drop-shadow">🍁</span>
                  <div>
                    <h3 className="font-serif text-xl lg:text-2xl font-bold text-[#FAF7F2] group-hover:text-brand-rose transition-colors">
                      Canada Direct Imports
                    </h3>
                    <span className="text-[10px] tracking-wider uppercase text-brand-rose font-bold">
                      Clinical Purity & Science
                    </span>
                  </div>
                </div>
                <p className="text-xs lg:text-sm text-[#FAF7F2]/70 leading-relaxed">
                  Our Canadian catalog features dermatologist-approved formulations, concentrated clinical active serums, and barrier-protecting moisturizers. Sourced directly from official suppliers in Toronto and Vancouver, we guarantee fresh batches with full ingredient transparency.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-brand-rose group-hover:underline cursor-pointer">
                  Shop Canada Collection <span>→</span>
                </div>
              </div>

              {/* New Zealand Card */}
              <div className="bg-[#FAF7F2]/5 rounded-3xl p-8 lg:p-10 border border-[#FAF7F2]/10 relative hover:border-brand-rose/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl filter drop-shadow">🥝</span>
                  <div>
                    <h3 className="font-serif text-xl lg:text-2xl font-bold text-[#FAF7F2] group-hover:text-brand-rose transition-colors">
                      New Zealand Organic Care
                    </h3>
                    <span className="text-[10px] tracking-wider uppercase text-brand-rose font-bold">
                      Pristine Botanical Power
                    </span>
                  </div>
                </div>
                <p className="text-xs lg:text-sm text-[#FAF7F2]/70 leading-relaxed">
                  Imported from the clean, remote ecosystems of New Zealand, these formulations leverage bioactive native plants, premium manuka honey extracts, and certified organic botanicals. Perfect for soothing and repairing skin stressed by heat and sun.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-brand-rose group-hover:underline cursor-pointer">
                  NZ Collection Coming Soon <span>→</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid and Filters */}
        <StoreProductSections searchQuery={searchQuery} />
      </main>

      {/* Shopping Cart Slider Drawer */}
      <CartDrawer />

      {/* Premium Footer */}
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream flex items-center justify-center text-brand-espresso text-sm">Loading Storefront...</div>}>
      <HomeContent />
    </Suspense>
  );
}
