"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteChangelogEntry, saveChangelogEntry, type FormState } from "@/lib/actions";
import { APPS } from "@/lib/config";
import { CHANGELOG_LABELS, CHANGELOG_LABEL_META } from "@/lib/types";

type Entry = {
  id: string;
  title: string;
  body: string;
  labels: string[];
  appId: string | null;
  published: boolean;
  publishedAt: string; // yyyy-MM-dd
};

export function ChangelogEditor({ entry }: { entry?: Entry }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(saveChangelogEntry, undefined);
  const [isDeleting, startDelete] = useTransition();
  const router = useRouter();

  return (
    <form action={formAction} className="space-y-4">
      {entry && <input type="hidden" name="id" value={entry.id} />}

      <div>
        <label htmlFor="cl-title" className="mb-1 block text-sm font-medium text-stone-700">
          Title
        </label>
        <input
          id="cl-title"
          name="title"
          required
          defaultValue={entry?.title}
          maxLength={140}
          placeholder="e.g. Faster sync across devices"
          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-stone-700">Labels</span>
        <div className="flex flex-wrap gap-3 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5">
          {CHANGELOG_LABELS.map((label) => (
            <label key={label} className="flex items-center gap-1.5 text-sm text-stone-700">
              <input
                type="checkbox"
                name="labels"
                value={label}
                defaultChecked={entry ? entry.labels.includes(label) : label === "NEW"}
                className="h-4 w-4 rounded border-stone-300 accent-violet-600"
              />
              {CHANGELOG_LABEL_META[label].label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cl-app" className="mb-1 block text-sm font-medium text-stone-700">
            App
          </label>
          <select
            id="cl-app"
            name="appId"
            defaultValue={entry?.appId ?? ""}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            <option value="">All apps</option>
            {APPS.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cl-date" className="mb-1 block text-sm font-medium text-stone-700">
            Publish date
          </label>
          <input
            id="cl-date"
            type="date"
            name="publishedAt"
            defaultValue={entry?.publishedAt ?? new Date().toISOString().slice(0, 10)}
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cl-body" className="mb-1 block text-sm font-medium text-stone-700">
          Body <span className="font-normal text-stone-400">(markdown supported)</span>
        </label>
        <textarea
          id="cl-body"
          name="body"
          required
          rows={10}
          defaultValue={entry?.body}
          placeholder={"What shipped and why it matters.\n\n- Bullet the highlights\n- Link to docs where useful"}
          className="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 font-mono text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={entry?.published ?? true}
          className="h-4 w-4 rounded border-stone-300 accent-violet-600"
        />
        Published (uncheck to keep as a draft)
      </label>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{state.error}</p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        {entry ? (
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              if (confirm("Delete this changelog entry?")) {
                startDelete(() => deleteChangelogEntry(entry.id));
              }
            }}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
          >
            Delete entry
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/changelog")}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
          >
            {isPending ? "Saving…" : entry ? "Save changes" : "Create entry"}
          </button>
        </div>
      </div>
    </form>
  );
}
