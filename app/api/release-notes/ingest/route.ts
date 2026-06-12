import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isAuthorizedBearer } from "@/lib/api-auth";
import { APPS, getApp, SITE } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { parseLabels } from "@/lib/types";
import { parseFeedbackTrailers, shipCoveredPosts } from "@/lib/release-notes";

/**
 * Accepts release notes written outside the hub — typically by an AI agent
 * running in an app repo's CI on each release (see
 * examples/app-repo-release-notes.yml). Creates a changelog entry (draft by
 * default, for review at /admin/changelog) and marks any feedback posts
 * referenced by `Fixes-Feedback:` trailers in the submitted git log as
 * Shipped — notifying subscribers and covering the posts with this entry.
 *
 *   POST /api/release-notes/ingest
 *   Authorization: Bearer $RELEASE_NOTES_SECRET
 *   {
 *     "appId": "mobile",          // one of the ids in lib/config.ts APPS; omit for all-apps
 *     "version": "2.9.0",         // optional — used in the default title
 *     "title": "…",               // optional
 *     "body": "### Fixed\n- …",   // required — markdown release notes
 *     "labels": ["NEW","FIXED"],  // optional — defaults to ["NEW"]
 *     "publish": false,           // optional — default false (draft)
 *     "gitLog": "…",              // optional — scanned for Fixes-Feedback: trailers
 *     "shippedPostIds": ["…"]     // optional — explicit post ids to mark Shipped
 *   }
 */

const MAX_BODY_LENGTH = 50_000;

export async function POST(request: Request) {
  const secret = process.env.RELEASE_NOTES_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Set RELEASE_NOTES_SECRET to enable this endpoint." },
      { status: 503 },
    );
  }
  if (!isAuthorizedBearer(request, secret)) {
    return Response.json({ error: "Invalid or missing bearer token." }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const appIdRaw = payload.appId == null ? "" : String(payload.appId);
  const app = getApp(appIdRaw);
  if (appIdRaw && !app) {
    return Response.json(
      { error: `Unknown appId "${appIdRaw}" — use one of: ${APPS.map((a) => a.id).join(", ")} (or omit for all apps).` },
      { status: 400 },
    );
  }

  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  if (body.length < 10) {
    return Response.json({ error: "body is required (markdown release notes, at least 10 characters)." }, { status: 400 });
  }
  if (body.length > MAX_BODY_LENGTH) {
    return Response.json({ error: `body is too long (max ${MAX_BODY_LENGTH} characters).` }, { status: 400 });
  }

  const labelsRaw = Array.isArray(payload.labels) ? payload.labels.join(",") : String(payload.labels ?? "");
  const labels = parseLabels(labelsRaw);

  const version = typeof payload.version === "string" ? payload.version.trim() : "";
  const name = app?.name ?? SITE.name;
  const now = new Date();
  const title =
    (typeof payload.title === "string" && payload.title.trim()) ||
    (version ? `${name} ${version} — release notes` : `${name} release notes — ${formatDate(now)}`);

  const explicitIds = Array.isArray(payload.shippedPostIds) ? payload.shippedPostIds.map(String) : [];
  const trailerIds = typeof payload.gitLog === "string" ? parseFeedbackTrailers(payload.gitLog) : [];

  const entry = await prisma.changelogEntry.create({
    data: {
      title: title.slice(0, 140),
      body,
      labels: (labels.length > 0 ? labels : ["NEW"]).join(","),
      appId: app?.id ?? null,
      published: payload.publish === true,
      publishedAt: now,
    },
  });
  const shippedPosts = await shipCoveredPosts([...explicitIds, ...trailerIds], entry.id);

  revalidatePath("/", "layout");

  return Response.json(
    {
      entry: { id: entry.id, title: entry.title, appId: entry.appId, published: entry.published },
      shippedPosts,
    },
    { status: 201 },
  );
}
