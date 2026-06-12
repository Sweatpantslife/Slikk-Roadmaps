import Link from "next/link";
import { isAdmin } from "@/lib/admin";
import { SITE } from "@/lib/config";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";

export async function Header() {
  const admin = await isAdmin();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f8f7f5]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[17px] font-semibold tracking-tight">{SITE.name}</span>
          <span className="hidden rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200 sm:inline">
            Feedback
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NavLinks />
          {admin && (
            <Link
              href="/admin"
              className="ml-1 rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 ring-1 ring-violet-200 transition-colors hover:bg-violet-100"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
