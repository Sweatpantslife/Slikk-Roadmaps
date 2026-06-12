import Link from "next/link";
import { CATEGORIES, CATEGORY_META, type Category } from "@/lib/types";

type Props = {
  active?: Category;
  counts: { total: number; byCategory: Record<string, number> };
  searchParams: Record<string, string>;
};

function hrefFor(category: string | undefined, searchParams: Record<string, string>) {
  const params = new URLSearchParams(searchParams);
  if (category) params.set("category", category.toLowerCase());
  else params.delete("category");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export function CategoryTabs({ active, counts, searchParams }: Props) {
  const tabs: { key?: Category; label: string; count: number }[] = [
    { key: undefined, label: "All", count: counts.total },
    ...CATEGORIES.map((c) => ({
      key: c as Category,
      label: CATEGORY_META[c].plural,
      count: counts.byCategory[c] ?? 0,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-stone-200 pb-px">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.label}
            href={hrefFor(tab.key, searchParams)}
            className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-violet-600 text-violet-700"
                : "border-transparent text-stone-500 hover:border-stone-300 hover:text-stone-800"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                isActive ? "bg-violet-100 text-violet-700" : "bg-stone-100 text-stone-500"
              }`}
            >
              {tab.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
