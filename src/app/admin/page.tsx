"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type AdminTab = 'products' | 'custom-orders' | 'promo-codes';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [productsError, setProductsError] = useState<string>('');
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [customOrdersLoading, setCustomOrdersLoading] = useState(false);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProductsError(data.error || 'Failed to load products');
        }
      })
      .catch((e) => setProductsError(e.message));
  }, []);

  useEffect(() => {
    if (activeTab === 'custom-orders') {
      setCustomOrdersLoading(true);
      fetch('/api/custom-orders')
        .then(res => res.json())
        .then(data => setCustomOrders(Array.isArray(data) ? data.reverse() : []))
        .finally(() => setCustomOrdersLoading(false));
    }
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

  const handleOrderStatus = async (id: string, status: string) => {
    const res = await fetch('/api/custom-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) {
      const updated = await res.json();
      setCustomOrders(prev => prev.map(o => o.id === id ? { ...o, ...updated } : o));
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    const res = await fetch('/api/custom-orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (res.ok) setCustomOrders(prev => prev.filter(o => o.id !== id));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
      approved: 'bg-green-500/10 text-green-400 border-green-500/30',
      rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return map[status] || 'bg-slate-700 text-slate-400 border-slate-600';
  };

  const pendingCount = customOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-black tracking-tight uppercase">STORE <span className="text-cyan-laser">CONTROL</span></h1>
        {activeTab === 'products' && (
          <Link href="/admin/products/new" className="px-6 py-3 bg-cyan-laser text-slate-950 font-bold rounded-xl cyan-glow">
            ADD PRODUCT
          </Link>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-8 border-b border-slate-800 mb-8">
        {(['products', 'custom-orders', 'promo-codes'] as AdminTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold tracking-[0.2em] transition-all relative ${
              activeTab === tab ? 'text-cyan-laser border-b-2 border-cyan-laser' : 'text-slate-500'
            }`}
          >
            {tab === 'custom-orders' ? 'CUSTOM ORDERS' : tab.replace('-', ' ').toUpperCase()}
            {tab === 'custom-orders' && pendingCount > 0 && (
              <span className="ml-2 bg-cyan-laser text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── PRODUCTS ───────────────── */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 gap-4">
          {productsError && (
             <div className="glass p-6 rounded-2xl border border-red-500/30 text-red-400 text-sm font-bold uppercase tracking-widest text-center">
               DATABASE ERROR: {productsError}
             </div>
          )}
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
                <button onClick={() => handleDelete(p.id)} className="px-4 py-2 text-xs font-bold border border-slate-700 rounded-lg hover:border-red-500 transition-colors text-slate-400 hover:text-red-500">DELETE</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CUSTOM ORDERS ──────────── */}
      {activeTab === 'custom-orders' && (
        <div className="space-y-6">
          {customOrdersLoading && (
            <p className="text-center text-slate-500 animate-pulse py-12 uppercase tracking-widest text-xs">LOADING ORDERS...</p>
          )}
          {!customOrdersLoading && customOrders.length === 0 && (
            <p className="text-center text-slate-500 py-12 text-sm uppercase tracking-widest">No custom orders yet.</p>
          )}
          {customOrders.map((o) => (
            <div key={o.id} className="glass rounded-3xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Logo preview */}
                <div className="bg-slate-900/50 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
                  {o.imageDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={o.imageDataUrl} alt="Customer artwork" className="max-h-32 max-w-full object-contain rounded-lg" />
                  ) : (
                    <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-xs">NO IMAGE</div>
                  )}
                </div>

                {/* Order details */}
                <div className="p-6 space-y-2">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${statusBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <h3 className="font-black text-white uppercase tracking-widest">{o.productTitle}</h3>
                  <p className="text-slate-400 text-sm">{o.material} · Qty: {o.quantity} · ${(o.price * o.quantity).toFixed(2)} CAD</p>
                  <p className="text-slate-300 text-sm font-bold">{o.customerName}</p>
                  <a href={`mailto:${o.customerEmail}`} className="text-cyan-laser text-xs hover:underline">{o.customerEmail}</a>
                  {o.notes && <p className="text-slate-500 text-xs mt-2 italic">"{o.notes}"</p>}
                  <p className="text-slate-600 text-xs">{new Date(o.submittedAt).toLocaleString()}</p>
                </div>

                {/* Actions */}
                <div className="p-6 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-800">
                  {o.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleOrderStatus(o.id, 'approved')}
                        className="w-full py-3 bg-green-500/10 border border-green-500/40 text-green-400 font-bold rounded-xl hover:bg-green-500/20 transition-all text-xs uppercase tracking-widest"
                      >
                        ✓ Approve & Send Invoice
                      </button>
                      <button
                        onClick={() => handleOrderStatus(o.id, 'rejected')}
                        className="w-full py-3 bg-red-500/10 border border-red-500/40 text-red-400 font-bold rounded-xl hover:bg-red-500/20 transition-all text-xs uppercase tracking-widest"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}
                  {o.status === 'approved' && o.invoiceUrl && (
                    <a
                      href={o.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-cyan-laser/10 border border-cyan-laser/40 text-cyan-laser font-bold rounded-xl hover:bg-cyan-laser/20 transition-all text-xs uppercase tracking-widest text-center"
                    >
                      View Stripe Invoice →
                    </a>
                  )}
                  {o.invoiceError && (
                    <p className="text-red-400 text-xs text-center">Invoice error: {o.invoiceError}</p>
                  )}
                  {o.status !== 'pending' && (
                    <button
                      onClick={() => handleOrderStatus(o.id, 'pending')}
                      className="w-full py-2 border border-slate-700 text-slate-400 font-bold rounded-xl hover:border-slate-600 transition-all text-xs uppercase tracking-widest"
                    >
                      Reset to Pending
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteOrder(o.id)}
                    className="w-full py-2 border border-slate-800 text-slate-600 hover:text-red-400 hover:border-red-500/40 font-bold rounded-xl transition-all text-xs uppercase tracking-widest"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PROMO CODES ────────────── */}
      {activeTab === 'promo-codes' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Active Promo Codes</h2>
            <a href="https://dashboard.stripe.com/coupons" target="_blank" rel="noopener noreferrer"
              className="px-5 py-2 text-xs font-bold bg-cyan-laser text-slate-950 rounded-lg cyan-glow hover:scale-105 transition-all uppercase tracking-widest">
              MANAGE IN STRIPE →
            </a>
          </div>
          {promoLoading && <p className="text-slate-500 animate-pulse text-center py-12 uppercase tracking-widest text-xs">FETCHING FROM STRIPE...</p>}
          {promoError && <div className="glass p-6 rounded-2xl border border-red-500/30 text-red-400 text-sm text-center">{promoError}</div>}
          {!promoLoading && !promoError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {promoCodes.length === 0 && <p className="col-span-3 text-center text-slate-500 py-12 text-sm uppercase tracking-widest">No active promo codes in Stripe.</p>}
              {promoCodes.map((pc: any) => (
                <div key={pc.id} className="glass p-6 rounded-2xl border border-slate-800 hover:border-cyan-laser/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-cyan-laser text-2xl tracking-widest uppercase">{pc.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border ${pc.active ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                      {pc.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p className="text-slate-300 font-bold mb-1">
                    {pc.coupon?.percent_off ? `${pc.coupon.percent_off}% OFF` : pc.coupon?.amount_off ? `$${(pc.coupon.amount_off / 100).toFixed(2)} CAD OFF` : 'Discount'}
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
