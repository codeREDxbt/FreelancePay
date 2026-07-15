"use client";

import React from "react";
import { X, Building2, Banknote, ShieldCheck } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

interface RampExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RampExplanationModal({ isOpen, onClose }: RampExplanationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-void/80 backdrop-blur-sm"
          />
          <m.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-bg-base border-2 border-edge-neutral shadow-neopop p-6 md:p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-ink-tertiary hover:text-ink-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-headline-lg text-2xl font-bold mb-2">Fiat Deposits & Withdrawals</h2>
            <p className="font-ui-label text-ink-secondary text-sm mb-8">
              How money moves between your bank and FreelancePay.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-ui-label font-bold uppercase tracking-widest text-sm mb-1">Stellar Anchors</h3>
                  <p className="font-mono-data text-xs text-ink-secondary leading-relaxed">
                    FreelancePay is built on the Stellar network. Stellar uses regulated financial entities called "Anchors" to bridge traditional banking with the blockchain.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <ShieldCheck className="w-6 h-6 text-status-success" />
                </div>
                <div>
                  <h3 className="font-ui-label font-bold uppercase tracking-widest text-sm mb-1">KYC & Compliance</h3>
                  <p className="font-mono-data text-xs text-ink-secondary leading-relaxed">
                    When you deposit fiat (like USD or EUR) to receive USDC, or when you withdraw USDC to your bank, the transaction and any required KYC happens directly with the Anchor, not FreelancePay.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Banknote className="w-6 h-6 text-status-info" />
                </div>
                <div>
                  <h3 className="font-ui-label font-bold uppercase tracking-widest text-sm mb-1">Your Custody</h3>
                  <p className="font-mono-data text-xs text-ink-secondary leading-relaxed">
                    FreelancePay never touches or custodies your funds. Escrowed funds are locked in a trustless smart contract on the blockchain.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-8 w-full py-4 bg-ink-primary text-bg-base font-ui-label font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
            >
              I Understand
            </button>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
