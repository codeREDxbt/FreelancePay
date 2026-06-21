"use client";

import React, { useState } from "react";
import { ChevronDown, MessageCircle, FileText, Search, ExternalLink } from "lucide-react";
import { DashboardTopNav } from "@/components/layout/DashboardTopNav";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

const FAQS = [
  {
    question: "How does the Stellar escrow work?",
    answer: "When a client creates a contract, the funds are deposited into a secure Stellar smart contract (Soroban). The funds remain locked and cannot be withdrawn by either party until the milestone is approved by the client, or a dispute resolution is reached."
  },
  {
    question: "What happens if there's a dispute?",
    answer: "If the client and freelancer cannot agree on the deliverables, either party can flag the contract for dispute. This locks the contract state. Our decentralized arbitration team will review the evidence and deliverables to make a final ruling."
  },
  {
    question: "Which networks are supported?",
    answer: "Currently, FreelancePay is deployed on the Stellar Testnet for beta testing. Mainnet support will be rolling out soon. Please ensure your Freighter wallet is connected to the correct network."
  },
  {
    question: "How are fees calculated?",
    answer: "FreelancePay charges a flat 1% fee on released funds. There are no fees for creating a contract or depositing funds. Standard Stellar network transaction fees (which are fractions of a cent) still apply."
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <DashboardTopNav />
        <main className="flex-1 overflow-y-auto pt-24 pb-12 px-4 md:px-margin-desktop">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-headline-lg text-on-background mb-4">
                Help Centre
              </h1>
              <p className="text-on-surface-variant font-ui-label text-lg">
                How can we help you today?
              </p>
              
              <div className="relative max-w-xl mx-auto mt-8">
                <Search className="absolute left-4 top-3.5 text-on-surface-variant w-5 h-5" />
                <input
                  aria-label="Search help articles"
                  type="text"
                  placeholder="Search articles, guides, and FAQs..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-12 pr-4 py-3 font-ui-label focus:outline-none focus:border-primary transition-colors text-on-background"
                />
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-headline-sm text-xl mb-2 text-on-background">Documentation</h3>
                <p className="text-on-surface-variant font-ui-label text-sm mb-4">
                  Detailed guides on API integration, Soroban smart contracts, and platform features.
                </p>
                <span className="text-primary font-ui-label text-sm flex items-center gap-1 font-semibold">
                  Read the docs <ExternalLink className="w-4 h-4" />
                </span>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-tertiary" />
                </div>
                <h3 className="font-headline-sm text-xl mb-2 text-on-background">Contact Support</h3>
                <p className="text-on-surface-variant font-ui-label text-sm mb-4">
                  Can&apos;t find what you&apos;re looking for? Reach out to our dedicated support team.
                </p>
                <span className="text-tertiary font-ui-label text-sm flex items-center gap-1 font-semibold">
                  Open a ticket <ExternalLink className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* FAQs */}
            <h2 className="font-headline-lg text-2xl text-on-background mb-6">Frequently Asked Questions</h2>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden">
              {FAQS.map((faq, idx) => (
                <div 
                  key={faq.question}
                  className={`border-b border-outline-variant last:border-b-0 ${openFaq === idx ? 'bg-surface-container-low/30' : ''}`}
                >
                  <button type="button"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-headline-sm text-on-background">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <div 
                    className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                      openFaq === idx ? 'max-h-48 pb-4 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-on-surface-variant font-ui-label text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
