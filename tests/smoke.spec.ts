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

// Learn is public and needs no data, which makes it the right place to
// assert the theme contract without signing in.
test("learn is readable signed-out, dark-first, and light on toggle", async ({
  page,
}) => {
  await page.goto("/learn");

  await expect(page.getByRole("heading", { name: "Learn" })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByText("Education, not advice")).toBeVisible();

  // Section and article navigation both render.
  await expect(
    page.getByRole("heading", { name: "Studying a business" }).first(),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /The three financial statements/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/learn\/the-three-statements$/);
  await expect(
    page.getByRole("heading", { name: "The three financial statements" }),
  ).toBeVisible();
  await expect(page.getByText("assets = liabilities + equity")).toBeVisible();

  // The sidebar filter narrows the contents list.
  await page.getByPlaceholder("Filter topics…").fill("valuation");
  await expect(
    page.getByRole("link", { name: "Why there is no single value" }),
  ).toBeVisible();

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
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign out" }).first(),
    ).toBeVisible();

    // Phase 2: search "reliance", add it, land on the instrument shell.
    await page.goto("/instruments");
    await page.getByLabel("Search instruments").fill("reliance");
    await page
      .getByRole("button", { name: /^RELIANCEReliance Industries/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/i\/[0-9a-f-]{36}$/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: /Reliance Industries/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /stop tracking RELIANCE\.NS/i }),
    ).toBeVisible();

    // Phase 3: the study environment renders real statement data.
    await expect(
      page.getByRole("heading", { name: "Statements" }),
    ).toBeVisible();
    await expect(page.getByText(/data since \d{4}/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ratios" })).toBeVisible();

    // Key figures: the snapshot vocabulary the daily job already stores.
    const keyFigures = page
      .locator("section")
      .filter({ has: page.getByRole("heading", { name: "Key figures" }) });
    await expect(keyFigures.getByText("Market cap")).toBeVisible();
    await expect(keyFigures.getByText("P / E", { exact: true })).toBeVisible();
    await expect(keyFigures.getByText("Earnings yield")).toBeVisible();
    await expect(keyFigures.getByText("FCF yield")).toBeVisible();
    expect(await keyFigures.innerText()).not.toContain("NaN");
    // The added ratio rows compute from the same statements.
    await expect(page.getByText("Cash conversion (FCF / net income)")).toBeVisible(); // prettier-ignore
    await expect(page.getByText("Net debt / equity")).toBeVisible();

    // No NaN anywhere in the rendered page (automated criterion).
    expect(await page.locator("main").innerText()).not.toContain("NaN");

    // Phase 4: the valuation panel renders with auto-seeded models and the
    // signature RangeBand shows "your estimate range".
    await expect(
      page.getByRole("heading", { name: "Valuation — your models" }),
    ).toBeVisible();
    await expect(page.getByText(/your estimate range · models:/)).toBeVisible();
    // Editing an assumption recomputes live and persists.
    const growthInput = page
      .locator("label", { hasText: "Growth %/yr" })
      .locator("input");
    await growthInput.fill("7");
    await page
      .getByRole("button", { name: "Save", exact: true })
      .first()
      .click();
    await expect(
      page.getByRole("button", { name: "Saved", exact: true }).first(),
    ).toBeVisible({ timeout: 10_000 });
    await page.reload();
    await expect(
      page.locator("label", { hasText: "Growth %/yr" }).locator("input"),
    ).toHaveValue("7", { timeout: 15_000 });

    // Annotation on a statement cell persists across reload.
    await page
      .getByRole("cell", { name: "Revenue" })
      .locator("..")
      .locator("button")
      .first()
      .click();
    await page
      .getByPlaceholder(/Note on Revenue/)
      .fill("smoke-test annotation on revenue");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    // Wait for the write to land before reloading — reloading mid-transition
    // cancels the server action and the note is silently lost.
    await expect(
      page.getByTitle("smoke-test annotation on revenue"),
    ).toBeVisible({ timeout: 15_000 });
    await page.reload();
    await expect(
      page.getByTitle("smoke-test annotation on revenue"),
    ).toBeVisible({ timeout: 15_000 });

    // Notes autosave survives reload.
    const notesSection = page.locator("section").filter({
      has: page.getByPlaceholder("Your research notes (markdown)…"),
    });
    await notesSection
      .getByPlaceholder("Your research notes (markdown)…")
      .fill("smoke note: studying reliance");
    await expect(notesSection.getByText("Saved", { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await page.reload();
    await expect(
      page.getByPlaceholder("Your research notes (markdown)…"),
    ).toHaveValue("smoke note: studying reliance");
    // Phase 5: add a real fund by searching its name; NAV history + returns
    // render with the kind-specific layout (no valuation/statements).
    await page.goto("/instruments");
    await page.getByLabel("Search instruments").fill("parag parikh flexi");
    await page
      .getByRole("button", { name: /Parag Parikh Flexi Cap Fund/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/i\/[0-9a-f-]{36}$/, { timeout: 30_000 });
    await expect(
      page.getByRole("heading", { name: /Parag Parikh Flexi Cap/ }),
    ).toBeVisible();
    await expect(page.getByText("5Y CAGR")).toBeVisible();
    await expect(page.getByText("NAV", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Valuation — your models" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Statements" }),
    ).not.toBeVisible();
    // Phase 6: record a buy with mandatory reasoning; portfolio buckets it.
    await page.goto("/instruments");
    await page
      .getByRole("link", { name: /RELIANCE\.NS/ })
      .first()
      .click();
    // The record form starts open for a fresh user (no entries yet).
    await page.locator('input[name="price"]').fill("1278");
    await page.locator('input[name="quantity"]').fill("10");
    await page.locator('textarea[name="reasoning"]').fill("short");
    // client minLength blocks; bypass to prove the server/DB reject too
    await page
      .locator('textarea[name="reasoning"]')
      .evaluate((el) => el.removeAttribute("minlength"));
    await page.getByRole("button", { name: "Record", exact: true }).click();
    await expect(page.getByText(/Rejected|Invalid entry/)).toBeVisible({
      timeout: 15_000,
    });

    // The rejection re-renders the form on the server; refilling before that
    // lands types into a form that is about to be replaced.
    await expect(page.locator('textarea[name="reasoning"]')).toHaveValue("", {
      timeout: 15_000,
    });
    await page.locator('input[name="price"]').fill("1278");
    await page.locator('input[name="quantity"]').fill("10");
    await page
      .locator('textarea[name="reasoning"]')
      .fill("smoke-test buy: durable energy-to-tech compounder");
    await page.getByRole("button", { name: "Record", exact: true }).click();
    await expect(
      page.getByText("Holding 10 shares", { exact: false }),
    ).toBeVisible({ timeout: 15_000 });

    await page.goto("/portfolio");
    await expect(
      page.getByRole("heading", { name: "INR holdings" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "RELIANCE.NS", exact: true }),
    ).toBeVisible();
    expect(await page.locator("main").innerText()).not.toContain("NaN");
  } finally {
    if (created?.user) await admin.auth.admin.deleteUser(created.user.id);
  }
});

// A company no provider covers: created by hand, priced by hand, statements
// typed in — and the computed layers (ratios, valuation) treat those typed
// figures as first-class.
test("hand-kept instrument: create, price, type statements, see ratios", async ({
  page,
}) => {
  test.skip(
    !SUPABASE_URL || !SERVICE_KEY,
    "needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY",
  );

  const admin = createClient(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { persistSession: false },
  });
  const email = `manual-${Date.now()}@example.com`;
  const { data: created } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  try {
    const { data: link } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    await page.goto(
      `/auth/confirm?token_hash=${link?.properties?.hashed_token}&type=magiclink&next=/instruments`,
    );
    await expect(page).toHaveURL(/\/instruments$/);

    // Create it by hand.
    const symbol = `ACME${Date.now().toString().slice(-6)}`;
    await page.getByText(/Add a company by hand/).click();
    // Scoped: the search widget also carries a hidden `symbol` input.
    const manualForm = page.locator("details form");
    await manualForm.locator('input[name="name"]').fill("Acme Textiles Ltd.");
    await manualForm.locator('input[name="symbol"]').fill(symbol);
    await manualForm.locator('select[name="market"]').selectOption("IN");
    await manualForm.locator('select[name="currency"]').selectOption("INR");
    await manualForm
      .getByRole("button", { name: "Create hand-kept instrument" })
      .click();

    await expect(page).toHaveURL(/\/i\/[0-9a-f-]{36}$/, { timeout: 30_000 });
    const instrumentUrl = page.url();
    await expect(
      page.getByRole("heading", { name: "Acme Textiles Ltd." }),
    ).toBeVisible();
    await expect(page.getByText("hand-kept").first()).toBeVisible();
    // No provider => the honest empty states, not a grid of dashes.
    await expect(
      page.getByText(/this instrument is yours to fill in/),
    ).toBeVisible();
    await expect(page.getByText(/this one is hand-kept/)).toBeVisible();

    // Price it by hand; the header picks it up.
    await page.locator('input[name="manualPrice"]').fill("250");
    await page.getByRole("button", { name: "Save price" }).click();
    await expect(page.getByRole("button", { name: "Price saved" })).toBeVisible(
      { timeout: 15_000 },
    );
    await expect(page.getByText("₹250").first()).toBeVisible({
      timeout: 15_000,
    });

    // Type an income statement year: revenue 10Cr, net income 1.2Cr.
    await page.getByRole("button", { name: "+ Add figures by hand" }).click();
    await expect(
      page.getByRole("heading", { name: "Your own figures" }),
    ).toBeVisible();
    await page.getByRole("spinbutton", { name: "Fiscal year" }).fill("2024");
    await page.getByRole("textbox", { name: "Revenue" }).fill("100000000");
    await page.getByRole("textbox", { name: "Net income" }).fill("12000000");
    await page.getByRole("button", { name: "Save figures" }).click();

    // The typed year is now a real year: table, ratios, all computed.
    await expect(page.getByText("FY2024").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("heading", { name: "Ratios" })).toBeVisible();
    // net margin = 12,000,000 / 100,000,000 = 12.0%
    await expect(page.getByText("12.0%").first()).toBeVisible();
    expect(await page.locator("main").innerText()).not.toContain("NaN");

    // It survives a reload, and the cell is marked as the user's own.
    await page.goto(instrumentUrl);
    await expect(page.getByText("FY2024").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTitle(/Your figure/).first()).toBeVisible();
  } finally {
    if (created?.user) await admin.auth.admin.deleteUser(created.user.id);
  }
});
