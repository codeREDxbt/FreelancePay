"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from 'framer-motion';
import { Plus, HelpCircle, UserCog, AlertTriangle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Logo } from "@/components/ui/Logo";

import { navItems } from "./navItems";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
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
        
        {/* Network Badges */}
        <div className="flex flex-col gap-1.5 px-1 bg-bg-void p-2 rounded-lg border border-edge-neutral">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-ink-tertiary font-ui-label">Site Network</span>
            <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${sNetNorm === "MAINNET" ? "bg-accent-glow text-accent" : "bg-bg-interactive text-ink-secondary"}`}>
              {sNetNorm}
            </span>
          </div>
          {mounted && isConnected && (
            <div className="flex items-center justify-between border-t border-edge-neutral pt-1.5 mt-0.5">
              <span className="text-[10px] uppercase tracking-wider text-ink-tertiary font-ui-label">Wallet Network</span>
              <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${wNetNorm === "MAINNET" ? "bg-accent-glow text-accent" : "bg-bg-interactive text-ink-secondary"}`}>
                {wNetNorm}
              </span>
            </div>
          )}
          {mismatch && (
            <div className="flex items-start gap-1.5 mt-1.5 p-1.5 bg-status-disputed/10 border border-status-disputed/20 rounded text-status-disputed">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
              <p className="text-[9px] font-ui-label leading-tight">Mismatch! Switch your wallet to {sNetNorm}.</p>
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
    </aside>
  );
}
