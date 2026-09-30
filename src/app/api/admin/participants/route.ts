import { NextRequest, NextResponse } from "next/server";
import { checkAdminSessionFromRequest } from "@/lib/auth";
import { adminGetAllParticipants } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const participants = await adminGetAllParticipants();
  return NextResponse.json({ success: true, count: participants.length, participants });
}
