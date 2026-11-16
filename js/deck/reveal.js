import { gsap } from '../lib/gsap.js';

const EASE = 'power3.out';

/** Entrance presets, picked with `data-reveal="<name>"`. Each returns the position of the next tween. */
const PRESETS = {
    up: (tl, el, at) => tl.from(el, { autoAlpha: 0, y: 36, duration: 0.7, ease: EASE }, at),
    left: (tl, el, at) => tl.from(el, { autoAlpha: 0, x: -48, duration: 0.7, ease: EASE }, at),
    right: (tl, el, at) => tl.from(el, { autoAlpha: 0, x: 48, duration: 0.7, ease: EASE }, at),
    zoom: (tl, el, at) => tl.from(el, { autoAlpha: 0, scale: 0.86, duration: 0.9, ease: EASE }, at),
    fade: (tl, el, at) => tl.from(el, { autoAlpha: 0, duration: 0.9, ease: 'power1.out' }, at),
    // neon sign being switched on
    neon: (tl, el, at) => tl.from(el, {
        keyframes: { autoAlpha: [0, 1, 0.25, 1, 0.55, 1], easeEach: 'none' },
        duration: 0.8,
    }, at),
    // bar chart column
    grow: (tl, el, at) => tl.from(el, { scaleY: 0, transformOrigin: '50% 100%', duration: 1.1, ease: 'power2.out' }, at),
    // SVG stroke being drawn (the path needs pathLength="1")
    draw: (tl, el, at) => tl.fromTo(el,
        { strokeDasharray: 1, strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.6, ease: 'power1.inOut' }, at),
};

const STAGGER = 0.09;

/**
 * Plays a one-off entrance for every `[data-reveal]` element when its slide scrolls into view.
 * Elements are hidden by GSAP itself, so without JS (or with reduced motion) everything is simply visible.
 */
export function initDeckReveal() {
    gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.slide').forEach((slide) => {
            const items = slide.querySelectorAll('[data-reveal]');
            if (!items.length) return;

            const tl = gsap.timeline({
                scrollTrigger: { trigger: slide, start: 'top 62%', once: true },
            });
            items.forEach((el, i) => {
                const preset = PRESETS[el.dataset.reveal] ?? PRESETS.up;
                preset(tl, el, i * STAGGER);
            });
        });
    });
}
