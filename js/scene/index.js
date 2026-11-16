import { ScrollTrigger } from '../lib/gsap.js';
import { isPoorNet } from '../config.js';
import { initIntro } from './intro.js';
import { enhanceHeroes, criticalHeroImages } from './heroes.js';
import { showGate, hideGate, waitForImages } from './gate.js';
import { initStage } from './stage.js';
import { initStageSwipe } from './swipe.js';
import { initTraffic } from './traffic.js';
import { initBillboard } from './billboard.js';
import { initHeroIdle } from './idle.js';
import { initSnow } from './snow.js';

/**
 * Boots the sky intro and the pinned street scene.
 * Resolves with the stage ScrollTrigger (or null when the stage is missing).
 */
export async function initScene() {
    initIntro();
    enhanceHeroes();
    initBillboard();

    // On slow connections hold the stage behind a short loader until the first heroes have arrived.
    const critical = criticalHeroImages();
    const mostlyReady = critical.length > 0
        && critical.filter((img) => img.complete).length / critical.length >= 0.8;
    if (isPoorNet() && !mostlyReady) {
        showGate();
        await waitForImages(critical);
        hideGate();
    }

    const stage = initStage();
    initStageSwipe(stage);
    initTraffic();
    initHeroIdle(stage);
    initSnow(stage);
    ScrollTrigger.refresh();
    return stage;
}
