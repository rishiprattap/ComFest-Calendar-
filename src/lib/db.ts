import { createClient, Client } from "@libsql/client";
import path from "path";
import fs from "fs";
import {
  EventItem,
  EventScheduleItem,
  Participant,
  Registration,
  ParticipantLookupResult,
} from "./types";
import * as XLSX from "xlsx";

let clientInstance: Client | null = null;
let isInitialized = false;

/**
 * Initializes and returns the LibSQL database client.
 * Connects to Turso / Cloud LibSQL if TURSO_DATABASE_URL is provided,
 * or local SQLite file otherwise.
 */
export function getDbClient(): Client {
  if (clientInstance) return clientInstance;

  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://") || tursoUrl.startsWith("http://"))) {
    clientInstance = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    return clientInstance;
  }

  // Local or serverless file database
  let dbPath: string;
  if (process.env.VERCEL) {
    // In Vercel serverless environment when no cloud database URL is configured,
    // use writable /tmp directory
    dbPath = path.join("/tmp", "comfest26.db");
  } else {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = path.join(dataDir, "comfest26.db");
  }

  clientInstance = createClient({
    url: `file:${dbPath}`,
  });
  return clientInstance;
}

/**
 * Ensures schema exists and seeds initial data if database is empty.
 */
export async function ensureDbInitialized(): Promise<void> {
  if (isInitialized) return;
  const db = getDbClient();

  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      device_allowance TEXT DEFAULT 'No',
      max_participants TEXT,
      time_allotted TEXT,
      description TEXT,
      rules TEXT,
      is_online INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS event_schedules (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      event_name TEXT NOT NULL,
      sub_round TEXT,
      day INTEGER NOT NULL,
      date TEXT NOT NULL,
      date_formatted TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      time_range TEXT NOT NULL,
      venue TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      normalized_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      class TEXT,
      school TEXT NOT NULL,
      is_online INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      participant_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      role TEXT,
      notes TEXT,
      created_at TEXT,
      UNIQUE(participant_id, event_id)
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Check if events exist; if not, seed from seed_data.json
  const check = await db.execute("SELECT COUNT(*) as count FROM events");
  const count = Number(check.rows[0]?.count || 0);

  if (count === 0) {
    await seedInitialData(db);
  }

  isInitialized = true;
}

/**
 * Seeds initial official schedule and participant registrations
 */
async function seedInitialData(db: Client): Promise<void> {
  try {
    const seedPath = path.join(process.cwd(), "data", "seed_data.json");
    if (!fs.existsSync(seedPath)) {
      console.warn("seed_data.json not found at", seedPath);
      return;
    }

    const raw = fs.readFileSync(seedPath, "utf-8");
    const seed = JSON.parse(raw);
    const now = new Date().toISOString();

    // 1. Insert Participants
    for (const p of seed.participants || []) {
      const normalized = p.name.trim().toLowerCase().replace(/\s+/g, " ");
      await db.execute({
        sql: `INSERT OR REPLACE INTO participants 
              (id, name, normalized_name, email, phone, class, school, is_online, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          p.id,
          p.name.trim(),
          normalized,
          p.email.trim(),
          p.phone ? p.phone.trim() : "",
          p.class ? p.class.trim() : "",
          p.school ? p.school.trim() : seed.school || "Delhi Public School Barra, Kanpur",
          p.is_online ? 1 : 0,
          now,
          now,
        ],
      });
    }

    // 2. Insert Events & Registrations
    const participantNameToId: Record<string, string> = {};
    for (const p of seed.participants || []) {
      participantNameToId[p.name.trim().toLowerCase()] = p.id;
    }

    for (const ev of seed.excel_events || []) {
      const eventId = `ev_${ev.num}`;
      await db.execute({
        sql: `INSERT OR REPLACE INTO events 
              (id, name, category, device_allowance, max_participants, description, is_online, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          eventId,
          ev.name,
          ev.category,
          ev.name.toLowerCase().includes("robowars") || ev.name.toLowerCase().includes("broadway") || ev.name.toLowerCase().includes("draft") || ev.name.toLowerCase().includes("hackom") ? "Yes" : "No",
          `${ev.participants.length}`,
          `COMFEST'26 ${ev.name} competition under ${ev.category} category.`,
          ev.name.toLowerCase().includes("online") || ev.name.toLowerCase().includes("journaltopia") || ev.name.toLowerCase().includes("quizart") ? 1 : 0,
          now,
          now,
        ],
      });

      // Insert registrations for participants in this event
      for (const pName of ev.participants || []) {
        const cleanPName = pName.trim().toLowerCase();
        const pId = participantNameToId[cleanPName];
        if (pId) {
          const regId = `reg_${pId}_${eventId}`;
          await db.execute({
            sql: `INSERT OR IGNORE INTO registrations (id, participant_id, event_id, created_at) VALUES (?, ?, ?, ?)`,
            args: [regId, pId, eventId, now],
          });
        }
      }
    }

    // 3. Insert Official Schedules
    const allSchedules = [...(seed.schedule || []), ...(seed.online_events || [])];
    for (const item of allSchedules) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO event_schedules 
              (id, event_id, event_name, sub_round, day, date, date_formatted, start_time, end_time, time_range, venue, category, description, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          item.id,
          item.eventId || null,
          item.eventName,
          item.subRound || null,
          item.day,
          item.date,
          item.dateFormatted,
          item.startTime,
          item.endTime,
          item.timeRange,
          item.venue,
          item.category,
          item.description || "",
          now,
          now,
        ],
      });
    }

    console.log("Database initialized and seeded successfully.");
  } catch (err) {
    console.error("Error seeding initial data:", err);
  }
}

