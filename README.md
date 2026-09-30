# COMFEST'26 &bull; Official Event Schedule & Calendar Portal

> **Jaipuria Computer Club (JCC)** &bull; **Seth Anandram Jaipuria School, Kanpur**  
> Official Festival Dates: **15–17 October 2026**

A production-ready event schedule and personalized calendar web application built for **COMFEST'26**. Designed with a futuristic dark-blue techno aesthetic matching the official brochure, backed by a persistent database, and ready to deploy directly to Vercel.

---

## Key Features

### 1. Public Portal
- **Home Page**: Futuristic hero section, live countdown to 15 October 2026, day navigation cards, official venue key, and festival highlights.
- **Full Event Schedule (`/schedule`)**: Searchable, filterable timetable across all 3 festival days, with instant venue and category filters.
- **Day-Specific Views**:
  - `Day 1` (15 October 2026): Registration, Opening Ceremony, Orientation, Code Baton, Strings Attached, CF Broadway Mega Theatre, Entertainment Evening.
  - `Day 2` (16 October 2026): Robowars, 24-Hour Hackom kickoff, Junk's The Punk, Mechanoid, Invert Oxford, The Third Front.
  - `Day 3` (17 October 2026): Hackom Presentations, Draft 1.0, Investor Incubator, Gambit, Blitz, and Grand Closing Ceremony.
- **Official Brochure Source of Truth**: All event timings, rounds, and venues directly match Pages 25–27 of the COMFEST'26 brochure.

### 2. "Find My Events" (`/my-events`)
- Search by registered participant name (e.g. *Rishi Pratap Singh*, *Saksham Mishra*, *Aditya Verma*).
- **Security & Privacy**:
  - Displays **ONLY** the events that the participant is registered for.
  - Does not expose other attendees' schedules or sensitive information.
  - **Duplicate-Name Guard**: If multiple attendees share the same name, the system does not guess—it prompts for an additional identifier (Email, Phone, or Class) before displaying their schedule.
- **Google Calendar Sync**:
  - **[ ADD MY EVENTS TO GOOGLE CALENDAR ]**: Prominent 1-click calendar sync.
  - **Individual Event Sync**: `[ + Add to Google Calendar ]` on each card with title, dates, start/end times, venue, and description.
  - **.ICS Export**: Cross-platform calendar import for Apple Calendar, Outlook, and mobile devices.

### 3. Protected Admin Control Panel (`/admin`)
- Server-side authenticated with initial password: `DPSBK20`.
- **Zero Client Secrets**: Password is verified strictly on the server and never hardcoded in frontend JavaScript.
- Supported operations:
  - Add / edit / delete events
  - Change event timings and venues
  - View all registered participants
  - View participant registrations
  - Add / remove registrations
  - Import / update registration Excel data (`.xlsx` upload parser)

---

## Deployment to Vercel

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete COMFEST'26 event schedule and calendar application"
   git push origin main
   ```
2. Import the project in [Vercel](https://vercel.com).
3. Add Environment Variable in Vercel Project Settings:
   - `ADMIN_PASSWORD` = `DPSBK20`
   - *(Optional Cloud DB)* `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (for distributed cloud SQLite).
4. Deploy!

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open browser at http://localhost:3000
```

---

## Database Architecture
- Relational schema with tables: `events`, `event_schedules`, `participants`, `registrations`, `admin_settings`.
- Pre-seeded with 18 participants and 34 event registrations from `CF'26 REGISTRATION SHEET F.xlsx` and 56 schedule slots from the official invitation brochure.
