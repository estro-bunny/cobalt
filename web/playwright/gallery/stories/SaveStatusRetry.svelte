<script>
    import SaveStatus from "../../../src/components/save/SaveStatus.svelte";

    let state = $state("error");
    let retryCount = $state(0);
    let retrying = $state(false);

    const retry = () => {
        retryCount += 1;
        retrying = true;
        state = "think";

        requestAnimationFrame(() => {
            retrying = false;
        });
    };
</script>

<SaveStatus
    state={state}
    processingLabel="PROCESSING"
    retrying={retrying}
    onRetry={retry}
/>

<input data-testid="retry-count" value={retryCount} readonly aria-label="Retry count" />
