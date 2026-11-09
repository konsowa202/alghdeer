"use client";

import React from "react";
import { motion, MotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Play } from "lucide-react";

export type AngledGalleryItem = {
  id: string;
  image: string;
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
};

type Props = {
  items: AngledGalleryItem[];
  isAr: boolean;
  progress: MotionValue<number>;
  onOpen: (index: number) => void;
};

const rotations = [5, -4, 4, -5];
const offsets = [-5, 5, -4, 4];

export default function AngledGallery({ items, isAr, progress, onOpen }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative -mx-4 space-y-5 overflow-hidden py-8 sm:-mx-6 sm:space-y-8 sm:py-12 lg:-mx-16">
      {items.map((item, index) => (
        <AngledCard
          key={item.id}
          item={item}
          index={index}
          isAr={isAr}
          progress={progress}
          reduced={Boolean(reduceMotion)}
          onOpen={() => onOpen(index)}
        />
      ))}
    </div>
  );
}

function AngledCard({ item, index, isAr, progress, reduced, onOpen }: {
  item: AngledGalleryItem;
  index: number;
  isAr: boolean;
  progress: MotionValue<number>;
  reduced: boolean;
  onOpen: () => void;
}) {
  const start = index * 0.1;
  const end = Math.min(start + 0.65, 1);
  const rotate = useTransform(progress, [start, end], reduced ? [0, 0] : [rotations[index], 0]);
  const x = useTransform(progress, [start, end], reduced ? ["0%", "0%"] : [`${offsets[index]}%`, "0%"]);
  const scale = useTransform(progress, [start, end], reduced ? [1, 1] : [1.08, 1]);

  return (
    <div className="px-2 sm:px-8">
      <motion.button
        type="button"
        onClick={onOpen}
        style={{ rotate, x, scale }}
        className="group relative block h-[42vh] min-h-[290px] w-full overflow-hidden rounded-[22px] border border-white/15 bg-[#111] text-center shadow-[0_30px_80px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] sm:h-[54vh] sm:min-h-[430px]"
      >
        <motion.img
          src={item.image}
          alt={isAr ? item.titleAr : item.titleEn}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          style={{ scale: reduced ? 1 : 1.04 }}
        />
        <div className="absolute inset-0 bg-black/35 transition-colors duration-500 group-hover:bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6" dir={isAr ? "rtl" : "ltr"}>
          <span className="mb-3 text-[10px] font-bold uppercase tracking-[0.32em] text-[#f1e785] sm:text-xs">
            {String(index + 1).padStart(2, "0")} — {isAr ? item.subAr : item.subEn}
          </span>
          <h3 className="max-w-5xl text-4xl font-black leading-[1.15] text-white drop-shadow-lg sm:text-6xl md:text-7xl">
            {isAr ? item.titleAr : item.titleEn}
          </h3>
          <span className="mt-6 inline-flex min-h-12 items-center gap-3 rounded-full border border-white/35 bg-black/20 px-5 py-3 text-xs font-bold backdrop-blur-md transition-all group-hover:border-[#f1e785] group-hover:bg-[#f1e785] group-hover:text-black sm:text-sm">
            <Play size={15} className="fill-current" />
            {isAr ? "شاهد التجربة" : "Watch the experience"}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
