"use client";

import React, { useEffect } from "react";
import { Download, ArrowUpRight, ArrowDownLeft, Search, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { getUserContracts } from "@/lib/firebase/contracts";
import type { Contract } from "@/types";

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  if (value && typeof value === "object" && "toDate" in value) {
    const v = value as { toDate: () => Date };
    return v.toDate();
  }
  return new Date();
}

export type PaymentTransaction = {
  id: string;
  type: 'deposit' | 'release' | 'refund';
  amount: number;
  dateStr: string;
  timestamp: number;
  contractTitle: string;
  counterparty: string;
  isIncoming: boolean;
};

type State = {
  activeTab: string;
  transactions: PaymentTransaction[];
  isLoading: boolean;
  contracts: Contract[];
};

type Action = 
  | { type: "START_LOADING" }
  | { type: "SET_DATA"; payload: { contracts: Contract[]; transactions: PaymentTransaction[] } }
  | { type: "SET_ERROR" }
  | { type: "CLEAR" }
  | { type: "SET_TAB"; payload: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "START_LOADING": return { ...state, isLoading: true };
    case "SET_DATA": return { ...state, contracts: action.payload.contracts, transactions: action.payload.transactions, isLoading: false };
    case "SET_ERROR": return { ...state, isLoading: false };
    case "CLEAR": return { ...state, transactions: [], contracts: [], isLoading: false };
    case "SET_TAB": return { ...state, activeTab: action.payload };
    default: return state;
  }
};

