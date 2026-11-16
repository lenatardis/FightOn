import { gsap, ScrollTrigger } from '../lib/gsap.js';
import { syncFirstHeroGap } from './heroes.js';

export const STAGE_TRIGGER_ID = 'stageParallax';

/**
 * Horizontal bands of the street scene.
 *   travel – share of the band's own overflow it covers during the pin (1 = scrolls to its very end,
 *            smaller = slower = further away)
 *   lead   – share of the overflow already scrolled when the pin starts
 */
const LAYERS = [
    { sel: '#mountainsBand', travel: 75 / 130 },
    { sel: '#housesBand', travel: 75 / 110 },
    { sel: '#streetGroundBand', travel: 1, lead: 0.1 },
    { sel: '#charsBand', travel: 1 },
];

const MIN_PIN_DISTANCE = 1600;
const PIN_DISTANCE_K = 1.15;       // scroll px per px of hero-band travel

const $ = (sel) => document.querySelector(sel);

/** How far a band sticks out past the viewport. */
function overflowX(sel) {
    const el = $(sel);
    if (!el) return 0;
    return Math.max(0, Math.max(el.scrollWidth, el.getBoundingClientRect().width) - innerWidth);
}

/** The road has no intrinsic width – stretch it to cover the whole hero walk. */
function sizeGround() {
    const heroesWidth = $('#charsBand')?.scrollWidth || innerWidth * 3;
    const spacer = $('.streetGroundSpacer');
    if (spacer) spacer.style.width = Math.round(Math.max(heroesWidth * 1.05, innerWidth * 3.5)) + 'px';
}

function measure() {
    syncFirstHeroGap();
    sizeGround();
}

/**
 * Pins the stage and turns vertical scroll into a horizontal walk along the street.
 * Returns the ScrollTrigger so other modules (postbox, swipe) can follow its progress.
 */
export function initStage() {
    if (!$('#stage')) return null;

    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);   // layout first, then ScrollTrigger measures

    const tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: {
            id: STAGE_TRIGGER_ID,
            trigger: '#stage',
            start: 'top top',
            end: () => '+=' + Math.max(MIN_PIN_DISTANCE, Math.round(overflowX('#charsBand') * PIN_DISTANCE_K)),
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        },
    });

    tl.to('.sunImg', { yPercent: -6, scale: 0.98 }, 0);

    LAYERS.forEach(({ sel, travel, lead = 0 }) => {
        const from = () => -overflowX(sel) * lead;
        const to = () => from() - (overflowX(sel) + from()) * travel;
        tl.fromTo(sel, { x: from }, { x: to }, 0);
    });

    return tl.scrollTrigger;
}
