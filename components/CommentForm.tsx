"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment, type FormState } from "@/lib/actions";

export function CommentForm({ postId }: { postId: string }) {
  const action = addComment.bind(null, postId);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  // Reset the textarea after a successful submit (action returns undefined).
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <textarea
        name="body"
        required
        rows={3}
        maxLength={3000}
        placeholder="Share more context, use cases, or workarounds…"
        className="w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
        >
          {isPending ? "Posting…" : "Comment"}
        </button>
      </div>
      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{state.error}</p>
      )}
    </form>
  );
}
