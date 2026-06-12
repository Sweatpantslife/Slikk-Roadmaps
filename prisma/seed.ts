/**
 * Seeds the database with demo content so the board, roadmap, and changelog
 * all render with realistic data out of the box. Safe to re-run: it wipes
 * and recreates everything.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TEAM_AUTHOR = "seed-team";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

type SeedPost = {
  title: string;
  body: string;
  category: "FEATURE" | "IMPROVEMENT" | "BUG";
  appId: string | null;
  status: "UNDER_REVIEW" | "PLANNED" | "IN_PROGRESS" | "SHIPPED" | "CLOSED";
  authorName: string;
  votes: number;
  /** How many of the votes landed in the last two weeks (drives "Trending"). */
  recentVotes?: number;
  createdDaysAgo: number;
  shippedDaysAgo?: number;
  pinned?: boolean;
  officialResponse?: string;
  comments?: { authorName: string; body: string; isTeam?: boolean; daysAgo: number }[];
};

const POSTS: SeedPost[] = [
  {
    title: "Dark mode across all Slikk apps",
    body: "Working late with a bright white screen is rough. Please add a proper dark theme that syncs across web, desktop, and mobile — ideally following the system setting with a manual override.",
    category: "FEATURE",
    appId: null,
    status: "IN_PROGRESS",
    authorName: "Maya",
    votes: 48,
    recentVotes: 9,
    createdDaysAgo: 62,
    pinned: true,
    officialResponse:
      "We're on it! Dark mode is in active development and will roll out to **web first**, then desktop and mobile. Follow this post for updates.",
    comments: [
      { authorName: "Tom", body: "Yes please — my eyes will thank you. OLED black would be amazing on mobile.", daysAgo: 60 },
      { authorName: "Priya", body: "Would love scheduled switching too (light during the day, dark at night).", daysAgo: 41 },
      { authorName: "Slikk Team", body: "Update: dark mode is now in internal testing. Scheduled switching made the cut!", isTeam: true, daysAgo: 12 },
    ],
  },
  {
    title: "Offline mode for Slikk Mobile",
    body: "Trains, planes, and spotty hotel wifi make the mobile app unusable when I travel. Let me view and edit my tasks offline and sync the changes when I'm back online.",
    category: "FEATURE",
    appId: "mobile",
    status: "PLANNED",
    authorName: "Jonas",
    votes: 41,
    recentVotes: 14,
    createdDaysAgo: 35,
    comments: [
      { authorName: "Elena", body: "This is the only reason I still keep a notes app around. Conflict resolution will be the hard part.", daysAgo: 30 },
    ],
  },
  {
    title: "Slack integration for notifications",
    body: "Our team lives in Slack. It would be great to get Slikk notifications (mentions, due dates, status changes) in a Slack channel or DM, with per-event settings so it doesn't get noisy.",
    category: "FEATURE",
    appId: "web",
    status: "PLANNED",
    authorName: "Ravi",
    votes: 33,
    recentVotes: 4,
    createdDaysAgo: 80,
    comments: [
      { authorName: "Kim", body: "Two-way would be even better — create a Slikk task from a Slack message.", daysAgo: 70 },
      { authorName: "Slikk Team", body: "Planned! We're starting with notifications and will look at two-way sync after.", isTeam: true, daysAgo: 55 },
    ],
  },
  {
    title: "Keyboard shortcuts cheat sheet + command palette",
    body: "Power users want to fly. A `Cmd+K` command palette and a `?` shortcut overlay would make Slikk feel as fast as the tools we came from.",
    category: "IMPROVEMENT",
    appId: "desktop",
    status: "SHIPPED",
    authorName: "Ana",
    votes: 27,
    createdDaysAgo: 95,
    shippedDaysAgo: 9,
    comments: [
      { authorName: "Slikk Team", body: "Shipped! Hit Cmd+K (Ctrl+K on Windows) anywhere, or press ? to see every shortcut.", isTeam: true, daysAgo: 9 },
      { authorName: "Ana", body: "Just tried it — exactly what I wanted. Thank you!", daysAgo: 8 },
    ],
  },
  {
    title: "Recurring tasks",
    body: "Weekly standups, monthly reports, quarterly reviews… so much of our work repeats. Native recurring tasks with flexible rules (every weekday, 1st Monday of the month, etc.) would be huge.",
    category: "FEATURE",
    appId: null,
    status: "IN_PROGRESS",
    authorName: "Diego",
    votes: 36,
    recentVotes: 6,
    createdDaysAgo: 70,
    comments: [
      { authorName: "Fatima", body: "Please include 'complete to spawn next' AND 'fixed schedule' modes — they're different workflows.", daysAgo: 50 },
    ],
  },
  {
    title: "Bulk-edit tasks on the board view",
    body: "Selecting multiple tasks (shift-click or drag select) to move, tag, or assign them at once would save me hours every sprint planning.",
    category: "IMPROVEMENT",
    appId: "web",
    status: "UNDER_REVIEW",
    authorName: "Lena",
    votes: 19,
    recentVotes: 11,
    createdDaysAgo: 8,
  },
  {
    title: "Mobile app drains battery when sync is on",
    body: "Since the last update, the Android app uses ~15% battery per day in the background. Pixel 8, Android 15, background sync enabled. Turning off sync fixes it but defeats the purpose.",
    category: "BUG",
    appId: "mobile",
    status: "IN_PROGRESS",
    authorName: "Stefan",
    votes: 22,
    recentVotes: 13,
    createdDaysAgo: 11,
    officialResponse:
      "We reproduced this — a sync loop triggered by large attachments. A fix is in QA and should ship in the next mobile release.",
    comments: [
      { authorName: "Noor", body: "Same on Galaxy S24. Subscribing.", daysAgo: 10 },
    ],
  },
  {
    title: "Calendar view ignores week-start setting",
    body: "My workspace is set to start weeks on Monday, but the calendar view still renders Sunday-first. Confusing when planning the week.",
    category: "BUG",
    appId: "web",
    status: "SHIPPED",
    authorName: "Marta",
    votes: 12,
    createdDaysAgo: 40,
    shippedDaysAgo: 6,
    comments: [
      { authorName: "Slikk Team", body: "Fixed and deployed — the calendar now respects your workspace's week-start day everywhere.", isTeam: true, daysAgo: 6 },
    ],
  },
  {
    title: "Public API + webhooks",
    body: "We want to build internal automations on top of Slikk: create tasks from our support tool, push status changes to dashboards. A documented REST API with webhooks would unlock a lot.",
    category: "FEATURE",
    appId: null,
    status: "PLANNED",
    authorName: "Chris",
    votes: 29,
    recentVotes: 3,
    createdDaysAgo: 120,
    comments: [
      { authorName: "Hana", body: "+1, and please offer API keys per workspace, not per user.", daysAgo: 100 },
    ],
  },
  {
    title: "Desktop app: global quick-add hotkey",
    body: "A system-wide hotkey that opens a tiny capture window (like Things or Todoist) so I can jot a task without switching apps.",
    category: "FEATURE",
    appId: "desktop",
    status: "UNDER_REVIEW",
    authorName: "Yuki",
    votes: 15,
    recentVotes: 7,
    createdDaysAgo: 16,
  },
  {
    title: "Faster search with filters",
    body: "Search currently only matches titles and feels slow on big workspaces. Index descriptions and comments too, and add filters like assignee:, app:, before:/after:.",
    category: "IMPROVEMENT",
    appId: "web",
    status: "SHIPPED",
    authorName: "Omar",
    votes: 24,
    createdDaysAgo: 110,
    shippedDaysAgo: 21,
  },
  {
    title: "Export workspace to CSV/JSON",
    body: "For reporting (and peace of mind) we need a way to export all tasks, comments, and metadata. Scheduled exports to cloud storage would be a bonus.",
    category: "FEATURE",
    appId: "web",
    status: "UNDER_REVIEW",
    authorName: "Greta",
    votes: 9,
    recentVotes: 2,
    createdDaysAgo: 25,
  },
  {
    title: "Add a Pomodoro timer",
    body: "Built-in pomodoro timer with stats per task would be nice.",
    category: "FEATURE",
    appId: null,
    status: "CLOSED",
    authorName: "Bo",
    votes: 4,
    createdDaysAgo: 140,
    officialResponse:
      "Thanks for the idea! We're keeping Slikk focused on collaboration, so a built-in pomodoro timer isn't on our roadmap. Our public API (planned) will make it possible to build this as an integration.",
  },
  {
    title: "Notification badge stuck after reading everything",
    body: "The red badge on the app icon stays at '3' even after I read all notifications. Restarting the app clears it. macOS desktop app 2.4.1.",
    category: "BUG",
    appId: "desktop",
    status: "UNDER_REVIEW",
    authorName: "Pieter",
    votes: 6,
    recentVotes: 5,
    createdDaysAgo: 4,
  },
];

