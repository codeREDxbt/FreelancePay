"use client";

import { useState, useEffect } from "react";
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
  const wNet = walletNetwork?.toUpperCase() || "UNKNOWN";
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize both for comparison
  const sNetNorm = siteNetwork === "PUBLIC" ? "MAINNET" : siteNetwork.toUpperCase();
  const wNetNorm = wNet === "PUBLIC" ? "MAINNET" : wNet.toUpperCase();
  const mismatch = mounted && isConnected && walletNetwork && sNetNorm !== wNetNorm;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-surface-container-low border-r border-outline-variant flex flex-col py-6 px-4 hidden md:flex">
      {/* Logo */}
      <div className="mb-8 px-2">
        <div className="mb-4">
          <Logo iconSize={32} textSize="text-2xl" subTextSize="text-[9px]" />
        </div>
        
        {/* Network Badges */}
        <div className="flex flex-col gap-1.5 px-1 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-ui-label">Site Network</span>
            <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${sNetNorm === "MAINNET" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
              {sNetNorm}
            </span>
          </div>
          {mounted && isConnected && (
            <div className="flex items-center justify-between border-t border-outline-variant/30 pt-1.5 mt-0.5">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-ui-label">Wallet Network</span>
              <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${wNetNorm === "MAINNET" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                {wNetNorm}
              </span>
            </div>
          )}
          {mismatch && (
            <div className="flex items-start gap-1.5 mt-1.5 p-1.5 bg-error/10 border border-error/20 rounded text-error">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
              <p className="text-[9px] font-ui-label leading-tight">Mismatch! Please switch your wallet to {sNetNorm} to interact.</p>
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
                  ? "text-primary font-semibold"
                  : "text-on-surface-variant font-medium hover:text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              {isActive && (
                <m.div
                  layoutId="sidebar-bg"
                  className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent border-l-[3px] border-primary rounded-r-lg z-0"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-150 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
              <span className="font-ui-label text-ui-label relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto pt-6 border-t border-outline-variant space-y-1">
        <Link
          href="/dashboard/contracts/new"
          className="w-full bg-primary text-on-primary font-ui-label text-ui-label font-bold py-3 rounded-lg mb-6 flex items-center justify-center gap-2 btn-primary-inset hover:bg-primary-hover active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          New Contract
        </Link>
        <Link
          href="/help"
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 relative ${
            pathname === "/help" 
              ? "text-primary font-semibold" 
              : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
          }`}
        >
          {pathname === "/help" && (
            <m.div
              layoutId="sidebar-bg"
              className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent border-l-[3px] border-primary rounded-r-lg z-0"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <HelpCircle className={`w-5 h-5 relative z-10 transition-transform duration-150 ${pathname === "/help" ? "scale-110" : "group-hover:scale-105"}`} />
          <span className="font-ui-label text-ui-label relative z-10">Help Center</span>
        </Link>
        <Link
          href="/dashboard/account"
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-200 relative ${
            pathname?.startsWith("/dashboard/account") 
              ? "text-primary font-semibold" 
              : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
          }`}
        >
          {pathname?.startsWith("/dashboard/account") && (
            <m.div
              layoutId="sidebar-bg"
              className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent border-l-[3px] border-primary rounded-r-lg z-0"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <UserCog className={`w-5 h-5 relative z-10 transition-transform duration-150 ${pathname?.startsWith("/dashboard/account") ? "scale-110" : "group-hover:scale-105"}`} />
          <span className="font-ui-label text-ui-label relative z-10">Account</span>
        </Link>
      </div>
    </aside>
  );
}

