import { gsap } from '../lib/gsap.js';
import { prefersReducedMotion } from '../config.js';

const FADE_MS = 220;
const SUCCESS_MS = 1400;
const isFilled = (value) => value.trim().length > 0;
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Envelope modal with the feedback form. Returns `{ open, close }`. */
export function initMail() {
    const overlay = document.getElementById('mailOverlay');
    if (!overlay) return null;

    const letter = overlay.querySelector('.letter');
    const form = overlay.querySelector('.submitForm');
    const message = document.getElementById('formError');
    const errorText = message.textContent;
    const fields = [
        { el: form.elements.name, valid: isFilled },
        { el: form.elements.email, valid: isEmail },
    ];
    const background = [document.querySelector('main'), document.getElementById('postboxFab')].filter(Boolean);
    let lastFocus = null;
    let closeTimer;

    function setMessage(kind) {
        message.hidden = !kind;
        message.classList.toggle('is-success', kind === 'success');
        message.textContent = kind === 'success' ? message.dataset.success : errorText;
    }

    function open() {
        clearTimeout(closeTimer);
        lastFocus = document.activeElement;
        overlay.hidden = false;
        document.documentElement.classList.add('modal-open');
        background.forEach((el) => { el.inert = true; });     // keep keyboard focus inside the dialog

        requestAnimationFrame(() => {
            overlay.classList.add('on');
            form.elements.topic.focus({ preventScroll: true });
            if (prefersReducedMotion()) return;
            // the letter hops out of the envelope
            gsap.killTweensOf(letter);
            gsap.timeline()
                .set(letter, { y: 18 })
                .to(letter, { y: -10, duration: 0.28, ease: 'power2.out' })
                .to(letter, { y: 0, duration: 0.36, ease: 'power1.out' });
        });
    }

    function close() {
        overlay.classList.remove('on');
        closeTimer = setTimeout(() => {
            overlay.hidden = true;
            document.documentElement.classList.remove('modal-open');
            background.forEach((el) => { el.inert = false; });
            lastFocus?.focus?.({ preventScroll: true });
        }, FADE_MS);
    }

    function validate() {
        let ok = true;
        fields.forEach(({ el, valid }) => {
            const good = valid(el.value);
            el.classList.toggle('invalid', !good);
            el.toggleAttribute('aria-invalid', !good);
            ok &&= good;
        });
        return ok;
    }

    fields.forEach(({ el, valid }) => {
        el.addEventListener('input', () => {
            if (!el.classList.contains('invalid') || !valid(el.value)) return;
            el.classList.remove('invalid');
            el.removeAttribute('aria-invalid');
            if (fields.every((f) => f.valid(f.el.value))) setMessage(null);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();          // demo form: there is no backend behind it
        if (!validate()) return setMessage('error');
        setMessage('success');
        setTimeout(() => {
            close();
            form.reset();
            setMessage(null);
        }, SUCCESS_MS);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('.letter-close')) close();
    });

    addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) close();
    });

    return { open, close };
}
