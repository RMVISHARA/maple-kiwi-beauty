"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Are your products 100% authentic?",
      answer: "Yes, absolutely. We source every single product directly from official brand laboratories and verified suppliers in Canada and New Zealand. We have a zero-counterfeit guarantee and maintain temperature-controlled shipping to preserve formula stability.",
    },
    {
      question: "How long does delivery take?",
      answer: "For the Western Province, delivery typically takes 2-3 business days. For all other districts across Sri Lanka, delivery takes 3-5 business days. You will receive a notification with tracking/delivery status updates.",
    },
    {
      question: "What are your delivery charges?",
      answer: "Delivery is calculated based on your district at checkout. Rates start at Rs. 350 for Colombo Metro, Rs. 400 for the Western Province, Rs. 450 for main cities, and up to Rs. 650 for very remote areas.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We support Bank Transfers and Cash on Delivery (COD) for your convenience. You can select your preferred method during checkout when completing your order via WhatsApp.",
    },
    {
      question: "Can I return a product if I change my mind?",
      answer: "Due to hygiene and safety reasons for cosmetic products, we cannot accept returns or exchanges if you change your mind. However, if you receive a damaged or incorrect product, please notify us within 24 hours of delivery with photographic proof, and we will issue a replacement or refund immediately.",
    },
    {
      question: "Are these products suitable for Sri Lankan weather?",
      answer: "Yes, we handpick clinical and botanical formulas specifically suitable for skin exposed to humid, tropical environments. For example, our selected lightweight serums and hydrating gels absorb quickly without leaving a greasy residue.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-brand-espresso/60 mb-12">
          Everything you need to know about sourcing, shipping, payment methods, and policies.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-brand-card border border-brand-border/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left font-serif font-bold text-sm md:text-base text-brand-espresso hover:text-brand-rose transition-colors focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-brand-rose transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? "max-h-[200px] border-t border-brand-border/40" : "max-h-0"
                  }`}
                >
                  <p className="p-6 text-xs md:text-sm text-brand-espresso/75 leading-relaxed bg-brand-cream/10">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
