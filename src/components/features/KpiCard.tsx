"use client";

import { m } from 'framer-motion';
import { useCountUp } from "@/hooks/useCountUp";

const colorMap = { primary: "text-primary", secondary: "text-secondary", tertiary: "text-tertiary" };
const bgMap = { primary: "bg-primary/8", secondary: "bg-secondary/8", tertiary: "bg-tertiary/8" };

export function KpiCard({
  label, value, unit, sub, subIcon, accent, delay,
}: {
  label: string;
  value: number;
  unit: string;
  sub: React.ReactNode;
  subIcon?: React.ReactNode;
  accent?: "primary" | "secondary" | "tertiary";
  delay?: number;
}) {
  const displayed = useCountUp(value);
  const accentColor = colorMap[accent ?? "primary"];
  const accentBg = bgMap[accent ?? "primary"];

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: delay ?? 0 }}
      whileHover={{ y: -3, boxShadow: "0 8px 30px rgba(0,0,0,0.07)" }}
      className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl cursor-default transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-ui-label text-on-surface-variant text-sm">{label}</span>
        <div className={`w-9 h-9 rounded-lg ${accentBg} flex items-center justify-center`}>
          {subIcon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono-data text-2xl font-bold text-on-background">
          {displayed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="font-ui-label text-on-surface-variant text-sm">{unit}</span>
      </div>
      <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${accentColor}`}>
        {sub}
      </div>
    </m.div>
  );
}

