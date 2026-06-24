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

  const login = async (email, password) => {
    // Simulated API latency
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    // Create a mock user object based on email
    const username = email.split("@")[0];
    const capitalizedName = username.charAt(0).toUpperCase() + username.slice(1);
    
    const mockUser = {
      name: capitalizedName,
      email: email,
    };
    
    setUser(mockUser);
    localStorage.setItem("maple_kiwi_user", JSON.stringify(mockUser));
    setIsOpen(false);
    return mockUser;
  };

  const signup = async (name, email, password) => {
    // Simulated API latency
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    const mockUser = {
      name: name,
      email: email,
    };
    
    setUser(mockUser);
    localStorage.setItem("maple_kiwi_user", JSON.stringify(mockUser));
    setIsOpen(false);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("maple_kiwi_user");
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
        login,
        signup,
        logout,
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
