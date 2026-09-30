import { NextRequest, NextResponse } from "next/server";
import { checkAdminSessionFromRequest } from "@/lib/auth";
import {
  getScheduleList,
  adminCreateScheduleItem,
  adminUpdateScheduleItem,
  adminDeleteScheduleItem,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const schedule = await getScheduleList();
  return NextResponse.json({ success: true, schedule });
}

export async function POST(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    if (!data.event_name || !data.venue || !data.start_time || !data.end_time) {
      return NextResponse.json({ success: false, error: "Event name, venue, start time, and end time are required" }, { status: 400 });
    }
    const created = await adminCreateScheduleItem(data);
    return NextResponse.json({ success: true, scheduleItem: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ success: false, error: "Schedule Item ID is required" }, { status: 400 });
    }
    const updated = await adminUpdateScheduleItem(data.id, data);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Schedule Item ID is required" }, { status: 400 });
    }
    const deleted = await adminDeleteScheduleItem(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
