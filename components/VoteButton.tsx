"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleVote } from "@/lib/actions";

type Props = {
  postId: string;
  count: number;
  voted: boolean;
  signedIn: boolean;
  size?: "md" | "sm";
};

export function VoteButton({ postId, count, voted, signedIn, size = "md" }: Props) {
  const [state, setState] = useState({ count, voted });
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function onClick(e: React.MouseEvent) {
    // Cards are wrapped in links; voting shouldn't navigate.
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;

    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const next = {
      voted: !state.voted,
      count: state.count + (state.voted ? -1 : 1),
    };
    setState(next);
    startTransition(async () => {
      const result = await toggleVote(postId);
      if ("error" in result) {
        setState(state); // roll back optimistic update
        if (result.error === "UNAUTHENTICATED") {
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
        }
      } else {
        setState(result);
      }
    });
  }

  const sizing =
    size === "md"
      ? "h-14 w-11 rounded-xl text-sm [&_svg]:h-4 [&_svg]:w-4"
      : "h-11 w-9 rounded-lg text-xs [&_svg]:h-3.5 [&_svg]:w-3.5";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state.voted}
      aria-label={state.voted ? "Remove your vote" : "Upvote"}
      className={`flex shrink-0 flex-col items-center justify-center gap-0.5 font-semibold ring-1 ring-inset transition-colors ${sizing} ${
        state.voted
          ? "bg-violet-600 text-white ring-violet-600 hover:bg-violet-700"
          : "bg-white text-stone-700 ring-stone-200 hover:bg-violet-50 hover:text-violet-700 hover:ring-violet-200"
      }`}
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 3l5 6H3l5-6z" fill="currentColor" />
      </svg>
      <span className="tabular-nums">{state.count}</span>
    </button>
  );
}
