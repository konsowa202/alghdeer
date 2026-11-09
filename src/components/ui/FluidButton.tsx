"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * FluidButton — port of the Framer "Fluid Button":
 * pill outline; on hover an elliptical fill rises from below and flattens to
 * cover the button, the label rolls up and a second label (inverted colour)
 * rolls in, the button scales slightly, and a soft pulse ring breathes at rest.
 */
type Props = {
  href: string;
  children: React.ReactNode; // label
  icon?: React.ReactNode;
  color?: string; // outline / fill / resting text
  textOnFill?: string; // text colour once filled
  borderOpacity?: number;
  scale?: number;
  pulse?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

const EASE = [0.4, 0, 0, 1] as const;
const T = { duration: 0.5, ease: EASE };

export default function FluidButton({
  href, children, icon, color = "#fafafa", textOnFill = "#071c17", borderOpacity = 1,
  scale = 1.05, pulse = true, className = "", onClick,
}: Props) {
  const [hover, setHover] = useState(false);
  const reduce = useReducedMotion();
  const on = hover;

  const label = (fg: string) => (
    <span className="flex items-center gap-3 whitespace-nowrap" style={{ color: fg }}>
      {children}
      {icon && <span className="grid place-items-center">{icon}</span>}
    </span>
  );

  return (
    <span className={`relative inline-flex ${className}`}>
      {/* breathing pulse ring at rest (outside the clipped button) */}
      {pulse && !reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 2px ${hexA(color, 0.55)}` }}
          initial={{ scale: 1, opacity: 0 }}
          animate={on ? { scale: 1, opacity: 0 } : { scale: [1, 1.18], opacity: [0.7, 0] }}
          transition={on ? { duration: 0.2 } : { duration: 1.8, repeat: Infinity, ease: "easeOut", repeatDelay: 0.4 }}
        />
      )}
    <motion.a
      href={href}
      onClick={onClick}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      animate={{ scale: on && !reduce ? scale : 1 }}
      whileTap={{ scale: 0.97 }}
      transition={T}
      className="group relative inline-flex min-h-[60px] w-full items-center justify-center overflow-hidden rounded-full px-10 py-5 text-base font-bold leading-none outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:min-h-[69px] sm:px-[50px] sm:text-[1.1rem]"
      style={{ boxShadow: `inset 0 0 0 2px ${hexA(color, borderOpacity)}`, WebkitTapHighlightColor: "transparent" }}
    >
      {/* rising fluid fill */}
      <motion.span
        aria-hidden
        initial={false}
        animate={
          on
            ? { top: "0%", height: "100%", borderRadius: "0%" }
            : { top: "105%", height: "110%", borderRadius: "50%" }
        }
        transition={T}
        className="pointer-events-none absolute inset-x-0 z-0"
        style={{ background: color }}
      />

      {/* rolling labels */}
      <span className="relative z-[1] block overflow-hidden">
        <motion.span initial={false} animate={{ y: on ? "-110%" : "0%" }} transition={T} className="block">
          {label(color)}
        </motion.span>
        <motion.span
          aria-hidden
          initial={false}
          animate={{ y: on ? "0%" : "110%" }}
          transition={T}
          className="absolute inset-0 block"
        >
          {label(textOnFill)}
        </motion.span>
      </span>

    </motion.a>
    </span>
  );
}

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
