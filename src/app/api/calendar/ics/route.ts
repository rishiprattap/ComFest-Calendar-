import { NextRequest, NextResponse } from "next/server";
import { getScheduleItemById, getScheduleList, lookupParticipantEvents } from "@/lib/db";
import { generateIcsContent } from "@/lib/calendar";
import { EventScheduleItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");
    const name = searchParams.get("name");
    const identifier = searchParams.get("identifier") || undefined;

    let eventsToExport: EventScheduleItem[] = [];
    let filename = "COMFEST-2026-My-Events.ics";
    let calendarName = "COMFEST'26";

    if (name) {
      // Participant-specific calendar download: contains ONLY registered events
      const lookup = await lookupParticipantEvents(name, identifier);
      if (lookup.status !== "found" || !lookup.events) {
        return new NextResponse("Participant not found or multiple matches", { status: 404 });
      }

      // Add ONLY registered events
      for (const ev of lookup.events) {
        if (ev.schedule && ev.schedule.length > 0) {
          eventsToExport.push(...ev.schedule);
        }
      }

      // Sort chronologically by day and start time
      eventsToExport.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return a.start_time.localeCompare(b.start_time);
      });

      const participantName = lookup.participant?.name || "";
      const safeName = participantName
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-");

      filename = safeName ? `COMFEST-2026-${safeName}-Events.ics` : "COMFEST-2026-My-Events.ics";
      calendarName = participantName ? `COMFEST'26 - ${participantName}` : "COMFEST'26 My Events";
    } else if (scheduleId) {
      // Individual event download
      const item = await getScheduleItemById(scheduleId);
      if (!item) {
        return new NextResponse("Schedule item not found", { status: 404 });
      }
      eventsToExport = [item];
      const safeEvent = item.event_name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      filename = `COMFEST-2026-${safeEvent}.ics`;
      calendarName = `COMFEST'26: ${item.event_name}`;
    } else {
      // Full master festival schedule download
      eventsToExport = await getScheduleList();
      filename = "COMFEST-2026-Full-Schedule.ics";
      calendarName = "COMFEST'26 Official Schedule";
    }

    const icsString = generateIcsContent(eventsToExport, calendarName);

    return new NextResponse(icsString, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "public, max-age=180, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("ICS generation error:", error);
    return new NextResponse("Failed to generate calendar file", { status: 500 });
  }
}
