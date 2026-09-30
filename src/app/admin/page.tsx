"use client";

import React, { useState, useEffect } from "react";
import {
  EventItem,
  EventScheduleItem,
  Participant,
  Registration,
} from "@/lib/types";
import {
  Shield,
  Lock,
  LogOut,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertTriangle,
  Search,
} from "lucide-react";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Admin Dashboard Tabs
  const [activeTab, setActiveTab] = useState<
    "schedules" | "events" | "participants" | "registrations" | "excel"
  >("schedules");

  // Data states
  const [schedules, setSchedules] = useState<EventScheduleItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Modals / Editing states
  const [editingSchedule, setEditingSchedule] = useState<Partial<EventScheduleItem> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem> | null>(null);
  const [newRegParticipantId, setNewRegParticipantId] = useState("");
  const [newRegEventId, setNewRegEventId] = useState("");

  // Search filters inside admin
  const [adminSearch, setAdminSearch] = useState("");

  // Excel upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Check auth on load
  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
        if (data.authenticated) {
          loadAllData();
        }
      })
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
        setPasswordInput("");
        loadAllData();
      } else {
        setLoginError(data.error || "Invalid password.");
      }
    } catch {
      setLoginError("Login request failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout");
    setAuthenticated(false);
  };

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      const [schedRes, evRes, partRes, regRes] = await Promise.all([
        fetch("/api/admin/schedules").then((r) => r.json()),
        fetch("/api/admin/events").then((r) => r.json()),
        fetch("/api/admin/participants").then((r) => r.json()),
        fetch("/api/admin/registrations").then((r) => r.json()),
      ]);

      if (schedRes.success) setSchedules(schedRes.schedule);
      if (evRes.success) setEvents(evRes.events);
      if (partRes.success) setParticipants(partRes.participants);
      if (regRes.success) setRegistrations(regRes.registrations);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Schedule CRUD
  const saveScheduleItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;

    const isNew = !editingSchedule.id;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch("/api/admin/schedules", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSchedule),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(isNew ? "Schedule item created!" : "Timing & venue updated!");
        setEditingSchedule(null);
        loadAllData();
      } else {
        alert(data.error || "Failed to save schedule item");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const deleteScheduleItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule item?")) return;
    try {
      const res = await fetch(`/api/admin/schedules?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Schedule item deleted.");
        loadAllData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Event CRUD
  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    const isNew = !editingEvent.id;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch("/api/admin/events", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEvent),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(isNew ? "Event created!" : "Event updated!");
        setEditingEvent(null);
        loadAllData();
      } else {
        alert(data.error || "Failed to save event");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event? This will also remove registrations linked to it.")) return;
    try {
      const res = await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Event deleted.");
        loadAllData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Registration CRUD
  const addRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegParticipantId || !newRegEventId) return;

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_id: newRegParticipantId,
          event_id: newRegEventId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Registration linked successfully!");
        setNewRegParticipantId("");
        setNewRegEventId("");
        loadAllData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const removeRegistration = async (participantId: string, eventId: string) => {
    if (!confirm("Remove this participant registration?")) return;
    try {
      const res = await fetch(
        `/api/admin/registrations?participant_id=${encodeURIComponent(participantId)}&event_id=${encodeURIComponent(eventId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Registration removed.");
        loadAllData();
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // Excel Upload
  const handleExcelImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Please select an Excel (.xlsx) file first.");
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      const res = await fetch("/api/admin/import-excel", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message);
        setUploadFile(null);
        loadAllData();
      } else {
        alert(data.error || "Excel import failed");
      }
    } catch (err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Render Login Screen if not authenticated
  if (authenticated === null) {
    return (
      <div style={{ padding: "6rem 0", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Verifying admin session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ padding: "5rem 0" }}>
        <div className="container" style={{ maxWidth: "450px" }}>
          <div className="glass-card" style={{ border: "1px solid var(--border-glow)", padding: "2.5rem" }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "rgba(0, 240, 255, 0.1)",
                  border: "1px solid rgba(0, 240, 255, 0.3)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                  color: "var(--accent-cyan)",
                }}
              >
                <Lock size={26} />
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", marginBottom: "4px" }}>
                Admin Authentication
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Enter the server-side administrator password to manage COMFEST&apos;26 schedules, venues, and registrations.
              </p>
            </div>

            {loginError && (
              <div
                style={{
                  background: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.4)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  color: "#fda4af",
                  fontSize: "0.88rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertTriangle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} id="admin-login-form">
              <div className="form-group">
                <label htmlFor="admin-password-field" className="form-label">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="admin-password-field"
                  className="form-input"
                  placeholder="Enter administrator password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", marginTop: "1rem" }}
                disabled={loginLoading}
                id="btn-admin-login-submit"
              >
                {loginLoading ? "Authenticating..." : "Unlock Admin Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2.5rem 0 5rem" }}>
      <div className="container">
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "14px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="badge badge-flagship">ADMIN CONTROL PANEL</span>
              <span style={{ color: "var(--accent-green)", fontSize: "0.85rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle size={14} /> Server-Side Session Active
              </span>
            </div>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#fff", marginTop: "4px" }}>
              COMFEST&apos;26 Management
            </h1>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={loadAllData}
              disabled={dataLoading}
            >
              Refresh Data
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              style={{ color: "#fda4af", borderColor: "rgba(244,63,94,0.3)" }}
              onClick={handleLogout}
              id="btn-admin-logout"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#a7f3d0",
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{statusMessage}</span>
            <button
              type="button"
              onClick={() => setStatusMessage("")}
              style={{ background: "transparent", border: "none", color: "#a7f3d0", cursor: "pointer" }}
            >
              &times;
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="day-tabs" style={{ marginBottom: "2rem" }}>
          <button
            type="button"
            className={`day-tab ${activeTab === "schedules" ? "active" : ""}`}
            onClick={() => setActiveTab("schedules")}
          >
            <Clock size={16} /> Timetable &amp; Venues ({schedules.length})
          </button>
          <button
            type="button"
            className={`day-tab ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            <Calendar size={16} /> Events ({events.length})
          </button>
          <button
            type="button"
            className={`day-tab ${activeTab === "participants" ? "active" : ""}`}
            onClick={() => setActiveTab("participants")}
          >
            <Users size={16} /> Participants ({participants.length})
          </button>
          <button
            type="button"
            className={`day-tab ${activeTab === "registrations" ? "active" : ""}`}
            onClick={() => setActiveTab("registrations")}
          >
            <Shield size={16} /> Registrations ({registrations.length})
          </button>
          <button
            type="button"
            className={`day-tab ${activeTab === "excel" ? "active" : ""}`}
            onClick={() => setActiveTab("excel")}
          >
            <FileSpreadsheet size={16} /> Import Excel Data
          </button>
        </div>

        {/* TAB 1: SCHEDULES (Change Timings & Venues) */}
        {activeTab === "schedules" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "10px" }}>
              <div className="search-input-wrap" style={{ maxWidth: "350px" }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Filter schedule items..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() =>
                  setEditingSchedule({
                    event_name: "",
                    sub_round: "",
                    day: 1,
                    date: "2026-10-15",
                    date_formatted: "15 October 2026",
                    start_time: "11:30",
                    end_time: "13:00",
                    venue: "Auditorium",
                    category: "Technical",
                    description: "",
                  })
                }
              >
                <Plus size={15} /> Add Schedule Item
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-glass-card)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.4)", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border-dim)" }}>
                    <th style={{ padding: "12px 16px" }}>Event</th>
                    <th style={{ padding: "12px 16px" }}>Day &amp; Date</th>
                    <th style={{ padding: "12px 16px" }}>Timing</th>
                    <th style={{ padding: "12px 16px" }}>Venue</th>
                    <th style={{ padding: "12px 16px" }}>Category</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules
                    .filter((s) =>
                      adminSearch
                        ? s.event_name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          s.venue.toLowerCase().includes(adminSearch.toLowerCase())
                        : true
                    )
                    .map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.92rem" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#fff" }}>
                          {item.event_name}
                          {item.sub_round && (
                            <span style={{ fontSize: "0.78rem", color: "var(--accent-cyan)", marginLeft: "6px" }}>
                              ({item.sub_round})
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          Day {item.day} &bull; {item.date_formatted}
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                          {item.start_time} – {item.end_time}
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 600 }}>{item.venue}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span className="badge badge-general">{item.category}</span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "8px" }}>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => setEditingSchedule(item)}
                              title="Edit timing or venue"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              style={{ color: "#fda4af", borderColor: "rgba(244,63,94,0.3)" }}
                              onClick={() => deleteScheduleItem(item.id)}
                              title="Delete schedule item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: EVENTS */}
        {activeTab === "events" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div className="search-input-wrap" style={{ maxWidth: "350px" }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Filter events..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() =>
                  setEditingEvent({
                    name: "",
                    category: "Flagship",
                    device_allowance: "No",
                    max_participants: "2",
                    description: "",
                  })
                }
              >
                <Plus size={15} /> Add New Event
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
              {events
                .filter((ev) =>
                  adminSearch
                    ? ev.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                      ev.category.toLowerCase().includes(adminSearch.toLowerCase())
                    : true
                )
                .map((ev) => (
                  <div key={ev.id} className="glass-card" style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span className="badge badge-flagship">{ev.category}</span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => setEditingEvent(ev)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          style={{ color: "#fda4af" }}
                          onClick={() => deleteEvent(ev.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                      {ev.name}
                    </h3>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                      Device Allowance: <strong>{ev.device_allowance}</strong> &bull; Max: {ev.max_participants || 1}
                    </div>
                    {ev.description && (
                      <p style={{ fontSize: "0.88rem", color: "var(--text-dim)", lineHeight: "1.5" }}>
                        {ev.description}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: PARTICIPANTS */}
        {activeTab === "participants" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div className="search-input-wrap" style={{ maxWidth: "350px" }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search participants by name, email, class..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-glass-card)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.4)", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border-dim)" }}>
                    <th style={{ padding: "12px 16px" }}>Name</th>
                    <th style={{ padding: "12px 16px" }}>Email</th>
                    <th style={{ padding: "12px 16px" }}>Phone</th>
                    <th style={{ padding: "12px 16px" }}>Class</th>
                    <th style={{ padding: "12px 16px" }}>School</th>
                    <th style={{ padding: "12px 16px" }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {participants
                    .filter((p) =>
                      adminSearch
                        ? p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          p.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
                          (p.class && p.class.toLowerCase().includes(adminSearch.toLowerCase()))
                        : true
                    )
                    .map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.92rem" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#fff" }}>{p.name}</td>
                        <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--accent-cyan)" }}>
                          {p.email}
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
                          {p.phone || "—"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>{p.class || "—"}</td>
                        <td style={{ padding: "14px 16px", color: "var(--text-muted)" }}>{p.school}</td>
                        <td style={{ padding: "14px 16px" }}>
                          {p.is_online ? (
                            <span className="badge badge-general">Online</span>
                          ) : (
                            <span className="badge badge-technical">On-Campus</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: REGISTRATIONS */}
        {activeTab === "registrations" && (
          <div>
            {/* Link Participant to Event Form */}
            <div className="glass-card" style={{ marginBottom: "2rem", padding: "1.75rem", border: "1px solid var(--border-glow)" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>
                Add / Link Participant Registration
              </h3>
              <form onSubmit={addRegistration} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "14px", alignItems: "flex-end" }}>
                <div>
                  <label className="form-label">Select Participant</label>
                  <select
                    className="select-custom"
                    style={{ width: "100%" }}
                    value={newRegParticipantId}
                    onChange={(e) => setNewRegParticipantId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Participant --</option>
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.class ? `Class ${p.class}` : p.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Select Event</label>
                  <select
                    className="select-custom"
                    style={{ width: "100%" }}
                    value={newRegEventId}
                    onChange={(e) => setNewRegEventId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Event --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} ({ev.category})
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn-primary" style={{ padding: "11px 20px" }}>
                  <Plus size={15} /> Link Registration
                </button>
              </form>
            </div>

            {/* List Registrations */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-glass-card)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.4)", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border-dim)" }}>
                    <th style={{ padding: "12px 16px" }}>Participant</th>
                    <th style={{ padding: "12px 16px" }}>Email</th>
                    <th style={{ padding: "12px 16px" }}>Registered Event</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "0.92rem" }}>
                      <td style={{ padding: "14px 16px", fontWeight: 700, color: "#fff" }}>
                        {r.participant_name}
                      </td>
                      <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--text-dim)" }}>
                        {r.participant_email}
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                        {r.event_name}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          style={{ color: "#fda4af", borderColor: "rgba(244,63,94,0.3)" }}
                          onClick={() => removeRegistration(r.participant_id, r.event_id)}
                          title="Remove registration"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: EXCEL IMPORT */}
        {activeTab === "excel" && (
          <div style={{ maxWidth: "680px" }}>
            <div className="glass-card" style={{ padding: "2.5rem", border: "1px solid var(--border-glow)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                <FileSpreadsheet size={28} style={{ color: "var(--accent-green)" }} />
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                  Import Registration Sheet (.xlsx)
                </h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                Upload the official COMFEST&apos;26 registration workbook. The server will parse school information, participants, contact credentials, and event participant mappings into the database automatically.
              </p>

              <form onSubmit={handleExcelImport}>
                <div className="form-group">
                  <label className="form-label">Select Excel File (.xlsx)</label>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    className="form-input"
                    onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", padding: "14px", marginTop: "1rem" }}
                  disabled={uploadLoading || !uploadFile}
                >
                  <Upload size={16} /> {uploadLoading ? "Processing Excel File..." : "Import Registration Data"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT SCHEDULE ITEM (Timing & Venue) */}
        {editingSchedule && (
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
          >
            <div className="glass-card" style={{ maxWidth: "550px", width: "100%", padding: "2rem", border: "1px solid var(--border-glow)" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", marginBottom: "1.25rem" }}>
                {editingSchedule.id ? "Edit Schedule Item" : "New Schedule Item"}
              </h3>

              <form onSubmit={saveScheduleItem}>
                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingSchedule.event_name || ""}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, event_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sub-round / Qualifier (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Prelims, Finals, Round 1"
                    value={editingSchedule.sub_round || ""}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, sub_round: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Festival Day</label>
                    <select
                      className="select-custom"
                      style={{ width: "100%" }}
                      value={editingSchedule.day ?? 1}
                      onChange={(e) => {
                        const d = Number(e.target.value);
                        let date = "2026-10-15";
                        let date_formatted = "15 October 2026";
                        if (d === 2) {
                          date = "2026-10-16";
                          date_formatted = "16 October 2026";
                        } else if (d === 3) {
                          date = "2026-10-17";
                          date_formatted = "17 October 2026";
                        }
                        setEditingSchedule({
                          ...editingSchedule,
                          day: d,
                          date,
                          date_formatted,
                        });
                      }}
                    >
                      <option value={1}>Day 1 (15 Oct 2026)</option>
                      <option value={2}>Day 2 (16 Oct 2026)</option>
                      <option value={3}>Day 3 (17 Oct 2026)</option>
                      <option value={0}>Online / Pre-fest</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <select
                      className="select-custom"
                      style={{ width: "100%" }}
                      value={editingSchedule.venue || "Auditorium"}
                      onChange={(e) => setEditingSchedule({ ...editingSchedule, venue: e.target.value })}
                    >
                      <option value="Auditorium">Auditorium</option>
                      <option value="Grounds">Grounds</option>
                      <option value="Basketball Court">Basketball Court</option>
                      <option value="Classrooms">Classrooms</option>
                      <option value="Computer Lab">Computer Lab</option>
                      <option value="ATL/Labs">ATL/Labs</option>
                      <option value="Common">Common / Dining</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Start Time (HH:mm)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="11:30"
                      value={editingSchedule.start_time || ""}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          start_time: e.target.value,
                          time_range: `${e.target.value} – ${editingSchedule.end_time || ""}`,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Time (HH:mm)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="13:00"
                      value={editingSchedule.end_time || ""}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          end_time: e.target.value,
                          time_range: `${editingSchedule.start_time || ""} – ${e.target.value}`,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="select-custom"
                    style={{ width: "100%" }}
                    value={editingSchedule.category || "Technical"}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, category: e.target.value })}
                  >
                    <option value="Flagship">Flagship</option>
                    <option value="Technical">Technical</option>
                    <option value="Literary">Literary</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Creative">Creative</option>
                    <option value="Photography">Photography</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Ceremony">Ceremony</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Dining">Dining</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Instructions</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={editingSchedule.description || ""}
                    onChange={(e) => setEditingSchedule({ ...editingSchedule, description: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => setEditingSchedule(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary btn-sm">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EDIT EVENT */}
        {editingEvent && (
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
          >
            <div className="glass-card" style={{ maxWidth: "550px", width: "100%", padding: "2rem", border: "1px solid var(--border-glow)" }}>
              <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", marginBottom: "1.25rem" }}>
                {editingEvent.id ? "Edit Event" : "Create Event"}
              </h3>

              <form onSubmit={saveEvent}>
                <div className="form-group">
                  <label className="form-label">Event Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingEvent.name || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="select-custom"
                      style={{ width: "100%" }}
                      value={editingEvent.category || "Flagship"}
                      onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                    >
                      <option value="Flagship">Flagship</option>
                      <option value="Technical">Technical</option>
                      <option value="Literary">Literary</option>
                      <option value="Business">Business</option>
                      <option value="Design">Design</option>
                      <option value="Creative">Creative</option>
                      <option value="Photography">Photography</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Ceremony">Ceremony</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Device Allowance</label>
                    <select
                      className="select-custom"
                      style={{ width: "100%" }}
                      value={editingEvent.device_allowance || "No"}
                      onChange={(e) => setEditingEvent({ ...editingEvent, device_allowance: e.target.value })}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Participants</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1, 2, 4, 7 Maximum"
                    value={editingEvent.max_participants || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, max_participants: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={editingEvent.description || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => setEditingEvent(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary btn-sm">
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
