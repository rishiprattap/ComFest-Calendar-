import { EventScheduleItem } from "./types";

/**
 * Converts a date (YYYY-MM-DD) and time (HH:mm) into UTC/Local Google Calendar compact string
 * Timezone is Asia/Kolkata (IST: UTC+5:30)
 */
export function formatGoogleCalendarDate(dateStr: string, timeStr: string): string {
  // Example dateStr: "2026-10-15", timeStr: "11:30"
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

  const location = `${item.venue}, Seth Anandram Jaipuria School, Kanpur`;
  const details = `${item.description || "COMFEST'26 Event"}\n\nOfficial Festival Schedule: 15–17 October 2026\nHost: Jaipuria Computer Club (JCC)\nVenue: ${item.venue}\nWebsite: https://comfest.in`;

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
 * Generates RFC 5545 iCalendar (.ics) format string for one or multiple events.
 * Compatible with Google Calendar, Apple Calendar, Outlook, Android and iOS.
 */
export function generateIcsContent(
  events: EventScheduleItem[],
  participantName?: string
): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Jaipuria Computer Club//COMFEST'26 Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:COMFEST'26${participantName ? ` - ${participantName}'s Schedule` : " Schedule"}`,
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
    const location = `${ev.venue}, Seth Anandram Jaipuria School, Kanpur`;
    const desc = (ev.description || "COMFEST'26 Official Event")
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
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
