"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/store/useCart';

export default function ProductPage() {
  const params = useParams();
  const category = params?.category as string;
  const [product, setProduct] = useState<any>(null);
  const { addItem, setCartOpen } = useCart();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === category);
        const prod = found || data[0];
        setProduct(prod);
        if (prod?.materials?.length) setSelectedMaterial(prod.materials[0]);
      });
  }, [category]);

  if (!product) return <div className="text-center py-24 text-slate-500 font-bold animate-pulse uppercase tracking-[0.3em]">PROCESSING PRODUCT DATA...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Product Visuals */}
        <div className="relative group">
          <div className="aspect-square glass border border-slate-800 rounded-3xl overflow-hidden flex items-center justify-center text-8xl font-black italic text-slate-800">
            {product.imageUrl ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
            ) : (
               product.title[0]
            )}
          </div>
          <div className="absolute inset-0 bg-cyan-laser/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-8">
          <div>
            <div className="text-cyan-laser text-xs font-bold tracking-[0.3em] mb-4 uppercase">
              CATEGORY: {product.category.replace('-', ' ')}
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase">{product.title}</h1>
            <p className="text-3xl font-light text-slate-300">${product.price.toFixed(2)} CAD</p>
          </div>

          <p className="text-slate-400 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="space-y-6">
            <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase">SELECT MATERIAL</h3>
            <div className="flex gap-4">
              {product.materials.map((m: string) => (
                <button 
                  key={m} 
                  onClick={() => setSelectedMaterial(m)}
                  className={`px-6 py-3 glass border rounded-xl hover:border-cyan-laser transition-all text-sm font-bold tracking-widest uppercase ${selectedMaterial === m ? 'border-cyan-laser text-cyan-laser bg-cyan-laser/10' : 'border-slate-700 text-slate-300'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase">QUANTITY</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl glass border border-slate-700 flex items-center justify-center text-xl hover:border-cyan-laser transition-colors"
              >-</button>
              <span className="text-2xl font-black min-w-[3rem] text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl glass border border-slate-700 flex items-center justify-center text-xl hover:border-cyan-laser transition-colors"
              >+</button>
            </div>
          </div>

          <button 
            onClick={() => {
              const cartId = `${product.id}-${selectedMaterial}`;
              addItem({
                id: cartId,
                productId: product.id,
                title: product.title,
                price: product.price,
                quantity: quantity,
                weight: product.weight || 0,
                imageUrl: product.imageUrl,
                material: selectedMaterial,
                isCustom: product.isCustom
              });
              setCartOpen(true);
            }}
            className="w-full py-5 bg-cyan-laser text-slate-950 font-black tracking-[0.2em] rounded-2xl hover:scale-[1.01] transition-all cyan-glow mt-8"
          >
            ADD TO CART
          </button>
          
          <div className="flex items-center gap-6 justify-center mt-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-laser" />
              Agent Ready
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-laser" />
              Next-Day Etching
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
