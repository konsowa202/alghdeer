"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LiquidButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: "liquid-gold" | "liquid-glass" | "liquid-outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  breathe?: boolean;
  gamifiedBurst?: boolean;
  showStub?: boolean;
  target?: string;
  rel?: string;
}

export default function LiquidButton({
  children,
  href,
  onClick,
  variant = "liquid-gold",
  size = "md",
  icon,
  iconPosition = "right",
  className = "",
  breathe = false,
  gamifiedBurst = true,
  showStub = true,
  target,
  rel,
}: LiquidButtonProps) {
  const buttonRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (gamifiedBurst && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 700);
    }
    if (onClick) onClick(e);
  };

  // Dimensions & Padding (Sharp Rectangular Ticket, ZERO ROUNDED CORNERS)
  const sizeClasses = {
    sm: "px-4 py-2 text-xs tracking-wider gap-2 min-h-[38px]",
    md: "px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm tracking-wider gap-3 min-h-[46px]",
    lg: "px-7 sm:px-9 py-3.5 sm:py-4 text-sm sm:text-base tracking-wider gap-3.5 min-h-[52px]",
  }[size];

  // Variant Themes
  const variantStyles = {
    "liquid-gold": {
      base: "bg-[linear-gradient(135deg,#A87E22_0%,#E6C86E_30%,#FBF0B9_50%,#CBA135_75%,#916817_100%)] text-[#0B0C10] font-black shadow-[0_12px_32px_rgba(203,161,53,0.45),inset_0_1px_2px_rgba(255,255,255,0.8)] border-y border-[#FFE8A3]/80",
      perforation: "border-[#0B0C10]/40",
      innerBorder: "border-[#0B0C10]/25",
      laserColor: "via-white",
      ambientGlow: breathe
        ? "shadow-[0_0_25px_rgba(203,161,53,0.65),0_12px_32px_rgba(203,161,53,0.45)]"
        : "hover:shadow-[0_0_35px_rgba(203,161,53,0.75),0_15px_40px_rgba(203,161,53,0.55)]",
    },
    "liquid-glass": {
      base: "backdrop-blur-xl bg-white/[0.07] text-white font-bold border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.25)] hover:border-[#cba135] hover:text-[#fae5a5]",
      perforation: "border-[#cba135]/40",
      innerBorder: "border-white/20 group-hover:border-[#cba135]/40",
      laserColor: "via-[#ffd700]",
      ambientGlow: breathe
        ? "shadow-[0_0_20px_rgba(203,161,53,0.3)]"
        : "hover:shadow-[0_0_30px_rgba(203,161,53,0.45)]",
    },
    "liquid-outline": {
      base: "backdrop-blur-md bg-black/60 text-white font-medium border border-[#cba135]/50 hover:border-[#cba135] shadow-[0_8px_25px_rgba(0,0,0,0.5)]",
      perforation: "border-[#cba135]/45",
      innerBorder: "border-[#cba135]/30",
      laserColor: "via-[#cba135]",
      ambientGlow: "hover:shadow-[0_0_25px_rgba(203,161,53,0.4)]",
    },
  }[variant];

  const content = (
    <>
      {/* Top & Bottom Inner Dashed Ticket Border Lines */}
      <span
        className={`pointer-events-none absolute inset-x-4 top-1 border-t border-dashed ${variantStyles.innerBorder} z-10 transition-colors`}
      />
      <span
        className={`pointer-events-none absolute inset-x-4 bottom-1 border-b border-dashed ${variantStyles.innerBorder} z-10 transition-colors`}
      />

      {/* CONTINUOUS GAMIFIED LASER SCANNER SWEEP (Active all the time) */}
      <span
        className={`pointer-events-none absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent ${variantStyles.laserColor} to-transparent opacity-75 z-20 animate-laser-sweep`}
      />

      {/* Continuous Liquid Gold Sheen Wave */}
      <span
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-gold-shimmer"
      />

      {/* Ticket Body Content */}
      <span className="relative z-20 flex items-center justify-between gap-3 select-none w-full">
        {/* Main Action Label */}
        <span className="flex items-center gap-2 font-black uppercase tracking-wider truncate">
          {icon && iconPosition === "left" && (
            <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
              {icon}
            </span>
          )}
          <span className="truncate">{children}</span>
          {icon && iconPosition === "right" && (
            <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:scale-110">
              {icon}
            </span>
          )}
        </span>

        {/* Perforated Divider (Tear-off line) + Ticket Stub */}
        {showStub && (
          <span className="inline-flex items-center gap-2 shrink-0 ps-1">
            {/* Vertical Perforated Dashed Line */}
            <span
              className={`h-5 w-px border-s-2 border-dashed ${variantStyles.perforation} opacity-80`}
            />

            {/* Mini Barcode Graphic */}
            <span className="flex items-center gap-[1.5px] h-4 py-0.5 opacity-85 group-hover:opacity-100 transition-opacity">
              <span className="w-[1.5px] h-full bg-current" />
              <span className="w-[2.5px] h-full bg-current" />
              <span className="w-[1px] h-3/4 bg-current" />
              <span className="w-[2px] h-full bg-current" />
              <span className="w-[1px] h-full bg-current" />
              <span className="w-[3px] h-full bg-current" />
            </span>

            {/* VIP Pass Tag */}
            <span className="hidden sm:inline-block font-mono text-[10px] font-black tracking-widest uppercase opacity-90">
              № 2026
            </span>
          </span>
        )}
      </span>

      {/* Gamified Click Ripple Bursts */}
      <AnimatePresence>
        {ripples.map((rip) => (
          <motion.span
            key={rip.id}
            initial={{ scale: 0, opacity: 0.9 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ left: rip.x, top: rip.y }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/40 z-30"
          />
        ))}
      </AnimatePresence>
    </>
  );

  const sharedClasses = `
    group relative inline-flex items-center justify-center
    ticket-mask-cutout rounded-none overflow-hidden text-center cursor-pointer
    transition-all duration-300
    ${sizeClasses}
    ${variantStyles.base}
    ${variantStyles.ambientGlow}
    ${className}
  `;

  if (href) {
    return (
      <motion.a
        ref={buttonRef}
        href={href}
        target={target}
        rel={rel}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96, y: 1 }}
        transition={{ type: "spring", stiffness: 450, damping: 20 }}
        className={sharedClasses}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96, y: 1 }}
      transition={{ type: "spring", stiffness: 450, damping: 20 }}
      className={sharedClasses}
    >
      {content}
    </motion.button>
  );
}
