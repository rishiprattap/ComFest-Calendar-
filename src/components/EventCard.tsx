"use client";

import React from "react";
import { EventScheduleItem } from "@/lib/types";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { Calendar, Clock, MapPin, Tag, Download } from "lucide-react";

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

  return (
    <div className={`glass-card event-card ${venueClass}`} id={`event-card-${item.id}`}>
      <div>
        <div className="card-top">
          <div>
            <h3 className="card-title">{item.event_name}</h3>
            {item.sub_round && (
              <div className="card-round">{item.sub_round}</div>
            )}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {participantBadge === "registered" && (
              <span className="badge" style={{ background: "rgba(0, 240, 255, 0.18)", color: "var(--accent-cyan)", border: "1px solid rgba(0, 240, 255, 0.5)", fontWeight: 700 }}>
                ⭐ My Event
              </span>
            )}
            {participantBadge === "common" && (
              <span className="badge" style={{ background: "rgba(168, 85, 247, 0.18)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.5)", fontWeight: 700 }}>
                🌟 Common
              </span>
            )}
            {showDayBadge && (
              <span className="badge badge-general" style={{ background: "rgba(255,255,255,0.06)" }}>
                {item.day === 0 ? "Online" : `Day ${item.day}`}
              </span>
            )}
            <span className={`badge ${catBadge}`}>{item.category}</span>
          </div>
        </div>

        <div className="meta-row" style={{ marginTop: "12px", marginBottom: "10px" }}>
          <div className="meta-item">
            <Clock size={15} style={{ color: "var(--accent-cyan)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{item.time_range}</span>
          </div>
          <div className="meta-item">
            <MapPin size={15} style={{ color: "#38bdf8" }} />
            <span style={{ fontWeight: 600 }}>{item.venue}</span>
          </div>
          <div className="meta-item" style={{ fontSize: "0.82rem", color: "var(--text-dim)" }}>
            <Calendar size={14} />
            <span>{item.date_formatted}</span>
          </div>
        </div>

        {item.description && (
          <p className="card-desc">{item.description}</p>
        )}
      </div>

      <div className="card-actions">
        <a
          href={gcalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cal"
          id={`btn-add-gcal-${item.id}`}
          title="Add this event to your Google Calendar"
        >
          <Calendar size={14} /> + Add to Google Calendar
        </a>

        <a
          href={`/api/calendar/ics?scheduleId=${encodeURIComponent(item.id)}`}
          className="btn-secondary btn-sm"
          id={`btn-download-ics-${item.id}`}
          title="Download .ics file for Apple/Outlook/Phone Calendar"
          download
        >
          <Download size={13} /> .ICS
        </a>
      </div>
    </div>
  );
}
