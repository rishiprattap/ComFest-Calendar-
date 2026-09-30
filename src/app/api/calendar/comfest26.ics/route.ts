import { NextRequest, NextResponse } from "next/server";
import { getScheduleList } from "@/lib/db";
import { generateIcsContent } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const events = await getScheduleList();
    const icsString = generateIcsContent(events);

    return new NextResponse(icsString, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `inline; filename="comfest26.ics"`,
        "Cache-Control": "public, max-age=180, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("ICS feed error:", error);
    return new NextResponse("Failed to generate calendar feed", { status: 500 });
  }
}
