"use client";

import Link from "next/link";
import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  Truck,
  RefreshCw,
  ShoppingBag,
  Send,
  CheckCircle,
  Smartphone,
  Award,
  Headphones,
  Clock,
  ArrowUp,
  Heart,
  ThumbsUp,
  Globe,
  LucideIcon
} from "lucide-react";

const footerSections = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "New Arrivals", href: "/products?sort=newest", badge: "New" },
    { name: "Best Sellers", href: "/products?sort=popularity_desc", badge: "Trending" },
    { name: "Sale", href: "/products?sale=true", badge: "Hot" },
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

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com", emoji: "📘", color: "hover:bg-[#1877f2]" },
  { name: "Twitter", href: "https://twitter.com", emoji: "🐦", color: "hover:bg-[#1da1f2]" },
  { name: "Instagram", href: "https://instagram.com", emoji: "📷", color: "hover:bg-[#e4405f]" },
  { name: "YouTube", href: "https://youtube.com", emoji: "📺", color: "hover:bg-[#ff0000]" },
  { name: "LinkedIn", href: "https://linkedin.com", emoji: "🔗", color: "hover:bg-[#0077b5]" },
];

const paymentMethods = [
  { name: "Visa", icon: "💳", color: "bg-blue-600" },
  { name: "Mastercard", icon: "💳", color: "bg-orange-600" },
  { name: "PayPal", icon: "💰", color: "bg-blue-500" },
  { name: "Apple Pay", icon: "🍎", color: "bg-gray-800" },
  { name: "Google Pay", icon: "🤖", color: "bg-green-600" },
  { name: "American Express", icon: "💳", color: "bg-blue-400" },
];

interface AwardItem {
  name: string;
  icon: LucideIcon;
}

const awards: AwardItem[] = [
  { name: "Best E-commerce 2024", icon: Award },
  { name: "Customer Choice Award", icon: ThumbsUp },
  { name: "Fast Delivery Award", icon: Truck },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
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
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Top Features Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
            <div className="flex items-center gap-2 text-white">
              <Truck className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">Free Shipping</p>
                <p className="text-xs opacity-90">On orders $50+</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">Secure Payment</p>
                <p className="text-xs opacity-90">100% Protected</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <RefreshCw className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">Easy Returns</p>
                <p className="text-xs opacity-90">30-Day Guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Headphones className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">24/7 Support</p>
                <p className="text-xs opacity-90">Live Chat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                E-Store
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Your one-stop destination for quality products at unbeatable prices. 
              Shop with confidence and enjoy the best online shopping experience.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-gray-400">123 Commerce St, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Phone className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
                <span className="text-gray-400">support@estore.com</span>
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
                    className={`w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${social.color}`}
                    aria-label={social.name}
                  >
                    <span className="text-lg">{social.emoji}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links Columns */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
              Shop
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-blue-500 rounded-full mt-1" />
            </h3>
            <ul className="space-y-2">
              {footerSections.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-blue-500 rounded-full transition-all" />
                    {item.name}
                    {item.badge && (
                      <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
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
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-blue-500 rounded-full mt-1" />
            </h3>
            <ul className="space-y-2">
              {footerSections.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-blue-500 rounded-full transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4 relative inline-block">
              Company
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-blue-500 rounded-full mt-1" />
            </h3>
            <ul className="space-y-2">
              {footerSections.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-blue-500 rounded-full transition-all" />
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
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-blue-500 rounded-full mt-1" />
            </h3>
            <ul className="space-y-2">
              {footerSections.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-1 h-1 bg-blue-500 rounded-full transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter & App Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-800">
          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Subscribe to Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get 10% off your first order and exclusive deals straight to your inbox
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 pl-11 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  "Subscribing..."
                ) : isSubscribed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    Subscribe
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              No spam, unsubscribe at any time.
            </p>
          </div>

          {/* Mobile App */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Download Our App</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get the best shopping experience on your phone
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors group">
                <Globe className="w-6 h-6 text-gray-400 group-hover:text-white" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Download on the</p>
                  <p className="text-sm font-semibold text-white">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors group">
                <Smartphone className="w-6 h-6 text-gray-400 group-hover:text-white" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Get it on</p>
                  <p className="text-sm font-semibold text-white">Google Play</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Awards & Certifications */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-gray-800">
          {awards.map((award) => {
            const Icon = award.icon;
            return (
              <div key={award.name} className="flex items-center gap-2 text-gray-400">
                <Icon className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">{award.name}</span>
              </div>
            );
          })}
        </div>

        {/* Payment Methods & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-gray-400">Secure Payment Methods:</span>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className={`${method.color} px-3 py-1 rounded-lg text-xs text-white flex items-center gap-1`}
                >
                  <span>{method.icon}</span>
                  <span>{method.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>24/7 Customer Support</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} E-Store. All rights reserved. | 
            <Link href="/privacy" className="hover:text-white transition-colors ml-1">Privacy</Link> | 
            <Link href="/terms" className="hover:text-white transition-colors ml-1">Terms</Link>
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Made with <Heart className="w-3 h-3 inline text-red-500" /> for the best shopping experience
          </p>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-40 hidden md:block group"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform" />
      </button>
    </footer>
  );
}