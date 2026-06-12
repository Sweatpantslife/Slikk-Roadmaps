# Slikk Feedback Hub

A self-hosted feedback board, public roadmap, and changelog for the Slikk apps — inspired by [Base44's feedback hub](https://feedback.base44.com).

| Page | What it does |
| --- | --- |
| **Board** (`/`) | Members suggest features, improvements, and bug reports; vote and comment. Category tabs with live counts, Top / Trending / New sorting, per-app filtering, and full-text search. |
| **Roadmap** (`/roadmap`) | Three columns — Planned, In progress, Shipped — fed directly by post statuses. Votable from the roadmap. |
| **Changelog** (`/changelog`) | Markdown release notes with New / Improved / Fixed labels and per-app tags, on a timeline. |
| **Notifications** (`/notifications`) | In-app updates for posts you follow — status changes, official responses, and new comments. |
| **About / Guidelines** (`/about`, `/guidelines`) | How feedback flows to the team, and how to write posts that ship. |
| **Admin** (`/admin`) | Team-only area: triage posts (status, pin, delete), post official team responses, comment with a team badge, and write/publish changelog entries (drafts supported) — or auto-generate release notes from shipped posts. |

## Accounts — no guest posting

Browsing is public, but **posting, voting, and commenting all require an account** (`/register`). Sessions are
database-backed (httpOnly cookie, 30 days) and passwords are hashed with scrypt — no external auth service needed.

Members are automatically subscribed to posts they create, vote on, or comment on, and get an in-app notification
(bell in the header) when a post's status changes, the team responds, or someone comments.

## Quick start

```bash
npm install            # also runs `prisma generate`
cp .env.example .env   # then set ADMIN_EMAIL / ADMIN_PASSWORD
npm run setup          # creates the SQLite db + seeds demo data
npm run dev            # http://localhost:3000
```

The seed creates the **admin account** from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your `.env`
(defaults: `admin@slikk.app` / `slikk-admin`), plus demo users (`maya@example.com`, … — password `slikk-demo`).

To promote any registered account to admin later:

```bash
npm run make-admin -- someone@yourteam.com
```

To start with an **empty** board instead of demo data, run `npm run db:push` instead of `npm run setup` — then
register your account and promote it with `make-admin`.

## How feedback flows

1. A member posts to the board (auto-upvoted and auto-subscribed) — status starts at **In review**.
2. The team triages it at `/admin`: set it to **Planned**, **In progress**, **Shipped**, or **Closed**, pin it, or
   add an official response. Subscribers are notified on every status change and team response.
3. Anything Planned / In progress / Shipped appears on the public roadmap automatically (marking a post Shipped
   stamps its ship date).
4. When it ships, the release notes can write themselves — see [Automated release notes](#automated-release-notes) —
   or write a changelog entry by hand at `/admin/changelog` (markdown, with New / Improved / Fixed labels).

## Automated release notes

Every post marked **Shipped** is tracked until a changelog entry covers it, so release notes are generated
instead of written from scratch. Generation groups the outstanding shipped posts **per app** (cross-app posts
get their own entry), buckets them into New / Improved / Fixed from their category, links each bullet back to
the original post with its vote count, and saves one entry per app — as a draft to polish, or published directly.

Three ways to trigger it:

| Trigger | How |
| --- | --- |
| **Admin UI** | `/admin/changelog` shows how many shipped posts aren't covered yet — click **Generate drafts**, edit, publish. |
| **CLI** | `npm run release-notes` creates drafts; `npm run release-notes -- --publish` publishes immediately. |
| **HTTP (cron / CI)** | `POST /api/release-notes` with `Authorization: Bearer $RELEASE_NOTES_SECRET` (set the env var to enable the endpoint). Add `?publish=1` to publish without review. |

For example, draft release notes every Friday afternoon:

```cron
0 17 * * 5 curl -fsS -X POST -H "Authorization: Bearer $RELEASE_NOTES_SECRET" https://feedback.example.com/api/release-notes
```

Each shipped post lands in exactly one entry, so re-running only picks up what shipped since the last run.
The posts an entry covers are listed on its edit page in the admin, and deleting an entry returns its posts
to the queue.

## Keyboard shortcuts

Press `?` anywhere for the overlay: `c` create a post, `/` search, `g` `b`/`r`/`c`/`n` to jump to
board / roadmap / changelog / notifications.

## Customizing

- **Your apps** — edit the `APPS` list in [`lib/config.ts`](lib/config.ts). Every app filter, chip, and dropdown follows it.
- **Branding & copy** — the site name, tagline, hero text, and contact email live in the `SITE` object in the same file; the logo is [`components/Logo.tsx`](components/Logo.tsx).
- **Statuses, categories, labels** — display names and colors are in [`lib/types.ts`](lib/types.ts).
- **Guidelines & about copy** — [`app/guidelines/page.tsx`](app/guidelines/page.tsx) and [`app/about/page.tsx`](app/about/page.tsx).

## Stack & deployment

Next.js (App Router, server actions) · Prisma · SQLite · Tailwind CSS.

Deploy anywhere a Node server with a persistent disk runs (Railway, Fly.io, Render, a VPS):

```bash
npm run build && npm start
```

Set `DATABASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the environment. SQLite needs a persistent volume; for
serverless hosts (e.g. Vercel) switch the `datasource` provider in
[`prisma/schema.prisma`](prisma/schema.prisma) to `postgresql` and point `DATABASE_URL` at a hosted Postgres —
no code changes needed.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:push` | Create/update the database schema |
| `npm run db:seed` | Reset and seed demo data (creates the admin account) |
| `npm run setup` | `db:push` + `db:seed` |
| `npm run make-admin -- <email>` | Promote a registered account to admin |
| `npm run release-notes [-- --publish]` | Generate release notes from shipped posts (drafts by default) |
| `npm run lint` | ESLint |
