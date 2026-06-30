"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Download, ArrowUpRight, ArrowDownLeft, Search, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { getUserContracts } from "@/lib/firebase/contracts";
import type { Contract } from "@/types";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/providers/error-boundary";

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
  const [searchTerm, setSearchTerm] = useState("");
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
          
          txs.push({
            id: `tx_dep_${c.id}`,
            type: 'deposit',
            amount: c.totalAmount,
            dateStr: dateVal.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            timestamp: dateVal.getTime(),
            contractTitle: c.title,
            counterparty: counterparty,
            isIncoming: !isClient
          });
          
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
                isIncoming: !isClient
              });
            }
          });
          
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
                isIncoming: isClient
             });
          }
        });
        
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
    .reduce((acc, curr) => {
      const unreleasedAmount = (curr.milestones || []).reduce((mAcc, m) => {
        if (m.status !== 'approved' && m.status !== 'released') {
          return mAcc + Number(m.amount || 0);
        }
        return mAcc;
      }, 0);
      return acc + unreleasedAmount;
    }, 0);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (activeTab !== "all") {
      filtered = filtered.filter(tx => tx.type === activeTab);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.contractTitle.toLowerCase().includes(term) ||
        tx.counterparty.toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [transactions, activeTab, searchTerm]);

  const handleExportCSV = useCallback(() => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export.");
      return;
    }
    const headers = ["Type", "Amount", "Date", "Contract", "Counterparty"];
    const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];
    const escapeCsv = (val: string) => {
      const sanitized = FORMULA_PREFIXES.includes(val.charAt(0)) ? `'${val}` : val;
      return `"${sanitized.replace(/"/g, '""')}"`;
    };
    const rows = filteredTransactions.map(tx => [
      tx.type,
      `${tx.isIncoming ? '+' : '-'}${Number(tx.amount).toFixed(2)} USDC`,
      tx.dateStr,
      tx.contractTitle,
      tx.counterparty,
    ].map(escapeCsv).join(","));
    const csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `freelancepay_transactions_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredTransactions.length} transactions.`);
  }, [filteredTransactions]);

  return (
    <ErrorBoundary>
      <div className="p-8 lg:p-12 max-w-7xl mx-auto bg-bg-void min-h-screen text-ink-primary">
        
        <div className="mb-12">
          <h1 className="font-headline-lg text-4xl lg:text-5xl font-bold tracking-tight mb-4">Wallet & Ramp</h1>
          <p className="text-ink-secondary font-ui-label text-lg">Manage your on-chain assets and escrow balances.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Balances (Massive Text) */}
          <div className="lg:col-span-5 space-y-12">
            
            <div>
              <p className="font-mono-data text-ink-secondary text-sm uppercase tracking-widest mb-4">Total Value Processed</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-data text-ink-tertiary text-4xl sm:text-6xl">$</span>
                <span className="font-headline-lg text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-ink-primary">
                  {totalProcessed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-8 border-t-2 border-edge-neutral">
              <p className="font-mono-data text-ink-secondary text-sm uppercase tracking-widest mb-4">Current Escrow Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="font-mono-data text-ink-tertiary text-2xl sm:text-4xl">$</span>
                <span className="font-headline-lg text-4xl sm:text-5xl font-bold tracking-tighter text-accent">
                  {currentEscrow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="pt-12">
              <button 
                type="button" 
                onClick={handleExportCSV} 
                className="neopop-button-base w-full py-5 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5" />
                Export CSV Statement
              </button>
            </div>
            
          </div>

          {/* Right Column: Transaction History */}
          <div className="lg:col-span-7 bg-bg-base border border-edge-neutral shadow-neopop p-6 lg:p-8 flex flex-col">
            
            <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center mb-8 border-b-2 border-edge-neutral pb-6">
              <h2 className="font-headline-lg text-2xl font-bold tracking-tight">History</h2>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-ink-tertiary w-4 h-4" />
                <input
                  aria-label="Search transactions"
                  className="w-full bg-transparent border-2 border-edge-neutral focus:border-accent rounded-none pl-10 pr-4 py-2 font-mono-data text-sm outline-none transition-colors text-ink-primary placeholder:text-ink-tertiary"
                  placeholder="Search TXN hash..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              {["all", "deposits", "releases", "refunds"].map((tab) => (
                <button 
                  type="button"
                  key={tab}
                  onClick={() => dispatch({ type: "SET_TAB", payload: tab })}
                  className={`px-4 py-2 font-ui-label text-xs uppercase tracking-widest font-bold border-2 transition-colors ${
                    activeTab === tab
                      ? "bg-ink-primary text-bg-base border-ink-primary"
                      : "bg-transparent text-ink-secondary border-edge-neutral hover:border-ink-secondary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr>
                    <th className="py-4 px-2 font-mono-data text-[10px] uppercase tracking-widest text-ink-tertiary border-b-2 border-edge-neutral w-1/3">Type / Contract</th>
                    <th className="py-4 px-2 font-mono-data text-[10px] uppercase tracking-widest text-ink-tertiary border-b-2 border-edge-neutral w-1/4">Date</th>
                    <th className="py-4 px-2 font-mono-data text-[10px] uppercase tracking-widest text-ink-tertiary border-b-2 border-edge-neutral w-1/3 text-right">Amount (USDC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge-neutral">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-ink-tertiary">
                        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                        <p className="font-mono-data text-xs uppercase tracking-widest">Loading...</p>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-16">
                        <div className="max-w-md mx-auto text-center">
                          <div className="w-16 h-16 bg-bg-void border-2 border-dashed border-ink-tertiary flex items-center justify-center mx-auto mb-6">
                            <RefreshCw className="w-6 h-6 text-ink-tertiary" />
                          </div>
                          <h3 className="text-xl font-headline-lg font-bold mb-2">No Transactions Found</h3>
                          <p className="text-sm font-ui-label text-ink-secondary">Your escrow deposits and releases will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx: PaymentTransaction) => (
                      <tr key={tx.id} className="group hover:bg-bg-void transition-colors cursor-default">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 border-2 flex items-center justify-center shrink-0 ${
                              tx.type === 'deposit' ? 'bg-ink-primary text-bg-base border-ink-primary' :
                              tx.type === 'release' ? 'bg-accent/20 text-accent border-accent' :
                              'bg-status-disputed/20 text-status-disputed border-status-disputed'
                            }`}>
                              {tx.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : 
                               tx.type === 'release' ? <ArrowUpRight className="w-5 h-5" /> :
                               <RefreshCw className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-ui-label font-bold text-sm uppercase tracking-widest">{tx.type}</p>
                              <p className="font-ui-label text-xs text-ink-secondary truncate max-w-[150px]">{tx.contractTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <p className="font-mono-data text-sm text-ink-secondary">{tx.dateStr}</p>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <p className={`font-mono-data font-bold text-lg tabular-nums ${
                            tx.isIncoming ? "text-accent" : "text-ink-primary"
                          }`}>
                            {tx.isIncoming ? "+" : "-"}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </ErrorBoundary>
  );
}
