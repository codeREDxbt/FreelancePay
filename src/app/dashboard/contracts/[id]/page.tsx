"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useEscrow } from "@/hooks/useEscrow";
import { getContract, updateMilestoneStatus } from "@/lib/firebase/contracts";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import type { Contract, MilestoneStatus } from "@/types";

import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Clock, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

export default function ContractDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { isConnected, publicKey } = useWallet();
  const contractAuto = useEscrow();
  const { approveMilestone, isLoading: isEscrowLoading } = contractAuto;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchContract = async () => {
      try {
        const data = await getContract(id);
        if (data) {
          setContract(data);
          if (data.milestones?.[0]?.deliverableUrl) {
            setDeliverableUrl(data.milestones[0].deliverableUrl);
          }
        }
      } catch {
        toast.error("Could not load contract details");
      } finally {
        setIsFetching(false);
      }
    };

    fetchContract();
  }, [id]);

  const isClient = contract?.clientWallet === publicKey;
  const isFreelancer = contract?.freelancerWallet === publicKey;

  const currentStatus: MilestoneStatus | undefined = contract?.milestones?.[0]?.status;

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl || !contract) return;

    setIsSubmittingWork(true);
    try {
      await updateMilestoneStatus(contract.id, 0, "submitted", deliverableUrl);
      setContract(prev => prev ? {
        ...prev,
        milestones: prev.milestones.map((m, i) => i === 0 ? { ...m, status: "submitted" as const, deliverableUrl } : m)
      } : null);
      toast.success("Work submitted for review!");
    } catch {
      toast.error("Failed to submit work");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const handleApprove = async () => {
    if (!contract) return;
    try {
      await approveMilestone(0);
      toast.success("Funds released successfully!");
      setContract(prev => prev ? {
        ...prev,
        milestones: prev.milestones.map((m, i) => i === 0 ? { ...m, status: "approved" as const } : m)
      } : null);
      await updateMilestoneStatus(contract.id, 0, "approved");
    } catch { /* toast already shown by hook */ }
  };

  if (isFetching) {
    return (
      <div className="px-4 md:px-margin-desktop py-8 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="px-4 md:px-margin-desktop py-20 max-w-4xl mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <h2 className="text-2xl font-headline-lg mb-2">Contract Not Found</h2>
        <p className="text-on-surface-variant mb-6">The contract you are looking for does not exist or you don&apos;t have access.</p>
        <button type="button" onClick={() => router.push("/dashboard")} className="text-primary hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const statusLabel = currentStatus === "pending" ? "In Progress"
    : currentStatus === "approved" ? "Completed"
    : currentStatus === "submitted" ? "In Review"
    : "Scheduled";

  return (
    <ErrorBoundary>
      <div className="px-4 md:px-margin-desktop py-8 max-w-5xl mx-auto">
        <button type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors mb-6 font-ui-label text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-headline-lg text-3xl text-on-surface">{contract.title}</h1>
              <StatusBadge status={statusLabel} />
            </div>
            <p className="text-on-surface-variant font-body-base max-w-2xl">{contract.description}</p>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 min-w-[200px] text-right">
            <p className="font-ui-label text-[10px] uppercase tracking-widest text-outline-variant mb-1">Contract Value</p>
            <p className="font-mono-data text-2xl font-bold text-primary">{contract.totalAmount} USDC</p>
            <p className="text-xs text-on-surface-variant mt-1">Locked in Soroban Escrow</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="md:col-span-2 space-y-8">

            <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h2 className="font-section-title text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Parties Involved
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                  <div>
                    <p className="font-ui-label text-xs uppercase text-on-surface-variant tracking-wider mb-1">Client</p>
                    <p className="font-mono-data text-sm">{contract.clientWallet}</p>
                  </div>
                  {isClient && <span className="mt-2 sm:mt-0 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">You</span>}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
                  <div>
                    <p className="font-ui-label text-xs uppercase text-on-surface-variant tracking-wider mb-1">Freelancer</p>
                    <p className="font-mono-data text-sm">{contract.freelancerWallet}</p>
                  </div>
                  {isFreelancer && <span className="mt-2 sm:mt-0 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">You</span>}
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
              <h2 className="font-section-title text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-on-surface-variant" /> Milestone Tracker
              </h2>
              <div className="relative border-l-2 border-outline-variant ml-4 space-y-8 pb-4">
                {contract.milestones?.map((m) => {
                  const isCompleted = m.status === "approved" || m.status === "released";

                  return (
                    <div key={m.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-surface-container-lowest ${isCompleted ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-ui-label font-bold ${isCompleted ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{m.description}</h3>
                          {m.deliverableUrl && (
                            <a href={m.deliverableUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline mt-2 w-fit">
                              <LinkIcon className="w-3 h-3" /> View Deliverable
                            </a>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono-data font-bold">{m.amount} USDC</p>
                          <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{isCompleted ? 'Released' : 'Locked'}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 sticky top-24">
              <h3 className="font-section-title text-lg mb-2">Action Required</h3>

              {!isConnected ? (
                <p className="text-sm text-on-surface-variant mb-4">Please connect your wallet to manage this contract.</p>
              ) : isClient ? (
                <div className="space-y-4">
                  {currentStatus === "pending" ? (
                    <>
                      <p className="text-sm text-on-surface-variant mb-4">Waiting for the freelancer to submit their work.</p>
                      <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/50 text-xs text-on-surface-variant flex gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        Funds are securely locked in the Soroban smart contract until you approve.
                      </div>
                    </>
                  ) : currentStatus === "submitted" ? (
                    <>
                      <p className="text-sm text-on-surface mb-4 font-medium">The freelancer has submitted work for your review!</p>
                      <button type="button"
                        onClick={handleApprove}
                        disabled={isEscrowLoading}
                        className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold btn-primary-inset flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50"
                      >
                        {isEscrowLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Approve & Release Funds
                      </button>
                      <button type="button" className="w-full py-2.5 text-error font-ui-label text-sm hover:bg-error/10 rounded-lg transition-colors mt-2">
                        Request Revision or Dispute
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="font-bold text-on-surface">Contract Completed</p>
                      <p className="text-xs text-on-surface-variant mt-1">Funds have been released.</p>
                    </div>
                  )}
                </div>
              ) : isFreelancer ? (
                <div className="space-y-4">
                  {currentStatus === "pending" ? (
                    <form onSubmit={handleSubmitWork} className="space-y-4">
                      <p className="text-sm text-on-surface-variant mb-4">The client has funded this milestone. Submit your work when ready.</p>
                      <div className="space-y-2">
                        <label htmlFor="deliverableUrl" className="font-ui-label text-xs uppercase text-on-surface-variant tracking-wider">Deliverable URL</label>
                        <input
                          id="deliverableUrl"
                          required
                          type="url"
                          value={deliverableUrl}
                          onChange={(e) => setDeliverableUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingWork || !deliverableUrl}
                        className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold btn-primary-inset flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50"
                      >
                        {isSubmittingWork ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit for Review"}
                      </button>
                    </form>
                  ) : currentStatus === "submitted" ? (
                    <div className="text-center py-4">
                      <Clock className="w-12 h-12 text-outline mx-auto mb-2" />
                      <p className="font-bold text-on-surface">Pending Client Review</p>
                      <p className="text-xs text-on-surface-variant mt-1">Waiting for the client to approve and release funds.</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2" />
                      <p className="font-bold text-on-surface">Contract Completed</p>
                      <p className="text-xs text-on-surface-variant mt-1">Funds have been released to your wallet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">You are viewing this contract as a guest. You do not have permission to manage it.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </ErrorBoundary>
  );
}