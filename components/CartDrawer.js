"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { FREE_SHIPPING_LIMIT, SRI_LANKA_DISTRICTS } from "@/lib/shipping";

function sanitizePhoneInput(value) {
  const trimmed = value.trim();
  const hasLeadingPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasLeadingPlus ? `+${digits}` : digits;
}

function isValidPhone(value) {
  return /^\+?[0-9]{7,15}$/.test(value.trim());
}

export default function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    itemCount,
  } = useCart();
  const { user, openAuth } = useAuth();

  const drawerRef = useRef();

  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [shippingQuote, setShippingQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const isFreeShipping = FREE_SHIPPING_LIMIT !== null && subtotal >= FREE_SHIPPING_LIMIT;
  const amountUntilFree = Math.max(0, (FREE_SHIPPING_LIMIT || 0) - subtotal);
  const progressPercent = FREE_SHIPPING_LIMIT ? Math.min((subtotal / FREE_SHIPPING_LIMIT) * 100, 100) : 0;

  const shippingAmount = isFreeShipping ? 0 : (shippingQuote?.shipping ?? null);
  const estimatedTotal =
    shippingAmount !== null ? subtotal + shippingAmount : subtotal;

  const fetchShippingQuote = useCallback(async () => {
    if (!district || isFreeShipping) {
      setShippingQuote(isFreeShipping ? { shipping: 0, isFreeShipping: true, zoneLabel: "Free delivery" } : null);
      return;
    }

    setQuoteLoading(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          district,
          city,
          subtotal,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShippingQuote(data);
        setCheckoutError("");
      } else {
        setShippingQuote(null);
        setCheckoutError(data.error || "Could not calculate delivery");
      }
    } catch {
      setShippingQuote(null);
      setCheckoutError("Could not calculate delivery charge");
    } finally {
      setQuoteLoading(false);
    }
  }, [district, city, subtotal, cart, isFreeShipping]);

  useEffect(() => {
    if (isOpen && cart.length > 0) {
      fetchShippingQuote();
    }
  }, [isOpen, cart.length, fetchShippingQuote]);

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) {
        closeCart();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const handleWhatsAppCheckout = () => {
    if (!user) {
      openAuth("signin");
      return;
    }

    if (!district) {
      setCheckoutError("Please select your delivery district");
      return;
    }
    if (!city.trim()) {
      setCheckoutError("Please enter your city / town");
      return;
    }
    if (!addressLine.trim()) {
      setCheckoutError("Please enter your delivery address");
      return;
    }
    if (!phone.trim()) {
      setCheckoutError("Please enter your contact phone number");
      return;
    }
    if (!isValidPhone(phone)) {
      setCheckoutError("Please enter a valid phone number (digits only, optional + for country code)");
      return;
    }
    if (!isFreeShipping && (shippingAmount === null || quoteLoading)) {
      setCheckoutError("Please wait for delivery charge to be calculated");
      return;
    }

    const phoneNumber = "16047245033";

    let itemsText = "";
    cart.forEach((item, index) => {
      const size = item.selectedSize || item.selectedVolume;
      const sizeLabel = size ? ` (${size})` : "";
      itemsText += `${index + 1}. ${item.name}${sizeLabel} (${item.brand}) - Qty: ${item.quantity} x LKR ${item.price.toLocaleString()} = LKR ${(item.price * item.quantity).toLocaleString()}\n`;
    });

    const shippingLabel = isFreeShipping
      ? `FREE (Orders over LKR ${FREE_SHIPPING_LIMIT.toLocaleString()})`
      : `LKR ${shippingAmount.toLocaleString()} (${shippingQuote?.zoneLabel || district})`;

    const deliveryAddress = `${addressLine.trim()}, ${city.trim()}, ${district}`;

    let token = null;
    try {
      token = localStorage.getItem("maple_kiwi_token");
    } catch {
      // ignore malformed localStorage
    }

    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer: {
          name: user.name,
          email: user.email,
          phone: phone.trim(),
          district,
          city: city.trim(),
          address: addressLine.trim(),
        },
        items: cart.map((item) => {
          const size = item.selectedSize || item.selectedVolume;
          return {
            id: item.id,
            variantId: item.selectedVariantId ?? null,
            name: size ? `${item.name} (${size})` : item.name,
            brand: item.brand,
            price: item.price,
            quantity: item.quantity,
          };
        }),
        paymentMethod: "Bank Transfer",
      }),
    }).catch((err) => console.error("Failed to save order:", err));

    const message =
      `🛍️ *NEW ORDER - MAPLE & KIWI BEAUTY*\n\n` +
      `Hello! I would like to place an order for the following premium beauty items:\n\n` +
      `${itemsText}\n` +
      `-----------------------------\n` +
      `*Delivery Address:*\n${deliveryAddress}\n` +
      `*Contact Phone:* ${phone.trim()}\n\n` +
      `*Subtotal:* LKR ${subtotal.toLocaleString()}\n` +
      `*Delivery:* ${shippingLabel}\n` +
      `*Estimated Total:* LKR ${estimatedTotal.toLocaleString()}\n\n` +
      `Please confirm stock availability and send payment details (Bank Transfer). Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-espresso/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div
        ref={drawerRef}
        className="w-full max-w-md bg-brand-cream h-full flex flex-col justify-between shadow-2xl animate-drawer-in border-l border-brand-border"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-rose" />
            <h3 className="font-serif text-lg font-bold text-brand-espresso">
              Your Shopping Bag
            </h3>
            <span className="bg-brand-rose/10 text-brand-rose text-[10px] font-bold px-2 py-0.5 rounded-full">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-1 rounded-full hover:bg-brand-espresso/5 transition-colors text-brand-espresso/70 hover:text-brand-espresso"
            aria-label="Close cart"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        {itemCount > 0 && (
          <div className="bg-brand-card border-b border-brand-border/60 p-4 text-center shrink-0">
            {isFreeShipping ? (
              <p className="text-xs font-semibold text-[#4B6F44]">
                🎉 You qualify for <span className="underline">FREE shipping</span> on this order!
              </p>
            ) : (
              <>
                <p className="text-xs font-semibold text-brand-espresso/80 mb-2">
                  Add{" "}
                  <span className="font-bold text-brand-rose">
                    Rs. {amountUntilFree.toLocaleString()}
                  </span>{" "}
                  more to your cart to qualify for free shipping.
                </p>
                <div className="w-full h-1.5 bg-brand-border/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-rose rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Cart items + delivery form */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <div
                  key={item.cartItemId || item.id}
                  className="flex items-center gap-4 bg-brand-card rounded-xl p-3 border border-brand-border/30 hover:border-brand-border/60 transition-colors shadow-sm"
                >
                  <div className="w-16 h-16 bg-brand-cream rounded-lg relative overflow-hidden flex-shrink-0 flex items-center justify-center border border-brand-border/20">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] uppercase font-bold text-brand-rose tracking-wider">
                        {item.brand}
                      </span>
                      {(item.selectedSize || item.selectedVolume) && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-brand-espresso/5 border border-brand-border/60 text-brand-espresso/80 rounded-full">
                          {item.selectedSize || item.selectedVolume}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-xs md:text-sm text-brand-espresso truncate mb-1">
                      {item.name}
                    </h4>
                    <span className="block text-xs font-semibold text-brand-rose">
                      LKR {item.price.toLocaleString()}
                    </span>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-brand-border/80 rounded-full bg-brand-cream">
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity - 1)}
                          className="p-1 hover:text-brand-rose transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, item.quantity + 1)}
                          className="p-1 hover:text-brand-rose transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartItemId || item.id)}
                    className="p-1.5 text-brand-espresso/30 hover:text-brand-rose hover:bg-brand-rose/5 rounded-full transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Delivery details */}
              <div className="bg-brand-card rounded-xl p-4 border border-brand-border/40 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-brand-rose" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-espresso">
                    Delivery Details
                  </h4>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-brand-espresso/60 mb-1">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs border border-brand-border/60 rounded-lg px-3 py-2.5 bg-brand-cream text-brand-espresso focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
                  >
                    <option value="">Select district</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-brand-espresso/60 mb-1">
                    City / Town * <span className="font-normal">(e.g. Kelaniya, Negombo)</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city or town"
                    className="w-full text-xs border border-brand-border/60 rounded-lg px-3 py-2.5 bg-brand-cream text-brand-espresso placeholder:text-brand-espresso/35 focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-brand-espresso/60 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="House no., street, landmark"
                    className="w-full text-xs border border-brand-border/60 rounded-lg px-3 py-2.5 bg-brand-cream text-brand-espresso placeholder:text-brand-espresso/35 focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-brand-espresso/60 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                    placeholder="07X XXX XXXX or +94 7X XXX XXXX"
                    className="w-full text-xs border border-brand-border/60 rounded-lg px-3 py-2.5 bg-brand-cream text-brand-espresso placeholder:text-brand-espresso/35 focus:outline-none focus:ring-2 focus:ring-brand-rose/30"
                  />
                </div>

                {district && !isFreeShipping && shippingQuote && (
                  <p className="text-[10px] text-brand-espresso/55 leading-relaxed">
                    Zone: {shippingQuote.zoneLabel}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <span className="text-4xl mb-4">🛍️</span>
              <p className="text-sm font-semibold text-brand-espresso/60 mb-1">
                Your cart is empty
              </p>
              <p className="text-xs text-brand-espresso/40 mb-6">
                Explore our essentials to get started on your skincare journey.
              </p>
              <button
                onClick={closeCart}
                className="bg-brand-espresso hover:bg-brand-rose text-brand-cream hover:text-[#FAF7F2] text-xs font-bold py-2.5 px-6 rounded-full transition-colors shadow"
              >
                Browse Products
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 bg-brand-card border-t border-brand-border shadow-[0_-4px_24px_rgba(0,0,0,0.04)] shrink-0">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-brand-espresso/70">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-brand-espresso/70">
                <span>Delivery</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-[#4B6F44] font-semibold">FREE</span>
                  ) : !district ? (
                    <span className="text-brand-espresso/45">Select district</span>
                  ) : quoteLoading ? (
                    <span className="text-brand-espresso/45">Calculating…</span>
                  ) : shippingAmount !== null ? (
                    <span className="font-semibold text-brand-espresso">
                      LKR {shippingAmount.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-brand-rose">Unavailable</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-brand-espresso pt-2 border-t border-brand-border/40">
                <span>Estimated Total</span>
                <span>LKR {estimatedTotal.toLocaleString()}</span>
              </div>
            </div>

            {checkoutError && (
              <p className="text-[10px] text-brand-rose font-semibold text-center mb-3">
                {checkoutError}
              </p>
            )}

            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-brand-rose hover:bg-brand-rose-hover text-[#FAF7F2] font-semibold text-sm py-3.5 rounded-full flex items-center justify-center gap-2 transition-all shadow hover:shadow-md active:scale-98 group"
            >
              Order via WhatsApp
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-[10px] text-center text-[#2B2421]/60 mt-3 leading-relaxed">
              Delivery from Rs. 350 based on your district. Free shipping on orders over Rs. {FREE_SHIPPING_LIMIT.toLocaleString()}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
