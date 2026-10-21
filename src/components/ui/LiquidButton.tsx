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
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

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

  // 16px corner geometry (Luxury standard, no bubble pill shapes)
  const sizeClasses = {
    sm: "px-4 py-2 text-xs tracking-wider gap-2 rounded-[14px]",
    md: "px-5 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm tracking-wider gap-2.5 rounded-[16px]",
    lg: "px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base tracking-wider gap-3 rounded-[16px]",
  }[size];

  // Variant themes
  const variantStyles = {
    "liquid-gold": {
      base: "bg-gradient-to-r from-[#D4A73B] via-[#F3DA8C] to-[#C1942A] text-[#11100C] font-black border border-[#FFE8A3]/70 shadow-[0_10px_25px_-5px_rgba(203,161,53,0.45),inset_0_1px_2px_rgba(255,255,255,0.7)]",
      wave: "bg-gradient-to-r from-transparent via-white/40 to-transparent",
      ambient: breathe ? "animate-breathe-glow" : "hover:shadow-[0_15px_35px_rgba(203,161,53,0.65)]",
      perforation: "border-[#11100C]/30",
      notchBg: "bg-[#06070a] border-[#D4A73B]/70",
      laserColor: "via-[#ff3b30]",
    },
    "liquid-glass": {
      base: "backdrop-blur-xl bg-white/[0.07] text-white font-bold border border-white/20 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.25)] hover:border-[#cba135]/60 hover:text-[#fae5a5]",
      wave: "bg-gradient-to-r from-[#cba135]/0 via-[#cba135]/25 to-[#cba135]/0",
      ambient: breathe ? "shadow-[0_0_20px_rgba(255,255,255,0.15)]" : "",
      perforation: "border-white/30",
      notchBg: "bg-[#06070a] border-white/30 group-hover:border-[#cba135]",
      laserColor: "via-[#fae5a5]",
    },
    "liquid-outline": {
      base: "backdrop-blur-md bg-black/50 text-white font-medium border border-[#cba135]/50 hover:border-[#cba135] shadow-[0_5px_20px_rgba(0,0,0,0.4)]",
      wave: "bg-gradient-to-r from-transparent via-[#cba135]/20 to-transparent",
      ambient: "",
      perforation: "border-[#cba135]/35",
      notchBg: "bg-[#06070a] border-[#cba135]/50 group-hover:border-[#cba135]",
      laserColor: "via-[#cba135]",
    },
  }[variant];

  const content = (
    <>
      {/* Side Ticket Cutout Notches (Inspired by retro ticket reference) */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -start-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border shadow-inner z-30 transition-transform duration-300 group-hover:scale-125 ${variantStyles.notchBg}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border shadow-inner z-30 transition-transform duration-300 group-hover:scale-125 ${variantStyles.notchBg}`}
      />

      {/* Top Specular Edge Highlight (Liquid Glass Reflection) */}
      <span className="pointer-events-none absolute inset-x-3 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-[16px] z-20" />

      {/* Interactive Cursor Spotlight Glow */}
      <span
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 rounded-[16px]"
        style={{
          background: isHovered
            ? `radial-gradient(circle 90px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.35), transparent 70%)`
            : "none",
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Flowing Liquid Wave Layer */}
      <motion.span
        className={`pointer-events-none absolute inset-0 z-0 ${variantStyles.wave}`}
        initial={{ x: "-100%" }}
        animate={isHovered ? { x: ["-100%", "100%"] } : { x: "-100%" }}
        transition={{ duration: 1.2, ease: "easeInOut", repeat: isHovered ? Infinity : 0 }}
      />

      {/* Gamification: Laser Scanner Sweep on Hover */}
      <motion.span
        className={`pointer-events-none absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent ${variantStyles.laserColor} to-transparent shadow-[0_0_12px_rgba(255,215,0,0.8)] z-30 opacity-0 group-hover:opacity-100`}
        initial={{ left: "-10%" }}
        animate={isHovered ? { left: ["-10%", "110%"] } : { left: "-10%" }}
        transition={{ duration: 1.0, ease: "easeInOut", repeat: isHovered ? Infinity : 0 }}
      />

      {/* Button Content Label + Perforated Ticket Stub */}
      <span className="relative z-20 flex items-center justify-between gap-2.5 drop-shadow-sm select-none w-full">
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

        {/* Perforated Divider (Tear-off line) + Ticket Stub Barcode */}
        {showStub && (
          <span className="inline-flex items-center gap-2 shrink-0 ps-1">
            {/* Vertical Perforated Dashed Line */}
            <span
              className={`h-4.5 w-px border-s-2 border-dashed ${variantStyles.perforation} opacity-70`}
            />

            {/* Mini Barcode Graphic */}
            <span className="flex items-center gap-[1.5px] h-3.5 py-0.5 opacity-75 group-hover:opacity-100 transition-opacity">
              <span className="w-[1.5px] h-full bg-current rounded-[0.5px]" />
              <span className="w-[2.5px] h-full bg-current rounded-[0.5px]" />
              <span className="w-[1px] h-3/4 bg-current rounded-[0.5px]" />
              <span className="w-[2px] h-full bg-current rounded-[0.5px]" />
              <span className="w-[1px] h-full bg-current rounded-[0.5px]" />
              <span className="w-[3px] h-full bg-current rounded-[0.5px]" />
            </span>

            {/* ADMIT VIP stamp */}
            <span className="hidden sm:inline-block font-mono text-[9px] font-black tracking-widest uppercase opacity-80">
              VIP
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
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            style={{ left: rip.x, top: rip.y }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-[16px] bg-white/40 z-30"
          />
        ))}
      </AnimatePresence>
    </>
  );

  const sharedClasses = `
    group relative inline-flex items-center justify-center
    overflow-hidden text-center cursor-pointer
    transition-all duration-300
    ${sizeClasses}
    ${variantStyles.base}
    ${variantStyles.ambient}
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
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97, y: 1 }}
        transition={{ type: "spring", stiffness: 450, damping: 22 }}
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
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97, y: 1 }}
      transition={{ type: "spring", stiffness: 450, damping: 22 }}
      className={sharedClasses}
    >
      {content}
    </motion.button>
  );
}
