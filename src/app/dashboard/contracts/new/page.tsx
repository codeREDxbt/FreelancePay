"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createContract } from "@/lib/firebase/contracts";
import { useWallet } from "@/hooks/useWallet";
import { useEscrow } from "@/hooks/useEscrow";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import { m, AnimatePresence } from 'framer-motion';
import type { NewContractFormData } from "@/types";
import Link from "next/link";

export default function NewContractPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { initializeEscrow } = useEscrow();

  const [formData, setFormData] = useState<NewContractFormData>({
    title: "",
    description: "",
    freelancerAddress: "",
    milestones: [{ description: "", amount: "", deliverableUrl: "" }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      setError("You must be logged in to create a contract");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const milestoneAmounts = formData.milestones.map(m => parseFloat(m.amount || "0"));
      const milestoneDescriptions = formData.milestones.map(m => m.description);
      const totalAmount = milestoneAmounts.reduce((a, b) => a + b, 0);

      const result = await initializeEscrow(
        formData.freelancerAddress,
        milestoneAmounts,
        milestoneDescriptions
      );

      const txHash = (result as { hash?: string })?.hash || "pending";

      await createContract({
        clientWallet: publicKey,
        freelancerWallet: formData.freelancerAddress,
        title: formData.title,
        description: formData.description,
        totalAmount,
        contractAddress: txHash,
        isDisputed: false,
        isClosed: false,
        milestones: formData.milestones.map((m, idx) => ({
          id: idx + 1,
          description: m.description || `Milestone ${idx + 1}`,
          amount: parseFloat(m.amount || "0"),
          status: "pending",
          deliverableUrl: m.deliverableUrl || undefined,
        }))
      });

      router.push("/dashboard/contracts");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create contract";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMilestoneChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newMilestones = [...prev.milestones];
      newMilestones[index] = { ...newMilestones[index], [field]: value };
      return { ...prev, milestones: newMilestones };
    });
  };

  const addMilestone = () => {
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { description: "", amount: "", deliverableUrl: "" }]
    }));
  };

  const removeMilestone = (index: number) => {
    if (formData.milestones.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const totalCalculated = formData.milestones.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  return (
    <ErrorBoundary>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-bg-void text-ink-primary">
        
        {/* Left Pane: Active Form */}
        <div className="flex-1 p-8 lg:p-16 pb-24 lg:pb-32 flex flex-col max-w-2xl mx-auto lg:mx-0 w-full">
          <Link href="/dashboard" className="flex items-center gap-2 text-ink-tertiary hover:text-ink-primary transition-colors font-ui-label text-sm font-bold uppercase tracking-widest mb-12 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          
          <h1 className="font-headline-lg text-4xl lg:text-5xl font-bold tracking-tight mb-4">Create Contract</h1>
          <p className="text-ink-secondary mb-12 font-ui-label">Configure the parameters for your escrowed agreement.</p>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Field: Freelancer Address */}
            <div className="space-y-4">
              <label htmlFor="freelancerAddress" className="block font-ui-label text-sm uppercase tracking-widest font-bold text-ink-primary">Counterparty Address</label>
              <input
                id="freelancerAddress"
                required
                name="freelancerAddress"
                value={formData.freelancerAddress}
                onChange={handleChange}
                className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 font-mono-data text-lg transition-colors placeholder:text-ink-tertiary"
                placeholder="G..."
              />
            </div>

            {/* Field: Title */}
            <div className="space-y-4">
              <label htmlFor="title" className="block font-ui-label text-sm uppercase tracking-widest font-bold text-ink-primary">Contract Title</label>
              <input
                id="title"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 font-ui-label text-xl font-bold transition-colors placeholder:text-ink-tertiary"
                placeholder="e.g. Q4 Website Development"
              />
            </div>

            {/* Field: Scope */}
            <div className="space-y-4">
              <label htmlFor="description" className="block font-ui-label text-sm uppercase tracking-widest font-bold text-ink-primary">Scope of Work</label>
              <textarea
                id="description"
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 font-ui-label text-lg transition-colors placeholder:text-ink-tertiary resize-none"
                placeholder="Briefly outline deliverables..."
              />
            </div>

            {/* Milestones Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-edge-neutral pb-4">
                <label className="block font-ui-label text-sm uppercase tracking-widest font-bold text-ink-primary">Milestones</label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-accent hover:text-accent/80 font-ui-label text-xs uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Milestone
                </button>
              </div>

              <div className="space-y-8">
                {formData.milestones.map((milestone, idx) => (
                  <div key={idx} className="relative p-6 border-2 border-edge-neutral bg-black/5 hover:border-accent transition-colors">
                    {formData.milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        className="absolute top-4 right-4 text-ink-tertiary hover:text-status-disputed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="mb-4">
                      <span className="font-mono-data text-xs uppercase tracking-widest text-ink-secondary">Milestone {idx + 1}</span>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block font-ui-label text-xs uppercase tracking-widest text-ink-primary">Deliverable Description</label>
                        <input
                          required
                          value={milestone.description}
                          onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                          className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-2 font-ui-label text-sm transition-colors placeholder:text-ink-tertiary"
                          placeholder="e.g. Design Mockups"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block font-ui-label text-xs uppercase tracking-widest text-ink-primary">Value (USDC)</label>
                          <div className="relative">
                            <span className="absolute left-0 top-2 font-mono-data text-ink-tertiary text-lg">$</span>
                            <input
                              required
                              type="number"
                              step="0.01"
                              min="0.1"
                              value={milestone.amount}
                              onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                              className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-2 pl-5 pr-4 font-mono-data text-lg font-bold tabular-nums transition-colors placeholder:text-ink-tertiary"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block font-ui-label text-xs uppercase tracking-widest text-ink-primary">Deliverable URL (Optional)</label>
                          <input
                            type="url"
                            value={milestone.deliverableUrl || ""}
                            onChange={(e) => handleMilestoneChange(idx, 'deliverableUrl', e.target.value)}
                            className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-2 font-mono-data text-xs transition-colors placeholder:text-ink-tertiary"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <m.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-status-disputed/10 border border-status-disputed/20 text-status-disputed font-ui-label text-sm font-bold uppercase tracking-wider"
                >
                  {error}
                </m.div>
              )}
            </AnimatePresence>

            <div className="pt-8 flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading || totalCalculated <= 0 || !formData.freelancerAddress || formData.milestones.some(m => !m.description || !m.amount)}
                className="neopop-button-teal px-8 py-4 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> :
                 <>Execute Contract <ArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          </form>
        </div>

        {/* Right Pane: Receipt Preview */}
        <div className="lg:w-[480px] bg-black border-t lg:border-t-0 lg:border-l border-dashed border-ink-tertiary relative">
          <div className="p-8 lg:p-12 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center overflow-hidden">
          
          {/* Subtle noise/texture for the receipt side if wanted, but black is fine */}
          
          <div className="w-full max-w-[380px] mx-auto bg-bg-base border border-ink-tertiary p-8 relative">
            {/* Top Cutout decoration for receipt */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
              {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-black rounded-full" />
              ))}
            </div>

            <div className="text-center mb-8 pt-4">
              <h3 className="font-mono-data text-ink-primary font-bold tracking-widest uppercase text-xl">Escrow Receipt</h3>
              <p className="font-mono-data text-ink-tertiary text-[10px] uppercase mt-2">FreelancePay Protocol</p>
            </div>

            <div className="space-y-6">
              <div className="border-b border-dashed border-ink-tertiary pb-6">
                <p className="font-mono-data text-[10px] text-ink-tertiary uppercase tracking-widest mb-1">Contract Title</p>
                <p className="font-ui-label text-ink-primary font-bold text-lg break-words">
                  {formData.title || "Untiled Contract"}
                </p>
              </div>

              <div className="border-b border-dashed border-ink-tertiary pb-6">
                <p className="font-mono-data text-[10px] text-ink-tertiary uppercase tracking-widest mb-1">Counterparty</p>
                <p className="font-mono-data text-ink-secondary text-xs break-all">
                  {formData.freelancerAddress || "--------------------------------------------------------"}
                </p>
              </div>

              <div className="border-b border-dashed border-ink-tertiary pb-6">
                <p className="font-mono-data text-[10px] text-ink-tertiary uppercase tracking-widest mb-1">Scope</p>
                <p className="font-ui-label text-ink-secondary text-sm break-words line-clamp-3">
                  {formData.description || "..."}
                </p>
              </div>

              <div className="pt-2">
                <div className="flex items-end justify-between">
                  <p className="font-mono-data text-[10px] text-ink-tertiary uppercase tracking-widest">Total Value</p>
                  <p className="font-mono-data font-bold text-accent text-3xl tabular-nums tracking-tighter">
                    {totalCalculated > 0 ? totalCalculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                  </p>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="font-mono-data text-ink-tertiary text-xs uppercase tracking-wider">USDC</span>
                </div>
              </div>
            </div>

            {/* Bottom Cutout decoration for receipt */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="w-3 h-3 bg-black rounded-full" />
              ))}
            </div>
          </div>
          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}