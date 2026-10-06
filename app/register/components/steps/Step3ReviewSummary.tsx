"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Pencil, Crown, UserCheck, AlertCircle, ShieldCheck } from "lucide-react";
import { motionTransitions } from "../../../lib/motion-tokens";
import SlideCommit from "../../../components/ui/SlideCommit";
import { FormErrors, OtpState, TeamRegistrationData } from "../../types";
import { MemberReviewCard } from "../shared/MemberReviewCard";
import { LeaderEmailOtpArea } from "../shared/LeaderEmailOtpArea";
import { loadRazorpayScript } from "../../utils/loadRazorpay";

export interface Step3ReviewSummaryProps {
  formData: TeamRegistrationData;
  errors: FormErrors;
  onEditStep: (step: number) => void;
  onUpdateField: (field: "teamName" | "confirmAccuracy", value: string | boolean) => void;
  onSlidePayment: () => Promise<void>;
  onSetTermsError: (msg: string) => void;
  amount?: number;
  // Final-step OTP Verification for Leader
  isLeaderEmailVerified: boolean;
  otpState: OtpState;
  onSendOtp: (email: string) => Promise<boolean>;
  onVerifyOtp: (email: string, code: string) => Promise<boolean>;
  onVerificationExpired?: () => void;
}

export const Step3ReviewSummary: React.FC<Step3ReviewSummaryProps> = ({
  formData,
  errors,
  onEditStep,
  onUpdateField,
  onSlidePayment,
  onSetTermsError,
  amount = 600,
  isLeaderEmailVerified,
  otpState,
  onSendOtp,
  onVerifyOtp,
  onVerificationExpired,
}) => {
  const perHead = Math.round(amount / 2);
  const isSlideEnabled = formData.confirmAccuracy && isLeaderEmailVerified;

  React.useEffect(() => {
    loadRazorpayScript();
  }, []);

  return (
    <motion.div
      key="step-3"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={motionTransitions.springGentle}
      className="w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
        {/* Left Area (2 cols): Team & Member Review Cards */}
        <div className="lg:col-span-2 space-y-3.5 sm:space-y-4">
          {/* Team Identity Banner */}
          <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-[#0c192c] to-[#0A0D14] p-4 sm:p-5 backdrop-blur-md flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                  Team Name
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {formData.teamName || "D'VINE 2.0 Team"}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEditStep(1)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
            </div>
          </div>

          {/* Card 1: Member 1 (Team Leader) */}
          <MemberReviewCard
            title="Team Leader"
            icon={<Crown className="w-4 h-4 text-cyan-400" />}
            memberData={formData.member1}
            onEdit={() => onEditStep(1)}
          />

          {/* Card 2: Member 2 (Teammate) */}
          <MemberReviewCard
            title="Teammate"
            icon={<UserCheck className="w-4 h-4 text-sky-400" />}
            memberData={formData.member2}
            onEdit={() => onEditStep(1)}
          />
        </div>

        {/* Right Area (1 col): Summary / Checkout Card */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118]/95 p-4 sm:p-6 backdrop-blur-md shadow-2xl space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
                Registration Summary
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                ₹{perHead} per head (2 members).
              </p>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 py-3 border-y border-white/[0.07] text-xs">
              <div className="flex items-center justify-between text-neutral-300">
                <span>Team Leader</span>
                <span className="font-mono text-neutral-200">₹{perHead}.00</span>
              </div>
              <div className="flex items-center justify-between text-neutral-300">
                <span>Teammate</span>
                <span className="font-mono text-neutral-200">₹{perHead}.00</span>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-white/[0.07] flex items-baseline justify-between">
                <span className="font-semibold text-sm text-white">
                  Total Payable
                </span>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-white">
                    ₹{amount}.00
                  </span>
                  <span className="block text-[10px] text-neutral-500 font-mono">
                    INR (incl. GST)
                  </span>
                </div>
              </div>
            </div>

            {/* Redesigned Leader Email OTP Verification Area */}
            <LeaderEmailOtpArea
              email={formData.member1.email}
              isVerified={isLeaderEmailVerified}
              otpState={otpState}
              onSendOtp={onSendOtp}
              onVerifyOtp={onVerifyOtp}
              onEditEmail={() => onEditStep(1)}
              onExpire={onVerificationExpired}
            />

            {/* Consent Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={formData.confirmAccuracy}
                  onChange={(e) =>
                    onUpdateField("confirmAccuracy", e.target.checked)
                  }
                  className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white cursor-pointer accent-white shrink-0"
                />
                <span className="text-xs text-neutral-300 group-hover:text-white transition-colors leading-relaxed">
                  I confirm that the team and member details entered above are
                  accurate to the best of my knowledge.
                </span>
              </label>
            </div>

            {errors.terms && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.terms}</span>
              </p>
            )}

            {/* Slide to Pay Slider */}
            <div className="w-full flex flex-col items-center overflow-hidden">
              <SlideCommit
                label={
                  !isLeaderEmailVerified
                    ? "Verify Email to Unlock Payment"
                    : `Slide to Pay ₹${amount}`
                }
                doneLabel="Launching Gateway..."
                errorLabel="Verify email & confirm info"
                height={54}
                trackColor="#070c18"
                handleColor="#FFFFFF"
                successColor="#0284c7"
                dangerColor="#f43f5e"
                disabled={!isSlideEnabled}
                disabledReason={
                  !formData.confirmAccuracy
                    ? "Please confirm that the information above is accurate."
                    : !isLeaderEmailVerified
                      ? "Please verify the leader's email before proceeding."
                      : undefined
                }
                onConfirm={onSlidePayment}
                onError={(reason) => {
                  const errorMsg =
                    reason instanceof Error
                      ? reason.message
                      : typeof reason === "string"
                        ? reason
                        : "";

                  if (!formData.confirmAccuracy) {
                    onSetTermsError(
                      "Please confirm that the information above is accurate.",
                    );
                  } else if (!isLeaderEmailVerified) {
                    onSetTermsError(
                      "Please verify the leader's email before proceeding.",
                    );
                  } else if (errorMsg) {
                    onSetTermsError(errorMsg);
                  } else {
                    onSetTermsError(
                      "Unable to initiate payment. Please try again.",
                    );
                  }
                }}
                className="w-full shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
              />
            </div>

            {/* Razorpay Gateway Badge Note */}
            <div className="pt-2 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
                <span>Secured by Razorpay</span>
              </div>
              <p className="text-[10px] text-neutral-500 mt-1">
                Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, & NetBanking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
