import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { Category, Sort, Status } from "@/lib/types";
import type { Prisma } from "@prisma/client";

const TRENDING_WINDOW_DAYS = 14;

export type BoardFilters = {
  q?: string;
  category?: Category;
  appId?: string;
  sort: Sort;
};

export type BoardPost = Prisma.PostGetPayload<{
  include: { author: { select: { name: true } }; _count: { select: { comments: true } } };
}> & { recentVotes: number };

function boardWhere({ q, category, appId }: Omit<BoardFilters, "sort">): Prisma.PostWhereInput {
  return {
    ...(category ? { category } : {}),
    ...(appId ? { appId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export async function getBoardPosts(filters: BoardFilters): Promise<BoardPost[]> {
  const since = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const posts = await prisma.post.findMany({
    where: boardWhere(filters),
    include: {
      author: { select: { name: true } },
      _count: { select: { comments: true, votes: { where: { createdAt: { gte: since } } } } },
    },
    orderBy:
      filters.sort === "new"
        ? [{ createdAt: "desc" }]
        : [{ voteCount: "desc" }, { createdAt: "desc" }],
  });

  const withRecent = posts.map((p) => ({ ...p, recentVotes: p._count.votes }));

  if (filters.sort === "trending") {
    withRecent.sort(
      (a, b) =>
        b.recentVotes - a.recentVotes ||
        b.voteCount - a.voteCount ||
        b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  // Pinned posts float to the top in every sort.
  withRecent.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return withRecent;
}

/** Tab counts for the board: total + per category, honoring search/app filters. */
export async function getCategoryCounts(filters: Omit<BoardFilters, "sort" | "category">) {
  const grouped = await prisma.post.groupBy({
    by: ["category"],
    where: boardWhere({ ...filters, category: undefined }),
    _count: { _all: true },
  });
  const byCategory = Object.fromEntries(grouped.map((g) => [g.category, g._count._all]));
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
  return { total, byCategory: byCategory as Record<string, number> };
}

/** The set of post ids the signed-in user has voted for (among the given ids). */
export async function getVotedPostIds(postIds: string[]): Promise<Set<string>> {
  const user = await getCurrentUser();
  if (!user || postIds.length === 0) return new Set();
  const votes = await prisma.vote.findMany({
    where: { userId: user.id, postId: { in: postIds } },
    select: { postId: true },
  });
  return new Set(votes.map((v) => v.postId));
}

const SHIPPED_LIMIT = 30;

export async function getRoadmapPosts() {
  const include = { _count: { select: { comments: true } } } as const;
  const [planned, inProgress, shipped] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PLANNED" satisfies Status },
      include,
      orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
    }),
    prisma.post.findMany({
      where: { status: "IN_PROGRESS" satisfies Status },
      include,
      orderBy: [{ voteCount: "desc" }, { createdAt: "desc" }],
    }),
    prisma.post.findMany({
      where: { status: "SHIPPED" satisfies Status },
      include,
      orderBy: [{ shippedAt: "desc" }],
      take: SHIPPED_LIMIT,
    }),
  ]);
  return { planned, inProgress, shipped };
}

export async function getPost(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      comments: { orderBy: { createdAt: "asc" }, include: { author: { select: { name: true } } } },
      _count: { select: { comments: true } },
    },
  });
}

export async function isSubscribed(postId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const sub = await prisma.subscription.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
    select: { id: true },
  });
  return !!sub;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  return prisma.notification.count({ where: { userId: user.id, readAt: null } });
}

const NOTIFICATIONS_LIMIT = 50;

export async function getNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];
  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: NOTIFICATIONS_LIMIT,
  });
}

export async function getChangelogEntries(includeUnpublished = false) {
  return prisma.changelogEntry.findMany({
    where: includeUnpublished ? {} : { published: true },
    orderBy: { publishedAt: "desc" },
  });
}
