"use client";

import { useTransition } from "react";
import { logoutAdmin } from "@/lib/actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => logoutAdmin())}
      className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-60"
    >
      Sign out
    </button>
  );
}
