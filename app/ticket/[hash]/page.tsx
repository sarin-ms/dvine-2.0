"use client";

import React, { use, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download, AlertCircle, Home, ShieldCheck } from "lucide-react";
import { toPng } from "html-to-image";
import { registrationApi } from "../../register/services/registrationApi";
import { TicketDetailsResponse } from "../../register/types";
import { TicketQrCode } from "../components/TicketQrCode";

interface TicketPageProps {
  params: Promise<{ hash: string }>;
}

export default function TicketPage({ params }: TicketPageProps) {
  const { hash } = use(params);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [ticket, setTicket] = useState<TicketDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadTicket() {
      try {
        setLoading(true);
        setError(null);
        const data = await registrationApi.getTicket(hash);
        if (isMounted) {
          setTicket(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.message ||
              "Ticket not found or registration payment is pending. Please verify your link or check your email.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (hash) {
      loadTicket();
    }
    return () => {
      isMounted = false;
    };
  }, [hash]);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Crisp high-DPI image
      });
      const link = document.createElement("a");
      const name = ticket?.member?.firstName
        ? `${ticket.member.firstName}-${ticket.member.lastName || ""}`
        : "ticket";
      link.download = `dvine-${name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate ticket image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // State: Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] text-neutral-100 py-10 sm:py-16 px-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-[320px] mx-auto space-y-4">
          {/* Skeleton Nav */}
          <div className="flex items-center justify-between px-1">
            <div className="w-20 h-4 rounded bg-white/5 animate-pulse" />
          </div>

          {/* Skeleton Ticket Card */}
          <div className="w-full rounded-2xl border border-white/10 bg-[#0B0F17] p-6 shadow-2xl flex flex-col items-center text-center space-y-4">
            {/* Logo skeleton */}
            <div className="w-24 h-7 rounded-lg bg-white/5 animate-pulse" />

            {/* Delegate & Team skeleton */}
            <div className="space-y-1.5 flex flex-col items-center w-full">
              <div className="w-36 h-4 rounded bg-white/10 animate-pulse" />
              <div className="w-28 h-4 rounded bg-white/10 animate-pulse" />
            </div>

            {/* QR box skeleton */}
            <div className="p-2 rounded-2xl bg-white/10 animate-pulse my-1">
              <div className="w-[140px] h-[140px] rounded-xl bg-white/5" />
            </div>

            {/* Hash skeleton */}
            <div className="w-44 h-3 rounded bg-white/5 animate-pulse" />
          </div>

          {/* Download button skeleton */}
          <div className="w-full h-11 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  // State: Not Found or Error
  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#020817] text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm p-8 rounded-3xl border border-rose-500/20 bg-[#0E1118]/90 backdrop-blur-md text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              Ticket Not Available
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {error ||
                "This ticket could not be found or registration payment is pending."}
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { member, team } = ticket;
  const qrTarget =
    typeof window !== "undefined"
      ? window.location.href
      : `https://www.dvine.live/ticket/${ticket.ticketHash}`;

  return (
    <div className="min-h-screen bg-[#020817] text-neutral-100 py-10 sm:py-16 px-4 selection:bg-cyan-500/30 selection:text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-[320px] mx-auto space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>D&apos;VINE 2.0</span>
          </Link>
        </div>

        {/* ─── THE TICKET (Only Logo, Participant Name, QR, and Hash) ─── */}
        <motion.div
          ref={ticketRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full rounded-2xl border border-white/10 bg-[#0B0F17] p-6 shadow-2xl flex flex-col items-center text-center space-y-4"
        >
          {/* 1. D'VINE Logo */}
          <div className="w-full flex items-center justify-center pt-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dvine.svg"
              alt="D'VINE"
              className="h-7 w-auto object-contain select-none"
            />
          </div>

          {/* 2. Delegate & Team */}
          <div className="space-y-1 text-center">
            <p className="text-sm text-neutral-400 font-medium">
              Delegate:{" "}
              <span className="text-white font-semibold">
                {member.firstName} {member.lastName}
              </span>
            </p>
            {team?.teamName && (
              <p className="text-sm text-neutral-400 font-medium">
                Team:{" "}
                <span className="text-white font-semibold">
                  {team.teamName}
                </span>
              </p>
            )}
          </div>

          {/* 3. QR Code */}
          <div className="py-1">
            <TicketQrCode value={qrTarget} size={140} />
          </div>

          {/* 4. Hash */}
          <div className="w-full pt-0.5">
            <p className="font-mono text-[11px] text-neutral-400 tracking-wider break-all select-all">
              {ticket.ticketHash}
            </p>
          </div>
        </motion.div>

        {/* ─── DOWNLOAD BUTTON (Using html-to-image / dom-to-image) ─── */}
        <div className="pt-1 flex flex-col items-center">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all cursor-pointer shadow-lg active:scale-[0.99] disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              {isDownloading ? "Generating Image..." : "Download Ticket"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
