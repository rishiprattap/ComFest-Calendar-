"use client";

import React, { useState, useMemo } from "react";
import { EventScheduleItem } from "@/lib/types";
import EventCard from "./EventCard";
import VenueLegend from "./VenueLegend";
import { Search, Filter, Calendar, X } from "lucide-react";

interface ScheduleViewProps {
  initialSchedule: EventScheduleItem[];
  defaultDay?: number; // 1, 2, 3 or undefined for All
  title?: string;
  subtitle?: string;
}

export default function ScheduleView({
  initialSchedule,
  defaultDay,
  title = "Full Event Schedule",
  subtitle = "Official COMFEST'26 Timetable (15–17 October 2026) verified from brochure pages 25–27.",
}: ScheduleViewProps) {
  const [selectedDay, setSelectedDay] = useState<number | "all">(
    defaultDay !== undefined ? defaultDay : "all"
  );
  const [selectedVenue, setSelectedVenue] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract unique venues and categories
  const venues = useMemo(() => {
    const set = new Set<string>();
    initialSchedule.forEach((s) => set.add(s.venue));
    return ["All", ...Array.from(set).sort()];
  }, [initialSchedule]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialSchedule.forEach((s) => set.add(s.category));
    return ["All", ...Array.from(set).sort()];
  }, [initialSchedule]);

  // Filter logic
  const filteredItems = useMemo(() => {
    return initialSchedule.filter((item) => {
      // Day filter
      if (selectedDay !== "all" && item.day !== selectedDay) {
        return false;
      }
      // Venue filter
      if (selectedVenue !== "All" && item.venue.toLowerCase() !== selectedVenue.toLowerCase()) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "All" && item.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.event_name.toLowerCase().includes(q);
        const matchesDesc = (item.description || "").toLowerCase().includes(q);
        const matchesVenue = item.venue.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesVenue) {
          return false;
        }
      }
      return true;
    });
  }, [initialSchedule, selectedDay, selectedVenue, selectedCategory, searchQuery]);

  return (
    <div style={{ padding: "2.5rem 0 4rem" }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 900, marginBottom: "0.5rem" }}>
            <span className="gradient-text">{title}</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: "720px" }}>
            {subtitle}
          </p>
        </div>

        {/* Day Switcher Tabs */}
        {defaultDay === undefined && (
          <div className="day-tabs" id="schedule-day-tabs" role="tablist">
            <button
              type="button"
              className={`day-tab ${selectedDay === "all" ? "active" : ""}`}
              onClick={() => setSelectedDay("all")}
              id="tab-day-all"
            >
              <Calendar size={16} /> All Days ({initialSchedule.length})
            </button>
            <button
              type="button"
              className={`day-tab ${selectedDay === 1 ? "active" : ""}`}
              onClick={() => setSelectedDay(1)}
              id="tab-day-1"
            >
              Day 1 &bull; 15 Oct
            </button>
            <button
              type="button"
              className={`day-tab ${selectedDay === 2 ? "active" : ""}`}
              onClick={() => setSelectedDay(2)}
              id="tab-day-2"
            >
              Day 2 &bull; 16 Oct
            </button>
            <button
              type="button"
              className={`day-tab ${selectedDay === 3 ? "active" : ""}`}
              onClick={() => setSelectedDay(3)}
              id="tab-day-3"
            >
              Day 3 &bull; 17 Oct
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="filter-bar" id="schedule-filter-controls">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by event name, venue, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="schedule-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="filter-selects">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Filter size={15} style={{ color: "var(--accent-cyan)" }} />
              <select
                className="select-custom"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                id="filter-select-venue"
                aria-label="Filter by Venue"
              >
                <option value="All">All Venues</option>
                {venues.filter((v) => v !== "All").map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="select-custom"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              id="filter-select-category"
              aria-label="Filter by Category"
            >
              <option value="All">All Categories</option>
              {categories.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Official Venue Legend */}
        <VenueLegend />

        {/* Count Indicator */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Showing <strong style={{ color: "var(--accent-cyan)" }}>{filteredItems.length}</strong> events
            {selectedDay !== "all" ? ` for Day ${selectedDay}` : ""}
            {selectedVenue !== "All" ? ` at ${selectedVenue}` : ""}
            {selectedCategory !== "All" ? ` (${selectedCategory})` : ""}
          </div>

          {(selectedVenue !== "All" || selectedCategory !== "All" || searchQuery) && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => {
                setSelectedVenue("All");
                setSelectedCategory("All");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Event Cards Grid */}
        {filteredItems.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
            id="schedule-items-grid"
          >
            {filteredItems.map((item) => (
              <EventCard
                key={item.id}
                item={item}
                showDayBadge={selectedDay === "all"}
              />
            ))}
          </div>
        ) : (
          <div
            className="glass-card"
            style={{ textAlign: "center", padding: "4rem 2rem" }}
            id="schedule-no-results"
          >
            <h3 style={{ fontSize: "1.3rem", color: "#fff", marginBottom: "8px" }}>No Events Found</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
              No scheduled events matched your selected filter criteria. Try adjusting the search or filters.
            </p>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => {
                setSelectedDay("all");
                setSelectedVenue("All");
                setSelectedCategory("All");
                setSearchQuery("");
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
