import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="w-full py-16 bg-surface-container border-t border-outline-variant">
      <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Logo iconSize={28} textSize="text-lg" subTextSize="text-[8px]" />
            </div>
            <p className="font-ui-label text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Building the financial infrastructure for the decentralized workforce. Secure, programmable, and fast.
            </p>
            {/* Network badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-md w-fit">
              <span className="font-ui-label text-xs text-on-surface-variant font-medium">Powered by Stellar</span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2 md:justify-items-end">
            <div className="flex flex-col gap-3">
              <p className="font-mono-data text-[9px] uppercase text-on-surface-variant tracking-widest mb-1">Product</p>
              <Link href="/features" className="font-ui-label text-sm text-on-surface-variant hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all">Features</Link>
              <Link href="/network" className="font-ui-label text-sm text-on-surface-variant hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all">Network</Link>
              <Link href="/pricing" className="font-ui-label text-sm text-on-surface-variant hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all">Pricing</Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono-data text-[9px] uppercase text-on-surface-variant tracking-widest mb-1">Resources</p>
              {["Help Centre", "Documentation", "Terms of Service", "Privacy Policy"].map((link) => (
                <Link key={link} className="font-ui-label text-sm text-on-surface-variant hover:text-primary hover:underline decoration-primary underline-offset-4 transition-all" href={link === "Help Centre" ? "/help" : "/"}>
                  {link}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono-data text-[9px] uppercase text-on-surface-variant tracking-widest mb-1">Security</p>
              <div className="flex flex-col gap-2">
                {[
                  { icon: "shield", label: "Audit Passed v2.1" },
                  { icon: "lock", label: "Non-custodial" },
                  { icon: "verified", label: "Open Source" },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[14px]">{badge.icon}</span>
                    {badge.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-outline-variant/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-mono-data text-[10px] text-on-surface-variant opacity-50 uppercase tracking-widest flex flex-col sm:flex-row gap-2 sm:gap-4 text-center sm:text-left items-center">
            <span>&copy; 2026 FreelancePay &middot; Built on Stellar</span>
            <span className="hidden sm:inline">|</span>
            <span>
              Designed & Built By{" "}
              <a href="https://www.coderedxbt.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Vinayak (codeRED)
              </a>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {["terminal", "code", "public"].map((icon) => (
              <button type="button" key={icon} className="text-on-surface-variant hover:text-primary transition-colors p-1">
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
