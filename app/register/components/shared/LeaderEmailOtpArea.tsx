"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "../../../lib/utils";
import { OtpState } from "../../types";

/** Backend keeps an OTP-verified email valid for 5 minutes. */
export const VERIFIED_WINDOW_SECONDS = 5 * 60;

export interface LeaderEmailOtpAreaProps {
  email: string;
  isVerified: boolean;
  otpState: OtpState;
  onSendOtp: (email: string) => Promise<boolean>;
  onVerifyOtp: (email: string, code: string) => Promise<boolean>;
  onEditEmail?: () => void;
  /** Called when the 5-minute verified window ends so the caller can re-check. */
  onExpire?: () => void;
  className?: string;
}

export const LeaderEmailOtpArea: React.FC<LeaderEmailOtpAreaProps> = ({
  email,
  isVerified,
  otpState,
  onSendOtp,
  onVerifyOtp,
  onExpire,
  className,
}) => {
  const [code, setCode] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const expiredRef = useRef(false);
  const verifiedAt = otpState.verifiedAt;

  useEffect(() => {
    if (!isVerified || !verifiedAt) {
      setRemaining(null);
      return;
    }
    expiredRef.current = false;
    const tick = () => {
      const left = Math.max(
        0,
        VERIFIED_WINDOW_SECONDS - Math.floor((Date.now() - verifiedAt) / 1000),
      );
      setRemaining(left);
      if (left === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVerified, verifiedAt]);

  // Clear the typed code once a new OTP flow starts
  useEffect(() => {
    if (!otpState.otpSent) setCode("");
  }, [otpState.otpSent]);

  const handleVerify = () => {
    if (code.trim().length === 6) {
      onVerifyOtp(email, code.trim());
    }
  };

  const handleCodeChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(cleaned);
    if (cleaned.length === 6) {
      onVerifyOtp(email, cleaned);
    }
  };

  // State 1: Verified (Minimal inline row)
  if (isVerified) {
    return (
      <div className={cn("flex items-center justify-between py-2.5 text-xs border-y border-white/[0.08]", className)}>
        <span className="text-neutral-400">Leader Email</span>
        <div className="flex items-center gap-1.5 font-mono text-white text-xs">
          <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          <span>Verified</span>
          {remaining !== null && (
            <span className="text-neutral-500">
              · {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>
    );
  }

  // State 2: Unverified (Minimal input & B/W action)
  return (
    <div className={cn("py-3 border-y border-white/[0.08] space-y-2.5 text-xs", className)}>
      <div className="flex items-center justify-between text-neutral-400">
        <span>Email Verification</span>
        <span className="font-mono text-neutral-300 truncate max-w-[190px]" title={email}>
          {email}
        </span>
      </div>

      {!otpState.otpSent ? (
        <button
          type="button"
          onClick={() => onSendOtp(email)}
          disabled={otpState.isSending}
          className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-semibold tracking-tight transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          {otpState.isSending ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin text-black" />
              <span>Sending OTP...</span>
            </>
          ) : (
            <span>Send OTP</span>
          )}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/15 focus:border-white focus:outline-none font-mono text-xs tracking-widest text-center text-white placeholder-neutral-600 transition-colors"
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={code.length !== 6 || otpState.isVerifying}
              className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 disabled:opacity-30 text-black text-xs font-semibold tracking-tight transition-all cursor-pointer"
            >
              {otpState.isVerifying ? (
                <RefreshCw className="w-3 h-3 animate-spin text-black" />
              ) : (
                <span>Verify</span>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Enter 6-digit code</span>
            <button
              type="button"
              disabled={
                Boolean(otpState.cooldownSeconds && otpState.cooldownSeconds > 0) ||
                otpState.isSending
              }
              onClick={() => onSendOtp(email)}
              className={cn(
                "transition-colors",
                otpState.cooldownSeconds && otpState.cooldownSeconds > 0
                  ? "text-neutral-500 cursor-not-allowed"
                  : "text-white hover:underline cursor-pointer"
              )}
            >
              {otpState.cooldownSeconds && otpState.cooldownSeconds > 0
                ? `Resend in ${otpState.cooldownSeconds}s`
                : "Resend"}
            </button>
          </div>
        </div>
      )}

      {otpState.error && (
        <p className="text-[11px] text-rose-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{otpState.error}</span>
        </p>
      )}
    </div>
  );
};
