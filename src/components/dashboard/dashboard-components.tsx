"use client";

import React, { useEffect, useState, type ComponentType } from "react";
import { Wallet, TrendingUp, Lock, Clock, Code, FileText, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import { m } from "framer-motion";
import { KpiCard } from "@/components/features/KpiCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Contract, ActivityItem } from "@/types";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  },
};

interface DashboardHeaderProps {
  isConnected: boolean;
  publicKey: string | null;
  today: string;
  openModal: () => void;
  setRampType: (type: "deposit" | "withdraw") => void;
  setIsRampOpen: (open: boolean) => void;
}

export function DashboardHeader({ isConnected, publicKey, today, openModal, setRampType, setIsRampOpen }: DashboardHeaderProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-section-gap pt-8"
    >
      <div>
        <p className="font-ui-label text-on-surface-variant mb-1 text-sm">{today}</p>
        <h2 className="font-headline-lg text-headline-lg text-on-background">
          {isConnected ? `Good morning, ${publicKey?.substring(0, 4)}…` : "Good morning."}
        </h2>
      </div>
      <div className="flex gap-3">
        {!isConnected ? (
          <button
            onClick={openModal}
            type="button"
            className="px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg font-ui-label text-ui-label flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </button>
        ) : (
          <div className="px-3 py-2 bg-primary/8 border border-primary/15 rounded-lg text-primary font-mono-data text-sm font-semibold flex items-center h-[38px]">
            {publicKey?.substring(0, 6)}…{publicKey?.substring(publicKey.length - 4)}
          </div>
        )}
        <m.button
          type="button"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setRampType("deposit"); setIsRampOpen(true); }}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg font-ui-label text-ui-label flex items-center gap-2 btn-primary-inset font-bold"
        >
          <ArrowDownLeft className="w-4 h-4" />
          Deposit
        </m.button>
        <m.button
          type="button"
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setRampType("withdraw"); setIsRampOpen(true); }}
          className="px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg font-ui-label text-ui-label flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
        >
          <ArrowUpRight className="w-4 h-4" />
          Withdraw
        </m.button>
      </div>
    </m.div>
  );
}

const BALANCE_ICON = <Wallet className="w-5 h-5 text-primary" />;
const BALANCE_SUB = <><TrendingUp className="w-4 h-4" /> +12.5% from last month</>;
const ESCROW_ICON = <Lock className="w-5 h-5 text-secondary" />;
const PAYOUT_ICON = <Clock className="w-5 h-5 text-tertiary" />;
const PAYOUT_SUB = <span className="text-on-surface-variant">Estimated arrival: 2 days</span>;

interface KpiStripProps {
  isFetching: boolean;
  balanceRaw: number;
  escrowAmount: number;
  escrowCount: number;
  pendingPayouts: number;
}

export function KpiStrip({ isFetching, balanceRaw, escrowAmount, escrowCount, pendingPayouts }: KpiStripProps) {
  const escrowSub = React.useMemo(() => <span className="text-on-surface-variant">{escrowCount} Active Milestones</span>, [escrowCount]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-section-gap">
      {isFetching ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))
      ) : (
        <>
          <KpiCard
            label="Available Balance" value={balanceRaw} unit="USDC" delay={0}
            accent="primary"
            subIcon={BALANCE_ICON}
            sub={BALANCE_SUB}
          />
          <KpiCard
            label="Escrowed Amount" value={escrowAmount} unit="USDC" delay={0.08}
            accent="secondary"
            subIcon={ESCROW_ICON}
            sub={escrowSub}
          />
          <KpiCard
            label="Pending Payouts" value={pendingPayouts} unit="USDC" delay={0.16}
            accent="tertiary"
            subIcon={PAYOUT_ICON}
            sub={PAYOUT_SUB}
          />
        </>
      )}
    </div>
  );
}

interface ContractsActionListProps {
  contracts: Contract[];
  isFetching: boolean;
  publicKey: string | null;
  isLoading: boolean;
  isConnected: boolean;
  router: AppRouterInstance;
  onFundContract: (contract: Contract) => void;
  onCompleteWork: (milestoneId: number) => void;
}