// ==========================================
// PUBLIC QUERY METHODS
// ==========================================

export async function getScheduleList(filters?: {
  day?: number;
  venue?: string;
  category?: string;
  search?: string;
}): Promise<EventScheduleItem[]> {
  await ensureDbInitialized();
  const db = getDbClient();

  let sql = `SELECT * FROM event_schedules WHERE 1=1`;
  const args: any[] = [];

  if (filters?.day !== undefined && filters.day !== null) {
    sql += ` AND day = ?`;
    args.push(filters.day);
  }
  if (filters?.venue && filters.venue !== "All") {
    sql += ` AND LOWER(venue) = LOWER(?)`;
    args.push(filters.venue);
  }
  if (filters?.category && filters.category !== "All") {
    sql += ` AND LOWER(category) = LOWER(?)`;
    args.push(filters.category);
  }
  if (filters?.search && filters.search.trim()) {
    sql += ` AND (LOWER(event_name) LIKE ? OR LOWER(description) LIKE ?)`;
    const term = `%${filters.search.trim().toLowerCase()}%`;
    args.push(term, term);
  }

  sql += ` ORDER BY day ASC, start_time ASC, event_name ASC`;
  const res = await db.execute({ sql, args });

  return res.rows.map((row) => ({
    id: String(row.id),
    event_id: row.event_id ? String(row.event_id) : undefined,
    event_name: String(row.event_name),
    sub_round: row.sub_round ? String(row.sub_round) : undefined,
    day: Number(row.day),
    date: String(row.date),
    date_formatted: String(row.date_formatted),
    start_time: String(row.start_time),
    end_time: String(row.end_time),
    time_range: String(row.time_range),
    venue: String(row.venue),
    category: String(row.category),
    description: row.description ? String(row.description) : undefined,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  }));
}

export async function getScheduleItemById(id: string): Promise<EventScheduleItem | null> {
  await ensureDbInitialized();
  const db = getDbClient();
  const res = await db.execute({
    sql: `SELECT * FROM event_schedules WHERE id = ?`,
    args: [id],
  });
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: String(row.id),
    event_id: row.event_id ? String(row.event_id) : undefined,
    event_name: String(row.event_name),
    sub_round: row.sub_round ? String(row.sub_round) : undefined,
    day: Number(row.day),
    date: String(row.date),
    date_formatted: String(row.date_formatted),
    start_time: String(row.start_time),
    end_time: String(row.end_time),
    time_range: String(row.time_range),
    venue: String(row.venue),
    category: String(row.category),
    description: row.description ? String(row.description) : undefined,
  };
}

