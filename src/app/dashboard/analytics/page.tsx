"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { getUserContracts } from "@/lib/firebase/contracts";
import type { Contract } from "@/types";

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  if (value && typeof value === "object" && "toDate" in value) {
    const v = value as { toDate: () => Date };
    return v.toDate();
  }
  return new Date(0);
}

export default function AnalyticsPage() {
  const { isConnected, publicKey } = useWallet();
  const [dataState, setDataState] = useState<{contracts: Contract[], isLoading: boolean}>({
    contracts: [],
    isLoading: true
  });

  useEffect(() => {
    let active = true;
    if (isConnected && publicKey) {
      getUserContracts(publicKey).then(data => {
        if (active) setDataState({ contracts: data, isLoading: false });
      }).catch(err => {
        console.error("Failed to load contracts", err);
        if (active) setDataState({ contracts: [], isLoading: false });
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDataState({ contracts: [], isLoading: false });
    }
    return () => { active = false; };
  }, [isConnected, publicKey]);

  const { contracts, isLoading } = dataState;

  // Initialize last6Months
  const last6Months = (() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      result.push({
        label: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear(),
        volume: 0
      });
    }
    return result;
  })();

  // Single iteration for all metrics
  let totalVolume = 0;
  let activeContracts = 0;
  let closedContracts = 0;

  // Build a map for O(1) month lookups
  const monthMap = new Map();
  last6Months.forEach((m, i) => {
    monthMap.set(`${m.year}-${m.month}`, i);
  });

  for (const c of contracts) {
    const amt = Number(c.totalAmount || 0);
    totalVolume += amt;
    
    if (c.isClosed) {
      closedContracts++;
    } else if (!c.isDisputed) {
      activeContracts++;
    }

    if (c.createdAt) {
      const d = toDate(c.createdAt);
      const mIndex = monthMap.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (mIndex !== undefined) {
        last6Months[mIndex].volume += amt;
      }
    }
  }

  const completedRate = contracts.length > 0 
    ? ((closedContracts / contracts.length) * 100).toFixed(1)
    : "0.0";

  const maxVolume = Math.max(...last6Months.map(m => m.volume), 1000); // minimum scale 1000

  return (
    <div className="pt-24 pb-12 px-4 md:px-margin-desktop">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-section-gap">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">
            Analytics
          </h2>
          <p className="font-ui-label text-on-surface-variant mt-1">Volume, performance, and trends over time.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg font-ui-label text-ui-label flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
            <Calendar className="w-5 h-5" />
            Last 6 Months
          </button>
          <button type="button" className="px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg font-ui-label text-ui-label flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-section-gap">
        <div className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-ui-label text-on-surface-variant uppercase tracking-wider text-xs font-bold block mb-1">Contract Volume</span>
              <div className="flex items-baseline gap-2">
                {isLoading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-on-surface-variant" />
                ) : (
                  <span className="font-mono-data text-2xl text-on-background">{totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                )}
                <span className="font-ui-label text-on-surface-variant">USDC</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-ui-label text-primary flex items-center gap-1 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Active: {activeContracts}
              </span>
            </div>
          </div>
          
          {/* Dynamic Chart Area */}
          <div className="h-64 flex items-end gap-2 sm:gap-4 px-2">
            {last6Months.map((m, i) => {
              const height = Math.max(5, (m.volume / maxVolume) * 100);
              return (
              <div key={m.label + i} className="flex-1 flex flex-col justify-end group">
                <div 
                  className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors relative"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-on-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono-data pointer-events-none">
                    {m.volume}
                  </div>
                </div>
                <div className="mt-2 text-center font-mono-data text-xs text-on-surface-variant">
                  {m.label}
                </div>
              </div>
            )})}
          </div>
        </div>

        <div className="space-y-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl h-full flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">Completion Rate</h3>
            <span className="font-mono-data text-4xl text-on-background font-bold">{completedRate}%</span>
            <p className="font-ui-label text-sm text-on-surface-variant mt-2">of contracts completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
