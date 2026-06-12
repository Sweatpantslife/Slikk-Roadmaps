import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { ChangelogEditor } from "@/components/admin/ChangelogEditor";

export const metadata: Metadata = { title: "New changelog entry" };

export default async function NewChangelogEntryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/changelog/new");
  if (!user.isAdmin) redirect("/admin");

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
