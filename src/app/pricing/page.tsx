"use client";

import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/animations/Reveal";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background font-body-base text-on-surface overflow-hidden">
      <LandingNav />

      <main className="pt-24 pb-32 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal className="text-center mb-20">
          <div className="mb-8 font-mono-data text-[11px] uppercase tracking-widest text-outline">
            <span className="text-primary font-medium">Simple Pricing</span>
          </div>
          <h1 className="font-headline-lg text-[42px] md:text-[52px] leading-[1.05] mb-6 text-on-surface tracking-tight max-w-3xl mx-auto">
            Zero hidden fees. <br /> Transparent by design.
          </h1>
          <p className="font-body-base text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            FreelancePay is free for workers. Clients pay a flat 1% smart contract fee on project completion to cover network and protocol costs.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {/* Freelancer Tier */}
          <Reveal delay={0.1}>
            <div className="bento-card p-10 rounded-2xl h-full border border-outline-variant/30 relative">
              <h3 className="font-mono-data text-sm uppercase tracking-widest text-on-surface-variant mb-6">Freelancer</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-headline-lg text-5xl">$0</span>
                <span className="text-on-surface-variant">/ month</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-8 h-10">
                You do the work, you get paid. Period.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "No withdrawal fees",
                  "No monthly subscriptions",
                  "Create unlimited proposals",
                  "Instant Soroban settlement"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check</span>
                    <span className="text-sm text-on-surface">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/auth" className="block w-full text-center py-4 rounded-xl font-ui-label text-sm border border-outline-variant hover:bg-surface-container-high transition-colors">
                Start Earning
              </Link>
            </div>
          </Reveal>

          {/* Client Tier */}
          <Reveal delay={0.2}>
            <div className="bento-card p-10 rounded-2xl h-full border border-primary/40 relative overflow-hidden shadow-[0_20px_60px_rgba(5,105,109,0.12)]">
              {/* Highlight gradient */}
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_70%)] opacity-[0.05]" />
              
              <h3 className="font-mono-data text-sm uppercase tracking-widest text-primary mb-6">Client / Agency</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-headline-lg text-5xl">1%</span>
                <span className="text-on-surface-variant">fee</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-8 h-10">
                A flat protocol fee applied when funding escrow.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Secure smart contract escrow",
                  "Unlimited milestones",
                  "Dispute resolution framework",
                  "Exportable PDF invoices"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check</span>
                    <span className="text-sm text-on-surface">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/auth" className="block w-full text-center bg-primary text-on-primary py-4 rounded-xl font-ui-label text-sm btn-primary-inset hover:opacity-90 transition-opacity">
                Fund a Project
              </Link>
            </div>
          </Reveal>

          {/* Enterprise Tier */}
          <Reveal delay={0.3}>
            <div className="bento-card p-10 rounded-2xl h-full border border-outline-variant/30">
              <h3 className="font-mono-data text-sm uppercase tracking-widest text-on-surface-variant mb-6">Enterprise</h3>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-headline-lg text-5xl">Custom</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-8 h-10">
                High-volume platforms and marketplaces.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Custom fee structures",
                  "White-labeled UI",
                  "API access",
                  "Dedicated account manager"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check</span>
                    <span className="text-sm text-on-surface">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/auth" className="block w-full text-center py-4 rounded-xl font-ui-label text-sm border border-outline-variant hover:bg-surface-container-high transition-colors">
                Contact Sales
              </Link>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}
