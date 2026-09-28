/**
 * Resolve the save UI state from the authoritative queue/task signals.
 *
 * @param {{
 *   retrying?: boolean,
 *   queueState?: "waiting" | "running" | "done" | "error",
 *   activeFetch?: boolean,
 *   buttonState?: string
 * }} input
 * @returns {"think" | "check" | "done" | "error" | string}
 */
export const resolveSaveState = ({
    retrying = false,
    queueState,
    activeFetch = false,
    buttonState,
}) => {
    // A retry is never allowed to expose the previous terminal state.
    if (retrying) {
        return activeFetch
            ? "check"
            : queueState === "running" || queueState === "waiting"
                ? "think"
                : "think";
    }

    if (queueState === "error") return "error";
    if (queueState === "done") return "done";
    if (activeFetch) return "check";
    if (queueState === "running" || queueState === "waiting") return "think";

    return buttonState ?? "think";
};
