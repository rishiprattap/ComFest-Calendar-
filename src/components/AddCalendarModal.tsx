"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";

interface AddCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCalendarModal({ isOpen, onClose }: AddCalendarModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== "undefined" ? window.location.host : "comfest-calendar.vercel.app";
  const protocol = typeof window !== "undefined" ? window.location.protocol : "https:";

  // Live feed URL
  const feedHttpsUrl = `https://${currentHost}/api/calendar/comfest26.ics`;
  const feedWebcalUrl = `webcal://${currentHost}/api/calendar/comfest26.ics`;

  // Check if a dedicated Google Calendar ID is provided in env
  const googleCalendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID;

  // Google Calendar 1-click subscribe URL
  const googleSubscribeUrl = googleCalendarId
    ? `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(googleCalendarId)}`
    : `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feedWebcalUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedHttpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(2, 6, 23, 0.88)",
        backdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      id="add-comfest-calendar-modal"
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          border: "1px solid var(--accent-cyan)",
          boxShadow: "0 0 40px rgba(0, 240, 255, 0.2)",
          padding: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "var(--radius-md)",
                background: "rgba(0, 240, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
              }}
            >
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
                OFFICIAL FESTIVAL CALENDAR
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#fff", margin: 0 }}>
                COMFEST&apos;26 Calendar
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
            }}
            id="btn-close-calendar-modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Calendar Scope Info */}
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
          Subscribe to the official <strong>COMFEST&apos;26</strong> calendar containing all official events from <strong>15–17 October 2026</strong>. Everyone subscribes to the same master calendar, keeping timings, venues, and ceremony updates synchronized.
        </p>

        {/* PRIMARY 1-CLICK ACTION */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(0, 240, 255, 0.14) 0%, rgba(168, 85, 247, 0.14) 100%)",
            border: "1px solid var(--accent-cyan)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "6px" }}>
            <Sparkles size={16} style={{ color: "var(--accent-cyan)" }} />
            <span style={{ fontWeight: 800, color: "#fff", fontSize: "1.05rem" }}>
              1-Click Google Calendar Subscription
            </span>
          </div>

          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "14px" }}>
            Opens Google Calendar with the official COMFEST&apos;26 calendar subscription prompt.
          </p>

          <a
            href={googleSubscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "1.05rem", fontWeight: 800 }}
            id="btn-subscribe-google-calendar"
          >
            <Calendar size={18} /> [ 📅 ADD TO GOOGLE CALENDAR ]
          </a>
        </div>

        {/* PHONE SYNC EXPLANATION (MANDATORY REQUIREMENT) */}
        <div
          style={{
            background: "rgba(3, 7, 18, 0.6)",
            border: "1px solid var(--border-glow)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
          id="phone-sync-explanation"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-cyan)", fontWeight: 800, marginBottom: "8px", fontSize: "0.95rem" }}>
            <Smartphone size={18} />
            <span>Automatic Phone Calendar Sync</span>
          </div>

          <p style={{ fontSize: "0.92rem", color: "#f8fafc", lineHeight: "1.5", margin: "0 0 10px 0" }}>
            &ldquo;Add the COMFEST&apos;26 calendar to Google Calendar. Once added, it will automatically appear on your phone wherever your Google Calendar is synced.&rdquo;
          </p>

          <div style={{ background: "rgba(0, 0, 0, 0.35)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: "0.82rem", color: "var(--text-dim)", lineHeight: "1.5" }}>
            <strong style={{ color: "var(--accent-cyan)" }}>📱 Mobile Tip:</strong> Open the Google Calendar app on your Android or iPhone &rarr; Tap Menu (☰) &rarr; Settings &rarr; Tap &ldquo;COMFEST&apos;26&rdquo; under your account &rarr; Turn on <strong>Sync</strong>.
          </div>
        </div>

        {/* ALTERNATIVE OPTIONS (APPLE CALENDAR / OUTLOOK / DIRECT ICS) */}
        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1.25rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px", fontWeight: 700 }}>
            Apple Calendar, Outlook & Other Apps:
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <a
              href="/api/calendar/ics"
              className="btn-secondary"
              style={{ justifyContent: "center", fontSize: "0.85rem", padding: "10px" }}
              download="comfest26-official.ics"
              id="btn-download-official-ics"
            >
              <Download size={15} /> Download .ICS File
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-secondary"
              style={{ justifyContent: "center", fontSize: "0.85rem", padding: "10px" }}
              id="btn-copy-feed-url"
            >
              {copied ? (
                <>
                  <Check size={15} style={{ color: "var(--accent-green)" }} /> Copied Link!
                </>
              ) : (
                <>
                  <Copy size={15} /> Copy Feed URL
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck size={14} style={{ color: "var(--accent-green)" }} /> Official Schedule &bull; Asia/Kolkata
          </span>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
