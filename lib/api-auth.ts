import { createHash, timingSafeEqual } from "crypto";

/**
 * Checks a request's `Authorization: Bearer <token>` header against a shared
 * secret. Hashes both sides so timingSafeEqual gets equal-length buffers.
 */
export function isAuthorizedBearer(request: Request, secret: string): boolean {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = createHash("sha256").update(token).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}
