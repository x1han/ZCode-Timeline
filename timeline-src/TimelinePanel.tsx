// timeline-src/TimelinePanel.tsx
// Fixed panel on the left side of the chat viewport. One bar per user message.
// All mount state lives in a single `TimelineInstance` object stored on
// globalThis, so multiple bundle injections can't keep duplicate React trees
// alive — each mount destroys the previous instance entirely.
//
// Active (primary) bar:
//   - When hovering: the hovered bar (immediately on mouseenter)
//   - When NOT hovering: the bar closest to the chat viewport center
//
// Tooltip: hover-only, after HOVER_DELAY_MS (default 500ms).

import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { getState, setHovered, setTooltipId, subscribe } from './store';
import type { MessageAnchor } from './message-collector';
import Bar from './Bar';
import Tooltip from './Tooltip';

interface PanelProps {
  anchors: MessageAnchor[];
  primaryIndex: number | null;
  setPrimary: (id: string | null) => void;
  setTooltip: (id: string | null) => void;
  onBarClick: (a: MessageAnchor) => void;
}

const Panel: React.FC<PanelProps> = ({ anchors, primaryIndex, setPrimary, setTooltip, onBarClick }) => {
  return (
    <div className="zcode-timeline-rail">
      {anchors.map((a, i) => (
        <Bar
          key={a.id}
          anchor={a}
          index={i}
          primaryIndex={primaryIndex}
          setPrimary={setPrimary}
          setTooltip={setTooltip}
          onPick={onBarClick}
        />
      ))}
    </div>
  );
};

interface ControllerState {
  messages: MessageAnchor[];
  hoveredId: string | null;
  tooltipId: string | null;
}

interface TimelineInstance {
  root: Root;
  host: HTMLElement;
  scrollContainer: HTMLElement | null;
  cachedCenterIndex: number;
  generation: number;
  unsubscribe: (() => void) | null;
  observers: {
    scroll: { target: HTMLElement; handler: () => void } | null;
    resize: { handler: () => void } | null;
    ro: ResizeObserver | null;
  };
  destroy: () => void;
  /** Set true at the start of destroyInstance; every observer / render callback
   *  must check this before touching the instance. */
  dead?: boolean;
  /** Last messages-length we recomputed cachedCenterIndex for; if it changes,
   *  we re-run computeCenterIndex so the active bar follows new messages. */
  lastMessagesLen?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __zcodeTimelineInstance__: TimelineInstance | null | undefined;
}

function findChatContainer(): HTMLElement | null {
  const candidates = [
    ...document.querySelectorAll<HTMLElement>('.h-full.overflow-y-auto'),
    ...document.querySelectorAll<HTMLElement>('[data-chat-scroll]'),
  ];
  for (const c of candidates) {
    if (c.clientHeight > 200 && (c.scrollHeight > c.clientHeight + 50 || c.scrollTop > 0)) {
      return c;
    }
  }
  return candidates[0] ?? null;
}

function computeCenterIndex(): number {
  const { messages } = getState();
  if (!messages || messages.length === 0) return -1;
  const center = window.innerHeight / 2;
  let bestIndex = -1;
  let bestDist = Infinity;
  for (let i = 0; i < messages.length; i++) {
    const a = messages[i];
    if (!a.el || !a.el.isConnected) continue;
    const r = a.el.getBoundingClientRect();
    const elMid = r.top + r.height / 2;
    const d = Math.abs(elMid - center);
    if (d < bestDist) {
      bestDist = d;
      bestIndex = i;
    }
  }
  return bestIndex;
}

function renderOnce(instance: TimelineInstance, state: ControllerState) {
  if (instance.dead || globalThis.__zcodeTimelineInstance__ !== instance) return;  // stale
  const { root, host } = instance;
  if (!host || !root) return;

  const messages: MessageAnchor[] = state.messages ?? [];
  const hoveredIdx = state.hoveredId == null ? null : messages.findIndex((a) => a.id === state.hoveredId);
  const primaryIndex = hoveredIdx != null && hoveredIdx >= 0 ? hoveredIdx : instance.cachedCenterIndex;
  const tooltipIdx = state.tooltipId == null ? null : messages.findIndex((a) => a.id === state.tooltipId);
  const tooltipAnchor = tooltipIdx != null && tooltipIdx >= 0 ? messages[tooltipIdx] : null;

  root.render(
    <>
      <Panel
        anchors={messages}
        primaryIndex={primaryIndex >= 0 ? primaryIndex : null}
        setPrimary={(id) => setHovered(id)}
        setTooltip={(id) => setTooltipId(id)}
        onBarClick={() => {/* scroll handled inside Bar */}}
      />
      <Tooltip
        anchor={tooltipAnchor}
        index={tooltipIdx ?? 0}
        total={messages.length}
      />
    </>
  );
}

