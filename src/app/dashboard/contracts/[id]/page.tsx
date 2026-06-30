"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import { useEscrow } from "@/hooks/useEscrow";
import { getContract, updateMilestoneStatus, flagDispute } from "@/lib/firebase/contracts";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import type { Contract, MilestoneStatus } from "@/types";
import Link from "next/link";

import { ArrowLeft, Loader2, AlertCircle, ShieldAlert, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";
import { ChatWidget } from "@/components/dashboard/ChatWidget";
import { ContractReviewWidget } from "@/components/dashboard/ContractReviewWidget";

export default function ContractDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { isConnected, publicKey } = useWallet();
  const contractAuto = useEscrow();
  const {
    approveMilestone,
    submitMilestone: onChainSubmitMilestone,
    isLoading: isEscrowLoading,
    flagDispute: onChainFlagDispute,
    resolveDispute: onChainResolveDispute,
    cancelContract: onChainCancelContract,
    state: escrowState,
  } = contractAuto;

  const [contract, setContract] = useState<Contract | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [isDisputeFlowOpen, setIsDisputeFlowOpen] = useState(false);
  const [isFlaggingDispute, setIsFlaggingDispute] = useState(false);
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [resolveForm, setResolveForm] = useState({ releaseTo: "", amount: "" });

  const contractIsAccepted = contract?.isAccepted !== false;

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

  const activeMilestoneIndex = contract?.milestones?.findIndex(m => m.status === "pending" || m.status === "submitted") ?? -1;
  const activeMilestone = activeMilestoneIndex !== -1 ? contract?.milestones?.[activeMilestoneIndex] : null;
  const currentStatus = activeMilestone?.status;

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl || !contract || activeMilestoneIndex === -1) return;

    setIsSubmittingWork(true);
    try {
      // On-chain submission: may succeed, return null (demo mode), or throw
      // If it throws, the useEscrow hook already shows a toast.error
      await onChainSubmitMilestone(activeMilestoneIndex);

      // On-chain succeeded (or demo mode) — update Firestore to "submitted"
      // so the client sees the work and can approve it
      await updateMilestoneStatus(contract.id, activeMilestoneIndex, "submitted", deliverableUrl);
      setContract(prev => prev ? {
        ...prev,
        milestones: prev.milestones.map((m, i) => i === activeMilestoneIndex ? { ...m, status: "submitted" as const, deliverableUrl } : m)
      } : null);
      toast.success("Work submitted for review!");
    } catch {
      // The useEscrow hook already showed a toast for on-chain errors.
      // Only show our own error if Firestore update failed (on-chain succeeded
      // but Firestore didn't). We can't easily distinguish here, but the
      // on-chain hook re-throws non-demo errors, so reaching here means
      // either a real on-chain failure (toast already shown) or Firestore failure.
      toast.error("Failed to submit work. Please try again.");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const handleApprove = async () => {
    if (!contract || activeMilestoneIndex === -1) return;
    try {
      await approveMilestone(activeMilestoneIndex);
      toast.success("Funds released successfully!");
      setContract(prev => {
        if (!prev) return null;
        const newMilestones = prev.milestones.map((m, i) => i === activeMilestoneIndex ? { ...m, status: "approved" as const } : m);
        const isClosed = newMilestones.every(m => m.status === "approved" || m.status === "released");
        return {
          ...prev,
          milestones: newMilestones,
          isClosed: prev.isClosed || isClosed
        };
      });
      await updateMilestoneStatus(contract.id, activeMilestoneIndex, "approved");
      router.refresh();
    } catch { /* toast already shown by hook */ }
  };

  const refreshContract = useCallback(async () => {
    if (!contract?.id) return;
    try {
      const data = await getContract(contract.id);
      if (data) setContract(data);
    } catch {
      /* keep current snapshot on read failure */
    }
  }, [contract]);

  const handleFlagDispute = useCallback(async () => {
    if (!contract) return;
    setIsFlaggingDispute(true);
    try {
      await onChainFlagDispute();
      try {
        await flagDispute(contract.id);
      } catch {
        toast.error("On-chain dispute locked, but Firestore sync failed. Refresh to retry.");
      }
      await refreshContract();
      toast.success("Dispute flagged. Funds are now locked.");
      setIsDisputeFlowOpen(false);
    } catch {
      /* toast already shown by hook */
    } finally {
      setIsFlaggingDispute(false);
    }
  }, [contract, onChainFlagDispute, refreshContract]);

  const handleResolveDispute = useCallback(async () => {
    if (!contract || !resolveForm.releaseTo || !resolveForm.amount) return;
    setIsResolvingDispute(true);
    try {
      await onChainResolveDispute(publicKey!, resolveForm.releaseTo, Number(resolveForm.amount));
      setContract(prev => prev ? { ...prev, isDisputed: false, isClosed: true } : null);
      toast.success("Dispute resolved and funds released.");
    } catch { /* toast already shown by hook */ }
    finally {
      setIsResolvingDispute(false);
    }
  }, [contract, resolveForm, onChainResolveDispute, publicKey]);

  const handleAcceptContract = async () => {
    if (!contract) return;
    setIsAccepting(true);
    try {
      const { acceptContract } = await import("@/lib/firebase/contracts");
      await acceptContract(contract.id);
      setContract(prev => prev ? { ...prev, isAccepted: true } : null);
      toast.success("Contract accepted!");
    } catch {
      toast.error("Failed to accept contract.");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCancelContract = async () => {
    if (!contract || !publicKey) return;
    if (!confirm("Are you sure you want to cancel this contract? This will refund the escrowed balance to your wallet.")) return;

    setIsCancelling(true);
    try {
      toast.loading("Refunding escrowed balance to your wallet...", { id: "cancel" });
      await onChainCancelContract();
      
      toast.loading("Deleting contract record...", { id: "cancel" });
      const { deleteContract } = await import("@/lib/firebase/contracts");
      await deleteContract(contract.id);
      
      toast.success("Contract cancelled and funds refunded.", { id: "cancel" });
      router.push("/dashboard/contracts");
    } catch (err) {
      toast.error("Failed to cancel contract.", { id: "cancel" });
      setIsCancelling(false);
    }
  };

  if (isFetching) {
    return (
      <div className="px-8 py-12 max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-none" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-64 w-full rounded-none" />
          <Skeleton className="h-64 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="px-8 py-20 max-w-4xl mx-auto text-center flex flex-col items-center">
        <AlertCircle className="w-12 h-12 text-status-disputed mx-auto mb-4" />
        <h2 className="text-3xl font-headline-lg font-bold text-ink-primary mb-4">Contract Not Found</h2>
        <p className="text-ink-secondary mb-8 font-ui-label">The contract does not exist or you lack access.</p>
        <Link href="/dashboard" className="neopop-button-teal px-6 py-3 font-ui-label font-bold uppercase tracking-widest text-sm inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-8 lg:p-12 max-w-full lg:max-w-7xl mx-auto bg-bg-void min-h-screen text-ink-primary overflow-x-hidden">
        
        <Link href="/dashboard/contracts" className="flex items-center gap-2 text-ink-tertiary hover:text-ink-primary transition-colors font-ui-label text-sm font-bold uppercase tracking-widest mb-8 md:mb-12 w-fit">
          <ArrowLeft className="w-4 h-4" /> Back to Contracts
        </Link>

        <div className="mb-12">
          <h1 className="font-headline-lg text-4xl lg:text-5xl font-bold tracking-tight mb-4">{contract.title}</h1>
          <p className="text-ink-secondary font-ui-label text-lg max-w-3xl">{contract.description}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Timeline on the left */}
          <div className="flex-1 space-y-8">
            <h2 className="font-headline-lg text-2xl font-bold border-b-2 border-edge-neutral pb-4 uppercase tracking-widest">Milestones</h2>
            
            <div className="relative border-l border-ink-tertiary/30 ml-4 space-y-12 pb-8">
              {contract.milestones?.map((m, index) => {
                const isCompleted = m.status === "approved" || m.status === "released";
                const isActive = m.status === "pending" || m.status === "submitted";
                const isDisputed = contract.isDisputed;
                
                // Neon thread effect for active/completed
                const showNeonThread = isCompleted || (isActive && m.status === "submitted");

                return (
                  <div key={m.id} className="relative pl-8">
                    {/* Neon Thread filling the past border */}
                    {showNeonThread && (
                      <div className="absolute -left-[1px] -top-12 bottom-0 w-[2px] bg-accent shadow-[0_0_10px_rgba(0,255,200,0.8)] z-10" />
                    )}

                    {/* Timeline Node */}
                    <div className={`absolute -left-[7px] top-1.5 w-3 h-3 rounded-full z-20 ${
                      isCompleted ? 'bg-accent shadow-[0_0_8px_rgba(0,255,200,0.8)]' : 
                      isActive ? 'bg-bg-base border-2 border-accent shadow-[0_0_12px_rgba(0,255,200,0.5)]' : 
                      'bg-bg-base border-2 border-ink-tertiary'
                    }`} />

                    <div className="bg-bg-base border border-edge-neutral p-6 shadow-neopop group hover:border-accent/50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                          <h3 className={`font-ui-label font-bold text-lg mb-1 uppercase tracking-widest ${isCompleted ? 'text-ink-secondary line-through' : 'text-ink-primary'}`}>
                            {m.description}
                          </h3>
                          <p className="font-mono-data text-ink-secondary text-sm uppercase tracking-wider flex items-center gap-2">
                            Status: <span className={isCompleted ? 'text-accent' : isActive ? 'text-ink-primary' : ''}>{m.status}</span>
                            {(() => {
                              const onChainStatus = escrowState?.milestones?.[index]?.status as any;
                              const onChainTag = (typeof onChainStatus === 'string' ? onChainStatus : onChainStatus?.tag || "").toLowerCase();
                              if (onChainTag === "approved" || onChainTag === "released") {
                                return (
                                  <span className="inline-flex items-center gap-1 bg-accent/10 border border-accent/30 text-accent px-2 py-0.5 text-[10px] rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                    Verified On-Chain
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </p>

                          {m.deliverableUrl && (
                            <a href={m.deliverableUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-accent hover:text-white font-ui-label text-sm uppercase tracking-widest font-bold underline decoration-accent/50 underline-offset-4">
                              View Deliverable
                            </a>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono-data font-bold text-2xl">{Number(m.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm text-ink-tertiary">USDC</span></p>
                          <p className="text-xs text-ink-secondary uppercase tracking-widest mt-1">
                            {isCompleted ? 'Released' : isDisputed ? 'Locked (Dispute)' : 'Locked'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Context Panel on the right */}
          <div className="w-full lg:w-[420px] space-y-8 shrink-0">
            
            {/* Contract Context */}
            <div className="bg-bg-base border border-edge-neutral shadow-neopop p-6">
              <h3 className="font-mono-data text-ink-primary font-bold uppercase tracking-widest text-sm mb-6 pb-2 border-b border-dashed border-ink-tertiary">Contract Details</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="font-ui-label text-[10px] text-ink-tertiary uppercase tracking-widest mb-1">Total Value</p>
                  <p className="font-mono-data font-bold text-3xl tabular-nums text-accent">{Number(contract.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</p>
                </div>
                
                <div>
                  <p className="font-ui-label text-[10px] text-ink-tertiary uppercase tracking-widest mb-1">Client</p>
                  <p className="font-mono-data text-xs break-all text-ink-secondary">{contract.clientWallet}</p>
                  {isClient && <span className="inline-block mt-2 bg-ink-primary text-bg-base px-2 py-0.5 font-ui-label text-[10px] uppercase font-bold tracking-widest">You</span>}
                </div>
                
                <div>
                  <p className="font-ui-label text-[10px] text-ink-tertiary uppercase tracking-widest mb-1">Freelancer</p>
                  <p className="font-mono-data text-xs break-all text-ink-secondary">{contract.freelancerWallet}</p>
                  {isFreelancer && <span className="inline-block mt-2 bg-ink-primary text-bg-base px-2 py-0.5 font-ui-label text-[10px] uppercase font-bold tracking-widest">You</span>}
                </div>
              </div>
            </div>

            {/* Action Panel */}
            <div className="bg-bg-base border border-edge-neutral shadow-neopop p-6">
              <h3 className="font-mono-data text-ink-primary font-bold uppercase tracking-widest text-sm mb-6 pb-2 border-b border-dashed border-ink-tertiary">
                {activeMilestone ? `Action: Milestone ${activeMilestone.id}` : 'Actions'}
              </h3>
              
              {!isConnected ? (
                <p className="font-ui-label text-sm text-ink-secondary">Connect wallet to manage.</p>
              ) : contract.isDisputed ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-status-disputed border border-status-disputed/30 bg-status-disputed/10 p-4">
                    <ShieldAlert className="w-6 h-6 shrink-0" />
                    <span className="font-ui-label font-bold uppercase tracking-widest text-sm">Dispute Active</span>
                  </div>
                  {isClient ? (
                    <div className="space-y-4">
                      <p className="text-xs font-ui-label text-ink-secondary">Resolve dispute by specifying recipient and amount.</p>
                      <input
                        type="text"
                        value={resolveForm.releaseTo}
                        onChange={(e) => setResolveForm(prev => ({ ...prev, releaseTo: e.target.value }))}
                        placeholder="Release To (G...)"
                        className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 font-mono-data text-sm transition-colors"
                      />
                      <input
                        type="number"
                        value={resolveForm.amount}
                        onChange={(e) => setResolveForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="Amount (USDC)"
                        className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 font-mono-data text-sm transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleResolveDispute}
                        disabled={isResolvingDispute || !resolveForm.releaseTo || !resolveForm.amount}
                        className="w-full py-4 bg-status-disputed text-black font-ui-label font-bold uppercase tracking-widest text-sm flex justify-center items-center gap-2 hover:bg-opacity-90 disabled:opacity-50 mt-4"
                      >
                        {isResolvingDispute ? <Loader2 className="w-5 h-5 animate-spin" /> : "Resolve Dispute"}
                      </button>
                    </div>
                  ) : isFreelancer ? (
                    <p className="text-xs font-ui-label text-ink-secondary">Awaiting resolution from the client.</p>
                  ) : null}
                </div>
              ) : !contractIsAccepted ? (
                isClient ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 border border-dashed border-status-disputed">
                      <p className="font-ui-label text-sm text-status-disputed uppercase tracking-widest mb-1">Awaiting Acceptance</p>
                      <p className="font-mono-data text-xs text-ink-secondary">Freelancer has not accepted this contract yet.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelContract}
                      disabled={isCancelling}
                      className="w-full py-4 bg-status-disputed/10 text-status-disputed border border-status-disputed/50 font-ui-label font-bold uppercase tracking-widest text-sm flex justify-center items-center gap-2 hover:bg-status-disputed/20 disabled:opacity-50"
                    >
                      {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cancel Contract & Refund"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-6 border border-dashed border-accent">
                      <p className="font-ui-label text-sm text-accent uppercase tracking-widest mb-1">New Contract Offer</p>
                      <p className="font-mono-data text-xs text-ink-secondary">Review the milestones and accept to begin.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAcceptContract}
                      disabled={isAccepting}
                      className="neopop-button-teal w-full py-4 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAccepting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accept Contract"}
                    </button>
                  </div>
                )
              ) : isClient ? (
                <div className="space-y-6">
                  {currentStatus === "pending" ? (
                    <div className="text-center p-6 border border-dashed border-ink-tertiary">
                      <p className="font-ui-label text-sm text-ink-secondary uppercase tracking-widest">Awaiting Submission</p>
                    </div>
                  ) : currentStatus === "submitted" ? (
                    <>
                      <div className="p-4 bg-accent/10 border border-accent/20 mb-6">
                        <p className="font-ui-label text-sm text-accent font-bold uppercase tracking-widest">Work Submitted</p>
                      </div>
                      
                      <button type="button"
                        onClick={handleApprove}
                        disabled={isEscrowLoading}
                        className="neopop-button-teal w-full py-5 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isEscrowLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Approve & Release Funds"}
                      </button>

                      {isDisputeFlowOpen ? (
                        <div className="mt-6 p-4 border border-status-disputed/30 bg-status-disputed/5 space-y-4">
                          <p className="font-ui-label text-sm font-bold text-status-disputed uppercase tracking-widest">Confirm Dispute</p>
                          <p className="text-xs font-mono-data text-ink-secondary">This will lock all funds until resolved.</p>
                          <div className="flex gap-4 pt-2">
                            <button
                              type="button"
                              onClick={handleFlagDispute}
                              disabled={isFlaggingDispute}
                              className="flex-1 py-3 bg-status-disputed text-black font-ui-label font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                              {isFlaggingDispute ? "Processing..." : "Flag"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsDisputeFlowOpen(false)}
                              className="flex-1 py-3 border border-ink-tertiary text-ink-primary font-ui-label font-bold text-xs uppercase tracking-widest hover:bg-ink-tertiary/20"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsDisputeFlowOpen(true)}
                          className="w-full mt-4 py-3 border border-status-disputed/50 text-status-disputed font-ui-label font-bold uppercase tracking-widest text-xs hover:bg-status-disputed/10 transition-colors"
                        >
                          Request Revision / Dispute
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-6 border border-dashed border-accent">
                      <p className="font-ui-label text-sm text-accent font-bold uppercase tracking-widest">Completed</p>
                    </div>
                  )}
                  {contract.isClosed && (
                    <ContractReviewWidget 
                      contractId={contract.id} 
                      recipientWallet={contract.freelancerWallet} 
                    />
                  )}
                </div>
              ) : isFreelancer ? (
                <div className="space-y-6">
                  {currentStatus === "pending" ? (
                    <form onSubmit={handleSubmitWork} className="space-y-6">
                      <input
                        type="url"
                        required
                        value={deliverableUrl}
                        onChange={(e) => setDeliverableUrl(e.target.value)}
                        placeholder="Deliverable URL (https://...)"
                        className="w-full bg-transparent border-b-2 border-edge-neutral focus:border-accent outline-none py-3 font-mono-data text-sm transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingWork || !deliverableUrl}
                        className="neopop-button-teal w-full py-4 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmittingWork ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Work"}
                      </button>
                    </form>
                  ) : currentStatus === "submitted" ? (
                    <div className="text-center p-6 border border-dashed border-ink-tertiary">
                      <p className="font-ui-label text-sm text-ink-secondary uppercase tracking-widest mb-1">In Review</p>
                      <p className="font-mono-data text-xs text-ink-tertiary">Awaiting client approval</p>
                    </div>
                  ) : (
                    <div className="text-center p-6 border border-dashed border-accent">
                      <p className="font-ui-label text-sm text-accent font-bold uppercase tracking-widest">Completed</p>
                      <p className="font-mono-data text-xs text-ink-tertiary mt-2">Funds Released</p>
                    </div>
                  )}
                  {contract.isClosed && (
                    <ContractReviewWidget 
                      contractId={contract.id} 
                      recipientWallet={contract.clientWallet} 
                    />
                  )}
                </div>
              ) : (
                <p className="font-ui-label text-sm text-ink-secondary">Guest View (No actions available)</p>
              )}
            </div>

            {/* Chat Widget */}
            <div className="mt-8">
              <ChatWidget contractId={contract.id} />
            </div>

          </div>
        </div>

      </div>
    </ErrorBoundary>
  );
}