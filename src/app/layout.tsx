import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { Calendar, Search, Shield, Clock, ExternalLink } from "lucide-react";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "COMFEST'26 | Official Event Schedule & Calendar",
  description:
    "Official schedule and calendar for COMFEST'26 (15–17 October 2026), hosted by the Jaipuria Computer Club (JCC), Seth Anandram Jaipuria School, Kanpur. Search your registered events and add to Google Calendar.",
  keywords: [
    "Comfest 26",
    "Comfest 2026",
    "Comfest schedule",
    "Jaipuria Computer Club",
    "Seth Anandram Jaipuria School Kanpur",
    "Robowars",
    "Hackom",
  ],
  authors: [{ name: "Jaipuria Computer Club (JCC)" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/dps-bk.svg" type="image/svg+xml" />
      </head>
      <body>
        <nav className="navbar" id="site-navigation" aria-label="Main Navigation">
          <div className="container nav-inner">
            <Link href="/" className="nav-brand" id="nav-brand-logo">
              <span className="brand-badge">JCC</span>
              <span className="brand-text">COMFEST&apos;26</span>
            </Link>

            <ul className="nav-links" id="main-nav-links">
              <li className="nav-item">
                <Link href="/" id="nav-link-home">Home</Link>
              </li>
              <li className="nav-item">
                <Link href="/schedule" id="nav-link-schedule">Full Schedule</Link>
              </li>
              <li className="nav-item">
                <Link href="/day-1" id="nav-link-day1">Day 1</Link>
              </li>
              <li className="nav-item">
                <Link href="/day-2" id="nav-link-day2">Day 2</Link>
              </li>
              <li className="nav-item">
                <Link href="/day-3" id="nav-link-day3">Day 3</Link>
              </li>
              <li className="nav-item">
                <Link href="/my-events" id="nav-link-my-events" style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>
                  <Search size={15} /> Find My Events
                </Link>
              </li>
            </ul>

            <div className="nav-cta">
              <Link href="/my-events" className="btn-primary btn-sm" id="nav-cta-my-events">
                <Calendar size={15} /> My Schedule
              </Link>
              <Link href="/admin" className="btn-secondary btn-sm" id="nav-admin-link" title="Admin Portal">
                <Shield size={14} /> Admin
              </Link>
            </div>
          </div>
        </nav>

        <main id="main-content">{children}</main>

        <footer className="footer" id="site-footer">
          <div className="container">
            <div className="footer-inner">
              <div className="footer-col">
                <h4>COMFEST&apos;26</h4>
                <p>
                  The 27th edition of India&apos;s premier international student-run techno-cultural-literary festival.
                  Organized exclusively by the <strong>Jaipuria Computer Club (JCC)</strong>.
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Official Event Dates: <strong>15–17 October 2026</strong><br />
                  Seth Anandram Jaipuria School, 70 Cantonment, Kanpur-208004.
                </p>
              </div>

              <div className="footer-col">
                <h4>Quick Links</h4>
                <p><Link href="/schedule">Full Event Schedule</Link></p>
                <p><Link href="/day-1">Day 1 (15 October 2026)</Link></p>
                <p><Link href="/day-2">Day 2 (16 October 2026)</Link></p>
                <p><Link href="/day-3">Day 3 (17 October 2026)</Link></p>
                <p><Link href="/my-events">Find My Events</Link></p>
                <p><Link href="/admin">Coordinator / Admin Login</Link></p>
              </div>

              <div className="footer-col">
                <h4>Official Inquiries</h4>
                <p>Email: <a href="mailto:info@comfest.in">info@comfest.in</a></p>
                <p>School Website: <a href="https://www.jaipuriakanpur.edu.in" target="_blank" rel="noopener noreferrer">jaipuriakanpur.edu.in <ExternalLink size={12} style={{ display: "inline" }} /></a></p>
                <p>Festival Portal: <a href="https://www.comfest.in" target="_blank" rel="noopener noreferrer">comfest.in <ExternalLink size={12} style={{ display: "inline" }} /></a></p>
              </div>
            </div>

            <div className="footer-bottom">
              <div>
                &copy; 2026 Jaipuria Computer Club (JCC). All rights reserved.
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "0.82rem" }}>
                <span>Official Timetable: Brochure Pages 25–27</span>
                <span>•</span>
                <span>Grounds &bull; Auditorium &bull; Computer Lab &bull; ATL/Labs</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
