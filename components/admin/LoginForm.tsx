"use client";

import { useActionState } from "react";
import { loginAdmin, type FormState } from "@/lib/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(loginAdmin, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-stone-700">
          Team password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoFocus
          className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
