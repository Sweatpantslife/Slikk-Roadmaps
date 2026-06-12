"use client";

import { useState, useTransition } from "react";
import { generateReleaseNoteDrafts } from "@/lib/actions";

/**
 * Admin panel showing how many shipped posts aren't covered by release notes
 * yet, with a one-click "Generate drafts" that writes one draft entry per app.
 */
export function GenerateReleaseNotes({ pending }: { pending: { appName: string; postCount: number }[] }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const total = pending.reduce((sum, g) => sum + g.postCount, 0);

  return (
    <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">Automated release notes</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            {total === 0
              ? "Every shipped post is covered — new ones will queue up here."
              : `${total} shipped ${total === 1 ? "post isn't" : "posts aren't"} in the changelog yet.`}
          </p>
        </div>
        {total > 0 && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await generateReleaseNoteDrafts();
                setMessage(
                  result.entries === 0
                    ? "Nothing to do — every shipped post is already covered."
                    : `Created ${result.entries} draft ${result.entries === 1 ? "entry" : "entries"} covering ${result.posts} shipped ${result.posts === 1 ? "post" : "posts"} — review and publish below.`,
                );
              })
            }
            className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {isPending ? "Generating…" : "Generate drafts"}
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pending.map((group) => (
            <span
              key={group.appName}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-200"
            >
              {group.appName}
              <span className="font-semibold tabular-nums text-stone-900">{group.postCount}</span>
            </span>
          ))}
        </div>
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-200">
          {message}
        </p>
      )}
    </div>
  );
}
