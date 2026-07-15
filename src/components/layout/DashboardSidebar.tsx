"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from 'framer-motion';
import { Plus, HelpCircle, UserCog, AlertTriangle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Logo } from "@/components/ui/Logo";
import { RampExplanationModal } from "@/components/dashboard/RampExplanationModal";

import { navItems } from "./navItems";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isRampModalOpen, setRampModalOpen] = useState(false);
  const { isConnected, walletNetwork } = useWallet();
  const siteNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET";
  const resolvedWalletNet = walletNetwork ? walletNetwork.toUpperCase() : siteNetwork === "PUBLIC" ? "MAINNET" : "TESTNET";
  const wNet = resolvedWalletNet === "PUBLIC" ? "MAINNET" : resolvedWalletNet;
  if (!mounted) {
    setMounted(true);
  }

  // Normalize both for comparison
  const sNetNorm = siteNetwork === "PUBLIC" ? "MAINNET" : siteNetwork.toUpperCase();
  const wNetNorm = wNet === "PUBLIC" ? "MAINNET" : wNet.toUpperCase();
  const mismatch = mounted && isConnected && walletNetwork && sNetNorm !== wNetNorm;

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] z-40 bg-bg-base flex flex-col py-6 px-4 hidden md:flex">
      {/* Logo */}
      <div className="mb-8 px-2">
        <div className="mb-4">
          <Logo iconSize={28} textSize="text-xl" subTextSize="text-[9px]" />
        </div>
        
        {/* Network Badges & Troubleshooting */}
        <div className="flex flex-col gap-2 px-1 bg-bg-void p-3 rounded-lg border border-edge-neutral shadow-neopop-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-ink-tertiary font-ui-label">Site Network</span>
            <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${sNetNorm === "MAINNET" ? "bg-accent-glow text-accent" : "bg-bg-interactive text-ink-secondary"}`}>
              {sNetNorm}
            </span>
          </div>
          {mounted && isConnected && (
            <div className="flex items-center justify-between border-t border-edge-neutral pt-2 mt-0.5">
              <span className="text-[10px] uppercase tracking-wider text-ink-tertiary font-ui-label">Wallet Network</span>
              <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${wNetNorm === "MAINNET" ? "bg-accent-glow text-accent" : "bg-bg-interactive text-ink-secondary"}`}>
                {wNetNorm}
              </span>
            </div>
          )}
          {mismatch && (
            <div className="flex flex-col gap-2 mt-2 p-2 bg-status-disputed/10 border border-status-disputed/30 rounded text-status-disputed">
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p className="text-[10px] font-ui-label font-bold uppercase tracking-wider leading-tight">Network Mismatch</p>
              </div>
              <p className="text-[9px] font-mono-data opacity-90">Switch your wallet network to <b>{sNetNorm}</b> in Freighter settings to continue.</p>
            </div>
          )}
          {mounted && isConnected && sNetNorm === "TESTNET" && !mismatch && (
            <div className="mt-2 pt-2 border-t border-edge-neutral">
              <a 
                href="https://laboratory.stellar.org/#account-creator?network=test" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded font-ui-label text-[10px] font-bold uppercase tracking-widest transition-colors"
              >
                Get Testnet Funds
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive
                  ? "text-ink-primary font-bold"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-bg-interactive"
              }`}
            >
              {isActive && (
                <m.div
                  layoutId="sidebar-bg"
                  className="absolute inset-0 bg-accent-glow border-l-2 border-accent rounded-r-lg z-0"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 ${isActive ? "text-accent" : ""}`} />
              <span className="font-ui-label text-ui-label relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-6 divider space-y-1">
        <Link
          href="/dashboard/contracts/new"
          className="w-full neopop-button-teal font-ui-label text-ui-label font-bold py-3 rounded-lg mb-6 flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Contract
        </Link>
        <button
          onClick={() => setRampModalOpen(true)}
          className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 relative text-ink-secondary hover:bg-bg-interactive hover:text-ink-primary text-left"
        >
          <HelpCircle className="w-5 h-5 relative z-10" />
          <span className="font-ui-label text-ui-label relative z-10">How Fiat Works</span>
        </button>
        <Link
          href="/help"
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 relative ${
            pathname === "/help" 
              ? "text-ink-primary font-bold" 
              : "text-ink-secondary hover:bg-bg-interactive hover:text-ink-primary"
          }`}
        >
          {pathname === "/help" && (
            <m.div
              layoutId="sidebar-bg"
              className="absolute inset-0 bg-accent-glow border-l-2 border-accent rounded-r-lg z-0"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <HelpCircle className={`w-5 h-5 relative z-10 ${pathname === "/help" ? "text-accent" : ""}`} />
          <span className="font-ui-label text-ui-label relative z-10">Help Center</span>
        </Link>
        <Link
          href="/dashboard/account"
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 relative ${
            pathname?.startsWith("/dashboard/account") 
              ? "text-ink-primary font-bold" 
              : "text-ink-secondary hover:bg-bg-interactive hover:text-ink-primary"
          }`}
        >
          {pathname?.startsWith("/dashboard/account") && (
            <m.div
              layoutId="sidebar-bg"
              className="absolute inset-0 bg-accent-glow border-l-2 border-accent rounded-r-lg z-0"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <UserCog className={`w-5 h-5 relative z-10 ${pathname?.startsWith("/dashboard/account") ? "text-accent" : ""}`} />
          <span className="font-ui-label text-ui-label relative z-10">Account</span>
        </Link>
      </div>

      <RampExplanationModal 
        isOpen={isRampModalOpen} 
        onClose={() => setRampModalOpen(false)} 
      />
    </aside>
  );
}
