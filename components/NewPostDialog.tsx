"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { createPost, type FormState } from "@/lib/actions";
import { APPS } from "@/lib/config";
import { CATEGORIES, CATEGORY_META } from "@/lib/types";

export function NewPostDialog() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("FEATURE");
  const [state, formAction, isPending] = useActionState<FormState, FormData>(createPost, undefined);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) titleRef.current?.focus();
  }, [open]);

  // The keyboard shortcuts overlay ("c") asks us to open via a window event.
  useEffect(() => {
    function onOpenRequest() {
      setOpen(true);
    }
    window.addEventListener("slikk:new-post", onOpenRequest);
    return () => window.removeEventListener("slikk:new-post", onOpenRequest);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Create a post
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 pt-[8vh]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-stone-200">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Create a post</h2>
                <p className="mt-0.5 text-sm text-stone-500">
                  Search the board first — if it already exists, upvote it instead. See the{" "}
                  <Link href="/guidelines" className="text-violet-700 underline" onClick={() => setOpen(false)}>
                    posting guidelines
                  </Link>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <label
                    key={c}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
                      category === c
                        ? "bg-violet-600 text-white ring-violet-600"
                        : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c}
                      checked={category === c}
                      onChange={() => setCategory(c)}
                      className="sr-only"
                    />
                    {CATEGORY_META[c].label}
                  </label>
                ))}
              </div>

              <div>
                <label htmlFor="post-title" className="mb-1 block text-sm font-medium text-stone-700">
                  Title
                </label>
                <input
                  ref={titleRef}
                  id="post-title"
                  name="title"
                  required
                  maxLength={120}
                  placeholder="One sentence that sums it up"
                  className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label htmlFor="post-body" className="mb-1 block text-sm font-medium text-stone-700">
                  Details
                </label>
                <textarea
                  id="post-body"
                  name="body"
                  required
                  rows={4}
                  maxLength={5000}
                  placeholder="What problem does this solve? How would it work?"
                  className="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label htmlFor="post-app" className="mb-1 block text-sm font-medium text-stone-700">
                  App
                </label>
                <select
                  id="post-app"
                  name="appId"
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

              {state?.error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
                >
                  {isPending ? "Posting…" : "Post feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
