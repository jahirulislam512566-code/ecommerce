// components/FurnitureStore.tsx
import React, { useState, useRef } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Room {
  id: number;
  name: string;
  image: string;
  price: number;
}

const FurnitureStore: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const categories: Category[] = [
    { id: 'living', name: 'Living Room', icon: '🛋️' },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️' },
    { id: 'dining', name: 'Dining', icon: '🍽️' },
    { id: 'office', name: 'Office', icon: '💼' },
  ];

  const rooms: Room[] = [
    { id: 1, name: "Modern Sofa", image: "/api/placeholder/400/300", price: 899 },
    { id: 2, name: "Dining Table Set", image: "/api/placeholder/400/300", price: 1299 },
    { id: 3, name: "Office Desk", image: "/api/placeholder/400/300", price: 599 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero with Video Background */}
      <div className="relative h-[70vh] overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay 
          loop 
          muted 
          className="absolute w-full h-full object-cover"
          poster="/api/placeholder/1920/1080"
        >
          <source src="/furniture-showcase.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4">Design Your Space</h1>
            <p className="text-xl mb-8">Contemporary furniture for modern living</p>
            <button className="bg-amber-600 px-8 py-3 rounded-full hover:bg-amber-700 transition">
              Explore Collection
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2 rounded-full transition ${
                activeCategory === 'all' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-2 rounded-full transition flex items-center gap-2 ${
                  activeCategory === cat.id 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">View in Your Room</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rooms.map(room => (
            <div 
              key={room.id}
              className="group cursor-pointer"
              onClick={() => setSelectedRoom(room.id)}
            >
              <div className="relative overflow-hidden rounded-xl">
                <img 
                  src={room.image} 
                  alt={room.name}
                  className="w-full h-64 object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button className="bg-white text-black px-6 py-2 rounded-full">
                    View in 3D
                  </button>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-semibold text-lg">{room.name}</h3>
                <p className="text-amber-600 font-bold mt-1">${room.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AR Modal (simplified) */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl w-full mx-4">
            <button 
              onClick={() => setSelectedRoom(null)}
              className="absolute -top-12 right-0 text-white text-2xl"
            >
              ✕
            </button>
            <div className="bg-gray-800 rounded-xl p-8 text-white text-center">
              <h3 className="text-2xl mb-4">AR Experience</h3>
              <p>Point your camera to see this furniture in your space</p>
              {/* AR implementation would go here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FurnitureStore;