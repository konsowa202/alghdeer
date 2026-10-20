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

  // Sizing classes
  const sizeClasses = {
    sm: "px-4 py-2 text-xs tracking-wider gap-2",
    md: "px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm tracking-wider gap-2.5",
    lg: "px-8 sm:px-10 py-4 sm:py-4.5 text-sm sm:text-base tracking-widest gap-3",
  }[size];

  // Variant themes
  const variantStyles = {
    "liquid-gold": {
      base: "bg-gradient-to-r from-[#D4A73B] via-[#F3DA8C] to-[#C1942A] text-[#11100C] font-black border border-[#FFE8A3]/60 shadow-[0_10px_30px_-5px_rgba(203,161,53,0.5),inset_0_1px_2px_rgba(255,255,255,0.7)]",
      wave: "bg-gradient-to-r from-transparent via-white/40 to-transparent",
      ambient: breathe ? "animate-breathe-glow" : "hover:shadow-[0_15px_35px_rgba(203,161,53,0.65)]",
    },
    "liquid-glass": {
      base: "backdrop-blur-xl bg-white/[0.07] text-white font-bold border border-white/20 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5),inset_0_1px_1.5px_rgba(255,255,255,0.25)] hover:border-[#cba135]/60 hover:text-[#fae5a5]",
      wave: "bg-gradient-to-r from-[#cba135]/0 via-[#cba135]/25 to-[#cba135]/0",
      ambient: breathe ? "shadow-[0_0_20px_rgba(255,255,255,0.15)]" : "",
    },
    "liquid-outline": {
      base: "backdrop-blur-md bg-black/40 text-white font-medium border border-[#cba135]/40 hover:border-[#cba135] shadow-[0_5px_20px_rgba(0,0,0,0.4)]",
      wave: "bg-gradient-to-r from-transparent via-[#cba135]/20 to-transparent",
      ambient: "",
    },
  }[variant];

  const content = (
    <>
      {/* Top Specular Edge Highlight (Liquid Glass Reflection) */}
      <span className="pointer-events-none absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full z-20" />

      {/* Interactive Cursor Spotlight Glow */}
      <span
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 rounded-full"
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

      {/* Button Content Label + Icon */}
      <span className="relative z-20 flex items-center justify-center gap-2 drop-shadow-sm select-none">
        {icon && iconPosition === "left" && (
          <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </span>
        )}
        <span className="uppercase tracking-wider">{children}</span>
        {icon && iconPosition === "right" && (
          <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:scale-110">
            {icon}
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
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/40 z-30"
          />
        ))}
      </AnimatePresence>
    </>
  );

  const sharedClasses = `
    group relative inline-flex items-center justify-center
    rounded-full overflow-hidden text-center cursor-pointer
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
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96, y: 1 }}
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
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96, y: 1 }}
      transition={{ type: "spring", stiffness: 450, damping: 22 }}
      className={sharedClasses}
    >
      {content}
    </motion.button>
  );
}
