"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface Props {
  imageDataUrl: string | null;
  material: string;
}

// Renders a live mockup of the logo engraved on a material swatch
export default function MaterialPreview({ imageDataUrl, material }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // ---- Background texture ----
    const isSlate = material.toLowerCase().includes("slate");
    if (isSlate) {
      // Dark slate gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#1c1c1e");
      grad.addColorStop(0.4, "#2a2a2d");
      grad.addColorStop(1, "#111113");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Slate grain lines
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += 6) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * 3);
        ctx.lineTo(W, y + Math.random() * 3);
        ctx.stroke();
      }
    } else {
      // Wood grain gradient
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "#6b3f1c");
      grad.addColorStop(0.25, "#8b5524");
      grad.addColorStop(0.5, "#9c6030");
      grad.addColorStop(0.75, "#7a4820");
      grad.addColorStop(1, "#5d3315");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Wood grain lines
      for (let i = 0; i < 30; i++) {
        const x = (i / 30) * W;
        ctx.strokeStyle = `rgba(0,0,0,${0.06 + Math.random() * 0.08})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.bezierCurveTo(x + 10, H / 3, x - 10, (2 * H) / 3, x + 5, H);
        ctx.stroke();
      }
    }

    // ---- Rounded rect border ----
    const radius = 18;
    ctx.strokeStyle = isSlate ? "rgba(0,251,255,0.25)" : "rgba(255,200,100,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, W - 8, H - 8, radius);
    ctx.stroke();

    // ---- Logo overlay ----
    if (!imageDataUrl) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.font = `bold ${W * 0.08}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOUR LOGO", W / 2, H / 2);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const PAD = W * 0.15;
      const maxW = W - PAD * 2;
      const maxH = H - PAD * 2;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      const ix = (W - iw) / 2;
      const iy = (H - ih) / 2;

      if (isSlate) {
        // For dark slate: render logo as white (laser-etched look)
        // Use an offscreen canvas to convert logo to white using its alpha mask
        const off = document.createElement("canvas");
        off.width = W;
        off.height = H;
        const offCtx = off.getContext("2d")!;

        // 1. Draw the original image to capture its alpha shape
        offCtx.drawImage(img, ix, iy, iw, ih);

        // 2. Replace all color with white while preserving alpha
        offCtx.globalCompositeOperation = "source-in";
        offCtx.fillStyle = "white";
        offCtx.fillRect(0, 0, W, H);

        // 3. Composite the white logo onto the main canvas
        ctx.globalAlpha = 0.82;
        ctx.drawImage(off, 0, 0);
        ctx.globalAlpha = 1;

        // Subtle cyan glow ring
        const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.45);
        glow.addColorStop(0, "rgba(0,251,255,0.06)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
      } else {
        // For wood: burn the logo in using multiply blend
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.55;
        ctx.drawImage(img, ix, iy, iw, ih);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, material]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="rounded-2xl border border-slate-700 shadow-2xl w-full max-w-sm"
      />
      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
        {material || "Select Material"} Preview
      </p>
    </div>
  );
}
