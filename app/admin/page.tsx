import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getApp } from "@/lib/config";
import { CATEGORY_META, STATUS_META, isCategory, isStatus } from "@/lib/types";
import { TriageRow } from "@/components/admin/TriageRow";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) {
    return (
      <div className="mx-auto mt-12 max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center">
        <h1 className="text-lg font-semibold text-stone-900">Team members only</h1>
        <p className="mt-1 text-sm text-stone-500">
          Your account ({user.email}) doesn’t have admin access. Ask a teammate to promote you with{" "}
          <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs">npm run make-admin -- {user.email}</code>
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-violet-700 hover:underline">
          Back to the board
        </Link>
      </div>
    );
  }

  const posts = await prisma.post.findMany({
    include: { _count: { select: { comments: true } } },
    orderBy: [{ createdAt: "desc" }],
  });

  const statusCounts = posts.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <section className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Admin</h1>
          <p className="mt-1 text-sm text-stone-500">Triage feedback, update statuses, and publish the changelog.</p>
        </div>
        <Link
          href="/admin/changelog"
          className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Manage changelog
        </Link>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(STATUS_META).map(([status, meta]) => (
          <div key={status} className="rounded-xl border border-stone-200 bg-white p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
              {meta.label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-stone-900">{statusCounts[status] ?? 0}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-stone-900">All posts ({posts.length})</h2>
      <div className="space-y-2.5">
        {posts.map((post) => (
          <TriageRow
            key={post.id}
            post={{
              id: post.id,
              title: post.title,
              status: isStatus(post.status) ? post.status : "UNDER_REVIEW",
              pinned: post.pinned,
              voteCount: post.voteCount,
              commentCount: post._count.comments,
              categoryLabel: isCategory(post.category) ? CATEGORY_META[post.category].label : post.category,
              appName: getApp(post.appId)?.name,
            }}
          />
        ))}
        {posts.length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-500">
            No feedback yet — posts will appear here as they come in.
          </p>
        )}
      </div>
    </div>
  );
}
