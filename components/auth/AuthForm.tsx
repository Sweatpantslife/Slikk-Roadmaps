"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginUser, registerUser, type FormState } from "@/lib/actions";

const inputClass =
  "w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-stone-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const action = mode === "login" ? loginUser : registerUser;
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, undefined);
  const nextQuery = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {mode === "register" && (
        <div>
          <label htmlFor="auth-name" className="mb-1 block text-sm font-medium text-stone-700">
            Name
          </label>
          <input
            id="auth-name"
            name="name"
            required
            maxLength={50}
            autoComplete="name"
            placeholder="How you'll appear on posts"
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="auth-email" className="mb-1 block text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="auth-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="auth-password" className="mb-1 block text-sm font-medium text-stone-700">
          Password
        </label>
        <input
          id="auth-password"
          name="password"
          type="password"
          required
          minLength={mode === "register" ? 8 : undefined}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
          className={inputClass}
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
        {isPending ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
      </button>

      <p className="text-center text-sm text-stone-500">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href={`/register${nextQuery}`} className="font-medium text-violet-700 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login${nextQuery}`} className="font-medium text-violet-700 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
