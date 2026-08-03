
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

function loadEnv() {
  const txt = readFileSync(new URL("./.env", import.meta.url), "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}
loadEnv();

const SRC = process.env.SOURCE_DB_URL;
const DST = process.env.TARGET_DB_URL;
if (!SRC || !DST) throw new Error("SOURCE_DB_URL / TARGET_DB_URL missing in .env");

const q = (db, sql) =>
  execFileSync("psql", [db, "-tAc", sql], { encoding: "utf8" }).trim();

const COUNTS = {
  tables: "select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE'",
  views: "select count(*) from information_schema.views where table_schema='public'",
  functions: "select count(*) from information_schema.routines where routine_schema='public'",
  triggers: "select count(*) from information_schema.triggers where trigger_schema='public'",
  policies: "select count(*) from pg_policies where schemaname='public'",
  indexes: "select count(*) from pg_indexes where schemaname='public'",
};

console.log("=== Object counts (public schema) ===");
console.log("object      | source | target | match");
console.log("------------|--------|--------|------");
let ok = true;
for (const [name, sql] of Object.entries(COUNTS)) {
  const s = q(SRC, sql), t = q(DST, sql);
  const match = s === t;
  if (!match) ok = false;
  console.log(`${name.padEnd(11)} | ${s.padStart(6)} | ${t.padStart(6)} | ${match ? "✓" : "✗"}`);
}

console.log("\n=== Row counts per table ===");
const tables = q(SRC,
  "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name"
).split("\n").filter(Boolean);

console.log("table                         | source | target | match");
console.log("------------------------------|--------|--------|------");
for (const tbl of tables) {
  const s = q(SRC, `select count(*) from public."${tbl}"`);
  let t;
  try { t = q(DST, `select count(*) from public."${tbl}"`); }
  catch { t = "MISSING"; }
  const match = s === t;
  if (!match) ok = false;
  console.log(`${tbl.padEnd(29)} | ${s.padStart(6)} | ${String(t).padStart(6)} | ${match ? "✓" : "✗"}`);
}

console.log(`\n${ok ? "✅ All checks passed — schema and data match." : "⚠️  Mismatches found — review the ✗ rows above."}`);
process.exit(ok ? 0 : 1);
