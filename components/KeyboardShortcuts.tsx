"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["c"], label: "Create a post (from the board)" },
  { keys: ["/"], label: "Search posts" },
  { keys: ["g", "b"], label: "Go to board" },
  { keys: ["g", "r"], label: "Go to roadmap" },
  { keys: ["g", "c"], label: "Go to changelog" },
  { keys: ["g", "n"], label: "Go to notifications" },
  { keys: ["?"], label: "Show or hide this overlay" },
  { keys: ["Esc"], label: "Close dialogs" },
];

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.isContentEditable
  );
}

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const pendingG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onShowRequest() {
      setOpen((v) => !v);
    }
    window.addEventListener("slikk:shortcuts", onShowRequest);
    return () => window.removeEventListener("slikk:shortcuts", onShowRequest);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;

      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      if (pendingG.current) {
        pendingG.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        const target = { b: "/", r: "/roadmap", c: "/changelog", n: "/notifications" }[e.key.toLowerCase()];
        if (target) {
          e.preventDefault();
          setOpen(false);
          router.push(target);
        }
        return;
      }

      if (e.key.toLowerCase() === "g") {
        pendingG.current = true;
        if (gTimer.current) clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => {
          pendingG.current = false;
        }, 1500);
        return;
      }

      if (e.key === "/") {
        const search = document.querySelector<HTMLInputElement>('input[aria-label="Search posts"]');
        if (search) {
          e.preventDefault();
          setOpen(false);
          search.focus();
        } else {
          router.push("/");
        }
        return;
      }

      if (e.key.toLowerCase() === "c") {
        setOpen(false);
        if (pathname === "/") {
          window.dispatchEvent(new CustomEvent("slikk:new-post"));
        } else {
          router.push("/");
        }
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (gTimer.current) clearTimeout(gTimer.current);
    };
  }, [router, pathname]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-4 pt-[12vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-stone-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Keyboard shortcuts</h2>
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
        <ul className="mt-4 space-y-2.5">
          {SHORTCUTS.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-4 text-sm text-stone-600">
              <span>{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded-md border border-stone-200 bg-stone-50 px-2 py-0.5 font-mono text-xs font-semibold text-stone-700"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ShortcutsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("slikk:shortcuts"))}
      className="hover:text-stone-900"
    >
      Shortcuts <kbd className="rounded border border-stone-300 px-1 font-mono text-xs">?</kbd>
    </button>
  );
}
