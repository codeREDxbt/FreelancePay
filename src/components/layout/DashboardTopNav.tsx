"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from 'framer-motion';
import { Bell, Search, Sun, Moon, User, ChevronDown, Settings, LogOut, AlertTriangle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { Logo } from "@/components/ui/Logo";
import dynamic from "next/dynamic";

const ProfileModal = dynamic(
  () => import("@/components/ProfileModal").then((mod) => mod.ProfileModal),
  { ssr: false }
);

export function DashboardTopNav() {
  const router = useRouter();
  const { publicKey, disconnectWallet, isConnected, walletNetwork } = useWallet();
  const { profile, updateProfile } = useProfile(publicKey);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return stored === "dark" || (!stored && prefersDark);
    }
    return false;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const siteNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET";
  const wNet = walletNetwork?.toUpperCase() || "UNKNOWN";
  
  // Normalize both for comparison
  const sNetNorm = siteNetwork === "PUBLIC" ? "MAINNET" : siteNetwork.toUpperCase();
  const wNetNorm = wNet === "PUBLIC" ? "MAINNET" : wNet.toUpperCase();
  const mismatch = isConnected && walletNetwork && sNetNorm !== wNetNorm;

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 md:left-64 right-0 z-30 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-4 md:px-margin-desktop">
        {/* Mobile Logo & Search */}
        <div className="flex items-center gap-4 flex-1">
          <div className="md:hidden flex items-center gap-2 mr-2">
            <Logo iconSize={28} textSize="text-lg" subTextSize="text-[8px]" hideTextOnMobile={true} />
          </div>
          {mismatch && (
            <div className="md:hidden flex items-center gap-1.5 px-2 py-1 bg-error/10 border border-error/20 rounded text-error text-[10px] font-ui-label">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>Mismatch: Use {sNetNorm}</span>
            </div>
          )}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3 top-2.5 text-on-surface-variant w-5 h-5" />
            <input
              aria-label="Search"
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg pl-10 pr-4 py-2 font-ui-label text-ui-label focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-outline"
              placeholder="Search contracts, transactions..."
              type="text"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div ref={notifDropdownRef} className="relative">
            <button type="button" 
              onClick={() => setIsNotificationsOpen((v) => !v)}
              aria-label="Notifications" 
              className={`p-2 transition-all rounded-full relative group ${isNotificationsOpen ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest animate-pulse" />
            </button>
            <AnimatePresence>
              {isNotificationsOpen && (
                <m.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
                    <p className="font-ui-label text-sm font-semibold text-on-surface">
                      Notifications
                    </p>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                      <Bell className="w-5 h-5 text-on-surface-variant opacity-50" />
                    </div>
                    <div>
                      <p className="font-ui-label text-sm text-on-surface font-semibold mb-1">You&apos;re all caught up!</p>
                      <p className="font-ui-label text-xs text-on-surface-variant leading-relaxed">We&apos;ll notify you here when contract milestones are updated or funded.</p>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <button type="button" 
            aria-label="Toggle dark mode"
            onClick={toggleDarkMode}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all rounded-full relative overflow-hidden flex items-center justify-center w-9 h-9"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isDarkMode ? (
                <m.div
                  key="moon"
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  <Moon className="w-5 h-5 text-primary" />
                </m.div>
              ) : (
                <m.div
                  key="sun"
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  <Sun className="w-5 h-5 text-[#F59E0B]" />
                </m.div>
              )}
            </AnimatePresence>
          </button>

          <div className="h-8 w-[1px] bg-outline-variant mx-1" />

          {/* Profile dropdown */}
          <div ref={dropdownRef} className="relative">
            <button type="button"
              onClick={() => setIsProfileDropdownOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-surface-container-high transition-all border border-transparent hover:border-outline-variant focus:outline-none"
            >
              <div className="w-7 h-7 rounded-full bg-secondary-fixed flex items-center justify-center text-primary overflow-hidden border border-outline-variant shrink-0 relative">
                {profile?.pfpUrl ? (
                  <Image 
                    src={profile.pfpUrl} 
                    alt="PFP" 
                    fill
                    className="object-cover" 
                    sizes="28px"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                {mismatch && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border border-surface-container-lowest" />
                )}
              </div>
              <span className="font-ui-label text-sm text-on-surface font-semibold hidden lg:block">
                {profile?.username
                  ? profile.username
                  : publicKey ? `${publicKey.slice(0, 4)}&hellip;${publicKey.slice(-4)}` : "Connected"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-on-surface-variant hidden lg:block transition-transform duration-200 ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {isProfileDropdownOpen && (
                <m.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low">
                    <p className="font-ui-label text-sm font-semibold text-on-surface truncate">
                      {profile?.username || "Wallet Connected"}
                    </p>
                    <p className="font-mono-data text-[10px] text-on-surface-variant mt-0.5 truncate">
                      {publicKey ? `${publicKey.slice(0, 8)}&hellip;${publicKey.slice(-6)}` : ""}
                    </p>
                  </div>

                  {/* Network Details in Dropdown */}
                  <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-lowest">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-ui-label">Site Network</span>
                      <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${sNetNorm === "MAINNET" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                        {sNetNorm}
                      </span>
                    </div>
                    {isConnected && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-ui-label">Wallet Network</span>
                        <span className={`text-[9px] font-mono-data font-bold px-1.5 py-0.5 rounded ${wNetNorm === "MAINNET" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                          {wNetNorm}
                        </span>
                      </div>
                    )}
                    {mismatch && (
                      <div className="flex items-start gap-1.5 mt-2 p-1.5 bg-error/10 border border-error/20 rounded text-error">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                        <p className="text-[9px] font-ui-label leading-tight">Network mismatch! Please switch your wallet to {sNetNorm}.</p>
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 space-y-0.5">
                    <button type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-on-surface-variant shrink-0" />
                      <span className="font-ui-label">Edit Profile</span>
                    </button>
                    <button type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        router.push("/dashboard/account");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left"
                    >
                      <Settings className="w-4 h-4 text-on-surface-variant shrink-0" />
                      <span className="font-ui-label">Settings</span>
                    </button>
                  </div>

                  {/* Disconnect */}
                  <div className="p-1.5 border-t border-outline-variant">
                    <button type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        disconnectWallet();
                        router.push("/auth");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-error-container transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span className="font-ui-label font-medium">Disconnect Wallet</span>
                    </button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <ProfileModal
        key={isProfileModalOpen ? "open" : "closed"}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialUsername={profile?.username || ""}
        initialPfp={profile?.pfpUrl || ""}
        onSave={(username, pfpUrl) => updateProfile({ username, pfpUrl })}
      />
    </>
  );
}

