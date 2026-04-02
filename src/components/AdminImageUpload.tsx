"use client";

import React, { useRef, useState } from "react";
import MaterialPreview from "@/components/MaterialPreview";

const ACCEPTED = ["image/svg+xml", "image/png"];

interface Props {
  material: string;            // passed in from the form (e.g. "Slate", "Wood")
  onUpload: (dataUrl: string) => void;
  existingUrl?: string;        // imageUrl already stored on the product
}

export default function AdminImageUpload({ material, onUpload, existingUrl }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(existingUrl || null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [logoSize, setLogoSize] = useState<number>(0.7);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setFileError("");
    if (!ACCEPTED.includes(file.type)) {
      setFileError("Only SVG or PNG files are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File must be under 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setDataUrl(url);
      setFileName(file.name);
      onUpload(url);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setDataUrl(null);
    setFileName("");
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      {!dataUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="glass border-2 border-dashed border-slate-700 hover:border-cyan-laser rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 group-hover:border-cyan-laser flex items-center justify-center transition-colors">
            <svg className="w-6 h-6 text-slate-400 group-hover:text-cyan-laser transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-bold text-white text-sm uppercase tracking-widest">Drop or Click to Upload</p>
            <p className="text-slate-500 text-xs mt-1">SVG or PNG · Max 5MB</p>
          </div>
          {fileError && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{fileError}</p>}
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-cyan-laser/40 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUrl} alt="uploaded" className="w-10 h-10 object-contain rounded-lg bg-slate-800 p-1" />
            <span className="text-cyan-laser text-sm font-mono truncate max-w-[200px]">{fileName || "Uploaded image"}</span>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => inputRef.current?.click()} className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">Change</button>
            <button type="button" onClick={handleRemove} className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">Remove</button>
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".svg,.png,image/svg+xml,image/png" className="hidden" onChange={handleChange} />

      {/* Live preview + size slider */}
      {dataUrl && (
        <div className="space-y-4 pt-2">
          <MaterialPreview imageDataUrl={dataUrl} material={material || "Slate"} size={logoSize} />
          <div className="space-y-2">
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
        </div>
      )}
    </div>
  );
}
