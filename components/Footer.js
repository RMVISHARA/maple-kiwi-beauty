"use client";

import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact-us" className="bg-[#2B2421] dark:bg-[#1C1613] text-[#FAF7F2] border-t border-[#EADEC9]/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand Intro */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold">
              Maple & Kiwi <span className="text-brand-rose block text-xs tracking-widest uppercase font-sans font-bold mt-1">Beauty</span>
            </h3>
            <p className="text-xs text-[#FAF7F2]/70 leading-relaxed max-w-sm">
              Bringing authentic, trusted, and highly effective skincare, beauty, and wellness essentials directly from the pristine environments of Canada and New Zealand to Sri Lanka.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://facebook.com/maplekiwibeauty" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#FAF7F2]/5 hover:bg-brand-rose hover:text-[#FAF7F2] rounded-full transition-all text-[#FAF7F2]/60" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="https://instagram.com/maplekiwibeauty" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#FAF7F2]/5 hover:bg-brand-rose hover:text-[#FAF7F2] rounded-full transition-all text-[#FAF7F2]/60" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              <a href="https://wa.me/16047245033" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#FAF7F2]/5 hover:bg-brand-rose hover:text-[#FAF7F2] rounded-full transition-all text-[#FAF7F2]/60" aria-label="WhatsApp">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.673.993 3.326 1.52 5.343 1.521 5.429 0 9.845-4.413 9.848-9.847.002-2.632-1.019-5.107-2.876-6.966C17.049 2.004 14.582.983 11.952.983 6.524.983 2.109 5.396 2.106 10.825c-.001 2.046.547 3.731 1.558 5.419l-.993 3.626 3.976-.976zm11.517-5.748c-.287-.144-1.702-.84-1.965-.936-.264-.096-.456-.144-.648.144-.192.288-.744.936-.912 1.128-.168.192-.336.216-.624.072-1.285-.643-2.224-1.128-3.08-2.602-.224-.384.224-.356.64-.1.385.239.52.545.696.79.168.24.072.48-.048.72-.12.24-.648 1.56-.792 1.908-.144.348-.3.3-.48.216-.18-.084-2.892-1.416-3.096-1.596-.204-.18-.336-.432-.336-.72 0-.288.12-.552.336-.768.216-.216.552-.6.768-.864.216-.264.288-.456.432-.768.144-.312.072-.576-.048-.816-.12-.24-.648-1.56-.888-2.136-.24-.576-.48-.48-.648-.48-.168-.024-.36-.024-.552-.024-.192 0-.504.072-.768.36-.264.288-1.008.984-1.008 2.4 0 1.416 1.032 2.784 1.176 2.976.144.192 2.032 3.102 4.92 4.349.687.297 1.224.474 1.64.607.69.22 1.32.19 1.816.116.553-.082 1.7-.696 1.944-1.37.243-.672.243-1.25.17-1.37-.072-.12-.264-.192-.552-.336z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FAF7F2]/70">
              <li>
                <a href="/#all-products" className="hover:text-brand-rose transition-colors">
                  Shop 5 Essentials
                </a>
              </li>
              <li>
                <a href="/#canada-collection" className="hover:text-brand-rose transition-colors">
                  Canada Collection
                </a>
              </li>
              <li>
                <a href="/#new-zealand-collection" className="hover:text-brand-rose transition-colors">
                  New Zealand Collection
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-brand-rose transition-colors">
                  Frequently Asked Questions (FAQ)
                </a>
              </li>
              <li>
                <a href="/refunds" className="hover:text-brand-rose transition-colors">
                  Refund & Return Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose">
              Delivery & Terms
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FAF7F2]/70">
              <li>
                <span className="block text-[#FAF7F2] font-medium">Free Islandwide Delivery</span>
                Delivery charges are included in the product price for all orders. No additional shipping fees at checkout.
              </li>
              <li>
                <span className="block text-[#FAF7F2] font-medium">100% Authentic Imports</span>
                Directly sourced from official brands in Canada & NZ.
              </li>
              <li>
                <span className="block text-[#FAF7F2] font-medium">Payment Options</span>
                Bank Transfer option.
              </li>
            </ul>
          </div>

          {/* Column 4: Contact info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-rose">
              Get In Touch
            </h4>
            <ul className="space-y-3.5 text-xs text-[#FAF7F2]/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-rose shrink-0" />
                <span>Colombo, Sri Lanka (Islandwide Delivery)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-rose shrink-0" />
                <a href="tel:+16047245033" className="hover:text-brand-rose transition-colors">
                  +1 (604) 724-5033 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-rose shrink-0" />
                <a href="mailto:infomaplekiwibeauty@gmail.com" className="hover:text-brand-rose transition-colors">
                  infomaplekiwibeauty@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-[#FAF7F2]/10 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#FAF7F2]/50">
          <p>
            © {new Date().getFullYear()} Maple & Kiwi Beauty. All Rights Reserved. Sourced from Canada & New Zealand.
          </p>
          <div className="flex gap-4">
            <a href="/privacy" className="hover:text-[#FAF7F2] transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-[#FAF7F2] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
