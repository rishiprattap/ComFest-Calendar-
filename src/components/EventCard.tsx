"use client";

import React from "react";
import { EventScheduleItem } from "@/lib/types";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { Calendar, Clock, MapPin, Download } from "lucide-react";

interface EventCardProps {
  item: EventScheduleItem;
  showDayBadge?: boolean;
  participantBadge?: "registered" | "common";
}

export default function EventCard({ item, showDayBadge = true, participantBadge }: EventCardProps) {
  const gcalUrl = generateGoogleCalendarUrl({
    eventName: item.event_name,
    subRound: item.sub_round,
    date: item.date,
    startTime: item.start_time,
    endTime: item.end_time,
    venue: item.venue,
    description: item.description,
  });

  // Determine venue class for border accents
  let venueClass = "venue-Auditorium";
  if (item.venue.toLowerCase().includes("ground")) venueClass = "venue-Grounds";
  else if (item.venue.toLowerCase().includes("basket")) venueClass = "venue-Basketball";
  else if (item.venue.toLowerCase().includes("class")) venueClass = "venue-Classrooms";
  else if (item.venue.toLowerCase().includes("computer") || item.venue.toLowerCase().includes("lab")) venueClass = "venue-Computer";
  else if (item.venue.toLowerCase().includes("atl")) venueClass = "venue-ATL";

  // Category badge class
  let catBadge = "badge-general";
  const cat = item.category.toLowerCase();
  if (cat.includes("flagship")) catBadge = "badge-flagship";
  else if (cat.includes("tech")) catBadge = "badge-technical";
  else if (cat.includes("literary")) catBadge = "badge-literary";
  else if (cat.includes("business")) catBadge = "badge-business";
  else if (cat.includes("design")) catBadge = "badge-design";
  else if (cat.includes("gaming")) catBadge = "badge-gaming";
  else if (cat.includes("ceremony")) catBadge = "badge-flagship";
  else if (cat.includes("entertainment")) catBadge = "badge-literary";

  // Clean date text for top: e.g. "15 OCTOBER" or date_formatted
  const dateTop = item.date_formatted ? item.date_formatted.toUpperCase() : `DAY ${item.day}`;

  return (
    <div className={`glass-card event-card ${venueClass}`} id={`event-card-${item.id}`}>
      {/* Top: Date & Badges */}
      <div className="card-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--accent-cyan)", letterSpacing: "1px", textTransform: "uppercase" }}>
          {dateTop}
        </span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {participantBadge === "registered" && (
            <span className="badge" style={{ background: "rgba(0, 240, 255, 0.18)", color: "var(--accent-cyan)", border: "1px solid rgba(0, 240, 255, 0.5)", fontWeight: 700, fontSize: "0.72rem" }}>
              ⭐ My Event
            </span>
          )}
          {showDayBadge && (
            <span className="badge badge-general" style={{ background: "rgba(255,255,255,0.06)", fontSize: "0.72rem" }}>
              {item.day === 0 ? "Online" : `Day ${item.day}`}
            </span>
          )}
          <span className={`badge ${catBadge}`} style={{ fontSize: "0.72rem" }}>{item.category}</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <div style={{ marginBottom: "10px" }}>
        <h3 className="card-title" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", textTransform: "uppercase", margin: "0 0 4px 0" }}>
          {item.event_name}
        </h3>
        {item.sub_round && (
          <div className="card-round" style={{ fontSize: "0.9rem", color: "var(--accent-purple)", fontWeight: 600 }}>
            {item.sub_round}
          </div>
        )}
      </div>

      {/* Meta Row: Time & Venue */}
      <div className="meta-row" style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "8px 0 12px 0" }}>
        <div className="meta-item" style={{ fontSize: "0.92rem" }}>
          <Clock size={16} style={{ color: "var(--accent-cyan)", minWidth: "16px" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#f8fafc" }}>
            {item.time_range}
          </span>
        </div>
        <div className="meta-item" style={{ fontSize: "0.92rem" }}>
          <MapPin size={16} style={{ color: "#38bdf8", minWidth: "16px" }} />
          <span style={{ fontWeight: 600, color: "#e2e8f0" }}>
            {item.venue}
          </span>
        </div>
      </div>

      {item.description && (
        <p className="card-desc" style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "12px", lineHeight: "1.5" }}>
          {item.description}
        </p>
      )}

      {/* Actions: Minimum 44px tap targets */}
      <div className="card-actions" style={{ display: "flex", gap: "8px", alignItems: "stretch", paddingTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <a
          href={gcalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cal"
          id={`btn-add-gcal-${item.id}`}
          title="Add this event to your Google Calendar"
          style={{ flex: 1, justifyContent: "center", minHeight: "44px", padding: "10px 14px", fontSize: "0.88rem", fontWeight: 700 }}
        >
          <Calendar size={15} /> [ ADD TO CALENDAR ]
        </a>

        <a
          href={`/api/calendar/ics?scheduleId=${encodeURIComponent(item.id)}`}
          className="btn-secondary btn-sm"
          id={`btn-download-ics-${item.id}`}
          title="Download .ics file"
          download
          style={{ minHeight: "44px", minWidth: "44px", padding: "0 12px", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Download size={15} />
        </a>
      </div>
    </div>
  );
}
