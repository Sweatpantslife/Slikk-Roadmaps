import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { getDisplayName } from "@/lib/identity";
import { getPost, getVotedPostIds } from "@/lib/queries";
import { formatDate, timeAgo } from "@/lib/format";
import { SITE } from "@/lib/config";
import { AppChip, CategoryBadge, StatusBadge } from "@/components/Badges";
import { CommentForm } from "@/components/CommentForm";
import { Markdown } from "@/components/Markdown";
import { VoteButton } from "@/components/VoteButton";
import { DeleteCommentButton } from "@/components/admin/DeleteCommentButton";
import { PostAdminPanel } from "@/components/admin/PostAdminPanel";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getPost((await params).id);
  return { title: post ? post.title : "Post not found" };
}

export default async function PostPage({ params }: { params: Params }) {
  const { id } = await params;
  const [post, admin, defaultName] = await Promise.all([getPost(id), isAdmin(), getDisplayName()]);
  if (!post) notFound();
  const votedIds = await getVotedPostIds([post.id]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path d="M9.5 3.5L5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to board
      </Link>

      <article className="mt-4 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <VoteButton postId={post.id} count={post.voteCount} voted={votedIds.has(post.id)} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={post.status} />
              <CategoryBadge category={post.category} />
              <AppChip appId={post.appId} />
              {post.pinned && (
                <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                  Pinned
                </span>
              )}
            </div>
            <h1 className="mt-2 text-xl font-semibold leading-snug text-stone-900 sm:text-2xl">{post.title}</h1>
            <p className="mt-1 text-sm text-stone-400">
              {post.authorName} · {timeAgo(post.createdAt)}
              {post.status === "SHIPPED" && post.shippedAt && <> · shipped {formatDate(post.shippedAt)}</>}
            </p>
          </div>
        </div>

        <div className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-stone-700">{post.body}</div>

        {post.officialResponse && (
          <div className="mt-5 rounded-xl border border-violet-200 bg-violet-50/70 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-700">
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M8 1l2 4.3 4.7.6-3.4 3.2.9 4.6L8 11.5l-4.2 2.2.9-4.6L1.3 5.9 6 5.3 8 1z" />
              </svg>
              Response from the {SITE.name} team
            </p>
            <Markdown className="mt-2">{post.officialResponse}</Markdown>
          </div>
        )}
      </article>

      {admin && (
        <div className="mt-4">
          <PostAdminPanel
            postId={post.id}
            status={post.status}
            pinned={post.pinned}
            officialResponse={post.officialResponse}
          />
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-stone-900">
          {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
        </h2>

        <div className="mt-4 space-y-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-stone-900">
                  {comment.authorName}
                  {comment.isTeam && (
                    <span className="ml-2 rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {SITE.name} team
                    </span>
                  )}
                  <span className="ml-2 font-normal text-stone-400">{timeAgo(comment.createdAt)}</span>
                </p>
                {admin && <DeleteCommentButton commentId={comment.id} />}
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-stone-700">{comment.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-900">Add a comment</h3>
          <CommentForm postId={post.id} defaultName={defaultName} />
        </div>
      </section>
    </div>
  );
}
