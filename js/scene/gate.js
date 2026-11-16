import { wait } from '../config.js';

const FADE_MS = 220;
const gate = () => document.getElementById('stageGate');

export function showGate() {
    const el = gate();
    if (!el) return;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add('on'));
}

export function hideGate() {
    const el = gate();
    if (!el) return;
    el.classList.remove('on');
    setTimeout(() => { el.hidden = true; }, FADE_MS);
}

/**
 * Resolves when `readyRatio` of the images have settled (loaded or failed),
 * but never sooner than `minShow` and never later than `maxWait`.
 */
export function waitForImages(images, { minShow = 220, maxWait = 5000, readyRatio = 0.5 } = {}) {
    const settled = new Promise((resolve) => {
        if (!images.length) return resolve();
        let done = 0;
        const mark = () => { if (++done / images.length >= readyRatio) resolve(); };
        images.forEach((img) => {
            if (img.complete) return mark();
            img.addEventListener('load', mark, { once: true });
            img.addEventListener('error', mark, { once: true });
        });
    });
    return Promise.race([Promise.all([settled, wait(minShow)]), wait(maxWait)]);
}
