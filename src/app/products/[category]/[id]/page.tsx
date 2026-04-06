"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/store/useCart';
import MaterialPreview from '@/components/MaterialPreview';

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const { addItem, setCartOpen } = useCart();
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === id);
        const prod = found || data[0];
        setProduct(prod);
        if (prod?.materials?.length) setSelectedMaterial(prod.materials[0]);
      });
  }, [id]);

  if (!product) return <div className="text-center py-24 text-slate-500 font-bold animate-pulse uppercase tracking-[0.3em]">PROCESSING PRODUCT DATA...</div>;

  const realPhotos: string[] = product.images || [];
  const isSlate = product.materials?.some((m: string) => m.toLowerCase().includes('slate'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

        {/* ── Left column: material preview + real photos ── */}
        <div className="space-y-4">

          {/* Primary: MaterialPreview canvas — same rendered output as admin */}
          {product.imageUrl ? (
            <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-900">
              <MaterialPreview
                imageDataUrl={activePhoto || product.imageUrl}
                material={selectedMaterial || product.materials?.[0] || 'Slate'}
                size={0.75}
              />
            </div>
          ) : (
            <div className="aspect-square glass border border-slate-800 rounded-3xl flex items-center justify-center text-8xl font-black italic text-slate-800">
              {product.title[0]}
            </div>
          )}

          {/* Real product photos strip */}
          {realPhotos.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-600 font-bold tracking-widest uppercase px-1">Product Photos</p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {/* "Etching preview" thumb */}
                {product.imageUrl && (
                  <button
                    onClick={() => setActivePhoto(null)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${!activePhoto ? 'border-cyan-laser' : 'border-slate-700 opacity-60 hover:opacity-100'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt="etching preview"
                      className="w-full h-full object-contain p-1"
                      style={isSlate ? { filter: 'brightness(0) invert(1)' } : undefined}
                    />
                  </button>
                )}
                {realPhotos.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(url)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${activePhoto === url ? 'border-cyan-laser' : 'border-slate-700 opacity-60 hover:opacity-100'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: product info ── */}
        <div className="flex flex-col gap-6 sm:gap-8">
          <div>
            <div className="text-cyan-laser text-xs font-bold tracking-[0.3em] mb-3 uppercase">
              CATEGORY: {product.category.replace(/-/g, ' ')}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tighter uppercase">{product.title}</h1>
            <p className="text-2xl sm:text-3xl font-light text-slate-300">${product.price.toFixed(2)} CAD</p>
          </div>

          <p className="text-slate-400 leading-relaxed text-base sm:text-lg">
            {product.description}
          </p>

          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-widest text-slate-500 uppercase">SELECT MATERIAL</h3>
            <div className="flex flex-wrap gap-3">
              {product.materials.map((m: string) => (
                <button
                  key={m}
                  onClick={() => setSelectedMaterial(m)}
                  className={`px-5 py-3 glass border rounded-xl hover:border-cyan-laser transition-all text-sm font-bold tracking-widest uppercase ${selectedMaterial === m ? 'border-cyan-laser text-cyan-laser bg-cyan-laser/10' : 'border-slate-700 text-slate-300'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
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
            className="w-full py-5 bg-cyan-laser text-slate-950 font-black tracking-[0.2em] rounded-2xl hover:scale-[1.01] transition-all cyan-glow mt-4"
          >
            ADD TO CART
          </button>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center mt-2">
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
