import { ScrollTrigger } from '../lib/gsap.js';

const VISIBLE_UNTIL = 0.12;    // share of the street walk during which the postbox stays on screen

/**
 * Floating postbox that opens the feedback modal.
 * Call `follow(stageTrigger)` once the street scene exists: the postbox is shown only at the start of the street.
 */
export function initPostbox(mail) {
    const fab = document.getElementById('postboxFab');
    if (!fab || !mail) return { follow() {} };

    fab.addEventListener('click', mail.open);

    return {
        follow(stage) {
            if (!stage) return;
            const sync = () => {
                const progress = (scrollY - stage.start) / (stage.end - stage.start);
                fab.classList.toggle('on', progress >= 0 && progress <= VISIBLE_UNTIL);
            };
            sync();
            addEventListener('scroll', sync, { passive: true });
            ScrollTrigger.addEventListener('refresh', sync);
        },
    };
}