export async function getAllEvents(): Promise<EventItem[]> {
  await ensureDbInitialized();
  const db = getDbClient();
  const res = await db.execute(`SELECT * FROM events ORDER BY category ASC, name ASC`);
  return res.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    category: String(row.category),
    device_allowance: row.device_allowance ? String(row.device_allowance) : "No",
    max_participants: row.max_participants ? String(row.max_participants) : undefined,
    time_allotted: row.time_allotted ? String(row.time_allotted) : undefined,
    description: row.description ? String(row.description) : undefined,
    rules: row.rules ? String(row.rules) : undefined,
    is_online: Boolean(row.is_online),
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  }));
}

/**
 * Searches for a participant by name.
 * If multiple participants share the same name, requires an identifier (email, phone, class, or school)
 * to prevent guessing or exposing other attendees' schedules.
 */
export async function lookupParticipantEvents(
  name: string,
  identifier?: string
): Promise<ParticipantLookupResult> {
  await ensureDbInitialized();
  const db = getDbClient();

  const cleanName = name.trim().toLowerCase().replace(/\s+/g, " ");
  if (!cleanName) {
    return { status: "not_found", message: "Please provide a valid participant name." };
  }

  // Find participants with matching normalized name
  const matchRes = await db.execute({
    sql: `SELECT * FROM participants WHERE normalized_name = ? OR LOWER(name) LIKE ?`,
    args: [cleanName, `%${cleanName}%`],
  });

  if (matchRes.rows.length === 0) {
    return {
      status: "not_found",
      message: `No registered participant found matching "${name}". Please check the spelling or ask your school coordinator.`,
    };
  }

  let selectedParticipant: any = null;

  if (matchRes.rows.length > 1) {
    // Multiple people have this name! Do NOT guess.
    if (!identifier || !identifier.trim()) {
      // Prompt user for additional identifier
      const candidates = matchRes.rows.map((r) => {
        const email = String(r.email || "");
        const phone = String(r.phone || "");
        const maskedEmail = email ? maskEmail(email) : "";
        const maskedPhone = phone ? maskPhone(phone) : "";
        return {
          id: String(r.id),
          name: String(r.name),
          class: r.class ? String(r.class) : undefined,
          school: String(r.school),
          maskedEmail,
          maskedPhone,
        };
      });

      return {
        status: "multiple_matches",
        count: matchRes.rows.length,
        message: `Multiple participants found matching "${name}". To protect participant privacy and show your exact schedule, please provide your Email, Phone Number, or Class.`,
        candidates,
      };
    }

    // Try matching with identifier
    const cleanId = identifier.trim().toLowerCase();
    const filtered = matchRes.rows.filter((r) => {
      const email = String(r.email || "").toLowerCase();
      const phone = String(r.phone || "").replace(/[^0-9]/g, "");
      const cls = String(r.class || "").toLowerCase();
      const cleanPhoneInput = cleanId.replace(/[^0-9]/g, "");

      if (email === cleanId || email.includes(cleanId)) return true;
      if (cleanPhoneInput && phone.endsWith(cleanPhoneInput)) return true;
      if (cls === cleanId) return true;
      if (String(r.id).toLowerCase() === cleanId) return true;
      return false;
    });

    if (filtered.length === 1) {
      selectedParticipant = filtered[0];
    } else if (filtered.length === 0) {
      return {
        status: "not_found",
        message: `No participant matching "${name}" with identifier "${identifier}" was found. Please verify your registered details.`,
      };
    } else {
      return {
        status: "multiple_matches",
        count: filtered.length,
        message: `Identifier could not uniquely resolve the participant. Please provide your exact registered email address or phone number.`,
      };
    }
  } else {
    selectedParticipant = matchRes.rows[0];
  }

  // Fetch registered events for this participant
  const partId = String(selectedParticipant.id);
  const regRes = await db.execute({
    sql: `SELECT e.* FROM registrations r
          JOIN events e ON r.event_id = e.id
          WHERE r.participant_id = ?
          ORDER BY e.name ASC`,
    args: [partId],
  });

  const registeredEvents: any[] = [];
  for (const row of regRes.rows) {
    const eventName = String(row.name);
    // Find matching schedule items from official brochure schedule
    const schedRes = await db.execute({
      sql: `SELECT * FROM event_schedules 
            WHERE LOWER(event_name) = LOWER(?) 
               OR LOWER(event_name) LIKE ?
               OR LOWER(?) LIKE '%' || LOWER(event_name) || '%'
            ORDER BY day ASC, start_time ASC`,
      args: [eventName, `%${eventName.toLowerCase()}%`, eventName.toLowerCase()],
    });

    const schedules: EventScheduleItem[] = schedRes.rows.map((s) => ({
      id: String(s.id),
      event_id: s.event_id ? String(s.event_id) : undefined,
      event_name: String(s.event_name),
      sub_round: s.sub_round ? String(s.sub_round) : undefined,
      day: Number(s.day),
      date: String(s.date),
      date_formatted: String(s.date_formatted),
      start_time: String(s.start_time),
      end_time: String(s.end_time),
      time_range: String(s.time_range),
      venue: String(s.venue),
      category: String(s.category),
      description: s.description ? String(s.description) : undefined,
    }));

    registeredEvents.push({
      eventId: String(row.id),
      eventName: eventName,
      category: String(row.category),
      deviceAllowance: row.device_allowance ? String(row.device_allowance) : "No",
      schedule: schedules,
    });
  }

  // Fetch common festival events (Ceremonies, Dining/Meals, Entertainment) attended by all delegates
  const commonRes = await db.execute(`
    SELECT * FROM event_schedules 
    WHERE category IN ('Ceremony', 'Dining', 'Entertainment')
       OR LOWER(event_name) LIKE '%ceremony%' 
       OR LOWER(event_name) LIKE '%lunch%' 
       OR LOWER(event_name) LIKE '%breakfast%'
       OR LOWER(event_name) LIKE '%orientation%'
    ORDER BY day ASC, start_time ASC
  `);

  const commonEvents: EventScheduleItem[] = commonRes.rows.map((s) => ({
    id: String(s.id),
    event_id: s.event_id ? String(s.event_id) : undefined,
    event_name: String(s.event_name),
    sub_round: s.sub_round ? String(s.sub_round) : undefined,
    day: Number(s.day),
    date: String(s.date),
    date_formatted: String(s.date_formatted),
    start_time: String(s.start_time),
    end_time: String(s.end_time),
    time_range: String(s.time_range),
    venue: String(s.venue),
    category: String(s.category),
    description: s.description ? String(s.description) : undefined,
  }));

  return {
    status: "found",
    participant: {
      id: partId,
      name: String(selectedParticipant.name),
      class: selectedParticipant.class ? String(selectedParticipant.class) : undefined,
      school: String(selectedParticipant.school),
    },
    events: registeredEvents,
    commonEvents: commonEvents,
  };
}

