import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

import { compile } from "svelte/compiler";
import { render } from "svelte/server";

const componentPath = resolve(
    dirname(new URL(import.meta.url).pathname),
    "../src/components/save/SaveStatus.svelte",
);

const source = await readFile(componentPath, "utf8");
const compiled = compile(source, {
    filename: "SaveStatus.svelte",
    generate: "server",
});

const moduleUrl = "data:text/javascript;base64," + Buffer.from(compiled.js.code).toString("base64");
const { default: SaveStatus } = await import(moduleUrl);

const renderStatus = (props) => render(SaveStatus, { props }).body;

const text = (html) => html.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

test("ERROR shows ERROR and a retry action without a progress bar", () => {
    const html = renderStatus({ state: "error", retrying: false });

    assert.match(text(html), /ERROR/);
    assert.match(text(html), /RETRY/);
    assert.doesNotMatch(html, /role="progressbar"/);
});

test("RETRY shows retrying UI and cannot leak ERROR or COMPLETE", () => {
    const html = renderStatus({
        state: "think",
        processingLabel: "PROCESSING",
        retrying: true,
    });

    assert.match(text(html), /PROCESSING/);
    assert.doesNotMatch(text(html), /ERROR/);
    assert.doesNotMatch(text(html), /COMPLETE/);
    assert.doesNotMatch(text(html), /RETRYING/);
});

test("PROCESSING shows a determinate progress bar when progress is available", () => {
    const html = renderStatus({
        state: "think",
        processingLabel: "PROCESSING",
        processingProgress: 42,
    });

    assert.match(text(html), /PROCESSING/);
    assert.match(text(html), /42%/);
    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-valuenow="42"/);
});

test("DOWNLOADING shows its label and fetch progress", () => {
    const html = renderStatus({
        state: "check",
        fetchProgress: 67,
    });

    assert.match(text(html), /DOWNLOADING/);
    assert.match(text(html), /67%/);
    assert.match(html, /aria-valuenow="67"/);
});

test("ENCODING shows the encoding label and processing progress", () => {
    const html = renderStatus({
        state: "think",
        processingLabel: "ENCODING",
        processingProgress: 81,
    });

    assert.match(text(html), /ENCODING/);
    assert.match(text(html), /81%/);
    assert.match(html, /aria-valuenow="81"/);
});

test("COMPLETE shows COMPLETE and no stale progress bar", () => {
    const html = renderStatus({ state: "done" });

    assert.match(text(html), /COMPLETE/);
    assert.doesNotMatch(text(html), /ERROR/);
    assert.doesNotMatch(html, /role="progressbar"/);
});
