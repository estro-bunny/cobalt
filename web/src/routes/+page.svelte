<script>
    import { t } from "$lib/i18n/translations";
    import { link, downloadButtonState } from "$lib/state/omnibox";
    import { queue } from "$lib/state/task-manager/queue";
    import { currentTasks } from "$lib/state/task-manager/current-tasks";
    import { getProgress } from "$lib/task-manager/queue";
    import { savingHandler } from "$lib/api/saving-handler";
    import { resolveProcessingLabel, resolveSaveState } from "$lib/save-state.js";

    import Omnibox from "$components/save/Omnibox.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import SupportedServices from "$components/save/SupportedServices.svelte";

    let retrying = $state(false);

    let activeQueueItem = $derived.by(() => {
        const matchingItems = Object.values($queue)
            .filter((item) => item.originalRequest?.url === $link);

        if (retrying || $downloadButtonState === "think" || $downloadButtonState === "check") {
            return matchingItems.find((item) => item.state === "waiting" || item.state === "running");
        }

        return matchingItems.find((item) => item.state === "error" || item.state === "done");
    });

    let queueProgress = $derived(
        activeQueueItem?.state === "running"
            ? Math.round(getProgress(activeQueueItem, $currentTasks) * 100)
            : activeQueueItem?.state === "done"
                ? 100
                : 0
    );

    let activeFetchTask = $derived.by(() => {
        if (activeQueueItem?.state !== "running") return undefined;

        return activeQueueItem.pipeline
            .filter((worker) => worker.worker === "fetch")
            .map((worker) => $currentTasks[worker.workerId])
            .find((task) => task?.type === "fetch");
    });

    let activeProcessingTask = $derived.by(() => {
        if (activeQueueItem?.state !== "running") return undefined;

        return activeQueueItem.pipeline
            .filter((worker) => worker.worker !== "fetch")
            .map((worker) => $currentTasks[worker.workerId])
            .find(Boolean);
    });

    let activeFetchProgress = $derived.by(() => {
        if (activeQueueItem?.state !== "running") return undefined;

        const fetchWorkers = activeQueueItem.pipeline.filter((worker) => worker.worker === "fetch");
        if (!fetchWorkers.length) return undefined;

        let total = 0;
        let reported = false;

        for (const worker of fetchWorkers) {
            if (activeQueueItem.pipelineResults[worker.workerId]) {
                total += 100;
                reported = true;
                continue;
            }

            const percentage = $currentTasks[worker.workerId]?.progress?.percentage;
            if (percentage !== undefined) {
                total += percentage;
                reported = true;
            }
        }

        return reported ? Math.round(total / fetchWorkers.length) : undefined;
    });

    let saveState = $derived(
        resolveSaveState({
            retrying,
            queueState: activeQueueItem?.state,
            activeFetch: Boolean(activeFetchTask),
            buttonState: $downloadButtonState,
        })
    );

    const retrySave = async () => {
        if (retrying || !$link) return;

        retrying = true;

        if (activeQueueItem?.state === "error" && activeQueueItem.originalRequest) {
            await savingHandler({
                request: activeQueueItem.originalRequest,
                oldTaskId: activeQueueItem.id,
            });
        } else {
            await savingHandler({ url: $link });
        }

        retrying = false;
    };
</script>

<svelte:head>
    <title>EstroBunny Cobalt ✦</title>
    <meta property="og:title" content="EstroBunny Cobalt ✦" />
</svelte:head>

