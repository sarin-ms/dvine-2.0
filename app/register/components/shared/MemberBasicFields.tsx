import React from "react";
import { Mail, Phone } from "lucide-react";
import { cn } from "../../../lib/utils";
import { FormErrors, MemberData, MemberKey } from "../../types";
import { GENDER_OPTIONS } from "../../constants";

export interface MemberBasicFieldsProps {
  memberKey: MemberKey;
  title: string;
  icon?: React.ReactNode;
  memberData: MemberData;
  errors: FormErrors;
  emailSubtitle?: string;
  onUpdate: (memberKey: MemberKey, field: keyof MemberData, value: string) => void;
}

export const MemberBasicFields: React.FC<MemberBasicFieldsProps> = ({
  memberKey,
  title,
  icon,
  memberData,
  errors,
  emailSubtitle = "Receipt sent here",
  onUpdate,
}) => {
  const firstNameError = errors[`${memberKey}.firstName`];
  const lastNameError = errors[`${memberKey}.lastName`];
  const genderError = errors[`${memberKey}.gender`];
  const emailError = errors[`${memberKey}.email`];
  const phoneError = errors[`${memberKey}.phone`];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              First Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder={memberKey === "member1" ? "e.g. Alex" : "e.g. Jordan"}
              value={memberData.firstName}
              onChange={(e) => onUpdate(memberKey, "firstName", e.target.value)}
              className={cn(
                "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all",
                firstNameError
                  ? "border-rose-500/80 focus:ring-rose-400 focus:border-rose-400"
                  : "border-white/10 hover:border-white/20 focus:ring-cyan-400 focus:border-cyan-400",
              )}
            />
            {firstNameError && (
              <p className="text-[11px] text-rose-400 mt-1">{firstNameError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Last Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder={memberKey === "member1" ? "e.g. Rivera" : "e.g. Lee"}
              value={memberData.lastName}
              onChange={(e) => onUpdate(memberKey, "lastName", e.target.value)}
              className={cn(
                "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all",
                lastNameError
                  ? "border-rose-500/80 focus:ring-rose-400 focus:border-rose-400"
                  : "border-white/10 hover:border-white/20 focus:ring-cyan-400 focus:border-cyan-400",
              )}
            />
            {lastNameError && (
              <p className="text-[11px] text-rose-400 mt-1">{lastNameError}</p>
            )}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">
            Gender <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onUpdate(memberKey, "gender", opt)}
                className={cn(
                  "px-2.5 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-medium border text-center transition-all cursor-pointer truncate",
                  memberData.gender === opt
                    ? "bg-white text-black border-white font-semibold shadow-[0_2px_12px_rgba(255,255,255,0.2)]"
                    : "bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white hover:border-white/20",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          {genderError && (
            <p className="text-[11px] text-rose-400 mt-1">{genderError}</p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                Email <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-neutral-500">
                {emailSubtitle}
              </span>
            </div>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                placeholder={
                  memberKey === "member1"
                    ? "leader@example.com"
                    : "member2@example.com"
                }
                value={memberData.email}
                onChange={(e) => onUpdate(memberKey, "email", e.target.value)}
                className={cn(
                  "w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all placeholder-neutral-600 focus:outline-none focus:ring-1",
                  emailError
                    ? "bg-white/[0.03] border-rose-500/80 focus:ring-rose-400 focus:border-rose-400 text-white"
                    : "bg-white/[0.03] border-white/10 hover:border-white/20 focus:ring-cyan-400 focus:border-cyan-400 text-white",
                )}
              />
            </div>

            {emailError && (
              <p className="text-[11px] text-rose-400 mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
              Phone Number <span className="text-rose-400">*</span>
            </label>
            <div className="relative flex">
              <div className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/10 bg-white/[0.05] text-xs font-mono text-neutral-400 select-none">
                +91
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={memberData.phone}
                  onChange={(e) => onUpdate(memberKey, "phone", e.target.value)}
                  className={cn(
                    "w-full pl-9 pr-3.5 py-2.5 rounded-r-xl bg-white/[0.03] border text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all",
                    phoneError
                      ? "border-rose-500/80 focus:ring-rose-400 focus:border-rose-400"
                      : "border-white/10 hover:border-white/20 focus:ring-cyan-400 focus:border-cyan-400",
                  )}
                />
              </div>
            </div>
            {phoneError && (
              <p className="text-[11px] text-rose-400 mt-1">{phoneError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
