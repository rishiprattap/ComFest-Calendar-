"use client";

import React, { useState, useMemo } from "react";
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
  School,
  Coffee,
  Trophy,
  Layers,
  Clock,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { generateGoogleCalendarUrl } from "@/lib/calendar";

type ViewTab = "all" | "competitions" | "common";
type ModalTab = "all" | "competitions" | "common";

export default function MyEventsPage() {
  const [nameInput, setNameInput] = useState("");
  const [identifierInput, setIdentifierInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParticipantLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showMultiGCalModal, setShowMultiGCalModal] = useState(false);

  // Filter tabs
  const [activeTab, setActiveTab] = useState<ViewTab>("all");
  const [dayFilter, setDayFilter] = useState<number | "all">("all");
  const [modalTab, setModalTab] = useState<ModalTab>("all");

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

  // 1. Participant's Registered Competition Schedules
  const registeredSchedules = useMemo(() => {
    const list: EventScheduleItem[] = [];
    if (result?.status === "found" && result.events) {
      for (const ev of result.events) {
        if (ev.schedule && ev.schedule.length > 0) {
          list.push(...ev.schedule);
        }
      }
    }
    return list;
  }, [result]);

  // Set of registered schedule IDs for tagging
  const registeredScheduleIds = useMemo(() => {
    return new Set(registeredSchedules.map((s) => s.id));
  }, [registeredSchedules]);

  // 2. Common Festival Schedules (Ceremonies, Meals, Socials)
  const commonSchedules = useMemo(() => {
    if (result?.status === "found" && result.commonEvents) {
      return result.commonEvents;
    }
    return [];
  }, [result]);

  // 3. Merged Unified Timeline (Registered + Common) sorted chronologically
  const unifiedTimeline = useMemo(() => {
    const map = new Map<string, { item: EventScheduleItem; type: "registered" | "common" }>();

    // Add registered items
    for (const item of registeredSchedules) {
      map.set(item.id, { item, type: "registered" });
    }

    // Add common items
    for (const item of commonSchedules) {
      if (!map.has(item.id)) {
        map.set(item.id, { item, type: "common" });
      }
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => {
      if (a.item.day !== b.item.day) return a.item.day - b.item.day;
      return a.item.start_time.localeCompare(b.item.start_time);
    });

    return merged;
  }, [registeredSchedules, commonSchedules]);

  // Filtered timeline based on view tab & day filter
  const displayedTimeline = useMemo(() => {
    return unifiedTimeline.filter(({ item, type }) => {
      // Tab filter
      if (activeTab === "competitions" && type !== "registered") return false;
      if (activeTab === "common" && type !== "common") return false;

      // Day filter
      if (dayFilter !== "all" && item.day !== dayFilter) return false;

      return true;
    });
  }, [unifiedTimeline, activeTab, dayFilter]);

  // Group displayed items by day
  const groupedByDay = useMemo(() => {
    const groups: { [key: number]: typeof displayedTimeline } = {};
    for (const entry of displayedTimeline) {
      const d = entry.item.day;
      if (!groups[d]) groups[d] = [];
      groups[d].push(entry);
    }
    return groups;
  }, [displayedTimeline]);

  // Modal schedule items based on modalTab
  const modalSchedules = useMemo(() => {
    if (modalTab === "competitions") return registeredSchedules;
    if (modalTab === "common") return commonSchedules;
    return unifiedTimeline.map((u) => u.item);
  }, [modalTab, registeredSchedules, commonSchedules, unifiedTimeline]);

  return (
    <div style={{ padding: "3rem 0 5rem" }}>
      <div className="container" style={{ maxWidth: "1050px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div className="hero-pill" style={{ margin: "0 auto 1rem" }}>
            <UserCheck size={14} /> PARTICIPANT ITINERARY & CALENDAR
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            <span className="gradient-text">Find My Events</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "650px", margin: "0 auto" }}>
            Search your registered name to view your complete festival itinerary — including your registered competition rounds plus all common ceremonies, lunch, and evening events.
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
                background: "linear-gradient(135deg, rgba(13, 27, 68, 0.85) 0%, rgba(7, 13, 36, 0.95) 100%)",
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

                  <h2 style={{ fontSize: "2.1rem", fontWeight: 900, color: "#fff", marginBottom: "6px" }}>
                    {result.participant.name}
                  </h2>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-muted)", fontSize: "0.95rem", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <School size={15} style={{ color: "var(--accent-cyan)" }} />
                      {result.participant.school}
                    </span>
                    <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                      &bull; {result.events?.length || 0} Registered Competitions
                    </span>
                    <span style={{ color: "#c084fc", fontWeight: 700 }}>
                      &bull; {commonSchedules.length} Common Ceremonies & Meals
                    </span>
                  </div>
                </div>

                {/* PROMINENT ACTION: ADD MY EVENTS TO GOOGLE CALENDAR */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "270px" }}>
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
                    title="Download complete festival schedule (.ics) for Apple/Outlook/Google Calendar"
                  >
                    <Download size={14} /> Download Complete Calendar (.ICS)
                  </a>
                </div>
              </div>
            </div>

            {/* Official Venue Legend */}
            <VenueLegend />

            {/* NAVIGATION / FILTER BAR */}
            <div
              className="glass-card"
              style={{
                marginBottom: "2rem",
                padding: "1.25rem 1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              {/* Category / Scope Filter Tabs */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`btn-sm ${activeTab === "all" ? "btn-primary" : "btn-secondary"}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Layers size={14} />
                  <span>All Events ({unifiedTimeline.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("competitions")}
                  className={`btn-sm ${activeTab === "competitions" ? "btn-primary" : "btn-secondary"}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Trophy size={14} />
                  <span>My Competitions ({registeredSchedules.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("common")}
                  className={`btn-sm ${activeTab === "common" ? "btn-primary" : "btn-secondary"}`}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Coffee size={14} />
                  <span>Ceremonies & Meals ({commonSchedules.length})</span>
                </button>
              </div>

              {/* Day Filter Pills */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-dim)", marginRight: "4px" }}>DAY:</span>
                {(["all", 1, 2, 3] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDayFilter(d)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: dayFilter === d ? "1px solid var(--accent-cyan)" : "1px solid rgba(255,255,255,0.1)",
                      background: dayFilter === d ? "rgba(0, 240, 255, 0.15)" : "rgba(255,255,255,0.03)",
                      color: dayFilter === d ? "var(--accent-cyan)" : "var(--text-muted)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {d === "all" ? "All Days" : `Day ${d}`}
                  </button>
                ))}
              </div>
            </div>

            {/* EVENT TYPE KEY / ANNOUNCEMENT */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "1.5rem",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Schedule Type:</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)", fontWeight: 700 }}>
                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "var(--accent-cyan)", boxShadow: "0 0 8px var(--accent-cyan)" }} />
                  ⭐ My Registered Event ({result.events?.length || 0} competitions)
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#c084fc", fontWeight: 700 }}>
                  <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#c084fc", boxShadow: "0 0 8px #c084fc)" }} />
                  🌟 Common Festival Event (Opening Ceremony, Lunch, Closing, etc.)
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
                Showing {displayedTimeline.length} events
              </div>
            </div>

            {/* UNIFIED TIMELINE BY DAY */}
            {displayedTimeline.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
                {Object.keys(groupedByDay)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((dayNum) => {
                    const dayEntries = groupedByDay[dayNum];
                    const dayDate = dayEntries[0]?.item.date_formatted || "";
                    return (
                      <div key={dayNum}>
                        {/* Day Header */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingBottom: "10px",
                            marginBottom: "18px",
                            borderBottom: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div
                              style={{
                                background: "var(--gradient-primary)",
                                color: "#000",
                                fontWeight: 900,
                                fontSize: "0.95rem",
                                padding: "4px 12px",
                                borderRadius: "var(--radius-sm)",
                              }}
                            >
                              {dayNum === 0 ? "PRE-FEST / ONLINE" : `DAY ${dayNum}`}
                            </div>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                              {dayDate}
                            </h3>
                          </div>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                            {dayEntries.length} {dayEntries.length === 1 ? "event" : "events"}
                          </span>
                        </div>

                        {/* Cards Grid */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
                            gap: "18px",
                          }}
                        >
                          {dayEntries.map(({ item, type }) => (
                            <EventCard
                              key={item.id}
                              item={item}
                              showDayBadge={false}
                              participantBadge={type}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ color: "var(--text-muted)" }}>No events match the selected filters.</p>
              </div>
            )}

            {/* REGISTERED COMPETITIONS BREAKDOWN OVERVIEW */}
            <div style={{ marginTop: "4rem", paddingTop: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <Trophy size={20} style={{ color: "var(--accent-amber)" }} />
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                    My Registered Competitions ({result.events?.length || 0})
                  </h3>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>
                  Detailed summary of the specific competitions registered under <strong>{result.participant.name}</strong>.
                </p>
              </div>

              {result.events && result.events.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {result.events.map((ev) => (
                    <div
                      key={ev.eventId}
                      className="glass-card"
                      style={{ padding: "1.5rem", borderLeft: "4px solid var(--accent-cyan)" }}
                      id={`registered-event-${ev.eventId}`}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span className="badge badge-flagship">{ev.category}</span>
                            <span className="badge badge-general">Device Allowance: {ev.deviceAllowance}</span>
                          </div>
                          <h4 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>
                            {ev.eventName}
                          </h4>
                        </div>
                      </div>

                      {/* Schedule slots for this event */}
                      {ev.schedule && ev.schedule.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginTop: "10px" }}>
                          {ev.schedule.map((sch) => (
                            <EventCard key={sch.id} item={sch} showDayBadge={true} participantBadge="registered" />
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: "var(--text-dim)", fontSize: "0.88rem", fontStyle: "italic" }}>
                          Online or pre-fest submission event.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card" style={{ textAlign: "center", padding: "2.5rem" }}>
                  <p style={{ color: "var(--text-muted)" }}>No event registrations currently linked to this participant.</p>
                </div>
              )}
            </div>
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
              background: "rgba(2, 6, 23, 0.88)",
              backdropFilter: "blur(12px)",
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
                maxWidth: "650px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid var(--border-glow)",
                padding: "2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={22} style={{ color: "var(--accent-cyan)" }} />
                  <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                    Add Events to Google Calendar
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMultiGCalModal(false)}
                  style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.4rem", lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "1.25rem", lineHeight: "1.5" }}>
                Keep your festival timetable organized! You can download your entire schedule (.ICS) to sync all sessions at once, or add events individually to Google Calendar below:
              </p>

              {/* 1-Click All Events Download Banner */}
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
                <div style={{ fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "4px", fontSize: "1rem" }}>
                  ⚡ Recommended: 1-Click Complete Festival Sync
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                  Includes all {registeredSchedules.length} registered competition rounds PLUS all {commonSchedules.length} common ceremonies and meals.
                </p>
                <a
                  href={`/api/calendar/ics?name=${encodeURIComponent(result.participant.name)}`}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  download
                >
                  <Download size={16} /> Download Complete Festival Calendar (.ICS)
                </a>
              </div>

              {/* Modal Tabs */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "8px" }}>
                <button
                  type="button"
                  onClick={() => setModalTab("all")}
                  style={{
                    background: modalTab === "all" ? "rgba(0, 240, 255, 0.15)" : "transparent",
                    color: modalTab === "all" ? "var(--accent-cyan)" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  All Events ({unifiedTimeline.length})
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("competitions")}
                  style={{
                    background: modalTab === "competitions" ? "rgba(0, 240, 255, 0.15)" : "transparent",
                    color: modalTab === "competitions" ? "var(--accent-cyan)" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  My Competitions ({registeredSchedules.length})
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("common")}
                  style={{
                    background: modalTab === "common" ? "rgba(0, 240, 255, 0.15)" : "transparent",
                    color: modalTab === "common" ? "var(--accent-cyan)" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 12px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Ceremonies & Meals ({commonSchedules.length})
                </button>
              </div>

              {/* Individual 1-Click Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                {modalSchedules.map((sch) => {
                  const isRegistered = registeredScheduleIds.has(sch.id);
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
                        background: "rgba(3, 7, 18, 0.7)",
                        borderRadius: "var(--radius-sm)",
                        border: isRegistered ? "1px solid rgba(0, 240, 255, 0.3)" : "1px solid var(--border-dim)",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>
                            {sch.event_name} {sch.sub_round && `(${sch.sub_round})`}
                          </span>
                          {isRegistered ? (
                            <span style={{ fontSize: "0.72rem", color: "var(--accent-cyan)", background: "rgba(0,240,255,0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                              Registered
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.72rem", color: "#c084fc", background: "rgba(192,132,252,0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                              Common
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginTop: "2px" }}>
                          Day {sch.day} &bull; {sch.time_range} &bull; {sch.venue}
                        </div>
                      </div>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cal btn-sm"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        <Calendar size={13} /> + Add
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
