import { HERO_STATS, STAT_LABELS } from '../data/heroes.js';
import { isSceneMobile } from '../config.js';

const TOUCH_PREVIEW_MS = 900;
const band = () => document.getElementById('charsBand');

function buildPlate(stats) {
    const plate = document.createElement('div');
    plate.className = 'charPlate';

    const inner = document.createElement('div');
    inner.className = 'charPlate__inner';

    const half = Math.ceil(STAT_LABELS.length / 2);
    [[0, half], [half, STAT_LABELS.length]].forEach(([from, to]) => {
        const col = document.createElement('dl');
        col.className = 'charPlate__col';
        for (let i = from; i < to; i++) {
            const row = document.createElement('div');
            row.className = 'charPlate__row';
            const dt = document.createElement('dt');
            dt.textContent = STAT_LABELS[i];
            const dd = document.createElement('dd');
            dd.textContent = stats[i];
            row.append(dt, dd);
            col.append(row);
        }
        inner.append(col);
    });

    plate.append(inner);
    return plate;
}

function buildNameBubble(name) {
    const top = document.createElement('div');
    top.className = 'charTop';
    top.setAttribute('aria-hidden', 'true');

    const img = new Image();
    img.className = 'charTop__img';
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.src = './assets/top_bubble.svg';

    const label = document.createElement('span');
    label.className = 'charTop__label';
    label.textContent = name;

    top.append(img, label);
    return top;
}

/**
 * Turns every plain <img class="charImg"> into an interactive hero:
 * wrapper + hover pose + name bubble + stats plate.
 */
export function enhanceHeroes() {
    const root = band();
    if (!root) return;

    root.querySelectorAll('img.charImg').forEach((baseImg) => {
        const name = baseImg.alt;
        const stats = HERO_STATS[name];

        const wrap = document.createElement('span');
        wrap.className = baseImg.className;
        wrap.tabIndex = 0;
        wrap.setAttribute('role', 'img');
        wrap.setAttribute('aria-label', name);

        baseImg.className = 'base';
        baseImg.alt = '';

        // Hover pose: lazy, so the ~1 MB of second poses is fetched only as heroes come near the viewport.
        const hoverImg = new Image();
        hoverImg.className = 'hover';
        hoverImg.alt = '';
        hoverImg.decoding = 'async';
        hoverImg.loading = 'lazy';
        hoverImg.src = baseImg.dataset.hover || baseImg.getAttribute('src').replace(/(\.[a-z]+)$/i, '_hover$1');

        // The figure (both poses) is its own element so idle motion never moves the plate or the bubble.
        const figure = document.createElement('span');
        figure.className = 'charFigure';
        figure.style.setProperty('--breath-time', (2.6 + Math.random() * 1.4).toFixed(2) + 's');
        figure.style.setProperty('--breath-offset', (-Math.random() * 4).toFixed(2) + 's');

        baseImg.replaceWith(wrap);
        figure.append(baseImg, hoverImg);
        wrap.append(figure);
        if (stats) wrap.append(buildPlate(stats));
        wrap.append(buildNameBubble(name));

        // Touch has no hover: show the "hover" state briefly on tap.
        let timer;
        wrap.addEventListener('touchstart', () => {
            wrap.classList.add('is-touch');
            clearTimeout(timer);
            timer = setTimeout(() => wrap.classList.remove('is-touch'), TOUCH_PREVIEW_MS);
        }, { passive: true });
    });
}

/**
 * Leaves an empty "slot" before the first hero so the scene opens on the street
 * rather than on a character. On phones the slot is capped so the first hero stays on screen.
 */
export function syncFirstHeroGap() {
    const first = band()?.querySelector('.charImg');
    const second = first?.nextElementSibling;
    if (!first || !second) return;

    const width = first.offsetWidth;
    const slot = Math.round(width
        + (parseFloat(getComputedStyle(first).marginRight) || 0)
        + (parseFloat(getComputedStyle(second).marginLeft) || 0));

    let gap = slot;
    if (isSceneMobile()) {
        const SAFE_PAD = 12;
        const room = innerWidth - innerWidth * 0.05 - width - SAFE_PAD;
        gap = Math.round(Math.max(0, Math.min(slot, room)) * 0.98);
    }
    document.documentElement.style.setProperty('--first-char-extra-gap', gap + 'px');
}

/** The first heroes on screen – the stage waits for these on slow connections. */
export function criticalHeroImages() {
    const count = isSceneMobile() ? 2 : 4;
    return Array.from(band()?.querySelectorAll('.charFigure > img.base') ?? []).slice(0, count);
}
