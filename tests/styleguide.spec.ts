import { expect, test } from "@playwright/test";

// Phase 0 smoke: the styleguide (the UI contract) renders in dark by default,
// light via the toggle, and the signature RangeBand is present.
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

  // Light mode via the toggle.
  await page.getByRole("button", { name: /toggle color theme/i }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("home page renders and links to the styleguide", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sarmaya" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /design system styleguide/i }),
  ).toBeVisible();
});
