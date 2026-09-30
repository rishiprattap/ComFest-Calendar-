import { NextRequest, NextResponse } from "next/server";
import { getScheduleItemById, getScheduleList } from "@/lib/db";
import { generateIcsContent } from "@/lib/calendar";
import { EventScheduleItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");

    let eventsToExport: EventScheduleItem[] = [];
    let filename = "comfest26-official.ics";

    if (scheduleId) {
      const item = await getScheduleItemById(scheduleId);
      if (!item) {
        return new NextResponse("Schedule item not found", { status: 404 });
      }
      eventsToExport = [item];
      filename = `comfest26-${item.event_name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.ics`;
    } else {
      // Default: Return the entire official COMFEST'26 schedule (Days 1–3 + online)
      eventsToExport = await getScheduleList();
    }

    const icsString = generateIcsContent(eventsToExport);

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
