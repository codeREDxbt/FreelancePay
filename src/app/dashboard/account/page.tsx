"use client";

import React, { useState, useEffect } from "react";
import { m } from 'framer-motion';
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User, ShieldCheck, Bell, Globe, Moon, LogOut, CheckCircle2, Edit3
} from "lucide-react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/components/providers/error-boundary";

const ProfileModal = dynamic(
  () => import("@/components/ProfileModal").then((mod) => mod.ProfileModal),
  { ssr: false }
);

export default function AccountPage() {
  const { publicKey, disconnectWallet } = useWallet();
  const { profile, updateProfile } = useProfile(publicKey);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [notifications, setNotifications] = useState(true);

  // Load preferences
  useEffect(() => {
    if (typeof window !== "undefined" && publicKey) {
      const savedPrefs = localStorage.getItem(`fp_prefs_${publicKey}`);
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.notifications !== undefined) setNotifications(parsed.notifications);
        } catch (e) {
          console.error("Failed to parse preferences", e);
        }
      }
    }
  }, [publicKey]);

  const handleDisconnect = () => {
    disconnectWallet();
    router.push("/auth");
  };

  return (
    <ErrorBoundary>
      <div className="p-8 lg:p-12 max-w-7xl mx-auto bg-bg-void min-h-screen text-ink-primary">
        
        <div className="mb-12">
          <h1 className="font-headline-lg text-4xl lg:text-5xl font-bold tracking-tight mb-4">Settings</h1>
          <p className="text-ink-secondary font-ui-label text-lg">Manage your profile, preferences, and security settings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Profile & Wallet */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* Profile Card */}
            <div className="bg-bg-base border border-edge-neutral shadow-neopop p-8 relative group">
              <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-edge-neutral bg-bg-void" />
              
              <div className="w-24 h-24 border-2 border-edge-neutral bg-bg-void flex items-center justify-center text-ink-primary relative mb-6">
                {profile?.pfpUrl ? (
                  <Image 
                    src={profile.pfpUrl} 
                    alt="Avatar" 
                    fill
                    className="object-cover" 
                    sizes="96px"
                  />
                ) : (
                  <User className="w-10 h-10" />
                )}
                <button type="button" 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="absolute inset-0 bg-bg-void/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Edit3 className="w-6 h-6 text-accent" />
                </button>
              </div>
              
              <h2 className="font-headline-lg text-3xl font-bold text-ink-primary tracking-tight">
                {profile?.username || "Unnamed"}
              </h2>
              <div className="mt-4">
                <p className="font-mono-data text-xs text-ink-tertiary uppercase tracking-widest mb-1">Connected Wallet</p>
                <p className="font-mono-data text-sm font-bold text-ink-secondary truncate">
                  {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-6)}` : "None"}
                </p>
              </div>
              
              <button type="button" 
                onClick={() => setIsProfileModalOpen(true)}
                className="mt-8 w-full py-4 border-2 border-edge-neutral font-ui-label text-sm font-bold uppercase tracking-widest hover:border-ink-secondary transition-colors"
              >
                Edit Profile
              </button>
            </div>

            {/* Security Status */}
            <div className="bg-bg-base border border-edge-neutral shadow-neopop p-8">
              <h3 className="font-ui-label font-bold text-sm text-ink-primary uppercase tracking-widest flex items-center gap-3 mb-6 pb-2 border-b border-dashed border-ink-tertiary">
                <ShieldCheck className="w-5 h-5 text-accent" />
                Security Status
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="font-mono-data text-sm text-ink-secondary uppercase tracking-widest">Wallet Auth</span>
                <span className="flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 px-3 py-1 border border-accent/20">
                  <CheckCircle2 className="w-4 h-4" /> SECURE
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Preferences */}
          <div className="lg:col-span-8 space-y-12">
            
            <div className="bg-bg-base border border-edge-neutral shadow-neopop p-8 lg:p-12">
              <h3 className="font-mono-data text-ink-primary font-bold uppercase tracking-widest text-sm mb-8 pb-2 border-b-2 border-edge-neutral">General Preferences</h3>
              
              <div className="space-y-10">
                {/* Currency */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 border-2 border-edge-neutral flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-ink-secondary" />
                    </div>
                    <div>
                      <h4 className="font-ui-label font-bold text-ink-primary uppercase tracking-widest text-sm">Display Currency</h4>
                      <p className="text-xs font-mono-data text-ink-tertiary mt-1">Preferred fiat for estimates.</p>
                    </div>
                  </div>
                  <select 
                    value={currency}
                    onChange={(e) => {
                      const newCurrency = e.target.value;
                      setCurrency(newCurrency);
                      if (typeof window !== "undefined" && publicKey) {
                        localStorage.setItem(`fp_prefs_${publicKey}`, JSON.stringify({ currency: newCurrency, notifications }));
                      }
                    }}
                    className="bg-bg-void border-2 border-edge-neutral px-4 py-3 text-sm font-mono-data font-bold focus:outline-none focus:border-accent transition-colors cursor-pointer text-ink-primary"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (&euro;)</option>
                    <option value="GBP">GBP (&pound;)</option>
                    <option value="XLM">XLM (Native)</option>
                    <option value="USDC">USDC (Stable)</option>
                  </select>
                </div>

                {/* Notifications */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 border-2 border-edge-neutral flex items-center justify-center shrink-0">
                      <Bell className="w-6 h-6 text-ink-secondary" />
                    </div>
                    <div>
                      <h4 className="font-ui-label font-bold text-ink-primary uppercase tracking-widest text-sm">Notifications</h4>
                      <p className="text-xs font-mono-data text-ink-tertiary mt-1">Milestones and payments updates.</p>
                    </div>
                  </div>
                  <button type="button" 
                    aria-label="Toggle Email Notifications"
                    onClick={() => {
                      const newNotifications = !notifications;
                      setNotifications(newNotifications);
                      if (typeof window !== "undefined" && publicKey) {
                        localStorage.setItem(`fp_prefs_${publicKey}`, JSON.stringify({ currency, notifications: newNotifications }));
                      }
                    }}
                    className={`relative inline-flex h-8 w-16 items-center border-2 transition-colors rounded-none ${notifications ? 'border-accent bg-accent/10' : 'border-edge-neutral bg-bg-void'}`}
                  >
                    <span className={`inline-block h-6 w-6 transform bg-ink-primary transition-transform ${notifications ? 'translate-x-8 bg-accent' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                {/* Theme (Read Only) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex gap-6 items-center">
                    <div className="w-12 h-12 border-2 border-edge-neutral flex items-center justify-center shrink-0">
                      <Moon className="w-6 h-6 text-ink-secondary" />
                    </div>
                    <div>
                      <h4 className="font-ui-label font-bold text-ink-primary uppercase tracking-widest text-sm">Dark Mode</h4>
                      <p className="text-xs font-mono-data text-ink-tertiary mt-1">Toggle interface theme.</p>
                    </div>
                  </div>
                  <button type="button" aria-label="Toggle Dark Mode" onClick={toggleDarkMode} className={`relative inline-flex h-8 w-16 items-center border-2 transition-colors rounded-none ${isDarkMode ? 'border-ink-secondary bg-ink-secondary/10' : 'border-edge-neutral bg-bg-void'}`}>
                    <span className={`inline-block h-6 w-6 transform bg-ink-primary transition-transform ${isDarkMode ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-status-disputed/5 border-2 border-status-disputed shadow-neopop p-8">
              <h3 className="font-mono-data text-status-disputed font-bold uppercase tracking-widest text-sm mb-6 pb-2 border-b border-status-disputed/30">Danger Zone</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h4 className="font-ui-label font-bold text-ink-primary uppercase tracking-widest text-sm mb-1">Disconnect Wallet</h4>
                  <p className="font-mono-data text-xs text-ink-secondary">Remove current active session and wipe local data.</p>
                </div>
                <button type="button" 
                  onClick={handleDisconnect}
                  className="px-8 py-4 bg-status-disputed text-black font-ui-label font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-3 shrink-0 hover:bg-opacity-90"
                >
                  <LogOut className="w-5 h-5" />
                  Disconnect
                </button>
              </div>
            </div>

          </div>
        </div>

        <ProfileModal
          key={isProfileModalOpen ? "open" : "closed"}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          initialUsername={profile?.username || ""}
          initialPfp={profile?.pfpUrl || ""}
          onSave={(username, pfpUrl) => updateProfile({ username, pfpUrl })}
        />
      </div>
    </ErrorBoundary>
  );
}
