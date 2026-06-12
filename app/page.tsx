import { Suspense } from "react";
import { SITE } from "@/lib/config";
import { getDisplayName } from "@/lib/identity";
import { getBoardPosts, getCategoryCounts, getVotedPostIds } from "@/lib/queries";
import { isCategory, isSort, type Category, type Sort } from "@/lib/types";
import { BoardFilterBar } from "@/components/BoardFilterBar";
import { CategoryTabs } from "@/components/CategoryTabs";
import { NewPostDialog } from "@/components/NewPostDialog";
import { PostCard } from "@/components/PostCard";

type SearchParams = { [key: string]: string | string[] | undefined };

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function BoardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const q = first(params.q).trim();
  const categoryRaw = first(params.category).toUpperCase();
  const category: Category | undefined = isCategory(categoryRaw) ? categoryRaw : undefined;
  const sortRaw = first(params.sort);
  const sort: Sort = isSort(sortRaw) ? sortRaw : "top";
  const appId = first(params.app) || undefined;

  const [posts, counts, defaultName] = await Promise.all([
    getBoardPosts({ q: q || undefined, category, appId, sort }),
    getCategoryCounts({ q: q || undefined, appId }),
    getDisplayName(),
  ]);
  const votedIds = await getVotedPostIds(posts.map((p) => p.id));

  // Preserved when switching category tabs.
  const carriedParams: Record<string, string> = {};
  if (q) carriedParams.q = q;
  if (appId) carriedParams.app = appId;
  if (sort !== "top") carriedParams.sort = sort;

  return (
    <div>
      <section className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-8">
        <div className="max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">{SITE.heroTitle}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-500">{SITE.heroSubtitle}</p>
        </div>
        <NewPostDialog defaultName={defaultName} />
      </section>

      <CategoryTabs active={category} counts={counts} searchParams={carriedParams} />

      <div className="mt-5">
        <Suspense>
          <BoardFilterBar />
        </Suspense>
      </div>

      <div className="mt-5 space-y-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} voted={votedIds.has(post.id)} />
        ))}

        {posts.length === 0 && (
          <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="text-base font-medium text-stone-700">
              {q ? `No posts match “${q}”` : "No posts here yet"}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {q
                ? "Try a different search — or be the first to post it."
                : "Be the first to suggest something — every post is read by the team."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
