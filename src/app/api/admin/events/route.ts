import { NextRequest, NextResponse } from "next/server";
import { checkAdminSessionFromRequest } from "@/lib/auth";
import {
  adminGetAllEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const events = await adminGetAllEvents();
  return NextResponse.json({ success: true, events });
}

export async function POST(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    if (!data.name || !data.category) {
      return NextResponse.json({ success: false, error: "Name and Category are required" }, { status: 400 });
    }
    const created = await adminCreateEvent(data);
    return NextResponse.json({ success: true, event: created });
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
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }
    const updated = await adminUpdateEvent(data.id, data);
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
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }
    const deleted = await adminDeleteEvent(id);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
