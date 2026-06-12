import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadNotificationCount } from "@/lib/queries";
import { SITE } from "@/lib/config";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { LogoutButton } from "@/components/admin/LogoutButton";

export async function Header() {
  const user = await getCurrentUser();
  const unread = user ? await getUnreadNotificationCount() : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f8f7f5]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-[17px] font-semibold tracking-tight">{SITE.name}</span>
          <span className="hidden rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200 sm:inline">
            Feedback
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <NavLinks />

          {user ? (
            <>
              <Link
                href="/notifications"
                aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
                className="relative ml-1 rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900"
              >
                <svg viewBox="0 0 16 16" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
                  <path
                    d="M8 2a4 4 0 0 0-4 4v2.5L2.8 11c-.3.5 0 1 .6 1h9.2c.6 0 .9-.5.6-1L12 8.5V6a4 4 0 0 0-4-4zM6.5 13.5a1.5 1.5 0 0 0 3 0"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>

              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-700 ring-1 ring-violet-200 transition-colors hover:bg-violet-100"
                >
                  Admin
                </Link>
              )}

              <span
                title={`${user.name} (${user.email})`}
                className="hidden h-8 w-8 select-none items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white sm:flex"
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="ml-1 rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
