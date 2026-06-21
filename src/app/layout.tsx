import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Inter, Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { FeedbackWidget } from "@/components/ui/FeedbackWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});



const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
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
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
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
        className={`${geistSans.variable} ${inter.variable} ${publicSans.variable} ${jetBrainsMono.variable} antialiased font-body-base bg-background text-on-background`}
      >
        <PostHogProvider>
          <MotionProvider>
            <Toaster richColors position="top-right" />
            {children}
            <FeedbackWidget />
            <Analytics />
            <SpeedInsights />
          </MotionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
