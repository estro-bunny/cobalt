import { mount, unmount } from "svelte";
import SaveStatusRetry from "./stories/SaveStatusRetry.svelte";
import SaveStatusProgress from "./stories/SaveStatusProgress.svelte";

const stories = {
    "SaveStatus/Retry": SaveStatusRetry,
    "SaveStatus/Progress": SaveStatusProgress,
};

let current;

window.mount = async ({ story }) => {
    const Component = stories[story];

    if (!Component) {
        throw new Error(`Unknown component story: ${story}`);
    }

    if (current) {
        unmount(current);
    }

    current = mount(Component, {
        target: document.querySelector("#root"),
    });
};

window.unmount = () => {
    if (current) {
        unmount(current);
        current = undefined;
    }
};
