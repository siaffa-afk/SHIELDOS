// Accessibility helpers (WCAG 2.2 baseline): status announcements for screen
// readers, focus management for step transitions, reduced-motion detection.
let liveRegion = null;

function ensureLiveRegion() {
  if (liveRegion || typeof document === 'undefined') return liveRegion;
  liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('role', 'status');
  liveRegion.className = 'sr-only';
  document.body.appendChild(liveRegion);
  return liveRegion;
}

/** Announce a status change to assistive tech ("Your notes are saved"). */
export function announce(message) {
  const region = ensureLiveRegion();
  if (!region) return;
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

/** Move focus to the active checklist step after a transition. */
export function focusStep(stepKey) {
  if (typeof document === 'undefined') return;
  const el = document.querySelector(`[data-step="${stepKey}"] h3`);
  if (el) {
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: false });
  }
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
