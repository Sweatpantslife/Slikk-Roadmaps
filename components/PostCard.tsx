import Link from "next/link";
import type { BoardPost } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import { AppChip, CategoryBadge, StatusBadge } from "@/components/Badges";
import { VoteButton } from "@/components/VoteButton";

export function PostCard({ post, voted }: { post: BoardPost; voted: boolean }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-violet-200 hover:shadow-sm"
    >
      <VoteButton postId={post.id} count={post.voteCount} voted={voted} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium leading-snug text-stone-900 group-hover:text-violet-700">
            {post.pinned && (
              <span className="mr-1.5 inline-flex -translate-y-px items-center rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                Pinned
              </span>
            )}
            {post.title}
          </h3>
          <StatusBadge status={post.status} />
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-stone-500">{post.body}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-stone-400">
          <CategoryBadge category={post.category} />
          <AppChip appId={post.appId} />
          <span className="inline-flex items-center gap-1">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path
                d="M14 8c0 2.9-2.7 5.2-6 5.2-.8 0-1.5-.1-2.2-.3L2.5 14l.9-2.6C2.5 10.5 2 9.3 2 8c0-2.9 2.7-5.2 6-5.2s6 2.3 6 5.2z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            {post._count.comments}
          </span>
          <span>·</span>
          <span>
            {post.authorName} · {timeAgo(post.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