type SeedEntry = {
  title: string;
  body: string;
  labels: string;
  appId: string | null;
  publishedDaysAgo: number;
  published?: boolean;
};

const CHANGELOG: SeedEntry[] = [
  {
    title: "Command palette & keyboard shortcuts",
    labels: "NEW",
    appId: "desktop",
    publishedDaysAgo: 9,
    body: `Press **Cmd+K** (Ctrl+K on Windows) anywhere in Slikk to jump to any task, project, or setting — no mouse required.

- Fuzzy search across tasks, projects, and people
- Run quick actions: assign, set due date, change status
- Press \`?\` to see the full shortcut cheat sheet

This was one of the most upvoted requests on the board. Keep them coming!`,
  },
  {
    title: "Calendar fixes & week-start setting",
    labels: "FIXED,IMPROVED",
    appId: "web",
    publishedDaysAgo: 6,
    body: `The calendar view now respects your workspace's **week-start day** everywhere, including the mini date picker.

Also in this release:

- Fixed drag-and-drop sometimes dropping a task on the wrong day in zoomed-out view
- Multi-day tasks now render as a single continuous bar`,
  },
  {
    title: "Search 2.0 — full-text and filters",
    labels: "NEW,IMPROVED",
    appId: "web",
    publishedDaysAgo: 21,
    body: `Search now covers **descriptions and comments**, not just titles — and it's a lot faster.

Try the new filters:

\`\`\`
assignee:maya app:mobile before:2026-06-01 dark mode
\`\`\`

Big workspaces should see results in well under 100ms.`,
  },
  {
    title: "Smaller, faster mobile app",
    labels: "IMPROVED",
    appId: "mobile",
    publishedDaysAgo: 30,
    body: `Spring cleaning for the mobile apps:

- App size down **38%** on iOS and **31%** on Android
- Cold start is ~2× faster
- Smoother scrolling in long lists on older devices`,
  },
];

