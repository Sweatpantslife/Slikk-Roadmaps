"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { APPS } from "@/lib/config";
import { SORTS, SORT_META } from "@/lib/types";

export function BoardFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") ?? "top";
  const appId = searchParams.get("app") ?? "";
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(params.size ? `/?${params}` : "/", { scroll: false });
  }

  useEffect(() => {
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-xl bg-stone-100 p-1">
        {SORTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => updateParams({ sort: s === "top" ? "" : s })}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              sort === s ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {SORT_META[s].label}
          </button>
        ))}
      </div>

      <select
        value={appId}
        onChange={(e) => updateParams({ app: e.target.value })}
        aria-label="Filter by app"
        className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      >
        <option value="">All apps</option>
        {APPS.map((app) => (
          <option key={app.id} value={app.id}>
            {app.name}
          </option>
        ))}
      </select>

      <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
        <svg
          viewBox="0 0 16 16"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            const value = e.target.value;
            setQ(value);
            if (debounce.current) clearTimeout(debounce.current);
            debounce.current = setTimeout(() => updateParams({ q: value }), 300);
          }}
          placeholder="Search posts…"
          aria-label="Search posts"
          className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </div>
    </div>
  );
}
