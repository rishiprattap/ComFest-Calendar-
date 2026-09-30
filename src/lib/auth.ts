import crypto from "crypto";

const SESSION_COOKIE_NAME = "cf_admin_session";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "comfest26_secure_admin_jwt_salt_2026_dpsbk";

/**
 * Returns the configured admin password from environment,
 * falling back to the designated default DPSBK20 if not set.
 */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "DPSBK20";
}

/**
 * Validates the provided plaintext password against the server-side environment password.
 * Uses constant-time buffer comparison to prevent timing attacks.
 */
export function verifyAdminPassword(inputPassword: string): boolean {
  if (!inputPassword || typeof inputPassword !== "string") {
    return false;
  }
  const expected = getAdminPassword();
  const inputBuffer = Buffer.from(inputPassword);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
}

/**
 * Creates a cryptographically signed HMAC token for the session.
 */
export function createAdminSessionToken(): string {
  const payload = {
    role: "admin",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const jsonStr = JSON.stringify(payload);
  const encodedPayload = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

/**
 * Validates the HMAC signature and expiration of an admin session token.
 */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSignature);
  if (sigBuffer.length !== expBuffer.length) return false;
  if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) return false;

  try {
    const payloadJson = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);
    if (payload.role !== "admin") return false;
    if (Date.now() > payload.expiresAt) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Inspects a Request or NextRequest to check if the caller is an authenticated admin.
 */
export function checkAdminSessionFromRequest(request: Request | any): boolean {
  // 1. Try NextRequest cookies API if available
  if (request && typeof request.cookies?.get === "function") {
    const c = request.cookies.get(SESSION_COOKIE_NAME);
    const token = typeof c === "string" ? c : c?.value;
    if (token && verifyAdminSessionToken(token)) {
      return true;
    }
  }

  // 2. Fallback to header inspection
  let cookieHeader = "";
  if (request?.headers) {
    if (typeof request.headers.get === "function") {
      cookieHeader = request.headers.get("cookie") || request.headers.get("Cookie") || "";
    } else if (typeof request.headers === "object") {
      cookieHeader = request.headers["cookie"] || request.headers["Cookie"] || "";
    }
  }

  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies[SESSION_COOKIE_NAME];
    return verifyAdminSessionToken(sessionToken);
  }

  return false;
}

/**
 * Helper to parse cookie string into key-value map.
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx !== -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      try {
        map[key] = decodeURIComponent(val);
      } catch {
        map[key] = val;
      }
    }
  }
  return map;
}

export const ADMIN_COOKIE_NAME = SESSION_COOKIE_NAME;
