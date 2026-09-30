import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, createAdminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json({ success: false, error: "Password required" }, { status: 400 });
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      // Delay response slightly to prevent brute force timing
      await new Promise((resolve) => setTimeout(resolve, 300));
      return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const isHttps = request.url.startsWith("https://");

    const response = NextResponse.json({ success: true, message: "Authenticated successfully" });

    // Set HTTP-only session cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}
