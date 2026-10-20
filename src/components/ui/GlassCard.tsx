"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  ambientBlob?: boolean;
  enableTilt?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
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
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      setRotate({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="relative group/glass perspective-1000 h-full">
      {/* Soft Ambient Warmth behind the card */}
      {ambientBlob && (
        <div
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#cba135]/10 via-[#cba135]/5 to-transparent blur-2xl opacity-30 group-hover/glass:opacity-70 transition-opacity duration-700 pointer-events-none -z-10"
        />
      )}

      {/* Main Clean Frosted Glass Card */}
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
                scale: isHovered ? 1.015 : 1,
              }
            : {}
        }
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className={`
          relative h-full w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8
          backdrop-blur-xl bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent
          border border-white/10 group-hover/glass:border-[#cba135]/40
          shadow-[0_20px_45px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)]
          transition-colors duration-500 overflow-hidden
          ${className}
        `}
      >
        {/* Top Specular Glass Edge Highlight */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />

        {/* Subtle Interactive Cursor Spotlight */}
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: isHovered
              ? `radial-gradient(circle 200px at ${mousePos.x}% ${mousePos.y}%, rgba(203, 161, 53, 0.12), transparent 70%)`
              : "none",
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Card Content */}
        <div className="relative z-20 h-full flex flex-col">{children}</div>
      </motion.div>
    </div>
  );
}
