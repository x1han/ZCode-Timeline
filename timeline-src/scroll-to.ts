// timeline-src/scroll-to.ts
// Smooth-scroll to a given anchor at the viewport vertical center.

import type { MessageAnchor } from './message-collector';
import { collectMessages } from './message-collector';
import { setMessages } from './store';

/**
 * Scroll `anchor` into view at the viewport vertical center.
 *
 * Returns the resolved `MessageAnchor` (the fresh element actually scrolled
 * into view, after stale-anchor recovery) so the caller can pin the click
 * highlight to that exact id. If the anchor could not be resolved
 * (collectMessages threw, no candidate element is connected), returns
 * null — the caller should still emit the click-pin to the original id so
 * the active highlight at least stays put, but it knows the scroll didn't
 * reach the target.
 *
 * `anchorIndex` is the position of `anchor` in the OLD messages list at
 * click time. It's the position-based lookup key used to recover from
 * placeholder→finalized DOM swaps (where ZCode regenerates the id but
 * keeps the same index). Optional for back-compat — callers that don't
 * supply it get id-only lookup + the old "last-anchor" fallback.
 */
export function scrollToAnchor(
  anchor: MessageAnchor,
  anchorIndex: number = -1,
  behavior: ScrollBehavior = 'smooth',
): MessageAnchor | null {
  // The clickedId pin in store.ts keeps the just-clicked bar primary
  // during the chat's smooth-scrollIntoView (~500-700ms on long jumps),
  // so even if computeCenterIndex briefly sees the wrong message at
  // center, the active highlight stays put on the clicked bar.
  let el: HTMLElement | null = anchor.el;
  if (el && el.isConnected) {
    try {
      el.scrollIntoView({ behavior, block: 'center' });
    } catch {
      // ignore
    }
    return anchor;
  }

  // Stale anchor: the element is detached. Common case is the user just
  // sent a prompt and ZCode swapped placeholder → finalized DOM, so the
  // bar list still shows the placeholder element. Refresh + resolve.
  let fresh: MessageAnchor[];
  try {
    fresh = collectMessages();
    setMessages(fresh);
  } catch {
    // Refresh itself failed (selector threw, mid-teardown, etc.). The
    // outer Bar.tsx onClick pipeline must keep going so setClickedId
    // still fires — return null so Bar can decide whether to pin the
    // original id (acceptable: the active highlight stays put; the
    // scroll simply doesn't reach the target).
    return null;
  }

  // 1. POSITION-BASED lookup (preferred). Most stale-element cases are
  //    placeholder→finalized swaps where the index is preserved. Using
  //    position avoids depending on a stable id across the swap.
  let resolved: MessageAnchor | null = null;
  if (anchorIndex >= 0 && anchorIndex < fresh.length) {
    const candidate = fresh[anchorIndex];
    if (candidate.el.isConnected) resolved = candidate;
  }

  // 2. ID-BASED lookup (fallback). Covers the rare case where the index
  //    shifted (e.g., ZCode inserted a message above the clicked one
  //    mid-click) but the data-message-id was preserved.
  if (!resolved) {
    const byId = fresh.find((a) => a.id === anchor.id);
    if (byId && byId.el.isConnected) resolved = byId;
  }

  // 3. LAST-RESORT fallback: only if the original click was the LAST
  //    bar AND the fresh list grew (a new prompt was appended). This
  //    covers the "user sent a new prompt → bar appears at bottom →
  //    click on it while ZCode is still finalizing the DOM" case.
  //    Crucially, we DO NOT fall back to last if the user clicked an
  //    older bar whose el just happened to detach for an unrelated
  //    reason — that would silently mis-route to the newest message.
  if (!resolved && anchorIndex === fresh.length - 1 && fresh.length > 0) {
    const lastFresh = fresh[fresh.length - 1];
    if (lastFresh.el.isConnected) resolved = lastFresh;
  }

  if (!resolved) return null;

  try {
    resolved.el.scrollIntoView({ behavior, block: 'center' });
  } catch {
    // ignore — return the resolved anchor anyway so Bar can pin to its id
  }
  return resolved;
}