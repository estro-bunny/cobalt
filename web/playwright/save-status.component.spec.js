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

test("browser progress updates DOWNLOADING and ENCODING on every live change", async ({ page }) => {
    await mountProgressStory(page);

    for (const progress of [3, 18, 47, 62, 91]) {
        await setProgress(page, "downloading", progress);
        await expectProgress(page, progress, "DOWNLOADING");
    }

    for (const progress of [7, 29, 53, 78, 96]) {
        await setProgress(page, "encoding", progress);
        await expectProgress(page, progress, "ENCODING");
    }
});

test("browser progress stays synchronized when transitioning from DOWNLOADING to ENCODING", async ({ page }) => {
    await mountProgressStory(page);

    await setProgress(page, "downloading", 64);
    await expectProgress(page, 64, "DOWNLOADING");

    await setProgress(page, "encoding", 37);
    await expectProgress(page, 37, "ENCODING");
    await expect(page.getByText("DOWNLOADING", { exact: true })).not.toBeVisible();

    await setProgress(page, "encoding", 83);
    await expectProgress(page, 83, "ENCODING");
});

test("browser DOWNLOADING without progress renders an indeterminate bar without percentage or aria-valuenow", async ({ page }) => {
    await mountProgressStory(page);

    await page.evaluate(() => window.setSaveStatusProgress({ nextMode: "downloading", nextProgress: undefined }));

    await expect(page.getByText("DOWNLOADING", { exact: true })).toBeVisible();
    await expect(page.getByText(/% ·/)).not.toBeVisible();

    const bar = page.getByRole("progressbar");
    await expect(bar).toHaveClass(/indeterminate/);
    await expect(bar).not.toHaveAttribute("aria-valuenow");
    await expect(bar.locator("span")).toHaveCount(0);
});

test("browser ENCODING without progress renders an indeterminate bar without percentage or aria-valuenow", async ({ page }) => {
    await mountProgressStory(page);

    await page.evaluate(() => window.setSaveStatusProgress({ nextMode: "encoding", nextProgress: undefined }));

    await expect(page.getByText("ENCODING", { exact: true })).toBeVisible();
    await expect(page.getByText(/% ·/)).not.toBeVisible();

    const bar = page.getByRole("progressbar");
    await expect(bar).toHaveClass(/indeterminate/);
    await expect(bar).not.toHaveAttribute("aria-valuenow");
    await expect(bar.locator("span")).toHaveCount(0);
    await expect(bar.locator("::before")).toHaveCount(0);
});
