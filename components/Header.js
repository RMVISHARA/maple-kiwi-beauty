"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, LogOut, Sun, Moon, LayoutDashboard, Menu, X, ArrowLeft, ChevronDown, CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Header({ searchQuery, setSearchQuery }) {
  const { openCart, itemCount } = useCart();
  const { user, openAuth, logout } = useAuth();
  const { theme, toggleTheme, mounted } = useTheme();
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [goodbyeName, setGoodbyeName] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(searchQuery || "");

  useEffect(() => {
    setLocalSearch(searchQuery || "");
  }, [searchQuery]);

  const handleInputChange = (val) => {
    setLocalSearch(val);
    if (pathname === "/") {
      setSearchQuery(val);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (pathname !== "/") {
      router.push(`/#all-products?search=${encodeURIComponent(localSearch)}`);
    } else if (typeof setSearchQuery === "function") {
      setSearchQuery(localSearch);
    }
  };

  const announcements = [
    "🚚 Free Shipping Island-wide over Rs. 15,000.",
    "🍁 Authentic Canada & NZ imports",
    "📦 Delivered Island-wide"
  ];

  // Rotate announcements on mobile for space-saving.
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const handleScrollToSection = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);
    if (pathname !== "/") {
      router.push(`/#${targetId}`);
      return;
    }

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToTop = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (pathname !== "/") {
      router.push("/");
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="w-full bg-brand-cream border-b border-brand-border sticky top-0 z-40">
      {/* Top Announcement Bar */}
      <div className="w-full bg-[#2B2421] dark:bg-[#1C1613] text-[#FAF7F2] text-xs py-2 px-4">
        {/* Mobile Rotating View */}
        <div className="block md:hidden text-center font-medium animate-fade-in">
          {announcements[announcementIndex]}
        </div>
        
        {/* Desktop Announcement View */}
        <div className="hidden md:grid grid-cols-3 items-center max-w-7xl mx-auto font-medium">
          <div className="flex items-center gap-1.5 justify-self-start">
            <span>🚚</span> Free Shipping Island-wide over Rs. 15,000.
          </div>
          <div className="flex items-center gap-1.5 justify-self-center">
            <span>🍁</span> Authentic Canada & NZ imports
          </div>
          <div className="flex items-center gap-1.5 justify-self-end">
            <span>📦</span> Delivered Island-wide
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-4">
        {searchExpanded ? (
          /* Mobile Expanded Search Bar Overlay */
          <div className="flex items-center w-full gap-3 animate-fade-in">
            <button
              onClick={() => {
                setSearchExpanded(false);
                setSearchQuery("");
              }}
              className="p-2 text-brand-espresso hover:text-brand-rose transition-colors rounded-full hover:bg-brand-espresso/5 active:scale-95 cursor-pointer shrink-0"
              aria-label="Close search"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-grow relative">
              <input
                type="text"
                autoFocus
                placeholder=""
                value={localSearch}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full bg-brand-cream border border-brand-border text-brand-espresso rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose transition-all shadow-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/50" />
            </form>
          </div>
        ) : (
          /* Standard Header Contents */
          <>
            {/* Left: Hamburger & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 text-brand-espresso hover:text-brand-rose transition-colors rounded-full hover:bg-brand-espresso/5 active:scale-95 cursor-pointer shrink-0"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center gap-2 group">
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
                </Link>
              </div>
            </div>

            {/* Search Bar (Desktop only) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:block flex-grow max-w-xl relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder=""
                  value={localSearch}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full bg-brand-cream border border-brand-border text-brand-espresso rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose transition-all shadow-sm"
                />
                <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-espresso/50 hover:text-brand-rose transition-colors cursor-pointer border-none bg-transparent p-0">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Action Controls */}
            <div className="flex-shrink-0 flex items-center gap-3 md:gap-5">
              {/* Search Icon Trigger (Mobile only) */}
              <button
                onClick={() => setSearchExpanded(true)}
                className="block md:hidden p-2.5 text-brand-espresso hover:text-brand-rose transition-colors rounded-full hover:bg-brand-cream relative group active:scale-95 cursor-pointer"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </button>

              {user ? (
                <div className="relative flex items-center">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 text-sm font-semibold hover:text-brand-rose transition-colors py-1.5 pl-3 pr-2 rounded-l-full hover:bg-brand-espresso/5 active:scale-95 border border-brand-border/40 border-r-0"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-rose text-[#FAF7F2] text-xs font-bold flex items-center justify-center shadow-sm shrink-0 overflow-hidden relative">
                      {user.avatarUrl ? (
                        <Image
                          src={`${user.avatarUrl}?t=${user.updatedAt || user.id}`}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="24px"
                          unoptimized
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="hidden sm:inline-block max-w-[100px] truncate text-xs font-bold text-brand-espresso">
                      Hi, {user.name}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                    className="py-1.5 pr-2.5 pl-1 rounded-r-full border border-brand-border/40 border-l-0 hover:bg-brand-espresso/5 transition-colors"
                    aria-label="Account menu"
                    aria-expanded={showUserDropdown}
                  >
                    <ChevronDown className={`w-3.5 h-3.5 text-brand-espresso/70 transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-brand-cream border border-brand-border rounded-xl shadow-lg py-2 z-50 animate-fade-in text-brand-espresso">
                      <div className="px-4 py-2 border-b border-brand-border/60">
                        <p className="text-[9px] uppercase font-bold text-brand-espresso/45">Logged in as</p>
                        <p className="text-xs font-bold truncate mt-0.5">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-brand-espresso hover:bg-brand-espresso/5 transition-colors flex items-center gap-2 border-b border-brand-border/60"
                      >
                        <User className="w-3.5 h-3.5" />
                        My Profile
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserDropdown(false)}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-brand-espresso hover:bg-brand-espresso/5 transition-colors flex items-center gap-2 border-b border-brand-border/60"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setConfirmLogout(true);
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
                    className="bg-brand-espresso hover:bg-brand-rose text-brand-cream hover:text-[#FAF7F2] text-sm font-semibold px-4 py-2 rounded-full transition-all shadow hover:shadow-md active:scale-95"
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
                onClick={() => {
                  if (!user) {
                    openAuth("signin");
                    return;
                  }
                  openCart();
                }}
                className="relative p-2.5 text-brand-espresso hover:text-brand-rose transition-colors rounded-full hover:bg-brand-cream relative group"
                aria-label="Open Cart"
              >
                <ShoppingBag className="w-5.5 h-5.5 transition-transform group-hover:scale-105" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-brand-rose text-[#FAF7F2] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-cream animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-brand-espresso/60 backdrop-blur-sm"
            onClick={() => setConfirmLogout(false)}
          />
          <div className="relative w-full max-w-sm bg-brand-cream border border-brand-border rounded-2xl shadow-2xl p-6 text-brand-espresso">
            <h3 className="font-serif text-xl font-bold mb-2">Sign out?</h3>
            <p className="text-sm text-brand-espresso/70 mb-6">
              Are you sure that you want to log out? Your basket will be saved for when you sign back in.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2.5 text-sm font-semibold rounded-full border border-brand-border hover:bg-brand-espresso/5 transition-colors"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = user?.name || "";
                  const shouldGoHome =
                    pathname.startsWith("/profile") || pathname.startsWith("/admin");
                  setConfirmLogout(false);
                  setGoodbyeName(name);
                  logout();
                  setTimeout(() => {
                    setGoodbyeName("");
                    if (shouldGoHome) router.push("/");
                  }, 2200);
                }}
                className="px-4 py-2.5 text-sm font-semibold rounded-full bg-brand-rose text-[#FAF7F2] hover:bg-brand-espresso hover:text-brand-cream transition-colors"
              >
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {goodbyeName && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-brand-espresso/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-brand-cream text-brand-espresso rounded-2xl overflow-hidden border border-brand-border shadow-2xl p-6 md:p-8">
            <div className="py-6 text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-[#4B6F44] mb-4" />
              <h3 className="font-serif text-2xl font-bold mb-2">Thank you</h3>
              <p className="text-sm text-brand-espresso/70 leading-relaxed max-w-sm">
                We&apos;re sad to see you leave, Thank You &amp; Come again, {goodbyeName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unified Side Panel Drawer Navigation */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-brand-cream border-r border-brand-border h-full flex flex-col p-6 shadow-2xl z-50 text-brand-espresso transition-transform duration-300 animate-drawer-in">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b border-brand-border/60 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-border bg-brand-card relative">
                    <Image
                      src="/images/logo.jpg"
                      alt="Maple & Kiwi Beauty Logo"
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                  <span className="font-serif font-bold text-sm leading-tight text-brand-espresso">
                    Maple & Kiwi
                  </span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-brand-espresso/5 transition-colors text-brand-espresso/70 hover:text-brand-espresso cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-4">
                <a
                  href="/"
                  onClick={handleScrollToTop}
                  className="block text-sm font-semibold hover:text-brand-rose transition-colors py-2 px-3 rounded-lg hover:bg-brand-espresso/5"
                >
                  Home
                </a>
                <a
                  href="/#all-products"
                  onClick={(e) => handleScrollToSection(e, "all-products")}
                  className="block text-sm font-semibold hover:text-brand-rose transition-colors py-2 px-3 rounded-lg hover:bg-brand-espresso/5"
                >
                  Products
                </a>
                <a
                  href="/#about-us"
                  onClick={(e) => handleScrollToSection(e, "about-us")}
                  className="block text-sm font-semibold hover:text-brand-rose transition-colors py-2 px-3 rounded-lg hover:bg-brand-espresso/5"
                >
                  About Us
                </a>
                <a
                  href="/#contact-us"
                  onClick={(e) => handleScrollToSection(e, "contact-us")}
                  className="block text-sm font-semibold hover:text-brand-rose transition-colors py-2 px-3 rounded-lg hover:bg-brand-espresso/5"
                >
                  Contact Us
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
