"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";

export default function Collections() {
  const [showNzComingSoon, setShowNzComingSoon] = useState(false);

  const handleScrollToCanada = (e) => {
    e.preventDefault();
    const productsSection = document.getElementById("all-products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Canada Collection Card */}
        <div 
          onClick={handleScrollToCanada}
          className="relative h-[220px] rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ 
              backgroundImage: `linear-gradient(to right, rgba(43, 36, 33, 0.85) 40%, rgba(43, 36, 33, 0.4) 100%), url('/images/collection_canada.png')` 
            }}
          />
          
          {/* Card Content */}
          <div className="relative h-full flex flex-col justify-between p-6 md:p-8 text-brand-cream z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍁</span>
              <span className="text-xs uppercase tracking-widest font-bold text-brand-rose">
                Canada Collection
              </span>
            </div>
            
            <div className="max-w-md">
              <h3 className="font-serif text-xl md:text-2xl font-semibold mb-2">
                Clinical Skincare Essentials
              </h3>
              <p className="text-xs md:text-sm text-brand-cream/80 leading-relaxed">
                The Ordinary & Aveeno — clinically formulated serums and SPF trusted globally.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-rose group-hover:text-brand-cream transition-colors">
              Shop Active Products
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="absolute inset-0 border border-brand-border/20 rounded-2xl pointer-events-none" />
        </div>

        {/* New Zealand Collection Card */}
        <div 
          onClick={() => setShowNzComingSoon(true)}
          className="relative h-[220px] rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ 
              backgroundImage: `linear-gradient(to right, rgba(43, 36, 33, 0.85) 40%, rgba(43, 36, 33, 0.4) 100%), url('/images/collection_nz.png')` 
            }}
          />
          
          {/* Card Content */}
          <div className="relative h-full flex flex-col justify-between p-6 md:p-8 text-brand-cream z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥝</span>
              <span className="text-xs uppercase tracking-widest font-bold text-brand-rose">
                New Zealand Collection
              </span>
            </div>
            
            <div className="max-w-md">
              <h3 className="font-serif text-xl md:text-2xl font-semibold mb-2">
                Pure Botanical Care
              </h3>
              <p className="text-xs md:text-sm text-brand-cream/80 leading-relaxed">
                Natural & organic beauty with New Zealand's finest native botanical ingredients.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-rose group-hover:text-brand-cream transition-colors">
              Explore Collection
              <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            </div>
          </div>
          <div className="absolute inset-0 border border-brand-border/20 rounded-2xl pointer-events-none" />
        </div>

      </div>

      {/* New Zealand Coming Soon Dialog Drawer */}
      {showNzComingSoon && (
        <div className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-brand-cream text-brand-espresso max-w-md w-full rounded-2xl p-6 relative border border-brand-border shadow-2xl animate-slide-up">
            <button 
              onClick={() => setShowNzComingSoon(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-brand-espresso/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pt-4">
              <span className="text-4xl block mb-3">🥝</span>
              <span className="bg-brand-rose/10 text-brand-rose text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                Launching Soon
              </span>
              <h4 className="font-serif text-2xl font-bold mt-4 mb-2">
                New Zealand Organics
              </h4>
              <p className="text-sm text-brand-espresso/70 leading-relaxed mb-6">
                We are currently handpicking and certifying authentic, premium organic skincare brands from New Zealand to import directly to Sri Lanka. Stay tuned for clean, native botanical beauty solutions!
              </p>
              
              <button 
                onClick={() => setShowNzComingSoon(false)}
                className="w-full bg-brand-espresso hover:bg-brand-rose text-brand-cream font-semibold text-sm py-3 rounded-full transition-colors shadow"
              >
                Notify Me
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
