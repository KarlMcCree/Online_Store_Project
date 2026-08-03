
import { readFileSync } from "node:fs";

function loadEnv() {
  const txt = readFileSync(new URL("./.env", import.meta.url), "utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m) process.env[m[1]] ??= m[2];
  }
}
loadEnv();

const SRC_URL = process.env.SOURCE_SUPABASE_URL;
const SRC_KEY = process.env.SOURCE_SERVICE_ROLE_KEY;
const DST_URL = process.env.TARGET_SUPABASE_URL;
const DST_KEY = process.env.TARGET_SERVICE_ROLE_KEY;

for (const [k, v] of Object.entries({ SRC_URL, SRC_KEY, DST_URL, DST_KEY })) {
  if (!v) throw new Error(`Missing ${k} in .env`);
}

const h = (key) => ({ apikey: key, Authorization: `Bearer ${key}` });

async function listBuckets(url, key) {
  const r = await fetch(`${url}/storage/v1/bucket`, { headers: h(key) });
  if (!r.ok) throw new Error(`listBuckets ${r.status}: ${await r.text()}`);
  return r.json();
}

async function createBucket(url, key, b) {
  const r = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...h(key), "Content-Type": "application/json" },
    body: JSON.stringify({
      id: b.id,
      name: b.name,
      public: b.public,
      file_size_limit: b.file_size_limit ?? null,
      allowed_mime_types: b.allowed_mime_types ?? null,
    }),
  });
  if (!r.ok && r.status !== 409) throw new Error(`createBucket ${b.id} ${r.status}: ${await r.text()}`);
}

async function listObjects(url, key, bucket, prefix = "") {
  const out = [];
  let offset = 0;
  for (;;) {
    const r = await fetch(`${url}/storage/v1/object/list/${bucket}`, {
      method: "POST",
      headers: { ...h(key), "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 100, offset, sortBy: { column: "name", order: "asc" } }),
    });
    if (!r.ok) throw new Error(`listObjects ${bucket} ${r.status}: ${await r.text()}`);
    const page = await r.json();
    for (const item of page) {
      if (item.id === null) {
        // folder — recurse
        const sub = await listObjects(url, key, bucket, `${prefix}${item.name}/`);
        out.push(...sub);
      } else {
        out.push(`${prefix}${item.name}`);
      }
    }
    if (page.length < 100) break;
    offset += 100;
  }
  return out;
}

async function copyObject(bucket, path) {
  const dl = await fetch(`${SRC_URL}/storage/v1/object/${bucket}/${encodeURI(path)}`, { headers: h(SRC_KEY) });
  if (!dl.ok) throw new Error(`download ${bucket}/${path} ${dl.status}`);
  const body = Buffer.from(await dl.arrayBuffer());
  const ct = dl.headers.get("content-type") ?? "application/octet-stream";
  const up = await fetch(`${DST_URL}/storage/v1/object/${bucket}/${encodeURI(path)}`, {
    method: "POST",
    headers: { ...h(DST_KEY), "Content-Type": ct, "x-upsert": "true" },
    body,
  });
  if (!up.ok) throw new Error(`upload ${bucket}/${path} ${up.status}: ${await up.text()}`);
}

const buckets = await listBuckets(SRC_URL, SRC_KEY);
if (buckets.length === 0) {
  console.log("No storage buckets in source. Nothing to do.");
  process.exit(0);
}

let files = 0;
for (const b of buckets) {
  console.log(`\n==> Bucket "${b.id}" (public=${b.public})`);
  await createBucket(DST_URL, DST_KEY, b);
  const objects = await listObjects(SRC_URL, SRC_KEY, b.id);
  for (const path of objects) {
    await copyObject(b.id, path);
    files++;
    console.log(`    ✓ ${path}`);
  }
}
console.log(`\n✅ Storage migration complete: ${buckets.length} bucket(s), ${files} file(s).`);
