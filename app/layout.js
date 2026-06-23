import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "Maple & Kiwi Beauty | Premium Skincare from Canada & New Zealand",
  description:
    "Maple & Kiwi Beauty brings high quality skincare, beauty, and wellness products from Canada and New Zealand directly to Sri Lanka. Authentic, trusted, and effective beauty solutions.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-espresso font-sans">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
