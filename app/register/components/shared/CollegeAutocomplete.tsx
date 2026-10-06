import React from "react";
import { School } from "lucide-react";
import { cn } from "../../../lib/utils";
import { MemberKey } from "../../types";

export interface CollegeAutocompleteProps {
  memberKey: MemberKey;
  value: string;
  suggestions: string[];
  isTargetActive: boolean;
  error?: string;
  onChange: (memberKey: MemberKey, val: string) => void;
  onSelect: (memberKey: MemberKey, college: string) => void;
  onFocus: (memberKey: MemberKey) => void;
}

export const CollegeAutocomplete: React.FC<CollegeAutocompleteProps> = ({
  memberKey,
  value,
  suggestions,
  isTargetActive,
  error,
  onChange,
  onSelect,
  onFocus,
}) => {
  return (
    <div className="relative">
      <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
        College / Institution Name <span className="text-rose-400">*</span>
      </label>
      <div className="relative">
        <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Type to search or enter college name..."
          value={value}
          onChange={(e) => onChange(memberKey, e.target.value)}
          onFocus={() => onFocus(memberKey)}
          className={cn(
            "w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 transition-all",
            error
              ? "border-rose-500/80 focus:ring-rose-400 focus:border-rose-400"
              : "border-white/10 hover:border-white/20 focus:ring-cyan-400 focus:border-cyan-400",
          )}
        />
      </div>
      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}

      {/* Suggestions Dropdown */}
      {isTargetActive && suggestions.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-[#10141f] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
          {suggestions.map((col, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(memberKey, col)}
              className="w-full text-left px-3.5 py-2.5 text-xs text-neutral-300 hover:text-white hover:bg-white/10 border-b border-white/[0.04] last:border-none transition-colors"
            >
              {col}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