/**
 * Returns all official common festival events (Ceremonies, Meals, Socials)
 */
export async function getCommonFestivalEvents(): Promise<EventScheduleItem[]> {
  await ensureDbInitialized();
  const db = getDbClient();
  const commonRes = await db.execute(`
    SELECT * FROM event_schedules 
    WHERE category IN ('Ceremony', 'Dining', 'Entertainment', 'Common')
       OR event_id IS NULL
    ORDER BY day ASC, start_time ASC
  `);

  return commonRes.rows.map((s) => ({
    id: String(s.id),
    event_id: s.event_id ? String(s.event_id) : undefined,
    event_name: String(s.event_name),
    sub_round: s.sub_round ? String(s.sub_round) : undefined,
    day: Number(s.day),
    date: String(s.date),
    date_formatted: String(s.date_formatted),
    start_time: String(s.start_time),
    end_time: String(s.end_time),
    time_range: String(s.time_range),
    venue: String(s.venue),
    category: String(s.category),
    description: s.description ? String(s.description) : undefined,
  }));
}

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return "***";
  const user = parts[0];
  const domain = parts[1];
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
}

function maskPhone(phone: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  if (clean.length < 4) return "****";
  return `******${clean.slice(-4)}`;
}

// ==========================================
// ADMIN MUTATION METHODS
// ==========================================

