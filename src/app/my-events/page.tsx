"use client";

import React, { useState } from "react";
import EventCard from "@/components/EventCard";
import AddCalendarModal from "@/components/AddCalendarModal";
import { EventScheduleItem } from "@/lib/types";
import {
  Search,
  Calendar,
  Download,
  CheckCircle,
  AlertCircle,
  User,
  School,
  X,
  Sparkles,
} from "lucide-react";

interface RegisteredEventItem {
  eventId: string;
  eventName: string;
  category: string;
  deviceAllowance?: string;
  schedule: EventScheduleItem[];
}

interface LookupSuccessResult {
  status: "found";
  participant: {
    id: string;
    name: string;
    class?: string;
    school: string;
    email?: string;
    phone?: string;
  };
  events: RegisteredEventItem[];
  commonEvents?: EventScheduleItem[];
}

export default function MyEventsPage() {
  const [nameInput, setNameInput] = useState("");
  const [identifierInput, setIdentifierInput] = useState("");
  const [requiresIdentifier, setRequiresIdentifier] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupSuccessResult | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [downloadTriggered, setDownloadTriggered] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = nameInput.trim();
    if (!query || query.length < 2) {
      setErrorMsg("Please enter at least 2 characters of your name.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setDownloadTriggered(false);

    try {
      const res = await fetch("/api/participants/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: query,
          identifier: identifierInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === "not_found") {
        setErrorMsg(
          data.message || `No participant matching "${query}" was found. Please check spelling or confirm with your school coordinator.`
        );
        setLookupResult(null);
        setRequiresIdentifier(false);
      } else if (data.status === "multiple_matches") {
        setRequiresIdentifier(true);
        setErrorMsg(
          `Multiple participants share the name "${query}". Please enter your registered Email, Phone, or Class to see your schedule.`
        );
        setLookupResult(null);
      } else if (data.status === "found") {
        setLookupResult(data);
        setRequiresIdentifier(false);
        setErrorMsg("");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Could not connect to the schedule server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCalendar = () => {
    if (!lookupResult?.participant?.name) return;
    setDownloadTriggered(true);

    const safeName = lookupResult.participant.name
      .trim()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-");
    const downloadUrl = `/api/calendar/ics?name=${encodeURIComponent(
      lookupResult.participant.name
    )}`;

    // Trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `COMFEST-2026-${safeName || "My"}-Events.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Also open modal showing the instructions
    setShowCalendarModal(true);
  };

  // Flatten registered event schedule items in chronological order
  const registeredScheduleItems: EventScheduleItem[] = [];
  if (lookupResult?.events) {
    for (const ev of lookupResult.events) {
      if (ev.schedule && ev.schedule.length > 0) {
        registeredScheduleItems.push(...ev.schedule);
      }
    }
    registeredScheduleItems.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.start_time.localeCompare(b.start_time);
    });
  }

  return (
    <div style={{ padding: "2rem 0 5rem" }}>
      <div className="container" style={{ maxWidth: "680px" }}>
        {/* HEADER SECTION */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            className="hero-pill"
            style={{ margin: "0 auto 0.75rem", fontSize: "0.78rem" }}
          >
            <Sparkles size={13} /> OFFICIAL PARTICIPANT SCHEDULE
          </div>
          <h1
            style={{
              fontSize: "2.2rem",
              fontWeight: 900,
              letterSpacing: "-0.5px",
              margin: "0 0 0.5rem 0",
            }}
          >
            <span className="gradient-text">MY EVENTS</span>
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.95rem",
              margin: "0 auto",
              maxWidth: "460px",
              lineHeight: "1.5",
            }}
          >
            Look up your registered competitions and export only your schedule to Google Calendar.
          </p>
        </div>

        {/* SEARCH FORM */}
        <div
          className="glass-card"
          style={{
            padding: "1.5rem",
            marginBottom: "1.75rem",
            border: "1px solid var(--border-glow)",
          }}
          id="participant-search-box"
        >
          <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                htmlFor="input-participant-name"
                style={{
                  display: "block",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  color: "#f8fafc",
                  marginBottom: "8px",
                }}
              >
                Enter your registered name
              </label>
              <div style={{ position: "relative" }}>
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--accent-cyan)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="text"
                  id="input-participant-name"
                  className="form-input"
                  placeholder="e.g. Rishi Pratap Singh"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{
                    paddingLeft: "42px",
                    fontSize: "1rem",
                    minHeight: "48px",
                  }}
                  autoFocus
                />
                {nameInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput("");
                      setLookupResult(null);
                      setErrorMsg("");
                    }}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-dim)",
                      cursor: "pointer",
                      padding: "8px",
                    }}
                    aria-label="Clear input"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {requiresIdentifier && (
              <div>
                <label
                  htmlFor="input-participant-identifier"
                  style={{
                    display: "block",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--accent-amber)",
                    marginBottom: "6px",
                  }}
                >
                  Confirm registered Email, Phone, or Class:
                </label>
                <input
                  type="text"
                  id="input-participant-identifier"
                  className="form-input"
                  placeholder="Enter email, phone, or class"
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  style={{
                    borderColor: "var(--accent-amber)",
                    minHeight: "48px",
                  }}
                />
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="submit"
              className="btn-primary"
              id="btn-find-my-events"
              disabled={loading}
              style={{
                width: "100%",
                minHeight: "48px",
                fontSize: "1.05rem",
                fontWeight: 800,
                letterSpacing: "0.5px",
                justifyContent: "center",
              }}
            >
              {loading ? "SEARCHING..." : "FIND MY EVENTS"}
            </button>
          </form>

          {/* Quick Demo Suggestions for easy testing */}
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "block", marginBottom: "6px" }}>
              Quick test names from registration:
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["Rishi Pratap Singh", "Saksham Mishra", "Aditya Verma"].map((demoName) => (
                <button
                  key={demoName}
                  type="button"
                  onClick={() => {
                    setNameInput(demoName);
                    setIdentifierInput("");
                    setRequiresIdentifier(false);
                    setErrorMsg("");
                  }}
                  style={{
                    background: "rgba(0, 240, 255, 0.08)",
                    border: "1px solid rgba(0, 240, 255, 0.25)",
                    borderRadius: "var(--radius-full)",
                    color: "var(--accent-cyan)",
                    fontSize: "0.78rem",
                    padding: "4px 10px",
                    cursor: "pointer",
                    minHeight: "32px",
                  }}
                >
                  {demoName}
                </button>
              ))}
            </div>
          </div>

          {/* Error / Alert Message */}
          {errorMsg && (
            <div
              style={{
                marginTop: "1rem",
                padding: "12px 14px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                color: "#fca5a5",
                fontSize: "0.88rem",
              }}
              id="lookup-error-box"
            >
              <AlertCircle size={18} style={{ minWidth: "18px", marginTop: "2px" }} />
              <div>{errorMsg}</div>
            </div>
          )}
        </div>

        {/* RESULTS SECTION: YOUR COMFEST SCHEDULE */}
        {lookupResult && (
          <div id="participant-results-section">
            {/* Participant Profile Banner */}
            <div
              className="glass-card"
              style={{
                padding: "1.25rem",
                marginBottom: "1.5rem",
                border: "1px solid var(--accent-cyan)",
                background: "rgba(11, 23, 57, 0.8)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    minWidth: "42px",
                    borderRadius: "var(--radius-full)",
                    background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#030712",
                    fontWeight: 900,
                    fontSize: "1.1rem",
                  }}
                >
                  <User size={22} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "#fff",
                      margin: 0,
                    }}
                    id="participant-name-heading"
                  >
                    {lookupResult.participant.name}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "var(--accent-cyan)",
                      fontSize: "0.85rem",
                      marginTop: "2px",
                    }}
                  >
                    <School size={14} />
                    <span>{lookupResult.participant.school}</span>
                    {lookupResult.participant.class && (
                      <span>&bull; Class {lookupResult.participant.class}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Full-Width Action Button */}
              <div style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={handleDownloadCalendar}
                  className="btn-primary"
                  id="btn-add-my-events-to-calendar"
                  style={{
                    width: "100%",
                    minHeight: "48px",
                    fontSize: "1.02rem",
                    fontWeight: 900,
                    letterSpacing: "0.5px",
                    justifyContent: "center",
                    padding: "14px 20px",
                  }}
                >
                  <Calendar size={18} /> 📅 ADD MY EVENTS TO CALENDAR
                </button>
              </div>

              {/* Small Note */}
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  margin: "8px 0 0 0",
                  textAlign: "center",
                }}
              >
                Your calendar will contain only the COMFEST events you are registered for.
              </p>
            </div>

            {/* HOW TO ADD TO GOOGLE CALENDAR (MOBILE-FRIENDLY COMPACT INSTRUCTION BOX) */}
            <div
              className="glass-card"
              style={{
                padding: "1.25rem",
                marginBottom: "2rem",
                border: "1px solid var(--border-glow)",
                background: "rgba(3, 7, 18, 0.85)",
              }}
              id="ics-instructions-box"
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
                }}
              >
                <Calendar size={18} />
                <span>HOW TO ADD YOUR EVENTS TO GOOGLE CALENDAR</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "0.86rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "var(--accent-cyan)", fontWeight: 900, fontSize: "1rem", lineHeight: 1.2 }}>
                    ①
                  </span>
                  <div>
                    <strong style={{ color: "#fff", display: "block" }}>Download your calendar</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      Tap &ldquo;Add My Events to Calendar&rdquo;.
                    </span>
                  </div>
                </div>

                <div style={{ paddingLeft: "6px", color: "var(--text-dim)", fontSize: "0.75rem", lineHeight: 1 }}>↓</div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "var(--accent-cyan)", fontWeight: 900, fontSize: "1rem", lineHeight: 1.2 }}>
                    ②
                  </span>
                  <div>
                    <strong style={{ color: "#fff", display: "block" }}>Open the downloaded file</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      Find the .ics file in your phone&apos;s Downloads folder.
                    </span>
                  </div>
                </div>

                <div style={{ paddingLeft: "6px", color: "var(--text-dim)", fontSize: "0.75rem", lineHeight: 1 }}>↓</div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "var(--accent-cyan)", fontWeight: 900, fontSize: "1rem", lineHeight: 1.2 }}>
                    ③
                  </span>
                  <div>
                    <strong style={{ color: "#fff", display: "block" }}>Open with Google Calendar</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      Choose Google Calendar when your phone asks which app to use.
                    </span>
                  </div>
                </div>

                <div style={{ paddingLeft: "6px", color: "var(--text-dim)", fontSize: "0.75rem", lineHeight: 1 }}>↓</div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{ color: "var(--accent-cyan)", fontWeight: 900, fontSize: "1rem", lineHeight: 1.2 }}>
                    ④
                  </span>
                  <div>
                    <strong style={{ color: "#fff", display: "block" }}>Add the events</strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      Tap &ldquo;Add&rdquo; / &ldquo;Add to calendar&rdquo;.
                    </span>
                  </div>
                </div>

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
                  <CheckCircle size={16} style={{ color: "var(--accent-green)", minWidth: "16px" }} />
                  <span style={{ fontSize: "0.82rem", color: "#e6fffa", fontWeight: 700 }}>
                    ✓ Done! Your COMFEST events will now appear in your Google Calendar.
                  </span>
                </div>
              </div>

              {/* Small Note Underneath */}
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-dim)",
                  marginTop: "12px",
                  marginBottom: 0,
                  lineHeight: "1.4",
                }}
              >
                Google Calendar may show the import option differently depending on your phone and Android/iOS version.
              </p>
            </div>

            {/* SCHEDULE HEADING */}
            <div style={{ marginBottom: "1.25rem" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.3px",
                  margin: 0,
                }}
                id="schedule-title-heading"
              >
                YOUR COMFEST SCHEDULE
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "4px" }}>
                Registered for {lookupResult.events.length} competition{lookupResult.events.length !== 1 ? "s" : ""} &bull; {registeredScheduleItems.length} scheduled session{registeredScheduleItems.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* VERTICALLY STACKED EVENT CARDS */}
            {registeredScheduleItems.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
                id="participant-events-stack"
              >
                {registeredScheduleItems.map((item) => (
                  <EventCard
                    key={item.id}
                    item={item}
                    participantBadge="registered"
                    showDayBadge={true}
                  />
                ))}
              </div>
            ) : (
              <div
                className="glass-card"
                style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}
              >
                <p style={{ color: "var(--text-muted)", margin: 0 }}>
                  You are registered for {lookupResult.events.map((e) => e.eventName).join(", ")}. Official slot timing will be updated soon.
                </p>
              </div>
            )}
          </div>
        )}

        {/* INSTRUCTION MODAL */}
        <AddCalendarModal
          isOpen={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          participantName={lookupResult?.participant?.name}
        />
      </div>
    </div>
  );
}
