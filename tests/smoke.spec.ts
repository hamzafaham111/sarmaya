import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Load .env.local so specs run locally without exporting vars.
try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch {
  /* no .env.local */
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

test("styleguide renders dark-first with all base components", async ({
  page,
}) => {
  await page.goto("/styleguide");

  await expect(
    page.getByRole("heading", { name: /styleguide/i }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await expect(
    page.getByRole("heading", { name: "RangeBand — the signature" }),
  ).toBeVisible();
  await expect(
    page.getByText("models: DCF · EPV · Graham · Reverse DCF"),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "DataTable" })).toBeVisible();
  await expect(page.getByText("1,23,45,678.00 · 99.10")).toBeVisible();

  await page
    .getByRole("button", { name: /toggle color theme/i })
    .first()
    .click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("unauthenticated visit redirects to sign-in", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/signin$/);
  await expect(
    page.getByRole("heading", { name: "Sign in to Sarmaya" }),
  ).toBeVisible();
});

// Auth smoke: sign in via an admin-minted magic-link token (no inbox),
// land on the authed overview with the shell.
test("magic-link auth reaches the authed shell", async ({ page }) => {
  test.skip(
    !SUPABASE_URL || !SERVICE_KEY,
    "needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",
  );

  const admin = createClient(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { persistSession: false },
  });
  const email = `smoke-${Date.now()}@example.com`;
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({ email, email_confirm: true });
  expect(createError).toBeNull();

  try {
    const { data: link, error: linkError } =
      await admin.auth.admin.generateLink({ type: "magiclink", email });
    expect(linkError).toBeNull();
    const tokenHash = link?.properties?.hashed_token;
    expect(tokenHash).toBeTruthy();

    await page.goto(
      `/auth/confirm?token_hash=${tokenHash}&type=magiclink&next=/`,
    );
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: "Sarmaya" }).first(),
    ).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign out" }).first(),
    ).toBeVisible();
  } finally {
    if (created?.user) await admin.auth.admin.deleteUser(created.user.id);
  }
});