export async function adminGetAllEvents(): Promise<EventItem[]> {
  await ensureDbInitialized();
  return getAllEvents();
}

export async function adminCreateEvent(data: Partial<EventItem>): Promise<EventItem> {
  await ensureDbInitialized();
  const db = getDbClient();
  const id = data.id || `ev_${Date.now()}`;
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO events (id, name, category, device_allowance, max_participants, time_allotted, description, rules, is_online, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.name || "Untitled Event",
      data.category || "General",
      data.device_allowance || "No",
      data.max_participants || "1",
      data.time_allotted || "",
      data.description || "",
      data.rules || "",
      data.is_online ? 1 : 0,
      now,
      now,
    ],
  });

  return {
    id,
    name: data.name || "Untitled Event",
    category: data.category || "General",
    device_allowance: data.device_allowance || "No",
    max_participants: data.max_participants || "1",
    time_allotted: data.time_allotted || "",
    description: data.description || "",
    rules: data.rules || "",
    is_online: Boolean(data.is_online),
    created_at: now,
    updated_at: now,
  };
}

export async function adminUpdateEvent(id: string, data: Partial<EventItem>): Promise<boolean> {
  await ensureDbInitialized();
  const db = getDbClient();
  const now = new Date().toISOString();

  const updates: string[] = ["updated_at = ?"];
  const args: any[] = [now];

  if (data.name !== undefined) {
    updates.push("name = ?");
    args.push(data.name);
  }
  if (data.category !== undefined) {
    updates.push("category = ?");
    args.push(data.category);
  }
  if (data.device_allowance !== undefined) {
    updates.push("device_allowance = ?");
    args.push(data.device_allowance);
  }
  if (data.max_participants !== undefined) {
    updates.push("max_participants = ?");
    args.push(data.max_participants);
  }
  if (data.time_allotted !== undefined) {
    updates.push("time_allotted = ?");
    args.push(data.time_allotted);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    args.push(data.description);
  }
  if (data.rules !== undefined) {
    updates.push("rules = ?");
    args.push(data.rules);
  }
  if (data.is_online !== undefined) {
    updates.push("is_online = ?");
    args.push(data.is_online ? 1 : 0);
  }

  args.push(id);
  const res = await db.execute({
    sql: `UPDATE events SET ${updates.join(", ")} WHERE id = ?`,
    args,
  });

  return res.rowsAffected > 0;
}

export async function adminDeleteEvent(id: string): Promise<boolean> {
  await ensureDbInitialized();
  const db = getDbClient();
  await db.execute({ sql: `DELETE FROM registrations WHERE event_id = ?`, args: [id] });
  await db.execute({ sql: `DELETE FROM event_schedules WHERE event_id = ?`, args: [id] });
  const res = await db.execute({ sql: `DELETE FROM events WHERE id = ?`, args: [id] });
  return res.rowsAffected > 0;
}

export async function adminCreateScheduleItem(data: Partial<EventScheduleItem>): Promise<EventScheduleItem> {
  await ensureDbInitialized();
  const db = getDbClient();
  const id = data.id || `sch_${Date.now()}`;
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO event_schedules 
          (id, event_id, event_name, sub_round, day, date, date_formatted, start_time, end_time, time_range, venue, category, description, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.event_id || null,
      data.event_name || "Event",
      data.sub_round || null,
      data.day ?? 1,
      data.date || "2026-10-15",
      data.date_formatted || "15 October 2026",
      data.start_time || "09:00",
      data.end_time || "10:00",
      data.time_range || `${data.start_time || "09:00"} – ${data.end_time || "10:00"}`,
      data.venue || "Common",
      data.category || "General",
      data.description || "",
      now,
      now,
    ],
  });

  return (await getScheduleItemById(id))!;
}

