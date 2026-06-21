"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useEscrow } from "@/hooks/useEscrow";
import { getAccountBalance } from "@/lib/stellar/client";
import { getUserContracts } from "@/lib/firebase/contracts";
import type { Contract, ActivityItem } from "@/types";
import { RampModal } from "@/components/RampModal";
import { CustomWalletModal } from "@/components/CustomWalletModal";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import { 
  DashboardHeader, KpiStrip, ContractsActionList, 
  UpcomingMilestones, RecentActivity, AccountHealth 
} from "@/components/dashboard/dashboard-components";
import { FileText, CheckCircle, Lock, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { isConnected, openModal, closeModal, isModalOpen, connectWallet, supportedWallets, publicKey } = useWallet();
  const { state: escrowState, approveMilestone, initializeEscrow, isLoading } = useEscrow();
  const [state, setState] = useState({
    balanceRaw: 0,
    balanceError: null as string | null,
    contracts: [] as Contract[],
    isRampOpen: false,
    rampType: "deposit" as "deposit" | "withdraw"
  });
  const { balanceRaw, balanceError, contracts, isRampOpen, rampType } = state;
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);

  const syncContracts = useCallback(async (userContracts: Contract[]) => {
    if (!escrowState || userContracts.length === 0) return userContracts;

    const activeContract = userContracts.find(
      c => c.contractAddress && escrowState
    );
    if (!activeContract?.milestones) return userContracts;

    let hasMismatch = false;
    const syncedContracts = [...userContracts];
    const syncedActive = { ...activeContract, milestones: [...activeContract.milestones] };

    escrowState.milestones.forEach((onChainMilestone) => {
      const idx = Number(onChainMilestone.id);
      const onChainStatus = onChainMilestone.status.tag.toLowerCase();

      const localMilestone = syncedActive.milestones[idx];
      if (localMilestone && localMilestone.status !== onChainStatus) {
        hasMismatch = true;
        syncedActive.milestones[idx] = { ...localMilestone, status: onChainStatus as Contract["milestones"][number]["status"] };
        import("@/lib/firebase/contracts").then(m => m.updateMilestoneStatus(activeContract.id, idx, onChainStatus as Parameters<typeof m.updateMilestoneStatus>[2]));
      }
    });

    if (hasMismatch) {
      const idx = syncedContracts.findIndex(c => c.id === activeContract.id);
      if (idx >= 0) syncedContracts[idx] = syncedActive;
      return syncedContracts;
    }
    return userContracts;
  }, [escrowState]);

  useEffect(() => {
    let active = true;
    if (isConnected && publicKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsFetching(true);
      Promise.all([
        getAccountBalance(publicKey, "USDC"),
        getUserContracts(publicKey)
      ])
        .then(async ([balanceResult, userContracts]) => {
          if (!active) return;
          const synced = await syncContracts(userContracts);
          setState(prev => ({
            ...prev,
            balanceRaw: Number(balanceResult.balance) || 0,
            balanceError: balanceResult.error,
            contracts: synced,
          }));
        })
        .finally(() => {
          if (active) setIsFetching(false);
        });
    } else {
      setState(prev => ({ ...prev, balanceRaw: 0, balanceError: null, contracts: [] }));
    }
    return () => { active = false; };
  }, [isConnected, publicKey, syncContracts]);

  let escrowAmount = 0;
  let escrowCount = 0;
  let pendingPayouts = 0;

  for (const c of contracts) {
    if (!c.isClosed) {
      if (!c.isDisputed) {
        escrowAmount += Number(c.totalAmount || 0);
        escrowCount += (c.milestones?.length || 0);
      }
      for (const m of (c.milestones || [])) {
        if (m.status === "pending" || m.status === "submitted" || m.status === "approved") {
          pendingPayouts += Number(m.amount || 0);
        }
      }
    }
  }

  const today = React.useSyncExternalStore(
    React.useCallback(() => () => {}, []),
    React.useCallback(() => new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "short", day: "numeric", year: "numeric",
    }), []),
    React.useCallback(() => "", [])
  );
  const activityItems: ActivityItem[] = React.useMemo(() => {
    const items: ActivityItem[] = [];
    contracts.forEach(c => {
      const createdAtMs = c.createdAt instanceof Date ? c.createdAt.getTime() : 0;
      const updatedAtMs = c.updatedAt instanceof Date ? c.updatedAt.getTime() : 0;

      items.push({
        icon: FileText, color: "bg-tertiary", title: "New Contract Created",
        desc: `Contract "${c.title}" has been finalized.`,
        date: createdAtMs,
        time: new Date(createdAtMs).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      });

      c.milestones?.forEach(m => {
        if (m.status === "released" || m.status === "approved") {
          items.push({
            icon: CheckCircle, color: "bg-primary", title: "Milestone Released",
            desc: `${m.amount} USDC released for "${m.description}".`,
            date: updatedAtMs,
            time: new Date(updatedAtMs).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          });
        } else if (m.status === "submitted") {
          items.push({
            icon: RefreshCw, color: "bg-outline", title: "Review Requested",
            desc: `Work submitted for "${m.description}".`,
            date: updatedAtMs,
            time: new Date(updatedAtMs).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          });
        }
      });

      if (c.isDisputed) {
        items.push({
          icon: Lock, color: "bg-error", title: "Dispute Flagged",
          desc: `Contract "${c.title}" has been flagged.`,
          date: updatedAtMs,
          time: new Date(updatedAtMs).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        });
      }
    });

    items.sort((a, b) => b.date - a.date);
    return items.slice(0, 4);
  }, [contracts]);

  const handleFundContract = useCallback((c: Contract) => {
    initializeEscrow(
      c.freelancerWallet,
      [c.totalAmount],
      [c.description || "Milestone"]
    );
  }, [initializeEscrow]);

  return (
    <ErrorBoundary>
      <div className="px-4 md:px-margin-desktop">
        <DashboardHeader 
          isConnected={isConnected} 
          publicKey={publicKey} 
          today={today} 
          openModal={openModal} 
          setRampType={(type: "deposit" | "withdraw") => setState(prev => ({ ...prev, rampType: type }))} 
          setIsRampOpen={(open: boolean) => setState(prev => ({ ...prev, isRampOpen: open }))} 
        />

        {balanceError && (
          <p className="text-xs text-error mb-2">{balanceError}</p>
        )}

        <RampModal isOpen={isRampOpen} onClose={() => setState(prev => ({ ...prev, isRampOpen: false }))} type={rampType} />
        <CustomWalletModal isOpen={isModalOpen} onClose={closeModal} wallets={supportedWallets} onSelect={connectWallet} />

        <KpiStrip 
          isFetching={isFetching} 
          balanceRaw={balanceRaw} 
          escrowAmount={escrowAmount} 
          escrowCount={escrowCount} 
          pendingPayouts={pendingPayouts} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-8 space-y-gutter">
            <ContractsActionList 
              contracts={contracts} 
              isFetching={isFetching} 
              publicKey={publicKey} 
              isLoading={isLoading} 
              isConnected={isConnected} 
              router={router} 
              onFundContract={handleFundContract}
              onCompleteWork={approveMilestone}
            />
            <UpcomingMilestones contracts={contracts} isFetching={isFetching} />
          </div>

          <div className="lg:col-span-4 space-y-gutter">
            <RecentActivity activityItems={activityItems} />
            <AccountHealth />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}