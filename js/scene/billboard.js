/**
 * Billboard video.
 * The YouTube player is injected only after the visitor presses play: nothing third-party loads
 * up front, and the poster is a plain link, so it still works without JS.
 *
 * YouTube refuses to play embeds on pages that send no HTTP referrer ("Error 153") – that is
 * always the case for file:// pages – so there we let the link open YouTube instead.
 */
export function initBillboard() {
    const poster = document.querySelector('.bb-poster');
    const id = poster?.dataset.videoId;
    if (!poster || !id) return;

    poster.style.backgroundImage = `url("https://i.ytimg.com/vi/${id}/hqdefault.jpg")`;

    if (!location.protocol.startsWith('http')) return;

    poster.addEventListener('click', (e) => {
        e.preventDefault();
        const frame = document.createElement('iframe');
        frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
        frame.title = poster.dataset.videoTitle || 'Video';
        frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen; web-share';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        poster.replaceWith(frame);
    });
}
