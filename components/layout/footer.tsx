"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck,
  RefreshCw,
  Headphones,
  ArrowUp
} from "lucide-react";

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

// Social links with proper icons
const socialLinks = [
  { name: "Facebook", icon: "📘", href: "https://facebook.com", color: "hover:bg-[#1877f2]" },
  { name: "Twitter", icon: "🐦", href: "https://twitter.com", color: "hover:bg-[#1da1f2]" },
  { name: "Instagram", icon: "📷", href: "https://instagram.com", color: "hover:bg-[#e4405f]" },
  { name: "YouTube", icon: "📺", href: "https://youtube.com", color: "hover:bg-[#ff0000]" },
  { name: "LinkedIn", icon: "🔗", href: "https://linkedin.com", color: "hover:bg-[#0077b5]" },
];

const paymentMethods = [
  { name: "Visa", icon: "💳", bg: "bg-blue-600" },
  { name: "Mastercard", icon: "💳", bg: "bg-orange-600" },
  { name: "PayPal", icon: "💰", bg: "bg-blue-500" },
  { name: "Apple Pay", icon: "🍎", bg: "bg-gray-800" },
  { name: "Google Pay", icon: "🤖", bg: "bg-green-600" },
  { name: "American Express", icon: "💳", bg: "bg-blue-400" },
];

const features = [
  { icon: Truck, title: "Free Shipping", description: "On orders over $50" },
  { icon: Shield, title: "Secure Payment", description: "100% secure transactions" },
  { icon: RefreshCw, title: "Easy Returns", description: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", description: "Dedicated customer service" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setEmail("");
      setIsLoading(false);
      setTimeout(() => setIsSubscribed(false), 3000);
    }, 1000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        {/* Newsletter Section - Added back */}
        <div className="max-w-2xl mx-auto mb-12 pb-12 border-b border-gray-800">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-400 mb-4">
              Get the latest updates on new products and upcoming sales
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? "Subscribing..." : isSubscribed ? "Subscribed! ✅" : "Subscribe"}
              </button>
            </form>
          </div>
        </div>

        {/* Top Section - Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-8 border-b border-gray-800">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-400">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  E-Store
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Your one-stop destination for quality products at unbeatable prices. 
              Shop with confidence and enjoy the best online shopping experience.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  123 Commerce St, New York, NY 10001
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <Phone className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-all">
                  <Mail className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  support@estore.com
                </span>
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
                    <span className="text-lg">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links Columns */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
              Shop
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
            </h3>
            <ul className="space-y-2">
              {footerSections.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-blue-500 rounded-full transition-all duration-300" />
                    {item.name}
                    {item.badge && (
                      <span className="text-xs bg-gradient-to-r from-red-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
              Support
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
            </h3>
            <ul className="space-y-2">
              {footerSections.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-blue-500 rounded-full transition-all duration-300" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
              Company
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
            </h3>
            <ul className="space-y-2">
              {footerSections.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-blue-500 rounded-full transition-all duration-300" />
                    {item.name}
                    {item.badge && (
                      <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
              Legal
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
            </h3>
            <ul className="space-y-2">
              {footerSections.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-blue-500 rounded-full transition-all duration-300" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-gray-400">Secure Payment Methods:</span>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className={`${method.bg} px-3 py-1.5 rounded-lg text-xs text-white flex items-center gap-1 font-medium shadow-md`}
                >
                  <span>{method.icon}</span>
                  <span>{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <CreditCard className="w-4 h-4" />
            <span>100% Secure Checkout</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} E-Store. All rights reserved. | 
            <Link href="/privacy" className="hover:text-white transition-colors ml-1">Privacy</Link> | 
            <Link href="/terms" className="hover:text-white transition-colors ml-1">Terms</Link> |
            <Link href="/sitemap" className="hover:text-white transition-colors ml-1">Sitemap</Link>
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40 group animate-bounce"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </footer>
  );
}