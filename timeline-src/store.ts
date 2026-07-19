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
  scrollContainer: HTMLElement | null;
}

const state: TimelineState = {
  messages: [],
  hoveredId: null,
  tooltipId: null,
  scrollContainer: null,
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

export function setTooltipId(id: string | null) {
  if (state.tooltipId === id) return;
  state.tooltipId = id;
  emit();
}

export function setScrollContainer(el: HTMLElement | null) {
  state.scrollContainer = el;
  emit();
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
