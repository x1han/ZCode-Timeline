// timeline-src/dom-probe.ts
// Heuristic selectors for finding user-authored messages in ZCode's DOM.
//
// ZCode's renderer is minified + chunked, so we cannot rely on component names.
// These selectors cover the conventions used by OpenAI/Anthropic/Codex-style chat UIs.
// Order matters: more specific first.

/** Immutable built-in defaults. Used by DEFAULT_USER_SELECTORS at module load,
 *  and as the fallback when callers pass an empty customSelectors array. */
export const BUILTIN_USER_SELECTORS: readonly string[] = [
  // OpenAI ChatGPT web conventions
  '[data-message-author-role="user"]',
  '[data-author="user"]',
  '[data-role="user"]',
  'article[data-message-author-role="user"]',

  // Antigravity / Cursor / Claude patterns
  '[data-author-role="user"]',
  '[data-message-id][data-role="user"]',

  // ARIA
  '[aria-label="user message"]',
  '[aria-label="User message"]',
  '[aria-label*="user message" i]',

  // Class-name heuristics (case-insensitive)
  '[class*="userMessage" i]',
  '[class*="UserMessage" i]',
  '[class*="user-message" i]',
  '[class*="user_message" i]',
  '[class*="humanMessage" i]',
  '[class*="HumanMessage" i]',
];

/** Mutable working copy. refreshCustomSelectors() replaces this entire array
 *  (no append, no stale tail). selectAllUserMessages() / diagnose() read it. */
export const DEFAULT_USER_SELECTORS: string[] = BUILTIN_USER_SELECTORS.slice();

/**
 * Try to discover the scroll container that wraps the chat messages.
 *
 * Strategy: walk up from the first matching user message, choosing the
 * closest ancestor with overflow-y: auto|scroll|overlay whose scrollHeight
 * exceeds its clientHeight by a meaningful amount.
 */
export function findScrollContainer(firstUserEl: HTMLElement): HTMLElement | null {
  let cur: HTMLElement | null = firstUserEl;
  let bestMatch: { el: HTMLElement; size: number } | null = null;
  // Prefer the SMALLEST scrollable ancestor that still contains the message
  // — i.e. the most specific chat scroll panel, not the full page.
  while (cur && cur !== document.body) {
    const cs = window.getComputedStyle(cur);
    const overflowY = cs.overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      cur.scrollHeight - cur.clientHeight > 100
    ) {
      if (!bestMatch || cur.scrollHeight < bestMatch.size) {
        bestMatch = { el: cur, size: cur.scrollHeight };
      }
    }
    cur = cur.parentElement;
  }
  return bestMatch?.el ?? null;
}

/**
 * Returns the first selector that matches at least one element. Null if none.
 * For diagnostics, also returns how many elements each selector matched.
 */
export function diagnose(root: ParentNode = document.body): {
  matches: Record<string, number>;
  firstHit: string | null;
} {
  const matches: Record<string, number> = {};
  let firstHit: string | null = null;
  for (const sel of DEFAULT_USER_SELECTORS) {
    let count = 0;
    try {
      count = root.querySelectorAll(sel).length;
    } catch {
      // invalid selector (shouldn't happen, but be safe)
    }
    matches[sel] = count;
    if (!firstHit && count > 0) firstHit = sel;
  }
  return { matches, firstHit };
}

/**
 * Find all user messages, applying SELECTORS in order; the first selector
 * that yields >=1 element is used for the current snapshot. Subsequent
 * selectors are ignored. This keeps results stable across renders where
 * two attributes might co-exist.
 */
export function selectAllUserMessages(customSelectors?: string[]): HTMLElement[] {
  const list = customSelectors && customSelectors.length ? customSelectors : DEFAULT_USER_SELECTORS;
  for (const sel of list) {
    let found: HTMLElement[] = [];
    try {
      found = Array.from(document.querySelectorAll<HTMLElement>(sel));
    } catch {
      continue;
    }
    if (found.length > 0) return found;
  }
  return [];
}
