import React from "react";
import { Pencil } from "lucide-react";
import { MemberData } from "../../types";

export interface MemberReviewCardProps {
  title: string;
  icon: React.ReactNode;
  memberData: MemberData;
  onEdit: () => void;
}

export const MemberReviewCard: React.FC<MemberReviewCardProps> = ({
  title,
  icon,
  memberData,
  onEdit,
}) => {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0E1118]/95 p-4 sm:p-6 backdrop-blur-md transition-all">
      <div className="flex items-center justify-between mb-3.5 sm:mb-4 border-b border-white/[0.06] pb-3">
        <h4 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h4>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <Pencil className="w-3 h-3 text-neutral-400" />
          <span>Edit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2.5 sm:gap-y-4 text-xs sm:text-sm">
        <div className="text-[11px] sm:text-xs text-neutral-400">Full Name</div>
        <div className="sm:col-span-2 font-medium text-white break-words">
          {memberData.firstName} {memberData.lastName}
        </div>

        <div className="text-[11px] sm:text-xs text-neutral-400">Gender</div>
        <div className="sm:col-span-2 font-medium text-white">
          {memberData.gender}
        </div>

        <div className="text-[11px] sm:text-xs text-neutral-400">Email Address</div>
        <div className="sm:col-span-2 font-mono text-cyan-300 break-all">
          {memberData.email}
        </div>

        <div className="text-[11px] sm:text-xs text-neutral-400">Phone Number</div>
        <div className="sm:col-span-2 font-mono text-white">
          +91 {memberData.phone}
        </div>

        <div className="text-[11px] sm:text-xs text-neutral-400">Institution</div>
        <div className="sm:col-span-2 font-medium text-white break-words">
          {memberData.collegeName}
        </div>

        <div className="text-[11px] sm:text-xs text-neutral-400">Year & Dept</div>
        <div className="sm:col-span-2 font-medium text-white break-words">
          {memberData.yearOfStudy} • {memberData.department}
        </div>
      </div>
    </div>
  );
};
