"use client";

import React, { useEffect, useState } from "react";
import { FileText, Plus, Search, Filter, MoreVertical, RefreshCw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { getUserContracts } from "@/lib/firebase/contracts";
import type { Contract } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ContractsPage() {
  const { isConnected, publicKey } = useWallet();
  const [state, setState] = useState<{contracts: Contract[], isLoading: boolean}>({
    contracts: [],
    isLoading: true
  });
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ contracts: [], isLoading: false });
    }
    return () => { active = false; };
  }, [isConnected, publicKey]);

  const { contracts, isLoading } = state;

  return (
    <div className="pt-24 pb-12 px-4 md:px-margin-desktop">
      {/* ── Header Section ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-section-gap">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">
            Contracts
          </h2>
          <p className="font-ui-label text-on-surface-variant mt-1">Manage your active agreements and proposals.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/contracts/new" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-ui-label text-ui-label flex items-center gap-2 hover:opacity-90 transition-opacity font-bold">
            <Plus className="w-5 h-5" />
            New Contract
          </Link>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 text-on-surface-variant w-5 h-5" />
          <input
            aria-label="Search contracts"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 font-ui-label text-ui-label focus:outline-none focus:border-primary"
            placeholder="Search by client, title, or ID..."
            type="text"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button type="button" className="flex-1 sm:flex-none px-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-ui-label text-ui-label flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors">
            <Filter className="w-4 h-4" />
            Status: All
          </button>
        </div>
      </div>

      {/* ── Contracts List ───────────────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low hidden md:table-header-group">
            <tr>
              <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">Contract Title</th>
              <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">Counterparty</th>
              <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">Value</th>
              <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">Status</th>
              <th className="py-3 px-6 font-ui-label text-xs uppercase tracking-wider text-on-surface-variant border-b border-outline-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2" />
                  <p className="font-ui-label">Loading contracts...</p>
                </td>
              </tr>
            ) : contracts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 px-4">
                  <div className="max-w-md mx-auto text-center">
                    <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant/50">
                      <FileText className="w-8 h-8 text-on-surface-variant" />
                    </div>
                    <h3 className="text-xl font-headline-lg mb-2">No Contracts Found</h3>
                    <p className="text-sm text-on-surface-variant mb-6">You don&apos;t have any active agreements or proposals yet. Create your first contract to get started.</p>
                    <Link href="/dashboard/contracts/new" className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary-hover transition-colors inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create Contract
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              contracts.map(contract => (
                <tr 
                  key={contract.id} 
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                  className="hover:bg-surface-container-low/50 transition-colors flex flex-col md:table-row p-4 md:p-0 cursor-pointer"
                >
                  <td className="py-2 md:py-4 px-0 md:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0 hidden sm:flex">
                        <FileText className="text-primary w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-ui-label text-sm font-semibold">{contract.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">ID: {contract.id.substring(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 md:py-4 px-0 md:px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
                        {contract.freelancerWallet === publicKey ? "C" : "F"}
                      </div>
                      <span className="font-ui-label text-sm font-mono-data truncate w-24">
                        {contract.freelancerWallet === publicKey ? contract.clientWallet : contract.freelancerWallet}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 md:py-4 px-0 md:px-6 font-mono-data text-sm">
                    {Number(contract.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                  </td>
                  <td className="py-2 md:py-4 px-0 md:px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      contract.isClosed ? "bg-surface-container-high text-on-surface-variant" :
                      contract.isDisputed ? "bg-error/10 text-error border border-error/20" :
                      "bg-secondary-container text-on-secondary-container"
                    }`}>
                      {contract.isClosed ? "Closed" : contract.isDisputed ? "Disputed" : "Active"}
                    </span>
                  </td>
                  <td className="py-2 md:py-4 px-0 md:px-6 text-right">
                    <button type="button" aria-label="More options" className="p-2 text-on-surface-variant hover:text-on-surface transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
