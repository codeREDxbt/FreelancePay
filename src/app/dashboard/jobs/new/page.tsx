"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { createJob } from "@/lib/firebase/jobs";
import { useWallet } from "@/hooks/useWallet";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import { m, AnimatePresence } from "framer-motion";

export default function NewJobPage() {
  const router = useRouter();
  const { publicKey } = useWallet();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setError("You must be logged in to post a job.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await createJob({
        clientId: publicKey,
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        status: "open",
      });
      router.push("/dashboard/jobs");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to post job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <ErrorBoundary>
      <div className="max-w-3xl mx-auto p-8 lg:p-16">
        <Link href="/dashboard/jobs" className="flex items-center gap-2 text-ink-tertiary hover:text-ink-primary transition-colors font-ui-label text-sm font-bold uppercase tracking-widest mb-12 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
        
        <h1 className="font-headline-lg text-4xl font-bold tracking-tight mb-4 text-ink-primary">Post a Job</h1>
        <p className="text-ink-secondary mb-12 font-ui-label">Describe your project and set an estimated budget to attract top talent.</p>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Field: Title */}
          <div className="space-y-4">
            <label htmlFor="title" className="block font-ui-label text-sm uppercase tracking-widest font-bold text-ink-primary">Job Title</label>
            <input
              id="title"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 font-ui-label text-xl font-bold transition-colors placeholder:text-ink-tertiary text-ink-primary"
              placeholder="e.g. Fullstack Web3 Developer Needed"
            />
          </div>

          {/* Field: Scope */}
          <div className="space-y-4">
            <label htmlFor="description" className="block font-ui-label text-sm uppercase tracking-widest font-bold text-ink-primary">Project Description</label>
            <textarea
              id="description"
              required
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 font-ui-label text-lg transition-colors placeholder:text-ink-tertiary resize-none text-ink-primary"
              placeholder="Describe the deliverables, timeline, and requirements..."
            />
          </div>

          {/* Field: Budget */}
          <div className="space-y-4">
            <label htmlFor="budget" className="block font-ui-label text-sm uppercase tracking-widest font-bold text-ink-primary">Estimated Budget (USDC)</label>
            <div className="relative max-w-sm">
              <span className="absolute left-0 top-3 font-mono-data text-ink-tertiary text-lg">$</span>
              <input
                id="budget"
                required
                name="budget"
                type="number"
                step="0.01"
                min="1"
                value={formData.budget}
                onChange={handleChange}
                className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 pl-6 pr-4 font-mono-data text-xl font-bold tabular-nums transition-colors placeholder:text-ink-tertiary text-ink-primary"
                placeholder="0.00"
              />
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

          <div className="pt-8">
            <button
              type="submit"
              disabled={isLoading || !formData.title || !formData.description || !formData.budget}
              className="neopop-button-teal w-full sm:w-auto px-12 py-4 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> :
               <>Post Job <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
}
