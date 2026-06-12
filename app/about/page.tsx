import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/config";
import { ROADMAP_COLUMNS, STATUS_META } from "@/lib/types";

export const metadata: Metadata = {
  title: "About",
  description: `How feedback becomes shipped features in ${SITE.name}.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="py-6 sm:py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          About the {SITE.name} Feedback Hub
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-stone-500">{SITE.tagline}.</p>
      </section>

      <div className="space-y-5">
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">What happens to your feedback</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
            Every post lands in the team’s triage queue as <strong>In review</strong>. From there it moves through
            the public <Link href="/roadmap" className="text-violet-700 underline">roadmap</Link>:
          </p>
          <ul className="mt-3 space-y-2">
            {ROADMAP_COLUMNS.map(({ status, description }) => (
              <li key={status} className="flex items-center gap-2.5 text-[15px] text-stone-600">
                <span className={`h-2 w-2 rounded-full ${STATUS_META[status].dotClass}`} />
                <strong className="text-stone-900">{STATUS_META[status].label}</strong> — {description.toLowerCase()}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
            When something ships, it’s announced on the{" "}
            <Link href="/changelog" className="text-violet-700 underline">changelog</Link>. If we decide not to
            pursue an idea, we close it with a note explaining why — silence is the one thing you’ll never get.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">How prioritization works</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
            Votes are the strongest signal we have. They aren’t a strict queue — effort, strategy, and how many
            people a change helps all factor in — but a heavily upvoted post is impossible for us to ignore.
            Subscribe to any post (you’re subscribed automatically when you post, vote, or comment) and you’ll get a
            notification whenever its status changes or the team responds.
          </p>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-semibold text-stone-900">Contact</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-stone-600">
            For account issues, security reports, or anything that shouldn’t be public, email us at{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="text-violet-700 underline">
              {SITE.contactEmail}
            </a>
            . For everything product-related, the <Link href="/" className="text-violet-700 underline">board</Link>{" "}
            is the fastest path to the team.
          </p>
        </section>
      </div>
    </div>
  );
}