async function main() {
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.changelogEntry.deleteMany();

  let voterSeq = 0;

  for (const p of POSTS) {
    const createdAt = daysAgo(p.createdDaysAgo);
    const recent = Math.min(p.recentVotes ?? 0, p.votes);

    const post = await prisma.post.create({
      data: {
        title: p.title,
        body: p.body,
        category: p.category,
        appId: p.appId,
        status: p.status,
        pinned: p.pinned ?? false,
        authorName: p.authorName,
        authorId: `seed-author-${voterSeq}`,
        officialResponse: p.officialResponse ?? null,
        voteCount: p.votes,
        createdAt,
        shippedAt: p.shippedDaysAgo !== undefined ? daysAgo(p.shippedDaysAgo) : null,
      },
    });

    const votes = Array.from({ length: p.votes }, (_, i) => ({
      postId: post.id,
      voterId: `seed-voter-${voterSeq}-${i}`,
      // The first `recent` votes land inside the trending window, the rest are older.
      createdAt: i < recent ? daysAgo(1 + (i % 12)) : daysAgo(20 + ((i * 7) % 80)),
    }));
    if (votes.length > 0) await prisma.vote.createMany({ data: votes });

    for (const c of p.comments ?? []) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorName: c.authorName,
          authorId: c.isTeam ? TEAM_AUTHOR : `seed-commenter-${voterSeq}`,
          isTeam: c.isTeam ?? false,
          body: c.body,
          createdAt: daysAgo(c.daysAgo),
        },
      });
    }

    voterSeq++;
  }

  for (const e of CHANGELOG) {
    await prisma.changelogEntry.create({
      data: {
        title: e.title,
        body: e.body,
        labels: e.labels,
        appId: e.appId,
        published: e.published ?? true,
        publishedAt: daysAgo(e.publishedDaysAgo),
      },
    });
  }

  const counts = {
    posts: await prisma.post.count(),
    votes: await prisma.vote.count(),
    comments: await prisma.comment.count(),
    changelog: await prisma.changelogEntry.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
