"use client";

import React, { useEffect, useState } from 'react';
import { useCart } from '@/store/useCart';

export default function CartButton() {
  const { cartCount, toggleCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="px-4 py-2 text-sm font-bold bg-cyan-laser text-slate-950 rounded-lg cyan-glow">
        CART
      </button>
    );
  }

  return (
    <button 
      onClick={toggleCart}
      className="px-4 py-2 text-sm font-bold bg-cyan-laser text-slate-950 rounded-lg hover:bg-white transition-all cyan-glow flex items-center gap-2"
    >
      CART <span className="bg-slate-950 text-cyan-laser px-2 py-0.5 rounded-full text-xs">{cartCount()}</span>
    </button>
  );
}
