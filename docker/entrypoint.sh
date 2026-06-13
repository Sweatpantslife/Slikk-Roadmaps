#!/bin/sh
# Container entrypoint: apply migrations, ensure the admin account exists, then
# start the server. Safe to run on every boot — migrations and the admin
# bootstrap are both idempotent.
set -e

echo "[entrypoint] Applying database migrations (prisma migrate deploy)..."
attempt=0
until ./node_modules/.bin/prisma migrate deploy; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 10 ]; then
    echo "[entrypoint] Database still unreachable after $attempt attempts — giving up." >&2
    exit 1
  fi
  echo "[entrypoint] Database not ready (attempt $attempt) — retrying in 3s..."
  sleep 3
done

echo "[entrypoint] Ensuring admin account exists..."
node scripts/bootstrap-admin.mjs

echo "[entrypoint] Starting Next.js on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}..."
exec ./node_modules/.bin/next start -H "${HOSTNAME:-0.0.0.0}" -p "${PORT:-3000}"
