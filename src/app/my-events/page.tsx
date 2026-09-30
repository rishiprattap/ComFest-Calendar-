"use client";

import React, { useState } from "react";
import { ParticipantLookupResult, EventScheduleItem } from "@/lib/types";
import EventCard from "@/components/EventCard";
import VenueLegend from "@/components/VenueLegend";
import {
  Search,
  Calendar,
  AlertTriangle,
  UserCheck,
  Download,
  ExternalLink,
  Sparkles,
  HelpCircle,
  School,
  GraduationCap,
} from "lucide-react";
import { generateGoogleCalendarUrl } from "@/lib/calendar";

export default function MyEventsPage() {
  const [nameInput, setNameInput] = useState("");
  const [identifierInput, setIdentifierInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParticipantLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMultiGCalModal, setShowMultiGCalModal] = useState(false);

  const handleSearch = async (e?: React.FormEvent, customIdentifier?: string) => {
    if (e) e.preventDefault();
    if (!nameInput.trim()) {
      setErrorMessage("Please enter your registered participant name.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/participants/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.trim(),
          identifier: customIdentifier !== undefined ? customIdentifier : identifierInput.trim() || undefined,
        }),
      });

      const data: ParticipantLookupResult = await res.json();
      setResult(data);

      if (data.status === "not_found") {
        setErrorMessage(data.message || "No registered participant found.");
      }
    } catch (err: any) {
      setErrorMessage("Failed to search participant. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickName = (name: string) => {
    setNameInput(name);
    setIdentifierInput("");
    setResult(null);
    setErrorMessage("");
    // Trigger immediate search
    setTimeout(() => {
      fetch("/api/participants/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
        .then((res) => res.json())
        .then((data) => setResult(data))
        .catch(() => setErrorMessage("Lookup error"));
    }, 50);
  };

  // Flatten all scheduled sessions for the participant
  const allParticipantSchedules: EventScheduleItem[] = [];
  if (result?.status === "found" && result.events) {
    for (const ev of result.events) {
      if (ev.schedule && ev.schedule.length > 0) {
        allParticipantSchedules.push(...ev.schedule);
      }
    }
  }

  return (
    <div style={{ padding: "3rem 0 5rem" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div className="hero-pill" style={{ margin: "0 auto 1rem" }}>
            <UserCheck size={14} /> PARTICIPANT ITINERARY PORTAL
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            <span className="gradient-text">Find My Events</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto" }}>
            Enter your registered name to retrieve your personalized festival schedule, official venues, and Google Calendar sync.
          </p>
        </div>

        {/* Search Card */}
        <div className="glass-card" style={{ marginBottom: "2.5rem", border: "1px solid var(--border-glow)" }}>
          <form onSubmit={(e) => handleSearch(e)} id="find-my-events-form">
            <div className="form-group">
              <label htmlFor="participant-name-input" className="form-label" style={{ fontSize: "0.95rem" }}>
                Full Registered Name
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  id="participant-name-input"
                  className="form-input"
                  placeholder="e.g. Rishi Pratap Singh, Saksham Mishra, Aditya Verma..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{ paddingLeft: "42px", fontSize: "1.05rem" }}
                  autoComplete="off"
                />
                <Search
                  size={18}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--accent-cyan)" }}
                />
              </div>
            </div>

            {/* If multiple matches were returned, show identifier input */}
            {result?.status === "multiple_matches" && (
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  marginBottom: "1.25rem",
                }}
                id="multiple-matches-prompt"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--accent-amber)", fontWeight: 700, marginBottom: "6px" }}>
                  <AlertTriangle size={18} />
                  <span>Multiple Participants Found ({result.count})</span>
                </div>
                <p style={{ fontSize: "0.9rem", color: "#fef3c7", marginBottom: "12px", lineHeight: "1.5" }}>
                  {result.message}
                </p>

                <div className="form-group" style={{ marginBottom: "10px" }}>
                  <label htmlFor="participant-identifier-input" className="form-label" style={{ color: "#fef3c7" }}>
                    Confirm Your Email, Phone Number, or Class:
                  </label>
                  <input
                    type="text"
                    id="participant-identifier-input"
                    className="form-input"
                    placeholder="Enter registered email, phone, or class (e.g. XII or XI)"
                    value={identifierInput}
                    onChange={(e) => setIdentifierInput(e.target.value)}
                    style={{ borderColor: "rgba(245, 158, 11, 0.5)" }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }}
              disabled={loading}
              id="btn-search-my-events"
            >
              {loading ? (
                "Searching Participant Database..."
              ) : (
                <>
                  <Search size={18} /> Find My Events
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pill Bar */}
          <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "0.82rem", color: "var(--text-dim)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Quick Test Examples from Registration Sheet:
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                "Rishi Pratap Singh",
                "Saksham Mishra",
                "Aditya Verma",
                "Ayushi Verma",
                "Sambhav Yadav",
                "Kanishka Chanpuriya",
              ].map((demoName) => (
                <button
                  key={demoName}
                  type="button"
                  onClick={() => handleQuickName(demoName)}
                  className="btn-secondary btn-sm"
                  style={{ fontSize: "0.8rem", padding: "4px 10px" }}
                >
                  {demoName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            className="glass-card"
            style={{
              borderColor: "rgba(244, 63, 94, 0.4)",
              background: "rgba(244, 63, 94, 0.08)",
              textAlign: "center",
              padding: "1.75rem",
              marginBottom: "2rem",
            }}
            id="lookup-error-message"
          >
            <AlertTriangle size={24} style={{ color: "#f43f5e", margin: "0 auto 8px" }} />
            <h3 style={{ fontSize: "1.1rem", color: "#fff", marginBottom: "4px" }}>Participant Not Found</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>{errorMessage}</p>
          </div>
        )}

        {/* RESULTS SECTION */}
        {result?.status === "found" && result.participant && (
          <div id="participant-results-section">
            {/* Participant Profile Banner */}
            <div
              className="glass-card"
              style={{
                background: "linear-gradient(135deg, rgba(13, 27, 68, 0.8) 0%, rgba(7, 13, 36, 0.9) 100%)",
                border: "1px solid var(--border-glow)",
                marginBottom: "2rem",
                padding: "2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span className="badge badge-technical">Registered Contender</span>
                    {result.participant.class && (
                      <span className="badge badge-general">Class {result.participant.class}</span>
                    )}
                  </div>

                  <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#fff", marginBottom: "6px" }}>
                    {result.participant.name}
                  </h2>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <School size={15} style={{ color: "var(--accent-cyan)" }} />
                      {result.participant.school}
                    </span>
                  </div>
                </div>

                {/* BIG PROMINENT ACTION: ADD MY EVENTS TO GOOGLE CALENDAR */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "260px" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      padding: "14px 22px",
                      fontSize: "1rem",
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                    }}
                    onClick={() => setShowMultiGCalModal(true)}
                    id="btn-add-my-events-to-google-calendar"
                  >
                    <Calendar size={18} /> [ ADD MY EVENTS TO GOOGLE CALENDAR ]
                  </button>

                  <a
                    href={`/api/calendar/ics?name=${encodeURIComponent(result.participant.name)}`}
                    className="btn-secondary"
                    style={{ justifyContent: "center", fontSize: "0.88rem" }}
                    download
                    id="btn-download-all-ics"
                  >
                    <Download size={14} /> Download Calendar File (.ICS)
                  </a>
                </div>
              </div>
            </div>

            {/* Official Venue Legend */}
            <VenueLegend />

            {/* Events List */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>
                Registered Events ({result.events?.length || 0})
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                Displaying ONLY the events that <strong>{result.participant.name}</strong> is registered for.
              </p>
            </div>

            {result.events && result.events.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {result.events.map((ev) => (
                  <div
                    key={ev.eventId}
                    className="glass-card"
                    style={{ padding: "1.75rem", borderLeft: "4px solid var(--accent-cyan)" }}
                    id={`registered-event-${ev.eventId}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span className="badge badge-flagship">{ev.category}</span>
                          <span className="badge badge-general">Device: {ev.deviceAllowance}</span>
                        </div>
                        <h4 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                          {ev.eventName}
                        </h4>
                      </div>
                    </div>

                    {/* Schedule slots for this event */}
                    {ev.schedule && ev.schedule.length > 0 ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginTop: "10px" }}>
                        {ev.schedule.map((sch) => (
                          <EventCard key={sch.id} item={sch} showDayBadge={true} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "var(--text-dim)", fontSize: "0.88rem", fontStyle: "italic" }}>
                        No on-campus timetable clash or event is conducted online/pre-fest.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "var(--text-muted)" }}>No event registrations currently linked to this participant.</p>
              </div>
            )}
          </div>
        )}

        {/* MODAL: ADD MY EVENTS TO GOOGLE CALENDAR */}
        {showMultiGCalModal && result?.participant && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(2, 6, 23, 0.85)",
              backdropFilter: "blur(10px)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            id="multi-gcal-modal"
          >
            <div
              className="glass-card"
              style={{
                maxWidth: "600px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid var(--border-glow)",
                padding: "2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>
                  Add Events to Google Calendar
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMultiGCalModal(false)}
                  style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
                >
                  &times;
                </button>
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                Google Calendar allows importing your entire festival schedule in one click via <strong>.ICS download</strong>, or you can add each event individually below:
              </p>

              {/* 1-Click All Events Download */}
              <div
                style={{
                  background: "rgba(0, 240, 255, 0.08)",
                  border: "1px solid rgba(0, 240, 255, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--accent-cyan)", marginBottom: "4px" }}>
                  Recommended: Sync All Events At Once
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Downloads <code>comfest26-{result.participant.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics</code> containing all your registered rounds.
                </p>
                <a
                  href={`/api/calendar/ics?name=${encodeURIComponent(result.participant.name)}`}
                  className="btn-primary"
                  style={{ width: "100%" }}
                  download
                >
                  <Download size={16} /> Download All My Events (.ICS)
                </a>
              </div>

              {/* Individual 1-Click Links */}
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: "10px" }}>
                Or Add Events Individually:
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {allParticipantSchedules.map((sch) => {
                  const url = generateGoogleCalendarUrl({
                    eventName: sch.event_name,
                    subRound: sch.sub_round,
                    date: sch.date,
                    startTime: sch.start_time,
                    endTime: sch.end_time,
                    venue: sch.venue,
                    description: sch.description,
                  });
                  return (
                    <div
                      key={sch.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "rgba(3, 7, 18, 0.6)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-dim)",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>
                          {sch.event_name} {sch.sub_round && `(${sch.sub_round})`}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                          {sch.date_formatted} &bull; {sch.time_range} &bull; {sch.venue}
                        </div>
                      </div>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cal btn-sm"
                      >
                        <Calendar size={13} /> Add
                      </a>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "1.75rem", textAlign: "right" }}>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setShowMultiGCalModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
