"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";

interface TicketQrCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export const TicketQrCode: React.FC<TicketQrCodeProps> = ({
  value,
  size = 140,
  className = "",
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    QRCode.toDataURL(value, {
      width: Math.max(size * 2, 280),
      margin: 1,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate QR code using qrcode lib", err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        style={{ width: size + 16, height: size + 16 }}
        className="p-2 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0"
      >
        {loading || !dataUrl ? (
          <div
            style={{ width: size, height: size }}
            className="rounded-xl bg-neutral-200 animate-pulse flex items-center justify-center"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-300 animate-pulse" />
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={dataUrl}
            alt="Ticket QR Code"
            width={size}
            height={size}
            style={{ width: `${size}px`, height: `${size}px` }}
            className="block select-none rounded-lg"
            loading="eager"
          />
        )}
      </div>
    </div>
  );
};

export default TicketQrCode;