function attachScrollObservers(instance: TimelineInstance) {
  const onScroll = () => {
    if (instance.dead) return;
    // Skip if hovered (hover wins).
    const st = getState();
    if (st.hoveredId != null) return;
    const centerIdx = computeCenterIndex();
    if (centerIdx !== instance.cachedCenterIndex && centerIdx >= 0) {
      instance.cachedCenterIndex = centerIdx;
      renderOnce(instance, st);
    }
  };

  // rebindScrollContainer (A4): if the previously-bound container is gone
  // (e.g. ZCode switched conversations and unmounted/remounted the chat
  // container) or if the previous bind failed (returned null), re-resolve on
  // every observer tick and rebind when the container reference changes.
  let boundContainer: HTMLElement | null = null;
  const rebindScrollContainer = (): HTMLElement | null => {
    if (instance.dead) return null;
    const fresh = findChatContainer();
    if (fresh !== boundContainer) {
      // detach old
      if (boundContainer && instance.observers.scroll) {
        try { boundContainer.removeEventListener('scroll', instance.observers.scroll.handler as any); } catch {}
      }
      if (fresh) {
        fresh.addEventListener('scroll', onScroll, { passive: true });
        instance.observers.scroll = { target: fresh, handler: onScroll as any };
      } else {
        instance.observers.scroll = null;
      }
      boundContainer = fresh;
      instance.scrollContainer = fresh;
    }
    return fresh;
  };

  // Initial bind (may be null if no chat container yet — will retry on tick).
  rebindScrollContainer();

  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      if (instance.dead || globalThis.__zcodeTimelineInstance__ !== instance) return;
      const chat = rebindScrollContainer() ?? findChatContainer();
      if (chat) {
        const r = chat.getBoundingClientRect();
        try {
          instance.host.style.left = `${Math.max(0, Math.round(r.left)) + 4}px`;
        } catch {}
      }
      onScroll();
    });
    ro.observe(document.body);
    instance.observers.ro = ro;
  }

  // Always attach a window scroll/resize fallback. Some chat containers
  // bubble scroll up to window, and even when they don't, the resize handler
  // covers window changes that affect cachedCenterIndex (e.g. devtools
  // toggling, theme switching, browser zoom).
  const onResize = () => { rebindScrollContainer(); onScroll(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  instance.observers.resize = { handler: onResize };
}

function createHost(): HTMLElement {
  // Defensive: any previous hosts must be gone (instance destroy handled it).
  document.querySelectorAll('.zcode-timeline-host').forEach((el) => el.remove());
  document.querySelectorAll('.zcode-timeline-tooltip').forEach((el) => el.remove());

  const el = document.createElement('div');
  el.className = 'zcode-timeline-host';
  document.body.appendChild(el);

  const chat = findChatContainer();
  if (chat) {
    const r = chat.getBoundingClientRect();
    el.style.left = `${Math.max(0, Math.round(r.left)) + 4}px`;
  }
  return el;
}

function destroyInstance(instance: TimelineInstance) {
  // 0. Mark this instance as dead so no more renders happen and other callbacks bail out.
  instance.dead = true;
  if (globalThis.__zcodeTimelineInstance__ === instance) {
    globalThis.__zcodeTimelineInstance__ = null;
  }
  // 1. Unsubscribe from store.
  if (instance.unsubscribe) {
    try { instance.unsubscribe(); } catch {}
  }
  // 2. Detach scroll/resize/RO listeners.
  if (instance.observers.scroll) {
    try { instance.observers.scroll.target.removeEventListener('scroll', instance.observers.scroll.handler as any); } catch {}
  }
  if (instance.observers.resize) {
    try { window.removeEventListener('resize', instance.observers.resize.handler as any); } catch {}
  }
  if (instance.observers.ro) {
    try { instance.observers.ro.disconnect(); } catch {}
  }
  // 3. Unmount React tree and remove host. After unmount, also remove any
  //    orphan Tooltip portal divs that React created in document.body.
  try { instance.root.unmount(); } catch {}
  if (instance.host.parentElement) {
    try { instance.host.parentElement.removeChild(instance.host); } catch {}
  }
  // 4. Defensive: even if the portal survived React unmount for any reason,
  //    sweep it. createHost() also does this when a fresh host is built, but
  //    a destroy-without-remount path would otherwise leave a dangling node.
  for (const el of document.querySelectorAll('.zcode-timeline-tooltip')) {
    try { el.remove(); } catch {}
  }
}

export function mountPanel() {
  // 1. Destroy any previous instance (regardless of which bundle created it).
  if (globalThis.__zcodeTimelineInstance__) {
    destroyInstance(globalThis.__zcodeTimelineInstance__);
  }

  // 2. Create new instance.
  const host = createHost();
  let root: Root;
  try {
    root = createRoot(host);
  } catch (e) {
    console.error('[zcode-timeline] createRoot failed:', e);
    host.remove();
    return;
  }

  const instance: TimelineInstance = {
    root,
    host,
    scrollContainer: null,
    cachedCenterIndex: computeCenterIndex(),
    generation: 0,
    unsubscribe: null,
    observers: { scroll: null, resize: null, ro: null },
    destroy: () => destroyInstance(instance),
    dead: false,
    lastMessagesLen: getState().messages.length,
  };

  // 3. Wire up store subscription BEFORE first render.
  instance.unsubscribe = subscribe(() => {
    if (instance.dead || globalThis.__zcodeTimelineInstance__ !== instance) return;  // stale
    const st = getState();
    // A5: when the number of messages changes, the previous cachedCenterIndex
    // can no longer point at the bar closest to viewport center. Recompute.
    if (st.messages.length !== instance.lastMessagesLen) {
      instance.lastMessagesLen = st.messages.length;
      instance.cachedCenterIndex = computeCenterIndex();
    }
    renderOnce(instance, st);
  });

  // 4. Attach scroll/resize/RO observers.
  attachScrollObservers(instance);

  // 5. Publish instance to globalThis BEFORE first render — so the
  //    render check (`instance === globalThis.__zcodeTimelineInstance__`)
  //    passes for our own first render.
  globalThis.__zcodeTimelineInstance__ = instance;

  // 6. Initial render.
  const state = getState();
  renderOnce(instance, {
    messages: state.messages,
    hoveredId: state.hoveredId,
    tooltipId: state.tooltipId,
  });
}

export function unmountPanel() {
  if (globalThis.__zcodeTimelineInstance__) {
    destroyInstance(globalThis.__zcodeTimelineInstance__);
  }
}