import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass cyan-border m-4 rounded-2xl overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full border border-cyan-laser overflow-hidden cyan-glow">
            <Image 
              src="/logo.png" 
              alt="IronEtch Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="font-bold text-xl tracking-tight hidden md:block">
            IRON<span className="text-cyan-laser">ETCH</span>
          </span>
        </Link>

        <div className="flex items-center gap-8 font-medium text-sm">
          <Link href="/products/coasters" className="hover:text-cyan-laser transition-colors">COASTERS</Link>
          <Link href="/products/cutting-boards" className="hover:text-cyan-laser transition-colors whitespace-nowrap">CUTTING BOARDS</Link>
          <Link href="/products/signs" className="hover:text-cyan-laser transition-colors">SIGNS</Link>
          <Link href="/products/laser-training" className="hover:text-cyan-laser transition-colors whitespace-nowrap text-walnut">LASER TRAINING</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-bold bg-cyan-laser text-slate-950 rounded-lg hover:bg-white transition-all cyan-glow">
            SHOP NOW
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