export function ContractsActionList({ contracts, isFetching, publicKey, isLoading, isConnected, router, onFundContract, onCompleteWork }: ContractsActionListProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-section-title text-section-title text-on-background">Contracts Needing Action</h3>
        <button type="button" className="text-primary font-ui-label text-sm hover:underline underline-offset-2 transition-all">View all</button>
      </div>
      <m.div variants={stagger.container} initial="initial" animate="animate" className="space-y-3">
        {contracts.length === 0 && !isFetching && (
          <div className="text-center py-10 border border-outline-variant/50 rounded-xl bg-surface-container-lowest">
            <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-on-surface-variant" />
            </div>
            <h3 className="font-headline-lg text-lg mb-1">No Active Contracts</h3>
            <p className="text-sm text-on-surface-variant mb-4 max-w-[250px] mx-auto">Create a contract to safely escrow funds on the Stellar network.</p>
            <button 
              type="button"
              onClick={() => router.push('/dashboard/contracts/new')}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-ui-label text-sm font-bold btn-primary-inset flex items-center justify-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" /> Create Contract
            </button>
          </div>
        )}
        {contracts.slice(0, 3).map((c) => {
          const isClient = c.clientWallet === publicKey;
          const counterparty = isClient ? c.freelancerWallet : c.clientWallet;
          
          return (
          <m.div
            key={c.id}
            variants={stagger.item}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              router.push(`/dashboard/contracts/${c.id}`);
            }}
            whileHover={{ y: -2, boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}
            className="bg-surface-container-lowest border border-outline-variant p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-shadow cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                <Code className="text-primary w-5 h-5" />
              </div>
              <div>
                <h4 className="font-card-title text-card-title">{c.title}</h4>
                <p className="text-on-surface-variant text-sm truncate max-w-[200px] sm:max-w-[250px]">
                  Counterparty: <span className="text-on-surface font-medium font-mono-data">{counterparty}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {c.totalAmount > 0 && (
                <div className="text-right hidden sm:block mr-2">
                  <p className="text-xs text-on-surface-variant font-ui-label uppercase tracking-wide">Value</p>
                  <p className="font-mono-data text-sm font-bold">{c.totalAmount} USDC</p>
                </div>
              )}
              {c.isDisputed && (
                <div className="text-right hidden sm:block mr-2">
                  <p className="text-xs text-on-surface-variant font-ui-label uppercase tracking-wide">Status</p>
                  <p className="font-ui-label text-sm text-error font-medium">Disputed</p>
                </div>
              )}
              <m.button
                type="button"
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (isClient) onFundContract(c);
                  else onCompleteWork(0);
                }}
                disabled={isLoading || !isConnected}
                className="px-5 py-2.5 bg-primary text-on-primary font-ui-label text-sm font-bold rounded-lg btn-primary-inset hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" /> Processing…</>
                ) : (isClient ? "Fund Contract" : "Complete Work")}
              </m.button>
            </div>
          </m.div>
          );
        })}
      </m.div>
    </section>
  );
}

interface UpcomingMilestonesProps {
  contracts: Contract[];
  isFetching: boolean;
}

export function UpcomingMilestones({ contracts, isFetching }: UpcomingMilestonesProps) {
  const allMilestones = contracts.flatMap((c) =>
    (c.milestones || []).map((m) => ({ ...m, contractTitle: c.title }))
  ).slice(0, 5);

  return (
    <section>
      <h3 className="font-section-title text-section-title text-on-background mb-4">Upcoming Milestones</h3>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              {["Milestone", "Contract", "Amount", "Status"].map((h, i) => (
                <th key={h} className={`py-3 px-4 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant ${i === 3 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {allMilestones.length === 0 && !isFetching && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-on-surface-variant font-ui-label text-sm">
                  No upcoming milestones.
                </td>
              </tr>
            )}
            {allMilestones.map((m) => (
              <tr
                key={`ms-${m.id}-${m.contractTitle}`}
                className="transition-colors cursor-default hover:bg-[rgba(5,105,109,0.03)]"
              >
                <td className="py-4 px-4">
                  <p className="font-ui-label text-sm font-semibold">{m.description}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">Milestone {m.id}</p>
                </td>
                <td className="py-4 px-4 font-ui-label text-sm text-on-surface-variant">{m.contractTitle}</td>
                <td className="py-4 px-4 font-mono-data text-sm font-semibold">{m.amount} <span className="text-on-surface-variant font-normal">USDC</span></td>
                <td className="py-4 px-4 text-right">
                  <StatusBadge status={m.status === "pending" ? "In Progress" : m.status === "approved" ? "Completed" : "Scheduled"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface RecentActivityProps {
  activityItems: ActivityItem[];
}

export function RecentActivity({ activityItems }: RecentActivityProps) {
  return (
    <section>
      <h3 className="font-section-title text-section-title text-on-background mb-4">Recent Activity</h3>
      <div className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl">
        <m.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="space-y-5 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-outline-variant"
        >
          {activityItems.length === 0 && (
            <p className="text-sm text-on-surface-variant pl-10 pt-2">No recent activity found.</p>
          )}
          {activityItems.map((item, i) => {
            const Icon = item.icon as ComponentType<{ className?: string }>;
            return (
              <m.div key={`${item.title}-${i}`} variants={stagger.item} className="relative pl-10">
                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${item.color} flex items-center justify-center z-10 border-4 border-surface-container-lowest`}>
                  <Icon className="text-on-primary w-3 h-3" />
                </div>
                <p className="text-sm font-semibold text-on-surface">{item.title}</p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{item.desc}</p>
                <p className="text-[10px] text-outline mt-1 font-mono-data uppercase tracking-wide">{item.time}</p>
              </m.div>
            );
          })}
        </m.div>
        <m.button
          type="button"
          whileHover={{ backgroundColor: "var(--color-surface-container-low)" }}
          className="w-full mt-5 py-2.5 border border-outline-variant rounded-lg text-sm font-ui-label text-on-surface-variant hover:text-on-surface transition-colors"
        >
          View Full Audit Log
        </m.button>
      </div>
    </section>
  );
}

export function AccountHealth() {
  const [progressMounted, setProgressMounted] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setProgressMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="bg-primary/5 border border-primary/10 p-card-padding rounded-xl">
      <h4 className="font-mono-data text-[10px] text-primary uppercase tracking-widest mb-4">Account Health</h4>
      <div className="space-y-5">
        {[
          { label: "Contract Completion", value: 98, suffix: "%" },
          { label: "Identity Verification", value: 100, suffix: "Verified" },
        ].map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span className="text-on-surface">{bar.label}</span>
              <span className="text-primary font-mono-data">{bar.suffix}</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <m.div
                className="h-full bg-primary rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progressMounted ? bar.value / 100 : 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}