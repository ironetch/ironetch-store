"use client";

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const res = await signIn('credentials', {
      redirect: false,
      email: formData.email,
      password: formData.password
    });

    if (res?.error) {
      setError("Invalid Email or Password.");
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 px-6 relative z-10">
      <div className="glass p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-laser/20 blur-3xl opacity-50 rounded-full"></div>
        
        <h1 className="text-3xl font-black uppercase tracking-widest mb-8">SECURE <span className="text-cyan-laser">LOGIN</span></h1>

        {error && <div className="p-4 bg-red-900/50 border border-red-500 rounded-xl mb-6 text-red-200 text-sm font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10 border-b border-slate-800 pb-8 mb-8">
          <div>
            <label className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1 block">Email</label>
            <input required type="email" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none text-white" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1 block">Password</label>
            <input required type="password" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 focus:border-cyan-laser outline-none text-white" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          </div>
          
          <button type="submit" className="w-full py-4 mt-4 bg-cyan-laser text-slate-950 font-black tracking-widest rounded-xl hover:scale-[1.02] transition-all cyan-glow">
            SIGN IN
          </button>
        </form>

        <div className="space-y-4">
           <button onClick={() => signIn('google', { callbackUrl: '/' })} className="w-full py-4 glass border border-slate-700 hover:border-white transition-colors text-white font-bold tracking-widest rounded-xl flex items-center justify-center gap-3">
              Google Login
           </button>
           <button onClick={() => signIn('azure-ad', { callbackUrl: '/' })} className="w-full py-4 glass border border-[#00a4ef] hover:bg-[#00a4ef]/10 transition-colors text-white font-bold tracking-widest rounded-xl flex items-center justify-center gap-3">
              Microsoft Login
           </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          Need an account? <Link href="/register" className="text-cyan-laser hover:underline font-bold">REGISTER</Link>
        </p>
      </div>
    </div>
  );
}
