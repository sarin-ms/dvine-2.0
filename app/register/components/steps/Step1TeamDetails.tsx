import React from "react";
import { motion } from "framer-motion";
import { Users, AlertCircle, ChevronRight, Ban } from "lucide-react";
import { cn } from "../../../lib/utils";
import { motionTransitions } from "../../../lib/motion-tokens";
import { FormErrors, MemberData, MemberKey, TeamRegistrationData } from "../../types";
import { MemberBasicFields } from "../shared/MemberBasicFields";

export interface Step1TeamDetailsProps {
  formData: TeamRegistrationData;
  errors: FormErrors;
  onUpdateField: (field: "teamName" | "confirmAccuracy", value: string | boolean) => void;
  onUpdateMember: (memberKey: MemberKey, field: keyof MemberData, value: string) => void;
  onNext: () => void;
  isSoldOut?: boolean;
}

export const Step1TeamDetails: React.FC<Step1TeamDetailsProps> = ({
  formData,
  errors,
  onUpdateField,
  onUpdateMember,
  onNext,
  isSoldOut = false,
}) => {
  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={motionTransitions.springGentle}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/90 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Sold out notice banner */}
        {isSoldOut && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
            <Ban className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-200">Registrations are Sold Out</h4>
              <p className="text-xs text-rose-300/80 mt-0.5">
                All team seats for D&apos;VINE 2.0 have been filled. You can no longer initiate new registrations.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-5 sm:mb-8 border-b border-white/[0.07] pb-4 sm:pb-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Team & Member Details</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Enter your team name and contact details for both members to register.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Team Identity Card */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-cyan-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <label className="block text-xs font-mono uppercase tracking-wider text-cyan-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Team Name</span> <span className="text-rose-400">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter your Team Name"
              value={formData.teamName}
              disabled={isSoldOut}
              onChange={(e) => onUpdateField("teamName", e.target.value)}
              className={cn(
                "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all",
                isSoldOut && "opacity-50 cursor-not-allowed",
                errors.teamName
                  ? "border-rose-500/80 focus:ring-rose-400 focus:border-rose-400"
                  : "border-white/10 hover:border-white/20 focus:ring-cyan-400 focus:border-cyan-400",
              )}
            />
            {errors.teamName && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.teamName}</span>
              </p>
            )}
          </div>

          {/* Member 1 (Team Leader) */}
          <div className="pt-2">
            <MemberBasicFields
              memberKey="member1"
              title="Team Leader"
              memberData={formData.member1}
              errors={errors}
              emailSubtitle="Receipt sent here"
              onUpdate={onUpdateMember}
            />
          </div>

          {/* Member 2 (Teammate) */}
          <div className="pt-4 border-t border-white/[0.08]">
            <MemberBasicFields
              memberKey="member2"
              title="Teammate"
              memberData={formData.member2}
              errors={errors}
              emailSubtitle="Event confirmation"
              onUpdate={onUpdateMember}
            />
          </div>
        </div>

        {/* Continue CTA */}
        <div className="mt-8 pt-5 sm:pt-6 border-t border-white/[0.07] flex items-center justify-end">
          <button
            type="button"
            onClick={onNext}
            disabled={isSoldOut}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-xs sm:text-sm transition-all duration-200 shadow-[0_4px_16px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.25)] active:scale-98 cursor-pointer"
          >
            <span>Continue to Academic Details</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
