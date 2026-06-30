"use client";

import { m } from 'framer-motion';
import { useCountUp } from "@/hooks/useCountUp";

const colorMap = { primary: "text-accent", secondary: "text-ink-primary", tertiary: "text-ink-secondary" };
const bgMap = { primary: "bg-accent/10", secondary: "bg-bg-interactive", tertiary: "bg-bg-interactive" };
const borderMap = { primary: "border-b-accent", secondary: "border-b-ink-primary", tertiary: "border-b-ink-secondary" };

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
  const accentBorder = borderMap[accent ?? "primary"];

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: delay ?? 0 }}
      whileHover={{ y: -3 }}
      className={`bg-bg-base border border-edge-neutral border-b-[4px] ${accentBorder} p-6 cursor-default transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-ui-label text-ink-tertiary text-xs uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-8 rounded ${accentBg} flex items-center justify-center`}>
          {subIcon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-mono-data tabular-nums text-4xl font-bold text-ink-primary tracking-tight">
          {displayed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span className="font-mono-data text-ink-secondary text-sm font-bold uppercase tracking-wider">{unit}</span>
      </div>
      <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-mono-data uppercase tracking-wider ${accentColor}`}>
        {sub}
      </div>
    </m.div>
  );
}
