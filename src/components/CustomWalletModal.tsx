"use client";

import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { SupportedWallet } from "@/types";

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: SupportedWallet[];
  onSelect: (id: string) => void;
}

export function CustomWalletModal({ isOpen, onClose, wallets, onSelect }: CustomWalletModalProps) {
  const shouldReduceMotion = useReducedMotion();
  // Sort wallets: available/platform wrappers first
  const sortedWallets = wallets.toSorted((a: SupportedWallet, b: SupportedWallet) => {
    if (a.isPlatformWrapper !== b.isPlatformWrapper) return a.isPlatformWrapper ? -1 : 1;
    if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
    return 0;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, duration: shouldReduceMotion ? 0 : undefined }}
            className="relative w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-outline-variant bg-surface-container-low">
              <h3 className="font-headline-lg text-lg text-on-background">
                Connect Wallet
              </h3>
              <button type="button"
                onClick={onClose}
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-3">
                {sortedWallets.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-outline-variant rounded-lg bg-surface-container-low">
                    <p className="font-ui-label text-sm text-on-surface-variant">No providers found</p>
                    <p className="text-xs text-outline mt-1">Please install a Stellar wallet</p>
                  </div>
                ) : (
                  sortedWallets.map((wallet) => (
                    <button type="button"
                      key={wallet.id}
                      disabled={!wallet.isAvailable && !wallet.isPlatformWrapper}
                      onClick={() => onSelect(wallet.id)}
                      className="w-full flex items-center gap-4 p-4 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-primary hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest flex items-center justify-center p-1 border border-outline-variant relative">
                        <Image 
                          src={wallet.icon} 
                          alt={wallet.name} 
                          fill
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex flex-col items-start flex-1 text-left">
                        <span className="font-ui-label text-base text-on-background group-hover:text-primary transition-colors">
                          {wallet.name}
                        </span>
                        {(!wallet.isAvailable && !wallet.isPlatformWrapper) && (
                          <span className="text-[10px] uppercase tracking-wider text-error font-mono-data mt-0.5">
                            Not Installed
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-outline-variant group-hover:text-primary transition-all duration-300 group-hover:-rotate-45" />
                    </button>
                  ))
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-outline-variant bg-surface-container-low text-center">
              <p className="text-xs text-on-surface-variant font-ui-label">
                By connecting, you agree to our Terms of Service
              </p>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
