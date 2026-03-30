"use client";

import React, { useState, useEffect } from "react";
import LogoUpload from "@/components/LogoUpload";
import { useCart } from "@/store/useCart";
import Image from "next/image";

export default function CustomBuilder() {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const { addItem, setCartOpen } = useCart();
  
  // Local state for each product card's selections
  const [selections, setSelections] = useState<Record<string, { material: string, quantity: number }>>({});

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const customProducts = data.filter((p: any) => p.isCustom);
        setProducts(customProducts);
        
        // Initialize default selections
        const initialSelections: any = {};
        customProducts.forEach((p: any) => {
          initialSelections[p.id] = {
            material: p.materials?.[0] || '',
            quantity: 1
          };
        });
        setSelections(initialSelections);
      });
  }, []);

  const handleUpdateSelection = (id: string, key: 'material' | 'quantity', value: any) => {
    setSelections(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value
      }
    }));
  };

  const handleAddToCart = (product: any) => {
    const sel = selections[product.id];
    // Encode the url so different logos don't merge into the exact same line item
    const customSuffix = uploadedUrl ? btoa(uploadedUrl).substring(0, 10) : 'custom';
    const cartId = `${product.id}-${sel.material}-${customSuffix}`;
    
    addItem({
      id: cartId,
      productId: product.id,
      title: `${product.title} (Custom Logo)`,
      price: product.price,
      quantity: sel.quantity,
      weight: product.weight || 0,
      imageUrl: uploadedUrl || product.imageUrl,
      material: sel.material,
      isCustom: true
    });
    setCartOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">
          CUSTOM <span className="text-cyan-laser">BUILDER</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
          Upload your company logo or custom artwork to etch onto our premium industrial products.
        </p>
      </div>

      {!uploadedUrl ? (
        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-laser text-slate-950 font-black text-xl mb-4">1</div>
            <h2 className="text-2xl font-bold tracking-widest text-white uppercase">Upload Artwork</h2>
          </div>
          <LogoUpload onUpload={(url) => setUploadedUrl(url)} />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 glass p-6 rounded-2xl border border-cyan-laser/50">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-xl bg-slate-950 overflow-hidden border border-slate-700 flex-shrink-0">
                <Image src={uploadedUrl} alt="Your Custom Logo" fill className="object-cover p-2" />
              </div>
              <div>
                <h3 className="text-white font-bold tracking-widest uppercase">ARTWORK VERIFIED</h3>
                <p className="text-sm text-cyan-laser">Ready for precision etching.</p>
              </div>
            </div>
            <button 
              onClick={() => setUploadedUrl(null)} 
              className="mt-4 sm:mt-0 px-6 py-2 text-xs font-bold border border-slate-700 hover:border-red-400 text-slate-400 hover:text-red-400 transition-colors uppercase tracking-widest rounded-lg"
            >
              Change Logo
            </button>
          </div>

          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-laser text-slate-950 font-black text-xl mb-4">2</div>
            <h2 className="text-2xl font-bold tracking-widest text-white uppercase">Select Products</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map(product => {
              const sel = selections[product.id];
              if (!sel) return null;

              return (
                <div key={product.id} className="glass p-8 rounded-3xl border border-slate-800 flex flex-col hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-1">{product.title}</h3>
                      <p className="text-cyan-laser font-bold">${product.price.toFixed(2)} CAD</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-8 flex-1">{product.description}</p>

                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="text-xs font-bold tracking-widest text-slate-500 uppercase block mb-3">Material</label>
                      <div className="flex flex-wrap gap-2">
                        {product.materials.map((m: string) => (
                          <button 
                            key={m} 
                            onClick={() => handleUpdateSelection(product.id, 'material', m)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase border transition-all ${sel.material === m ? 'border-cyan-laser text-cyan-laser bg-cyan-laser/10' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold tracking-widest text-slate-500 uppercase block mb-3">Quantity</label>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleUpdateSelection(product.id, 'quantity', Math.max(1, sel.quantity - 1))}
                          className="w-10 h-10 rounded-lg glass border border-slate-700 flex items-center justify-center text-slate-300 hover:border-cyan-laser hover:text-white transition-colors"
                        >-</button>
                        <span className="text-lg font-black w-8 text-center">{sel.quantity}</span>
                        <button 
                          onClick={() => handleUpdateSelection(product.id, 'quantity', sel.quantity + 1)}
                          className="w-10 h-10 rounded-lg glass border border-slate-700 flex items-center justify-center text-slate-300 hover:border-cyan-laser hover:text-white transition-colors"
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full py-4 text-sm bg-cyan-laser text-slate-950 font-black tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-all cyan-glow uppercase"
                  >
                    ADD TO CART
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
