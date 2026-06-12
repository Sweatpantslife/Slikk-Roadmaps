import { createHash, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { generateReleaseNotes } from "@/lib/release-notes";

/**
 * Headless trigger for release-notes generation — point a cron job or CI
 * step at it. Disabled until RELEASE_NOTES_SECRET is set in the environment.
 *
 *   curl -X POST -H "Authorization: Bearer $RELEASE_NOTES_SECRET" \
 *     https://your-host/api/release-notes              # drafts for review
 *   curl -X POST … "https://your-host/api/release-notes?publish=1"
 */

function isAuthorized(request: Request, secret: string): boolean {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  // Hash both sides so timingSafeEqual gets equal-length buffers.
  const a = createHash("sha256").update(token).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.RELEASE_NOTES_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Set RELEASE_NOTES_SECRET to enable this endpoint." },
      { status: 503 },
    );
  }
  if (!isAuthorized(request, secret)) {
    return Response.json({ error: "Invalid or missing bearer token." }, { status: 401 });
  }

  const publish = new URL(request.url).searchParams.get("publish") === "1";
  const entries = await generateReleaseNotes({ publish });
  if (entries.length > 0) revalidatePath("/", "layout");

  return Response.json({
    created: entries.map(({ entryId, appId, title, postCount, published }) => ({
      id: entryId,
      appId,
      title,
      postCount,
      published,
    })),
  });
}
