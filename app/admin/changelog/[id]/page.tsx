import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { parseLabels } from "@/lib/types";
import { toDateInputValue } from "@/lib/format";
import { ChangelogEditor } from "@/components/admin/ChangelogEditor";

export const metadata: Metadata = { title: "Edit changelog entry" };

export default async function EditChangelogEntryPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const entry = await prisma.changelogEntry.findUnique({ where: { id } });
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
    </div>
  );
}
