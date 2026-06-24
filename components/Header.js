"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ShoppingBag, User, LogOut, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Header({ searchQuery, setSearchQuery }) {
  const { openCart, itemCount } = useCart();
  const { user, openAuth, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
            <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-border bg-brand-card flex items-center justify-center relative transition-transform group-hover:scale-105">
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
              className="w-full bg-brand-cream border border-brand-border text-brand-espresso placeholder-brand-espresso/50 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/50" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex-shrink-0 flex items-center gap-3 md:gap-5">
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
              className="flex items-center gap-2 text-sm font-semibold hover:text-brand-rose transition-colors py-1.5 px-3 rounded-full hover:bg-brand-espresso/5 active:scale-95 border border-brand-border/40"
            >
              <div className="w-6 h-6 rounded-full bg-brand-rose text-brand-cream text-xs font-bold flex items-center justify-center shadow-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline-block max-w-[100px] truncate text-xs font-bold text-brand-espresso">
                Hi, {user.name}
              </span>
            </button>
            
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-brand-cream border border-brand-border rounded-xl shadow-lg py-2 z-50 animate-fade-in text-brand-espresso">
                <div className="px-4 py-2 border-b border-brand-border/60">
                  <p className="text-[9px] uppercase font-bold text-brand-espresso/45">Logged in as</p>
                  <p className="text-xs font-bold truncate mt-0.5">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-brand-rose hover:bg-brand-rose/5 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Sign In (Desktop) */}
            <button 
              onClick={() => openAuth("signin")}
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold hover:text-brand-rose transition-colors"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>

            {/* Join Free Button */}
            <button 
              onClick={() => openAuth("signup")}
              className="bg-brand-espresso hover:bg-brand-rose text-brand-cream text-sm font-semibold px-4 py-2 rounded-full transition-all shadow hover:shadow-md active:scale-95"
            >
              Join Free
            </button>
          </>
        )}

          {/* Theme Switcher Toggle */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2.5 text-brand-espresso hover:text-brand-rose transition-all rounded-full hover:bg-brand-cream relative group active:scale-95 cursor-pointer"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              ) : (
                <Sun className="w-5 h-5 text-brand-espresso transition-transform duration-500 group-hover:rotate-90" />
              )}
            </button>
          )}

          {/* Cart Icon trigger */}
          <button
            onClick={openCart}
            className="relative p-2.5 text-brand-espresso hover:text-brand-rose transition-colors rounded-full hover:bg-brand-cream relative group"
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
