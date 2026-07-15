"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Wallet, FileSignature, Coins, Send, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function OnboardingPage() {
  const steps = [
    {
      title: "1. Connect Wallet",
      description: "Link your Stellar wallet (like Freighter). This is your identity and your bank.",
      icon: <Wallet className="w-8 h-8 text-accent" />,
      color: "border-accent",
    },
    {
      title: "2. Create a Contract",
      description: "Define milestones and expected deliverables. Set terms that protect both sides.",
      icon: <FileSignature className="w-8 h-8 text-status-warning" />,
      color: "border-status-warning",
    },
    {
      title: "3. Fund Escrow",
      description: "Client deposits USDC into a trustless smart contract. Funds are locked securely.",
      icon: <Coins className="w-8 h-8 text-status-success" />,
      color: "border-status-success",
    },
    {
      title: "4. Submit & Release",
      description: "Freelancer submits work. Client approves. Smart contract releases funds instantly.",
      icon: <Send className="w-8 h-8 text-status-info" />,
      color: "border-status-info",
    }
  ];

  return (
    <div className="min-h-screen bg-bg-void text-ink-primary flex flex-col items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-4xl bg-bg-base border-2 border-edge-neutral shadow-neopop p-8 md:p-12 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-status-info/5 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2" />

        <div className="mb-12 text-center">
          <div className="flex justify-center mb-8">
            <Logo iconSize={40} textSize="text-3xl" subTextSize="text-xs" />
          </div>
          <h1 className="font-headline-lg text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Trustless Escrow on Stellar
          </h1>
          <p className="font-ui-label text-ink-secondary text-lg max-w-2xl mx-auto">
            FreelancePay replaces trust with math. Never worry about unpaid invoices or undelivered work again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`p-6 border-2 ${step.color} bg-bg-void hover:bg-bg-interactive transition-colors flex gap-4`}
            >
              <div className="shrink-0 mt-1">
                {step.icon}
              </div>
              <div>
                <h3 className="font-ui-label font-bold text-lg uppercase tracking-widest mb-2">
                  {step.title}
                </h3>
                <p className="font-mono-data text-sm text-ink-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link 
            href="/dashboard"
            className="neopop-button-teal px-12 py-5 font-ui-label font-bold uppercase tracking-widest text-lg flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            Enter Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-ink-tertiary font-ui-label text-sm uppercase tracking-widest">
        <CheckCircle2 className="w-4 h-4 text-status-success" />
        Built on Soroban Smart Contracts
      </div>
    </div>
  );
}
