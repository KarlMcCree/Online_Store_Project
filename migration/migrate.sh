#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Full Supabase -> Supabase migration (schema + data) via pg_dump / psql.
# Reads credentials from ./.env
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "ERROR: .env not found. Run: cp .env.example .env  and fill it in." >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a; source .env; set +a

: "${SOURCE_DB_URL:?SOURCE_DB_URL missing in .env}"
: "${TARGET_DB_URL:?TARGET_DB_URL missing in .env}"

MIG_DIR="../supabase/migrations"
DUMP_DIR="./dumps"
mkdir -p "$MIG_DIR" "$DUMP_DIR"

TS="$(date +%Y%m%d%H%M%S)"
SCHEMA_FILE="$MIG_DIR/${TS}_source_schema.sql"
DATA_FILE="$DUMP_DIR/data.sql"

echo "==> [1/4] Dumping SCHEMA from source (public schema)..."
pg_dump "$SOURCE_DB_URL" \
  --schema-only \
  --no-owner --no-privileges \
  --schema=public \
  --file="$SCHEMA_FILE"
echo "    schema written to $SCHEMA_FILE"

echo "==> [2/4] Dumping DATA from source (public schema)..."
pg_dump "$SOURCE_DB_URL" \
  --data-only \
  --no-owner --no-privileges \
  --disable-triggers \
  --schema=public \
  --file="$DATA_FILE"
echo "    data written to $DATA_FILE"

echo "==> [3/4] Applying SCHEMA to target..."
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE"

echo "==> [4/4] Loading DATA into target..."
psql "$TARGET_DB_URL" -v ON_ERROR_STOP=1 -f "$DATA_FILE"

echo ""
echo "✅ Schema + data migration complete."
echo "   Next: node migrate-storage.mjs   (buckets + files)"
echo "         node verify.mjs            (verification report)"
