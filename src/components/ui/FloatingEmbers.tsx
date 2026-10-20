"use client";

import React, { useMemo } from "react";

interface FloatingEmbersProps {
  count?: number;
  className?: string;
}

export default function FloatingEmbers({ count = 18, className = "" }: FloatingEmbersProps) {
  const embers = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${(i * 100) / count + (i % 3) * 2}%`,
      bottom: `${(i * 7) % 50}%`,
      size: `${2 + (i % 3) * 1.5}px`,
      duration: `${4 + (i % 5) * 1.5}s`,
      delay: `${(i * 0.4) % 3}s`,
      opacity: 0.25 + (i % 4) * 0.15,
    }));
  }, [count]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`}
    >
      {embers.map((ember) => (
        <span
          key={ember.id}
          style={{
            left: ember.left,
            bottom: ember.bottom,
            width: ember.size,
            height: ember.size,
            animation: `floatEmbers ${ember.duration} ease-in-out infinite`,
            animationDelay: ember.delay,
            opacity: ember.opacity,
          }}
          className="absolute rounded-full bg-gradient-to-t from-[#cba135] to-[#ffe8a3] shadow-[0_0_8px_rgba(203,161,53,0.8)]"
        />
      ))}
    </div>
  );
}
