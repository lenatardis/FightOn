// GSAP is loaded from the CDN as a classic script (see index.html).
// This module is the single place that touches the globals, so every other
// module can simply `import { gsap, ScrollTrigger } from '../lib/gsap.js'`.
const { gsap, ScrollTrigger } = window;

if (!gsap || !ScrollTrigger) {
    throw new Error('GSAP failed to load – check the <script> tags in index.html');
}

gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });

export { gsap, ScrollTrigger };
