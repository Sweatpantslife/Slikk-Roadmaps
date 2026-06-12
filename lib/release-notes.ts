/**
 * Automated release notes.
 *
 * Every post marked SHIPPED stays "pending" until it's covered by a changelog
 * entry (Post.changelogEntryId). Generation groups the pending posts per app
 * (cross-app posts get their own entry), buckets them into New / Improved /
 * Fixed from their category, and writes one markdown entry per app — as a
 * draft for review, or published directly.
 *
 * Triggered from the admin UI (/admin/changelog), the CLI
 * (`npm run release-notes`), or POST /api/release-notes for cron jobs.
 */

import { prisma } from "@/lib/db";
import { APPS, SITE } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { CHANGELOG_LABELS, isCategory, type Category, type ChangelogLabel } from "@/lib/types";

const CATEGORY_LABEL: Record<Category, ChangelogLabel> = {
  FEATURE: "NEW",
  IMPROVEMENT: "IMPROVED",
  BUG: "FIXED",
};

const SECTION_HEADING: Record<ChangelogLabel, string> = {
  NEW: "New",
  IMPROVED: "Improved",
  FIXED: "Fixed",
};

export type PendingPost = {
  id: string;
  title: string;
  category: string;
  appId: string | null;
  voteCount: number;
};

export type PendingGroup = {
  appId: string | null;
  /** App display name; the site name for the cross-app group. */
  appName: string;
  posts: PendingPost[];
};

/** Shipped posts that no changelog entry covers yet, most-voted first. */
export async function getPendingShippedPosts(): Promise<PendingPost[]> {
  return prisma.post.findMany({
    where: { status: "SHIPPED", changelogEntryId: null },
    select: { id: true, title: true, category: true, appId: true, voteCount: true },
    orderBy: [{ voteCount: "desc" }, { shippedAt: "desc" }],
  });
}

/** Pending posts grouped per app (APPS order); cross-app posts last. */
export function groupByApp(posts: PendingPost[]): PendingGroup[] {
  const groups: PendingGroup[] = [
    ...APPS.map((app) => ({ appId: app.id, appName: app.name, posts: [] as PendingPost[] })),
    { appId: null, appName: SITE.name, posts: [] },
  ];
  const crossApp = groups[groups.length - 1];
  for (const post of posts) {
    (groups.find((g) => g.appId === post.appId) ?? crossApp).posts.push(post);
  }
  return groups.filter((g) => g.posts.length > 0);
}

export async function getPendingGroups(): Promise<PendingGroup[]> {
  return groupByApp(await getPendingShippedPosts());
}

function escapeMarkdown(text: string): string {
  return text.replace(/[[\]]/g, "\\$&");
}

/** Title, markdown body, and labels for one app's release notes. */
export function composeEntry(group: PendingGroup, now: Date) {
  const byLabel = new Map<ChangelogLabel, PendingPost[]>();
  for (const post of group.posts) {
    const label = isCategory(post.category) ? CATEGORY_LABEL[post.category] : "IMPROVED";
    byLabel.set(label, [...(byLabel.get(label) ?? []), post]);
  }

  const labels = CHANGELOG_LABELS.filter((label) => byLabel.has(label));
  const sections = labels.map((label) => {
    const bullets = byLabel
      .get(label)!
      .map((p) => `- [${escapeMarkdown(p.title)}](/posts/${p.id}) — ${p.voteCount} ${p.voteCount === 1 ? "vote" : "votes"}`);
    return `### ${SECTION_HEADING[label]}\n\n${bullets.join("\n")}`;
  });
  const intro = group.appId
    ? `The latest ${group.appName} updates, straight from the feedback board.`
    : `Updates across all ${SITE.name} apps, straight from the feedback board.`;

  return {
    title: `${group.appName} release notes — ${formatDate(now)}`,
    body: `${intro}\n\n${sections.join("\n\n")}`,
    labels: labels.join(","),
  };
}

export type GeneratedEntry = {
  entryId: string;
  appId: string | null;
  appName: string;
  title: string;
  postCount: number;
  published: boolean;
};

/**
 * Creates one changelog entry per app with pending shipped posts and marks
 * those posts as covered. Idempotent: a re-run only picks up posts shipped
 * since the last one. Returns the created entries (empty when caught up).
 */
export async function generateReleaseNotes(
  options: { publish?: boolean; now?: Date } = {},
): Promise<GeneratedEntry[]> {
  const { publish = false, now = new Date() } = options;
  const groups = await getPendingGroups();

  const entries = await prisma.$transaction(
    groups.map((group) => {
      const { title, body, labels } = composeEntry(group, now);
      return prisma.changelogEntry.create({
        data: {
          title,
          body,
          labels,
          appId: group.appId,
          published: publish,
          publishedAt: now,
          posts: { connect: group.posts.map((p) => ({ id: p.id })) },
        },
      });
    }),
  );

  return entries.map((entry, i) => ({
    entryId: entry.id,
    appId: entry.appId,
    appName: groups[i].appName,
    title: entry.title,
    postCount: groups[i].posts.length,
    published: entry.published,
  }));
}
