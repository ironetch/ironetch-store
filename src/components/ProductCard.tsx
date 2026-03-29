import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  title: string;
  price: string;
  image: string;
  href: string;
  description: string;
}

const ProductCard = ({ title, price, image, href, description }: ProductCardProps) => {
  return (
    <div className="group relative glass rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-laser transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,251,255,0.15)]">
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
        <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-110">
           <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-700 text-6xl italic font-black">
             {title[0]}
           </div>
        </div>
        
        <div className="absolute top-4 right-4 z-20 bg-slate-950/80 backdrop-blur-md border border-cyan-laser/30 px-3 py-1 rounded-full">
          <span className="text-cyan-laser font-bold text-sm">{price}</span>
        </div>
      </div>
      
      <div className="p-6 relative z-20">
        <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-laser transition-colors">{title}</h3>
        <p className="text-slate-400 text-sm mb-6 line-clamp-2">{description}</p>
        
        <Link 
          href={href}
          className="inline-flex items-center gap-2 text-sm font-bold tracking-widest text-cyan-laser hover:text-white transition-colors"
        >
          VIEW PRODUCT 
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
