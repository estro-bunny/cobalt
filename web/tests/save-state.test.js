import test from "node:test";
import assert from "node:assert/strict";

import {
    resolveProcessingLabel,
    resolveSaveState,
} from "../src/lib/save-state.js";

test("ERROR -> RETRY -> PROCESSING -> DOWNLOADING -> ENCODING -> COMPLETE", () => {
    assert.equal(
        resolveSaveState({ queueState: "error" }),
        "error",
    );

    assert.equal(
        resolveSaveState({
            retrying: true,
            queueState: "waiting",
            buttonState: "error",
        }),
        "think",
    );

    assert.equal(
        resolveSaveState({
            retrying: false,
            queueState: "running",
            activeFetch: false,
        }),
        "think",
    );

    assert.equal(
        resolveSaveState({
            retrying: false,
            queueState: "running",
            activeFetch: true,
        }),
        "check",
    );

    assert.equal(resolveProcessingLabel("encode"), "ENCODING");
    assert.equal(resolveSaveState({
        queueState: "running",
        activeFetch: false,
    }), "think");

    assert.equal(
        resolveSaveState({ queueState: "done" }),
        "done",
    );
});

test("retry suppresses stale ERROR state", () => {
    assert.equal(
        resolveSaveState({
            retrying: true,
            queueState: "error",
            buttonState: "error",
        }),
        "think",
    );
});

test("retry suppresses stale COMPLETE state", () => {
    assert.equal(
        resolveSaveState({
            retrying: true,
            queueState: "done",
            buttonState: "done",
        }),
        "think",
    );
});

test("retry exposes DOWNLOADING only when a fetch task is active", () => {
    assert.equal(
        resolveSaveState({
            retrying: true,
            queueState: "running",
            activeFetch: false,
        }),
        "think",
    );

    assert.equal(
        resolveSaveState({
            retrying: true,
            queueState: "running",
            activeFetch: true,
        }),
        "check",
    );
});

test("terminal states remain authoritative outside retry", () => {
    assert.equal(
        resolveSaveState({ queueState: "error", buttonState: "think" }),
        "error",
    );

    assert.equal(
        resolveSaveState({ queueState: "done", buttonState: "error" }),
        "done",
    );
});

test("processing label distinguishes encoding from other processing", () => {
    assert.equal(resolveProcessingLabel("encode"), "ENCODING");
    assert.equal(resolveProcessingLabel("remux"), "PROCESSING");
    assert.equal(resolveProcessingLabel(undefined), "PROCESSING");
});