<div id="cobalt-save-container" class="center-column-container estrobunny-home">
    <div class="eb-save-shell" aria-hidden="true">
        <span class="eb-grid-mark">✦</span>
        <span class="eb-grid-line"></span>
        <span class="eb-grid-label">SAVE LAB // 404</span>
    </div>

    <header class="eb-save-header">
        <div class="eb-brand-mark" aria-hidden="true">
            <span class="eb-bunny">✦</span>
        </div>

        <div class="eb-brand-copy">
            <div class="eb-eyebrow">ESTROBUNNY // SAVE LAB</div>
            <h1>Save something chaotic.</h1>
            <p>Paste a media URL and let the burrow handle the rest.</p>
        </div>

        <div class="eb-system-status">
            <span class="eb-status-dot"></span>
            <span>BURROW ONLINE</span>
        </div>
    </header>

    <section class="eb-save-panel" aria-label="Save media">
        <div class="eb-panel-topline">
            <span>MEDIA URL</span>
            <span class="eb-panel-code">INPUT_01</span>
        </div>

        <main
            id="cobalt-save"
            tabindex="-1"
            data-first-focus
        >
            <div class="eb-mascot-wrap">
                <Meowbalt emotion="smile" />
            </div>

            <Omnibox />

            <div class="eb-input-hint">
                <span class="eb-hint-dot">◆</span>
                <span>paste a supported media URL to begin</span>
            </div>
        </main>

        <div class="eb-save-status" class:processing={saveState === "think"} class:downloading={saveState === "check"} class:complete={saveState === "done"} class:error={saveState === "error"} aria-live="polite">
            {#if saveState === "think"}
                <span class="eb-status-icon">◆</span>
                <span class="eb-status-copy">
                    <strong>{resolveProcessingLabel(activeProcessingTask?.type)}</strong>
                    <small>{activeQueueItem?.state === "running" && queueProgress > 0 ? queueProgress + "% · the burrow is working..." : "the burrow is figuring it out..."}</small>
                </span>
            {:else if saveState === "check"}
                <span class="eb-status-icon">◉</span>
                <span class="eb-status-copy">
                    <strong>DOWNLOADING</strong>
                    <small>
                        {#if activeFetchProgress !== undefined}
                            {activeFetchProgress}% · bringing it home from the chaos...
                        {:else}
                            bringing it home from the chaos...
                        {/if}
                    </small>
                </span>
            {:else if saveState === "done"}
                <span class="eb-status-icon">✓</span>
                <span class="eb-status-copy"><strong>COMPLETE</strong><small>successfully burrowed</small></span>
            {:else if saveState === "error"}
                <span class="eb-status-icon">×</span>
                <span class="eb-status-copy"><strong>ERROR</strong><small>something exploded in the burrow · please try again</small></span>
                <button class="eb-retry-button" type="button" onclick={retrySave} disabled={retrying || !$link} aria-label="Retry save">
                    {retrying ? "RETRYING..." : "RETRY"}
                </button>
            {:else}
                <span class="eb-status-icon">●</span>
                <span class="eb-status-copy"><strong>READY</strong><small>waiting for something chaotic</small></span>
            {/if}

            {#if saveState === "think" && activeQueueItem?.state === "running"}
                <div class="eb-progress-track" role="progressbar" aria-label="Download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={queueProgress}>
                    <span style:width={queueProgress + "%"}></span>
                </div>
            {:else if saveState === "think" && activeQueueItem?.state === "waiting"}
                <div class="eb-progress-track indeterminate" role="progressbar" aria-label="Waiting to process"></div>
            {:else if saveState === "check" && activeFetchProgress !== undefined}
                <div class="eb-progress-track" role="progressbar" aria-label="Download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={activeFetchProgress}>
                    <span style:width={activeFetchProgress + "%"}></span>
                </div>
            {:else if saveState === "check"}
                <div class="eb-progress-track indeterminate" role="progressbar" aria-label="Downloading"></div>
            {/if}
        </div>    </section>

    <SupportedServices />

    <footer id="terms-note">
        <span>{$t("save.terms.note.agreement")}</span>
        <a href="/about/terms">{$t("save.terms.note.link")}</a>
        <span class="eb-footer-divider">·</span>
        <span class="eb-signature">still here🏳️‍⚧️</span>
    </footer>
</div>

<style>
    #cobalt-save-container {
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
        width: 100%;
        min-height: 100%;
        padding: clamp(20px, 4vh, 48px) clamp(12px, 4vw, 48px) 18px;
        background:
            radial-gradient(circle at 50% 35%, rgba(255, 60, 172, 0.08), transparent 34%),
            radial-gradient(circle at 78% 72%, rgba(92, 225, 255, 0.055), transparent 30%);
    }

    #cobalt-save-container::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.45;
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
        background-size: 28px 28px;
        mask-image: linear-gradient(to bottom, black, transparent 85%);
    }

    .eb-save-shell {
        position: absolute;
        top: 18px;
        right: 24px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--eb-dim);
        font-size: var(--eb-text-xs);
        letter-spacing: 0.12em;
        text-transform: uppercase;
        opacity: 0.7;
    }

    .eb-grid-mark {
        color: var(--eb-pink);
        text-shadow: var(--eb-glow);
    }

    .eb-grid-line {
        width: 32px;
        height: 1px;
        background: linear-gradient(90deg, var(--eb-pink), transparent);
    }

    .eb-save-header {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 14px;
        width: min(720px, 100%);
        margin: 0 auto 18px;
    }

    .eb-brand-mark {
        display: grid;
        place-items: center;
        width: 42px;
        height: 42px;
        border: 1px solid var(--eb-line);
        border-radius: var(--eb-radius-md);
        background: rgba(21, 16, 26, 0.72);
        box-shadow: var(--eb-glow);
    }

    .eb-bunny {
        color: var(--eb-pink);
        font-size: 20px;
        text-shadow: 0 0 16px rgba(255, 60, 172, 0.5);
    }

    .eb-brand-copy {
        min-width: 0;
    }

    .eb-eyebrow {
        margin-bottom: 4px;
        color: var(--eb-pink);
        font-size: var(--eb-text-xs);
        font-weight: 500;
        letter-spacing: 0.12em;
    }

    .eb-brand-copy h1 {
        margin: 0;
        color: var(--eb-white);
        font-size: var(--eb-text-2xl);
        font-weight: 500;
        letter-spacing: -0.02em;
    }

    .eb-brand-copy p {
        margin: 5px 0 0;
        color: var(--eb-muted);
        font-size: var(--eb-text-sm);
    }

    .eb-system-status {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 7px 10px;
        border: 1px solid rgba(102, 247, 176, 0.18);
        border-radius: var(--eb-radius-pill);
        color: var(--eb-success);
        background: rgba(102, 247, 176, 0.045);
        font-size: var(--eb-text-xs);
        letter-spacing: 0.08em;
        white-space: nowrap;
    }

    .eb-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--eb-success);
        box-shadow: 0 0 10px rgba(102, 247, 176, 0.55);
    }

    .eb-save-panel {
        position: relative;
        z-index: 1;
        width: min(720px, 100%);
        margin: 0 auto;
        box-sizing: border-box;
        padding: 20px;
        border: 1px solid var(--eb-line);
        border-radius: var(--eb-radius-lg);
        background: var(--eb-panel);
        box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.025) inset,
            0 20px 60px rgba(0, 0, 0, 0.38),
            0 0 36px rgba(255, 60, 172, 0.055);
        backdrop-filter: blur(14px);
    }

    .eb-panel-topline {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        color: var(--eb-muted);
        font-size: var(--eb-text-xs);
        font-weight: 500;
        letter-spacing: 0.12em;
    }

    .eb-panel-code {
        color: var(--eb-blue);
        opacity: 0.75;
    }

    #cobalt-save {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        gap: 10px;
    }

    .eb-mascot-wrap {
        height: 56px;
        margin-bottom: -2px;
        opacity: 0.82;
        overflow: hidden;
    }

    .eb-mascot-wrap :global(.meowbalt) {
        width: 92px;
        height: 92px;
        object-fit: contain;
        transform: translateY(-12px);
    }

    #cobalt-save :global(#omnibox) {
        max-width: none;
        width: 100%;
        gap: 8px;
    }

    #cobalt-save :global(#input-container) {
        --input-padding: 12px;
        min-height: 52px;
        box-sizing: border-box;
        border-radius: var(--eb-radius-md);
        background: rgba(9, 7, 13, 0.72);
        box-shadow: 0 0 0 1px rgba(255, 60, 172, 0.16) inset;
        outline: 1px solid rgba(255, 60, 172, 0.16);
        outline-offset: -1px;
        transition:
            box-shadow var(--eb-motion-normal) ease,
            outline-color var(--eb-motion-normal) ease,
            transform var(--eb-motion-fast) ease;
    }

    #cobalt-save :global(#input-container.focused) {
        box-shadow:
            0 0 0 2px rgba(92, 225, 255, 0.15),
            0 0 28px rgba(255, 60, 172, 0.16);
        outline: 1px solid var(--eb-blue);
        outline-offset: -1px;
    }

    #cobalt-save :global(#input-container.downloadable) {
        outline-color: rgba(255, 60, 172, 0.35);
    }

    #cobalt-save :global(#link-area) {
        color: var(--eb-white);
        font-size: var(--eb-text-md);
    }

    #cobalt-save :global(#link-area::placeholder) {
        color: var(--eb-dim);
    }

    #cobalt-save :global(#input-icons svg) {
        stroke: var(--eb-muted);
    }

    #cobalt-save :global(#action-container) {
        gap: 8px;
        width: 100%;
    }

    #cobalt-save :global(#action-container .button) {
        border-radius: var(--eb-radius-md);
    }

    #cobalt-save :global(#paste) {
        border-color: rgba(255, 60, 172, 0.18);
    }

    .eb-input-hint {
        display: flex;
        align-items: center;
        gap: 7px;
        width: 100%;
        color: var(--eb-dim);
        font-size: var(--eb-text-xs);
        letter-spacing: 0.03em;
    }

    .eb-hint-dot {
        color: var(--eb-blue);
        font-size: 8px;
    }

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

    #cobalt-save-container :global(#supported-services) {
        position: relative;
        z-index: 1;
        margin: 10px auto 0;
    }

    #cobalt-save-container :global(#services-button) {
        color: var(--eb-muted);
    }

    #cobalt-save-container :global(.expand-icon) {
        background: var(--eb-panel-2);
        border: 1px solid var(--eb-line);
    }

    #terms-note {
        position: relative;
        z-index: 1;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 6px;
        width: min(720px, 100%);
        margin: auto auto 0;
        padding-top: 16px;
        color: var(--eb-dim);
        font-size: var(--eb-text-xs);
        font-weight: 500;
        text-align: center;
    }

    #terms-note a {
        color: var(--eb-muted);
    }

    .eb-footer-divider {
        opacity: 0.45;
    }

    .eb-signature {
        color: var(--eb-pink-soft);
        text-shadow: 0 0 12px rgba(255, 60, 172, 0.22);
    }

    @media (hover: hover) {
        #cobalt-save :global(#input-container):hover {
            transform: translateY(-1px);
            outline-color: rgba(255, 60, 172, 0.3);
        }
    }

    @media screen and (max-width: 700px) {
        .eb-system-status {
            display: none;
        }

        .eb-save-header {
            grid-template-columns: auto minmax(0, 1fr);
        }

        .eb-brand-copy h1 {
            font-size: var(--eb-text-xl);
        }

        .eb-save-panel {
            padding: 16px;
        }
    }

    @media screen and (max-width: 535px) {
        #cobalt-save-container {
            min-height: 100%;
            padding: 18px 10px 8px;
        }

        #cobalt-save-container::before {
            opacity: 0.25;
        }

        .eb-save-shell {
            display: none;
        }

        .eb-save-header {
            width: 100%;
            margin-bottom: 12px;
            gap: 10px;
        }

        .eb-brand-mark {
            width: 36px;
            height: 36px;
        }

        .eb-bunny {
            font-size: 17px;
        }

        .eb-eyebrow {
            font-size: 9px;
        }

        .eb-brand-copy h1 {
            font-size: 19px;
        }

        .eb-brand-copy p {
            margin-top: 3px;
            font-size: 11px;
        }

        .eb-save-panel {
            width: 100%;
            padding: 14px;
            border-radius: var(--eb-radius-md);
        }

        .eb-mascot-wrap {
            height: 44px;
        }

        .eb-mascot-wrap :global(.meowbalt) {
            width: 76px;
            height: 76px;
            transform: translateY(-14px);
        }

        #cobalt-save :global(#input-container) {
            min-height: 48px;
        }

        #cobalt-save :global(#action-container) {
            gap: 6px;
        }

        .eb-input-hint {
            font-size: 9px;
        }

        .eb-save-status {
            margin-top: 12px;
            padding: 9px 8px;
            flex-wrap: wrap;
        }

        .eb-progress-track {
            flex-basis: 100%;
        }

        #cobalt-save-container :global(#supported-services) {
            margin-top: 6px;
        }

        #terms-note {
            padding-top: 10px;
            font-size: 9px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        #cobalt-save-container *,
        #cobalt-save-container *::before,
        #cobalt-save-container *::after {
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
        }

        #cobalt-save :global(#input-container):hover {
            transform: none;
        }

        .eb-progress-track span {
            transition: none;
        }

        .eb-progress-track.indeterminate::before {
            animation: none;
            width: 100%;
            background: var(--eb-blue);
        }
    }</style>
