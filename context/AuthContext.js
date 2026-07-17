"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("signin"); // 'signin' or 'signup'
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("maple_kiwi_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user session data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist the session (user + JWT) returned by the backend.
  const persistSession = ({ user: authedUser, token }) => {
    setUser(authedUser);
    localStorage.setItem("maple_kiwi_user", JSON.stringify(authedUser));
    if (token) localStorage.setItem("maple_kiwi_token", token);
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem("maple_kiwi_user", JSON.stringify(next));
      return next;
    });
  };

  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Unable to sign in");
    }
    persistSession(data);
    return data.user;
  };

  const sendSignupOtp = async (name, email, password) => {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Unable to send verification code");
    }
    return data;
  };

  const verifySignupOtp = async (email, otp) => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Unable to verify code");
    }
    persistSession(data);
    return data.user;
  };

  // Keep each user's basket in localStorage so it restores on the next login.
  const logout = () => {
    setUser(null);
    localStorage.removeItem("maple_kiwi_user");
    localStorage.removeItem("maple_kiwi_token");
  };

  const openAuth = (initialView = "signin") => {
    setView(initialView);
    setIsOpen(true);
  };

  const closeAuth = () => {
    setIsOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isOpen,
        view,
        setView,
        isLoaded,
        login,
        sendSignupOtp,
        verifySignupOtp,
        logout,
        updateUser,
        openAuth,
        closeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
