<script>
    import SaveStatus from "../../../src/components/save/SaveStatus.svelte";

    let mode = $state("downloading");
    let progress = $state(0);

    window.setSaveStatusProgress = ({ nextMode, nextProgress }) => {
        mode = nextMode;
        progress = nextProgress;
    };
</script>

<SaveStatus
    state={mode === "downloading" ? "check" : "think"}
    processingLabel="ENCODING"
    fetchProgress={mode === "downloading" ? progress : undefined}
    processingProgress={mode === "encoding" ? progress : undefined}
/>
