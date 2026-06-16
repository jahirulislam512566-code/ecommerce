import React, { useState } from 'react';
import Link from 'next/link';
import { X,  Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setEmail('');
      setIsLoading(false);
      setTimeout(() => setIsSubscribed(false), 3000);
    }, 1000);
  };

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">Shopora</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Premium shopping experience with quality products and exceptional service.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-500" />
                <span>123 Commerce St, NYC</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-violet-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-violet-500" />
                <span>support@shopora.com</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-lg">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shop" className="hover:text-white transition-colors hover:translate-x-1 inline-block">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Categories</Link></li>
              <li><Link href="/deals" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Special Deals</Link></li>
              <li><Link href="/new" className="hover:text-white transition-colors hover:translate-x-1 inline-block">New Arrivals</Link></li>
              <li><Link href="/sale" className="hover:text-white transition-colors hover:translate-x-1 inline-block text-red-400">Sale</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-lg">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Returns</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors hover:translate-x-1 inline-block">FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition-colors hover:translate-x-1 inline-block">Track Order</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-lg">Stay Updated</h3>
            <p className="text-sm mb-4">Subscribe to get special offers and updates.</p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="bg-gray-900 border border-gray-800 text-sm px-4 py-3 rounded-l-2xl sm:rounded-l-2xl sm:rounded-r-none focus:outline-none focus:border-violet-600 flex-1"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-violet-600 hover:bg-violet-700 transition-colors text-white px-6 py-3 rounded-r-2xl sm:rounded-r-2xl sm:rounded-l-none text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : isSubscribed ? '✓ Joined' : 'Join'}
              </button>
            </form>
            
            {isSubscribed && (
              <p className="text-green-400 text-sm mt-2 animate-pulse">
                ✅ Successfully subscribed!
              </p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs">&copy; {new Date().getFullYear()} Shopora. All rights reserved.</p>
          
          <div className="flex gap-4">
            <Link 
              href="#" 
              className="p-2 rounded-full bg-gray-900 hover:bg-violet-600 transition-colors hover:scale-110"
              aria-label="Twitter (X)"
            >
              <X size={18} />
            </Link>
            <Link 
              href="#" 
              className="p-2 rounded-full bg-gray-900 hover:bg-violet-600 transition-colors hover:scale-110"
              aria-label="Instagram"
            >
          <span> Instragram Icon</span>
            </Link>
            <Link 
              href="#" 
              className="p-2 rounded-full bg-gray-900 hover:bg-violet-600 transition-colors hover:scale-110"
              aria-label="Facebook"
            >
             <span>FB Icon</span>
            </Link>
            <Link 
              href="#" 
              className="p-2 rounded-full bg-gray-900 hover:bg-violet-600 transition-colors hover:scale-110"
              aria-label="YouTube"
            >
            
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