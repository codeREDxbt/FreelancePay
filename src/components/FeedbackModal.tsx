"use client";

import React, { useState, useEffect } from "react";
import { X, Star, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { motion as m, AnimatePresence } from "framer-motion";
import { submitFeedback } from "@/lib/firebase/growth";
import { useWallet } from "@/hooks/useWallet";

export function FeedbackModal() {
  const { publicKey } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<string>("unknown_action");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [confusionPoint, setConfusionPoint] = useState("");
  const [requestedFeature, setRequestedFeature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setAction(e.detail?.action || "unknown_action");
      setIsOpen(true);
    };
    
    // Listen for custom event triggered from anywhere in the app
    window.addEventListener("open-feedback-modal", handleOpen);
    return () => {
      window.removeEventListener("open-feedback-modal", handleOpen);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        walletAddress: publicKey,
        rating,
        confusionPoint: confusionPoint.trim() || undefined,
        requestedFeature: requestedFeature.trim() || undefined,
        completedAction: [action],
      });
      toast.success("Thank you for your feedback! It helps us improve.");
      setIsOpen(false);
      
      // Reset form
      setRating(0);
      setConfusionPoint("");
      setRequestedFeature("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-ink-primary/80 backdrop-blur-sm z-[99]"
          />
          <m.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[500px] bg-bg-base border border-edge-neutral shadow-neopop z-[100] max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-edge-neutral bg-bg-interactive shrink-0">
              <h2 className="font-ui-label font-bold text-ink-primary tracking-widest uppercase">
                Rate this experience
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-ink-secondary hover:text-ink-primary transition-colors p-2 -mr-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto">
              <p className="font-mono-data text-sm text-ink-secondary mb-6">
                You just completed a core action. How was it? Your feedback helps us improve the product!
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div className="space-y-3">
                  <label className="font-ui-label text-sm text-ink-primary uppercase tracking-widest block">
                    Rating (1-5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`p-2 transition-transform hover:scale-110 ${(hoverRating || rating) >= star ? 'text-accent' : 'text-edge-strong'}`}
                      >
                        <Star className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'fill-accent' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confusion Point */}
                <div className="space-y-3">
                  <label className="font-ui-label text-sm text-ink-primary uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangleIcon /> What confused you most? <span className="text-ink-tertiary">(Optional)</span>
                  </label>
                  <textarea
                    value={confusionPoint}
                    onChange={(e) => setConfusionPoint(e.target.value)}
                    placeholder="E.g., I didn't understand the wallet prompt..."
                    className="w-full bg-bg-interactive border border-edge-neutral focus:border-accent outline-none p-4 font-mono-data text-sm resize-none h-24"
                  />
                </div>

                {/* Feature Request */}
                <div className="space-y-3">
                  <label className="font-ui-label text-sm text-ink-primary uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Feature Requests <span className="text-ink-tertiary">(Optional)</span>
                  </label>
                  <textarea
                    value={requestedFeature}
                    onChange={(e) => setRequestedFeature(e.target.value)}
                    placeholder="E.g., I wish there was a way to..."
                    className="w-full bg-bg-interactive border border-edge-neutral focus:border-accent outline-none p-4 font-mono-data text-sm resize-none h-24"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full neopop-button-teal py-4 font-ui-label font-bold tracking-widest uppercase text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Feedback"
                  )}
                </button>
              </form>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AlertTriangleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4"/>
      <path d="M12 17h.01"/>
    </svg>
  );
}
