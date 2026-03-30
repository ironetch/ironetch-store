"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh(); // Force refresh to clear any cached middleware redirects
      } else {
        const data = await res.json();
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,251,255,0.03),transparent_60%)] pointer-events-none" />
      
      <div className="w-full max-w-md glass border border-slate-800 rounded-3xl p-10 relative z-10 shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full border border-cyan-laser mb-6 flex items-center justify-center bg-cyan-laser/5 shadow-[0_0_30px_rgba(0,251,255,0.2)]">
          <svg className="w-8 h-8 text-cyan-laser" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black mb-2 tracking-widest text-white">CONTROL <span className="text-cyan-laser">CENTER</span></h1>
        <p className="text-slate-500 text-xs tracking-widest uppercase mb-10 text-center">Restricted Access Protocol</p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
          <div>
            <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-3 pl-1">Authorization Code</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-laser focus:ring-1 focus:ring-cyan-laser transition-all text-center tracking-[0.5em] text-lg font-mono"
            />
          </div>

          {error && <div className="text-red-400 text-xs font-bold text-center uppercase tracking-widest animate-pulse">{error}</div>}

          <button 
            type="submit" 
            disabled={isLoading || !password}
            className="w-full py-4 text-xs bg-cyan-laser text-slate-950 font-black tracking-[0.2em] rounded-xl hover:scale-[1.02] hover:bg-white transition-all cyan-glow uppercase disabled:opacity-50 disabled:pointer-events-none mt-4"
          >
            {isLoading ? 'VERIFYING...' : 'INITIALIZE UPLINK'}
          </button>
        </form>
      </div>
    </div>
  );
}
