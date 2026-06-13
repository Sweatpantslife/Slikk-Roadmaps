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

## Quick start (local development)

```bash
npm install                                     # also runs `prisma generate`
cp .env.example .env                            # set ADMIN_EMAIL / ADMIN_PASSWORD
docker compose -f docker-compose.dev.yml up -d  # PostgreSQL for local dev
npm run setup                                   # push schema + seed demo data
npm run dev                                     # http://localhost:3000
```

Prefer your own database? Point `DATABASE_URL` in `.env` at any PostgreSQL
instance and run `npm run setup`. To deploy, jump to
[Stack & deployment](#stack--deployment).

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

### From your app repos — git + AI agents

Not everything starts on the feedback board: bug fixes, performance work, and dev-initiated features ship
straight from the app repos. An AI agent in each repo's CI can write those release notes and submit them to
the hub:

1. On every release tag, a workflow collects the commits since the previous tag.
2. [Claude Code's GitHub Action](https://github.com/anthropics/claude-code-action) reads them (and the
   diffs, when messages are terse), writes customer-facing New / Improved / Fixed markdown, and skips the
   refactors, chores, and CI noise.
3. It POSTs to `POST /api/release-notes/ingest` (same `RELEASE_NOTES_SECRET` bearer auth), which saves a
   **draft** entry for that app — reviewed and published at `/admin/changelog` like any other.

Copy [`examples/app-repo-release-notes.yml`](examples/app-repo-release-notes.yml) into each app repo as
`.github/workflows/release-notes.yml`, set its `APP_ID`, and add the `ANTHROPIC_API_KEY`,
`FEEDBACK_HUB_URL`, and `RELEASE_NOTES_SECRET` repository secrets.

**Closing the loop from commits:** a commit (or squashed PR) whose message carries a `Fixes-Feedback:`
trailer automatically marks that feedback post **Shipped** when the notes are ingested — subscribers are
notified, the roadmap updates, and the post is covered by the new entry, so developers never need to
touch the admin UI:

```
Fix sync loop on large attachments

Fixes-Feedback: cmqbfh8mo00c97dlejezikta0
```

The id is the last segment of the post's URL (a full post URL works too). The ingest payload is documented
in [`app/api/release-notes/ingest/route.ts`](app/api/release-notes/ingest/route.ts); any CI system or agent
that can `curl` can use it — Claude Code is just the turnkey option.

## Keyboard shortcuts

Press `?` anywhere for the overlay: `c` create a post, `/` search, `g` `b`/`r`/`c`/`n` to jump to
board / roadmap / changelog / notifications.

## Customizing

- **Your apps** — edit the `APPS` list in [`lib/config.ts`](lib/config.ts). Every app filter, chip, and dropdown follows it.
- **Branding & copy** — the site name, tagline, hero text, and contact email live in the `SITE` object in the same file; the logo is [`components/Logo.tsx`](components/Logo.tsx).
- **Statuses, categories, labels** — display names and colors are in [`lib/types.ts`](lib/types.ts).
- **Guidelines & about copy** — [`app/guidelines/page.tsx`](app/guidelines/page.tsx) and [`app/about/page.tsx`](app/about/page.tsx).

## Stack & deployment

Next.js (App Router, server actions) · Prisma · PostgreSQL · Tailwind CSS.

The container is self-bootstrapping: on every start it applies migrations
(`prisma migrate deploy`) and ensures the admin account exists from
`ADMIN_EMAIL` / `ADMIN_PASSWORD`. Both steps are idempotent — they never wipe or
overwrite existing data (that's what the dev-only `npm run db:seed` is for).
Readiness is gated by a health check at `GET /api/health` (200 only when the
database is reachable).

### Docker Compose

The repo ships a production [`Dockerfile`](Dockerfile) and
[`docker-compose.yml`](docker-compose.yml) (Next.js app + PostgreSQL, with
healthchecks and a `pgdata` volume for persistence):

```bash
cp .env.example .env     # set ADMIN_EMAIL, ADMIN_PASSWORD, POSTGRES_PASSWORD
docker compose up -d --build
```

The app listens on port 3000 on the Docker network. Put a reverse proxy in front
for TLS, or uncomment the `ports:` block in `docker-compose.yml` to publish it
directly. Set `APP_URL` (and optionally `ALLOWED_ORIGINS`) to your public URL so
Server Actions trust the proxied host.

### Coolify

`docker-compose.yml` is Coolify-ready — its built-in Traefik handles HTTPS:

1. Create a **Docker Compose** resource pointing at this repo.
2. Set a **domain** on the `app` service. Coolify terminates TLS and routes to
   port 3000 (wired through the `SERVICE_FQDN_APP_3000` magic variable).
3. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment — the Postgres
   password is generated for you via `SERVICE_PASSWORD_POSTGRES`.
4. Deploy. `GET /api/health` is used as the health check.

### Anywhere else

Any host that runs a Node server against a PostgreSQL database (Railway, Fly.io,
Render, a VPS):

```bash
npm ci
npm run build
npm run migrate:deploy    # apply migrations
npm run bootstrap-admin   # create/ensure the admin account
npm start                 # next start
```

Set `DATABASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the environment.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run migrate:deploy` | Apply migrations (production / containers) |
| `npm run migrate:dev` | Create + apply a migration during development |
| `npm run bootstrap-admin` | Idempotently create/ensure the admin account (no data loss) |
| `npm run db:push` | Sync the schema to the database (dev convenience) |
| `npm run db:seed` | Reset and seed demo data — destructive, dev only |
| `npm run setup` | `db:push` + `db:seed` |
| `npm run make-admin -- <email>` | Promote a registered account to admin |
| `npm run release-notes [-- --publish]` | Generate release notes from shipped posts (drafts by default) |
| `npm run lint` | ESLint |
