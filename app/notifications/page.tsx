import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import { MarkAllRead } from "@/components/MarkAllRead";

export const metadata: Metadata = { title: "Notifications" };

const TYPE_ICONS: Record<string, string> = {
  STATUS_CHANGE: "M3 8h7M8 4l4 4-4 4", // arrow
  OFFICIAL_RESPONSE: "M8 1l2 4.3 4.7.6-3.4 3.2.9 4.6L8 11.5l-4.2 2.2.9-4.6L1.3 5.9 6 5.3 8 1z", // star
  NEW_COMMENT:
    "M14 8c0 2.9-2.7 5.2-6 5.2-.8 0-1.5-.1-2.2-.3L2.5 14l.9-2.6C2.5 10.5 2 9.3 2 8c0-2.9 2.7-5.2 6-5.2s6 2.3 6 5.2z", // bubble
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/notifications");

  const notifications = await getNotifications();
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div className="mx-auto max-w-2xl">
      <MarkAllRead hasUnread={hasUnread} />

      <section className="py-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Notifications</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-stone-500">
          Updates from posts you follow — you subscribe automatically when you post, vote, or comment.
        </p>
      </section>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-base font-medium text-stone-700">Nothing here yet</p>
          <p className="mt-1 text-sm text-stone-500">
            Vote on a few posts on the{" "}
            <Link href="/" className="font-medium text-violet-700 underline">
              board
            </Link>{" "}
            and we’ll let you know when they move forward.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const inner = (
              <div
                className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                  n.readAt
                    ? "border-stone-200 bg-white"
                    : "border-violet-200 bg-violet-50/50"
                } ${n.postId ? "hover:border-violet-300" : ""}`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    n.readAt ? "bg-stone-100 text-stone-500" : "bg-violet-100 text-violet-700"
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                    <path
                      d={TYPE_ICONS[n.type] ?? TYPE_ICONS.NEW_COMMENT}
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[15px] leading-snug ${n.readAt ? "text-stone-600" : "font-medium text-stone-900"}`}>
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-xs text-stone-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.readAt && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />}
              </div>
            );
            return n.postId ? (
              <Link key={n.id} href={`/posts/${n.postId}`} className="block">
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
