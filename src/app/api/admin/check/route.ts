import { NextRequest, NextResponse } from "next/server";
import { checkAdminSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const isAuth = checkAdminSessionFromRequest(request);
  return NextResponse.json({ authenticated: isAuth });
}
