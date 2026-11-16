// Shared constants and environment checks.

/** Media queries – keep in sync with the breakpoints used in /css. */
export const MQ = {
    sceneMobile: '(max-width: 780px)',
    deckDesktop: '(min-width: 901px)',
    reducedMotion: '(prefers-reduced-motion: reduce)',
};

export const isSceneMobile = () => matchMedia(MQ.sceneMobile).matches;
export const prefersReducedMotion = () => matchMedia(MQ.reducedMotion).matches;

/**
 * Rough "slow connection" check used to decide whether the stage shows a loading gate.
 * `?gate=1` / `?gate=0` force it on/off for testing.
 */
export function isPoorNet() {
    const forced = new URLSearchParams(location.search).get('gate');
    if (forced === '1') return true;
    if (forced === '0') return false;

    const c = navigator.connection;
    if (!c) return false;
    if (c.saveData === true) return true;
    if (['slow-2g', '2g', '3g'].includes(c.effectiveType)) return true;
    return (typeof c.downlink === 'number' && c.downlink < 1.2)
        || (typeof c.rtt === 'number' && c.rtt > 300);
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
