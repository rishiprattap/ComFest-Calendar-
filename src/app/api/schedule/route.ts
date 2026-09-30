import { NextRequest, NextResponse } from "next/server";
import { getScheduleList } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dayParam = searchParams.get("day");
    const venue = searchParams.get("venue") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const day = dayParam !== null && dayParam !== "" ? Number(dayParam) : undefined;

    const items = await getScheduleList({
      day: isNaN(day as number) ? undefined : day,
      venue,
      category,
      search,
    });

    return NextResponse.json({ success: true, count: items.length, schedule: items });
  } catch (error: any) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
