// timeline-src/message-collector.ts
// Walks the page to identify user messages, attaches stable identifiers,
// exposes position/text/reply-preview helpers, and watches for changes via
// MutationObserver (throttled).

import {
  DEFAULT_USER_SELECTORS,
  findScrollContainer,
  selectAllUserMessages,
} from './dom-probe';
import { setMessages, setScrollContainer } from './store';

export interface MessageAnchor {
  /** stable id (preferred: data-message-id attribute); else generated */
  id: string;
  /** source DOM element */
  el: HTMLElement;
  /** the user message text (truncated) */
  text: string;
  /** best-effort preview of the next sibling's reply text (truncated) */
  replyPreview: string;
  /** cached getBoundingClientRect accessor */
  rect: () => DOMRect;
  /** cached absolute top, recomputed on scroll */
  getAbsoluteTop: () => number;
  /** Y position within the chat scroll container's content (px from the
      container's content top, not the viewport). Updated on collect. */
  scrollContentTop: number;
  /** Y position within the chat scroll container (for click→scroll math). */
  scrollOffsetTop: number;
}

function genId(): string {
  return `u_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function extractId(el: HTMLElement): string {
  const candidates = [
    el.dataset?.messageId,
    el.dataset?.id,
    el.getAttribute('data-id'),
    el.getAttribute('id'),
  ];
  for (const c of candidates) {
    if (c && c.length > 0 && c.length < 200) return c;
  }
  return genId();
}

function extractText(el: HTMLElement): string {
  // Prefer textContent (cheap, no layout). Only fall back to innerText when
  // the result is suspiciously short — some chat UIs render the visible text
  // via ::before / ::after content which innerText picks up but textContent
  // doesn't. The fallback path runs at most once per element per collect.
  let raw = el.textContent || '';
  raw = raw.replace(/\s+/g, ' ').trim();
  if (raw.length < 8) {
    raw = (el.innerText || raw || '').replace(/\s+/g, ' ').trim();
  }
  return raw.slice(0, 400);
}

function extractReplyPreview(el: HTMLElement): string {
  // Try to find the very next sibling/parent sibling message element.
  let n: Element | null = el.nextElementSibling;
  while (n) {
    const role =
      n.getAttribute?.('data-message-author-role') ||
      n.getAttribute?.('data-role') ||
      n.getAttribute?.('data-author') ||
      '';
    if (role === 'assistant' || role === 'model') {
      const t = extractText(n as HTMLElement);
      if (t) return t;
    }
    // skip child container that holds both user+assistant
    const inner = (n as HTMLElement).querySelector?.(
      '[data-message-author-role="assistant"], [data-role="assistant"], [data-author="assistant"]'
    );
    if (inner) {
      const t = extractText(inner as HTMLElement);
      if (t) return t;
    }
    n = n.nextElementSibling;
  }
  // Fallback: look at the parent and pick the assistant sibling.
  const parent = el.parentElement;
  if (parent) {
    const candidate = parent.nextElementSibling;
    if (candidate) {
      const t = extractText(candidate as HTMLElement);
      if (t) return t.slice(0, 400);
    }
  }
  return '';
}

function getAbsoluteTopOf(el: HTMLElement, container: HTMLElement | null): number {
  // Use the scroll container's scrollTop + element offsetTop; fall back to viewport rect + page Y.
  if (container && container.contains(el)) {
    const top = el.offsetTop;
    return container.scrollTop + top;
  }
  const rect = el.getBoundingClientRect();
  return rect.top + window.scrollY;
}

/**
 * Compute the message's vertical position in the chat scroll container's
 * content coordinate space. This is the y-value where the bar should be
 * placed INSIDE the scroll container so that as the user scrolls, the bar
 * moves along with the message.
 *
 *   scrollContentTop = (el.getBoundingClientRect().top
 *                     - container.getBoundingClientRect().top
 *                     + container.scrollTop)
 */
function getScrollContentTop(el: HTMLElement, container: HTMLElement | null): number {
  if (!container) {
    // Fallback: offset of el relative to body.
    let cur: HTMLElement | null = el;
    let y = 0;
    while (cur) {
      y += cur.offsetTop;
      cur = cur.offsetParent as HTMLElement | null;
      if (cur === document.body) break;
    }
    return y;
  }
  const elRect = el.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();
  return elRect.top - cRect.top + container.scrollTop;
}

function getScrollOffsetTop(el: HTMLElement): number {
  return el.offsetTop;
}

export function collectMessages(): {
  anchors: MessageAnchor[];
  scrollContainer: HTMLElement | null;
} {
  const elements = selectAllUserMessages();
  const container = elements[0] ? findScrollContainer(elements[0]) : null;
  setScrollContainer(container);

  const anchors: MessageAnchor[] = elements.map((el) => {
    const scrollContentTop = getScrollContentTop(el, container);
    const scrollOffsetTop = getScrollOffsetTop(el);
    const id = extractId(el);
    return {
      id,
      el,
      text: extractText(el),
      replyPreview: extractReplyPreview(el),
      rect: () => el.getBoundingClientRect(),
      getAbsoluteTop: () => getAbsoluteTopOf(el, container),
      scrollContentTop,
      scrollOffsetTop,
    };
  });

  return { anchors, scrollContainer: container };
}

let watchHandle: { stop: () => void } | null = null;

/**
 * Watch the DOM for additions/removals. Throttled to avoid thrashing during
 * streaming. Calls onChange() whenever the user-message set has changed in
 * a meaningful way (count change or top id change).
 */
export function watchMessages(onChange: (a: MessageAnchor[]) => void): { stop: () => void } {
  if (watchHandle) return watchHandle;

  let lastSig = '';
  let pending = false;
  // Current MO target — narrowed once we discover the chat container so the
  // observer doesn't pay attention to every mutation in the ZCode sidebar,
  // settings drawer, or other unrelated DOM.
  let mo: MutationObserver | null = null;
  let observedTarget: Node | null = null;

  const observeTarget = (target: Node) => {
    if (observedTarget === target) return;
    if (mo && observedTarget) mo.disconnect();
    if (!mo) mo = new MutationObserver(onMutate);
    mo.observe(target, { childList: true, subtree: true });
    observedTarget = target;
  };

  const tick = () => {
    pending = false;
    try {
      const { anchors, scrollContainer } = collectMessages();
      // Narrow the MO scope to the chat container (or fall back to body if
      // none was found). Re-narrowing is cheap.
      observeTarget(scrollContainer ?? document.body);

      const sig = anchors.map((a) => `${a.id}:${Math.round(a.getAbsoluteTop() / 4)}`).join('|');
      if (sig !== lastSig) {
        lastSig = sig;
        setMessages(anchors);
        onChange(anchors);
      }
    } catch {
      // ignore collect errors
    }
  };

  const onMutate = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => setTimeout(tick, 200));
  };

  // initial collect — this also picks the first observed target.
  tick();

  // also update on window resize & scroll (positions change)
  const onScrollOrResize = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => setTimeout(tick, 250));
  };
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  window.addEventListener('scroll', onScrollOrResize, { passive: true });

  watchHandle = {
    stop: () => {
      if (mo) mo.disconnect();
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize);
      mo = null;
      observedTarget = null;
      watchHandle = null;
    },
  };
  return watchHandle;
}

export function refreshCustomSelectors(next: string[]) {
  if (!Array.isArray(next)) return;
  // A6: replace the entire selector list (don't append / don't leave stale tail).
  // If caller passes an empty array, restore the built-in defaults so the
  // timeline isn't silently broken.
  const replacement = next.length === 0 ? BUILTIN_USER_SELECTORS.slice() : next.slice();
  DEFAULT_USER_SELECTORS.splice(0, DEFAULT_USER_SELECTORS.length, ...replacement);
  // re-collect now so the panel reflects the new selectors immediately
  const { anchors } = collectMessages();
  setMessages(anchors);
}
