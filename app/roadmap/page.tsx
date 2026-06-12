import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { getRoadmapPosts, getVotedPostIds } from "@/lib/queries";
import { ROADMAP_COLUMNS, STATUS_META } from "@/lib/types";
import { formatShortDate } from "@/lib/format";
import { AppChip, CategoryBadge } from "@/components/Badges";
import { VoteButton } from "@/components/VoteButton";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What's planned, what's being built, and what just shipped.",
};

type RoadmapPost = Prisma.PostGetPayload<{ include: { _count: { select: { comments: true } } } }>;

function RoadmapCard({ post, voted }: { post: RoadmapPost; voted: boolean }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-3.5 transition-all hover:border-violet-200 hover:shadow-sm"
    >
      <VoteButton postId={post.id} count={post.voteCount} voted={voted} size="sm" />
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium leading-snug text-stone-900 group-hover:text-violet-700">{post.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-stone-400">
          <CategoryBadge category={post.category} />
          <AppChip appId={post.appId} />
          {post.status === "SHIPPED" && post.shippedAt && (
            <span className="font-medium text-emerald-600">Shipped {formatShortDate(post.shippedAt)}</span>
          )}
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
              <path
                d="M14 8c0 2.9-2.7 5.2-6 5.2-.8 0-1.5-.1-2.2-.3L2.5 14l.9-2.6C2.5 10.5 2 9.3 2 8c0-2.9 2.7-5.2 6-5.2s6 2.3 6 5.2z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            {post._count.comments}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function RoadmapPage() {
  const { planned, inProgress, shipped } = await getRoadmapPosts();
  const columns = [planned, inProgress, shipped];
  const allIds = columns.flat().map((p) => p.id);
  const votedIds = await getVotedPostIds(allIds);

  return (
    <div>
      <section className="py-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Roadmap</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-stone-500">
          Follow ideas from the board as they move from planned to shipped. Vote on anything that matters to you —
          it directly shapes what we pick up next.
        </p>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {ROADMAP_COLUMNS.map((column, i) => {
          const meta = STATUS_META[column.status];
          const posts = columns[i];
          return (
            <section key={column.status} className="rounded-2xl bg-stone-100/70 p-3">
              <header className="px-1.5 pb-3 pt-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                  <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
                  {meta.label}
                  <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-stone-500 ring-1 ring-stone-200">
                    {posts.length}
                  </span>
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">{column.description}</p>
              </header>
              <div className="space-y-2.5">
                {posts.map((post) => (
                  <RoadmapCard key={post.id} post={post} voted={votedIds.has(post.id)} />
                ))}
                {posts.length === 0 && (
                  <p className="rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-400">
                    Nothing here yet
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
