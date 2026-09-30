import { NextRequest, NextResponse } from "next/server";
import { checkAdminSessionFromRequest } from "@/lib/auth";
import { adminImportExcelBuffer } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!checkAdminSessionFromRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await adminImportExcelBuffer(buffer);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.participantsImported} participants and ${result.registrationsImported} registrations for ${result.school}.`,
      result,
    });
  } catch (err: any) {
    console.error("Excel import error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to parse Excel file: " + err.message },
      { status: 500 }
    );
  }
}
