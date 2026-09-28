<script>
    import { t } from "$lib/i18n/translations";

    import Omnibox from "$components/save/Omnibox.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import SupportedServices from "$components/save/SupportedServices.svelte";
</script>

<svelte:head>
    <title>EstroBunny Cobalt ✦</title>
    <meta property="og:title" content="EstroBunny Cobalt ✦" />
</svelte:head>

<div id="cobalt-save-container" class="center-column-container estrobunny-home">\n    <div class="eb-brand" aria-hidden="true"><span class="eb-bunny">✦</span><span>ESTROBUNNY</span><small>COBALT // SAVE LAB</small></div>
    <SupportedServices />
    <main
        id="cobalt-save"
        tabindex="-1"
        data-first-focus
    >
        <Meowbalt emotion="smile" />
        <Omnibox />
    </main>
    <div id="terms-note">
        {$t("save.terms.note.agreement")}
        <a href="/about/terms">{$t("save.terms.note.link")}</a>
    </div>
</div>

<style>
    #cobalt-save-container {
        padding: calc(var(--padding) * 2);\n        position: relative;
        overflow: hidden;
    }

    .eb-brand {\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        margin-bottom: -2px;\n        color: var(--eb-pink);\n        font-size: 12px;\n        font-weight: 500;\n        letter-spacing: 2px;\n        text-shadow: 0 0 16px rgba(255, 60, 172, 0.45);\n    }\n\n    .eb-brand small {\n        color: var(--eb-blue);\n        font-size: 8px;\n        letter-spacing: 1px;\n        opacity: 0.75;\n    }\n\n    .eb-bunny {\n        font-size: 16px;\n    }\n\n    #cobalt-save {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 16px;
    }

    #terms-note {
        bottom: 0;
        color: var(--gray);
        font-size: 12px;
        text-align: center;
        padding-bottom: 6px;
        font-weight: 500;
    }

    @media screen and (max-width: 535px) {\n        .eb-brand { font-size: 10px; letter-spacing: 1.5px; }\n        .eb-brand small { display: none; }
        #cobalt-save-container {
            padding-top: calc(var(--padding) / 2);
        }

        #terms-note {
            font-size: 11px;
            padding-bottom: 0;
        }
    }
</style>
