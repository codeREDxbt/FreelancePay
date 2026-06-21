"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { m, AnimatePresence } from 'framer-motion';
import type { NewContractFormData } from "@/types";

interface StepProps {
  formData: NewContractFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

interface Step4Props {
  formData: NewContractFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error: string | null;
}

export function Step1Counterparty({ formData, handleChange }: StepProps) {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-section-title text-2xl font-bold text-on-surface mb-2">Counterparty</h1>
        <p className="font-body-base text-on-surface-variant">Enter the Stellar public key of the freelancer you are hiring.</p>
      </header>
      <div className="space-y-2">
        <label htmlFor="freelancerAddress" className="block font-ui-label text-sm text-on-surface">Freelancer Address</label>
        <input
          id="freelancerAddress"
          required
          name="freelancerAddress"
          value={formData.freelancerAddress}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-mono-data focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline"
          placeholder="G..."
        />
      </div>
    </>
  );
}

export function Step2Details({ formData, handleChange }: StepProps) {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-section-title text-2xl font-bold text-on-surface mb-2">Contract Details</h1>
        <p className="font-body-base text-on-surface-variant">Define the scope and nature of the agreement.</p>
      </header>
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block font-ui-label text-sm text-on-surface">Contract Title</label>
          <input
            id="title"
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body-base focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline"
            placeholder="e.g. Q4 Website Development"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="block font-ui-label text-sm text-on-surface">Scope of Work</label>
          <textarea
            id="description"
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body-base focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline resize-none"
            placeholder="Briefly outline the deliverables and expectations..."
          />
        </div>
      </div>
    </>
  );
}

export function Step3Terms({ formData, handleChange }: StepProps) {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-section-title text-2xl font-bold text-on-surface mb-2">Contract Terms</h1>
        <p className="font-body-base text-on-surface-variant">Set the financial parameters and deliverables.</p>
      </header>
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="amount" className="block font-ui-label text-sm text-on-surface">Total Project Value (USDC)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="font-mono-data text-outline">$</span>
            </div>
            <input
              id="amount"
              required
              type="number"
              step="0.01"
              min="0.1"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full pl-8 pr-16 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-mono-data focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="font-ui-label text-[12px] text-on-surface-variant font-bold">USDC</span>
            </div>
          </div>
          <p className="font-mono-data text-[11px] text-outline mt-1">Stored securely on the Stellar network.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="deliverableUrl" className="block font-ui-label text-sm text-on-surface">Deliverable URL (Optional)</label>
          <input
            id="deliverableUrl"
            type="url"
            name="deliverableUrl"
            value={formData.deliverableUrl}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg font-body-base focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline"
            placeholder="https://github.com/..."
          />
        </div>
      </div>
    </>
  );
}

export function Step4Review({ formData, error }: Step4Props) {
  return (
    <>
      <header className="mb-8">
        <h1 className="font-section-title text-2xl font-bold text-on-surface mb-2">Review & Sign</h1>
        <p className="font-body-base text-on-surface-variant">Confirm the details before executing the contract on-chain.</p>
      </header>
      <div className="space-y-6">
        <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/30 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-ui-label text-[10px] uppercase text-outline-variant tracking-wider mb-1">Contract Title</p>
              <p className="font-body-base text-sm font-medium">{formData.title}</p>
            </div>
            <div>
              <p className="font-ui-label text-[10px] uppercase text-outline-variant tracking-wider mb-1">Total Value</p>
              <p className="font-mono-data text-sm font-medium text-primary">{formData.amount} USDC</p>
            </div>
            <div className="col-span-2">
              <p className="font-ui-label text-[10px] uppercase text-outline-variant tracking-wider mb-1">Freelancer Address</p>
              <p className="font-mono-data text-xs text-on-surface-variant break-all">{formData.freelancerAddress}</p>
            </div>
            <div className="col-span-2">
              <p className="font-ui-label text-[10px] uppercase text-outline-variant tracking-wider mb-1">Scope of Work</p>
              <p className="font-body-base text-sm text-on-surface-variant">{formData.description}</p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <m.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full p-4 bg-error-container/30 border border-error/50 text-error rounded-xl text-sm font-medium flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}