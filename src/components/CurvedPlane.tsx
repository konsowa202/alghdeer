"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

/**
 * CurvedPlane — renders an image as N strips laid on a cylinder so the plane
 * can *bend* in real 3D (pure CSS transforms, no WebGL).
 *
 * bend  : total arc in radians (0 = flat). Sign flips convex/concave.
 * axis  : "x" bends around a horizontal axis (vertical edges curve),
 *         "y" bends around a vertical axis (horizontal edges curve).
 * The parent must have `transform-style: preserve-3d` and NO overflow-hidden.
 */
type Props = {
  src: string;
  alt?: string;
  bend: MotionValue<number>;
  axis?: "x" | "y";
  strips?: number;
  radius?: number; // corner radius in px
  imgY?: MotionValue<string> | string;
  imgScale?: MotionValue<number> | number;
  shade?: number; // how much edges darken as they turn away (0..1)
  tint?: number; // flat dark overlay (0..1)
  className?: string;
  outline?: boolean;
};

export default function CurvedPlane({
  src, alt = "", bend, axis = "x", strips = 16, radius = 22,
  imgY = "0%", imgScale = 1, shade = 0.55, tint = 0.25, className = "", outline = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const L = axis === "x" ? size.h : size.w; // length along the bend
  const seg = L / strips;

  return (
    <div ref={ref} role="img" aria-label={alt} className={`absolute inset-0 [transform-style:preserve-3d] ${className}`}>
      {L > 0 &&
        Array.from({ length: strips }, (_, i) => (
          <Strip
            key={i}
            i={i}
            n={strips}
            seg={seg}
            L={L}
            W={size.w}
            H={size.h}
            axis={axis}
            bend={bend}
            src={src}
            radius={radius}
            imgY={imgY}
            imgScale={imgScale}
            shade={shade}
            tint={tint}
            outline={outline}
          />
        ))}
    </div>
  );
}

function Strip({
  i, n, seg, L, W, H, axis, bend, src, radius, imgY, imgScale, shade, tint, outline,
}: {
  i: number; n: number; seg: number; L: number; W: number; H: number; axis: "x" | "y";
  bend: MotionValue<number>; src: string; radius: number;
  imgY: MotionValue<string> | string; imgScale: MotionValue<number> | number;
  shade: number; tint: number; outline: boolean;
}) {
  const c0 = (i + 0.5) * seg - L / 2; // strip centre on the flat plane

  const transform = useTransform(bend, (phi) => {
    if (Math.abs(phi) < 1e-4) return "none";
    const R = L / phi;
    const a = (phi * c0) / L;
    const d = R * Math.sin(a) - c0;
    const z = R * Math.cos(a) - R;
    const deg = (a * 180) / Math.PI;
    return axis === "x"
      ? `translate3d(0, ${d.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${(-deg).toFixed(3)}deg)`
      : `translate3d(${d.toFixed(2)}px, 0, ${z.toFixed(2)}px) rotateY(${deg.toFixed(3)}deg)`;
  });
  // darken via brightness (not overlays) so overlapping strip edges never double up into lines
  const filter = useTransform(bend, (phi) => {
    const sh = Math.min(0.9, Math.abs((phi * c0) / L) * 2 * shade);
    return `brightness(${((1 - tint) * (1 - sh)).toFixed(3)})`;
  });

  const first = i === 0;
  const last = i === n - 1;
  const r = `${radius}px`;
  const overlap = 1.2; // hide hairline seams
  const box: React.CSSProperties =
    axis === "x"
      ? {
          top: i * seg, left: 0, width: W, height: seg + (last ? 0 : overlap),
          borderTopLeftRadius: first ? r : 0, borderTopRightRadius: first ? r : 0,
          borderBottomLeftRadius: last ? r : 0, borderBottomRightRadius: last ? r : 0,
        }
      : {
          left: i * seg, top: 0, height: H, width: seg + (last ? 0 : overlap),
          borderTopLeftRadius: first ? r : 0, borderBottomLeftRadius: first ? r : 0,
          borderTopRightRadius: last ? r : 0, borderBottomRightRadius: last ? r : 0,
        };
  const imgBox: React.CSSProperties =
    axis === "x"
      ? { top: -i * seg - H * 0.1, left: 0, width: W, height: H * 1.2 }
      : { left: -i * seg, top: -H * 0.1, width: W, height: H * 1.2 };

  const edge = outline ? "rgba(241,231,133,0.95)" : "transparent";
  const borders: React.CSSProperties =
    axis === "x"
      ? { borderLeft: `2px solid ${edge}`, borderRight: `2px solid ${edge}`, borderTop: first ? `2px solid ${edge}` : undefined, borderBottom: last ? `2px solid ${edge}` : undefined }
      : { borderTop: `2px solid ${edge}`, borderBottom: `2px solid ${edge}`, borderLeft: first ? `2px solid ${edge}` : undefined, borderRight: last ? `2px solid ${edge}` : undefined };

  return (
    <motion.div
      style={{ ...box, transform, transformOrigin: "50% 50%", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
      className="absolute overflow-hidden"
    >
      <motion.img
        src={src}
        alt=""
        draggable={false}
        loading="lazy"
        style={{ ...imgBox, y: imgY, scale: imgScale, filter }}
        className="pointer-events-none absolute max-w-none select-none object-cover"
      />
      <div className="pointer-events-none absolute inset-0 transition-colors duration-300" style={{ ...borders, borderRadius: "inherit" }} />
    </motion.div>
  );
}
