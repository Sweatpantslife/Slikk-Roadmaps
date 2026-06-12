"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deletePost, setPostStatus, togglePinned } from "@/lib/actions";
import { STATUSES, STATUS_META } from "@/lib/types";

type TriagePost = {
  id: string;
  title: string;
  status: string;
  pinned: boolean;
  voteCount: number;
  commentCount: number;
  categoryLabel: string;
  appName?: string;
};

export function TriageRow({ post }: { post: TriagePost }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5 ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 flex-1 basis-64">
        <Link href={`/posts/${post.id}`} className="font-medium text-stone-900 hover:text-violet-700">
          {post.pinned && (
            <span className="mr-1.5 inline-flex -translate-y-px items-center rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
              Pinned
            </span>
          )}
          {post.title}
        </Link>
        <p className="mt-0.5 text-xs text-stone-400">
          {post.voteCount} {post.voteCount === 1 ? "vote" : "votes"} · {post.commentCount}{" "}
          {post.commentCount === 1 ? "comment" : "comments"} · {post.categoryLabel}
          {post.appName ? ` · ${post.appName}` : ""}
        </p>
      </div>

      <select
        defaultValue={post.status}
        disabled={isPending}
        onChange={(e) => startTransition(() => setPostStatus(post.id, e.target.value))}
        aria-label={`Status for ${post.title}`}
        className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-violet-400"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => togglePinned(post.id))}
        className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
      >
        {post.pinned ? "Unpin" : "Pin"}
      </button>

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm(`Delete "${post.title}" and all of its votes and comments?`)) {
            startTransition(() => deletePost(post.id));
          }
        }}
        className="rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
      >
        Delete
      </button>
    </div>
  );
}
