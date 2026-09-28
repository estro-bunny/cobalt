<script>
    let {
        state,
        processingLabel = "PROCESSING",
        processingProgress,
        fetchProgress,
        retrying = false,
        onRetry,
    } = $props();

    const clampProgress = (value) => Math.min(100, Math.max(0, value));
    const resolvedProcessingProgress = $derived(processingProgress === undefined ? undefined : clampProgress(processingProgress));
    const resolvedFetchProgress = $derived(fetchProgress === undefined ? undefined : clampProgress(fetchProgress));
    const hasProcessingProgress = $derived(resolvedProcessingProgress !== undefined);
    const hasFetchProgress = $derived(resolvedFetchProgress !== undefined);
</script>

<div
    class="eb-save-status"
    class:processing={state === "think"}
    class:downloading={state === "check"}
    class:complete={state === "done"}
    class:error={state === "error"}
    aria-live="polite"
>
    {#if state === "think"}
        <span class="eb-status-icon">◆</span>
        <span class="eb-status-copy">
            <strong>{processingLabel}</strong>
            <small>
                {#if hasProcessingProgress}
                    {resolvedProcessingProgress}% · the burrow is working...
                {:else}
                    the burrow is figuring it out...
                {/if}
            </small>
        </span>
    {:else if state === "check"}
        <span class="eb-status-icon">◉</span>
        <span class="eb-status-copy">
            <strong>DOWNLOADING</strong>
            <small>
                {#if hasFetchProgress}
                    {resolvedFetchProgress}% · bringing it home from the chaos...
                {:else}
                    bringing it home from the chaos...
                {/if}
            </small>
        </span>
    {:else if state === "done"}
        <span class="eb-status-icon">✓</span>
        <span class="eb-status-copy"><strong>COMPLETE</strong><small>successfully burrowed</small></span>
    {:else if state === "error"}
        <span class="eb-status-icon">×</span>
        <span class="eb-status-copy"><strong>ERROR</strong><small>something exploded in the burrow · please try again</small></span>
        <button class="eb-retry-button" type="button" onclick={onRetry} disabled={retrying} aria-label="Retry save">
            {retrying ? "RETRYING..." : "RETRY"}
        </button>
    {:else}
        <span class="eb-status-icon">●</span>
        <span class="eb-status-copy"><strong>READY</strong><small>waiting for something chaotic</small></span>
    {/if}

    {#if state === "think" && hasProcessingProgress}
        <div class="eb-progress-track" role="progressbar" aria-label="Download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={resolvedProcessingProgress}>
            <span style:width={resolvedProcessingProgress + "%"}></span>
        </div>
    {:else if state === "think" && !hasProcessingProgress}
        <div class="eb-progress-track indeterminate" role="progressbar" aria-label="Waiting to process"></div>
    {:else if state === "check" && hasFetchProgress}
        <div class="eb-progress-track" role="progressbar" aria-label="Download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={resolvedFetchProgress}>
            <span style:width={resolvedFetchProgress + "%"}></span>
        </div>
    {:else if state === "check"}
        <div class="eb-progress-track indeterminate" role="progressbar" aria-label="Downloading"></div>
    {/if}
</div>


<style>
.eb-save-status {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 16px;
        padding: 11px 12px;
        border-top: 1px solid rgba(255, 60, 172, 0.1);
        color: var(--eb-muted);
    }

    .eb-status-icon {
        color: var(--eb-success);
        font-size: 12px;
    }

    .eb-status-copy {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .eb-save-status.processing .eb-status-icon { color: var(--eb-blue); }
    .eb-save-status.downloading .eb-status-icon { color: var(--eb-pink); }
    .eb-save-status.complete .eb-status-icon { color: var(--eb-success); }
    .eb-save-status.error .eb-status-icon { color: var(--eb-danger); }

    .eb-status-copy strong {
        color: var(--eb-white);
        font-size: var(--eb-text-xs);
        font-weight: 500;
        letter-spacing: 0.12em;
    }

    .eb-status-copy small {
        color: var(--eb-dim);
        font-size: var(--eb-text-xs);
    }

    .eb-retry-button {
        margin-left: auto;
        padding: 6px 9px;
        border: 1px solid rgba(255, 77, 109, 0.3);
        border-radius: var(--eb-radius-sm);
        color: var(--eb-danger);
        background: rgba(255, 77, 109, 0.06);
        font: inherit;
        font-size: var(--eb-text-xs);
        letter-spacing: 0.08em;
        cursor: pointer;
    }

    .eb-retry-button:hover:not(:disabled) {
        border-color: var(--eb-danger);
        background: rgba(255, 77, 109, 0.12);
    }

    .eb-retry-button:focus-visible {
        outline: 2px solid var(--eb-blue);
        outline-offset: 3px;
    }

    .eb-retry-button:disabled {
        cursor: progress;
        opacity: 0.6;
    }

    .eb-progress-track {
        flex: 1 1 100%;
        min-width: 120px;
        height: 4px;
        overflow: hidden;
        border-radius: var(--eb-radius-pill);
        background: rgba(255, 255, 255, 0.08);
    }

    .eb-progress-track span {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, var(--eb-pink), var(--eb-blue));
        transition: width var(--eb-motion-normal) ease;
    }

    .eb-progress-track.indeterminate::before {
        content: "";
        display: block;
        width: 38%;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, transparent, var(--eb-blue), transparent);
        animation: eb-progress-sweep 1.2s ease-in-out infinite;
    }

    @keyframes eb-progress-sweep {
        from { transform: translateX(-130%); }
        to { transform: translateX(330%); }
    }
</style>
