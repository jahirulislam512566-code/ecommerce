"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Award, 
  Truck, 
  Shield, 
  Headphones, 
  Heart, 
  Users, 
  Globe,
  Star,
  ShoppingBag,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function AboutPage() {
  const stats = [
    { value: "50K+", label: "Happy Customers", icon: Users },
    { value: "100K+", label: "Products Sold", icon: ShoppingBag },
    { value: "24/7", label: "Customer Support", icon: Headphones },
    { value: "30+", label: "Countries", icon: Globe },
  ];

  const values = [
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our top priority. We're committed to providing the best shopping experience.",
      color: "text-red-500",
      bgColor: "bg-red-100",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Every product is carefully selected and tested to ensure the highest quality standards.",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "We partner with reliable carriers to ensure your orders arrive quickly and safely.",
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      icon: Award,
      title: "Best Prices",
      description: "We negotiate directly with manufacturers to bring you the best prices online.",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
  ];

  const team = [
    {
      name: "John Smith",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      bio: "10+ years of e-commerce experience",
    },
    {
      name: "Sarah Johnson",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      bio: "Supply chain expert",
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      bio: "Product enthusiast",
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Support Lead",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
      bio: "Customer satisfaction specialist",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About E-Store</h1>
            <p className="text-xl text-blue-100 mb-8">
              We&apos;re on a mission to revolutionize online shopping by providing quality products 
              at affordable prices with exceptional customer service.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/products" 
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <div className="w-20 h-1 bg-blue-600 rounded mb-6"></div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Founded in 2020, E-Store started with a simple idea: make quality products accessible 
                to everyone at fair prices. What began as a small online shop has grown into a trusted 
                destination for thousands of happy customers worldwide.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                We believe that online shopping should be easy, secure, and enjoyable. That&apos;s why we&apos;ve 
                built a platform that prioritizes user experience, product quality, and customer satisfaction.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, we&apos;re proud to serve customers across 30+ countries, offering a curated selection 
                of products from trusted brands and emerging designers.
              </p>
            </div>
            <div className="relative h-96 rounded-xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
                alt="Our team working"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <div className="w-20 h-1 bg-blue-600 rounded mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">
              To create the world's most customer-centric online shopping experience, 
              where anyone can find and discover anything they want to buy online.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-6 bg-white rounded-xl shadow-sm">
                  <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <div className="w-20 h-1 bg-blue-600 rounded mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These values guide everything we do, from product selection to customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center p-6 rounded-xl border hover:shadow-lg transition-shadow">
                  <div className={`${value.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
            <div className="w-20 h-1 bg-blue-600 rounded mx-auto mb-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Curated Selection</h3>
                <p className="text-gray-600 text-sm">We hand-pick every product to ensure quality and value.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Price Match Guarantee</h3>
                <p className="text-gray-600 text-sm">Found a better price? We'll match it.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Shopping</h3>
                <p className="text-gray-600 text-sm">Your transactions are 100% secure with SSL encryption.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Fast Shipping</h3>
                <p className="text-gray-600 text-sm">Same-day dispatch on orders placed before 2PM.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">30-Day Returns</h3>
                <p className="text-gray-600 text-sm">Not satisfied? Return within 30 days for a full refund.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 bg-white rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">24/7 Support</h3>
                <p className="text-gray-600 text-sm">Our support team is always here to help.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <div className="w-20 h-1 bg-blue-600 rounded mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate people behind E-Store who work tirelessly to bring you the best shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center group">
                <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-blue-600 mb-2">{member.role}</p>
                <p className="text-gray-500 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <div className="w-20 h-1 bg-white rounded mx-auto mb-6"></div>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our customers have to say about their experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 mb-4">
                "Amazing experience! The product quality exceeded my expectations. Shipping was super fast too."
              </p>
              <p className="font-semibold">- Sarah M.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 mb-4">
                "Best online shopping experience. Customer service was very helpful when I had questions."
              </p>
              <p className="font-semibold">- John D.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 mb-4">
                "Will definitely shop here again! Great prices and excellent product selection."
              </p>
              <p className="font-semibold">- Emily R.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Shopping?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and discover why E-Store is the trusted choice for online shopping.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/products"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}