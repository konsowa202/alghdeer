"use client";

import React, { useEffect, useState } from "react";

/** تشتت إضاءة الحافة — عالي = حافة غير متجانسة (لا نعتمد إزالة الخلفية). */
function analyzeEdgeVariance(imageData: ImageData, w: number, h: number) {
  const d = imageData.data;
  const lumas: number[] = [];
  const push = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    lumas.push(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    push(0, y);
    push(w - 1, y);
  }
  const n = lumas.length;
  const meanL = lumas.reduce((a, b) => a + b, 0) / n;
  let v = 0;
  for (const L of lumas) v += (L - meanL) ** 2;
  return v / n;
}

function edgeMeanRgb(imageData: ImageData, w: number, h: number) {
  const d = imageData.data;
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const add = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
    n++;
  };
  for (let x = 0; x < w; x++) {
    add(x, 0);
    add(x, h - 1);
  }
  for (let y = 1; y < h - 1; y++) {
    add(0, y);
    add(w - 1, y);
  }
  return { r: r / n, g: g / n, b: b / n };
}

const processedCache = new Map<string, string>();

type Props = {
  src: string;
  className?: string;
  alt?: string;
};

/**
 * يحوّل شعار JPEG (خلفية مسطّحة من الحواف) إلى PNG شفاف في المتصفح.
 * لو الحافة غير متجانسة (شعار لاصق بالحافة) يُعرض الملف الأصلي بدون معالجة.
 */
export default function ClientLogoKnockoutImg({ src, className, alt = "" }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(() => processedCache.get(src) ?? null);

  useEffect(() => {
    const cached = processedCache.get(src);
    if (cached) {
      setDataUrl(cached);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;

      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (nw < 2 || nh < 2) {
        if (!cancelled) {
          processedCache.set(src, "__orig__");
          setDataUrl("__orig__");
        }
        return;
      }

      const maxDim = 720;
      const scale = Math.min(1, maxDim / Math.max(nw, nh));
      const w = Math.max(2, Math.round(nw * scale));
      const h = Math.max(2, Math.round(nh * scale));

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        if (!cancelled) {
          processedCache.set(src, "__orig__");
          setDataUrl("__orig__");
        }
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      let imageData: ImageData;
      try {
        imageData = ctx.getImageData(0, 0, w, h);
      } catch {
        if (!cancelled) {
          processedCache.set(src, "__orig__");
          setDataUrl("__orig__");
        }
        return;
      }

      const d0 = imageData.data;
      let edgeAlphaSum = 0;
      let edgeAlphaN = 0;
      const bump = (x: number, y: number) => {
        const j = (y * w + x) * 4;
        edgeAlphaSum += d0[j + 3];
        edgeAlphaN++;
      };
      for (let x = 0; x < w; x++) {
        bump(x, 0);
        bump(x, h - 1);
      }
      for (let y = 1; y < h - 1; y++) {
        bump(0, y);
        bump(w - 1, y);
      }
      /** PNG أصلاً فيه شفافية — نعرضه كما هو */
      if (edgeAlphaN > 0 && edgeAlphaSum / edgeAlphaN < 252) {
        if (!cancelled) {
          processedCache.set(src, "__orig__");
          setDataUrl("__orig__");
        }
        return;
      }

      const variance = analyzeEdgeVariance(imageData, w, h);
      const { r: br, g: bg, b: bb } = edgeMeanRgb(imageData, w, h);

      /** حافة شديدة التباين = غالباً شعار لاصق بالإطار — لا نمسح */
      const MAX_EDGE_VARIANCE = 520;
      if (variance > MAX_EDGE_VARIANCE) {
        if (!cancelled) {
          processedCache.set(src, "__orig__");
          setDataUrl("__orig__");
        }
        return;
      }

      const tol = 46;
      const d = d0;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const dr = Math.abs(r - br);
        const dg = Math.abs(g - bg);
        const db = Math.abs(b - bb);
        const cheb = Math.max(dr, dg, db);

        if (cheb <= tol) {
          d[i + 3] = 0;
        } else {
          const y = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          d[i] = y;
          d[i + 1] = y;
          d[i + 2] = y;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      let out: string;
      try {
        out = canvas.toDataURL("image/png");
      } catch {
        if (!cancelled) {
          processedCache.set(src, "__orig__");
          setDataUrl("__orig__");
        }
        return;
      }

      if (cancelled) return;
      processedCache.set(src, out);
      setDataUrl(out);
    };

    img.onerror = () => {
      if (!cancelled) {
        processedCache.set(src, "__orig__");
        setDataUrl("__orig__");
      }
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  const effective = dataUrl === "__orig__" || dataUrl === null ? src : dataUrl;

  return (
    <img
      src={effective}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}
