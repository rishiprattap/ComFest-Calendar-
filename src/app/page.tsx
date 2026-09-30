import Link from "next/link";
import Countdown from "@/components/Countdown";
import VenueLegend from "@/components/VenueLegend";
import { getScheduleList } from "@/lib/db";
import EventCard from "@/components/EventCard";
import AddCalendarButton from "@/components/AddCalendarButton";
import { Calendar, ArrowRight, Sparkles, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch Day 1 flagship events for quick preview
  const day1Items = await getScheduleList({ day: 1 });
  const featured = day1Items.filter((i) =>
    ["Opening Ceremony", "Code Baton", "CF Broadway", "Strings Attached"].includes(i.event_name)
  );

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container" style={{ textAlign: "center", maxWidth: "850px" }}>
          <div className="hero-pill" style={{ margin: "0 auto 1.25rem" }}>
            <Sparkles size={14} /> JAIPURIA COMPUTER CLUB PRESENTS • 27TH EDITION
          </div>

          <h1 className="hero-title" style={{ marginBottom: "0.75rem" }}>
            <span className="gradient-text">COMFEST&apos;26</span>
          </h1>

          <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", letterSpacing: "1px", marginBottom: "0.5rem" }}>
            15–17 OCTOBER 2026
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--accent-cyan)", fontSize: "1.05rem", fontWeight: 600, marginBottom: "2rem" }}>
            <MapPin size={18} /> Seth Anandram Jaipuria School, Kanpur
          </div>

          {/* MAIN PROMINENT CTA ACTIONS */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", marginBottom: "1rem" }}>
            <AddCalendarButton
              label="📅 ADD TO GOOGLE CALENDAR"
              className="btn-primary"
              id="hero-add-to-google-calendar"
              style={{
                fontSize: "1.15rem",
                padding: "16px 36px",
                fontWeight: 900,
                letterSpacing: "0.5px",
                boxShadow: "0 0 35px rgba(0, 240, 255, 0.4)",
              }}
            />

            <Link
              href="/schedule"
              className="btn-secondary"
              id="hero-view-full-schedule"
              style={{ fontSize: "1rem", padding: "10px 24px", color: "var(--text-main)" }}
            >
              View Full Schedule <ArrowRight size={16} />
            </Link>
          </div>

          {/* MANDATORY EXPLANATION BELOW BUTTON */}
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.98rem",
              maxWidth: "540px",
              margin: "0 auto 2.5rem",
              lineHeight: "1.6",
            }}
            id="hero-calendar-phone-sync-note"
          >
            &ldquo;Add the official COMFEST&apos;26 calendar to see the complete event schedule on your phone.&rdquo;
          </p>

          <Countdown />
        </div>
      </section>

      {/* EXPLORE BY FESTIVAL DAYS */}
      <section style={{ padding: "3rem 0" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Explore By <span className="gradient-text">Festival Days</span>
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
              Official Timetable from pages 25–27 of the COMFEST&apos;26 brochure
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <Link href="/day-1" className="glass-card" style={{ textDecoration: "none" }} id="card-jump-day-1">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="badge badge-flagship">15 October 2026</span>
                <ArrowRight size={16} style={{ color: "var(--accent-cyan)" }} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
                DAY 1 — 15 OCTOBER
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "14px" }}>
                Inauguration &bull; Orientation &bull; Code Baton &bull; Strings Attached &bull; CF Broadway Mega Theatre
              </p>
              <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700 }}>
                View Day 1 Timetable &rarr;
              </span>
            </Link>

            <Link href="/day-2" className="glass-card" style={{ textDecoration: "none" }} id="card-jump-day-2">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="badge badge-technical">16 October 2026</span>
                <ArrowRight size={16} style={{ color: "var(--accent-cyan)" }} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
                DAY 2 — 16 OCTOBER
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "14px" }}>
                Robowars &bull; Hackom (24-Hour) &bull; Junk&apos;s The Punk &bull; Mechanoid &bull; Invert Oxford
              </p>
              <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700 }}>
                View Day 2 Timetable &rarr;
              </span>
            </Link>

            <Link href="/day-3" className="glass-card" style={{ textDecoration: "none" }} id="card-jump-day-3">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="badge badge-literary">17 October 2026</span>
                <ArrowRight size={16} style={{ color: "var(--accent-cyan)" }} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
                DAY 3 — 17 OCTOBER
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "14px" }}>
                Hackom Presentations &bull; Draft 1.0 &bull; Investor Incubator &bull; Gambit &bull; Grand Closing Ceremony
              </p>
              <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700 }}>
                View Day 3 Timetable &rarr;
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* VENUE COLOR CODE LEGEND */}
      <section style={{ padding: "1.5rem 0" }}>
        <div className="container">
          <VenueLegend />
        </div>
      </section>

      {/* FEATURED EVENTS HIGHLIGHT */}
      <section style={{ padding: "2.5rem 0 4rem" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.75rem", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                OFFICIAL SOURCE OF TRUTH (BROCHURE PAGES 25–27)
              </span>
              <h2 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#fff", marginTop: "4px" }}>
                Festival Highlights
              </h2>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <AddCalendarButton
                label="📅 Add Full Calendar"
                className="btn-primary btn-sm"
                id="btn-highlights-add-calendar"
              />
              <Link href="/schedule" className="btn-secondary btn-sm" id="btn-view-all-schedule">
                Browse All Events <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {featured.map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT JCC & COMFEST */}
      <section style={{ padding: "3rem 0", background: "rgba(4, 9, 25, 0.4)", borderTop: "1px solid var(--border-dim)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
                Crafted by Students, <br /><span className="gradient-text">Engineered for Excellence</span>
              </h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "1.25rem", lineHeight: "1.7" }}>
                COMFEST began in 1998 under the vision of five students and two teachers. Over 27 editions, it has evolved into one of India&apos;s most celebrated student-managed international techno-cultural fests, welcoming delegates from across the nation and globe to Seth Anandram Jaipuria School, Kanpur.
              </p>
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>35+</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Events</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-purple)", fontFamily: "var(--font-mono)" }}>3 Days</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Oct 15–17, 2026</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}>1000+</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>Delegates</div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: "2rem", textAlign: "center", border: "1px solid var(--border-glow)" }}>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Official Schedule Integration
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "12px" }}>
                Get the COMFEST&apos;26 Calendar
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                Download the official festival calendar file to add the complete event schedule to your Google Calendar app.
              </p>
              <AddCalendarButton
                label="📅 ADD COMFEST'26 TO GOOGLE CALENDAR"
                className="btn-primary"
                id="btn-about-add-calendar"
                style={{ width: "100%", justifyContent: "center" }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
