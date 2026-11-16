import { gsap } from '../lib/gsap.js';
import { MQ } from '../config.js';

/**
 * Depth for the deck sections. Values are percentages of the element's own height.
 *
 *   data-parallax="8"     drift from -8% to +8% while the slide crosses the viewport
 *                         (positive lags behind the scroll = far away, negative runs ahead = close)
 *   data-parallax="6 0"   explicit from → to; used for artwork that sits on the slide's bottom edge,
 *                         so it rises into place and never lifts off that edge
 *
 * Desktop only, and never for visitors who prefer reduced motion.
 */
export function initDeckParallax() {
    gsap.matchMedia().add(`${MQ.deckDesktop} and (prefers-reduced-motion: no-preference)`, () => {
        gsap.utils.toArray('[data-parallax]').forEach((el) => {
            const [a, b] = el.dataset.parallax.trim().split(/\s+/).map(Number);
            const [from, to] = b === undefined ? [-a, a] : [a, b];

            gsap.fromTo(el, { yPercent: from }, {
                yPercent: to,
                ease: 'none',
                scrollTrigger: {
                    trigger: el.closest('.slide') ?? el,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        });
    });
}
