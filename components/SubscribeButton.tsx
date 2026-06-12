"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleSubscription } from "@/lib/actions";

export function SubscribeButton({ postId, subscribed }: { postId: string; subscribed: boolean }) {
  // Derived from props, so server-side auto-subscribes (commenting, voting)
  // show up after revalidation; optimistic toggles revert on failure.
  const [isSubscribed, setOptimistic] = useOptimistic(subscribed);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function onClick() {
    if (isPending) return;
    startTransition(async () => {
      setOptimistic(!isSubscribed);
      const result = await toggleSubscription(postId);
      if ("error" in result && result.error === "UNAUTHENTICATED") {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSubscribed}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset transition-colors ${
        isSubscribed
          ? "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100"
          : "bg-white text-stone-600 ring-stone-200 hover:bg-stone-50"
      }`}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path
          d="M8 2a4 4 0 0 0-4 4v2.5L2.8 11c-.3.5 0 1 .6 1h9.2c.6 0 .9-.5.6-1L12 8.5V6a4 4 0 0 0-4-4zM6.5 13.5a1.5 1.5 0 0 0 3 0"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {isSubscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}
