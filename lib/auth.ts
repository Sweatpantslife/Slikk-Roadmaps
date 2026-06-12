import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cache } from "react";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

const SESSION_COOKIE = "slikk_session";
const SESSION_DAYS = 30;

// ---------------------------------------------------------------------------
// Passwords (scrypt, "salt:hash" hex)
// ---------------------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

let dummyHash: string | undefined;

/**
 * A hash to verify against when the email doesn't exist, so login response
 * timing doesn't reveal which emails are registered.
 */
export function getDummyPasswordHash(): string {
  dummyHash ??= hashPassword("timing-equalization-dummy");
  return dummyHash;
}

// ---------------------------------------------------------------------------
// Sessions (DB-backed, httpOnly cookie)
// ---------------------------------------------------------------------------

/** Creates a session row and sets the cookie. Server Actions / Route Handlers only. */
export async function startSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId, expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    store.delete(SESSION_COOKIE);
  }
}

/** The signed-in user, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user?.isAdmin) throw new Error("Not authorized");
  return user;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export const MIN_PASSWORD_LENGTH = 8;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Only allow same-site redirect targets like "/posts/abc". */
export function safeNextPath(next: string | null | undefined): string {
  // Reject "//host" and "/\host" — browsers normalize backslashes, turning
  // either into a protocol-relative redirect to another origin.
  if (next && /^\/(?![/\\])/.test(next)) return next;
  return "/";
}
