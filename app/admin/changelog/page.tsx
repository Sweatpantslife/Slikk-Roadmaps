import Link from "next/link";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { getChangelogEntries } from "@/lib/queries";
import { parseLabels } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { AppChip, ChangelogLabelBadge } from "@/components/Badges";

export const metadata: Metadata = { title: "Manage changelog" };

export default async function AdminChangelogPage() {
  if (!(await isAdmin())) {
    return (
      <p className="mt-12 text-center text-sm text-stone-500">
        Not authorized —{" "}
        <Link href="/admin" className="font-medium text-violet-700 underline">
          sign in
        </Link>{" "}
        first.
      </p>
    );
  }

  const entries = await getChangelogEntries(true);

  return (
    <div className="mx-auto max-w-3xl">
      <section className="flex flex-wrap items-center justify-between gap-4 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Manage changelog</h1>
          <p className="mt-1 text-sm text-stone-500">
            <Link href="/admin" className="text-violet-700 hover:underline">
              ← Back to admin
            </Link>
          </p>
        </div>
        <Link
          href="/admin/changelog/new"
          className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          New entry
        </Link>
      </section>

      <div className="space-y-2.5">
        {entries.map((entry) => (
          <Link
            key={entry.id}
            href={`/admin/changelog/${entry.id}`}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-all hover:border-violet-200 hover:shadow-sm"
          >
            <div className="min-w-0 flex-1 basis-64">
              <p className="font-medium text-stone-900">{entry.title}</p>
              <p className="mt-0.5 text-xs text-stone-400">{formatDate(entry.publishedAt)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {!entry.published && (
                <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-200">
                  Draft
                </span>
              )}
              {parseLabels(entry.labels).map((label) => (
                <ChangelogLabelBadge key={label} label={label} />
              ))}
              <AppChip appId={entry.appId} />
            </div>
          </Link>
        ))}
        {entries.length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-stone-500">
            No entries yet — create the first one.
          </p>
        )}
      </div>
    </div>
  );
}
