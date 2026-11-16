import { gsap } from '../lib/gsap.js';
import { prefersReducedMotion } from '../config.js';
import { onStageVisibility } from './visibility.js';

/** Every few seconds one hero on screen strikes its second pose with a little hop. */
const POSE = {
    everySeconds: [2.5, 5],
    holdMs: 900,
    hopPx: 14,
};

/** Heroes lean against the direction of travel while the street scrolls, then wobble back upright. */
const LEAN = {
    degPerScrollSpeed: 8 / 2500,     // degrees per px/s of scroll
    maxDeg: 8,
    maxCatchUpFrames: 4,             // after a long stall, don't try to simulate the whole gap
};

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (value, limit) => Math.max(-limit, Math.min(limit, value));

function strikePose(hero) {
    const figure = hero.querySelector('.charFigure');
    hero.classList.add('is-posing');
    gsap.to(figure, { y: -POSE.hopPx, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 });
    setTimeout(() => hero.classList.remove('is-posing'), POSE.holdMs);
}

function initPoses(heroes, isVisible) {
    const onScreen = (hero) => {
        const { left, right } = hero.getBoundingClientRect();
        return right > 0 && left < innerWidth;
    };
    const isBusy = (hero) => hero.matches(':hover, :focus-visible, .is-touch, .is-posing');

    (function schedule() {
        setTimeout(() => {
            if (isVisible() && !document.hidden) {
                const free = heroes.filter((hero) => onScreen(hero) && !isBusy(hero));
                if (free.length) strikePose(free[Math.floor(Math.random() * free.length)]);
            }
            schedule();
        }, rand(...POSE.everySeconds) * 1000);
    })();
}

function initLean(heroes, stageTrigger, isVisible) {
    // one damped spring per hero, each a little different so they don't sway in unison
    const springs = heroes.map((hero) => ({
        setAngle: gsap.quickSetter(hero.querySelector('.charFigure'), 'rotation', 'deg'),
        angle: 0,
        speed: 0,
        stiffness: rand(0.06, 0.1),
        damping: rand(0.86, 0.9),
        reach: rand(0.8, 1.2),
    }));

    gsap.ticker.add(() => {
        if (!isVisible()) return;
        const scrollSpeed = stageTrigger.isActive ? stageTrigger.getVelocity() : 0;
        const target = clamp(scrollSpeed * LEAN.degPerScrollSpeed, LEAN.maxDeg);
        // The spring is integrated in steps of at most one 60 fps frame: a single big step after a
        // slow frame (or a throttled tab) would overshoot and make the spring blow up.
        const frames = Math.min(gsap.ticker.deltaRatio(60), LEAN.maxCatchUpFrames);
        const steps = Math.ceil(frames);
        const step = frames / steps;

        springs.forEach((s) => {
            const goal = target * s.reach;
            const resting = goal === 0 && Math.abs(s.angle) < 0.01 && Math.abs(s.speed) < 0.01;
            if (resting) {
                if (s.angle !== 0) s.setAngle(s.angle = 0);
                return;
            }
            for (let i = 0; i < steps; i++) {
                s.speed = (s.speed + (goal - s.angle) * s.stiffness * step) * s.damping ** step;
                s.angle += s.speed * step;
            }
            s.angle = clamp(s.angle, LEAN.maxDeg * 1.5);
            s.setAngle(s.angle);
        });
    });
}

/** Small signs of life for the heroes. (Their idle "breathing" is pure CSS, see scene.css.) */
export function initHeroIdle(stageTrigger) {
    const heroes = Array.from(document.querySelectorAll('#charsBand > .charImg'));
    if (!heroes.length || !stageTrigger || prefersReducedMotion()) return;

    let visible = false;
    onStageVisibility((v) => { visible = v; });
    const isVisible = () => visible;

    initPoses(heroes, isVisible);
    initLean(heroes, stageTrigger, isVisible);
}
