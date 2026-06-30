"use client";

import { m, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Code2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { LandingNav } from "@/components/layout/LandingNav";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (clientY / innerHeight - 0.5) * 2; // -1 to 1
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const xOffset = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const yOffset = useTransform(smoothMouseY, [-1, 1], [-20, 20]);
  const xOffsetReverse = useTransform(smoothMouseX, [-1, 1], [30, -30]);
  const yOffsetReverse = useTransform(smoothMouseY, [-1, 1], [30, -30]);
  return (
    <div className="min-h-screen bg-bg-void flex flex-col relative overflow-hidden">
      {/* 3% SVG Noise Texture */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <LandingNav />

      <main className="flex-1 flex flex-col relative z-10">
        {/* HERO SECTION */}
        <section className="w-full min-h-[90vh] flex items-center justify-center relative overflow-hidden px-margin-mobile md:px-margin-desktop py-20">
          
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(var(--color-edge-neutral) 1px, transparent 1px), linear-gradient(90deg, var(--color-edge-neutral) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* Interactive Floating Shapes */}
          <m.div style={{ x: xOffset, y: yOffset }} className="absolute top-[15%] left-[5%] md:left-[15%] z-0 pointer-events-none opacity-50 hidden md:block">
            <div className="w-24 h-24 border-[4px] border-accent rotate-12" />
          </m.div>
          <m.div style={{ x: xOffsetReverse, y: yOffsetReverse }} className="absolute bottom-[20%] right-[10%] z-0 pointer-events-none opacity-50 hidden md:block">
            <div className="w-32 h-32 rounded-full border-[4px] border-ink-secondary border-dashed -rotate-12" />
          </m.div>

          <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
            {/* Left: Brutalist Typography */}
            <div className="w-full md:w-[60%] space-y-10 relative">
              <m.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <h1 className="text-[60px] md:text-[100px] leading-[0.85] font-extrabold tracking-tighter font-headline-lg uppercase relative z-10 text-ink-primary">
                  SHIP CODE.<br/>
                  <span className="text-transparent bg-clip-text" style={{ WebkitTextStroke: '3px var(--color-ink-primary)' }}>GET PAID.</span><br/>
                  <span className="text-accent bg-bg-void px-2 inline-block -rotate-2 border-4 border-accent shadow-[8px_8px_0px_var(--color-ink-primary)]">NO TRUST REQ.</span>
                </h1>
                {/* Glitch Shadow Effect behind text */}
                <m.div style={{ x: xOffsetReverse, y: yOffset }} className="absolute inset-0 text-[60px] md:text-[100px] leading-[0.85] font-extrabold tracking-tighter font-headline-lg uppercase text-accent opacity-30 z-0 pointer-events-none select-none blur-sm" aria-hidden="true">
                  SHIP CODE.<br/>GET PAID.<br/>NO TRUST REQ.
                </m.div>
              </m.div>

              <m.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-[20px] md:text-[24px] font-bold text-ink-secondary max-w-lg font-mono-data border-l-4 border-accent pl-6 py-2 uppercase tracking-widest leading-tight"
              >
                Cryptographically guaranteed escrows. Zero platform fees. You push, we pay.
              </m.p>

              <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                <Link href="/auth" className="group relative px-10 py-5 bg-accent text-bg-base font-headline-lg font-bold text-xl uppercase tracking-widest border-4 border-ink-primary hover:-translate-y-1 hover:-translate-x-1 shadow-[8px_8px_0px_var(--color-ink-primary)] hover:shadow-[12px_12px_0px_var(--color-ink-primary)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-[4px_4px_0px_var(--color-ink-primary)] flex items-center gap-3">
                  Deploy Contract <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link href="/docs" className="px-8 py-5 border-4 border-edge-neutral bg-bg-base font-headline-lg font-bold text-xl uppercase tracking-widest text-ink-primary hover:bg-ink-primary hover:text-bg-base hover:-translate-y-1 hover:-translate-x-1 shadow-[8px_8px_0px_var(--color-edge-neutral)] transition-all flex items-center gap-2">
                  <Code2 className="w-6 h-6" /> Specs
                </Link>
              </m.div>
            </div>
            
            {/* Right: Draggable Interactive Element */}
            <m.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              transition={{ duration: 1, type: "spring", bounce: 0.5, delay: 0.3 }}
              className="w-full md:w-[40%] flex justify-center md:justify-end relative z-20"
            >
              <m.div 
                drag
                dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                whileDrag={{ scale: 1.05, rotate: 0, cursor: "grabbing" }}
                whileHover={{ scale: 1.02 }}
                className="bg-bg-void border-[4px] border-ink-primary shadow-[16px_16px_0px_var(--color-accent)] w-full max-w-[380px] p-6 cursor-grab relative"
              >
                <div className="absolute -top-4 -right-4 bg-accent text-bg-base font-mono-data text-xs font-bold px-3 py-1 border-2 border-ink-primary rotate-12 shadow-[4px_4px_0px_var(--color-ink-primary)]">
                  DRAG ME
                </div>
                <div className="flex items-center justify-between border-b-[4px] border-edge-neutral pb-4 mb-4">
                  <span className="font-mono-data text-ink-primary text-sm font-bold uppercase tracking-widest">RECEIPT // ESCROW_FUNDED</span>
                  <div className="flex gap-2">
                    <div className="w-4 h-4 border-[2px] border-ink-primary bg-bg-base" />
                    <div className="w-4 h-4 border-[2px] border-ink-primary bg-accent" />
                  </div>
                </div>
                
                <div className="font-mono-data text-sm md:text-base">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between border-b-2 border-dashed border-edge-neutral/50 pb-2">
                      <span className="text-ink-tertiary">Tx Hash</span>
                      <span className="text-ink-primary font-bold text-accent">0x8f...39a1</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-dashed border-edge-neutral/50 pb-2">
                      <span className="text-ink-tertiary">Amount Locked</span>
                      <span className="text-ink-primary font-bold">5,000.00 USDC</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-dashed border-edge-neutral/50 pb-2">
                      <span className="text-ink-tertiary">Client (Sender)</span>
                      <span className="text-ink-primary">GBLX...92A1</span>
                    </div>
                    <div className="flex justify-between border-b-2 border-dashed border-edge-neutral/50 pb-2">
                      <span className="text-ink-tertiary">Dev (Recipient)</span>
                      <span className="text-ink-primary">GA2F...4P9Q</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end pt-2">
                    <div className="text-[11px] md:text-xs text-ink-tertiary leading-tight font-bold">
                      <div>NETWORK: STELLAR</div>
                      <div>CONTRACT: SOROBAN_V2</div>
                      <div className="text-accent mt-1 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-accent animate-pulse" /> VERIFIED
                      </div>
                    </div>
                    <div className="w-12 h-12 border-[2px] border-edge-neutral p-1 opacity-50 relative overflow-hidden">
                      {/* Stylized QR/Barcode representation */}
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-ink-primary)_2px,transparent_2px)] [background-size:6px_100%] opacity-80" />
                      <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--color-bg-void)_2px,transparent_2px)] [background-size:100%_8px] opacity-90" />
                    </div>
                  </div>
                </div>
              </m.div>
            </m.div>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="w-full py-8 border-y-2 border-edge-neutral bg-bg-base">
          <div className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-150">
            {["Stellar", "Soroban", "Next.js", "React 19", "Tailwind CSS 4"].map(logo => (
              <div key={logo} className="border-2 border-edge-neutral px-4 py-2 bg-bg-void">
                <span className="text-sm font-mono-data font-bold uppercase tracking-widest text-ink-primary select-none">
                  {logo}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="w-full py-32 px-margin-mobile md:px-margin-desktop max-w-6xl mx-auto relative">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <h2 className="font-headline-lg text-4xl md:text-6xl font-extrabold uppercase tracking-tighter text-ink-primary leading-none">
              The Protocol<br />
              <span className="text-transparent bg-clip-text" style={{ WebkitTextStroke: '2px var(--color-ink-primary)' }}>In Action.</span>
            </h2>
            <p className="font-mono-data text-ink-secondary text-sm uppercase tracking-widest max-w-xs border-l-2 border-accent pl-4">
              4 deterministic steps to guaranteed payment.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[
              { num: "01", title: "Connect", desc: "Link your identity.", code: `let wallet = "CONNECTED";\nawait require_auth();` },
              { num: "02", title: "Fund", desc: "Lock capital in escrow.", code: `let status = "FUNDED";\nescrow.deposit(USDC, amount);` },
              { num: "03", title: "Ship", desc: "Merge code to main.", code: `let work = "SUBMITTED";\ngithub.merge_pr();` },
              { num: "04", title: "Unlock", desc: "Get paid instantly.", code: `let payout = "RELEASED";\nescrow.transfer(freelancer);` },
            ].map((step, i) => (
              <m.div 
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
                className="group relative bg-bg-void border-2 border-edge-neutral p-8 flex flex-col justify-between overflow-hidden shadow-neopop hover:-translate-y-2 hover:shadow-[12px_12px_0px_var(--color-accent)] transition-all duration-300"
              >
                {/* Huge Background Number */}
                <span className="absolute -right-4 -bottom-8 text-[150px] font-headline-lg font-black text-ink-primary opacity-5 select-none z-0 tracking-tighter transition-transform duration-500 group-hover:scale-110">
                  {step.num}
                </span>

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="bg-ink-primary text-bg-base font-mono-data text-sm px-2 py-1 font-bold tracking-widest">
                      STEP {step.num}
                    </span>
                    <h3 className="font-headline-lg text-3xl text-ink-primary font-bold uppercase tracking-tight">{step.title}</h3>
                  </div>
                  
                  <p className="font-ui-label text-ink-secondary uppercase tracking-widest text-xs font-bold border-l-2 border-edge-neutral pl-3">
                    {step.desc}
                  </p>
                  
                  <div className="bg-bg-base border-2 border-edge-neutral p-4 relative group-hover:border-accent transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-3 h-3 border-l-2 border-b-2 border-edge-neutral bg-bg-void transition-colors duration-300 group-hover:border-accent" />
                    <pre className="font-mono-data text-accent text-sm font-bold leading-relaxed whitespace-pre-wrap">
                      <code>{step.code}</code>
                    </pre>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="w-full py-32 bg-bg-base border-t-2 border-edge-neutral">
          <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop text-center space-y-8">
            <h2 className="font-headline-lg text-4xl md:text-5xl font-bold uppercase tracking-tighter text-ink-primary">Pricing that makes sense.</h2>
            <div className="flex justify-center items-baseline gap-2">
              <span className="text-[120px] font-headline-lg font-bold text-accent leading-none tracking-tighter uppercase">0</span>
              <span className="text-[48px] font-headline-lg font-bold text-ink-secondary uppercase tracking-tight">%</span>
            </div>
            <p className="font-ui-label text-xl font-bold text-ink-secondary uppercase tracking-widest">
              You pay gas. We don't take a cut.
            </p>
            <div className="pt-8">
              <Link href="/auth" className="neopop-button-teal px-10 py-5 inline-flex items-center justify-center font-ui-label text-sm font-bold uppercase tracking-widest gap-2">
                Start Building Now
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
