"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldAlert, PackageCheck, RotateCcw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RefundPolicyPage() {
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
          Refund & Return Policy
        </h1>
        <p className="text-sm text-brand-espresso/60 mb-12">
          Last Updated: July 13, 2026. Please read our guidelines regarding product returns, damages, and replacements.
        </p>

        <div className="space-y-10 text-xs md:text-sm leading-relaxed text-brand-espresso/80">
          
          {/* Card Section: Cosmetics Hygiene Notice */}
          <div className="bg-brand-rose/5 border border-brand-rose/20 rounded-2xl p-6 flex gap-4 items-start">
            <ShieldAlert className="w-6 h-6 text-brand-rose shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-brand-espresso mb-1">Important Hygiene Notice</h4>
              <p className="text-xs text-brand-espresso/70">
                Due to the sanitary nature of cosmetic and skincare items, we cannot accept returns, refunds, or exchanges for products that have been opened, swatched, or used. Thank you for your cooperation in maintaining our strict safety standards.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-brand-rose" /> 1. Returns & Exchanges
            </h3>
            <p>
              We only accept returns or exchanges under the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The product was received in a damaged or defective condition.</li>
              <li>The incorrect product was sent to you (e.g. wrong size or wrong item).</li>
            </ul>
            <p>
              In such cases, please notify us via WhatsApp at <strong>+1 (604) 724-5033</strong> or email <strong>info@maplekiwibeauty.lk</strong> within <strong>24 hours of delivery</strong>. You must include photographic or video proof of the damaged or incorrect packaging.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-brand-rose" /> 2. Refund Processing
            </h3>
            <p>
              Once your damage claim is verified and approved by our support team, we will:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Arrange a free courier pickup for the incorrect/damaged item.</li>
              <li>Immediately ship out the correct replacement item at no additional charge to you.</li>
              <li>If the item is out of stock, we will issue a full refund of the product price and shipping fees directly to your bank account via bank transfer. Refund processing typically takes 2-3 business days.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">3. Cancellations</h3>
            <p>
              Orders can be cancelled before they have been dispatched for delivery. Once an order is handed over to our island-wide courier partners (typically within 12-24 hours of your order via WhatsApp), it cannot be cancelled or recalled.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-brand-espresso">4. Questions & Support</h3>
            <p>
              If you have any questions or require assistance with an order, please do not hesitate to get in touch with our team:
            </p>
            <ul className="list-none space-y-1 pl-0">
              <li>📞 WhatsApp: <strong>+1 (604) 724-5033</strong></li>
              <li>✉️ Email: <strong>info@maplekiwibeauty.lk</strong></li>
            </ul>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
