/**
 * Generate release notes from shipped posts — one changelog entry per app,
 * covering everything shipped since the last run:
 *
 *   npm run release-notes               # drafts, reviewed at /admin/changelog
 *   npm run release-notes -- --publish  # publish immediately
 */
import { generateReleaseNotes } from "../lib/release-notes";
import { prisma } from "../lib/db";

const publish = process.argv.includes("--publish");

generateReleaseNotes({ publish })
  .then((entries) => {
    if (entries.length === 0) {
      console.log("Nothing to do — every shipped post is already covered by a changelog entry.");
      return;
    }
    for (const e of entries) {
      console.log(`${e.published ? "Published" : "Draft"}: ${e.title} (${e.postCount} ${e.postCount === 1 ? "post" : "posts"})`);
    }
    if (!publish) console.log("Review and publish the drafts at /admin/changelog.");
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
