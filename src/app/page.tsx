"use client";

import Link from "next/link";
import { useRef } from "react";
import { m, useScroll, useTransform } from 'framer-motion';
import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/animations/Reveal";
import { Counter } from "@/components/ui/animations/Counter";

const steps = [
  {
    num: "01",
    icon: "contract",
    title: "Create Contract",
    desc: "Define milestones, payment amounts, and terms using our visual contract builder. No coding required.",
  },
  {
    num: "02",
    icon: "account_balance_wallet",
    title: "Fund Escrow",
    desc: "Client deposits USDC into a secure Stellar smart contract. Funds are locked and visible to both parties.",
  },
  {
    num: "03",
    icon: "release_alert",
    title: "Release on Milestones",
    desc: "Once milestones are approved, funds instantly release to the contractor's wallet via Soroban contracts.",
  },
];

const stats = [
  { value: 500, suffix: "+", label: "Global Teams" },
  { value: 180, suffix: "+", label: "Countries Supported" },
  { value: 99, suffix: ".9%", label: "Uptime SLA" },
];

function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section ref={heroRef} className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop pt-16 md:pt-32 pb-24 border-b border-outline-variant/20 overflow-visible">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative">
        <div className="lg:col-span-7 max-w-2xl">
          {/* Breadcrumb / Label */}
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 mb-8 font-mono-data text-[11px] uppercase tracking-widest text-outline"
          >
            <span className="text-primary font-medium">Contract</span>
            <span className="material-symbols-outlined text-[12px] opacity-40">chevron_right</span>
            <span>New_Agreement.env</span>
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="font-headline-lg text-[42px] md:text-[52px] leading-[1.05] mb-8 text-on-surface tracking-tight max-w-xl"
          >
            Programmable trust for the technical workforce.
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="font-body-base text-lg text-on-surface-variant mb-12 leading-relaxed max-w-lg"
          >
            Automate your payment workflow with milestone-based escrow. Verified via Soroban smart contracts on the Stellar network. No intermediaries, no friction.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8"
          >
            <div className="flex flex-col gap-4 w-full sm:w-auto">
              <Link
                href="/auth"
                className="bg-primary text-on-primary px-10 py-4 rounded-lg font-ui-label text-ui-label btn-primary-inset hover:opacity-90 transition-all text-center inline-block"
              >
                Initialize Application
              </Link>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="font-mono-data text-[12px] text-outline">AUDIT_STATUS:</span>
                <span className="font-mono-data text-[12px] text-primary">SECURED_V2.1</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="font-mono-data text-[12px] text-outline">NETWORK_LATENCY:</span>
                <span className="font-mono-data text-[12px]">5.2s_AVG</span>
              </div>
            </div>
          </m.div>
        </div>

        {/* Technical Blueprint Diagram */}
        <m.div
          style={{ y: cardY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="lg:col-span-5 relative w-full aspect-square md:aspect-video lg:aspect-square bg-surface-container-low rounded-lg border border-outline-variant/30 overflow-hidden bg-[radial-gradient(circle,var(--color-outline-variant)_1px,transparent_1px)] bg-[size:24px_24px]"
        >
          <div className="absolute inset-0 p-8 flex flex-col font-mono-data">
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <p className="text-[10px] text-outline uppercase">Schema_ID</p>
                <p className="text-[12px] text-on-surface">SOROBAN_ESCROW_MAIN_01</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] text-outline uppercase">Timestamp</p>
                <p className="text-[12px] text-on-surface">2024.05.12_14:30:01</p>
              </div>
            </div>
            
            {/* Abstract Blueprint Elements */}
            <div className="flex-1 flex flex-col justify-center items-center relative">
              {/* Central Lock Node */}
              <div className="w-32 h-32 border border-primary/40 rounded-full flex items-center justify-center relative">
                <div className="w-24 h-24 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
                <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                
                {/* Connection Lines */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-12 bg-primary/30" />
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-12 bg-primary/30" />
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-px bg-primary/30" />
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-px bg-primary/30" />
              </div>
              
              {/* Flow Labels */}
              <div className="absolute top-0 left-0 space-y-4 opacity-40">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-px bg-outline" />
                  <span className="text-[10px]">AUTH_REQ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-px bg-outline" />
                  <span className="text-[10px]">VAL_SIG</span>
                </div>
              </div>
              
              <div className="absolute bottom-0 right-0 space-y-4 text-right opacity-40">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px]">RELEASE_CALLBACK</span>
                  <div className="w-3 h-px bg-outline" />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-[10px]">TX_FINALIZED</span>
                  <div className="w-3 h-px bg-outline" />
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex items-end justify-between border-t border-outline-variant/30 pt-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 border border-outline-variant rounded flex items-center justify-center">
                  <span className="text-[10px] text-outline">XLM</span>
                </div>
                <div className="w-8 h-8 border border-outline-variant rounded flex items-center justify-center">
                  <span className="text-[10px] text-outline">USDC</span>
                </div>
              </div>
              <div className="text-[10px] text-outline-variant font-mono-data">
                REF_SPEC: SEP-0024 | SOROBAN-WASM
              </div>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <Reveal className="bg-surface-container-low border-y border-outline-variant/30 py-12">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <m.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="font-mono-data text-3xl font-bold text-primary">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="font-ui-label text-sm text-on-surface-variant mt-1">{s.label}</p>
            </m.div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function LogosSection() {
  return (
    <Reveal className="bg-surface-container-low py-10 border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop text-center">
        <p className="font-mono-data text-[10px] uppercase tracking-widest text-outline mb-8">
          Trusted by 500+ global teams
        </p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 hover:opacity-70 transition-opacity duration-500">
          {[
            { icon: "terminal", name: "DEVSTR" },
            { icon: "token", name: "BLOCKWORKS" },
            { icon: "account_balance", name: "FINCORE" },
            { icon: "public", name: "GLOBEX" },
          ].map((logo, i) => (
            <m.div
              key={logo.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-2xl">{logo.icon}</span>
              <span className="font-headline-lg-mobile text-lg">{logo.name}</span>
            </m.div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

function StepsSection() {
  return (
    <section className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-28">
      <Reveal className="text-center mb-16">
        <h2 className="font-section-title text-section-title text-on-surface mb-4">How it Works</h2>
        <p className="text-on-surface-variant max-w-xl mx-auto">
          Three steps to secure commercial agreements on-chain.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connecting line desktop */}
        <div aria-hidden className="absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-[1px] bg-gradient-to-r from-transparent via-outline-variant to-transparent hidden md:block" />

        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.12}>
            <m.div
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(5,105,109,0.10)" }}
              className="bento-card p-8 rounded-xl cursor-default transition-shadow relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-primary/8 text-primary flex items-center justify-center rounded-xl">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </div>
                <span className="font-mono-data text-4xl font-bold text-outline/20 leading-none">{step.num}</span>
              </div>
              <h3 className="font-card-title text-on-surface mb-3">{step.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
            </m.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function WhyStellarSection() {
  return (
    <section className="bg-surface-container-low border-y border-outline-variant/40 py-28">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <Reveal className="max-w-xl">
            <h2 className="font-section-title text-section-title text-on-surface mb-4">Engineered for Finance</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Why we chose Stellar and Soroban as the foundation for the next generation of freelance payments.
            </p>
          </Reveal>
          <Reveal>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg">
              <span className="material-symbols-outlined text-sm text-primary">public</span>
              <span className="font-ui-label text-sm text-on-surface">Global Network</span>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {[
            { icon: "bolt", title: "Low-cost payouts", desc: "Fraction-of-a-cent fees mean more money stays with the workers.", stat: "~$0.001 AVG", statLabel: "Avg. Transaction Fee" },
            { icon: "code", title: "Trustless contracts", desc: "Milestones are enforced by Soroban smart contracts. No human intervention.", stat: "Audit: Passed (v2.1)", statLabel: "Contract Status" },
            { icon: "language", title: "Global USDC liquidity", desc: "Access a global network of on/off ramps to move between crypto and fiat.", stat: "150+ Countries", statLabel: "Ramps Available" },
          ].map((card, i) => (
            <Reveal key={card.title} delay={i * 0.1}>
              <m.div
                whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(5,105,109,0.10)" }}
                className="bento-card p-6 rounded-xl transition-all cursor-default"
              >
                <span className="material-symbols-outlined text-primary mb-4 block">{card.icon}</span>
                <h4 className="font-card-title text-on-surface mb-2">{card.title}</h4>
                <p className="text-sm text-on-surface-variant mb-5 leading-relaxed">{card.desc}</p>
                <div className="bg-surface-container-high p-3 rounded-lg border border-outline-variant/30">
                  <p className="font-mono-data text-[9px] text-on-surface-variant uppercase tracking-widest mb-1.5">{card.statLabel}</p>
                  <p className="font-mono-data text-primary text-lg font-bold">{card.stat}</p>
                </div>
              </m.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-28 text-center">
      <Reveal>
        <m.div
          whileHover={{ boxShadow: "0 20px 60px rgba(5,105,109,0.12)" }}
          className="bento-card py-20 px-8 rounded-2xl transition-shadow relative overflow-hidden"
        >
          {/* Background glow */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(ellipse_at_50%_120%,var(--color-primary)_0%,transparent_60%)]"
          />
          <div className="relative">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
              Ready to secure your next project?
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of freelancers and agencies using FreelancePay to guarantee payment and build client trust.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/auth"
                className="bg-primary text-on-primary px-10 py-4 rounded-xl font-ui-label btn-primary-inset hover:bg-primary-hover active:scale-[0.98] transition-all inline-block"
              >
                Launch App
              </Link>
              <Link
                href="/demo"
                className="bg-surface-container-highest text-on-surface px-10 py-4 rounded-xl font-ui-label hover:bg-surface-variant active:scale-[0.98] transition-all inline-block"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </m.div>
      </Reveal>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-body-base text-on-surface overflow-hidden">
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <LogosSection />
        <StepsSection />
        <WhyStellarSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

