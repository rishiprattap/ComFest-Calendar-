"use client";

import React from "react";
import {
  Calendar,
  Download,
  X,
  CheckCircle,
} from "lucide-react";

interface AddCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName?: string;
}

export default function AddCalendarModal({
  isOpen,
  onClose,
  participantName,
}: AddCalendarModalProps) {
  if (!isOpen) return null;

  const downloadUrl = participantName
    ? `/api/calendar/ics?name=${encodeURIComponent(participantName)}`
    : "/api/calendar/ics";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(2, 6, 23, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        boxSizing: "border-box",
      }}
      id="add-comfest-calendar-modal"
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: "520px",
          width: "100%",
          maxHeight: "92vh",
          overflowY: "auto",
          border: "1px solid var(--accent-cyan)",
          boxShadow: "0 0 35px rgba(0, 240, 255, 0.25)",
          padding: "1.25rem",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                minWidth: "40px",
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
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--accent-cyan)",
                  fontWeight: 800,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                OFFICIAL FESTIVAL SCHEDULE
              </div>
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: "#fff",
                  margin: 0,
                  wordBreak: "break-word",
                }}
              >
                {participantName
                  ? `${participantName}'s Schedule`
                  : "COMFEST'26 Calendar"}
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
              padding: "8px",
              minHeight: "44px",
              minWidth: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            id="btn-close-calendar-modal"
            aria-label="Close modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* PRIMARY DOWNLOAD BUTTON */}
        <div style={{ marginBottom: "1.25rem" }}>
          <a
            href={downloadUrl}
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "14px 18px",
              fontSize: "1rem",
              fontWeight: 800,
              minHeight: "48px",
              boxSizing: "border-box",
              textAlign: "center",
            }}
            download
            id="btn-modal-download-ics"
          >
            <Download size={18} />{" "}
            {participantName
              ? "Add My Events to Calendar"
              : "Download Calendar (.ICS)"}
          </a>
        </div>

        {/* VISUAL & CLEAR STEP INSTRUCTIONS */}
        <div
          style={{
            background: "rgba(3, 7, 18, 0.8)",
            border: "1px solid var(--border-glow)",
            borderRadius: "var(--radius-md)",
            padding: "1.1rem",
            marginBottom: "1rem",
            boxSizing: "border-box",
          }}
          id="calendar-instructions-section"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              color: "var(--accent-cyan)",
              fontWeight: 800,
              fontSize: "0.92rem",
              letterSpacing: "0.5px",
            }}
          >
            <span>📅 HOW TO ADD YOUR EVENTS TO GOOGLE CALENDAR</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontSize: "0.86rem",
            }}
          >
            {/* Step 1 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span
                style={{
                  color: "var(--accent-cyan)",
                  fontWeight: 900,
                  fontSize: "1rem",
                  lineHeight: 1.2,
                }}
              >
                ①
              </span>
              <div>
                <strong style={{ color: "#fff", display: "block" }}>
                  Download your calendar
                </strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  Tap &ldquo;Add My Events to Calendar&rdquo;. Your .ics calendar file will be downloaded.
                </span>
              </div>
            </div>

            <div
              style={{
                paddingLeft: "6px",
                color: "var(--text-dim)",
                fontSize: "0.75rem",
                lineHeight: 1,
              }}
            >
              ↓
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span
                style={{
                  color: "var(--accent-cyan)",
                  fontWeight: 900,
                  fontSize: "1rem",
                  lineHeight: 1.2,
                }}
              >
                ②
              </span>
              <div>
                <strong style={{ color: "#fff", display: "block" }}>
                  Open the downloaded file
                </strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  Open the downloaded .ics file from your phone&apos;s Downloads folder.
                </span>
              </div>
            </div>

            <div
              style={{
                paddingLeft: "6px",
                color: "var(--text-dim)",
                fontSize: "0.75rem",
                lineHeight: 1,
              }}
            >
              ↓
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span
                style={{
                  color: "var(--accent-cyan)",
                  fontWeight: 900,
                  fontSize: "1rem",
                  lineHeight: 1.2,
                }}
              >
                ③
              </span>
              <div>
                <strong style={{ color: "#fff", display: "block" }}>
                  Open with Google Calendar
                </strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  Choose Google Calendar when your phone asks which app to use.
                </span>
              </div>
            </div>

            <div
              style={{
                paddingLeft: "6px",
                color: "var(--text-dim)",
                fontSize: "0.75rem",
                lineHeight: 1,
              }}
            >
              ↓
            </div>

            {/* Step 4 */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span
                style={{
                  color: "var(--accent-cyan)",
                  fontWeight: 900,
                  fontSize: "1rem",
                  lineHeight: 1.2,
                }}
              >
                ④
              </span>
              <div>
                <strong style={{ color: "#fff", display: "block" }}>
                  Add the events
                </strong>
                <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  Tap &ldquo;Add&rdquo; / &ldquo;Add to calendar&rdquo;.
                </span>
              </div>
            </div>

            {/* Done */}
            <div
              style={{
                marginTop: "6px",
                padding: "8px 12px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.35)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle
                size={16}
                style={{ color: "var(--accent-green)", minWidth: "16px" }}
              />
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "#e6fffa",
                  fontWeight: 700,
                }}
              >
                ✓ Done! Your COMFEST events will now appear in your Google Calendar.
              </span>
            </div>
          </div>
        </div>

        {/* Small Notes */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginBottom: "1rem",
            padding: "0 4px",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--accent-cyan)",
              margin: 0,
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            &bull; Your calendar will contain only the COMFEST events you are registered for.
          </p>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-dim)",
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            &bull; Google Calendar may show the import option differently depending on your phone and Android/iOS version.
          </p>
        </div>

        {/* Close Button */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "0.75rem",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={onClose}
            style={{ minHeight: "44px", padding: "0 20px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
