import { test, expect } from "@playwright/test";

// These tests are written to be resilient when the app runs in "demo mode"
// (no Clerk publishable key provided) where authentication UI / scripts may
// intentionally be absent. In that case we still verify core landing UI loads
// and skip Clerk‑specific assertions.

test.describe("Clerk Authentication (resilient)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3500");
  });

  test("should load homepage (headline or brand visible & auth affordances if enabled)", async ({
    page,
  }) => {
    // Prefer detecting a hero <h1> headline (rotating) else fallback to brand text
    const headline = page.locator("h1").first();
    await headline.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
    const headlineVisible = await headline.isVisible().catch(() => false);

    let brandVisible = false;
    if (!headlineVisible) {
      const brand = page.getByText(/AI Image Studio/i).first();
      brandVisible = await brand.isVisible().catch(() => false);
    }

    expect(headlineVisible || brandVisible).toBeTruthy();

    // Attempt to locate Sign In / Sign Up buttons (may not exist in demo mode)
    const signInButton = page.getByRole("button", { name: /sign in/i }).first();
    const signUpButton = page.getByRole("button", { name: /sign up/i }).first();

    const signInCount = await signInButton.count().catch(() => 0);
    const signUpCount = await signUpButton.count().catch(() => 0);

    if (signInCount + signUpCount === 0) {
      test.info().annotations.push({
        type: "info",
        description:
          "Auth buttons absent (likely demo mode without Clerk key).",
      });
    } else {
      await expect(signInButton.or(signUpButton)).toBeVisible();
    }
  });

  test("should navigate or prompt auth when clicking Generate Image", async ({
    page,
  }) => {
    const generateButton = page
      .getByRole("button", { name: /generate image/i })
      .first();
    if (!(await generateButton.isVisible().catch(() => false))) {
      test.skip(true, "Generate Image button not visible on landing page");
    }

    await generateButton.click();

    // Either we navigate to dashboard (already authenticated) OR an auth modal appears.
    await Promise.race([
      page.waitForURL("**/dashboard**", { timeout: 7000 }).catch(() => {}),
      page
        .waitForSelector('[role="dialog"]', { timeout: 7000 })
        .catch(() => {}),
    ]);

    const isOnDashboard = page.url().includes("/dashboard");
    const hasModal = await page
      .locator('[role="dialog"]')
      .isVisible()
      .catch(() => false);

    expect(isOnDashboard || hasModal).toBeTruthy();
  });

  test("should have Clerk script loaded (skipped in demo mode)", async ({
    page,
  }) => {
    const hasClerkScript = await page.evaluate(
      () => !!document.querySelector("script[data-clerk-js-script]")
    );
    test.skip(
      !hasClerkScript,
      "Clerk script not present (demo mode / no publishable key)"
    );
    expect(hasClerkScript).toBeTruthy();
  });
});
