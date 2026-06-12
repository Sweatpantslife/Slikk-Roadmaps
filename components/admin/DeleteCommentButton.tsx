"use client";

import { useTransition } from "react";
import { deleteComment } from "@/lib/actions";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this comment?")) startTransition(() => deleteComment(commentId));
      }}
      className="text-xs font-medium text-stone-400 hover:text-rose-600 disabled:opacity-50"
    >
      Delete
    </button>
  );
}
