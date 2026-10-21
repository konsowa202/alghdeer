"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  badgeText?: string;
  badgeTone?: "gold" | "emerald" | "amber";
  interactiveTilt?: boolean;
  onClick?: () => void;
}

export default function LiquidGlassCard({
  children,
  className = "",
  badgeText,
  badgeTone = "gold",
  interactiveTilt = true,
  onClick,
}: LiquidGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse tilt physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactiveTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const badgeClass =
    badgeTone === "emerald"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
      : badgeTone === "amber"
      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
      : "bg-[#cba135]/15 text-[#fae5a5] border-[#cba135]/35";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX: interactiveTilt ? rotateX : 0,
        rotateY: interactiveTilt ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={`relative group rounded-2xl p-[1px] transition-all duration-300 ${
        isHovered ? "scale-[1.015] shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(203,161,53,0.15)]" : ""
      } ${className}`}
    >
      {/* 1. ELEGANT ROTATING LIQUID GOLD LIGHT BEAM (Thin 1px Border Shimmer) */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div
          className={`absolute -inset-[100%] ${
            isHovered ? "animate-liquid-spin-fast opacity-90" : "animate-liquid-spin opacity-40"
          } bg-[conic-gradient(from_0deg,transparent_0deg,#cba135_60deg,#ffd700_90deg,transparent_140deg,transparent_360deg)] transition-opacity duration-500`}
        />
      </div>

      {/* 2. REFINED AMBIENT HALO (Very subtle, never bleeds orange) */}
      <div
        className={`absolute inset-0 rounded-2xl -z-10 ${
          isHovered ? "opacity-30 blur-lg" : "opacity-10 blur-md"
        } bg-[#cba135] transition-opacity duration-500`}
      />

      {/* 3. SOLID OBSIDIAN GLASS CONTAINER (Guaranteed deep black, zero color bleed) */}
      <div className="relative h-full w-full rounded-[15px] bg-[#0c0d12] border border-white/[0.08] group-hover:border-[#cba135]/40 overflow-hidden flex flex-col transition-all duration-300">
        {/* Subtle Liquid Gold Sheen Sweep on hover */}
        <div
          className={`absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        {/* Gamified Badge Tag */}
        {badgeText && (
          <div className="absolute top-4 right-4 z-20">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-[8px] text-[10px] font-mono font-bold tracking-wider uppercase border shadow-sm ${badgeClass}`}
            >
              {badgeText}
            </span>
          </div>
        )}

        {children}
      </div>
    </motion.div>
  );
}
