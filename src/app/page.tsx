"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/store/useCart";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const clearCart = useCart(state => state.clearCart);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.filter((p: any) => p.category !== 'laser-training')));

    if (window.location.search.includes('success=true')) {
      clearCart();
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => alert("Checkout successful! Thank you for your order."), 500);
    }
    
    if (window.location.search.includes('canceled=true')) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => alert("Checkout was canceled."), 500);
    }
  }, [clearCart]);

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,251,255,0.1),transparent_70%)]" />
        <div className="relative z-10 text-center max-w-4xl px-6">
          <div className="inline-block px-4 py-1 rounded-full border border-cyan-laser/30 bg-cyan-laser/5 text-cyan-laser text-xs font-bold tracking-[0.3em] mb-8 animate-pulse">
            EST. 2026 | LASER PRECISION
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-none">
            IRON<span className="text-cyan-laser">ETCH</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-100">LASER WORKS</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Dark industrial luxury for the modern workspace. Precision engraving on premium slate and hardwood materials.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              href="/products/coasters" 
              className="px-8 py-4 bg-cyan-laser text-slate-950 font-black tracking-widest rounded-xl hover:scale-105 transition-all cyan-glow"
            >
              EXPLORE COLLECTIONS
            </Link>
            <Link 
              href="/products/laser-training" 
              className="px-8 py-4 glass border border-slate-700 text-white font-black tracking-widest rounded-xl hover:border-cyan-laser transition-all"
            >
              PROFESSIONAL TRAINING
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">FEATURED <span className="text-cyan-laser">PRODUCTS</span></h2>
            <div className="h-1 w-24 bg-cyan-laser" />
          </div>
          <Link href="/products/coasters" className="text-slate-500 hover:text-cyan-laser transition-colors text-sm font-bold tracking-widest">
            VIEW ALL
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              title={product.title}
              price={`$${product.price.toFixed(2)} CAD`}
              description={product.description}
              href={`/products/${product.id}`}
              image={product.imageUrl || `/products/${product.id}.jpg`}
            />
          ))}
        </div>
      </section>

      {/* Industrial Quote Section */}
      <section className="bg-slate-900/50 py-24 border-y border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <svg className="w-12 h-12 text-cyan-laser/20 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21L14.017 18C14.017 15.238 16.255 13 19.017 13L19.017 11C15.15 11 12.017 14.133 12.017 18L12.017 21L14.017 21ZM5.01699 21L5.01699 18C5.01699 15.238 7.25499 13 10.017 13L10.017 11C6.14999 11 3.01699 14.133 3.01699 18L3.01699 21L5.01699 21Z" />
          </svg>
          <h3 className="text-3xl font-light italic text-slate-300 leading-relaxed mb-8">
            "Precision is not an act, it is a habit. We etch the soul of industry into every piece."
          </h3>
          <p className="text-cyan-laser font-bold tracking-widest text-sm">— IRONETCH LEAD ARCHITECT</p>
        </div>
      </section>
    </div>
  );
}
