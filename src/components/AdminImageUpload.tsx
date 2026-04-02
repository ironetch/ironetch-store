"use client";

import React, { useRef, useState, useEffect } from "react";
import MaterialPreview from "@/components/MaterialPreview";

const ACCEPTED = ["image/svg+xml", "image/png"];

interface Props {
  material: string;
  onUpload: (url: string) => void;
  existingUrl?: string;
}

export default function AdminImageUpload({ material, onUpload, existingUrl }: Props) {
  // previewSrc can be a data URL (after fresh upload) or a public URL (/uploads/...)
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [logoSize, setLogoSize] = useState<number>(0.7);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when the parent form loads async data (e.g. edit page)
  useEffect(() => {
    if (existingUrl && existingUrl !== "") {
      setPreviewSrc(existingUrl);
    }
  }, [existingUrl]);

  const handleFile = async (file: File) => {
    setFileError("");
    if (!ACCEPTED.includes(file.type)) {
      setFileError("Only SVG or PNG files are accepted.");
      return;
    }

    // Shrink PNG files client-side to prevent Vercel 4.5MB payload limit errors
    const processFile = async (originalFile: File): Promise<File> => {
      if (originalFile.type !== "image/png") return originalFile; // SVG stays vector
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let { width, height } = img;
            const max = 800; // max width/height to keep base64 tiny
            if (width > max || height > max) {
              if (width > height) { height = Math.round((height * max) / width); width = max; }
              else { width = Math.round((width * max) / height); height = max; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) resolve(new File([blob], originalFile.name, { type: "image/png" }));
              else resolve(originalFile);
            }, "image/png", 0.9);
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(originalFile);
      });
    };

    setIsUploading(true);
    try {
      const finalFile = await processFile(file);

      // Show local preview immediately from the processed/original file
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewSrc(ev.target?.result as string);
      reader.readAsDataURL(finalFile);

      // Upload to server → get back a small public URL (which is just a base64 string on Vercel)
      const form = new FormData();
      form.append("file", finalFile);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setFileError(data.error || "Upload failed");
        setPreviewSrc(existingUrl || null);
        return;
      }
      setFileName(finalFile.name);
      onUpload(data.url); // Pass the tiny URL to the parent form
    } catch {
      setFileError("Upload failed — check your connection.");
      setPreviewSrc(existingUrl || null);
    } finally {
      setIsUploading(false);
    }
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
    setPreviewSrc(null);
    setFileName("");
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* ── Upload zone or file pill ──────────────────────── */}
      {!previewSrc ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !isUploading && inputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-cyan-laser bg-slate-900/50 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-laser flex items-center justify-center transition-colors">
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-cyan-laser border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6 text-slate-400 group-hover:text-cyan-laser transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
          </div>
          <div className="text-center">
            <p className="font-bold text-white text-sm uppercase tracking-widest">
              {isUploading ? "Uploading…" : "Drop or Click to Upload"}
            </p>
            <p className="text-slate-500 text-xs mt-1">SVG or PNG · Max 10 MB</p>
          </div>
          {fileError && (
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{fileError}</p>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-cyan-laser/40 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="product"
              className="w-12 h-12 object-contain rounded-lg bg-slate-800 p-1"
              crossOrigin="anonymous"
            />
            <div>
              <p className="text-cyan-laser text-sm font-bold truncate max-w-xs">
                {fileName || previewSrc.split("/").pop() || "Image loaded"}
              </p>
              {isUploading && (
                <p className="text-slate-400 text-xs animate-pulse">Uploading…</p>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".svg,.png,image/svg+xml,image/png"
        className="hidden"
        onChange={handleChange}
      />

      {/* ── Live material preview + size slider ──────────── */}
      {previewSrc && (
        <div className="space-y-4 pt-2">
          <MaterialPreview
            imageDataUrl={previewSrc}
            material={material || "Slate"}
            size={logoSize}
          />
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Logo Size on Preview
              </label>
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
