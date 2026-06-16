"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck,
  RefreshCw,
  Heart,
  Package,
  HelpCircle,
  ShoppingBag,
  Star,
  Send,
  CheckCircle,
  ArrowUp
} from "lucide-react";

// Using emojis for social media (no import issues)
const socialLinks = [
  { name: "Facebook", emoji: "📘", href: "https://facebook.com", color: "hover:bg-[#1877f2]" },
  { name: "Twitter", emoji: "🐦", href: "https://twitter.com", color: "hover:bg-[#1da1f2]" },
  { name: "Instagram", emoji: "📷", href: "https://instagram.com", color: "hover:bg-[#e4405f]" },
  { name: "YouTube", emoji: "📺", href: "https://youtube.com", color: "hover:bg-[#ff0000]" },
];

const footerSections = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "New Arrivals", href: "/products?sort=newest", badge: "New" },
    { name: "Best Sellers", href: "/products?sort=popularity_desc", badge: "Trending" },
    { name: "Sale", href: "/products?sort=price_asc", badge: "Hot" },
    { name: "Featured", href: "/products?featured=true" },
    { name: "Clearance", href: "/products?clearance=true" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Track Order", href: "/track-order" },
    { name: "Returns & Refunds", href: "/returns" },
    { name: "Shipping Information", href: "/shipping" },
    { name: "FAQs", href: "/faqs" },
    { name: "Size Guide", href: "/size-guide" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Careers", href: "/careers", badge: "We're hiring" },
    { name: "Blog", href: "/blog" },
    { name: "Affiliates", href: "/affiliates" },
    { name: "Press", href: "/press" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Returns Policy", href: "/returns-policy" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Accessibility", href: "/accessibility" },
    { name: "GDPR", href: "/gdpr" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        {/* Top Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-8 border-b border-gray-800">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Free Shipping</h4>
              <p className="text-xs text-gray-400">On orders over $50</p>
            </div>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Secure Payment</h4>
              <p className="text-xs text-gray-400">100% secure</p>
            </div>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <RefreshCw className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Easy Returns</h4>
              <p className="text-xs text-gray-400">30-day policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <HelpCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">24/7 Support</h4>
              <p className="text-xs text-gray-400">Live chat</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  E-Store
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Your one-stop destination for quality products at unbeatable prices.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
                <span>123 Commerce St, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <span>support@estore.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Follow Us</h4>
              <div className="flex gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 ${social.color}`}
                    aria-label={social.name}
                  >
                    <span className="text-lg">{social.emoji}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerSections.shop.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.name}
                    {item.badge && (
                      <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full ml-2">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2">
              {footerSections.support.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footerSections.company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.name}
                    {item.badge && (
                      <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full ml-2">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerSections.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-gray-400">Payment Methods:</span>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-600 px-3 py-1.5 rounded-lg text-xs text-white">💳 Visa</span>
              <span className="bg-orange-600 px-3 py-1.5 rounded-lg text-xs text-white">💳 Mastercard</span>
              <span className="bg-blue-500 px-3 py-1.5 rounded-lg text-xs text-white">💰 PayPal</span>
              <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-xs text-white">🍎 Apple Pay</span>
              <span className="bg-green-600 px-3 py-1.5 rounded-lg text-xs text-white">🤖 Google Pay</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CreditCard className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} E-Store. All rights reserved. | 
            <Link href="/privacy" className="hover:text-white transition-colors ml-1">Privacy</Link> | 
            <Link href="/terms" className="hover:text-white transition-colors ml-1">Terms</Link>
          </p>
          <p className="text-xs text-gray-600 mt-2 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 inline" /> for you
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-40"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </footer>
  );
}