import Link from "next/link";
import Countdown from "@/components/Countdown";
import VenueLegend from "@/components/VenueLegend";
import { getScheduleList } from "@/lib/db";
import EventCard from "@/components/EventCard";
import { Calendar, Search, ArrowRight, Zap, Trophy, Cpu, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch Day 1 flagship events for quick preview
  const day1Items = await getScheduleList({ day: 1 });
  const featured = day1Items.filter((i) =>
    ["CF Broadway", "Code Baton", "Strings Attached", "Opening Ceremony"].includes(i.event_name)
  );

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={14} /> JAIPURIA COMPUTER CLUB PRESENTS • 27TH EDITION
          </div>

          <h1 className="hero-title">
            <span className="gradient-text">COMFEST&apos;26</span>
            <br />
            <span className="gradient-text-alt" style={{ fontSize: "0.65em", fontWeight: 700 }}>
              OFFICIAL EVENT SCHEDULE & CALENDAR
            </span>
          </h1>

          <p className="hero-subtitle">
            15–17 October 2026 &bull; Seth Anandram Jaipuria School, Kanpur.
            Explore the official timetable, search your registered events, and sync your personalized itinerary to Google Calendar with a single click.
          </p>

          <div className="hero-cta">
            <Link href="/my-events" className="btn-primary" id="home-cta-find-events">
              <Search size={18} /> Find My Events
            </Link>
            <Link href="/schedule" className="btn-secondary" id="home-cta-full-schedule">
              <Calendar size={18} /> View Full Timetable
            </Link>
          </div>

          <Countdown />
        </div>
      </section>

      {/* DAY QUICK JUMP SECTION */}
      <section style={{ padding: "3rem 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "1.5rem", textAlign: "center" }}>
            Explore By <span className="gradient-text">Festival Days</span>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            <Link href="/day-1" className="glass-card" style={{ textDecoration: "none" }} id="card-jump-day-1">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span className="badge badge-flagship">15 October 2026</span>
                <ArrowRight size={16} style={{ color: "var(--accent-cyan)" }} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>DAY 1</h3>
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
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>DAY 2</h3>
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
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>DAY 3</h3>
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
            <Link href="/schedule" className="btn-secondary btn-sm" id="btn-view-all-schedule">
              Browse All 50+ Events <ArrowRight size={14} />
            </Link>
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
                  <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Events</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>3</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", textTransform: "uppercase" }}>High-Octane Days</div>
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>6</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", textTransform: "uppercase" }}>Official Venues</div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ border: "1px solid var(--border-glow)", padding: "2.25rem" }}>
              <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "10px" }}>
                <Zap size={20} style={{ color: "var(--accent-cyan)" }} /> Are You a Registered Participant?
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "1.5rem", lineHeight: "1.6" }}>
                Look up your personalized schedule right away! Simply enter your registered name to view ONLY the events you are competing in, along with exact time slots, venues, and Google Calendar sync.
              </p>
              <Link href="/my-events" className="btn-primary" style={{ width: "100%" }}>
                <Search size={16} /> Open &quot;Find My Events&quot;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