export default function PaymentsPage() {
  const { isConnected, publicKey } = useWallet();
  const [state, dispatch] = React.useReducer(reducer, {
    activeTab: "all",
    transactions: [],
    isLoading: true,
    contracts: []
  });
  const { activeTab, transactions, isLoading, contracts } = state;

  useEffect(() => {
    if (isConnected && publicKey) {
      dispatch({ type: "START_LOADING" });
      
      // Fetch Contracts for stats and transaction history
      getUserContracts(publicKey).then(data => {
        
        const txs: PaymentTransaction[] = [];
        data.forEach(c => {
          const isClient = c.clientWallet === publicKey;
          const counterparty = isClient ? c.freelancerWallet : c.clientWallet;
          
          const dateVal = toDate(c.createdAt);
          
          // Deposit Event: When the contract was created/funded
          txs.push({
            id: `tx_dep_${c.id}`,
            type: 'deposit',
            amount: c.totalAmount,
            dateStr: dateVal.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            timestamp: dateVal.getTime(),
            contractTitle: c.title,
            counterparty: counterparty,
            isIncoming: !isClient // If I'm the freelancer, the deposit is incoming to my escrow
          });
          
          // Release Events: For any approved/released milestones
          c.milestones?.forEach(m => {
            if (m.status === 'approved' || m.status === 'released') {
              const rDateVal = toDate(c.updatedAt || c.createdAt);
              txs.push({
                id: `tx_rel_${c.id}_${m.id}`,
                type: 'release',
                amount: m.amount,
                dateStr: rDateVal.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                timestamp: rDateVal.getTime(),
                contractTitle: `${c.title} - M${m.id}`,
                counterparty: counterparty,
                isIncoming: !isClient // If I'm the freelancer, the release is incoming to my wallet
              });
            }
          });
          
          // Refund Event: If contract is disputed
          if (c.isDisputed) {
             const dDateVal = toDate(c.updatedAt || c.createdAt);
             txs.push({
                id: `tx_ref_${c.id}`,
                type: 'refund',
                amount: c.totalAmount,
                dateStr: dDateVal.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                timestamp: dDateVal.getTime(),
                contractTitle: `${c.title} (Disputed)`,
                counterparty: counterparty,
                isIncoming: isClient // If I'm the client, refund comes back to me
             });
          }
        });
        
        // Sort descending by date
        txs.sort((a, b) => b.timestamp - a.timestamp);
        
        dispatch({ type: "SET_DATA", payload: { contracts: data, transactions: txs } });
      }).catch(err => {
        console.error("Failed to load contracts", err);
        dispatch({ type: "SET_ERROR" });
      });

    } else {
      dispatch({ type: "CLEAR" });
    }
  }, [isConnected, publicKey]);

  const totalProcessed = contracts
    .filter(c => c.isClosed)
    .reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);

  const currentEscrow = contracts
    .filter(c => !c.isClosed && !c.isDisputed)
    .reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);

  return (
    <div className="pt-24 pb-12 px-4 md:px-margin-desktop">
      {/* ── Header Section ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-section-gap">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">
            Payments
          </h2>
          <p className="font-ui-label text-on-surface-variant mt-1">Track transactions, escrow deposits, and withdrawals.</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="px-4 py-2 bg-surface-container-high border border-outline-variant rounded-lg font-ui-label text-ui-label flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-section-gap">
        <div className="bg-primary/5 border border-primary/20 p-card-padding rounded-xl">
          <span className="font-ui-label text-primary uppercase tracking-wider text-xs font-bold mb-2 block">Total Processed</span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-data text-3xl text-on-background">{totalProcessed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="font-ui-label text-on-surface-variant">USDC</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant p-card-padding rounded-xl">
          <span className="font-ui-label text-on-surface-variant uppercase tracking-wider text-xs font-bold mb-2 block">Current Escrow Balance</span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-data text-3xl text-on-background">{currentEscrow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="font-ui-label text-on-surface-variant">USDC</span>
          </div>
        </div>
      </div>

      {/* ── Transaction History ──────────────────────────────────── */}
      <section>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex gap-2 p-1 bg-surface-container-low rounded-lg w-full sm:w-auto overflow-x-auto">
            {["all", "deposits", "releases", "refunds"].map((tab) => (
              <button type="button"
                key={tab}
                onClick={() => dispatch({ type: "SET_TAB", payload: tab })}
                className={`px-4 py-1.5 rounded-md font-ui-label text-sm capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-surface-container-lowest text-on-background shadow-sm"
                    : "text-on-surface-variant hover:text-on-background"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-on-surface-variant w-4 h-4" />
            <input
              aria-label="Search transactions"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-9 pr-4 py-2 font-ui-label text-sm focus:outline-none focus:border-primary"
              placeholder="Search TXN hash..."
              type="text"
            />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low hidden md:table-header-group">
              <tr>
                <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">Transaction</th>
                <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">Date</th>
                <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">Contract ID</th>
                <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-on-surface-variant">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                    <p className="font-ui-label">Loading transactions...</p>
                  </td>
                </tr>
              ) : (() => {
                  const filtered = transactions.filter(tx => {
                    if (activeTab === "all") return true;
                    return tx.type === activeTab;
                  });

                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan={4} className="py-16 px-4">
                          <div className="max-w-md mx-auto text-center">
                            <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant/50">
                              <RefreshCw className="w-8 h-8 text-on-surface-variant" />
                            </div>
                            <h3 className="text-xl font-headline-lg mb-2">No Transactions Found</h3>
                            <p className="text-sm text-on-surface-variant mb-6">You don&apos;t have any transaction history yet. Your escrow deposits and releases will appear here.</p>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return filtered.map((tx: PaymentTransaction) => (
                    <tr key={tx.id} className="group hover:bg-surface-container-highest transition-colors">
                      <td className="py-2 md:py-4 px-0 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            tx.type === 'deposit' ? 'bg-primary/10 text-primary' :
                            tx.type === 'release' ? 'bg-secondary/10 text-secondary' :
                            'bg-error/10 text-error'
                          }`}>
                            {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : 
                             tx.type === 'release' ? <ArrowUpRight className="w-4 h-4" /> :
                             <RefreshCw className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-ui-label text-sm text-on-background capitalize">{tx.type}</p>
                            <p className="font-ui-label text-xs text-on-surface-variant truncate max-w-[120px] md:max-w-[200px]">{tx.contractTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-1 md:py-4 px-0 md:px-6 font-mono-data text-sm text-on-surface-variant">
                        {tx.dateStr}
                      </td>
                      <td className="py-1 md:py-4 px-0 md:px-6">
                        <span className="font-ui-label text-sm text-secondary truncate max-w-[150px] inline-block">{tx.counterparty.substring(0, 10)}...</span>
                      </td>
                      <td className="py-2 md:py-4 px-0 md:px-6 text-right font-mono-data font-bold text-on-background">
                        {tx.isIncoming ? "+" : "-"}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                      </td>
                    </tr>
                  ));
              })()}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
