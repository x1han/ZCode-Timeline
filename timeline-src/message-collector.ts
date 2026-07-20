// timeline-src/message-collector.ts
// Walks the page to identify user messages, attaches stable identifiers,
// exposes position/text helpers, and watches for changes via
// MutationObserver (throttled).

import {
  BUILTIN_USER_SELECTORS,
  DEFAULT_USER_SELECTORS,
  findScrollContainer,
  selectAllUserMessages,
} from './dom-probe';
import { setMessages } from './store';

export interface MessageAnchor {
  /** stable id (preferred: data-message-id attribute); else generated */
  id: string;
  /** source DOM element */
  el: HTMLElement;
  /** the user message text (truncated) */
  text: string;
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

// Fragments used to strip ZCode's per-message action bar from the trailing
// end of the user-message text. The action bar is whatever ZCode appends
// after the user message — typically an HH:MM (or HH:MM:SS) timestamp and
// zero or more action verbs like 编辑 / 复制 / 删除. We strip these so the
// tooltip + bar title only show the actual user message.
const ACTION_WORDS =
  String.raw`(?:已)?(?:编辑|删除|复制|回复|引用|撤回|转发|分享|赞|收藏|更多|edited|deleted|copied)`;
// Match HH:MM with optional :SS.
const TS = String.raw`\d{1,2}:\d{2}(?::\d{2})?`;
// Whitespace + Unicode separators (Zs) + Unicode punctuation (P) via the
// /u regex flag. Tolerant of trailing 。 ， ； ： ！ ？ · — — between user
// text and the trailing timestamp+action block. Previously we used a
// narrow whitelist ([\s\u00A0\u2003\u3000]) which silently failed on
// CJK punctuation the user message legitimately ended with, leaking the
// action bar into the tooltip. The blacklist approach covers every
// separator ZCode may insert without enumerating each codepoint.
const W  = String.raw`[\s\p{Z}\p{P}]*`;
// Optional middle-dot / dash separator placed between timestamp and
// action-word when ZCode writes e.g. "17:55 · 编辑".
const S  = String.raw`(?:[·\u00B7\-–—][\s\p{Z}\p{P}]*)?`;

// Selectors that identify ZCode's per-message action bar in the DOM.
// Ordered by stability: ARIA / data attributes first (most stable across
// ZCode's style churn), class heuristics last (most brittle).
const ACTION_BAR_SELECTORS = [
  '[role="toolbar"]',
  '[role="group"][aria-label*="message actions" i]',
  '[aria-label*="message actions" i]',
  '[data-message-actions]',
  '[data-testid*="message-actions" i]',
  '[class*="messageActions" i]',
  '[class*="MessageActions" i]',
  '[class*="message-actions" i]',
  '[class*="Message-actions" i]',
];
// Subtrees whose trimmed text is ONLY a sequence of timestamp and/or
// action-word fragments separated by whitespace / Unicode separators /
// Unicode punctuation. Captures action bars with no ARIA / class hook
// AND post-edit indicators like "[已编辑]" or "[编辑][复制]" (the
// brackets are just punctuation) AND edited-state marks that show
// only "编辑" without a timestamp. Safe against legitimate user
// messages that contain the word "编辑" because such messages have
// other text that fails the fragment-only check.
const FRAGMENT_RE = String.raw`(?:\d{1,2}:\d{2}(?::\d{2})?|(?:已)?(?:编辑|删除|复制|回复|引用|撤回|转发|分享|赞|收藏|更多))`;
const ACTION_BAR_CONTENT_RE = new RegExp(
  String.raw`^[\s\p{Z}\p{P}]*(?:${FRAGMENT_RE}[\s\p{Z}\p{P}]*)+$`,
  'u',
);

// Precompile the 4-step extractText fallback chain at module load. Compiling
// each `new RegExp` per call costs ~tens of microseconds and adds up over
// 100+ messages per MutationObserver tick. CRITICAL: the source strings MUST
// stay byte-identical to the originals so esbuild produces the same compiled
// output (minified names `Wl/ao/br/eo` must keep matching the local consts).
const EXTRACT_RE_TS_ACTIONS = new RegExp(`${W}${TS}${W}${S}${W}${ACTION_WORDS}?${W}$`, 'u');
const EXTRACT_RE_ACTIONS_TS = new RegExp(`${W}${ACTION_WORDS}${W}${S}${W}${TS}${W}$`, 'u');
const EXTRACT_RE_TS = new RegExp(`${W}${TS}${W}$`, 'u');
const EXTRACT_RE_ACTIONS = new RegExp(`${W}${ACTION_WORDS}${W}$`, 'u');

function isActionBarElement(node: Element): boolean {
  if (node.matches(ACTION_BAR_SELECTORS.join(','))) return true;
  const txt = (node.textContent || '').trim();
  if (txt.length > 0 && txt.length < 120 && ACTION_BAR_CONTENT_RE.test(txt)) {
    return true;
  }
  return false;
}

function extractText(el: HTMLElement): string {
  // Primary defense: walk a CLONE of `el`, remove any descendant whose
  // subtree looks like ZCode's per-message action bar. Reading textContent
  // from the cleaned clone therefore returns just the user message,
  // bypassing all the regex subtleties (multiple action verbs, mixed
  // punctuation, ZWJ separators, etc.) that bit the previous design.
  // The clone means we never mutate the live DOM.
  const clone = el.cloneNode(true) as HTMLElement;
  for (const sub of Array.from(clone.querySelectorAll('*'))) {
    if (isActionBarElement(sub)) sub.remove();
  }
  // Belt-and-braces: even after selector-based pruning, if the clone's
  // last direct child still reads as timestamp+actions-only, drop it too.
  const last = clone.lastElementChild;
  if (last && isActionBarElement(last)) last.remove();

  // Cheap text pull from the cleaned clone. Falls back to innerText only
  // when the textContent is suspiciously short (CSS ::before / ::after
  // content), so most messages use the textContent path.
  let raw = (clone.textContent || '').replace(/\s+/g, ' ').trim();
  if (raw.length < 8) {
    raw = (clone.innerText || raw || '').replace(/\s+/g, ' ').trim();
  }
  // Defense-in-depth: regex strip in case DOM pruning missed the bar
  // (e.g., a ZCode update that puts timestamp text inline with user text
  // and a no-class wrapper around it). \p{Z}\p{P} in W makes this robust
  // to whatever separator ZCode chooses. Regexes are precompiled at module
  // load (see EXTRACT_RE_*) for per-message speed.
  raw = raw.replace(EXTRACT_RE_TS_ACTIONS, '');
  raw = raw.replace(EXTRACT_RE_ACTIONS_TS, '');
  raw = raw.replace(EXTRACT_RE_TS, '');
  raw = raw.replace(EXTRACT_RE_ACTIONS, '');
  return raw.slice(0, 400);
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

// Per-element cache. Keyed on the HTMLElement itself so the entry is GC'd
// automatically when ZCode removes the node from the DOM. Stores (text, id)
// plus a short content hash so we can detect streaming mutations / edits
// without running extractText on every collect for unchanged nodes.
interface CacheEntry { text: string; id: string; hash: string; }
const anchorCache = new WeakMap<HTMLElement, CacheEntry>();

// Cheap content fingerprint: first 60 chars of textContent + total length.
// Detects both edits (text differs) and ZCode swapping in a fresh node
// (the new element is a different WeakMap key, so it starts empty).
function contentHashOf(el: HTMLElement): string {
  const t = (el.textContent || '');
  return `${t.length}:${t.slice(0, 60)}`;
}

export function collectMessages(): MessageAnchor[] {
  const elements = selectAllUserMessages();
  const container = elements[0] ? findScrollContainer(elements[0]) : null;

  const anchors: MessageAnchor[] = elements.map((el) => {
    const scrollContentTop = getScrollContentTop(el, container);
    const scrollOffsetTop = getScrollOffsetTop(el);
    const hash = contentHashOf(el);
    const cached = anchorCache.get(el);
    let text: string;
    let id: string;
    if (cached && cached.hash === hash && el.isConnected) {
      text = cached.text;
      id = cached.id;
    } else {
      text = extractText(el);
      id = extractId(el);
      anchorCache.set(el, { text, id, hash });
    }
    return {
      id,
      el,
      text,
      rect: () => el.getBoundingClientRect(),
      getAbsoluteTop: () => getAbsoluteTopOf(el, container),
      scrollContentTop,
      scrollOffsetTop,
    };
  });

  return anchors;
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
      const anchors = collectMessages();
      // Always observe document.body with subtree:true. The previous design
      // narrowed the MO scope to the chat container itself, which broke on
      // conversation switch: the old container (now detached) had the MO,
      // the new container had none, and no mutations fired onMutate until
      // the user manually scrolled or resized. With body+subtree the MO
      // fires for any DOM change anywhere, and tick() re-resolves the
      // chat container via findScrollContainer every time. The pending
      // flag (200ms debounce) keeps the cost negligible.
      observeTarget(document.body);

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
  const anchors = collectMessages();
  setMessages(anchors);
}
