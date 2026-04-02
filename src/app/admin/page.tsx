"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'promo-codes'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => setProducts(data));
  }, []);

  useEffect(() => {
    if (activeTab === 'promo-codes') {
      setPromoLoading(true);
      setPromoError('');
      fetch('/api/promo-codes')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setPromoCodes(data);
          else setPromoError(data.error || 'Failed to load promo codes');
        })
        .catch(() => setPromoError('Network error'))
        .finally(() => setPromoLoading(false));
    }
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this product?')) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase">STORE <span className="text-cyan-laser">CONTROL</span></h1>
        {activeTab === 'products' && (
          <Link 
            href="/admin/products/new"
            className="px-6 py-3 bg-cyan-laser text-slate-950 font-bold rounded-xl cyan-glow"
          >
            ADD PRODUCT
          </Link>
        )}
      </div>

      <div className="flex gap-8 border-b border-slate-800 mb-8">
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-4 text-sm font-bold tracking-[0.2em] transition-all ${activeTab === 'products' ? 'text-cyan-laser border-b-2 border-cyan-laser' : 'text-slate-500'}`}
        >
          PRODUCTS
        </button>
        <button 
          onClick={() => setActiveTab('promo-codes')}
          className={`pb-4 text-sm font-bold tracking-[0.2em] transition-all ${activeTab === 'promo-codes' ? 'text-cyan-laser border-b-2 border-cyan-laser' : 'text-slate-500'}`}
        >
          PROMO CODES
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="grid grid-cols-1 gap-4">
          {products.map((p) => (
            <div key={p.id} className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-cyan-laser/50 transition-all">
              <div className="flex items-center gap-4">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.title} className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                )}
                <div>
                  <h3 className="text-xl font-bold">{p.title}</h3>
                  <p className="text-slate-400 text-sm">${p.price.toFixed(2)} CAD · {p.category} · Stock: {p.stock ?? '—'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Link href={`/admin/products/edit/${p.id}`} className="px-4 py-2 text-xs font-bold border border-slate-700 rounded-lg hover:border-cyan-laser transition-colors text-slate-400 hover:text-white">EDIT</Link>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="px-4 py-2 text-xs font-bold border border-slate-700 rounded-lg hover:border-red-500 transition-colors text-slate-400 hover:text-red-500"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'promo-codes' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Active Promo Codes</h2>
            <a
              href="https://dashboard.stripe.com/coupons"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 text-xs font-bold bg-cyan-laser text-slate-950 rounded-lg cyan-glow hover:scale-105 transition-all uppercase tracking-widest"
            >
              MANAGE IN STRIPE →
            </a>
          </div>

          {promoLoading && (
            <p className="text-slate-500 animate-pulse text-center py-12 uppercase tracking-widest text-xs">FETCHING FROM STRIPE...</p>
          )}

          {promoError && (
            <div className="glass p-6 rounded-2xl border border-red-500/30 text-red-400 text-sm text-center">
              {promoError}
            </div>
          )}

          {!promoLoading && !promoError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoCodes.length === 0 && (
                <p className="col-span-3 text-center text-slate-500 py-12 text-sm uppercase tracking-widest">No active promo codes in Stripe.</p>
              )}
              {promoCodes.map((pc: any) => (
                <div key={pc.id} className="glass p-6 rounded-2xl border border-slate-800 hover:border-cyan-laser/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-cyan-laser text-2xl tracking-widest uppercase">{pc.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${pc.active ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                      {pc.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-slate-300 font-bold mb-1">
                    {pc.coupon?.percent_off
                      ? `${pc.coupon.percent_off}% OFF`
                      : pc.coupon?.amount_off
                      ? `$${(pc.coupon.amount_off / 100).toFixed(2)} CAD OFF`
                      : 'Discount'}
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-3">{pc.times_redeemed} times redeemed</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