export async function adminUpdateScheduleItem(id: string, data: Partial<EventScheduleItem>): Promise<boolean> {
  await ensureDbInitialized();
  const db = getDbClient();
  const now = new Date().toISOString();

  const updates: string[] = ["updated_at = ?"];
  const args: any[] = [now];

  if (data.event_name !== undefined) {
    updates.push("event_name = ?");
    args.push(data.event_name);
  }
  if (data.sub_round !== undefined) {
    updates.push("sub_round = ?");
    args.push(data.sub_round);
  }
  if (data.day !== undefined) {
    updates.push("day = ?");
    args.push(data.day);
  }
  if (data.date !== undefined) {
    updates.push("date = ?");
    args.push(data.date);
  }
  if (data.date_formatted !== undefined) {
    updates.push("date_formatted = ?");
    args.push(data.date_formatted);
  }
  if (data.start_time !== undefined) {
    updates.push("start_time = ?");
    args.push(data.start_time);
  }
  if (data.end_time !== undefined) {
    updates.push("end_time = ?");
    args.push(data.end_time);
  }
  if (data.time_range !== undefined) {
    updates.push("time_range = ?");
    args.push(data.time_range);
  }
  if (data.venue !== undefined) {
    updates.push("venue = ?");
    args.push(data.venue);
  }
  if (data.category !== undefined) {
    updates.push("category = ?");
    args.push(data.category);
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    args.push(data.description);
  }

  args.push(id);
  const res = await db.execute({
    sql: `UPDATE event_schedules SET ${updates.join(", ")} WHERE id = ?`,
    args,
  });

  return res.rowsAffected > 0;
}

export async function adminDeleteScheduleItem(id: string): Promise<boolean> {
  await ensureDbInitialized();
  const db = getDbClient();
  const res = await db.execute({ sql: `DELETE FROM event_schedules WHERE id = ?`, args: [id] });
  return res.rowsAffected > 0;
}

export async function adminGetAllParticipants(): Promise<Participant[]> {
  await ensureDbInitialized();
  const db = getDbClient();
  const res = await db.execute(`SELECT * FROM participants ORDER BY name ASC`);
  return res.rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    normalized_name: String(r.normalized_name),
    email: String(r.email),
    phone: r.phone ? String(r.phone) : "",
    class: r.class ? String(r.class) : "",
    school: String(r.school),
    is_online: Boolean(r.is_online),
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  }));
}

export async function adminGetParticipantRegistrations(): Promise<Registration[]> {
  await ensureDbInitialized();
  const db = getDbClient();
  const res = await db.execute(`
    SELECT r.*, p.name as participant_name, p.email as participant_email, p.school as participant_school, e.name as event_name
    FROM registrations r
    JOIN participants p ON r.participant_id = p.id
    JOIN events e ON r.event_id = e.id
    ORDER BY p.name ASC, e.name ASC
  `);
  return res.rows.map((r) => ({
    id: String(r.id),
    participant_id: String(r.participant_id),
    event_id: String(r.event_id),
    role: r.role ? String(r.role) : undefined,
    notes: r.notes ? String(r.notes) : undefined,
    created_at: r.created_at ? String(r.created_at) : undefined,
    participant_name: String(r.participant_name),
    participant_email: String(r.participant_email),
    participant_school: String(r.participant_school),
    event_name: String(r.event_name),
  }));
}

export async function adminAddRegistration(participantId: string, eventId: string): Promise<boolean> {
  await ensureDbInitialized();
  const db = getDbClient();
  const id = `reg_${participantId}_${eventId}`;
  const now = new Date().toISOString();
  const res = await db.execute({
    sql: `INSERT OR REPLACE INTO registrations (id, participant_id, event_id, created_at) VALUES (?, ?, ?, ?)`,
    args: [id, participantId, eventId, now],
  });
  return res.rowsAffected > 0;
}

export async function adminRemoveRegistration(participantId: string, eventId: string): Promise<boolean> {
  await ensureDbInitialized();
  const db = getDbClient();
  const res = await db.execute({
    sql: `DELETE FROM registrations WHERE participant_id = ? AND event_id = ?`,
    args: [participantId, eventId],
  });
  return res.rowsAffected > 0;
}

/**
 * Parses an uploaded Excel registration file buffer and updates participants/registrations.
 */
