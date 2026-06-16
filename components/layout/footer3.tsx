import React from 'react';
import Link from 'next/link';
import { Twitter, Instagram, FacebookIcon, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">Shopora</span>
            </div>
            <p className="text-sm leading-relaxed">
              Premium shopping experience with quality products and exceptional service.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-5">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/deals" className="hover:text-white transition-colors">Special Deals</Link></li>
              <li><Link href="/new" className="hover:text-white transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-5">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-5">Stay Updated</h3>
            <p className="text-sm mb-4">Subscribe to get special offers and updates.</p>
            
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-900 border border-gray-800 text-sm px-4 py-3 rounded-l-2xl focus:outline-none focus:border-violet-600 flex-1"
              />
              <button className="bg-violet-600 hover:bg-violet-700 transition-colors text-white px-6 rounded-r-2xl text-sm font-medium">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs">&copy; {new Date().getFullYear()} Shopora. All rights reserved.</p>
          
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              <Twitter size={20} />
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Instagram size={20} />
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              {/* FIXED: Changed from <Facebook /> to <FacebookIcon /> to match your import */}
              <FacebookIcon size={20} />
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              <Youtube size={20} />
            </Link>
          </div>

          <div className="flex gap-6 text-xs">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;