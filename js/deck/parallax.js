import { gsap } from '../lib/gsap.js';
import { MQ } from '../config.js';

/**
 * Vertical parallax for the deck sections. Each slide is a clipped "window" and its contents
 * drift inside it while the slide crosses the viewport, in three depths:
 *
 *   backdrop (.slide__bg)    lags the most  – far away
 *   content  (.slide__inner) lags a little less
 *   [data-parallax="-3"]     individual pieces, relative to their layer: a negative value runs
 *                            ahead of the content (closer to the viewer), a positive one lags more
 *
 * Amounts are percentages of the element's own height, applied from -amount to +amount.
 * Every layer is at rest (0) when its slide is centred, so the composed design is what you see
 * when a slide fills the screen. Desktop only, and never for visitors who prefer reduced motion.
 */
const SLIDE_LAYERS = [
    { selector: ':scope > .slide__bg', amount: 18 },
    { selector: ':scope > .slide__inner', amount: 12 },
];

function drift(el, amount, slide) {
    gsap.fromTo(el, { yPercent: -amount }, {
        yPercent: amount,
        ease: 'none',
        scrollTrigger: {
            trigger: slide,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        },
    });
}

export function initDeckParallax() {
    gsap.matchMedia().add(`${MQ.deckDesktop} and (prefers-reduced-motion: no-preference)`, () => {
        gsap.utils.toArray('.slide').forEach((slide) => {
            SLIDE_LAYERS.forEach(({ selector, amount }) => {
                const layer = slide.querySelector(selector);
                if (layer) drift(layer, amount, slide);
            });
            slide.querySelectorAll('[data-parallax]').forEach((el) => {
                drift(el, parseFloat(el.dataset.parallax) || 0, slide);
            });
        });
    });
}
