/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FileText, Plus, Search, Filter, ChevronRight, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { getUserContracts } from "@/lib/firebase/contracts";
import type { Contract } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/providers/error-boundary";

type StatusFilter = "all" | "active" | "disputed" | "closed";

export default function ContractsPage() {
  const { isConnected, publicKey } = useWallet();
  const [state, setState] = useState<{contracts: Contract[], isLoading: boolean}>({
    contracts: [],
    isLoading: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    if (isConnected && publicKey) {
      getUserContracts(publicKey).then(data => {
        if (active) setState({ contracts: data, isLoading: false });
      }).catch(err => {
        console.error("Failed to load contracts", err);
        if (active) setState(prev => ({ ...prev, isLoading: false }));
      });
    } else {
      setState({ contracts: [], isLoading: false });
    }
    return () => { active = false; };
  }, [isConnected, publicKey]);

  const { contracts, isLoading } = state;

  const filteredContracts = useMemo(() => {
    let result = contracts;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.id.toLowerCase().includes(term) ||
        c.clientWallet.toLowerCase().includes(term) ||
        c.freelancerWallet.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(c => {
        if (statusFilter === "active") return !c.isClosed && !c.isDisputed;
        if (statusFilter === "disputed") return c.isDisputed;
        if (statusFilter === "closed") return c.isClosed;
        return true;
      });
    }
    return result;
  }, [contracts, searchTerm, statusFilter]);

  const statusLabels: Record<StatusFilter, string> = { all: "All", active: "Active", disputed: "Disputed", closed: "Closed" };

  return (
    <ErrorBoundary>
      <div className="p-8 lg:p-12 max-w-7xl mx-auto bg-bg-void min-h-screen text-ink-primary">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-headline-lg text-4xl lg:text-5xl font-bold tracking-tight mb-4">Contracts</h1>
            <p className="text-ink-secondary font-ui-label text-lg">Manage your active agreements and proposals.</p>
          </div>
          <div>
            <Link href="/dashboard/contracts/new" className="neopop-button-teal px-6 py-4 font-ui-label font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Plus className="w-5 h-5" />
              New Contract
            </Link>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-6 justify-between items-center mb-8 border-b-2 border-edge-neutral pb-8">
          <div className="relative w-full sm:w-[400px]">
            <Search className="absolute left-4 top-3.5 text-ink-tertiary w-5 h-5" />
            <input
              aria-label="Search contracts"
              className="w-full bg-transparent border-2 border-edge-neutral focus:border-accent rounded-none pl-12 pr-4 py-3 font-mono-data text-sm outline-none transition-colors text-ink-primary placeholder:text-ink-tertiary"
              placeholder="Search client, title, ID..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto relative">
            <button 
              type="button" 
              onClick={() => setIsFilterOpen(v => !v)} 
              className="w-full sm:w-48 px-6 py-3 bg-bg-base border-2 border-edge-neutral hover:border-ink-secondary font-ui-label text-sm uppercase tracking-widest font-bold flex items-center justify-between transition-colors"
            >
              <span>{statusLabels[statusFilter]}</span>
              <Filter className="w-4 h-4" />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 w-full sm:w-48 bg-bg-base border-2 border-edge-neutral shadow-neopop z-20 flex flex-col">
                {(Object.keys(statusLabels) as StatusFilter[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setStatusFilter(key); setIsFilterOpen(false); }}
                    className={`px-6 py-3 text-left font-ui-label text-sm uppercase tracking-widest font-bold hover:bg-ink-tertiary/10 transition-colors border-b-2 border-edge-neutral last:border-b-0 ${
                      statusFilter === key ? 'text-accent' : 'text-ink-secondary'
                    }`}
                  >
                    {statusLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contracts List */}
        <div className="bg-bg-base border border-edge-neutral shadow-neopop overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="py-5 px-6 font-mono-data text-[10px] uppercase tracking-widest text-ink-tertiary border-b-2 border-edge-neutral w-2/5">Contract Title</th>
                <th className="py-5 px-6 font-mono-data text-[10px] uppercase tracking-widest text-ink-tertiary border-b-2 border-edge-neutral w-1/5">Counterparty</th>
                <th className="py-5 px-6 font-mono-data text-[10px] uppercase tracking-widest text-ink-tertiary border-b-2 border-edge-neutral w-1/5">Value</th>
                <th className="py-5 px-6 font-mono-data text-[10px] uppercase tracking-widest text-ink-tertiary border-b-2 border-edge-neutral w-1/5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge-neutral">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-ink-tertiary">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-4" />
                    <p className="font-mono-data text-xs uppercase tracking-widest">Loading Contracts...</p>
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 px-6 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-bg-void border-2 border-dashed border-ink-tertiary flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-ink-tertiary" />
                      </div>
                      <h3 className="font-headline-lg text-2xl font-bold mb-3">No Contracts Found</h3>
                      <p className="font-ui-label text-ink-secondary text-sm mb-8">You don't have any active agreements or proposals yet.</p>
                      <Link href="/dashboard/contracts/new" className="neopop-button-base inline-flex px-8 py-4 font-ui-label font-bold uppercase tracking-widest text-sm items-center gap-2">
                        <Plus className="w-5 h-5" /> Create Contract
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContracts.map(contract => (
                  <tr 
                    key={contract.id} 
                    onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                    className="group hover:bg-bg-void transition-colors cursor-pointer"
                  >
                    <td className="py-6 px-6 border-r border-dashed border-edge-neutral/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border-2 border-ink-tertiary flex items-center justify-center shrink-0 group-hover:border-accent transition-colors">
                          <FileText className="text-ink-secondary group-hover:text-accent w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-ui-label text-lg font-bold group-hover:text-accent transition-colors">{contract.title}</p>
                          <p className="font-mono-data text-xs text-ink-secondary mt-1 uppercase tracking-widest">ID: {contract.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6 border-r border-dashed border-edge-neutral/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-2 border-ink-primary bg-ink-primary text-bg-base flex items-center justify-center font-bold text-xs uppercase font-mono-data">
                          {contract.freelancerWallet === publicKey ? "C" : "F"}
                        </div>
                        <span className="font-mono-data text-sm text-ink-secondary truncate w-24">
                          {contract.freelancerWallet === publicKey ? contract.clientWallet : contract.freelancerWallet}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-6 border-r border-dashed border-edge-neutral/50 font-mono-data text-lg font-bold">
                      {Number(contract.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-ink-tertiary uppercase tracking-widest">USDC</span>
                    </td>
                    <td className="py-6 px-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <span className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-2 ${
                          contract.isClosed ? "border-ink-tertiary text-ink-secondary" :
                          contract.isDisputed ? "border-status-disputed text-status-disputed bg-status-disputed/10" :
                          "border-accent text-accent bg-accent/10"
                        }`}>
                          {contract.isClosed ? "Closed" : contract.isDisputed ? "Disputed" : "Active"}
                        </span>
                        <ChevronRight className="w-5 h-5 text-ink-tertiary group-hover:text-accent transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ErrorBoundary>
  );
}
