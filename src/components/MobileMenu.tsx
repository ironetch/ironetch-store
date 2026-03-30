"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Links */}
      <div className="hidden lg:flex items-center gap-8 font-bold tracking-widest text-xs text-slate-400">
        <Link href="/products/coasters" className="hover:text-cyan-laser transition-colors uppercase">COASTERS</Link>
        <Link href="/products/cutting-boards" className="hover:text-cyan-laser transition-colors whitespace-nowrap uppercase">CUTTING BOARDS</Link>
        <Link href="/products/signs" className="hover:text-cyan-laser transition-colors uppercase">SIGNS</Link>
        <Link href="/custom" className="hover:text-cyan-laser transition-colors uppercase">CUSTOM LOGO</Link>
        <Link href="/products/laser-training" className="hover:text-cyan-laser transition-colors whitespace-nowrap uppercase">LASER TRAINING</Link>
      </div>

      {/* Mobile Toggle Button */}
      <button 
        className="lg:hidden text-slate-400 hover:text-white transition-colors ml-4" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 glass border-t border-slate-800 p-6 flex flex-col gap-6 font-bold tracking-widest text-xs text-slate-400 lg:hidden shadow-2xl rounded-b-2xl border-x z-50">
          <Link href="/products/coasters" onClick={() => setIsOpen(false)} className="block hover:text-cyan-laser transition-colors uppercase">COASTERS</Link>
          <Link href="/products/cutting-boards" onClick={() => setIsOpen(false)} className="block hover:text-cyan-laser transition-colors uppercase">CUTTING BOARDS</Link>
          <Link href="/products/signs" onClick={() => setIsOpen(false)} className="block hover:text-cyan-laser transition-colors uppercase">SIGNS</Link>
          <Link href="/custom" onClick={() => setIsOpen(false)} className="block hover:text-cyan-laser transition-colors uppercase">CUSTOM LOGO</Link>
          <Link href="/products/laser-training" onClick={() => setIsOpen(false)} className="block hover:text-cyan-laser transition-colors uppercase">LASER TRAINING</Link>
        </div>
      )}
    </>
  );
}
