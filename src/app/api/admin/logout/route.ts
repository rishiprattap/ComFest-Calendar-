import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function GET() {
  return POST();
}
