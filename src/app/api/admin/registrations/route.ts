import { NextRequest, NextResponse } from "next/server";
import { checkAdminSessionFromRequest } from "@/lib/auth";
import {
  adminGetParticipantRegistrations,
  adminAddRegistration,
  adminRemoveRegistration,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const registrations = await adminGetParticipantRegistrations();
  return NextResponse.json({ success: true, count: registrations.length, registrations });
}

export async function POST(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { participant_id, event_id } = await request.json();
    if (!participant_id || !event_id) {
      return NextResponse.json(
        { success: false, error: "participant_id and event_id are required" },
        { status: 400 }
      );
    }
    const added = await adminAddRegistration(participant_id, event_id);
    return NextResponse.json({ success: added });
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
    const participant_id = searchParams.get("participant_id");
    const event_id = searchParams.get("event_id");

    if (!participant_id || !event_id) {
      return NextResponse.json(
        { success: false, error: "participant_id and event_id are required" },
        { status: 400 }
      );
    }
    const removed = await adminRemoveRegistration(participant_id, event_id);
    return NextResponse.json({ success: removed });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
