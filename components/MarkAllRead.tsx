"use client";

import { useEffect, useRef } from "react";
import { markAllNotificationsRead } from "@/lib/actions";

/** Marks notifications read shortly after the list is viewed. */
export function MarkAllRead({ hasUnread }: { hasUnread: boolean }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!hasUnread || fired.current) return;
    fired.current = true;
    const timer = setTimeout(() => {
      markAllNotificationsRead().catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasUnread]);

  return null;
}
