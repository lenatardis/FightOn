// One shared watcher for "is the street scene on screen?", so idle effects only run while it is.

const listeners = new Set();
let visible;

/** Calls `callback(isVisible)` now (once known) and whenever the stage enters or leaves the viewport. */
export function onStageVisibility(callback) {
    const stage = document.getElementById('stage');
    if (!stage) return;

    if (!listeners.size) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            stage.classList.toggle('is-offscreen', !visible);   // pauses the CSS idle animations
            listeners.forEach((listener) => listener(visible));
        }).observe(stage);
    }
    listeners.add(callback);
    if (visible !== undefined) callback(visible);
}
