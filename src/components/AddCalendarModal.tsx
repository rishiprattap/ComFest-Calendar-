"use client";

import React, { useState, useEffect } from "react";
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
  Apple,
  Bot,
  Laptop,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface AddCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeviceTab = "ios" | "android" | "desktop";

export default function AddCalendarModal({ isOpen, onClose }: AddCalendarModalProps) {
  const [deviceTab, setDeviceTab] = useState<DeviceTab>("desktop");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        setDeviceTab("ios");
      } else if (/Android/i.test(ua)) {
        setDeviceTab("android");
      } else {
        setDeviceTab("desktop");
      }
    }
  }, []);

  if (!isOpen) return null;

  const currentHost = typeof window !== "undefined" ? window.location.host : "comfest-calendar.vercel.app";

  // Official live feed URLs
  const feedHttpsUrl = `https://${currentHost}/api/calendar/comfest26.ics`;
  const feedWebcalUrl = `webcal://${currentHost}/api/calendar/comfest26.ics`;

  // Optional custom Google Calendar ID from env
  const googleCalendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID;

  // Google Calendar desktop 1-click link
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
          maxWidth: "620px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          border: "1px solid var(--accent-cyan)",
          boxShadow: "0 0 40px rgba(0, 240, 255, 0.25)",
          padding: "1.75rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
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
              <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>
                OFFICIAL FESTIVAL CALENDAR
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", margin: 0 }}>
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

        {/* DEVICE SELECTOR TABS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "6px",
            background: "rgba(0, 0, 0, 0.4)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "1.5rem",
          }}
          role="tablist"
        >
          <button
            type="button"
            onClick={() => setDeviceTab("ios")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 6px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: deviceTab === "ios" ? "var(--gradient-primary)" : "transparent",
              color: deviceTab === "ios" ? "#000" : "var(--text-muted)",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span>iPhone / iPad</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceTab("android")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 6px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: deviceTab === "android" ? "var(--gradient-primary)" : "transparent",
              color: deviceTab === "android" ? "#000" : "var(--text-muted)",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => setDeviceTab("desktop")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 6px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: deviceTab === "desktop" ? "var(--gradient-primary)" : "transparent",
              color: deviceTab === "desktop" ? "#000" : "var(--text-muted)",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span>Laptop / PC</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: IPHONE / IPAD                                      */}
        {/* ======================================================== */}
        {deviceTab === "ios" && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
                border: "1px solid var(--accent-cyan)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>
                1-Tap Add to iPhone Calendar
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Tapping the button below opens the native iOS prompt. Tap <strong>&ldquo;Subscribe&rdquo;</strong> &rarr; <strong>&ldquo;Add&rdquo;</strong> to sync all 56 events into your phone calendar, lock screen, and widgets.
              </p>

              <a
                href={feedWebcalUrl}
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "15px",
                  fontSize: "1.05rem",
                  fontWeight: 900,
                  boxShadow: "0 0 25px rgba(0, 240, 255, 0.4)",
                }}
                id="btn-ios-subscribe"
              >
                <Calendar size={18} /> [ 📱 ADD TO IPHONE CALENDAR ]
              </a>
            </div>

            <div
              style={{
                background: "rgba(3, 7, 18, 0.6)",
                border: "1px solid var(--border-glow)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--accent-cyan)", marginBottom: "6px" }}>
                Using Google Calendar App on iPhone?
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: "1.5", margin: "0 0 8px 0" }}>
                Google Calendar for iOS does not allow adding URL feeds inside the mobile app. To see it in the Google Calendar app on your iPhone:
              </p>
              <ol style={{ fontSize: "0.82rem", color: "#f8fafc", paddingLeft: "18px", margin: 0, lineHeight: "1.6" }}>
                <li>Tap the <strong>[ ADD TO IPHONE CALENDAR ]</strong> button above (it syncs to your phone instantly).</li>
                <li>Or on your laptop, click <strong>&ldquo;Add to Google Calendar&rdquo;</strong> &mdash; once added on laptop, it automatically appears in the Google Calendar app on your phone!</li>
              </ol>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ANDROID PHONE                                     */}
        {/* ======================================================== */}
        {deviceTab === "android" && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)",
                border: "1px solid var(--accent-cyan)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>
                1-Tap Download & Open in Google Calendar
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Downloads the complete <strong>comfest26-official.ics</strong> file. When your phone asks, tap <strong>&ldquo;Open with Calendar&rdquo;</strong> &rarr; <strong>&ldquo;Add All Events&rdquo;</strong>.
              </p>

              <a
                href="/api/calendar/ics"
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "15px",
                  fontSize: "1.05rem",
                  fontWeight: 900,
                  boxShadow: "0 0 25px rgba(0, 240, 255, 0.4)",
                }}
                download="comfest26-official.ics"
                id="btn-android-download-ics"
              >
                <Download size={18} /> [ 📱 ADD TO ANDROID CALENDAR ]
              </a>
            </div>

            {/* Android Google Calendar Cloud Sync */}
            <div
              style={{
                background: "rgba(3, 7, 18, 0.6)",
                border: "1px solid var(--border-glow)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#34d399", marginBottom: "6px" }}>
                Want Live Auto-Updates in Google Calendar?
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: "1.5", marginBottom: "10px" }}>
                Subscribe via live URL so timing or venue changes update automatically:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-secondary btn-sm"
                  style={{ justifyContent: "center" }}
                  id="btn-android-copy-feed"
                >
                  {copied ? (
                    <>
                      <Check size={14} style={{ color: "var(--accent-green)" }} /> Copied Feed URL!
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy Feed URL
                    </>
                  )}
                </button>

                <a
                  href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-sm"
                  style={{ justifyContent: "center" }}
                  id="btn-android-open-gcal-url"
                >
                  <ExternalLink size={14} /> Open Google Calendar Settings
                </a>
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginTop: "8px" }}>
                Paste the copied feed URL into the &ldquo;URL of calendar&rdquo; box &rarr; tap <strong>Add calendar</strong>.
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: LAPTOP / PC                                       */}
        {/* ======================================================== */}
        {deviceTab === "desktop" && (
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
                border: "1px solid var(--accent-cyan)",
                borderRadius: "var(--radius-md)",
                padding: "1.5rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>
                1-Click Google Calendar Subscription
              </div>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Opens Google Calendar web with the official COMFEST&apos;26 subscription prompt. Click <strong>&ldquo;Add calendar&rdquo;</strong> to sync all 56 events.
              </p>

              <a
                href={googleSubscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "15px",
                  fontSize: "1.05rem",
                  fontWeight: 900,
                  boxShadow: "0 0 25px rgba(0, 240, 255, 0.4)",
                }}
                id="btn-desktop-subscribe-google"
              >
                <Calendar size={18} /> [ 📅 ADD TO GOOGLE CALENDAR ]
              </a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.25rem" }}>
              <a
                href="/api/calendar/ics"
                className="btn-secondary"
                style={{ justifyContent: "center", fontSize: "0.85rem", padding: "10px" }}
                download="comfest26-official.ics"
                id="btn-desktop-download-ics"
              >
                <Download size={15} /> Download .ICS File
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="btn-secondary"
                style={{ justifyContent: "center", fontSize: "0.85rem", padding: "10px" }}
                id="btn-desktop-copy-link"
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
        )}

        {/* ======================================================== */}
        {/* PHONE SYNC EXPLANATION (MANDATORY REQUIREMENT)           */}
        {/* ======================================================== */}
        <div
          style={{
            background: "rgba(3, 7, 18, 0.7)",
            border: "1px solid var(--border-glow)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            marginBottom: "1.25rem",
          }}
          id="phone-sync-explanation"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-cyan)", fontWeight: 800, marginBottom: "6px", fontSize: "0.95rem" }}>
            <Smartphone size={18} />
            <span>How Calendar Syncs to Your Phone</span>
          </div>

          <p style={{ fontSize: "0.92rem", color: "#f8fafc", lineHeight: "1.5", margin: "0 0 8px 0" }}>
            &ldquo;Add the COMFEST&apos;26 calendar to Google Calendar. Once added, it will automatically appear on your phone wherever your Google Calendar is synced.&rdquo;
          </p>

          <div style={{ background: "rgba(0, 0, 0, 0.35)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: "0.8rem", color: "var(--text-dim)", lineHeight: "1.5" }}>
            <strong style={{ color: "var(--accent-cyan)" }}>📱 Mobile Check:</strong> In the Google Calendar mobile app &rarr; Settings &rarr; Tap &ldquo;COMFEST&apos;26&rdquo; under your Google account &rarr; Ensure <strong>Sync</strong> is turned ON.
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
            <ShieldCheck size={14} style={{ color: "var(--accent-green)" }} /> All 56 Events &bull; Asia/Kolkata
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
