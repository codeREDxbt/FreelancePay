"use client";

import React, { useState, useEffect } from "react";
import { m } from 'framer-motion';
import { useWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User, ShieldCheck, Bell, Globe, Moon, LogOut, CheckCircle2, AlertCircle, Edit3
} from "lucide-react";
import dynamic from "next/dynamic";

const ProfileModal = dynamic(
  () => import("@/components/ProfileModal").then((mod) => mod.ProfileModal),
  { ssr: false }
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function AccountPage() {
  const { publicKey, disconnectWallet } = useWallet();
  const { profile, updateProfile } = useProfile(publicKey);
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
          // eslint-disable-next-line react-hooks/set-state-in-effect
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
    <div className="max-w-5xl mx-auto px-4 md:px-margin-desktop pt-24 pb-12 space-y-8">
      
      <m.div initial="hidden" animate="visible" variants={fadeUp} className="space-y-2">
        <h1 className="font-headline-lg text-3xl md:text-4xl tracking-tight text-on-surface">Account Settings</h1>
        <p className="font-ui-label text-on-surface-variant text-base">
          Manage your profile, preferences, and security settings.
        </p>
      </m.div>

      <m.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Left Column: Profile & Wallet */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Profile Card */}
          <m.div variants={fadeUp} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative w-24 h-24 rounded-full bg-secondary-fixed flex items-center justify-center text-primary border-4 border-surface-container-lowest shadow-md overflow-hidden mb-4 z-10">
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
                className="absolute inset-0 bg-inverse-surface/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
              >
                <Edit3 className="w-6 h-6 text-inverse-on-surface" />
              </button>
            </div>
            
            <h2 className="font-headline-lg text-xl text-on-surface z-10">
              {profile?.username || "Unnamed User"}
            </h2>
            <p className="font-mono-data text-xs text-on-surface-variant mt-2 z-10 bg-surface-container-low px-2 py-1 rounded-md">
              {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-6)}` : "Not connected"}
            </p>
            
            <button type="button" 
              onClick={() => setIsProfileModalOpen(true)}
              className="mt-6 w-full py-2.5 px-4 rounded-lg border border-outline-variant font-ui-label text-sm font-semibold hover:bg-surface-container-high transition-colors z-10"
            >
              Edit Profile
            </button>
          </m.div>

          {/* Security Status */}
          <m.div variants={fadeUp} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-ui-label font-semibold text-sm text-on-surface uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Security Status
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-ui-label text-sm text-on-surface-variant">Wallet</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Secure
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-ui-label text-sm text-on-surface-variant">Identity</span>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" /> Unverified
                </span>
              </div>
            </div>
            <button type="button" className="w-full text-left font-ui-label text-sm text-primary hover:text-primary-hover transition-colors font-medium">
              Start Verification &rarr;
            </button>
          </m.div>

        </div>

        {/* Right Column: Preferences */}
        <div className="md:col-span-2 space-y-6">
          
          <m.div variants={fadeUp} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
            <h3 className="font-headline-lg text-lg text-on-surface mb-6 border-b border-outline-variant/50 pb-4">General Preferences</h3>
            
            <div className="space-y-6">
              {/* Currency */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  <div>
                    <h4 className="font-ui-label font-semibold text-on-surface">Display Currency</h4>
                    <p className="text-sm text-on-surface-variant hidden sm:block">Select your preferred fiat currency for estimates.</p>
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
                  className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-sm font-ui-label font-medium focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (&euro;)</option>
                  <option value="GBP">GBP (&pound;)</option>
                  <option value="XLM">XLM (Native)</option>
                  <option value="USDC">USDC (Stablecoin)</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  <div>
                    <h4 className="font-ui-label font-semibold text-on-surface">Email Notifications</h4>
                    <p className="text-sm text-on-surface-variant hidden sm:block">Receive updates about milestones and payments.</p>
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-outline-variant'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-surface-container-lowest transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {/* Theme (Read Only) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-60">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                    <Moon className="w-5 h-5 text-on-surface-variant" />
                  </div>
                  <div>
                    <h4 className="font-ui-label font-semibold text-on-surface">Dark Mode</h4>
                    <p className="text-sm text-on-surface-variant hidden sm:block">Coming soon to FreelancePay.</p>
                  </div>
                </div>
                <button type="button" aria-label="Toggle Dark Mode" disabled className="relative inline-flex h-6 w-11 items-center rounded-full bg-outline-variant cursor-not-allowed">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-surface-container-lowest translate-x-1" />
                </button>
              </div>
            </div>
          </m.div>

          {/* Danger Zone */}
          <m.div variants={fadeUp} className="bg-error-container/20 border border-error/30 rounded-2xl p-6 shadow-sm">
            <h3 className="font-headline-lg text-lg text-error mb-4">Danger Zone</h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-ui-label font-semibold text-on-surface">Disconnect Wallet</h4>
                <p className="text-sm text-on-surface-variant">Remove current active session and local storage data.</p>
              </div>
              <button type="button" 
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-6 py-2.5 bg-error text-inverse-on-surface rounded-lg font-ui-label font-semibold hover:bg-[#B91C1C] transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </m.div>

        </div>
      </m.div>

      <ProfileModal
        key={isProfileModalOpen ? "open" : "closed"}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialUsername={profile?.username || ""}
        initialPfp={profile?.pfpUrl || ""}
        onSave={(username, pfpUrl) => updateProfile({ username, pfpUrl })}
      />
    </div>
  );
}
