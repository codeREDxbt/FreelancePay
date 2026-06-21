import React, { useState } from "react";
import { X } from "lucide-react";

interface RampModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "deposit" | "withdraw";
}

export function RampModal({ isOpen, onClose, type }: RampModalProps) {
  const [amount, setAmount] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center p-5 border-b border-outline-variant bg-surface-container-low">
          <h3 className="font-headline-lg text-lg font-bold text-on-background">
            {type === "deposit" ? "Deposit USDC" : "Withdraw USDC"}
          </h3>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-on-surface-variant mb-6">
            {type === "deposit" 
              ? "Use your credit card or bank account to buy USDC via Stellar Anchor."
              : "Sell your USDC and transfer funds to your bank account."}
          </p>
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-xs font-ui-label text-on-surface-variant uppercase tracking-wider mb-2">Amount</label>
            <div className="relative">
              <input 
                id="amount"
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-3xl font-headline-lg font-bold border-none bg-surface-container-highest text-on-surface placeholder:text-outline rounded-lg py-4 px-4 focus:ring-2 focus:ring-primary outline-none"
                placeholder="0.00"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="font-mono-data text-on-surface-variant font-medium">USDC</span>
              </div>
            </div>
          </div>
          
          <button type="button" className="w-full bg-primary text-on-primary font-ui-label text-base font-semibold py-3.5 rounded-lg btn-primary-inset hover:bg-primary-hover transition-colors mt-4">
            {type === "deposit" ? "Continue to Payment" : "Initiate Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}
