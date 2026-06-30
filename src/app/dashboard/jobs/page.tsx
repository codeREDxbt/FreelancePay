"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Briefcase, ArrowRight, Clock } from "lucide-react";
import { getJobs, getMyJobs } from "@/lib/firebase/jobs";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import type { Job } from "@/types";
import { useWallet } from "@/hooks/useWallet";

function formatTimeAgo(dateInput: string | Date) {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours`;
  return `${Math.floor(diffInSeconds / 86400)} days`;
}

export default function JobsPage() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<"explore" | "my-jobs">("explore");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true);
      setError(null);
      try {
        let data: Job[];
        if (activeTab === "my-jobs" && publicKey) {
          const allMyJobs = await getMyJobs(publicKey);
          data = allMyJobs.filter(job => job.status === "open");
        } else {
          data = await getJobs();
        }
        setJobs(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, [activeTab, publicKey]);

  return (
    <ErrorBoundary>
      <div className="max-w-5xl mx-auto p-8 lg:p-16 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline-lg text-4xl font-bold text-ink-primary mb-2">Job Board</h1>
            <p className="font-ui-label text-ink-secondary">Discover open opportunities or manage the jobs you posted.</p>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="neopop-button-teal px-6 py-3 font-ui-label font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </Link>
        </div>

        <div className="flex items-center gap-8 border-b-2 border-edge-neutral">
          <button
            onClick={() => setActiveTab("explore")}
            className={`pb-4 font-ui-label font-bold uppercase tracking-widest text-sm transition-colors border-b-2 -mb-[2px] ${activeTab === "explore" ? "text-accent border-accent" : "text-ink-secondary hover:text-ink-primary border-transparent"}`}
          >
            Explore Jobs
          </button>
          <button
            onClick={() => setActiveTab("my-jobs")}
            className={`pb-4 font-ui-label font-bold uppercase tracking-widest text-sm transition-colors border-b-2 -mb-[2px] ${activeTab === "my-jobs" ? "text-accent border-accent" : "text-ink-secondary hover:text-ink-primary border-transparent"}`}
          >
            My Jobs
          </button>
        </div>

        {error && (
          <div className="p-4 bg-status-disputed/10 border border-status-disputed/20 text-status-disputed font-ui-label text-sm font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-ink-tertiary/10 animate-pulse border-2 border-edge-neutral" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-edge-neutral bg-black/5">
            <Briefcase className="w-12 h-12 text-ink-tertiary mx-auto mb-4" />
            <h3 className="font-ui-label text-lg font-bold text-ink-primary uppercase tracking-widest mb-2">No Jobs Found</h3>
            <p className="font-ui-label text-ink-secondary text-sm max-w-sm mx-auto mb-6">
              {activeTab === "my-jobs" 
                ? "You haven't posted any jobs yet. Click 'Post a Job' to hire someone."
                : "There are currently no open jobs. Check back later or post a new one."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map(job => (
              <Link
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className="group block p-6 border-2 border-edge-neutral bg-bg-base hover:border-accent transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div>
                      <h3 className="font-headline-lg text-2xl font-bold text-ink-primary group-hover:text-accent transition-colors mb-2">
                        {job.title}
                      </h3>
                      <p className="font-ui-label text-sm text-ink-secondary line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-6 font-mono-data text-xs text-ink-tertiary uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(job.createdAt)} ago
                      </span>
                      <span className="flex items-center gap-1.5 text-accent font-bold">
                        USDC {job.budget}
                      </span>
                      {activeTab === "my-jobs" && (
                        <span className={`px-2 py-0.5 border ${job.status === 'open' ? 'border-status-released text-status-released' : 'border-status-disputed text-status-disputed'}`}>
                          {job.status}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="hidden md:flex items-center justify-center w-12 h-12 border-2 border-edge-neutral group-hover:border-accent group-hover:bg-accent/10 transition-colors shrink-0">
                    <ArrowRight className="w-5 h-5 text-ink-tertiary group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
