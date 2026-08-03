# Supabase → Supabase Migration Toolkit

A self-contained utility that copies **everything** from an old Supabase
project into a new one: tables, columns, types, primary/foreign keys,
constraints, indexes, views, functions, stored procedures, triggers, RLS
policies, all data, and storage buckets + objects.

---

## What gets migrated

| Object | How | Tool |
|---|---|---|
| Tables, columns, data types | schema dump | `pg_dump` |
| Primary & foreign keys | schema dump | `pg_dump` |
| Constraints (unique/check/not-null) | schema dump | `pg_dump` |
| Indexes | schema dump | `pg_dump` |
| Views & materialized views | schema dump | `pg_dump` |
| Functions / stored procedures | schema dump | `pg_dump` |
| Triggers | schema dump | `pg_dump` |
| RLS policies + `ENABLE ROW LEVEL SECURITY` | schema dump | `pg_dump` |
| Sequences & default values | schema dump | `pg_dump` |
| All table data | data dump | `pg_dump` |
| Storage buckets + files | Storage API | `migrate-storage.mjs` |
| Auth users | see note below | — |
| Edge functions | already in `supabase/functions/` (code, not DB) | Supabase CLI |

---

## Prerequisites

1. **Postgres client tools** (`pg_dump`, `psql`, `pg_restore`) — version **16+**
   to match Supabase. Install:
   - macOS: `brew install postgresql@16`
   - Ubuntu/Debian: `sudo apt-get install postgresql-client-16`
   - Windows: install from postgresql.org
2. **Node.js 18+** (for the storage script; it uses the global `fetch`).
3. **Both projects' credentials** — copy `.env.example` to `.env` and fill it in.

---

## Step-by-step

### 1. Configure credentials
```bash
cd migration
cp .env.example .env
# edit .env with your OLD and NEW project connection strings + service role keys
```

> Use the **direct** DB connection (host `db.<ref>.supabase.co`, port `5432`),
> not the pooler (`6543`). `pg_dump` needs a direct session connection.

### 2. Run the full migration
```bash
./migrate.sh
```

This performs, in order:
1. `pg_dump` schema-only from SOURCE → `supabase/migrations/0001_source_schema.sql`
2. `pg_dump` data-only from SOURCE → `dumps/data.sql`
3. Applies the schema to TARGET
4. Loads the data into TARGET
5. Prints a summary

You can also run each phase manually — see `migrate.sh`, it's just documented
`pg_dump`/`psql` calls.

### 3. Migrate storage buckets & files
```bash
node migrate-storage.mjs
```

### 4. Migrate auth users (optional)
Auth users live in the `auth` schema, which is owned by Supabase and cannot be
dumped/restored with normal privileges. Two options:
- **Supabase CLI**: `supabase db dump --data-only --schema auth` from the source
  (requires CLI login + linked project), then load into the target.
- **Dashboard**: For a handful of users, recreate them via
  Authentication → Users, or use the Admin API (`POST /auth/v1/admin/users`)
  with the service role key.

> If you migrate `auth.users`, keep the **same user UUIDs** so every
> `user_id` foreign key (e.g. `user_roles`, `orders`) still matches.

### 5. Verify
```bash
node verify.mjs
```
Produces a side-by-side report: table row counts, object counts (tables, views,
functions, triggers, policies, indexes) for SOURCE vs TARGET, and flags any
mismatch.

---

## About Cloud (important)

If your goal is for **app** to start using the new project, note
that Cloud manages the database connection for you — the client files
(`src/integrations/supabase/client.ts`, `types.ts`) and the `VITE_SUPABASE_*`
env vars are auto-generated and locked, and cannot be repointed to an external
project. This toolkit is therefore for the case where you're moving the data
**out** to a Supabase project you control and running the app outside ,
or where **this Cloud project is the target** and you're importing an external
project's data *into* it (in that case set the Cloud project as TARGET is not
possible either, since its service credentials aren't exposed — instead paste
`0001_source_schema.sql` into migration and load data via CSV import).
