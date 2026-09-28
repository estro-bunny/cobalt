import { test, expect } from "@playwright/test";

const galleryUrl = "/playwright/gallery/index.html";

test("clicking RETRY invokes the callback and transitions ERROR to PROCESSING", async ({ page }) => {
    await page.goto(galleryUrl);
    await page.evaluate(() => window.mount({ story: "SaveStatus/Retry" }));

    await expect(page.getByRole("button", { name: "Retry save" })).toBeVisible();
    await expect(page.getByText("ERROR", { exact: true })).toBeVisible();
    await expect(page.getByTestId("retry-count")).toHaveValue("0");

    await page.getByRole("button", { name: "Retry save" }).click();

    await expect(page.getByTestId("retry-count")).toHaveValue("1");
    await expect(page.getByText("PROCESSING", { exact: true })).toBeVisible();
    await expect(page.getByText("ERROR", { exact: true })).not.toBeVisible();
});
