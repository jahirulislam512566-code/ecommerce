// components/SportsStore.tsx
import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  badge?: 'New' | 'Sale' | 'Trending';
  inStock: boolean;
}

const SportsStore: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    // Show newsletter modal after 3 seconds
    const newsletterTimer = setTimeout(() => setShowNewsletter(true), 3000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(newsletterTimer);
    };
  }, []);

  const products: Product[] = [
    { id: 1, name: "Pro Running Shoes", price: 129.99, originalPrice: 159.99, discount: 18, badge: 'Sale', inStock: true },
    { id: 2, name: "Performance Jacket", price: 89.99, badge: 'New', inStock: true },
    { id: 3, name: "Training Backpack", price: 49.99, inStock: false },
    { id: 4, name: "Yoga Mat Pro", price: 39.99, badge: 'Trending', inStock: true },
  ];

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Carousel */}
      <div className="relative h-96 bg-gradient-to-r from-red-600 to-orange-600 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
              Gear Up for Adventure
            </h1>
            <p className="text-xl mb-8">Free shipping on orders over $50</p>
            <button className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transition">
              Shop Now →
            </button>
          </div>
        </div>
      </div>

      {/* Size Selector */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <h3 className="font-semibold mb-2">Filter by Size</h3>
          <div className="flex gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 rounded-full border-2 transition ${
                  selectedSize === size
                    ? 'border-red-600 bg-red-50 text-red-600'
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden group">
              <div className="relative">
                <img 
                  src={`/api/placeholder/300/300`} 
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                />
                {product.badge && (
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white
                    ${product.badge === 'New' ? 'bg-blue-500' : 
                      product.badge === 'Sale' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {product.badge}
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition"
                >
                  {wishlist.includes(product.id) ? '❤️' : '🤍'}
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold text-red-600">${product.price}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-gray-400 line-through">${product.originalPrice}</span>
                      <span className="text-green-600 text-sm font-semibold">-{product.discount}%</span>
                    </>
                  )}
                </div>
                
                <button
                  disabled={!product.inStock}
                  className={`w-full py-2 rounded-lg font-semibold transition ${
                    product.inStock
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Modal */}
      {showNewsletter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 relative animate-bounce-in">
            <button 
              onClick={() => setShowNewsletter(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="text-center">
              <div className="text-5xl mb-4">🏃‍♂️</div>
              <h3 className="text-2xl font-bold mb-2">Get 15% Off!</h3>
              <p className="text-gray-600 mb-6">Subscribe for exclusive offers and new arrivals</p>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
              />
              <button className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.9); }
          70% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SportsStore;