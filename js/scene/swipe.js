import { isSceneMobile } from '../config.js';

const MIN_SWIPE_PX = 40;
const EDGE_EPS = 2;

/**
 * Phones: the street moves sideways, so people naturally try to swipe sideways.
 * Translate a horizontal swipe over the stage into a vertical scroll step.
 */
export function initStageSwipe(stageTrigger) {
    const stage = document.getElementById('stage');
    if (!stage || !stageTrigger) return;

    let start = null;

    stage.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        start = t ? { x: t.clientX, y: t.clientY } : null;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
        const t = e.changedTouches[0];
        const from = start;
        start = null;
        if (!from || !t || !isSceneMobile()) return;

        const dx = t.clientX - from.x;
        const dy = Math.abs(t.clientY - from.y);
        if (Math.abs(dx) < MIN_SWIPE_PX || Math.abs(dx) < dy * 1.2) return;

        const step = Math.max(innerHeight * 0.45, Math.min(innerHeight * 0.9, Math.abs(dx) * 8));
        const forward = dx < 0;
        let target = scrollY + (forward ? step : -step);

        // Stay inside the pinned range, unless we're already at its edge and swiping outwards.
        const { start: top, end: bottom } = stageTrigger;
        const leaving = (forward && scrollY >= bottom - EDGE_EPS) || (!forward && scrollY <= top + EDGE_EPS);
        if (!leaving) target = Math.max(top, Math.min(bottom, target));

        window.scrollTo({ top: target, behavior: 'smooth' });
    }, { passive: true });
}