export async function adminImportExcelBuffer(buffer: Buffer): Promise<{
  participantsImported: number;
  registrationsImported: number;
  school: string;
}> {
  await ensureDbInitialized();
  const db = getDbClient();
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  let schoolName = "Delhi Public School Barra, Kanpur";
  if (rows[0] && rows[0][2]) {
    schoolName = String(rows[0][2]).trim();
  }

  const now = new Date().toISOString();
  let partCount = 0;
  let regCount = 0;

  // Track name -> participant_id map
  const nameToId: Record<string, string> = {};

  // 1. Process participant rows (rows 3 to 22 in typical sheet)
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const col0 = String(row[0] || "").trim();
    if (col0.toLowerCase().includes("event participation")) {
      break; // Reached events section
    }

    const name = String(row[2] || "").trim();
    const email = String(row[3] || "").trim();
    const phone = row[5] ? String(row[5]).trim() : "";
    const cls = row[6] ? String(row[6]).trim() : "";

    if (name && !name.toLowerCase().includes("name") && email) {
      const normalized = name.toLowerCase().replace(/\s+/g, " ");
      // Check existing
      const existing = await db.execute({
        sql: `SELECT id FROM participants WHERE email = ? OR normalized_name = ?`,
        args: [email, normalized],
      });

      const pId = existing.rows.length > 0 ? String(existing.rows[0].id) : `part_${Date.now()}_${partCount}`;
      await db.execute({
        sql: `INSERT OR REPLACE INTO participants 
              (id, name, normalized_name, email, phone, class, school, is_online, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          pId,
          name,
          normalized,
          email,
          phone,
          cls,
          schoolName,
          col0.toLowerCase().includes("online") ? 1 : 0,
          now,
          now,
        ],
      });

      nameToId[normalized] = pId;
      partCount++;
    }
  }

  // 2. Process event participation section
  let inEvents = false;
  let lastEventId: string | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const col0 = String(row[0] || "").trim();
    if (col0.toLowerCase().includes("event participation")) {
      inEvents = true;
      continue;
    }
    if (!inEvents) continue;
    if (col0.toLowerCase().includes("s. no.") || col0.toLowerCase().includes("flagship") || col0.toLowerCase().includes("technical") || col0.toLowerCase().includes("literary") || col0.toLowerCase().includes("design") || col0.toLowerCase().includes("creative") || col0.toLowerCase().includes("photography") || col0.toLowerCase().includes("business") || col0.toLowerCase().includes("gaming")) {
      continue;
    }

    const eventNum = col0;
    const eventName = String(row[1] || "").trim();
    let currentEventId: string | null = lastEventId;

    if (eventName) {
      // Find or create event
      const evCheck = await db.execute({
        sql: `SELECT id FROM events WHERE LOWER(name) = LOWER(?)`,
        args: [eventName],
      });
      if (evCheck.rows.length > 0) {
        currentEventId = String(evCheck.rows[0].id);
      } else {
        currentEventId = `ev_custom_${Date.now()}_${i}`;
        await db.execute({
          sql: `INSERT INTO events (id, name, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
          args: [currentEventId, eventName, "General", now, now],
        });
      }
      lastEventId = currentEventId;
    }

    if (currentEventId) {
      // Columns 3, 4, 5, 6... contain participant names
      for (let c = 3; c < row.length; c++) {
        const participantName = String(row[c] || "").trim();
        if (participantName) {
          const norm = participantName.toLowerCase().replace(/\s+/g, " ");
          let pId = nameToId[norm];
          if (!pId) {
            const pCheck = await db.execute({
              sql: `SELECT id FROM participants WHERE normalized_name = ?`,
              args: [norm],
            });
            if (pCheck.rows.length > 0) {
              pId = String(pCheck.rows[0].id);
            }
          }
          if (pId) {
            await db.execute({
              sql: `INSERT OR IGNORE INTO registrations (id, participant_id, event_id, created_at) VALUES (?, ?, ?, ?)`,
              args: [`reg_${pId}_${currentEventId}`, pId, currentEventId, now],
            });
            regCount++;
          }
        }
      }
    }
  }

  return {
    participantsImported: partCount,
    registrationsImported: regCount,
    school: schoolName,
  };
}
