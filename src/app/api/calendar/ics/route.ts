import { NextRequest, NextResponse } from "next/server";
import { getScheduleItemById, lookupParticipantEvents } from "@/lib/db";
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
    let filename = "comfest26-schedule.ics";

    if (scheduleId) {
      const item = await getScheduleItemById(scheduleId);
      if (!item) {
        return new NextResponse("Schedule item not found", { status: 404 });
      }
      eventsToExport = [item];
      filename = `comfest26-${item.event_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
    } else if (name) {
      const lookup = await lookupParticipantEvents(name, identifier);
      if (lookup.status !== "found" || !lookup.events) {
        return new NextResponse("Participant not found or multiple matches", { status: 400 });
      }

      for (const ev of lookup.events) {
        if (ev.schedule && ev.schedule.length > 0) {
          eventsToExport.push(...ev.schedule);
        }
      }
      const safeName = lookup.participant?.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "my-events";
      filename = `comfest26-${safeName}.ics`;
    } else {
      return new NextResponse("Missing query parameters (scheduleId or name)", { status: 400 });
    }

    const icsString = generateIcsContent(eventsToExport, name || undefined);

    return new NextResponse(icsString, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("ICS generation error:", error);
    return new NextResponse("Failed to generate calendar file", { status: 500 });
  }
}
