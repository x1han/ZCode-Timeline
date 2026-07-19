// timeline-src/scroll-to.ts
// Smooth-scroll to a given anchor and flash-highlight it.

import type { MessageAnchor } from './message-collector';

// Per-element timer registry so re-flashing an element before the previous
// flash finished cancels the stale timer (avoiding late classList.remove
// on a node that has since been re-mounted or GC'd). When the element is
// detached we drop its entry from the registry.
const FLASH_MS = 1400;
const flashTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

export function scrollToAnchor(anchor: MessageAnchor, behavior: ScrollBehavior = 'smooth') {
  // If the anchor's DOM has been swapped out by MutationObserver (same id
  // but a fresh element), silently no-op — there's nothing to scroll to.
  if (!anchor.el || !anchor.el.isConnected) return;
  try {
    anchor.el.scrollIntoView({ behavior, block: 'center' });
  } catch {
    // ignore
  }
  flashElement(anchor.el);
}

export function flashElement(el: HTMLElement) {
  if (!el.isConnected) return;
  // Cancel any in-flight flash for this element.
  const existing = flashTimers.get(el);
  if (existing) clearTimeout(existing);

  el.classList.remove('zcode-tl-flash');
  // Force reflow so re-adding the class restarts the animation reliably
  // across re-flashes.
  void el.offsetWidth;
  el.classList.add('zcode-tl-flash');

  const timer = setTimeout(() => {
    flashTimers.delete(el);
    // Guard against the element being detached between the timer being
    // scheduled and firing (e.g. message-collector rebuilt the list).
    if (el.isConnected) el.classList.remove('zcode-tl-flash');
  }, FLASH_MS);
  flashTimers.set(el, timer);
}