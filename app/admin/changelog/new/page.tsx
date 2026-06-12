import Link from "next/link";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { ChangelogEditor } from "@/components/admin/ChangelogEditor";

export const metadata: Metadata = { title: "New changelog entry" };

export default async function NewChangelogEntryPage() {
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

  return (
    <div className="mx-auto max-w-3xl">
      <section className="py-6">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">New changelog entry</h1>
      </section>
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <ChangelogEditor />
      </div>
    </div>
  );
}
