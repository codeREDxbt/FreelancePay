import type { Metadata } from "next";
import { Geist, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";
import { InviteReceiver } from "@/components/InviteReceiver";
import { FeedbackModal } from "@/components/FeedbackModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreelancePay | Trustless Milestone Escrow on Stellar",
  description:
    "Secure your work and payments with programmable trust on Stellar. Milestone-based escrow for the global workforce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Removed Material Symbols */}
        {/* Blocking script — prevents flash of wrong theme before React hydrates */}
        <script
          id="theme-initializer"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${outfit.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <PostHogProvider>
          <MotionProvider>
            <Toaster richColors position="top-right" />
            {children}
            <FeedbackWidget />
            <InviteReceiver />
            <FeedbackModal />
            <Analytics />
            <SpeedInsights />
          </MotionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
