"use client";

import React, { useMemo, useState } from "react";
import type { BookingStatus } from "@/lib/bookings-types";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings-types";
import type {
  BookingAnalytics,
  DailyBookingPoint,
} from "@/lib/bookings-analytics";

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "#f5b942",
  confirmed: "#55b9ec",
  deposit: "#ae8cf4",
  completed: "#49c795",
  cancelled: "#ef7474",
};

export function BookingsAreaChart({ data }: { data: DailyBookingPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const width = 720;
  const height = 250;
  const margin = { top: 20, right: 18, bottom: 38, left: 38 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = Math.max(1, ...data.map((point) => point.count));
  const roundedMax = Math.max(2, Math.ceil(maxValue / 2) * 2);

  const points = useMemo(
    () =>
      data.map((point, index) => ({
        ...point,
        x: margin.left + (index / Math.max(1, data.length - 1)) * plotWidth,
        y: margin.top + plotHeight - (point.count / roundedMax) * plotHeight,
      })),
    [data, plotHeight, plotWidth, roundedMax]
  );

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const areaPath = points.length
    ? `${linePath} L${points[points.length - 1]!.x},${margin.top + plotHeight} L${points[0]!.x},${margin.top + plotHeight} Z`
    : "";
  const active = activeIndex === null ? null : points[activeIndex];
  const labelIndexes = new Set([0, 5, 10, 15, 20, 25, data.length - 1]);

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * width;
    const ratio = (x - margin.left) / plotWidth;
    const index = Math.round(ratio * (data.length - 1));
    setActiveIndex(Math.max(0, Math.min(data.length - 1, index)));
  }

  return (
    <div className="w-full" dir="ltr">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto min-h-[210px] touch-none select-none"
        role="img"
        aria-label="رسم يوضح عدد طلبات الحجز يومياً خلال آخر 30 يوماً"
        onPointerMove={onPointerMove}
        onPointerLeave={() => setActiveIndex(null)}
      >
        <defs>
          <linearGradient id="bookings-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cba135" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#cba135" stopOpacity="0.015" />
          </linearGradient>
          <filter id="bookings-line-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = margin.top + plotHeight - ratio * plotHeight;
          return (
            <g key={ratio}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.075)"
                strokeDasharray={ratio === 0 ? undefined : "4 6"}
              />
              <text
                x={margin.left - 9}
                y={y + 4}
                textAnchor="end"
                fill="rgba(255,255,255,0.35)"
                fontSize="11"
              >
                {Math.round(roundedMax * ratio)}
              </text>
            </g>
          );
        })}

        {points.map((point, index) =>
          labelIndexes.has(index) ? (
            <text
              key={point.date}
              x={point.x}
              y={height - 12}
              textAnchor="middle"
              fill="rgba(255,255,255,0.38)"
              fontSize="11"
            >
              {point.label}
            </text>
          ) : null
        )}

        <path d={areaPath} fill="url(#bookings-area-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#d4b458"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#bookings-line-glow)"
        />

        {points.map((point) => (
          <circle key={`dot-${point.date}`} cx={point.x} cy={point.y} r="2.4" fill="#d4b458">
            <title>{`${point.label}: ${point.count} طلبات`}</title>
          </circle>
        ))}

        {active ? (
          <g pointerEvents="none">
            <line
              x1={active.x}
              x2={active.x}
              y1={margin.top}
              y2={margin.top + plotHeight}
              stroke="rgba(212,180,88,0.45)"
              strokeDasharray="3 4"
            />
            <circle cx={active.x} cy={active.y} r="7" fill="#0b0c10" stroke="#e5c979" strokeWidth="3" />
          </g>
        ) : null}
      </svg>
      <div className="h-6 text-center text-xs" dir="rtl">
        {active ? (
          <span className="text-white/65">
            {active.label}: <strong className="text-[#e5c979]">{active.count} طلبات</strong>
            <span className="text-white/35"> · {active.website} من الموقع · {active.staff} من الفريق</span>
          </span>
        ) : (
          <span className="text-white/30">حرّك المؤشر على الرسم لعرض تفاصيل اليوم</span>
        )}
      </div>
    </div>
  );
}

export function StatusDonutChart({
  data,
  total,
}: {
  data: BookingAnalytics["statusDistribution"];
  total: number;
}) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-center gap-6 py-2">
      <div className="relative w-36 h-36 shrink-0" dir="ltr">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90" role="img" aria-label="توزيع الحجوزات حسب الحالة">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="14" />
          {total > 0
            ? data.map((item) => {
                const length = (item.count / total) * circumference;
                const currentOffset = offset;
                offset += length;
                return (
                  <circle
                    key={item.status}
                    cx="64"
                    cy="64"
                    r={radius}
                    fill="none"
                    stroke={STATUS_COLORS[item.status]}
                    strokeWidth="14"
                    strokeDasharray={`${Math.max(0, length - 1.5)} ${circumference}`}
                    strokeDashoffset={-currentOffset}
                    strokeLinecap="butt"
                  >
                    <title>{`${BOOKING_STATUS_LABELS[item.status]}: ${item.count}`}</title>
                  </circle>
                );
              })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" dir="rtl">
          <strong className="text-3xl text-white tabular-nums">{total}</strong>
          <span className="text-[11px] text-white/40">إجمالي الطلبات</span>
        </div>
      </div>
      <div className="w-full space-y-2.5">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-2.5 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[item.status] }} />
            <span className="text-white/55 flex-1">{BOOKING_STATUS_LABELS[item.status]}</span>
            <strong className="text-white tabular-nums">{item.count}</strong>
            <span className="w-9 text-left text-white/30 tabular-nums" dir="ltr">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookingFunnel({ flow }: { flow: BookingAnalytics["flow"] }) {
  const max = Math.max(1, flow[0]?.count ?? 0);
  return (
    <div className="space-y-4">
      {flow.map((stage, index) => (
        <div key={stage.status}>
          <div className="flex items-center justify-between gap-3 mb-2 text-xs">
            <span className="text-white/65 font-medium">{BOOKING_STATUS_LABELS[stage.status]}</span>
            <span className="text-white/45" dir="ltr">
              <strong className="text-white text-sm">{stage.count}</strong> · {stage.percentage}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.055] overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.max(stage.count > 0 ? 4 : 0, (stage.count / max) * 100)}%`,
                backgroundColor: STATUS_COLORS[stage.status],
              }}
            />
          </div>
          {index > 0 && stage.dropOff > 0 ? (
            <p className="mt-1.5 text-[10px] text-white/30">
              {stage.dropOff} لم ينتقلوا من المرحلة السابقة حالياً
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
