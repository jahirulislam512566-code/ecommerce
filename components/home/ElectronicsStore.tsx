// components/ElectronicsStore.tsx
import React, { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  rating: number;
  specs: string[];
  inStock: boolean;
}

const ElectronicsStore: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  const products: Product[] = [
    { id: 1, name: "UltraBook Pro", price: 1299, rating: 4.8, specs: ["16GB RAM", "512GB SSD"], inStock: true },
    { id: 2, name: "Wireless Headphones", price: 299, rating: 4.6, specs: ["ANC", "30hr Battery"], inStock: true },
    { id: 3, name: "Smart Watch", price: 399, rating: 4.7, specs: ["GPS", "Heart Monitor"], inStock: false },
  ];

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">TechHub</h1>
            
            <div className="flex items-center space-x-6">
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              <div className="relative">
                <button className="relative">
                  🛒
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-5xl font-bold mb-4">Summer Tech Sale</h2>
            <p className="text-xl mb-8">Up to 40% off on latest gadgets</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Shop Collection
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">{product.name}</h3>
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400">★</span>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">{product.rating}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {product.specs.map((spec, idx) => (
                      <span key={idx} className="inline-block bg-gray-100 dark:bg-gray-700 text-sm px-2 py-1 rounded mr-2">
                        {spec}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${product.price}</span>
                    <button 
                      disabled={!product.inStock}
                      className={`px-4 py-2 rounded-lg ${
                        product.inStock 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                      onClick={() => product.inStock && setCartCount(c => c + 1)}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronicsStore;