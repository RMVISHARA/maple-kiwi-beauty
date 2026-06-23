"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Collections from "@/components/Collections";
import ProductGrid from "@/components/ProductGrid";
import CartDrawer from "@/components/CartDrawer";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-cream text-brand-espresso selection:bg-brand-rose/20 selection:text-brand-rose">
      {/* Dynamic Header */}
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Collection Promos */}
        <Collections />

        {/* Product Grid and Filters */}
        <ProductGrid searchQuery={searchQuery} />
      </main>

      {/* Shopping Cart Slider Drawer */}
      <CartDrawer />

      {/* Premium Footer */}
      <footer className="bg-brand-espresso text-brand-cream border-t border-brand-border/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Brand Intro */}
            <div className="space-y-4">
              <h3 className="font-serif text-2xl font-bold">
                Maple & Kiwi <span className="text-brand-rose block text-xs tracking-widest uppercase font-sans font-bold mt-1">Beauty</span>
              </h3>
              <p className="text-xs text-brand-cream/70 leading-relaxed max-w-sm">
                Bringing authentic, trusted, and highly effective skincare, beauty, and wellness essentials directly from the pristine environments of Canada and New Zealand to Sri Lanka.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="p-2 bg-brand-cream/5 hover:bg-brand-rose hover:text-brand-cream rounded-full transition-all text-brand-cream/60" aria-label="Instagram">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </a>
                <a href="#" className="p-2 bg-brand-cream/5 hover:bg-brand-rose hover:text-brand-cream rounded-full transition-all text-brand-cream/60" aria-label="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose">
                Shop Collections
              </h4>
              <ul className="space-y-2.5 text-xs text-brand-cream/70">
                <li>
                  <a href="#all-products" className="hover:text-brand-rose transition-colors">
                    Shop 5 Essentials
                  </a>
                </li>
                <li>
                  <a href="#all-products" className="hover:text-brand-rose transition-colors">
                    Canada Collection (Active)
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-rose transition-colors">
                    New Zealand Collection (Coming Soon)
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/+94771234567" target="_blank" rel="noopener noreferrer" className="hover:text-brand-rose transition-colors">
                    WhatsApp Consultations
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose">
                Delivery & Terms
              </h4>
              <ul className="space-y-2.5 text-xs text-brand-cream/70">
                <li>
                  <span className="block text-brand-cream font-medium">Free Islandwide Delivery</span>
                  On all orders over LKR 5,000. Under LKR 5,000 is a flat rate of LKR 350.
                </li>
                <li>
                  <span className="block text-brand-cream font-medium">100% Authentic Imports</span>
                  Directly sourced from official brands in Canada & NZ.
                </li>
                <li>
                  <span className="block text-brand-cream font-medium">Payment Options</span>
                  Cash on Delivery (COD) or Bank Transfer options.
                </li>
              </ul>
            </div>

            {/* Column 4: Contact info */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose">
                Get In Touch
              </h4>
              <ul className="space-y-3.5 text-xs text-brand-cream/70">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-rose shrink-0" />
                  <span>Colombo, Sri Lanka (Islandwide Delivery)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand-rose shrink-0" />
                  <a href="tel:+94771234567" className="hover:text-brand-rose transition-colors">
                    +94 77 123 4567
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-rose shrink-0" />
                  <a href="mailto:info@maplekiwibeauty.lk" className="hover:text-brand-rose transition-colors">
                    info@maplekiwibeauty.lk
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-brand-cream/10 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-brand-cream/50">
            <p>
              © {new Date().getFullYear()} Maple & Kiwi Beauty. All Rights Reserved. Sourced from Canada & New Zealand.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-brand-cream transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-cream transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
