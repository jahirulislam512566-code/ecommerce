// components/SustainableMarketplace.tsx
import React, { useState, useMemo } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  carbonFootprint: number;
  recycledMaterial: number;
  image: string;
  seller: string;
}

const SustainableMarketplace: React.FC = () => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<'price' | 'carbon' | 'recycled'>('carbon');
  const [searchTerm, setSearchTerm] = useState('');

  const products: Product[] = [
    { id: 1, name: "Bamboo Toothbrush", price: 12.99, carbonFootprint: 0.5, recycledMaterial: 100, image: "/api/placeholder/300/300", seller: "EcoLife" },
    { id: 2, name: "Recycled Backpack", price: 49.99, carbonFootprint: 2.3, recycledMaterial: 85, image: "/api/placeholder/300/300", seller: "GreenStyle" },
    { id: 3, name: "Solar Charger", price: 89.99, carbonFootprint: 1.8, recycledMaterial: 40, image: "/api/placeholder/300/300", seller: "SunPower" },
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'price') return a.price - b.price;
        if (sortBy === 'carbon') return a.carbonFootprint - b.carbonFootprint;
        return b.recycledMaterial - a.recycledMaterial;
      });
  }, [products, priceRange, searchTerm, sortBy]);

  const totalSaved = useMemo(() => {
    return products.reduce((sum, p) => sum + p.carbonFootprint, 0);
  }, [products]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Eco Banner */}
      <div className="bg-green-800 text-white py-2 text-center text-sm">
        🌍 We've saved {totalSaved}kg of CO₂ emissions this month
      </div>

      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-green-700">EcoMarket ♻️</h1>
          
          <div className="flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search sustainable products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Impact Score: 98</span>
            <button className="bg-green-600 text-white px-4 py-2 rounded-full text-sm">
              Your Impact
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Sort by</h3>
              <div className="space-y-2">
                {[
                  { value: 'carbon', label: '🌱 Lowest Carbon' },
                  { value: 'recycled', label: '♻️ Most Recycled' },
                  { value: 'price', label: '💰 Price' }
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={sortBy === option.value}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-green-600"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {product.seller}</p>
                    
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-green-700">${product.price}</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">♻️ {product.recycledMaterial}%</span>
                        <span className="text-blue-600">🌱 {product.carbonFootprint}kg</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                      Shop Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SustainableMarketplace;