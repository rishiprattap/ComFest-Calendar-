import { NextRequest, NextResponse } from "next/server";
import { lookupParticipantEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const identifier = typeof body.identifier === "string" ? body.identifier.trim() : undefined;

    if (!name || name.length < 2) {
      return NextResponse.json(
        {
          status: "not_found",
          message: "Please enter a valid participant name (at least 2 characters).",
        },
        { status: 400 }
      );
    }

    if (name.length > 80) {
      return NextResponse.json(
        { status: "not_found", message: "Name query is too long." },
        { status: 400 }
      );
    }

    const result = await lookupParticipantEvents(name, identifier);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Lookup error:", error);
    return NextResponse.json(
      { status: "not_found", message: "Failed to perform lookup." },
      { status: 500 }
    );
  }
}
