"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'promo-codes'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [newPromo, setNewPromo] = useState({ code: '', amount_off: '', percent_off: '' });

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => setProducts(data));
    fetch('/api/orders').then(res => res.json()).then(data => setOrders(data));
    fetch('/api/promo-codes').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setPromoCodes(data);
    });
  }, []);

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/promo-codes', {
      method: 'POST',
      body: JSON.stringify(newPromo),
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      setPromoCodes([data, ...promoCodes]);
      setNewPromo({ code: '', amount_off: '', percent_off: '' });
    } else {
      alert('Failed to create promo code');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this high-end item?')) {
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
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-sm font-bold tracking-[0.2em] transition-all ${activeTab === 'orders' ? 'text-cyan-laser border-b-2 border-cyan-laser' : 'text-slate-500'}`}
        >
          ORDERS
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
              <div>
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="text-slate-400 text-sm">${p.price.toFixed(2)} CAD | {p.category}</p>
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
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((o) => (
            <div key={o.id} className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-cyan-laser font-bold">#</div>
                 <div>
                    <h3 className="text-lg font-bold">{o.customer}</h3>
                    <p className="text-slate-400 text-sm">{o.product} • {o.date}</p>
                 </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">${o.amount.toFixed(2)} CAD</p>
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${o.status === 'Shipped' ? 'text-green-500' : 'text-cyan-laser'}`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'promo-codes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Create Promo Code</h2>
            <form onSubmit={handleCreatePromo} className="glass p-6 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">PROMO CODE</label>
                <input required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white uppercase focus:border-cyan-laser outline-none" placeholder="SUMMER20" value={newPromo.code} onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-2">AMOUNT OFF (CAD)</label>
                  <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-laser outline-none" placeholder="10.00" value={newPromo.amount_off} onChange={e => setNewPromo({...newPromo, amount_off: e.target.value, percent_off: ''})} disabled={!!newPromo.percent_off} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-2">PERCENT OFF (%)</label>
                  <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-laser outline-none" placeholder="20" value={newPromo.percent_off} onChange={e => setNewPromo({...newPromo, percent_off: e.target.value, amount_off: ''})} disabled={!!newPromo.amount_off} />
                </div>
              </div>
              <button className="w-full py-3 bg-cyan-laser text-slate-950 font-bold rounded-lg cyan-glow mt-4">GENERATE CODE</button>
            </form>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Active Codes</h2>
            <div className="space-y-4">
              {promoCodes.map((pc: any) => (
                <div key={pc.id} className="glass p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-cyan-laser text-xl uppercase">{pc.code}</span>
                    <p className="text-xs text-slate-400 mt-1">
                      {pc.coupon.percent_off ? `${pc.coupon.percent_off}% OFF` : `$${(pc.coupon.amount_off/100).toFixed(2)} CAD OFF`}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                     {pc.times_redeemed} REDEEMED
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
