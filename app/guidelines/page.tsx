import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Posting guidelines",
  description: `How to write feedback the ${SITE.name} team can act on.`,
};

const RULES = [
  {
    title: "Search before you post",
    body: "Most ideas already have a thread. Upvoting an existing post is far more powerful than a duplicate — votes are how we prioritize.",
  },
  {
    title: "One idea per post",
    body: "A post with three requests can't have a single status. Split unrelated asks into separate posts so each can move through the roadmap on its own.",
  },
  {
    title: "Describe the problem, not just the solution",
    body: "“I can't find tasks I archived last quarter” helps us more than “add a second archive tab”. Share what you were trying to do — we might know an even better fix.",
  },
  {
    title: "For bugs: steps, expectations, environment",
    body: "Tell us what you did, what you expected, what happened instead, and where (app, version, OS/browser). A bug we can reproduce is a bug we can fix.",
  },
  {
    title: "Keep it constructive",
    body: "Real people read every post. Critique the product as hard as you like — keep it respectful to the humans, and to other users in the comments.",
  },
];

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="py-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">Posting guidelines</h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-stone-500">
          Every post on this board is read by the {SITE.name} team. A few minutes spent on a clear post dramatically
          raises the odds your idea ships.
        </p>
      </section>

      <ol className="space-y-4">
        {RULES.map((rule, i) => (
          <li key={rule.title} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-bold text-violet-700 ring-1 ring-violet-200">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold text-stone-900">{rule.title}</h2>
              <p className="mt-1 text-[15px] leading-relaxed text-stone-600">{rule.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50/60 p-5 text-center">
        <p className="text-[15px] text-stone-700">Ready to share your idea?</p>
        <Link
          href="/"
          className="mt-3 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Go to the board
        </Link>
      </div>
    </div>
  );
}
