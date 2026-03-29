"use client";

import React, { useState } from 'react';

const LogoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = () => {
    setIsUploading(true);
    // Mock upload delay
    setTimeout(() => {
        setIsUploading(false);
        setFileName("company-logo.svg");
    }, 2000);
  };

  return (
    <div className="glass p-6 rounded-2xl border border-slate-800 cyan-glow">
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-cyan-laser transition-colors cursor-pointer" onClick={handleUpload}>
        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-4">
          <svg className={`w-6 h-6 ${isUploading ? 'animate-bounce text-cyan-laser' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        
        {isUploading ? (
          <p className="text-cyan-laser font-bold animate-pulse">UPLOADING LOGO...</p>
        ) : fileName ? (
          <div className="text-center">
            <p className="text-white font-bold mb-1">UPLOADED!</p>
            <p className="text-slate-400 text-xs">{fileName}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-white font-bold mb-1">UPLOAD YOUR LOGO</p>
            <p className="text-slate-500 text-xs">Vector (SVG) or high-res PNG preferred</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-[0.2em]">
        <svg className="w-3 h-3 text-cyan-laser" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Secure Industrial-Grade Encryption
      </div>
    </div>
  );
};

export default LogoUpload;
