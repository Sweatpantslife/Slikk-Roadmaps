import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseLabels } from "@/lib/types";
import { toDateInputValue } from "@/lib/format";
import { ChangelogEditor } from "@/components/admin/ChangelogEditor";

export const metadata: Metadata = { title: "Edit changelog entry" };

export default async function EditChangelogEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin/changelog/${id}`);
  if (!user.isAdmin) redirect("/admin");
  const entry = await prisma.changelogEntry.findUnique({
    where: { id },
    include: { posts: { select: { id: true, title: true }, orderBy: { voteCount: "desc" } } },
  });
  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <section className="py-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Edit changelog entry</h1>
      </section>
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <ChangelogEditor
          entry={{
            id: entry.id,
            title: entry.title,
            body: entry.body,
            labels: parseLabels(entry.labels),
            appId: entry.appId,
            published: entry.published,
            publishedAt: toDateInputValue(entry.publishedAt),
          }}
        />
      </div>

      {entry.posts.length > 0 && (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-stone-900">
            Covers {entry.posts.length} shipped {entry.posts.length === 1 ? "post" : "posts"}
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Deleting this entry returns these posts to the release-notes queue.
          </p>
          <ul className="mt-3 space-y-1.5">
            {entry.posts.map((post) => (
              <li key={post.id}>
                <Link href={`/posts/${post.id}`} className="text-sm text-violet-700 hover:underline">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
