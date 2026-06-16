// components/FashionStore.tsx
import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const FashionStore: React.FC = () => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  
  const featuredProducts: Product[] = [
    { id: 1, name: "Minimalist Jacket", price: 89.99, image: "/api/placeholder/400/500", category: "Outerwear" },
    { id: 2, name: "Silk Blouse", price: 59.99, image: "/api/placeholder/400/500", category: "Tops" },
    { id: 3, name: "Tailored Trousers", price: 79.99, image: "/api/placeholder/400/500", category: "Bottoms" },
    { id: 4, name: "Leather Boots", price: 129.99, image: "/api/placeholder/400/500", category: "Footwear" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative h-screen bg-gradient-to-r from-gray-900 to-gray-700">
        <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-light tracking-wider text-white">LUXE STUDIO</h1>
          <div className="space-x-8">
            {['Shop', 'Collection', 'Journal', 'About'].map(item => (
              <button key={item} className="text-white hover:text-gray-300 transition">
                {item}
              </button>
            ))}
          </div>
        </nav>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-6xl font-light mb-4">Timeless Elegance</h2>
            <p className="text-xl mb-8">Discover our new winter collection</p>
            <button className="border-2 border-white px-8 py-3 hover:bg-white hover:text-black transition">
              SHOP NOW
            </button>
          </div>
        </div>
      </header>

      {/* Featured Products */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <h3 className="text-3xl font-light text-center mb-12">Featured Selections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map(product => (
            <div 
              key={product.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="overflow-hidden bg-gray-100">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">{product.category}</p>
                <h4 className="font-medium mt-1">{product.name}</h4>
                <p className="text-gray-600 mt-1">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FashionStore;