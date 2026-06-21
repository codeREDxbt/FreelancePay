"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { createContract } from "@/lib/firebase/contracts";
import { useWallet } from "@/hooks/useWallet";
import { useEscrow } from "@/hooks/useEscrow";
import { ErrorBoundary } from "@/components/providers/error-boundary";
import { m, AnimatePresence } from 'framer-motion';
import { Step1Counterparty, Step2Details, Step3Terms, Step4Review } from "@/components/dashboard/contracts-new-components";
import type { NewContractFormData } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const steps = [
  { id: 1, label: "Counterparty" },
  { id: 2, label: "Details" },
  { id: 3, label: "Terms" },
  { id: 4, label: "Review" },
];

export default function NewContractPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { initializeEscrow } = useEscrow();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NewContractFormData>({
    title: "",
    description: "",
    amount: "",
    freelancerAddress: "",
    deliverableUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    if (!publicKey) {
      setError("You must be logged in to create a contract");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await initializeEscrow(
        formData.freelancerAddress,
        [parseFloat(formData.amount)],
        [formData.description]
      );

      const txHash = (result as { hash?: string }).hash || "pending";

      await createContract({
        clientWallet: publicKey,
        freelancerWallet: formData.freelancerAddress,
        title: formData.title,
        description: formData.description,
        totalAmount: parseFloat(formData.amount),
        contractAddress: txHash,
        isDisputed: false,
        isClosed: false,
        milestones: [
          {
            id: 1,
            description: "Initial Deliverable",
            amount: parseFloat(formData.amount),
            status: "pending",
            deliverableUrl: formData.deliverableUrl || undefined,
          }
        ]
      });

      router.push("/dashboard/contracts");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create contract";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <ErrorBoundary>
      <div className="flex-grow flex flex-col items-center py-12 px-4 md:px-margin-desktop">
        <div className="w-full max-w-[640px]">

          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-5 left-0 w-full h-[2px] bg-surface-container-highest z-0"></div>
              <div
                className="absolute top-5 left-0 h-[2px] bg-primary z-0 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors duration-300 ${
                      isCompleted ? "bg-primary-container text-on-primary-container" :
                      isActive ? "bg-primary text-on-primary ring-4 ring-primary/10" :
                      "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-mono-data text-[14px]">0{step.id}</span>}
                    </div>
                    <span className={`font-ui-label text-[12px] uppercase tracking-tighter ${
                      isActive ? "text-primary font-bold" : "text-on-surface-variant"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-surface border border-outline-variant/50 p-8 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <AnimatePresence mode="wait">
              <m.div
                key={currentStep}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={fadeUp}
              >
                <form onSubmit={handleSubmit} className="space-y-6">

                  {currentStep === 1 && <Step1Counterparty formData={formData} handleChange={handleChange} />}
                  {currentStep === 2 && <Step2Details formData={formData} handleChange={handleChange} />}
                  {currentStep === 3 && <Step3Terms formData={formData} handleChange={handleChange} />}
                  {currentStep === 4 && <Step4Review formData={formData} handleChange={handleChange} error={error} />}

                  <div className="pt-8 mt-8 border-t border-outline-variant/30 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStep === 1) {
                          router.back();
                        } else {
                          setCurrentStep(prev => prev - 1);
                        }
                      }}
                      className="px-5 py-2.5 text-on-surface-variant hover:bg-surface-container-low rounded-lg font-ui-label text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      {currentStep === 1 ? "Cancel" : <><ArrowLeft className="w-4 h-4" /> Back</>}
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-ui-label text-sm font-bold hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none btn-primary-inset"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       currentStep === 4 ? <><Check className="w-4 h-4" /> Sign & Create Contract</> :
                       <>Next <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>

                </form>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}