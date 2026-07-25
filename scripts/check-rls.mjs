// RLS acceptance check (PLAN.md Phase 1): via the ANON KEY, user A cannot
// read or write user B's rows in ANY user-owned table.
// Usage: node scripts/check-rls.mjs  (reads .env.local)

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  /* rely on real env */
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SERVICE) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
const run = Date.now();
const failures = [];
const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => {
  failures.push(m);
  console.error(`  ✗ LEAK: ${m}`);
};

async function makeUser(tag) {
  const email = `rls-${tag}-${run}@example.com`;
  const password = `Rls-${run}-${tag}!x`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`createUser ${tag}: ${error.message}`);
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: e } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (e) throw new Error(`signIn ${tag}: ${e.message}`);
  return { id: data.user.id, client };
}

let a, b, instrumentId;
try {
  console.log("Seeding two users + one instrument + rows in every user table…");
  a = await makeUser("a");
  b = await makeUser("b");

  const { data: inst, error: iErr } = await admin
    .from("instruments")
    .insert({
      kind: "stock",
      symbol: `RLS${run % 1000}.NS`,
      market: "IN",
      name: "RLS Check Ltd",
      currency: "INR",
    })
    .select()
    .single();
  if (iErr) throw new Error(`seed instrument: ${iErr.message}`);
  instrumentId = inst.id;

  for (const u of [a, b]) {
    const who = u === a ? "A" : "B";
    const rows = [
      admin.from("user_instruments").insert({
        user_id: u.id,
        instrument_id: instrumentId,
        notes_md: `${who}'s private notes`,
      }),
      admin.from("valuations").insert({
        user_id: u.id,
        instrument_id: instrumentId,
        model: "dcf",
        assumptions: { growth_rate_pct: 12 },
      }),
      admin.from("theses").insert({
        user_id: u.id,
        instrument_id: instrumentId,
        statement: `${who}'s thesis`,
      }),
      admin.from("journal_entries").insert({
        user_id: u.id,
        instrument_id: instrumentId,
        kind: "buy",
        trade_date: "2026-07-25",
        price: "100",
        quantity: "10",
        reasoning: `${who}'s private reasoning`,
      }),
      admin.from("annotations").insert({
        user_id: u.id,
        instrument_id: instrumentId,
        target: "revenue:2025",
        body: `${who}'s cell note`,
      }),
    ];
    for (const q of rows) {
      const { error } = await q;
      if (error) throw new Error(`seed ${who}: ${error.message}`);
    }
  }
  await admin
    .from("job_runs")
    .insert({ job: "daily", started_at: new Date().toISOString() });

  const USER_TABLES = [
    "user_instruments",
    "valuations",
    "theses",
    "journal_entries",
    "annotations",
  ];

  console.log("Asserting isolation via the anon key as user A…");
  for (const table of USER_TABLES) {
    const { data, error } = await a.client.from(table).select("*");
    if (error) fail(`${table}: unexpected error ${error.message}`);
    else if (data.length !== 1)
      fail(`${table}: A sees ${data.length} rows, expected 1`);
    else if (data[0].user_id !== a.id) fail(`${table}: A sees a foreign row`);
    else pass(`${table}: A sees exactly their own row`);
  }

  const { data: cross } = await a.client
    .from("theses")
    .select("*")
    .eq("user_id", b.id);
  if (cross?.length) fail("A reads B's theses via targeted filter");
  else pass("targeted read of B's rows returns empty");

  const { error: forge } = await a.client.from("annotations").insert({
    user_id: b.id,
    instrument_id: instrumentId,
    target: "forged",
    body: "forged as B",
  });
  if (forge) pass(`forged insert as B rejected (${forge.code})`);
  else fail("A inserted an annotation as B");

  const { data: upd } = await a.client
    .from("user_instruments")
    .update({ notes_md: "defaced" })
    .eq("user_id", b.id)
    .select();
  if (upd?.length) fail("A updated B's notes");
  else pass("cross-user update affects zero rows");

  const { data: jr } = await a.client.from("job_runs").select("*");
  if (jr?.length) fail("job_runs visible to users");
  else pass("job_runs invisible to users (no policies)");

  const { data: anonRows } = await createClient(URL, ANON, {
    auth: { persistSession: false },
  })
    .from("user_instruments")
    .select("*");
  if (anonRows?.length) fail("unauthenticated anon key reads user rows");
  else pass("unauthenticated anon key reads zero rows");

  const { error: writeShared } = await a.client
    .from("instruments")
    .insert({
      kind: "stock",
      symbol: "EVIL.NS",
      market: "IN",
      currency: "INR",
    });
  if (writeShared) pass("users cannot write the shared instruments catalog");
  else fail("authenticated user inserted into instruments");
} finally {
  console.log("Cleaning up…");
  if (a) await admin.auth.admin.deleteUser(a.id).catch(() => {});
  if (b) await admin.auth.admin.deleteUser(b.id).catch(() => {});
  if (instrumentId)
    await admin.from("instruments").delete().eq("id", instrumentId);
}

if (failures.length) {
  console.error(`\nRLS CHECK FAILED: ${failures.length} leak(s)`);
  process.exit(1);
}
console.log("\nRLS CHECK PASSED: full isolation across every user-owned table");
