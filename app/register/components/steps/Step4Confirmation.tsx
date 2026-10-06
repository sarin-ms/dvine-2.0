"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Check,
  Mail,
  Users,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Home,
} from "lucide-react";
import { motionTransitions } from "../../../lib/motion-tokens";
import { PaymentLifecycleStatus } from "../../../components/register/PaymentStatus";
import { TeamRegistrationData } from "../../types";

export interface Step4ConfirmationProps {
  formData: TeamRegistrationData;
  paymentStatus: PaymentLifecycleStatus;
  txId: string;
  onSetPaymentStatus: (status: PaymentLifecycleStatus) => void;
  onRetryPayment: () => void;
  onChangePaymentMethod: () => void;
  amount?: number;
  errorMessage?: string | null;
  isPolling?: boolean;
}

export const Step4Confirmation: React.FC<Step4ConfirmationProps> = ({
  formData,
  paymentStatus,
  txId,
  onRetryPayment,
  onChangePaymentMethod,
  amount = 600,
  errorMessage,
  isPolling,
}) => {
  // State: Verifying / Processing
  if (paymentStatus === "processing" || paymentStatus === "verifying") {
    return (
      <motion.div
        key="step-4-verifying"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={motionTransitions.springGentle}
        className="max-w-lg mx-auto py-12 px-4 text-center space-y-6"
      >
        <div className="relative w-20 h-20 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <ShieldCheck className="w-9 h-9 text-cyan-400" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Verifying Your Registration...
          </h2>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto">
            {isPolling
              ? "Confirming payment with the bank and reserving your seats. Please keep this tab open."
              : "Communicating securely with the payment gateway..."}
          </p>
        </div>
      </motion.div>
    );
  }

  // State: Failed
  if (paymentStatus === "failed") {
    return (
      <motion.div
        key="step-4-failed"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={motionTransitions.springGentle}
        className="max-w-lg mx-auto py-8 px-4 space-y-6"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Payment Unsuccessful
          </h2>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            {errorMessage ||
              "Your payment could not be completed. If money was debited, it will be refunded automatically by your bank within 3–5 working days."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onRetryPayment}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <button
            type="button"
            onClick={onChangePaymentMethod}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-medium text-sm transition-all cursor-pointer"
          >
            <span>Back to Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Primary State: Confirmed / Success
  return (
    <motion.div
      key="step-4-success"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={motionTransitions.springGentle}
      className="max-w-xl mx-auto space-y-6"
    >
      {/* 1. Verified Hero Badge & Confirmation Header */}
      <div className="text-center space-y-3 pt-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={motionTransitions.springSnappy}
          className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.25)]"
        >
          <Check className="w-8 h-8 stroke-[2.5]" />
        </motion.div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-medium mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Confirmed
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Registration Confirmed!
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
            Everything has been confirmed. Your team is officially registered for D&apos;VINE 2.0.
          </p>
        </div>
      </div>

      {/* 2. Minimalist Email Notice */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-start gap-3 text-xs text-neutral-300">
        <Mail className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="leading-relaxed text-neutral-200">
            Confirmation emails with event tickets and credentials will be sent to:
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-white text-xs">
            <span>{formData.member1.email}</span>
            {formData.member2.email && (
              <>
                <span className="text-neutral-500 font-sans">&bull;</span>
                <span>{formData.member2.email}</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-neutral-500 pt-0.5">
            Please check your inbox (and spam folder) within the next few minutes.
          </p>
        </div>
      </div>

      {/* 3. Team & Registration Details Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118]/90 p-4 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">Team Summary</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-medium">₹{amount}.00 Paid</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <span className="text-[11px] text-neutral-500 block">Team Name</span>
            <span className="text-sm font-semibold text-white tracking-tight">
              {formData.teamName || "D'VINE Team"}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-500 block">College</span>
            <span className="text-neutral-200 font-medium truncate block">
              {formData.member1.collegeName || "Registered Institution"}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-500 block">Team Leader</span>
            <span className="text-neutral-200 font-medium block">
              {formData.member1.firstName} {formData.member1.lastName}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-neutral-500 block">Teammate</span>
            <span className="text-neutral-200 font-medium block">
              {formData.member2.firstName ? `${formData.member2.firstName} ${formData.member2.lastName}` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. WhatsApp Community Invite */}
      <a
        href="https://chat.whatsapp.com/invite/dvine2026"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#25D366]/10 to-teal-500/5 hover:from-emerald-500/15 hover:via-[#25D366]/15 hover:to-teal-500/10 border border-[#25D366]/30 hover:border-[#25D366]/60 transition-all cursor-pointer shadow-lg"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#25D366] text-black flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67ZM8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.36 9.71 14.96 12.22 15.93C14.31 16.74 14.73 16.58 15.19 16.54C15.65 16.5 16.67 15.94 16.88 15.35C17.09 14.76 17.09 14.26 17.03 14.16C16.97 14.06 16.81 14 16.57 13.88C16.33 13.76 15.15 13.18 14.93 13.1C14.71 13.02 14.55 12.98 14.39 13.22C14.23 13.46 13.77 14 13.63 14.16C13.49 14.32 13.35 14.34 13.11 14.22C12.87 14.1 11.86 13.77 10.66 12.7C9.73 11.87 9.1 10.84 8.98 10.64C8.86 10.44 8.97 10.33 9.09 10.21C9.2 10.1 9.34 9.92 9.46 9.78C9.58 9.64 9.62 9.54 9.7 9.38C9.78 9.22 9.74 9.08 9.68 8.96C9.62 8.84 9.16 7.71 8.97 7.24C8.78 6.79 8.59 6.85 8.45 6.84C8.32 6.83 8.16 6.83 8.01 6.83L8.53 7.33Z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate">Join Official WhatsApp Group</h4>
            <p className="text-xs text-neutral-400 mt-0.5 truncate">
              Live hackathon announcements, team sync & mentor updates
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-neutral-300 group-hover:border-[#25D366]/50 group-hover:text-[#25D366] transition-colors shrink-0">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </a>

      {/* 5. Back to Home Action */}
      <div className="pt-2 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Homepage</span>
        </a>
      </div>
    </motion.div>
  );
};
