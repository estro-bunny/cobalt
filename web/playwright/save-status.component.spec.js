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


async function mountProgressStory(page) {
    await page.goto(galleryUrl);
    await page.evaluate(() => window.mount({ story: "SaveStatus/Progress" }));
}

async function setProgress(page, nextMode, nextProgress) {
    await page.evaluate(
        ({ nextMode, nextProgress }) => window.setSaveStatusProgress({ nextMode, nextProgress }),
        { nextMode, nextProgress },
    );
}

async function expectProgress(page, progress, label) {
    await expect(page.getByText(new RegExp(`^${progress}% ·`))).toBeVisible();
    await expect(page.getByText(label, { exact: true })).toBeVisible();

    const bar = page.getByRole("progressbar");
    await expect(bar).toHaveAttribute("aria-valuenow", String(progress));

    const fill = bar.locator("span");
    await expect(fill).toHaveAttribute("style", new RegExp(`width:\\s*${progress}%`));
}

test("browser progress keeps DOWNLOADING label, bar width, and aria-valuenow synchronized from 0% to 100%", async ({ page }) => {
    await mountProgressStory(page);

    for (const progress of [0, 25, 50, 75, 100]) {
        await setProgress(page, "downloading", progress);
        await expectProgress(page, progress, "DOWNLOADING");
    }
});

test("browser progress keeps ENCODING label, bar width, and aria-valuenow synchronized from 0% to 100%", async ({ page }) => {
    await mountProgressStory(page);

    for (const progress of [0, 25, 50, 75, 100]) {
        await setProgress(page, "encoding", progress);
        await expectProgress(page, progress, "ENCODING");
    }
});

test("browser progress clamps DOWNLOADING values below 0% and above 100% consistently", async ({ page }) => {
    await mountProgressStory(page);

    for (const [input, expected] of [[-25, 0], [125, 100]]) {
        await setProgress(page, "downloading", input);
        await expectProgress(page, expected, "DOWNLOADING");
    }
});

test("browser progress clamps ENCODING values below 0% and above 100% consistently", async ({ page }) => {
    await mountProgressStory(page);

    for (const [input, expected] of [[-25, 0], [125, 100]]) {
        await setProgress(page, "encoding", input);
        await expectProgress(page, expected, "ENCODING");
    }
});
