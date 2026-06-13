/**
 * Idempotently ensure the admin account exists — run on every container start.
 *
 * Unlike `prisma/seed.ts` (which wipes the database and inserts demo content),
 * this NEVER deletes or overwrites data:
 *   - no user for ADMIN_EMAIL  -> create one (admin, hashed password)
 *   - user exists, not admin   -> promote to admin
 *   - user exists, already admin -> leave untouched (password is not reset)
 *
 * Password hashing matches lib/auth.ts exactly: scrypt, stored as "salt:hash"
 * (hex), so accounts created here log in through the normal sign-in flow.
 *
 * Required env: DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD
 * Optional env: ADMIN_NAME (defaults to "Slikk Team")
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const WEAK_PASSWORDS = new Set(["change-me", "changeme", "slikk-admin", "password", "admin"]);

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function requireEnv(name) {
  const value = (process.env[name] ?? "").trim();
  if (!value) {
    console.error(
      `[bootstrap-admin] ${name} is not set. Set ADMIN_EMAIL and ADMIN_PASSWORD ` +
        `in the environment before starting the app.`,
    );
    process.exit(1);
  }
  return value;
}

async function main() {
  const email = requireEnv("ADMIN_EMAIL").toLowerCase();
  const password = requireEnv("ADMIN_PASSWORD");
  const name = (process.env.ADMIN_NAME ?? "Slikk Team").trim() || "Slikk Team";

  if (WEAK_PASSWORDS.has(password.toLowerCase()) || password.length < 8) {
    console.warn(
      "[bootstrap-admin] WARNING: ADMIN_PASSWORD looks weak or is a known default. " +
        "Use a strong, unique password for production.",
    );
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (!existing) {
      await prisma.user.create({
        data: { email, name, passwordHash: hashPassword(password), isAdmin: true },
      });
      console.log(`[bootstrap-admin] Created admin account ${email}.`);
    } else if (!existing.isAdmin) {
      await prisma.user.update({ where: { email }, data: { isAdmin: true } });
      console.log(`[bootstrap-admin] Promoted existing account ${email} to admin.`);
    } else {
      console.log(`[bootstrap-admin] Admin account ${email} already exists — no changes.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[bootstrap-admin] Failed:", err);
  process.exit(1);
});
