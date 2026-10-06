import React from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "../../../lib/utils";
import { FormErrors, MemberData, MemberKey } from "../../types";
import { YEAR_OPTIONS } from "../../constants";
import { CollegeAutocomplete } from "./CollegeAutocomplete";

export interface MemberAcademicFieldsProps {
  memberKey: MemberKey;
  title: string;
  nameHighlight?: string;
  icon?: React.ReactNode;
  memberData: MemberData;
  errors: FormErrors;
  collegeSuggestions: string[];
  isCollegeTargetActive: boolean;
  onCollegeChange: (memberKey: MemberKey, val: string) => void;
  onCollegeSelect: (memberKey: MemberKey, val: string) => void;
  onCollegeFocus: (memberKey: MemberKey) => void;
  onUpdate: (memberKey: MemberKey, field: keyof MemberData, value: string) => void;
}

export const MemberAcademicFields: React.FC<MemberAcademicFieldsProps> = ({
  memberKey,
  title,
  nameHighlight,
  icon,
  memberData,
  errors,
  collegeSuggestions,
  isCollegeTargetActive,
  onCollegeChange,
  onCollegeSelect,
  onCollegeFocus,
  onUpdate,
}) => {
  const collegeError = errors[`${memberKey}.collegeName`];
  const yearError = errors[`${memberKey}.yearOfStudy`];
  const departmentError = errors[`${memberKey}.department`];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 border-b border-white/[0.06] pb-2.5">
        {icon}
        <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
          {title}:{" "}
          <span className={memberKey === "member1" ? "text-cyan-300" : "text-sky-300"}>
            {nameHighlight || (memberKey === "member1" ? "Leader" : "Teammate")}
          </span>
        </h3>
      </div>

      <div className="space-y-4">
        {/* College Name Autocomplete */}
        <CollegeAutocomplete
          memberKey={memberKey}
          value={memberData.collegeName}
          suggestions={collegeSuggestions}
          isTargetActive={isCollegeTargetActive}
          error={collegeError}
          onChange={onCollegeChange}
          onSelect={onCollegeSelect}
          onFocus={onCollegeFocus}
        />

        {/* Year & Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
              Year of Study <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {YEAR_OPTIONS.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => onUpdate(memberKey, "yearOfStudy", yr)}
                  className={cn(
                    "px-2 py-2 rounded-xl text-[11px] font-medium border text-center transition-all cursor-pointer truncate",
                    memberData.yearOfStudy === yr
                      ? "bg-white text-black border-white font-semibold shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
                      : "bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white hover:border-white/20",
                  )}
                >
                  {yr}
                </button>
              ))}
            </div>
            {yearError && (
              <p className="text-[11px] text-rose-400 mt-1">{yearError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Branch / Department <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder={
                  memberKey === "member1"
                    ? "e.g. Computer Science, Design"
                    : "e.g. Electronics, Mech, CS"
                }
                value={memberData.department}
                onChange={(e) => onUpdate(memberKey, "department", e.target.value)}
                className={cn(
                  "w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all",
                  departmentError
                    ? "border-rose-500/80 focus:ring-rose-400 focus:border-rose-400"
                    : "border-white/10 hover:border-white/20 focus:ring-cyan-400 focus:border-cyan-400",
                )}
              />
            </div>
            {departmentError && (
              <p className="text-[11px] text-rose-400 mt-1">{departmentError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
