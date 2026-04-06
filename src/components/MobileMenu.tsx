"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const links = [
  { href: '/products/coasters', label: 'COASTERS' },
  { href: '/products/cutting-boards', label: 'CUTTING BOARDS' },
  { href: '/products/signs', label: 'SIGNS' },
  { href: '/custom', label: 'CUSTOM LOGO' },
  { href: '/products/laser-training', label: 'LASER TRAINING' },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsOpen(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Desktop nav links */}
      <div className="hidden lg:flex items-center gap-8 font-bold tracking-widest text-xs text-slate-400">
        {links.map(l => (
          <Link key={l.href} href={l.href} className="hover:text-cyan-laser transition-colors uppercase whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger button */}
      <button
        className="lg:hidden text-slate-400 hover:text-white transition-colors ml-4 z-[100]"
        onClick={() => setIsOpen(o => !o)}
        aria-label="Toggle Menu"
        aria-expanded={isOpen}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile dropdown — rendered via fixed positioning to escape navbar overflow-hidden */}
      {isOpen && (
        <div
          className="fixed inset-x-4 top-[80px] z-[999] lg:hidden rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          style={{ backdropFilter: 'blur(24px)', background: 'rgba(10,10,15,0.92)' }}
        >
          <nav className="flex flex-col p-4 gap-1">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-4 rounded-xl font-bold tracking-widest text-sm text-slate-300 hover:text-cyan-laser hover:bg-cyan-laser/5 transition-all uppercase"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[998] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
