"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useWallet } from "@/hooks/useWallet";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { address } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        walletAddress: address,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setRating(0);
        setComment("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 bg-surface-container-high border border-outline-variant/30 rounded-xl shadow-2xl p-6 mb-4"
          >
            {submitted ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-4xl text-primary mb-2 block">
                  check_circle
                </span>
                <h3 className="font-headline-sm text-on-surface">Thank you!</h3>
                <p className="text-on-surface-variant text-sm mt-1">
                  Your feedback helps us improve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="font-headline-sm text-on-surface mb-4">
                  Send Feedback
                </h3>
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`material-symbols-outlined text-2xl transition-colors ${
                        star <= rating ? "text-primary" : "text-outline-variant"
                      }`}
                    >
                      star
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full bg-surface p-3 rounded-lg border border-outline-variant/30 text-on-surface text-sm mb-4 focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>
            )}
          </m.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all"
        aria-label="Feedback"
      >
        <span className="material-symbols-outlined">
          {isOpen ? "close" : "forum"}
        </span>
      </button>
    </div>
  );
}
