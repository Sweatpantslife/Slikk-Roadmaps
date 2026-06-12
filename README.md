# Slikk Feedback Hub

A self-hosted feedback board, public roadmap, and changelog for the Slikk apps — inspired by [Base44's feedback hub](https://feedback.base44.com).

| Page | What it does |
| --- | --- |
| **Board** (`/`) | Users suggest features, improvements, and bug reports; vote and comment. Category tabs with live counts, Top / Trending / New sorting, per-app filtering, and full-text search. |
| **Roadmap** (`/roadmap`) | Three columns — Planned, In progress, Shipped — fed directly by post statuses. Votable from the roadmap. |
| **Changelog** (`/changelog`) | Markdown release notes with New / Improved / Fixed labels and per-app tags, on a timeline. |
| **Admin** (`/admin`) | Password-protected team area: triage posts (status, pin, delete), post official team responses, comment with a team badge, and write/publish changelog entries (drafts supported). |

No sign-up is required for visitors: votes are tracked per browser (one vote per post), and display names are remembered between visits.

## Quick start

```bash
npm install            # also runs `prisma generate`
cp .env.example .env   # then set ADMIN_PASSWORD
npm run setup          # creates the SQLite db + seeds demo data
npm run dev            # http://localhost:3000
```

Sign in at `/admin` with the `ADMIN_PASSWORD` from your `.env`.

To start with an **empty** board instead of demo data, run `npm run db:push` instead of `npm run setup`.

## How feedback flows

1. A user posts to the board (auto-upvoted by its author) — status starts at **In review**.
2. The team triages it at `/admin`: set it to **Planned**, **In progress**, **Shipped**, or **Closed**, pin it, or add an official response.
3. Anything Planned / In progress / Shipped appears on the public roadmap automatically (marking a post Shipped stamps its ship date).
4. When it ships, write a changelog entry at `/admin/changelog` (markdown, with New / Improved / Fixed labels).

## Customizing

- **Your apps** — edit the `APPS` list in [`lib/config.ts`](lib/config.ts). Every app filter, chip, and dropdown follows it.
- **Branding & copy** — the site name, tagline, and hero text live in the `SITE` object in the same file; the logo is [`components/Logo.tsx`](components/Logo.tsx).
- **Statuses, categories, labels** — display names and colors are in [`lib/types.ts`](lib/types.ts).

## Stack & deployment

Next.js (App Router, server actions) · Prisma · SQLite · Tailwind CSS.

Deploy anywhere a Node server with a persistent disk runs (Railway, Fly.io, Render, a VPS):

```bash
npm run build && npm start
```

Set `DATABASE_URL` and `ADMIN_PASSWORD` in the environment. SQLite needs a persistent volume; for serverless hosts (e.g. Vercel) switch the `datasource` provider in [`prisma/schema.prisma`](prisma/schema.prisma) to `postgresql` and point `DATABASE_URL` at a hosted Postgres — no code changes needed.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:push` | Create/update the database schema |
| `npm run db:seed` | Reset and seed demo data |
| `npm run setup` | `db:push` + `db:seed` |
| `npm run lint` | ESLint |
