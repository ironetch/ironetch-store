"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

export default function CategoryGalleryPage() {
  const params = useParams();
  const category = params?.category as string;
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Filter products by the current category
        const categoryProducts = data.filter((p: any) => p.category === category);
        setProducts(categoryProducts);
      });
  }, [category]);

  const categoryName = category?.replace('-', ' ') || 'Products';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-16">
        <div className="inline-block px-4 py-1 rounded-full border border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-bold tracking-[0.3em] mb-6 uppercase">
          EXPLORE COLLECTION
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">
          {categoryName.split(' ')[0]} <span className="text-cyan-laser">{categoryName.split(' ').slice(1).join(' ')}</span>
        </h1>
        <div className="h-1 w-24 bg-cyan-laser" />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 text-slate-500 font-bold animate-pulse uppercase tracking-[0.3em]">
          LOADING COLLECTION...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              title={product.title}
              price={`$${product.price.toFixed(2)} CAD`}
              description={product.description}
              href={`/products/${category}/${product.id}`}
              image={product.imageUrl || ''}
              materials={product.materials || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
