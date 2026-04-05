"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface Props {
  imageDataUrl: string | null;
  material: string;
  size?: number; // 0.3 – 1.0, default 0.7
}

export default function MaterialPreview({ imageDataUrl, material, size = 0.7 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const isSlate = material.toLowerCase().includes("slate");

    // ── Background texture ────────────────────────────────────────────
    if (isSlate) {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#1c1c1e");
      grad.addColorStop(0.4, "#2a2a2d");
      grad.addColorStop(1, "#111113");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,0.025)";
      ctx.lineWidth = 1;
      for (let y = 0; y < H; y += 6) {
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * 3);
        ctx.lineTo(W, y + Math.random() * 3);
        ctx.stroke();
      }
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "#6b3f1c");
      grad.addColorStop(0.25, "#8b5524");
      grad.addColorStop(0.5, "#9c6030");
      grad.addColorStop(0.75, "#7a4820");
      grad.addColorStop(1, "#5d3315");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
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

    // ── Border ────────────────────────────────────────────────────────
    ctx.strokeStyle = isSlate ? "rgba(0,251,255,0.22)" : "rgba(255,200,100,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, W - 8, H - 8, 18);
    ctx.stroke();

    // ── Logo overlay ──────────────────────────────────────────────────
    if (!imageDataUrl) {
      ctx.fillStyle = isSlate ? "rgba(232,228,210,0.15)" : "rgba(0,0,0,0.15)";
      ctx.font = `bold ${W * 0.07}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOUR LOGO", W / 2, H / 2);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      // PAD is derived from size: size=1 → small pad (big logo), size=0.3 → large pad (small logo)
      const PAD = W * (0.05 + (1 - size) * 0.32);
      const maxW = W - PAD * 2;
      const maxH = H - PAD * 2;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const iw = img.width * scale;
      const ih = img.height * scale;
      const ix = (W - iw) / 2;
      const iy = (H - ih) / 2;

      if (isSlate) {
        // Off-white render: capture alpha from logo, fill with off-white
        const off = document.createElement("canvas");
        off.width = W;
        off.height = H;
        const offCtx = off.getContext("2d")!;
        offCtx.drawImage(img, ix, iy, iw, ih);
        offCtx.globalCompositeOperation = "source-in";
        offCtx.fillStyle = "#ffffff"; // pure white — laser-etched mark on slate
        offCtx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 0.95;
        ctx.drawImage(off, 0, 0);
        ctx.globalAlpha = 1;

        // Subtle cyan glow
        const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.45);
        glow.addColorStop(0, "rgba(0,251,255,0.05)");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
      } else {
        // Dark burn on wood using multiply
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.6;
        ctx.drawImage(img, ix, iy, iw, ih);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, material, size]);

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
