import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "slikk_admin";
const SESSION_DAYS = 30;

function sessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("slikk-admin-session-v1").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function isAdmin(): Promise<boolean> {
  const token = sessionToken();
  if (!token) return false;
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  return !!value && safeEqual(value, token);
}

/** Returns true when the password matches and a session was created. Server Actions only. */
export async function startAdminSession(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password || !safeEqual(password, expected)) return false;
  const store = await cookies();
  store.set(ADMIN_COOKIE, sessionToken()!, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    path: "/",
  });
  return true;
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
