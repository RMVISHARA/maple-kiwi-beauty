"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const CartContext = createContext();

function cartStorageKey(userId) {
  return `maple_kiwi_cart_${userId}`;
}

function readCartForUser(userId) {
  const key = cartStorageKey(userId);
  let savedCart = localStorage.getItem(key);

  // One-time migrate from the old shared cart key into this user's basket.
  if (!savedCart) {
    const legacy = localStorage.getItem("maple_kiwi_cart");
    if (legacy) {
      localStorage.setItem(key, legacy);
      localStorage.removeItem("maple_kiwi_cart");
      savedCart = legacy;
    }
  }

  if (!savedCart) return [];
  try {
    const parsed = JSON.parse(savedCart);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse cart data", e);
    return [];
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load this user's saved basket when they sign in; clear UI when signed out.
  useEffect(() => {
    if (!user) {
      setCart([]);
      setIsLoaded(true);
      return;
    }

    setCart(readCartForUser(user.id));
    setIsLoaded(true);
  }, [user]);

  // Persist basket under a per-user key so it survives logout and returns on login.
  useEffect(() => {
    if (isLoaded && user) {
      localStorage.setItem(cartStorageKey(user.id), JSON.stringify(cart));
    }
  }, [cart, isLoaded, user]);

  const addToCart = (product) => {
    if (!user) return false;

    // The size label (e.g. "50 g · Jar") both identifies the cart line and is
    // shown to the customer. Falls back to the legacy selectedVolume field.
    const sizeLabel = product.selectedSize ?? product.selectedVolume ?? "";
    const variantId = product.selectedVariantId ?? null;
    // A variant/option key keeps two options with the same label distinct.
    const optionKey = product.selectedOptionKey ?? (sizeLabel || "base");
    const cartItemId = `${product.id}-${optionKey}`;

    // Don't store the (potentially large) full variants list on each cart line.
    const { variants, ...productLine } = product;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.cartItemId === cartItemId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          ...productLine,
          cartItemId,
          selectedSize: sizeLabel,
          selectedVariantId: variantId,
          quantity: 1,
        },
      ];
    });
    setIsOpen(true);
    return true;
  };

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) =>
      prevCart.filter((item) => (item.cartItemId || item.id) !== cartItemId)
    );
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
