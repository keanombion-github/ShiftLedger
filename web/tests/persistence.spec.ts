import { test, expect } from "@playwright/test";

test("correction and its reason survive refresh", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Approvals", exact: true }).click();
  await page.getByLabel("Review reason").fill("Confirmed sample end time.");
  await page.reload();
  await page.getByRole("button", { name: "Approvals", exact: true }).click();
  await expect(page.getByLabel("Review reason")).toHaveValue("Confirmed sample end time.");
  await page.getByRole("button", { name: "Approve correction" }).click();
  await page.reload();
  await expect(page.locator(".hero-number")).toHaveText("56h 48m");
  await page.getByRole("button", { name: "Approvals", exact: true }).click();
  await expect(page.locator(".decision-record")).toContainText("Confirmed sample end time.");
  await expect(page.getByRole("button", { name: "Approve correction" })).toHaveCount(0);
});

test("open break survives refresh, reset clears all progress and keeps theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByLabel("Demo role").selectOption("Staff");
  await page.getByRole("button", { name: "Clock in", exact: true }).click();
  await page.getByRole("button", { name: "Start break", exact: true }).click();
  await page.reload();
  await page.getByLabel("Demo role").selectOption("Staff");
  await expect(page.locator(".timeline li")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Clock out", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "End break", exact: true }).click();
  await page.getByRole("button", { name: "Clock out", exact: true }).click();
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  await page.getByRole("button", { name: "Open settings" }).click();
  await page.locator(".reset-settings").getByRole("button", { name: "Reset demo" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".hero-number")).toHaveText("48h 48m");
  await page.getByLabel("Demo role").selectOption("Staff");
  await expect(page.locator(".timeline li")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Clock in", exact: true })).toBeEnabled();
});

test("malformed saved data recovers and can be reset", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("shiftledger-demo-v1", '{"version":1,"events":"bad"}'));
  await page.goto("/");
  await expect(page.locator('.notice[role="alert"]')).toContainText("could not be read");
  await expect(page.locator(".hero-number")).toHaveText("48h 48m");
  await page.getByRole("button", { name: "Open settings" }).click();
  await page.locator(".reset-settings").getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator('.notice[role="alert"]')).toHaveCount(0);
});

test("storage write failures keep the sandbox usable and disclose unsaved changes", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); }; });
  await page.goto("/");
  await page.getByLabel("Demo role").selectOption("Staff");
  await page.getByRole("button", { name: "Clock in", exact: true }).click();
  await expect(page.locator('.notice[role="alert"]')).toContainText("could not be saved");
  await expect(page.getByRole("button", { name: "Start break", exact: true })).toBeEnabled();
});

test("clock history is capped at 200 actions", async ({ page }) => {
  await page.addInitScript(() => {
    const events = Array.from({ length: 200 }, (_, index) => ({ action: index % 2 === 0 ? "Clock in" : "Clock out", timestamp: "2026-10-06T12:00:00.000Z" }));
    localStorage.setItem("shiftledger-demo-v1", JSON.stringify({ version: 1, decision: "Pending", reason: "", clock: "Out", events }));
  });
  await page.goto("/"); await page.getByLabel("Demo role").selectOption("Staff");
  await expect(page.getByRole("button", { name: "Clock in", exact: true })).toBeDisabled();
  await expect(page.locator(".timeline li")).toHaveCount(200);
  await expect(page.getByRole("status")).toContainText("up to 200");
});

