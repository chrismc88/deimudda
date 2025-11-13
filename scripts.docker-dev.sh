#!/usr/bin/env bash
set -euo pipefail

echo "[docker-dev] Starting dev environment..."

# Ensure a .env exists inside container (optional, compose can pass env directly)
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "[docker-dev] No .env found. Copying .env.example to .env"
  cp .env.example .env || true
fi

export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3000}

# If a DB is configured, wait a bit for it and run migrations + seed
if [ -n "${DATABASE_URL:-}" ]; then
  echo "[docker-dev] DATABASE_URL detected. Waiting for DB to be ready..."
  DB_HOST=$(node -e "try{const u=new URL(process.env.DATABASE_URL);console.log(u.hostname)}catch{console.log('')}")
  DB_PORT=$(node -e "try{const u=new URL(process.env.DATABASE_URL);console.log(u.port||3306)}catch{console.log('3306')}")
  if [ -n "$DB_HOST" ]; then
    for i in {1..60}; do
      (echo > /dev/tcp/$DB_HOST/$DB_PORT) >/dev/null 2>&1 && break || sleep 1
      if [ "$i" -eq 60 ]; then
        echo "[docker-dev] DB did not become ready in time, continuing anyway..."
      fi
    done
  fi

  echo "[docker-dev] Running migrations (pnpm db:push)"
  pnpm db:push || true

  if [ -n "${OWNER_OPEN_ID:-}" ]; then
    echo "[docker-dev] Seeding admin (OWNER_OPEN_ID=$OWNER_OPEN_ID)"
    pnpm seed:admin || true
  fi

  echo "[docker-dev] Seeding sample data"
  pnpm seed:sample || true
fi

echo "[docker-dev] Launching dev server on 0.0.0.0:$PORT"
echo "[docker-dev] NODE_ENV=$NODE_ENV"
echo "[docker-dev] DATABASE_URL=$DATABASE_URL"

# Debug: Show listening ports before starting
if command -v ss &> /dev/null; then
  echo "[docker-dev] Current listening ports:"
  ss -tuln
fi

# Start the server with debugging
set -x
exec pnpm dev --host 0.0.0.0 --port $PORT
