/**
 * Promote an existing account to admin:
 *
 *   npm run make-admin -- someone@example.com
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- <email>");
  process.exit(1);
}

prisma.user
  .update({ where: { email }, data: { isAdmin: true } })
  .then((user) => console.log(`${user.name} <${user.email}> is now an admin.`))
  .catch(() => {
    console.error(`No account found for ${email} — they need to register first.`);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
