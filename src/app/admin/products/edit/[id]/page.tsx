"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditProduct() {
  const params = useParams();
  const id = params?.id as string;
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: any) => p.id === id);
        if (found) setFormData({ ...found, materials: found.materials.join(', ') });
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const product = {
      ...formData,
      materials: formData.materials.split(',').map((m: string) => m.trim())
    };

    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      router.push('/admin');
    } else {
      setIsSaving(false);
      alert('Failed to update product');
    }
  };

  if (!formData) return <div className="text-center py-24 text-cyan-laser font-bold animate-pulse">LOADING PRODUCT DATA...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black mb-8">EDIT <span className="text-cyan-laser">PRODUCT</span></h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 tracking-widest">PRODUCT TITLE</label>
          <input 
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none"
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 tracking-widest">PRICE (CAD)</label>
            <input 
              required
              type="number"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none"
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 tracking-widest">WEIGHT (G)</label>
            <input 
              required
              type="number"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none"
              value={formData.weight}
              onChange={e => setFormData({...formData, weight: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 tracking-widest">CATEGORY</label>
            <select 
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="coasters">Coasters</option>
              <option value="cutting-boards">Cutting Boards</option>
              <option value="signs">Signs</option>
              <option value="laser-training">Laser Training</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 tracking-widest">DESCRIPTION</label>
          <textarea 
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none h-32"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-500 tracking-widest">MATERIALS (COMMA SEPARATED)</label>
          <input 
            required
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none"
            value={formData.materials}
            onChange={e => setFormData({...formData, materials: e.target.value})}
          />
        </div>

        <button 
          disabled={isSaving}
          className="w-full py-5 bg-cyan-laser text-slate-950 font-black tracking-[0.2em] rounded-2xl hover:scale-[1.01] transition-all cyan-glow mt-8 disabled:opacity-50"
        >
          {isSaving ? 'UPDATING ETCHING...' : 'UPDATE PRODUCT'}
        </button>
      </form>
    </div>
  );
}
