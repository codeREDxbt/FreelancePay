"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/useWallet";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Redirect } from "@/components/Redirect";
import { Loader2, ShieldCheck, Zap, Globe } from "lucide-react";
import { m } from 'framer-motion';
import { Logo } from "@/components/ui/Logo";

const CustomWalletModal = dynamic(
  () => import("@/components/CustomWalletModal").then((mod) => mod.CustomWalletModal),
  { ssr: false }
);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
});

const features = [
  { icon: ShieldCheck, label: "Trustless Escrow", desc: "Soroban smart contracts hold funds until milestones are verified." },
  { icon: Zap, label: "Instant Settlement", desc: "0.00001 XLM fees. Payouts clear in under 5 seconds globally." },
  { icon: Globe, label: "180+ Countries", desc: "On/off ramps in every major market via Stellar's USDC liquidity." },
];

export default function AuthPage() {
  const router = useRouter();
  const { isConnected, isLoading, error, isModalOpen, openModal, closeModal, connectWallet, supportedWallets } = useWallet();

  if (isConnected) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background font-body-base text-on-surface overflow-hidden">
      {/* Background radial glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(5,105,109,0.13) 0%, transparent 70%)",
        }}
      />

      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#05696d 1px, transparent 1px), linear-gradient(90deg, #05696d 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* ── Left: Branding panel ─────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-inverse-surface text-inverse-on-surface">
          <m.div {...fadeUp(0)}>
            <Logo iconSize={36} textSize="text-3xl" subTextSize="text-[10px]" />
          </m.div>

          <div className="my-auto py-16">
            <m.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-md mb-8">
              <span className="font-ui-label text-xs font-semibold text-on-surface-variant">Stellar Network</span>
            </m.div>
            <m.h2 {...fadeUp(0.2)} className="text-[42px] leading-[1.1] font-headline-lg mb-6">
              Financial infrastructure for the{" "}
              <span className="text-primary">decentralized</span> workforce.
            </m.h2>
            <m.p {...fadeUp(0.3)} className="text-outline-variant text-lg leading-relaxed max-w-md">
              Programmable escrow on Stellar using trustless, code-enforced agreements.
            </m.p>

            <div className="mt-12 space-y-6">
              {features.map((f, i) => (
                <m.div key={f.label} {...fadeUp(0.35 + i * 0.08)} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-ui-label font-bold text-inverse-on-surface text-sm">{f.label}</p>
                    <p className="text-outline-variant text-sm mt-0.5">{f.desc}</p>
                  </div>
                </m.div>
              ))}
            </div>
          </div>

          <m.p {...fadeUp(0.6)} className="font-mono-data text-[10px] text-outline uppercase tracking-widest">
            &copy; 2025 FreelancePay &middot; Built on Stellar
          </m.p>
        </div>

        {/* ── Right: Auth panel ────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 lg:py-0">
          {/* Mobile logo */}
          <m.div {...fadeUp(0)} className="mb-12 lg:hidden">
            <Logo iconSize={36} textSize="text-3xl" subTextSize="text-[10px]" />
          </m.div>

          <div className="w-full max-w-sm">
            <m.div {...fadeUp(0.1)}>
              <h1 className="font-headline-lg text-[32px] text-on-surface mb-2 text-center lg:text-left">
                Connect your wallet
              </h1>
              <p className="text-on-surface-variant text-sm mb-10 text-center lg:text-left leading-relaxed">
                Access your escrow contracts and payments securely via the Stellar network.
              </p>
            </m.div>

            <m.div {...fadeUp(0.2)} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-error-container border border-error/30 text-on-error-container text-sm">
                  {error}
                </div>
              )}

              <button type="button"
                id="connect-wallet-btn"
                onClick={openModal}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary text-on-primary rounded-xl font-ui-label text-base font-bold btn-primary-inset hover:bg-primary-hover active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
                    Connect Stellar Wallet
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-[1px] bg-outline-variant" />
                <span className="font-mono-data text-[10px] text-outline uppercase tracking-widest">Secure &middot; Non-custodial</span>
                <div className="flex-1 h-[1px] bg-outline-variant" />
              </div>

              <p className="text-center text-xs text-outline leading-relaxed">
                FreelancePay never holds your private keys.{" "}
                <Link href="/" className="text-primary hover:underline underline-offset-2 transition-colors">
                  Back to home
                </Link>
              </p>
            </m.div>

            {/* Trust badges */}
            <m.div {...fadeUp(0.35)} className="mt-10 grid grid-cols-3 gap-3">
              {[
                { label: "Non-custodial", icon: "lock" },
                { label: "Open-source", icon: "code" },
                { label: "Audited", icon: "verified" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/50">
                  <span className="material-symbols-outlined text-primary text-[20px]">{b.icon}</span>
                  <span className="font-mono-data text-[9px] uppercase tracking-wider text-on-surface-variant text-center">{b.label}</span>
                </div>
              ))}
            </m.div>
          </div>
        </div>
      </div>

      <CustomWalletModal
        isOpen={isModalOpen}
        onClose={closeModal}
        wallets={supportedWallets}
        onSelect={connectWallet}
      />
    </div>
  );
}

