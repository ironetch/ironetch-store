"use client";

import React, { useRef, useState, useEffect } from "react";
import MaterialPreview from "@/components/MaterialPreview";

const LOGO_TYPES = ["image/svg+xml", "image/png"];
const PHOTO_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg", "image/webp"];

interface Props {
  material: string;
  /** Called with the primary logo/preview data URL */
  onUpload: (url: string) => void;
  /** Called with updated real-product photos array */
  onPhotosChange?: (urls: string[]) => void;
  existingUrl?: string;
  existingPhotos?: string[];
}

export default function AdminImageUpload({
  material,
  onUpload,
  onPhotosChange,
  existingUrl,
  existingPhotos = [],
}: Props) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [logoSize, setLogoSize] = useState<number>(0.7);

  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string>("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Sync existing data from parent
  useEffect(() => {
    if (existingUrl && existingUrl !== "") setPreviewSrc(existingUrl);
  }, [existingUrl]);

  useEffect(() => {
    if (existingPhotos?.length) setPhotos(existingPhotos);
  }, [existingPhotos]);

  // ── Compress raster images to max 1200px ──────────────────
  const compressImage = (file: File, maxPx = 1200, quality = 0.88): Promise<File> =>
    new Promise((resolve) => {
      if (file.type === "image/svg+xml") return resolve(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxPx || height > maxPx) {
            if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
            else { width = Math.round((width * maxPx) / height); height = maxPx; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
          const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
          canvas.toBlob(
            (blob) => resolve(blob ? new File([blob], file.name, { type: outType }) : file),
            outType,
            quality
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

  // ── Upload to /api/upload ─────────────────────────────────
  const uploadFile = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url as string;
  };

  // ── LOGO / preview image handler ──────────────────────────
  const handleLogoFile = async (file: File) => {
    setFileError("");
    if (!LOGO_TYPES.includes(file.type)) {
      setFileError("Logo must be SVG or PNG.");
      return;
    }
    setIsUploading(true);
    try {
      const processed = await compressImage(file, 800);
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewSrc(ev.target?.result as string);
      reader.readAsDataURL(processed);
      const url = await uploadFile(processed);
      setFileName(processed.name);
      onUpload(url);
    } catch (e: any) {
      setFileError(e.message || "Upload failed.");
      setPreviewSrc(existingUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  // ── PRODUCT PHOTOS handler ────────────────────────────────
  const handlePhotoFiles = async (files: FileList) => {
    setPhotoError("");
    const fileArr = Array.from(files);
    const invalid = fileArr.find((f) => !PHOTO_TYPES.includes(f.type));
    if (invalid) { setPhotoError("Only JPG, PNG, WebP or SVG accepted."); return; }
    setPhotoUploading(true);
    try {
      const urls = await Promise.all(
        fileArr.map(async (f) => uploadFile(await compressImage(f, 1200, 0.88)))
      );
      const updated = [...photos, ...urls];
      setPhotos(updated);
      onPhotosChange?.(updated);
    } catch (e: any) {
      setPhotoError(e.message || "Photo upload failed.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = (idx: number) => {
    const updated = photos.filter((_, i) => i !== idx);
    setPhotos(updated);
    onPhotosChange?.(updated);
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: Logo / Laser Preview ──────────────────── */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Logo / Etching Preview (SVG or PNG)
        </p>

        {!previewSrc ? (
          <div
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleLogoFile(f); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !isUploading && logoInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-laser bg-slate-900/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 group-hover:border-cyan-laser flex items-center justify-center transition-colors">
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-cyan-laser border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-slate-400 group-hover:text-cyan-laser" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
            </div>
            <p className="font-bold text-white text-sm uppercase tracking-widest">
              {isUploading ? "Uploading…" : "Drop or Click to Upload Logo"}
            </p>
            <p className="text-slate-500 text-xs">SVG or PNG · Max 10 MB</p>
            {fileError && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{fileError}</p>}
          </div>
        ) : (
          <div className="bg-slate-900 border border-cyan-laser/40 rounded-2xl overflow-hidden">
            {/* Full-square image preview */}
            <div className="aspect-square w-full bg-slate-800 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt="product logo"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <div className="px-4 py-3 flex items-center justify-between border-t border-slate-800">
              <p className="text-cyan-laser text-xs font-bold truncate max-w-[200px]">
                {fileName || "Image loaded"}
              </p>
              <div className="flex gap-4">
                <button type="button" onClick={() => logoInputRef.current?.click()}
                  className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                  Change
                </button>
                <button type="button" onClick={() => { setPreviewSrc(null); setFileName(""); onUpload(""); if (logoInputRef.current) logoInputRef.current.value = ""; }}
                  className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors">
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        <input ref={logoInputRef} type="file" accept=".svg,.png,image/svg+xml,image/png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); }} />

        {/* Material Preview */}
        {previewSrc && (
          <div className="space-y-3 pt-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Preview — How it looks engraved</p>
            <div className="rounded-2xl overflow-hidden border border-slate-700">
              <MaterialPreview imageDataUrl={previewSrc} material={material || "Slate"} size={logoSize} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logo Size on Preview</label>
                <span className="text-xs text-cyan-laser font-bold">{Math.round(logoSize * 100)}%</span>
              </div>
              <input type="range" min={0.3} max={1.0} step={0.05} value={logoSize}
                onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                className="w-full accent-cyan-laser cursor-pointer" />
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Real Product Photos ───────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Product Photos (JPG / PNG / WebP)
          </p>
          <button type="button" onClick={() => photoInputRef.current?.click()}
            disabled={photoUploading}
            className="text-xs font-bold text-cyan-laser hover:text-white uppercase tracking-widest transition-colors disabled:opacity-50">
            {photoUploading ? "Uploading…" : "+ Add Photos"}
          </button>
        </div>

        {photoError && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{photoError}</p>}

        {photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`product photo ${i + 1}`} className="w-full h-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            {/* Add more tile */}
            <div
              onClick={() => photoInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-laser flex items-center justify-center cursor-pointer transition-colors group"
            >
              <span className="text-2xl text-slate-600 group-hover:text-cyan-laser transition-colors">+</span>
            </div>
          </div>
        ) : (
          <div
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files?.length) handlePhotoFiles(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => photoInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-laser bg-slate-900/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <p className="font-bold text-slate-400 text-sm">Drop photos or click to browse</p>
            <p className="text-slate-600 text-xs">JPG, PNG, WebP · Multiple files OK</p>
          </div>
        )}

        <input
          ref={photoInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files?.length) handlePhotoFiles(e.target.files); }}
        />
      </div>
    </div>
  );
}
