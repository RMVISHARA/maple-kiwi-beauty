"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

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

  const drawerRef = useRef();

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) {
        closeCart();
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Lock page background scrolling
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  // Free shipping parameters
  const FREE_SHIPPING_LIMIT = 5000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_LIMIT;
  const amountNeededForFreeShipping = FREE_SHIPPING_LIMIT - subtotal;
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_LIMIT) * 100, 100);

  // Generate Sri Lanka WhatsApp order message
  const handleWhatsAppCheckout = () => {
    const phoneNumber = "+94771234567"; // Business contact phone number
    
    let itemsText = "";
    cart.forEach((item, index) => {
      itemsText += `${index + 1}. ${item.name} (${item.brand}) - Qty: ${item.quantity} x LKR ${item.price.toLocaleString()} = LKR ${(item.price * item.quantity).toLocaleString()}\n`;
    });

    const shippingCost = isFreeShipping ? "FREE (Orders over LKR 5,000)" : "LKR 350 (Flat rate islandwide)";
    const finalTotal = isFreeShipping ? subtotal : subtotal + 350;

    const message = `🛍️ *NEW ORDER - MAPLE & KIWI BEAUTY*\n\n` +
      `Hello! I would like to place an order for the following premium beauty items:\n\n` +
      `${itemsText}\n` +
      `-----------------------------\n` +
      `*Subtotal:* LKR ${subtotal.toLocaleString()}\n` +
      `*Shipping:* ${shippingCost}\n` +
      `*Estimated Total:* LKR ${finalTotal.toLocaleString()}\n\n` +
      `Please confirm stock availability and send payment details (Bank Transfer/COD). Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-espresso/60 backdrop-blur-sm flex justify-end animate-fade-in">
      {/* Sliding Drawer Container */}
      <div
        ref={drawerRef}
        className="w-full max-w-md bg-brand-cream h-full flex flex-col justify-between shadow-2xl animate-drawer-in border-l border-brand-border"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
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
          <div className="bg-brand-card border-b border-brand-border/60 p-5">
            <div className="text-xs mb-2">
              {isFreeShipping ? (
                <p className="font-semibold text-[#4B6F44] flex items-center gap-1">
                  🎉 You qualify for <span className="underline">FREE Islandwide Shipping!</span>
                </p>
              ) : (
                <p className="text-brand-espresso/70">
                  Add <span className="font-bold text-brand-rose">LKR {amountNeededForFreeShipping.toLocaleString()}</span> more for <span className="font-semibold text-brand-espresso">FREE Shipping!</span>
                </p>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-brand-cream rounded-full h-2 overflow-hidden border border-brand-border/40">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? "bg-[#4B6F44]" : "bg-brand-rose"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart items list */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 bg-brand-card rounded-xl p-3 border border-brand-border/30 hover:border-brand-border/60 transition-colors shadow-sm"
              >
                {/* Item Image */}
                <div className="w-16 h-16 bg-brand-cream rounded-lg relative overflow-hidden flex-shrink-0 flex items-center justify-center border border-brand-border/20">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </div>

                {/* Item details */}
                <div className="flex-grow min-w-0">
                  <span className="block text-[9px] uppercase font-bold text-brand-rose tracking-wider">
                    {item.brand}
                  </span>
                  <h4 className="font-serif font-bold text-xs md:text-sm text-brand-espresso truncate mb-1">
                    {item.name}
                  </h4>
                  <span className="block text-xs font-semibold text-brand-rose">
                    LKR {item.price.toLocaleString()}
                  </span>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-brand-border/80 rounded-full bg-brand-cream">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:text-brand-rose transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:text-brand-rose transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-brand-espresso/30 hover:text-brand-rose hover:bg-brand-rose/5 rounded-full transition-colors shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <span className="text-4xl mb-4">🛍️</span>
              <p className="text-sm font-semibold text-brand-espresso/60 mb-1">
                Your cart is empty
              </p>
              <p className="text-xs text-brand-espresso/40 mb-6">
                Explore our 5 essentials to get started on your skincare journey.
              </p>
              <button
                onClick={closeCart}
                className="bg-brand-espresso hover:bg-brand-rose text-brand-cream text-xs font-bold py-2.5 px-6 rounded-full transition-colors shadow"
              >
                Browse Products
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer (Only visible if items exist) */}
        {cart.length > 0 && (
          <div className="p-5 bg-brand-card border-t border-brand-border shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
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
                  ) : (
                    "LKR 350"
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-brand-espresso pt-2 border-t border-brand-border/40">
                <span>Estimated Total</span>
                <span>
                  LKR {(isFreeShipping ? subtotal : subtotal + 350).toLocaleString()}
                </span>
              </div>
            </div>

            {/* WhatsApp Checkout Button */}
            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-brand-rose hover:bg-brand-rose-hover text-brand-cream font-semibold text-sm py-3.5 rounded-full flex items-center justify-center gap-2 transition-all shadow hover:shadow-md active:scale-98 group"
            >
              Order via WhatsApp
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="text-[10px] text-center text-brand-espresso/45 mt-3 leading-relaxed">
              *Your order details will be formatted into a WhatsApp message. Simply hit send on WhatsApp to confirm delivery with our agents. Islandwide cash-on-delivery and bank transfers supported.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
