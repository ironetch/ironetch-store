"use client";

import React, { useState } from 'react';
import { useCart } from '@/store/useCart';
import Image from 'next/image';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartMenu() {
  const { isOpen, toggleCart, items, cartTotal, updateQuantity, removeItem } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        console.error('Checkout error:', error);
        alert(error);
        setIsProcessing(false);
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize.");
      const { error: stripeError } = await (stripe as any).redirectToCheckout({ sessionId });
      if (stripeError) {
        console.error('Stripe redirect error:', stripeError);
        alert(stripeError.message);
      }
    } catch (err: any) {
      console.error(err);
      alert('An error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100]" onClick={toggleCart} />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <h2 className="text-xl font-black tracking-widest uppercase">YOUR <span className="text-cyan-laser">CART</span></h2>
          <button onClick={toggleCart} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 mt-20">
              <p className="mb-4">Your cart is empty.</p>
              <button onClick={toggleCart} className="text-cyan-laser hover:underline font-bold uppercase tracking-widest text-sm">Continue Shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 glass p-4 rounded-2xl border border-slate-800/50">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0">
                  <Image src={item.imageUrl || '/logo.png'} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                    {item.material && <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{item.material}</p>}
                    <p className="text-cyan-laser font-bold text-sm mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-slate-950 rounded-lg p-1 border border-slate-800">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >-</button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >+</button>
                    </div>
                    
                    <button onClick={() => removeItem(item.id)} className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/50">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 font-bold tracking-widest uppercase text-sm">Subtotal</span>
              <span className="text-2xl font-black text-cyan-laser">${cartTotal().toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 bg-cyan-laser text-slate-950 font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all cyan-glow disabled:opacity-50 disabled:hover:scale-100"
            >
              {isProcessing ? 'Processing...' : 'CHECKOUT'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
