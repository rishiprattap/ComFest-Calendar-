import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "COMFEST'26 | Official Event Schedule & Google Calendar",
  description:
    "Official schedule and Google Calendar for COMFEST'26 (15–17 October 2026), hosted by Jaipuria Computer Club (JCC), Seth Anandram Jaipuria School, Kanpur. Add events to Google Calendar and view timings.",
  keywords: [
    "Comfest 26",
    "Comfest 2026",
    "Comfest schedule",
    "Comfest Google Calendar",
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
        <Navbar />

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
                <p><Link href="/my-events">My Events (Participant Search)</Link></p>
                <p><Link href="/day-1">Day 1 (15 October 2026)</Link></p>
                <p><Link href="/day-2">Day 2 (16 October 2026)</Link></p>
                <p><Link href="/day-3">Day 3 (17 October 2026)</Link></p>
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
