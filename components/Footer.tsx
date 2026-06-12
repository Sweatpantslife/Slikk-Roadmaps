import Link from "next/link";
import { SITE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200/80 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {SITE.name} · {SITE.tagline}
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/" className="hover:text-stone-900">Board</Link>
          <Link href="/roadmap" className="hover:text-stone-900">Roadmap</Link>
          <Link href="/changelog" className="hover:text-stone-900">Changelog</Link>
          <Link href="/admin" className="hover:text-stone-900">Team sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
