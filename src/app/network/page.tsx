"use client";

import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/animations/Reveal";
import { m, useScroll, useTransform } from 'framer-motion';
import { useRef } from "react";

export default function NetworkPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <div className="min-h-screen bg-background font-body-base text-on-surface overflow-hidden">
      <LandingNav />

      <main className="pt-24 pb-32 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal>
          <div className="mb-8 font-mono-data text-[11px] uppercase tracking-widest text-outline">
            <span className="text-primary font-medium">Stellar & Soroban</span>
          </div>
          <h1 className="font-headline-lg text-[42px] md:text-[52px] leading-[1.05] mb-8 text-on-surface tracking-tight max-w-3xl">
            Engineered for global finance.
          </h1>
          <p className="font-body-base text-lg text-on-surface-variant mb-16 leading-relaxed max-w-2xl">
            We built FreelancePay on the Stellar network because it was designed specifically for cross-border payments, high throughput, and rock-bottom fees.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20" ref={containerRef}>
          {/* Metrics */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {[
              { label: "Average Settlement Time", value: "< 5.0 seconds", icon: "timer" },
              { label: "Transaction Fee", value: "~$0.001 USD", icon: "payments" },
              { label: "Base Currency", value: "USDC (Circle)", icon: "universal_currency_alt" },
              { label: "Smart Contracts", value: "Soroban (WASM)", icon: "code_blocks" },
            ].map((metric, i) => (
              <Reveal key={metric.label} delay={i * 0.1}>
                <div className="flex items-center gap-6 p-6 border border-outline-variant/30 rounded-xl bg-surface-container-low">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary">{metric.icon}</span>
                  </div>
                  <div>
                    <p className="font-mono-data text-[10px] uppercase text-outline mb-1">{metric.label}</p>
                    <p className="font-headline-lg-mobile text-xl text-on-surface">{metric.value}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Visual abstract node */}
          <div className="lg:col-span-7 h-[500px] border border-outline-variant/30 rounded-2xl bg-surface-container-low relative overflow-hidden flex items-center justify-center">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
            
            <m.div style={{ y }} className="relative z-10 w-full max-w-sm">
              <div className="w-full aspect-square rounded-full border border-primary/20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_20s_linear_infinite]" />
              <div className="w-3/4 aspect-square rounded-full border border-primary/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_15s_linear_infinite_reverse]" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-5xl mb-2">public</span>
                <span className="font-mono-data text-xs text-primary font-bold tracking-widest">STELLAR_NETWORK</span>
              </div>
            </m.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

