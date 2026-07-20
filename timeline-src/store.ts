// timeline-src/store.ts
// Tiny module-level store. Avoids pulling in Zustand for a component this small.
//
// Observers subscribe to changes via subscribe() and read state via get().

import type { MessageAnchor } from './message-collector';

export interface TimelineState {
  messages: MessageAnchor[];
  /** Bar the user is currently hovering. Updates IMMEDIATELY on mouseenter
   * (drives the staircase/active highlight). */
  hoveredId: string | null;
  /** Bar the tooltip should show. Updates AFTER a 500ms hover delay. */
  tooltipId: string | null;
  // The v1/v2 designs kept `clickedId` + `clickedAt` here for a click-pin
  // mechanism that hard-set primaryIndex to the clicked bar for ~800ms.
  // That design produced the visible 1 → 5 → 4 → 3 → 2 → 1 jump on long-
  // distance clicks (pin held active=1 for 800ms then expired MID-SCROLL
  // and cachedCenterIndex — which was on bar 5 because the chat was still
  // animating — took over). The active highlight now follows cachedCenterIndex
  // naturally via the chat's onScroll events, so we no longer track which
  // bar was last clicked. Kept here as a typed slot (not removed) for
  // forward-compat — if a future feature wants to remember "last clicked
  // bar" (e.g., for keyboard shortcuts or analytics), it can populate
  // these without breaking the TimelineState shape.
  clickedId: string | null;
  clickedAt: number;
}

const state: TimelineState = {
  messages: [],
  hoveredId: null,
  tooltipId: null,
  clickedId: null,
  clickedAt: 0,
};

const listeners = new Set<() => void>();

export function getState(): TimelineState {
  return state;
}

export function setMessages(next: MessageAnchor[]) {
  // Shallow equality check — emit only when something actually changed.
  // Avoids re-renders on every MutationObserver tick when the DOM
  // shuffled but the set of messages (in stable order) is identical.
  const prev = state.messages;
  if (prev === next) return;
  if (prev.length === next.length) {
    let same = true;
    for (let i = 0; i < prev.length; i++) {
      if (prev[i] !== next[i] && prev[i].id !== next[i].id) {
        same = false;
        break;
      }
    }
    if (same) return;
  }
  state.messages = next;
  emit();
}

export function setHovered(id: string | null) {
  if (state.hoveredId === id) return;
  state.hoveredId = id;
  emit();
}

// Hover-departure debounce. When the mouse leaves a bar, the previous
// design called setPrimary(null) immediately — which made the active
// highlight snap back to cachedCenterIndex even for brief mouse
// excursions (e.g., moving the cursor across the 1-2px gap between
// two bars, or pausing mid-air while deciding which bar to click).
// The user reads the bar gap as part of "still hovering", so a snap-
// back mid-decision feels like the highlight is jumpy.
//
// This module-level debounce schedules the clear after HOVER_LEAVE_DELAY_MS
// (200ms). If a newer setHovered() lands within that window (from any
// bar's onMouseEnter), the timer is cancelled and the new hover wins.
// Module-level (not per-Bar useRef) because cross-bar mouse moves
// (bar A leave → bar B enter within the debounce window) need to share
// state: bar A's per-instance timer can't see bar B's setHovered call.
//
// Id-equality check at fire time is belt-and-braces: if two different
// bars both called requestHoverClear in sequence, only the matching
// id (still the active hover at fire time) gets cleared — protects
// against an edge case where the user hovers A, leaves, hovers B
// briefly, leaves, hovers A again within 200ms.
const HOVER_LEAVE_DELAY_MS = 200;
let _hoverLeaveTimer: ReturnType<typeof setTimeout> | null = null;
let _hoverLeaveTarget: string | null = null;

export function requestHoverClear(currentId: string) {
  if (_hoverLeaveTimer != null) {
    clearTimeout(_hoverLeaveTimer);
    _hoverLeaveTimer = null;
  }
  _hoverLeaveTarget = currentId;
  _hoverLeaveTimer = setTimeout(() => {
    _hoverLeaveTimer = null;
    const target = _hoverLeaveTarget;
    _hoverLeaveTarget = null;
    if (state.hoveredId === target) {
      state.hoveredId = null;
      emit();
    }
  }, HOVER_LEAVE_DELAY_MS);
}

export function setTooltipId(id: string | null) {
  if (state.tooltipId === id) return;
  state.tooltipId = id;
  emit();
}

/**
 * Clear transient UI state (hover / tooltip) without touching the
 * message list. Called from TimelinePanel.mountPanel so a conversation
 * switch starts with a clean slate. `clickedId` and `clickedAt` are no
 * longer tracked by the click-pin mechanism (see TimelineState comment)
 * but kept on the shape for forward-compat — we zero them here too so
 * a stale value from a previous session can't be observed.
 */
export function resetTransient() {
  if (
    state.hoveredId === null &&
    state.tooltipId === null &&
    state.clickedId === null &&
    state.clickedAt === 0
  ) {
    return;
  }
  state.hoveredId = null;
  state.tooltipId = null;
  state.clickedId = null;
  state.clickedAt = 0;
  emit();
}

// setClickedId is now a no-op kept for forward-compat. The click-pin
// mechanism was removed because pinning active=1 for 800ms then yielding
// mid-scroll produced the visible 1 → 5 → 4 → 3 → 2 → 1 jump on long-
// distance clicks. Active highlighting now follows cachedCenterIndex
// naturally via the chat's onScroll events. The function still exists
// so any future feature that wants to remember "last clicked bar" can
// call it without needing to update the TimelineState shape.
export function setClickedId(_id: string | null) {
  // no-op
}

function emit() {
  for (const l of listeners) {
    try {
      l();
    } catch {
      // swallow
    }
  }
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
