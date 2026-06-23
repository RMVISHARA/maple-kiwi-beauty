"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header({ searchQuery, setSearchQuery }) {
  const { openCart, itemCount } = useCart();
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const announcements = [
    "🚚 Free shipping on orders over LKR 5,000",
    "🍁 Authentic Canada & NZ imports",
    "📦 Delivered islandwide directly to your doorstep"
  ];

  // Rotate announcements on mobile for space-saving, show all on desktop
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full bg-brand-cream border-b border-brand-border sticky top-0 z-40">
      {/* Top Announcement Bar */}
      <div className="w-full bg-brand-espresso text-brand-cream text-xs py-2 px-4">
        {/* Mobile Rotating View */}
        <div className="block md:hidden text-center font-medium animate-fade-in">
          {announcements[announcementIndex]}
        </div>
        
        {/* Desktop Triple Column View */}
        <div className="hidden md:flex justify-between items-center max-w-7xl mx-auto font-medium">
          <div className="flex items-center gap-1.5">
            <span>🚚</span> Free shipping on orders over LKR 5,000
          </div>
          <div className="flex items-center gap-1.5">
            <span>🍁</span> Authentic Canada & NZ imports
          </div>
          <div className="flex items-center gap-1.5">
            <span>📦</span> Delivered islandwide
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-border bg-white flex items-center justify-center relative transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.jpg"
                alt="Maple & Kiwi Beauty Logo"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="hidden sm:block text-left">
              <span className="block font-serif font-bold text-lg leading-tight text-brand-espresso group-hover:text-brand-rose transition-colors">
                Maple & Kiwi
              </span>
              <span className="block text-[10px] tracking-widest text-brand-rose uppercase leading-none font-semibold">
                B E A U T Y
              </span>
            </div>
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex-grow max-w-xl relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search brands, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-brand-border text-brand-espresso placeholder-brand-espresso/50 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/50" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex-shrink-0 flex items-center gap-3 md:gap-5">
          {/* Sign In (Desktop) */}
          <button className="hidden md:flex items-center gap-1.5 text-sm font-semibold hover:text-brand-rose transition-colors">
            <User className="w-4 h-4" />
            Sign In
          </button>

          {/* Join Free Button */}
          <button className="bg-brand-espresso hover:bg-brand-rose text-brand-cream text-sm font-semibold px-4 py-2 rounded-full transition-all shadow hover:shadow-md active:scale-95">
            Join Free
          </button>

          {/* Cart Icon trigger */}
          <button
            onClick={openCart}
            className="relative p-2.5 text-brand-espresso hover:text-brand-rose transition-colors rounded-full hover:bg-[#FAF7F2] relative group"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-5.5 h-5.5 transition-transform group-hover:scale-105" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 bg-brand-rose text-brand-cream text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-cream animate-bounce">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
