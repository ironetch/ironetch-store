"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MaterialPreview from "@/components/MaterialPreview";

const ACCEPTED_TYPES = ["image/svg+xml", "image/png"];

export default function CustomBuilder() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [previewMaterial, setPreviewMaterial] = useState<string>("Slate");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logoSize, setLogoSize] = useState<number>(0.7);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const custom = data.filter((p: any) => p.isCustom);
        setProducts(custom);
        if (custom.length > 0) {
          setSelectedProduct(custom[0]);
          setSelectedMaterial(custom[0].materials?.[0] || "");
          setPreviewMaterial(custom[0].materials?.[0] || "Slate");
        }
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Only SVG or PNG files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageDataUrl(ev.target?.result as string);
      setFileName(file.name);
      setStep(2);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageDataUrl || !selectedProduct) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          productId: selectedProduct.id,
          productTitle: selectedProduct.title,
          material: selectedMaterial,
          quantity,
          price: selectedProduct.price,
          imageDataUrl,
          notes,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setStep(3);
      } else {
        const d = await res.json();
        alert(d.error || "Submission failed. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step indicators ──────────────────────────────────────────────
  const StepBadge = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm transition-all ${
          step >= n
            ? "bg-cyan-laser text-slate-950 shadow-[0_0_12px_rgba(0,251,255,0.5)]"
            : "bg-slate-800 text-slate-500"
        }`}
      >
        {n}
      </div>
      <span
        className={`text-xs font-bold tracking-widest uppercase transition-colors ${
          step >= n ? "text-white" : "text-slate-600"
        }`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter uppercase">
          CUSTOM <span className="text-cyan-laser">ORDER</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Upload your artwork, preview it laser-etched on your chosen material,
          then submit for admin approval before payment.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex flex-wrap justify-center gap-8 mb-12">
        <StepBadge n={1} label="Upload Artwork" />
        <div className="w-8 border-t border-slate-700 my-auto hidden sm:block" />
        <StepBadge n={2} label="Preview & Select" />
        <div className="w-8 border-t border-slate-700 my-auto hidden sm:block" />
        <StepBadge n={3} label="Submit Order" />
      </div>

      {/* ── STEP 1: Upload ────────────────────────────────────── */}
      {step === 1 && (
        <div className="max-w-lg mx-auto">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="glass border-2 border-dashed border-slate-700 hover:border-cyan-laser rounded-3xl p-16 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-700 group-hover:border-cyan-laser flex items-center justify-center transition-colors">
              <svg className="w-8 h-8 text-slate-400 group-hover:text-cyan-laser transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-black text-white text-lg uppercase tracking-widest">Drop or Click to Upload</p>
              <p className="text-slate-500 text-sm mt-2">SVG or PNG · Max 5 MB</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,.png,image/svg+xml,image/png"
            className="hidden"
            onChange={handleFileChange}
          />
          {fileError && (
            <p className="text-red-400 text-sm text-center mt-4 font-bold uppercase tracking-widest">
              {fileError}
            </p>
          )}
        </div>
      )}

      {/* ── STEP 2: Preview & Select ──────────────────────────── */}
      {step === 2 && imageDataUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Live Preview */}
          <div className="flex flex-col gap-6">
            <div className="glass p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-white uppercase tracking-widest">Live Preview</h2>
                <button
                  onClick={() => { setStep(1); setImageDataUrl(null); setFileName(""); }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors font-bold uppercase tracking-widest"
                >
                  Change File
                </button>
              </div>

              {/* Material toggle for preview */}
              <div className="flex gap-3 mb-6">
                {["Slate", "Wood", "Walnut", "Maple"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPreviewMaterial(m)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all uppercase ${
                      previewMaterial === m
                        ? "border-cyan-laser text-cyan-laser bg-cyan-laser/10"
                        : "border-slate-700 text-slate-500 hover:border-slate-500"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <MaterialPreview imageDataUrl={imageDataUrl} material={previewMaterial} size={logoSize} />

              {/* Size slider */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logo Size</label>
                  <span className="text-xs text-cyan-laser font-bold">{Math.round(logoSize * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={1.0}
                  step={0.05}
                  value={logoSize}
                  onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                  className="w-full accent-cyan-laser cursor-pointer"
                />
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-cyan-laser inline-block" />
                &nbsp;File: {fileName}
              </div>
            </div>
          </div>

          {/* Right: Product & Order Form */}
          <div className="flex flex-col gap-6">
            <form onSubmit={handleSubmitOrder} className="flex flex-col gap-6">
              {/* Product selection */}
              <div className="glass p-6 rounded-3xl border border-slate-800">
                <h2 className="font-black text-white uppercase tracking-widest mb-6">Select Product</h2>
                <div className="space-y-3">
                  {products.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => {
                        setSelectedProduct(p);
                        setSelectedMaterial(p.materials?.[0] || "");
                        setPreviewMaterial(p.materials?.[0] || "Slate");
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        selectedProduct?.id === p.id
                          ? "border-cyan-laser bg-cyan-laser/5"
                          : "border-slate-700 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-sm uppercase tracking-widest">{p.title}</span>
                        <span className="text-cyan-laser font-bold text-sm">${p.price.toFixed(2)}</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">{p.description}</p>
                    </button>
                  ))}
                </div>

                {selectedProduct && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Material</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.materials.map((m: string) => (
                          <button
                            type="button"
                            key={m}
                            onClick={() => { setSelectedMaterial(m); setPreviewMaterial(m); }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all uppercase ${
                              selectedMaterial === m
                                ? "border-cyan-laser text-cyan-laser bg-cyan-laser/10"
                                : "border-slate-700 text-slate-400"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Quantity</label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg glass border border-slate-700 hover:border-cyan-laser transition-colors text-white">−</button>
                        <span className="text-lg font-black w-8 text-center">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg glass border border-slate-700 hover:border-cyan-laser transition-colors text-white">+</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact info */}
              <div className="glass p-6 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="font-black text-white uppercase tracking-widest mb-2">Your Details</h2>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Name</label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-laser transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Email</label>
                  <input
                    required
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-laser transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-laser transition-colors resize-none"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>

              {/* Price summary */}
              {selectedProduct && (
                <div className="glass p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                    {quantity}× {selectedProduct.title} ({selectedMaterial})
                  </span>
                  <span className="text-white font-black text-lg">
                    ${(selectedProduct.price * quantity).toFixed(2)} CAD
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedProduct}
                className="w-full py-5 bg-cyan-laser text-slate-950 font-black tracking-[0.2em] rounded-2xl hover:scale-[1.01] transition-all cyan-glow uppercase disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT FOR REVIEW →"}
              </button>
              <p className="text-center text-xs text-slate-500 uppercase tracking-widest">
                Our team will review your design and contact you within 24–48 hours.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ── STEP 3: Confirmation ──────────────────────────────── */}
      {step === 3 && submitted && (
        <div className="max-w-lg mx-auto text-center glass p-12 rounded-3xl border border-cyan-laser/50">
          <div className="w-20 h-20 rounded-full bg-cyan-laser/10 border border-cyan-laser flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(0,251,255,0.3)]">
            <svg className="w-10 h-10 text-cyan-laser" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-widest mb-4">
            Order <span className="text-cyan-laser">Received</span>
          </h2>
          <p className="text-slate-400 leading-relaxed mb-8">
            Your custom order has been submitted for review. We'll contact you at{" "}
            <span className="text-white font-bold">{customerEmail}</span> within{" "}
            <span className="text-cyan-laser font-bold">24–48 hours</span> to confirm
            your design and finalize payment.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-4 border border-slate-700 hover:border-cyan-laser text-slate-400 hover:text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
