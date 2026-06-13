import { prisma } from "@/lib/db";

/**
 * Liveness/readiness probe for Docker, Coolify, and load balancers.
 * Returns 200 only when the database is reachable, 503 otherwise.
 *
 *   GET /api/health  ->  { status: "ok", db: "up" }
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json(
      { status: "ok", db: "up" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "error", db: "down" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
