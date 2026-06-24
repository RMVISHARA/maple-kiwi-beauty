"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Mail, Lock, User, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { isOpen, closeAuth, view, setView, login, signup } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const modalRef = useRef();

  // Reset form states when modal opens/closes or switches views
  useEffect(() => {
    setName("");
    setEmail("");
    setPassword("");
    setAgreeTerms(false);
    setErrors({});
    setIsLoading(false);
    setShowSuccess(false);
  }, [isOpen, view]);

  // Handle outside click and Esc key to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !isLoading && !showSuccess) {
        closeAuth();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && isOpen && !isLoading && !showSuccess) {
        closeAuth();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeAuth, isLoading, showSuccess]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    
    // Email check
    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Password check
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Name and Terms checks for sign up
    if (view === "signup") {
      if (!name.trim()) {
        newErrors.name = "Full name is required";
      }
      if (!agreeTerms) {
        newErrors.agree = "You must agree to the Terms & Conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (view === "signin") {
        const loggedUser = await login(email, password);
        setSuccessMessage(`Welcome back, ${loggedUser.name}!`);
        setShowSuccess(true);
        // Wait for success screen animation, then context closes the modal
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } else {
        const registeredUser = await signup(name, email, password);
        setSuccessMessage(`Welcome, ${registeredUser.name}! Your account has been created.`);
        setShowSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    } catch (err) {
      setErrors({ server: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-brand-cream text-brand-espresso rounded-2xl overflow-hidden border border-brand-border shadow-2xl relative p-6 md:p-8 animate-slide-up"
      >
        {/* Close Button */}
        {!isLoading && !showSuccess && (
          <button 
            onClick={closeAuth}
            className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-brand-espresso/5 transition-colors text-brand-espresso/70 hover:text-brand-espresso"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Success Overlay View */}
        {showSuccess ? (
          <div className="py-10 text-center flex flex-col items-center justify-center animate-fade-in">
            <CheckCircle className="w-16 h-16 text-[#4B6F44] mb-4 animate-bounce" />
            <h3 className="font-serif text-2xl font-bold mb-2">Success!</h3>
            <p className="text-sm text-brand-espresso/70 leading-relaxed max-w-xs">
              {successMessage}
            </p>
          </div>
        ) : (
          /* Normal Sign In / Sign Up Forms */
          <div>
            {/* Modal Header Tabs */}
            <div className="flex border-b border-brand-border/60 mb-6 mt-2 relative">
              <button
                onClick={() => !isLoading && setView("signin")}
                className={`flex-1 text-center pb-3 text-sm font-semibold transition-all relative ${
                  view === "signin" 
                    ? "text-brand-rose font-bold" 
                    : "text-brand-espresso/55 hover:text-brand-espresso"
                }`}
              >
                Sign In
                {view === "signin" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-rose animate-fade-in" />
                )}
              </button>
              <button
                onClick={() => !isLoading && setView("signup")}
                className={`flex-1 text-center pb-3 text-sm font-semibold transition-all relative ${
                  view === "signup" 
                    ? "text-brand-rose font-bold" 
                    : "text-brand-espresso/55 hover:text-brand-espresso"
                }`}
              >
                Join Free
                {view === "signup" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-rose animate-fade-in" />
                )}
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.server && (
                <div className="p-3 bg-brand-rose/10 border border-brand-rose/25 text-brand-rose rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.server}</span>
                </div>
              )}

              {/* Full Name Field (Sign Up Only) */}
              {view === "signup" && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-[11px] font-bold uppercase tracking-widest text-brand-espresso/70">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      disabled={isLoading}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-brand-card border ${
                        errors.name ? "border-brand-rose" : "border-brand-border/60"
                      } text-brand-espresso placeholder-brand-espresso/35 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose transition-all`}
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/40" />
                  </div>
                  {errors.name && (
                    <p className="text-[10px] text-brand-rose pl-2 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-brand-espresso/70">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-brand-card border ${
                      errors.email ? "border-brand-rose" : "border-brand-border/60"
                    } text-brand-espresso placeholder-brand-espresso/35 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose transition-all`}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/40" />
                </div>
                {errors.email && (
                  <p className="text-[10px] text-brand-rose pl-2 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="pass" className="text-[11px] font-bold uppercase tracking-widest text-brand-espresso/70">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="pass"
                    type="password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-brand-card border ${
                      errors.password ? "border-brand-rose" : "border-brand-border/60"
                    } text-brand-espresso placeholder-brand-espresso/35 rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-rose focus:border-brand-rose transition-all`}
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-espresso/40" />
                </div>
                {errors.password && (
                  <p className="text-[10px] text-brand-rose pl-2 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
              </div>

              {/* Terms Checkbox (Sign Up Only) */}
              {view === "signup" && (
                <div className="space-y-1.5 pt-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      disabled={isLoading}
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-brand-border text-brand-rose focus:ring-brand-rose focus:ring-0 cursor-pointer"
                    />
                    <span className="text-brand-espresso/75 leading-tight">
                      I agree to the{" "}
                      <a href="#" className="text-brand-rose underline hover:text-brand-rose-hover font-semibold">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-brand-rose underline hover:text-brand-rose-hover font-semibold">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>
                  {errors.agree && (
                    <p className="text-[10px] text-brand-rose pl-2 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.agree}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-rose hover:bg-brand-rose-hover disabled:bg-brand-rose/65 text-brand-cream font-semibold text-sm py-3.5 rounded-full mt-6 flex items-center justify-center gap-2 transition-all shadow hover:shadow-md active:scale-98 cursor-pointer"
              >
                {isLoading ? (
                  /* Loading Spinner */
                  <svg className="animate-spin h-4 w-4 text-brand-cream" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    {view === "signin" ? "Sign In" : "Join Free"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Toggle Text */}
            <p className="text-xs text-center text-brand-espresso/60 mt-6">
              {view === "signin" ? (
                <>
                  New to Maple & Kiwi Beauty?{" "}
                  <button 
                    onClick={() => !isLoading && setView("signup")}
                    className="text-brand-rose font-bold underline hover:text-brand-rose-hover"
                  >
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button 
                    onClick={() => !isLoading && setView("signin")}
                    className="text-brand-rose font-bold underline hover:text-brand-rose-hover"
                  >
                    Sign In instead
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
