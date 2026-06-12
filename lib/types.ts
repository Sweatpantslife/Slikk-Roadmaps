export const STATUSES = ["UNDER_REVIEW", "PLANNED", "IN_PROGRESS", "SHIPPED", "CLOSED"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_META: Record<Status, { label: string; dotClass: string; chipClass: string }> = {
  UNDER_REVIEW: {
    label: "In review",
    dotClass: "bg-amber-500",
    chipClass: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  PLANNED: {
    label: "Planned",
    dotClass: "bg-blue-500",
    chipClass: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  IN_PROGRESS: {
    label: "In progress",
    dotClass: "bg-violet-500",
    chipClass: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  SHIPPED: {
    label: "Shipped",
    dotClass: "bg-emerald-500",
    chipClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  CLOSED: {
    label: "Closed",
    dotClass: "bg-stone-400",
    chipClass: "bg-stone-100 text-stone-600 ring-stone-200",
  },
};

export const CATEGORIES = ["FEATURE", "IMPROVEMENT", "BUG"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<Category, { label: string; plural: string; chipClass: string }> = {
  FEATURE: {
    label: "New feature",
    plural: "New features",
    chipClass: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  IMPROVEMENT: {
    label: "Improvement",
    plural: "Improvements",
    chipClass: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  BUG: {
    label: "Bug report",
    plural: "Bug reports",
    chipClass: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

export const CHANGELOG_LABELS = ["NEW", "IMPROVED", "FIXED"] as const;
export type ChangelogLabel = (typeof CHANGELOG_LABELS)[number];

export const CHANGELOG_LABEL_META: Record<ChangelogLabel, { label: string; chipClass: string }> = {
  NEW: { label: "New", chipClass: "bg-violet-600 text-white" },
  IMPROVED: { label: "Improved", chipClass: "bg-sky-600 text-white" },
  FIXED: { label: "Fixed", chipClass: "bg-emerald-600 text-white" },
};

export const SORTS = ["top", "trending", "new"] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_META: Record<Sort, { label: string }> = {
  top: { label: "Top" },
  trending: { label: "Trending" },
  new: { label: "New" },
};

export function isStatus(v: string): v is Status {
  return (STATUSES as readonly string[]).includes(v);
}
export function isCategory(v: string): v is Category {
  return (CATEGORIES as readonly string[]).includes(v);
}
export function isSort(v: string): v is Sort {
  return (SORTS as readonly string[]).includes(v);
}
export function parseLabels(labels: string): ChangelogLabel[] {
  return labels
    .split(",")
    .map((l) => l.trim())
    .filter((l): l is ChangelogLabel => (CHANGELOG_LABELS as readonly string[]).includes(l));
}

/** Roadmap columns, in display order. */
export const ROADMAP_COLUMNS: { status: Status; description: string }[] = [
  { status: "PLANNED", description: "On our radar and coming soon" },
  { status: "IN_PROGRESS", description: "Being built right now" },
  { status: "SHIPPED", description: "Live for everyone" },
];
