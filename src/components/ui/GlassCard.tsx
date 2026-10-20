"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
  badgeColor?: "gold" | "emerald" | "amber";
  ambientBlob?: boolean;
  enableTilt?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  badge,
  badgeColor = "gold",
  ambientBlob = true,
  enableTilt = true,
  onClick,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setMousePos({ x: xPercent, y: yPercent });

    if (enableTilt) {
      // Calculate 3D tilt (-8 to +8 degrees)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      setRotate({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const badgeStyles = {
    gold: "bg-[#cba135]/15 border-[#cba135]/40 text-[#f5df9a]",
    emerald: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
    amber: "bg-amber-500/15 border-amber-500/40 text-amber-200",
  }[badgeColor];

  return (
    <div className="relative group/glass perspective-1000 h-full">
      {/* Ambient Breathing Campfire Glow Blob behind the card */}
      {ambientBlob && (
        <div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#cba135]/15 via-[#f3da8c]/10 to-[#96701b]/15 blur-2xl opacity-40 group-hover/glass:opacity-90 transition-opacity duration-700 pointer-events-none -z-10 animate-breathe-glow"
        />
      )}

      {/* Main Frosted Glassmorphism Card */}
      <motion.div
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        animate={
          enableTilt
            ? {
                rotateX: rotate.x,
                rotateY: rotate.y,
                scale: isHovered ? 1.02 : 1,
              }
            : {}
        }
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className={`
          relative h-full w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8
          backdrop-blur-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.015]
          border border-white/10 group-hover/glass:border-[#cba135]/50
          shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.18)]
          transition-colors duration-500 overflow-hidden
          ${className}
        `}
      >
        {/* Top Specular Edge Highlight (Refractive Glass Edge) */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />

        {/* Interactive Cursor Spotlight Glow (Shines through frosted glass) */}
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: isHovered
              ? `radial-gradient(circle 180px at ${mousePos.x}% ${mousePos.y}%, rgba(203, 161, 53, 0.18), transparent 70%)`
              : "none",
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Optional Gamified Achievement / Live Beacon Badge */}
        {badge && (
          <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-sm ${badgeStyles}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              {badge}
            </span>
          </div>
        )}

        {/* Card Content */}
        <div className="relative z-20 h-full flex flex-col">{children}</div>
      </motion.div>
    </div>
  );
}
