import React from "react";
import { motion } from "framer-motion";
import { School, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { motionTransitions } from "../../../lib/motion-tokens";
import { FormErrors, MemberData, MemberKey, TeamRegistrationData } from "../../types";
import { MemberAcademicFields } from "../shared/MemberAcademicFields";

export interface Step2AcademicDetailsProps {
  formData: TeamRegistrationData;
  errors: FormErrors;
  activeCollegeTarget: MemberKey | null;
  collegeSuggestions: string[];
  onCollegeChange: (memberKey: MemberKey, val: string) => void;
  onCollegeSelect: (memberKey: MemberKey, val: string) => void;
  onCollegeFocus: (memberKey: MemberKey) => void;
  onUpdateMember: (memberKey: MemberKey, field: keyof MemberData, value: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Step2AcademicDetails: React.FC<Step2AcademicDetailsProps> = ({
  formData,
  errors,
  activeCollegeTarget,
  collegeSuggestions,
  onCollegeChange,
  onCollegeSelect,
  onCollegeFocus,
  onUpdateMember,
  onPrev,
  onNext,
}) => {
  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={motionTransitions.springGentle}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/90 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="mb-5 sm:mb-8 border-b border-white/[0.07] pb-4 sm:pb-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <School className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>Academic & College Details</span>
            </h2>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/10">
              Team: {formData.teamName || "2 Members"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Enter academic credentials and college information for both teammates.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Member 1 (Leader) Academic */}
          <MemberAcademicFields
            memberKey="member1"
            title="Team Leader"
            nameHighlight={formData.member1.firstName}
            memberData={formData.member1}
            errors={errors}
            collegeSuggestions={collegeSuggestions}
            isCollegeTargetActive={activeCollegeTarget === "member1"}
            onCollegeChange={onCollegeChange}
            onCollegeSelect={onCollegeSelect}
            onCollegeFocus={onCollegeFocus}
            onUpdate={onUpdateMember}
          />

          {/* Member 2 (Teammate) Academic */}
          <div className="pt-4 border-t border-white/[0.08]">
            <MemberAcademicFields
              memberKey="member2"
              title="Member 2"
              nameHighlight={formData.member2.firstName}
              icon={<UserCheck className="w-4 h-4 text-sky-400" />}
              memberData={formData.member2}
              errors={errors}
              collegeSuggestions={collegeSuggestions}
              isCollegeTargetActive={activeCollegeTarget === "member2"}
              onCollegeChange={onCollegeChange}
              onCollegeSelect={onCollegeSelect}
              onCollegeFocus={onCollegeFocus}
              onUpdate={onUpdateMember}
            />
          </div>
        </div>

        {/* Navigation CTA Buttons */}
        <div className="mt-8 pt-5 sm:pt-6 border-t border-white/[0.07] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm transition-all duration-200 shadow-[0_4px_16px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.25)] active:scale-98 cursor-pointer"
          >
            <span>Proceed to Review</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
