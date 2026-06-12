/**
 * Site-wide configuration for the Slikk feedback hub.
 * Edit the `apps` list to match your team's products — every board,
 * roadmap and changelog filter is driven by this list.
 */

export type AppInfo = {
  id: string;
  name: string;
  /** Tailwind classes used for the app's chip on cards. */
  chipClass: string;
};

export const SITE = {
  name: "Slikk",
  title: "Slikk Feedback Hub",
  tagline: "A clearer path from feedback to ship",
  heroTitle: "What should we build next?",
  heroSubtitle:
    "Suggest new features, request improvements, and vote on the ideas you want most. Search before you post — every request is read by the team, and we build the ones you upvote.",
} as const;

export const APPS: AppInfo[] = [
  { id: "web", name: "Slikk Web", chipClass: "bg-sky-50 text-sky-700 ring-sky-200" },
  { id: "mobile", name: "Slikk Mobile", chipClass: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { id: "desktop", name: "Slikk Desktop", chipClass: "bg-orange-50 text-orange-700 ring-orange-200" },
];

export function getApp(id: string | null | undefined): AppInfo | undefined {
  return APPS.find((a) => a.id === id);
}
