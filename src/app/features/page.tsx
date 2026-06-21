"use client";

import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";
import { Reveal } from "@/components/ui/animations/Reveal";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background font-body-base text-on-surface overflow-hidden">
      <LandingNav />

      <main className="pt-24 pb-32 max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <Reveal>
          <div className="mb-8 font-mono-data text-[11px] uppercase tracking-widest text-outline">
            <span className="text-primary font-medium">Core Mechanics</span>
          </div>
          <h1 className="font-headline-lg text-[42px] md:text-[52px] leading-[1.05] mb-8 text-on-surface tracking-tight max-w-3xl">
            Programmable Escrow & Verified Milestones
          </h1>
          <p className="font-body-base text-lg text-on-surface-variant mb-16 leading-relaxed max-w-2xl">
            FreelancePay replaces trust with cryptography. By locking funds in a Soroban smart contract, we eliminate counterparty risk for both the freelancer and the client.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mt-20">
          <Reveal delay={0.1}>
            <div className="bento-card p-10 rounded-2xl h-full">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
              </div>
              <h3 className="font-headline-lg text-2xl mb-4">Trustless Escrow</h3>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                When a contract is initialized, the client deposits the total project value in USDC into a dedicated Soroban smart contract. 
              </p>
              <ul className="space-y-4">
                {[
                  "Funds are cryptographically locked on the Stellar network.",
                  "Clients cannot withdraw funds unilaterally once locked.",
                  "Freelancers see proof of funds before writing a single line of code."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
                    <span className="text-sm text-on-surface-variant">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="bento-card p-10 rounded-2xl h-full">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-8">
                <span className="material-symbols-outlined text-primary text-3xl">task_alt</span>
              </div>
              <h3 className="font-headline-lg text-2xl mb-4">Milestone Triggers</h3>
              <p className="text-on-surface-variant leading-relaxed mb-6">
                Payments are fractured into logical milestones. When a milestone is completed and approved, the smart contract automatically releases the exact fraction of USDC to the freelancer.
              </p>
              <ul className="space-y-4">
                {[
                  "Immediate settlement to the freelancer's Stellar wallet.",
                  "No intermediary holds or bank transfer delays.",
                  "Immutable on-chain record of every approval and release."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">check_circle</span>
                    <span className="text-sm text-on-surface-variant">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </main>

      <Footer />
    </div>
  );
}

