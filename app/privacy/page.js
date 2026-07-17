"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-brand-cream text-brand-espresso">
      <Header />

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-rose hover:underline mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>

        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-brand-espresso/60 mb-12">
          Last Updated: July 13, 2026. Your privacy is important to us. Here is how we handle and protect your personal information.
        </p>

        <div className="space-y-8 text-xs md:text-sm leading-relaxed text-brand-espresso/80">
          
          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">1. Information We Collect</h3>
            <p>
              When you purchase products or register on our website, we collect personal details that you provide directly to us:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Identity Data</strong>: Name, phone number, and delivery address.</li>
              <li><strong>Contact Data</strong>: Email address.</li>
              <li><strong>Order Info</strong>: Products purchased, order amounts, and transaction history.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">2. How We Use Your Data</h3>
            <p>
              We process your personal information to fulfill our business services, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Processing and delivering your orders.</li>
              <li>Calculating accurate location-based shipping fees.</li>
              <li>Communicating with you regarding your order via WhatsApp or Email.</li>
              <li>Managing account registration and OTP security codes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">3. Third-Party Sharing</h3>
            <p>
              We only share your delivery information (name, address, and phone number) with our <strong>trusted island-wide courier partners</strong> to ensure your products arrive at your doorstep. We never sell, lease, or distribute your personal data to advertisers or third-party brokers.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">4. Security Measures</h3>
            <p>
              We use secure, password-protected database instances and parameterized querying systems to protect your account information. We do not store sensitive payment details (like bank credentials or credit card numbers) on our servers, as payments are settled securely off-site.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">5. Cookies</h3>
            <p>
              We use standard browser local storage and cookies to remember items in your shopping bag and manage authenticated user sessions. You can disable cookies in your browser settings, though doing so may prevent certain site features (such as keeping items in your cart) from working correctly.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">6. Contact Us</h3>
            <p>
              If you have any questions, concerns, or data deletion requests, please contact us at <strong>info@maplekiwibeauty.lk</strong>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
