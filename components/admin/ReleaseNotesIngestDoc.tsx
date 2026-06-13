import { SITE } from "@/lib/config";

/**
 * Admin-facing documentation for the git/CI release-notes integration.
 * Server component: reads RELEASE_NOTES_SECRET to show whether the ingest
 * endpoint is live. Collapsible via native <details> — no client JS.
 */
export function ReleaseNotesIngestDoc() {
  const enabled = !!process.env.RELEASE_NOTES_SECRET;

  return (
    <details className="group mb-6 rounded-2xl border border-stone-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-stone-900">Release notes from your app repos</h2>
          <p className="mt-0.5 text-sm text-stone-500">
            Let an AI agent in each repo&rsquo;s CI write release notes from commits and ship the feedback posts they close.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {enabled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Endpoint live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Needs setup
            </span>
          )}
          <svg
            className="h-4 w-4 text-stone-400 transition-transform group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden
          >
            <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </summary>

      <div className="space-y-5 border-t border-stone-100 p-5 text-sm text-stone-600">
        <p>
          Not every release starts on the board — bug fixes and dev-led work ship straight from the app repos.
          A workflow there can have <span className="font-medium text-stone-800">Claude Code</span> read what
          changed since the last release tag, write customer-facing notes, and post them here as a{" "}
          <span className="font-medium text-stone-800">draft</span> you review and publish like any other.
        </p>

        <div>
          <h3 className="mb-2 font-semibold text-stone-800">How it flows</h3>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>On a release tag, CI collects the commits since the previous tag.</li>
            <li>
              The agent turns them into New / Improved / Fixed markdown — skipping refactors, chores, and CI
              noise — and <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">POST</code>s to{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">/api/release-notes/ingest</code>.
            </li>
            <li>A per-app draft entry lands in the list below, ready to review and publish.</li>
          </ol>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-stone-800">Closing the loop from a commit</h3>
          <p>
            Add a <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">Fixes-Feedback:</code>{" "}
            trailer (the post&rsquo;s id, or its full URL) to the commit or squashed PR that resolves a request:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-stone-900 p-3 font-mono text-xs leading-relaxed text-stone-100">
{`Fix sync loop on large attachments

Fixes-Feedback: cmqbfh8mo00c97dlejezikta0`}
          </pre>
          <p className="mt-2">
            On ingest, that post is marked <span className="font-medium text-stone-800">Shipped</span> — its
            subscribers are notified, the roadmap updates, and it&rsquo;s attached to the new entry — so no one
            has to touch the admin to close it out. The id is the last part of the post&rsquo;s URL
            (<code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">/posts/&lt;id&gt;</code>).
          </p>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-stone-800">Set up a repo</h3>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>
              Copy{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">examples/app-repo-release-notes.yml</code>{" "}
              into the repo as{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">.github/workflows/release-notes.yml</code>{" "}
              and set its <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">APP_ID</code>.
            </li>
            <li>
              Add the repo secrets{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">ANTHROPIC_API_KEY</code>,{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">FEEDBACK_HUB_URL</code>, and{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs">RELEASE_NOTES_SECRET</code>.
            </li>
          </ol>
        </div>

        {enabled ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-200">
            The ingest endpoint is live on this {SITE.name} instance. Point a repo&rsquo;s{" "}
            <code className="rounded bg-emerald-100 px-1 py-0.5 font-mono text-xs">RELEASE_NOTES_SECRET</code>{" "}
            at the same value this server uses.
          </p>
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-amber-200">
            The ingest endpoint is disabled until{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">RELEASE_NOTES_SECRET</code> is
            set in this server&rsquo;s environment. The same secret authorizes both this endpoint and the CLI
            and cron triggers.
          </p>
        )}
      </div>
    </details>
  );
}
