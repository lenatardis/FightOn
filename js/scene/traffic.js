import { gsap } from '../lib/gsap.js';
import { prefersReducedMotion } from '../config.js';

/** Vehicles and how often each one shows up. */
const FLEET = [
    { src: './assets/car1.webp', cls: 'car', weight: 2 },
    { src: './assets/car2.webp', cls: 'car', weight: 3 },
    { src: './assets/car3.webp', cls: 'car', weight: 3 },
    { src: './assets/car4.webp', cls: 'longcar', weight: 3 },
    { src: './assets/bus.webp', cls: 'bus', weight: 1.2 },
];

const SPEED_PX_S = [1500, 1800];
const PAUSE_S = [5, 10];

const rand = (a, b) => a + Math.random() * (b - a);

function pickWeighted(items) {
    let r = Math.random() * items.reduce((sum, item) => sum + item.weight, 0);
    return items.find((item) => (r -= item.weight) <= 0) ?? items[0];
}

/** One vehicle at a time drives along the road, in a random direction and lane. */
export function initTraffic() {
    const layer = document.getElementById('trafficLayer');
    const road = document.getElementById('streetGroundBand');
    const stage = document.getElementById('stage');
    if (!layer || !road || !stage || prefersReducedMotion()) return;

    // Don't animate cars nobody can see.
    let stageVisible = false;
    new IntersectionObserver(([entry]) => { stageVisible = entry.isIntersecting; }).observe(stage);

    const scheduleNext = () => setTimeout(spawn, rand(...PAUSE_S) * 1000);

    function spawn() {
        if (document.hidden || !stageVisible) return scheduleNext();

        const vehicle = pickWeighted(FLEET);
        const leftToRight = Math.random() < 0.5;
        const pad = Math.max(innerWidth * 0.22, 240);
        const roadWidth = Math.max(road.scrollWidth, innerWidth * 3);
        const fromX = leftToRight ? -pad : roadWidth + pad;
        const toX = leftToRight ? roadWidth + pad : -pad;

        const box = document.createElement('div');
        box.className = ['vehicle', vehicle.cls, Math.random() < 0.45 && 'lane2', !leftToRight && 'flip']
            .filter(Boolean).join(' ');
        const img = new Image();
        img.src = vehicle.src;
        img.alt = '';
        box.append(img);
        layer.append(box);

        gsap.fromTo(box, { x: fromX }, {
            x: toX,
            ease: 'none',
            duration: Math.abs(toX - fromX) / rand(...SPEED_PX_S),
            onComplete() {
                box.remove();
                scheduleNext();
            },
        });
    }

    scheduleNext();
}
