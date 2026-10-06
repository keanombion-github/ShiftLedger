import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("review correction then export; staff sees only their prepared record", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("heading", { name: "Good morning, Kean" })).toBeVisible();
  await page.screenshot({ path: "test-results/overview-redesign.png", fullPage: true });
  await page.getByRole("button", { name: "Attendance", exact: true }).click();
  await page.getByRole("textbox", { name: "Search employees" }).fill("Morgan");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Missing punch");
  await page.getByRole("button", { name: "Approvals", exact: true }).click();
  await page.getByRole("button", { name: "Approve correction" }).click();
  await expect(page.getByRole("status")).toContainText("Add a review reason");
  await page.getByLabel("Review reason").fill("Confirmed with sample closing schedule.");
  await page.getByRole("button", { name: "Approve correction" }).click();
  await expect(page.getByRole("status")).toContainText("eligible for export");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page.locator(".hero-number")).toHaveText("56h 48m");
  await expect(page.locator(".review-ring strong")).toHaveText("88%");
  await page.getByRole("button", { name: "Reports", exact: true }).click();
  const download = page.waitForEvent("download"); await page.getByRole("button", { name: "Download CSV" }).click();
  const file = await (await download).path(); const csv = await readFile(file!, "utf8");
  expect(csv).toContain("Morgan Lee"); expect(csv).not.toContain("Riley Santos"); expect(csv.split("\r\n")).toHaveLength(8);
  await page.getByLabel("Demo role").selectOption("Staff");
  await page.getByRole("button", { name: "My attendance", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1); await expect(page.locator("tbody")).toContainText("Morgan Lee");
  await expect(page.getByRole("button", { name: "Approvals", exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("staff clock lifecycle and persistent theme on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: "test-results/overview-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByLabel("Demo role").selectOption("Staff");
  await page.getByRole("button", { name: "Clock in", exact: true }).dblclick();
  await expect(page.locator(".timeline li")).toHaveCount(1);
  await page.getByRole("button", { name: "Start break" }).click();
  await expect(page.getByRole("button", { name: "Clock out", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "End break" }).click();
  await page.getByRole("button", { name: "Clock out", exact: true }).click();
  await expect(page.locator(".timeline li")).toHaveCount(4);
  await page.getByRole("button", { name: "Toggle color theme" }).click();
  expect(await page.locator("body").evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(236, 238, 242)");
  await page.screenshot({ path: "test-results/staff-light-mobile.png", fullPage: true });
  await page.reload(); await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/overview-light.png", fullPage: true });
});

test("rejection retains the exception, filters have an empty state, and navigation works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Approvals", exact: true }).click();
  await page.getByLabel("Review reason").fill("Sample shift end could not be confirmed.");
  await page.getByRole("button", { name: "Reject request" }).click();
  await expect(page.getByRole("status")).toContainText("remains unresolved");
  await page.getByRole("button", { name: "Attendance", exact: true }).click();
  await page.getByRole("textbox", { name: "Search employees" }).fill("Morgan");
  await expect(page.locator("tbody")).toContainText("Needs review");
  await page.getByRole("textbox", { name: "Search employees" }).fill("Nobody");
  await expect(page.getByText("No records match these filters.", { exact: false })).toBeVisible();
  for (const view of ["Employees", "Schedules", "Payroll", "Settings"]) {
    await page.getByRole("button", { name: view, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(view);
  }
  await page.getByLabel("Demo role").selectOption("Staff");
  await page.getByRole("button", { name: "Corrections", exact: true }).click();
  await expect(page.getByRole("button", { name: "Approve correction" })).toHaveCount(0);
  await page.getByRole("button", { name: "My payslips", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No published payslips yet." })).toBeVisible();
});

