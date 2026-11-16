import { gsap } from '../lib/gsap.js';

/** Clouds part and the logo drifts up while the sky intro scrolls away. */
export function initIntro() {
    const intro = document.getElementById('intro');
    if (!intro) return;

    const push = () => Math.max(innerWidth * 0.28, 280);
    const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
            trigger: intro,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
            invalidateOnRefresh: true,   // re-read push() after a resize
        },
    });

    tl.to('.cloud--lt', { x: () => -push() }, 0)
        .to('.cloud--rt', { x: () => push() }, 0)
        .to('.cloud--lb', { x: () => -push() * 0.8 }, 0)
        .to('.cloud--rb', { x: () => push() * 0.8 }, 0)
        .to('.intro-logo', { y: -40, opacity: 0.92 }, 0);
}
