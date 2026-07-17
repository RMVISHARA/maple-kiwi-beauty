"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

export default function Collections() {
  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Canada Collection Card */}
        <div 
          onClick={() => handleScrollToSection("canada-collection")}
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
          <div className="relative h-full flex flex-col justify-between p-6 md:p-8 text-brand-cream dark:text-white z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍁</span>
              <span className="text-xs uppercase tracking-widest font-bold text-brand-rose">
                Canada Collection
              </span>
            </div>
            
            <div className="max-w-md">
              <h3 className="font-serif text-xl md:text-2xl font-semibold mb-2 dark:text-white">
                Clinical Skincare Essentials
              </h3>
              <p className="text-xs md:text-sm text-brand-cream/80 dark:text-white/80 leading-relaxed">
                The Ordinary & Aveeno — clinically formulated serums and SPF trusted globally.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-rose group-hover:text-brand-cream dark:group-hover:text-white transition-colors">
              Shop Canada Products
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="absolute inset-0 border border-brand-border/20 rounded-2xl pointer-events-none" />
        </div>

        {/* New Zealand Collection Card */}
        <div 
          onClick={() => handleScrollToSection("new-zealand-collection")}
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
          <div className="relative h-full flex flex-col justify-between p-6 md:p-8 text-brand-cream dark:text-white z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🥝</span>
              <span className="text-xs uppercase tracking-widest font-bold text-brand-rose">
                New Zealand Collection
              </span>
            </div>
            
            <div className="max-w-md">
              <h3 className="font-serif text-xl md:text-2xl font-semibold mb-2 dark:text-white">
                Pure Botanical Care
              </h3>
              <p className="text-xs md:text-sm text-brand-cream/80 dark:text-white/80 leading-relaxed">
                Natural & organic beauty with New Zealand's finest native botanical ingredients.
              </p>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-rose group-hover:text-brand-cream dark:group-hover:text-white transition-colors">
              Shop New Zealand Products
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
          <div className="absolute inset-0 border border-brand-border/20 rounded-2xl pointer-events-none" />
        </div>

      </div>
    </section>
  );
}
