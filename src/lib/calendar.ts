import { EventScheduleItem } from "./types";

/**
 * Converts a date (YYYY-MM-DD) and time (HH:mm) into compact format for Google Calendar / iCalendar.
 * Timezone is Asia/Kolkata (IST: UTC+5:30)
 */
export function formatGoogleCalendarDate(dateStr: string, timeStr: string): string {
  const cleanDate = dateStr.replace(/-/g, "");
  const cleanTime = timeStr.replace(/:/g, "") + "00";
  return `${cleanDate}T${cleanTime}`;
}

/**
 * Generates an official Google Calendar Add URL for a single event
 */
export function generateGoogleCalendarUrl(item: {
  eventName: string;
  subRound?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  description?: string;
}): string {
  const title = `COMFEST'26: ${item.eventName}${item.subRound ? ` (${item.subRound})` : ""}`;
  const startParam = formatGoogleCalendarDate(item.date, item.startTime || "09:00");
  const endParam = formatGoogleCalendarDate(item.date, item.endTime || "10:00");

  const location = `${item.venue}, Seth Anandram Jaipuria School, 70 Cantonment, Kanpur-208004`;
  const details = `${item.description || "COMFEST'26 Official Event"}\n\nFestival: COMFEST'26 (15–17 October 2026)\nHost: Jaipuria Computer Club (JCC)\nVenue: ${item.venue}\nOfficial Website: https://comfest-calendar.vercel.app`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startParam}/${endParam}`,
    details: details,
    location: location,
    ctz: "Asia/Kolkata",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates RFC 5545 iCalendar (.ics) format string for the official COMFEST'26 calendar.
 * Named "COMFEST'26", timezone Asia/Kolkata, containing all official events.
 * Compatible with Google Calendar, Apple Calendar, Outlook, Android and iOS.
 */
export function generateIcsContent(
  events: EventScheduleItem[],
  customTitle?: string
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jaipuria Computer Club//COMFEST'26 Official Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${customTitle || "COMFEST'26"}`,
    `X-WR-CALDESC:Official Event Schedule for COMFEST'26 (15–17 October 2026) at Seth Anandram Jaipuria School, Kanpur. Organized by Jaipuria Computer Club (JCC).`,
    "X-WR-TIMEZONE:Asia/Kolkata",
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "X-LIC-LOCATION:Asia/Kolkata",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];

  for (const ev of events) {
    const startCompact = formatGoogleCalendarDate(ev.date, ev.start_time || "09:00");
    const endCompact = formatGoogleCalendarDate(ev.date, ev.end_time || "10:00");
    const summary = `COMFEST'26: ${ev.event_name}${ev.sub_round ? ` (${ev.sub_round})` : ""}`;
    const location = `${ev.venue}, Seth Anandram Jaipuria School, 70 Cantonment, Kanpur, Uttar Pradesh 208004`;
    const details = `${ev.description || "COMFEST'26 Official Event"}\n\nFestival: COMFEST'26 (15–17 October 2026)\nVenue: ${ev.venue}\nCategory: ${ev.category}\nHost: Jaipuria Computer Club (JCC)\nOfficial Website: https://comfest-calendar.vercel.app`;
    const desc = details
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:comfest26-${ev.id}@jaipuriacomputerclub.org`,
      `DTSTAMP:${formatGoogleCalendarDate("2026-10-01", "00:00")}Z`,
      `DTSTART;TZID=Asia/Kolkata:${startCompact}`,
      `DTEND;TZID=Asia/Kolkata:${endCompact}`,
      `SUMMARY:${summary}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${desc}`,
      `URL:https://comfest-calendar.vercel.app/schedule`,
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
