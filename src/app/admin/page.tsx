"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => setProducts(data));
    fetch('/api/orders').then(res => res.json()).then(data => setOrders(data));
  }, []);

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
      </div>

      {activeTab === 'products' ? (
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
      ) : (
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
    </div>
  );
}
