"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: true,
        callbackUrl: '/'
      });
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 px-6 relative z-10">
      <div className="glass p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-laser/20 blur-3xl opacity-50 rounded-full"></div>
        
        <h1 className="text-3xl font-black uppercase tracking-widest mb-2">CREATE <span className="text-cyan-laser">ACCOUNT</span></h1>
        <p className="text-slate-400 text-sm mb-8">Join IronEtch to unlock premium access.</p>

        {error && <div className="p-4 bg-red-900/50 border border-red-500 rounded-xl mb-6 text-red-200 text-sm font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1 block">Full Name</label>
            <input required className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none text-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1 block">Email</label>
            <input required type="email" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1 block">Password</label>
            <input required type="password" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none text-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          </div>
          
          <button type="submit" className="w-full py-4 mt-4 bg-cyan-laser text-slate-950 font-black tracking-widest rounded-xl hover:scale-[1.02] transition-all cyan-glow">
            REGISTER
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-cyan-laser hover:underline font-bold">LOGIN</Link>
        </p>
      </div>
    </div>
  );
}
