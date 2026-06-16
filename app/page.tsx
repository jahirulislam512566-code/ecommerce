"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw, 
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Gift,
  Zap,
  
} from "lucide-react";
import { ProductCard } from "@/components/products/product-card";

type Product = {
  id: string | number;
  [key: string]: unknown;
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSliderRef = useRef(null);

   const [email, setEmail] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    
    // Process the subscription data here (e.g., API call)
    console.log("Subscribing email:", email);
    
    // Reset form field after submission
    setEmail("");
  };

  useEffect(() => {
    async function loadProducts() {
      try {
        const [featuredRes, trendingRes, newRes] = await Promise.all([
          fetch("/api/products?featured=true&limit=8"),
          fetch("/api/products?sort=popularity_desc&limit=8"),
          fetch("/api/products?sort=newest&limit=8"),
        ]);

        const featuredData = await featuredRes.json();
        const trendingData = await trendingRes.json();
        const newData = await newRes.json();

        setFeaturedProducts(featuredData.data?.items || featuredData.products || []);
        setTrendingProducts(trendingData.data?.items || trendingData.products || []);
        setNewArrivals(newData.data?.items || newData.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const heroSlides = [
    {
      title: "Summer Sale Extravaganza",
      subtitle: "Up to 50% Off on Selected Items",
      description: "Discover amazing deals on electronics, fashion, and more. Limited time offer!",
      cta: "Shop Now",
      ctaLink: "/products?sale=true",
      image: "/hero/summer-sale.jpg",
      bgGradient: "from-orange-500 to-red-600",
      badge: "Limited Time",
    },
    {
      title: "New Arrivals 2024",
      subtitle: "Latest Collection Just Dropped",
      description: "Be the first to shop our newest products. Fresh styles, unbeatable prices.",
      cta: "Explore Now",
      ctaLink: "/products?sort=newest",
      image: "/hero/new-arrivals.jpg",
      bgGradient: "from-blue-600 to-purple-600",
      badge: "Just In",
    },
    {
      title: "Free Shipping Worldwide",
      subtitle: "On Orders Over $50",
      description: "Shop with confidence. Fast delivery, easy returns, and secure payment.",
      cta: "Start Shopping",
      ctaLink: "/products",
      image: "/hero/free-shipping.jpg",
      bgGradient: "from-green-500 to-teal-600",
      badge: "Exclusive",
    },
  ];

  const categories = [
    { name: "Electronics", slug: "electronics", count: 245, icon: "💻", color: "from-blue-500 to-cyan-500" },
    { name: "Fashion", slug: "clothing", count: 532, icon: "👕", color: "from-pink-500 to-rose-500" },
    { name: "Home & Living", slug: "home-living", count: 189, icon: "🏠", color: "from-emerald-500 to-teal-500" },
    { name: "Sports", slug: "sports", count: 156, icon: "⚽", color: "from-orange-500 to-red-500" },
    { name: "Books", slug: "books", count: 423, icon: "📚", color: "from-purple-500 to-indigo-500" },
    { name: "Toys", slug: "toys", count: 267, icon: "🎮", color: "from-yellow-500 to-orange-500" },
    { name: "Beauty", slug: "beauty", count: 198, icon: "💄", color: "from-pink-500 to-purple-500" },
    { name: "Grocery", slug: "grocery", count: 345, icon: "🥑", color: "from-green-500 to-emerald-500" },
  ];

  const benefits = [
    { icon: Truck, title: "Free Shipping", description: "On orders over $50", color: "blue" },
    { icon: Shield, title: "Secure Payment", description: "100% secure transactions", color: "green" },
    { icon: RotateCcw, title: "30-Day Returns", description: "Easy returns policy", color: "purple" },
    { icon: Headphones, title: "24/7 Support", description: "Dedicated customer service", color: "orange" },
    { icon: Clock, title: "Fast Delivery", description: "2-3 business days", color: "red" },
    { icon: Gift, title: "Rewards Program", description: "Earn points on every purchase", color: "pink" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Verified Buyer",
      rating: 5,
      comment: "Absolutely love my purchase! The quality is amazing and shipping was super fast. Will definitely buy again.",
      avatar: "/avatars/sarah.jpg",
      product: "Wireless Headphones",
    },
    {
      name: "Michael Chen",
      role: "Repeat Customer",
      rating: 5,
      comment: "Best online shopping experience. Great customer service and the products are exactly as described.",
      avatar: "/avatars/michael.jpg",
      product: "Smart Watch",
    },
    {
      name: "Emily Rodriguez",
      role: "First Time Buyer",
      rating: 4,
      comment: "Impressed with the variety and prices. Found exactly what I was looking for. Highly recommend!",
      avatar: "/avatars/emily.jpg",
      product: "Yoga Mat",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Slider */}
      <section className="relative overflow-hidden">
        <div className="relative h-[600px] md:h-[700px]">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide ? "translate-x-0" : "translate-x-full"
              }`}
              style={{ transform: `translateX(${(index - currentSlide) * 100}%)` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient}`}>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative h-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl text-white">
                      <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-4">
                        {slide.badge}
                      </span>
                      <h1 className="text-5xl md:text-7xl font-bold mb-4">{slide.title}</h1>
                      <p className="text-2xl md:text-3xl font-semibold mb-4">{slide.subtitle}</p>
                      <p className="text-lg mb-8 text-white/90">{slide.description}</p>
                      <Link
                        href={slide.ctaLink}
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                      >
                        {slide.cta}
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Slider Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? "w-8 bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                green: "bg-green-100 text-green-600",
                purple: "bg-purple-100 text-purple-600",
                orange: "bg-orange-100 text-orange-600",
                red: "bg-red-100 text-red-600",
                pink: "bg-pink-100 text-pink-600",
              };
              return (
                <div key={index} className="text-center group cursor-pointer">
                  <div className={`inline-flex p-3 rounded-full ${colorClasses[benefit.color as keyof typeof colorClasses]} mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                  <p className="text-xs text-gray-500">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {/* <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of products across various categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group text-center"
              >
                <div className={`bg-gradient-to-br ${category.color} p-4 rounded-2xl mb-3 group-hover:scale-105 transition-transform shadow-lg`}>
                  <span className="text-4xl">{category.icon}</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      {/* Flash Sale Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Zap className="w-8 h-8" />
              <div>
                <h2 className="text-3xl font-bold">Flash Sale</h2>
                <p className="text-white/90">Limited time offers - Up to 70% off</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1">24</div>
                <div className="text-xs">Hours</div>
              </div>
              <div className="text-2xl font-bold">:</div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1">59</div>
                <div className="text-xs">Minutes</div>
              </div>
              <div className="text-2xl font-bold">:</div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-white/20 rounded-lg px-3 py-1">59</div>
                <div className="text-xs">Seconds</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.slice(0, 4).map((product: any) => (
              <ProductCard key={product.id} product={product} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Trending Now</h2>
              <p className="text-gray-600">Most popular products this week</p>
            </div>
            <Link
              href="/products?sort=popularity_desc"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-80" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingProducts.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Hand-picked just for you</p>
            </div>
            <Link
              href="/products?featured=true"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-80" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-gray-600">Fresh styles just dropped</p>
            </div>
            <Link
              href="/products?sort=newest"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-80" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

     

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who love shopping with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.product}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100K+</div>
              <div className="text-gray-600">Products Sold</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
     
      <section className="py-20 bg-gradient-to-r from-blue-500 to-blue-400 text-slate-100 border-y border-slate-800">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Join our inner circle
          </h2>
          
          <p className="text-slate-100 text-base sm:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Receive 10% off your first order, alongside curated product launches, exclusive member invitations, and early access to sales.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              aria-label="Email address for newsletter subscription"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-md focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
              required
            />
            <button
              type="submit"
              className="bg-white text-slate-950 px-6 py-3 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors shadow-sm whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>

          <p className="text-slate-200 text-sm mt-4">
            We respect your privacy. Unsubscribe securely at any time.
          </p>
        </div>
      </div>
    </section>
      
    </div>
  );
}


