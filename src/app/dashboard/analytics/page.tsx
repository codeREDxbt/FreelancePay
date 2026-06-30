/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { getUserContracts } from "@/lib/firebase/contracts";
import type { Contract } from "@/types";
import { ErrorBoundary } from "@/components/providers/error-boundary";

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
      d.setDate(1);
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

  const maxVolume = Math.max(...last6Months.map(m => m.volume), 10); // minimum scale 10

  return (
    <ErrorBoundary>
      <div className="p-8 lg:p-12 max-w-7xl mx-auto bg-bg-void min-h-screen text-ink-primary">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-headline-lg text-4xl lg:text-5xl font-bold tracking-tight mb-4">Analytics</h1>
            <p className="text-ink-secondary font-ui-label text-lg">Volume, performance, and trends over time.</p>
          </div>
          <div className="flex gap-4">
            <button type="button" className="neopop-button-base px-6 py-4 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              Last 6 Months
            </button>
            <button type="button" className="neopop-button-base px-6 py-4 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center gap-3">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="bg-bg-base border border-edge-neutral shadow-neopop p-8 lg:col-span-2 relative">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-12 border-b-2 border-edge-neutral pb-6">
              <div>
                <span className="font-mono-data text-ink-secondary uppercase tracking-widest text-xs font-bold block mb-2">Contract Volume</span>
                <div className="flex items-baseline gap-2">
                  {isLoading ? (
                    <RefreshCw className="w-8 h-8 animate-spin text-ink-secondary" />
                  ) : (
                    <span className="font-headline-lg text-5xl font-bold tracking-tighter text-accent">{totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  )}
                  <span className="font-mono-data text-ink-tertiary">USDC</span>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="font-ui-label text-accent flex items-center gap-2 text-sm font-bold uppercase tracking-widest bg-accent/10 px-3 py-1.5 border border-accent/20">
                  <TrendingUp className="w-4 h-4" />
                  Active: {activeContracts}
                </span>
              </div>
            </div>
            
            {/* Dynamic Chart Area */}
            <div className="h-72 flex items-end gap-3 sm:gap-6">
              {last6Months.map((m, i) => {
                const height = Math.max(5, (m.volume / maxVolume) * 100);
                return (
                <div key={m.label + i} className="flex-1 flex flex-col justify-end group h-full">
                  <div 
                    className="w-full bg-ink-tertiary/20 group-hover:bg-accent border-t-4 border-transparent group-hover:border-accent transition-all relative flex flex-col justify-end"
                    style={{ height: `${height}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ink-primary text-bg-base px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono-data font-bold text-xs pointer-events-none whitespace-nowrap">
                      ${m.volume.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-4 text-center font-mono-data font-bold text-xs text-ink-secondary uppercase tracking-widest border-t-2 border-edge-neutral pt-2">
                    {m.label}
                  </div>
                </div>
              )})}
            </div>
          </div>

          <div className="flex flex-col gap-12">
            <div className="bg-bg-base border border-edge-neutral shadow-neopop p-8 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-edge-neutral bg-bg-void" />
              <div className="w-20 h-20 border-2 border-edge-neutral bg-bg-void flex items-center justify-center text-ink-primary mb-8">
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-mono-data text-ink-secondary uppercase tracking-widest text-xs font-bold mb-4">Completion Rate</h3>
              <span className="font-headline-lg text-6xl font-bold tracking-tighter text-ink-primary mb-4">{completedRate}%</span>
              <p className="font-ui-label text-sm text-ink-tertiary">of total contracts successfully completed</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
