import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./playwright",
    testMatch: "**/*.component.spec.js",
    use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:5173",
        serviceWorkers: "block",
    },
    webServer: {
        command: "pnpm dev --host 127.0.0.1",
        url: "http://127.0.0.1:5173/playwright/gallery/index.html",
        reuseExistingServer: !process.env.CI,
    },
});
