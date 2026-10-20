"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface LiquidFlameCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "fire" | "gold" | "crimson";
  interactiveTilt?: boolean;
  intensity?: "normal" | "intense";
  badgeText?: string;
  badgeTone?: "fire" | "gold" | "emerald";
  onClick?: () => void;
}

export default function LiquidFlameCard({
  children,
  className = "",
  glowColor = "fire",
  interactiveTilt = true,
  intensity = "normal",
  badgeText,
  badgeTone = "fire",
  onClick,
}: LiquidFlameCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["9deg", "-9deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-9deg", "9deg"]);

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

  // Gradient definitions based on glowColor
  const gradientClass =
    glowColor === "gold"
      ? "from-[#ffd700] via-[#ff9900] to-[#cba135]"
      : glowColor === "crimson"
      ? "from-[#ff0055] via-[#ff4500] to-[#ffaa00]"
      : "from-[#ff3700] via-[#ff9500] to-[#ffd000]";

  const badgeClass =
    badgeTone === "gold"
      ? "bg-[#cba135]/20 text-[#ffd56b] border-[#cba135]/40"
      : badgeTone === "emerald"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
      : "bg-orange-500/20 text-orange-300 border-orange-500/40";

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
      className={`relative group rounded-3xl p-[2px] transition-all duration-300 ${
        isHovered ? "scale-[1.02] shadow-[0_20px_50px_rgba(255,80,0,0.22)]" : ""
      } ${className}`}
    >
      {/* 1. OUTER ROTATING LIQUID FLAME BORDER */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div
          className={`absolute -inset-[150%] ${
            isHovered ? "animate-liquid-spin-fast" : "animate-liquid-spin"
          } bg-[conic-gradient(from_0deg,#ff1e00,#ff8000,#ffd000,#ff1e00)] opacity-70 group-hover:opacity-100 transition-opacity duration-500`}
        />
      </div>

      {/* 2. GLOWING MOLTEN HALO (Liquid Aura Blur) */}
      <div
        className={`absolute inset-0 rounded-3xl -z-10 ${
          isHovered ? "animate-liquid-spin-fast opacity-90 blur-xl" : "animate-liquid-spin opacity-45 blur-lg"
        } bg-[conic-gradient(from_0deg,#ff1e00,#ff8000,#ffd000,#ff1e00)] transition-all duration-500`}
      />

      {/* 3. INNER OBSIDIAN GLASS CONTAINER */}
      <div className="relative h-full w-full rounded-[22px] bg-[#0c0d12]/92 backdrop-blur-2xl border border-white/[0.08] group-hover:border-white/20 overflow-hidden flex flex-col transition-colors duration-300">
        {/* Liquid Sheen sweep reflection on hover */}
        <div
          className={`absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
            isHovered ? "translate-x-full" : "-translate-x-full"
          } duration-1000 ease-in-out`}
        />

        {/* Floating Sparks on hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <span className="absolute bottom-2 left-[20%] w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] animate-spark-rise" style={{ animationDelay: "0ms" }} />
            <span className="absolute bottom-3 left-[50%] w-2 h-2 rounded-full bg-orange-500 blur-[0.5px] animate-spark-rise" style={{ animationDelay: "400ms" }} />
            <span className="absolute bottom-1 left-[75%] w-1 h-1 rounded-full bg-yellow-300 blur-[0.5px] animate-spark-rise" style={{ animationDelay: "800ms" }} />
          </div>
        )}

        {/* Optional Gamified Badge Tag */}
        {badgeText && (
          <div className="absolute top-4 right-4 z-20">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase border shadow-sm ${badgeClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {badgeText}
            </span>
          </div>
        )}

        {children}
      </div>
    </motion.div>
  );
}
