"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-brand-espresso/60 mb-12">
          Last Updated: July 13, 2026. Welcome to Maple & Kiwi Beauty. Please read these terms carefully before using our store.
        </p>

        <div className="space-y-8 text-xs md:text-sm leading-relaxed text-brand-espresso/80">
          
          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">1. Agreement to Terms</h3>
            <p>
              By accessing and placing orders through our website, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">2. Sourcing & Authentication</h3>
            <p>
              All skincare and wellness items in our catalog are directly imported from brand suppliers in Canada and New Zealand. We guarantee the absolute purity and authenticity of every product sold on our platform.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">3. WhatsApp Order Process & Checkout</h3>
            <p>
              When checkout is clicked, your shopping bag payload is formatted into a prefilled WhatsApp message. Your purchase is processed and finalized by communicating directly with our order dispatch team on WhatsApp.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">4. Pricing & Delivery Charges</h3>
            <p>
              Product prices are listed in Sri Lankan Rupees (LKR). Delivery charges are calculated based on your destination district at checkout. We reserve the right to correct pricing errors or update rates in our system at any time without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">5. Payment Conditions</h3>
            <p>
              Orders are settled either via bank transfer (proof of payment must be sent to us on WhatsApp before shipping) or via Cash on Delivery (COD) at the moment of delivery by the courier partner.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">6. Limitation of Liability</h3>
            <p>
              Skincare results vary based on skin type and environmental exposure. We are not responsible for skin sensitivity or allergic reactions to ingredients. We advise reading all ingredient labels and performing patch tests before incorporating new products into your routine.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">7. Governing Law</h3>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of Sri Lanka.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">8. Contact Information</h3>
            <p>
              For legal or terms inquiries, please contact our support team at <strong>info@maplekiwibeauty.lk</strong>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
