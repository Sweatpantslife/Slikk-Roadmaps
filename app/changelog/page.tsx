import type { Metadata } from "next";
import { getChangelogEntries } from "@/lib/queries";
import { parseLabels } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/config";
import { AppChip, ChangelogLabelBadge } from "@/components/Badges";
import { Markdown } from "@/components/Markdown";

export const metadata: Metadata = {
  title: "Changelog",
  description: `New features, improvements, and fixes — everything shipping in ${SITE.name}.`,
};

export default async function ChangelogPage() {
  const entries = await getChangelogEntries();

  return (
    <div className="mx-auto max-w-3xl">
      <section className="py-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Changelog</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-stone-500">
          New features, improvements, and fixes — many of them straight from the feedback board.
        </p>
      </section>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-base font-medium text-stone-700">No updates published yet</p>
          <p className="mt-1 text-sm text-stone-500">Check back soon — release notes will land here.</p>
        </div>
      ) : (
        <div className="relative space-y-10 border-l border-stone-200 pl-6 sm:pl-8">
          {entries.map((entry) => (
            <article key={entry.id} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rounded-full bg-violet-600 ring-4 ring-[#f8f7f5] sm:-left-[39px]" />
              <p className="text-sm font-medium text-stone-400">{formatDate(entry.publishedAt)}</p>
              <div className="mt-2 rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {parseLabels(entry.labels).map((label) => (
                    <ChangelogLabelBadge key={label} label={label} />
                  ))}
                  <AppChip appId={entry.appId} />
                </div>
                <h2 className="mt-3 text-lg font-semibold text-stone-900">{entry.title}</h2>
                <Markdown className="mt-2">{entry.body}</Markdown>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
