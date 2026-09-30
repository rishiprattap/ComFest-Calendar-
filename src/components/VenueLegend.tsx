import React from "react";

export default function VenueLegend() {
  const venues = [
    { name: "Auditorium", color: "#c084fc" },
    { name: "Grounds", color: "#86efac" },
    { name: "Basketball Court", color: "#94a3b8" },
    { name: "Classrooms", color: "#fde047" },
    { name: "Computer Lab", color: "#38bdf8" },
    { name: "ATL / Labs", color: "#f472b6" },
  ];

  return (
    <div className="venue-legend" id="venue-color-legend">
      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", letterSpacing: "1px" }}>
        Official Venues:
      </span>
      {venues.map((v) => (
        <div key={v.name} className="legend-chip">
          <span className="legend-dot" style={{ backgroundColor: v.color }} />
          <span>{v.name}</span>
        </div>
      ))}
    </div>
  );
}
