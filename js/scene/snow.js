import { gsap } from '../lib/gsap.js';
import { prefersReducedMotion } from '../config.js';
import { onStageVisibility } from './visibility.js';

const DENSITY = 1 / 14000;          // flakes per px² of sky
const COUNT = [30, 110];
const MAX_PIXEL_RATIO = 1.5;
const SCROLL_DRIFT = 0.5;           // how much the flakes slide sideways with the street (px per scroll px)

const rand = (a, b) => a + Math.random() * (b - a);

function makeFlake(width, height, anywhere) {
    const depth = rand(0.5, 1);                         // 1 = closest: bigger, faster, brighter
    return {
        x: rand(0, width),
        y: anywhere ? rand(0, height) : -4,
        radius: rand(1, 2.6) * depth,
        fall: rand(22, 55) * depth,                     // px/s
        sway: rand(6, 18),
        phase: rand(0, Math.PI * 2),
        alpha: rand(0.45, 0.9) * depth,
        depth,
    };
}

/** Sparse snowfall between the houses and the heroes, drawn on one small canvas. */
export function initSnow(stageTrigger) {
    const houses = document.getElementById('houses');
    if (!houses || prefersReducedMotion()) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'snowfall';
    canvas.setAttribute('aria-hidden', 'true');
    houses.after(canvas);                               // above the houses, below the heroes
    const ctx = canvas.getContext('2d');

    let width = 0;
    let height = 0;
    let flakes = [];
    let visible = false;
    let time = 0;

    new ResizeObserver(() => {
        const ratio = Math.min(devicePixelRatio || 1, MAX_PIXEL_RATIO);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.fillStyle = '#fff';
        const count = Math.max(COUNT[0], Math.min(COUNT[1], Math.round(width * height * DENSITY)));
        flakes = Array.from({ length: count }, () => makeFlake(width, height, true));
    }).observe(canvas);

    onStageVisibility((v) => { visible = v; });

    gsap.ticker.add(() => {
        if (!visible || document.hidden || !width) return;
        const dt = Math.min(gsap.ticker.deltaRatio(60) / 60, 0.1);
        const street = stageTrigger?.isActive ? stageTrigger.getVelocity() * SCROLL_DRIFT : 0;
        time += dt;

        ctx.clearRect(0, 0, width, height);
        flakes.forEach((f, i) => {
            f.y += f.fall * dt;
            f.x += (Math.sin(time + f.phase) * f.sway - street * f.depth) * dt;
            if (f.y > height + 4) flakes[i] = f = makeFlake(width, height, false);
            if (f.x < -4) f.x += width + 8;
            else if (f.x > width + 4) f.x -= width + 8;

            ctx.globalAlpha = f.alpha;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}
