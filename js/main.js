import { ScrollTrigger } from './lib/gsap.js';
import { initScene } from './scene/index.js';
import { initDeck } from './deck/index.js';
import { initMail } from './ui/mail.js';
import { initPostbox } from './ui/postbox.js';

const postbox = initPostbox(initMail());

try {
    postbox.follow(await initScene());
} finally {
    // The deck sits below the pinned stage, so its triggers must be created after the pin exists.
    initDeck();
}

// Late-loading fonts shift the layout – re-measure once they have arrived.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
