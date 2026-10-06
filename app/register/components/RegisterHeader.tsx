import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Sparkles, AlertTriangle } from "lucide-react";
import { SeatStatusResponse } from "../types";
import { cn } from "../../lib/utils";

export interface RegisterHeaderProps {
  seatStatus?: SeatStatusResponse | null;
  isLoading?: boolean;
}

export const RegisterHeader: React.FC<RegisterHeaderProps> = ({
  seatStatus,
  isLoading,
}) => {
  return (
    <header className="relative z-20 border-b border-white/[0.07] bg-[#020817]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors shrink-0"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </span>
          <span className="truncate">Back to D&apos;VINE</span>
        </Link>

        {/* Live Seat Status Indicator */}
        <div className="hidden sm:flex items-center">
          {isLoading ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-mono text-neutral-400 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-ping" />
              <span>Checking live seats...</span>
            </div>
          ) : seatStatus ? (
            seatStatus.available === 0 ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-semibold uppercase tracking-wider">Sold Out (0 Seats)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[11px] font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span>
                  <strong className="text-white font-semibold">{seatStatus.available}</strong>
                  <span className="text-neutral-400">/{seatStatus.total}</span> seats remaining
                </span>
              </div>
            )
          ) : null}
        </div>

        <Link
          href="/"
          className="flex items-center transition-transform hover:scale-[1.03] select-none shrink-0"
          aria-label="Go to D'VINE Home"
        >
          <Image
            src="/dvine.svg"
            alt="D'VINE 2.0"
            width={831}
            height={322}
            className="h-6 sm:h-7 md:h-8 w-auto max-w-[120px] sm:max-w-none object-contain drop-shadow-[0_2px_12px_rgba(26,186,255,0.4)]"
            priority
          />
        </Link>
      </div>
    </header>
  );
};
