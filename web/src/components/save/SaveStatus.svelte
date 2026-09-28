<script>
    let {
        state,
        processingLabel = "PROCESSING",
        processingProgress,
        fetchProgress,
        retrying = false,
        onRetry,
    } = $props();

    const hasProcessingProgress = $derived(processingProgress !== undefined);
    const hasFetchProgress = $derived(fetchProgress !== undefined);
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
                    {processingProgress}% · the burrow is working...
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
                    {fetchProgress}% · bringing it home from the chaos...
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
        <div class="eb-progress-track" role="progressbar" aria-label="Download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={processingProgress}>
            <span style:width={processingProgress + "%"}></span>
        </div>
    {:else if state === "think" && !hasProcessingProgress}
        <div class="eb-progress-track indeterminate" role="progressbar" aria-label="Waiting to process"></div>
    {:else if state === "check" && hasFetchProgress}
        <div class="eb-progress-track" role="progressbar" aria-label="Download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={fetchProgress}>
            <span style:width={fetchProgress + "%"}></span>
        </div>
    {:else if state === "check"}
        <div class="eb-progress-track indeterminate" role="progressbar" aria-label="Downloading"></div>
    {/if}
</div>
