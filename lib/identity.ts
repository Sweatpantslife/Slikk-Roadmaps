import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const UID_COOKIE = "slikk_uid";
const NAME_COOKIE = "slikk_name";
const YEAR = 60 * 60 * 24 * 365;

/** Read the visitor's anonymous id, if one has been issued. */
export async function getVisitorId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(UID_COOKIE)?.value;
}

/**
 * Read-or-issue the visitor's anonymous id. Cookies can only be written from
 * Server Actions / Route Handlers, so only call this from those contexts.
 */
export async function ensureVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(UID_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  store.set(UID_COOKIE, id, { httpOnly: true, sameSite: "lax", maxAge: YEAR, path: "/" });
  return id;
}

export async function getDisplayName(): Promise<string> {
  const store = await cookies();
  return store.get(NAME_COOKIE)?.value ?? "";
}

/** Remember the display name so forms can prefill it next time. Server Actions only. */
export async function rememberDisplayName(name: string): Promise<void> {
  const store = await cookies();
  store.set(NAME_COOKIE, name.slice(0, 50), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: YEAR,
    path: "/",
  });
}
