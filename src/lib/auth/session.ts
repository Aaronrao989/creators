import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal stateless session: an HMAC-signed `userId.expiry.signature` token in
 * an httpOnly cookie. No external auth library needed for this basic setup.
 *
 * Set AUTH_SECRET in production. The dev fallback keeps local dev working.
 */
const COOKIE = "ca_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days (seconds)
const SECRET = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function createToken(userId: string): string {
  const payload = `${userId}.${Date.now() + MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = sign(`${userId}.${exp}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Date.now() > Number(exp)) return null;
  return userId;
}

export function setSessionCookie(userId: string): void {
  cookies().set(COOKIE, createToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export function clearSessionCookie(): void {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Returns the signed-in user id from the request cookie, or null. */
export function getSessionUserId(): string | null {
  return verifyToken(cookies().get(COOKIE)?.value);
}
