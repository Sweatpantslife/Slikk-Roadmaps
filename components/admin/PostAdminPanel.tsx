"use client";

import { useActionState, useState, useTransition } from "react";
import {
  deletePost,
  setOfficialResponse,
  setPostStatus,
  togglePinned,
  type FormState,
} from "@/lib/actions";
import { STATUSES, STATUS_META } from "@/lib/types";

type Props = {
  postId: string;
  status: string;
  pinned: boolean;
  officialResponse: string | null;
};

export function PostAdminPanel({ postId, status, pinned, officialResponse }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showResponse, setShowResponse] = useState(false);
  const responseAction = setOfficialResponse.bind(null, postId);
  const [responseState, responseFormAction, responsePending] = useActionState<FormState, FormData>(
    responseAction,
    undefined,
  );

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Admin</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          defaultValue={status}
          disabled={isPending}
          onChange={(e) => startTransition(() => setPostStatus(postId, e.target.value))}
          aria-label="Set status"
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-violet-400"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => togglePinned(postId))}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          {pinned ? "Unpin" : "Pin to top"}
        </button>

        <button
          type="button"
          onClick={() => setShowResponse((v) => !v)}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
        >
          {officialResponse ? "Edit team response" : "Add team response"}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (confirm("Delete this post and all of its votes and comments?")) {
              startTransition(() => deletePost(postId));
            }
          }}
          className="ml-auto rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          Delete
        </button>
      </div>

      {showResponse && (
        <form action={responseFormAction} className="mt-3 space-y-2">
          <textarea
            name="response"
            rows={3}
            defaultValue={officialResponse ?? ""}
            placeholder="An official response from the team (supports markdown). Leave empty to remove."
            className="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          {responseState?.error && <p className="text-sm text-rose-600">{responseState.error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={responsePending}
              className="rounded-lg bg-violet-600 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {responsePending ? "Saving…" : "Save response"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
