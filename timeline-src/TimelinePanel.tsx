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
import { getState, resetTransient, setHovered, setTooltipId, subscribe } from './store';
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

// Module-level timestamp updated by the chat scroll listener below. The
// Panel's auto-scroll useEffect gates on this to allow scrolling only while
// the chat is actively scrolling or a click-pin is active — so a user
// wheel-scroll away from the rail, followed by mouse-leave, doesn't snap
// the rail back to the active bar via the cachedCenterIndex fallback.
let lastChatScrollAt = 0;

// Window (ms) during which the chat's auto-scroll-to-bottom is allowed to
// fire without recomputing cachedCenterIndex away from the newly-typed
// message. After this window elapses, normal center-recompute resumes and
// the active bar will follow the user's manual chat scroll as usual.
// 1500ms is comfortably larger than ZCode's smooth-scroll animation
// duration (often < 300ms) and also longer than typical "user is reading
// what they just sent" attention span without committing to the new bar
// becoming the permanent "closest-to-viewport-center" message.
const TYPED_HOLD_MS = 1500;

// runCenterCompute uses PIN_HOLD_MS (exported from store.ts, 800ms by
// default) to gate cachedCenterIndex updates during the click → smooth-
// scroll → pin window. We deliberately do NOT keep a separate
// CLICK_HOLD_MS const here — the v1 design had a 400ms constant that
// drifted out of sync with the click-pin's 140ms pre-delay + ~260ms
// settle period, producing the "1 → 5 → 1" flicker (the gate expired
// before the pin landed). The fix: a single PIN_HOLD_MS governs both
// the click-pin window and the rail-freeze gate, so they can never
// drift again.

const Panel: React.FC<PanelProps> = ({ anchors, primaryIndex, setPrimary, setTooltip, onBarClick }) => {
  // Rail element ref — used by the useEffect below to scrollIntoView the
  // active bar so it stays visible on long sessions, AND by the chevron
  // useEffect to read scrollTop / clientHeight / scrollHeight for the
  // overflow indicators.
  const railRef = React.useRef<HTMLDivElement>(null);
  // Latest primaryIndex seen by the effect — captured in a ref so the RAF
  // callback reads the freshest value, not the closure's stale value.
  // Without this, a burst of primaryIndex changes would only scroll the
  // rail to the first one (the closure was created with that value); the
  // subsequent ones would all hit the "raf pending" bail and be lost.
  const primaryIndexRef = React.useRef<number | null>(null);
  // Coalesce rapid primaryIndex changes (e.g., fast chat scroll) into a
  // single scrollIntoView per animation frame so we don't queue multiple
  // scrolls.
  const railScrollRafRef = React.useRef<number | null>(null);
  // Overflow direction state — drives the ▲ / ▼ chevrons that hint at
  // rail content beyond the visible viewport. Refreshed by the listener
  // effect below; conditional render keeps chevrons out of the DOM when
  // there's nothing to indicate in a direction.
  const [overflowTop, setOverflowTop] = React.useState(false);
  const [overflowBottom, setOverflowBottom] = React.useState(false);
  React.useEffect(() => {
    primaryIndexRef.current = primaryIndex;
    if (primaryIndex == null || primaryIndex < 0) return;
    const rail = railRef.current;
    if (!rail) return;
    if (railScrollRafRef.current != null) return;
    railScrollRafRef.current = requestAnimationFrame(() => {
      railScrollRafRef.current = null;
      // Fresh state snapshot — between schedule and fire, hoveredId or
      // any other store field may have changed.
      const st = getState();
      const idx = primaryIndexRef.current;
      if (idx == null || idx < 0) return;
      // User-directive gate: do NOT auto-scroll the rail while the user
      // is hovering a bar. Hovering a higher bar would otherwise drag the
      // rail upward under the mouse, which feels jerky and serves no
      // purpose — the user can simply move the mouse to a different bar
      // to promote it, no rail motion required. Chat-scroll-driven and
      // click-pin-driven changes still pass through.
      if (st.hoveredId != null) return;
      // Click-pin freeze: when the user just clicked a bar, do NOT auto-
      // scroll the rail under any circumstances. The clicked bar was
      // already visible (otherwise they couldn't have clicked it), and
      // scrolling the rail under the user's cursor would move that bar
      // away from under the mouse — the browser fires mouseenter on the
      // bar that lands under the cursor, which steals primaryIndex away
      // mid-scroll. The chat's own smooth-scroll already telegraphs that
      // the click landed; the rail doesn't need to also scroll.
      // (No click-pin check here — the click-pin mechanism was removed
      // because pinning active for 800ms then yielding mid-scroll
      // produced the visible 1 → 5 → 4 → 3 → 2 → 1 jump on long-distance
      // clicks. Active now follows cachedCenterIndex naturally.)
      // (We deliberately keep scrolling the rail for hover and chat-
      // scroll-driven primaryIndex changes — only the manual hover-
      // mouse is protected by the next gate.)
      // Chat-scroll gate: only allow rail auto-scroll when the user is
      // genuinely scrolling the chat (lastChatScrollAt updated by the
      // chat scroll listener). This blocks hover-leave-driven
      // primaryIndex changes (which fall back to cachedCenterIndex) from
      // snapping the rail back to whatever the chat reports as primary,
      // preserving the user's manual wheel-scroll position. The 200ms
      // window is small enough that any genuine chat scroll keeps the
      // gate open (continuous scroll events refresh lastChatScrollAt),
      // and a mouse-leave immediately fails the gate when no chat
      // activity is happening.
      const recentChat = Date.now() - lastChatScrollAt < 200;
      if (!recentChat) return;
      const barEl = rail.querySelector<HTMLElement>(
        `.zcode-timeline-bar[data-tl-index="${idx}"]`,
      );
      if (!barEl) return;
      // Visibility gate (strict containment, no margin): if the active bar
      // is already fully inside the rail viewport, skip — running
      // scrollIntoView on a visible element is a redundant no-op that
      // would just consume a frame and could micro-jitter the rail. Only
      // scroll when the active bar is OUTSIDE the viewport (i.e., the
      // user has manually wheel-scrolled the rail away from the active).
      // getBoundingClientRect triggers layout, but RAF coalescing +
      // visibility-gate bailing makes this cheap in practice.
      const b = barEl.getBoundingClientRect();
      const r = rail.getBoundingClientRect();
      if (b.top >= r.top && b.bottom <= r.bottom) return;
      // behavior: 'instant' (not 'smooth'): the chat layer is already
      // running its own smooth scroll on click; running two parallel
      // smooth-scrolls at different scroll layers creates visual jank
      // and can outlast each other when rail scroll distance is large.
      // Instant makes the rail snap into place — the chat animation is
      // what the user perceives, and the rail follows without competing.
      // Both chat-scroll and click-pin paths use instant — keeping them
      // uniform avoids the smooth-vs-smooth overlap during clicks.
      barEl.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  }, [primaryIndex]);

  // Chevron overflow tracking. Listens for any scroll on the rail (user
  // wheel) and any resize of the rail (bars added / removed) and recomputes
  // the top/bottom overflow booleans. Equality-gated setState avoids
  // re-render churn when the boolean didn't actually change.
  React.useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const t = rail.scrollTop > 0;
      const b = rail.scrollTop + rail.clientHeight < rail.scrollHeight - 1;
      setOverflowTop((prev) => (prev === t ? prev : t));
      setOverflowBottom((prev) => (prev === b ? prev : b));
    };
    update();
    rail.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(rail);
    return () => {
      rail.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="zcode-timeline-rail-wrapper">
      {overflowTop && (
        <span
          className="zcode-timeline-chevron zcode-timeline-chevron--up"
          aria-hidden="true"
        >
          <svg viewBox="0 0 14 8" width="14" height="8">
            <polyline points="2,7 7,2 12,7" />
          </svg>
        </span>
      )}
      <div ref={railRef} className="zcode-timeline-rail">
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
      {overflowBottom && (
        <span
          className="zcode-timeline-chevron zcode-timeline-chevron--down"
          aria-hidden="true"
        >
          <svg viewBox="0 0 14 8" width="14" height="8">
            <polyline points="2,1 7,6 12,1" />
          </svg>
        </span>
      )}
    </div>
  );
};

interface ControllerState {
  messages: MessageAnchor[];
  hoveredId: string | null;
  tooltipId: string | null;
  clickedId: string | null;
  /** Mirror of TimelineState.clickedAt — captured at the same moment the
   *  store snapshot was taken. renderOnce uses this to decide whether
   *  the click-pin should take priority over hover (see priority block). */
  clickedAt: number;
}

interface TimelineInstance {
  root: Root;
  host: HTMLElement;
  cachedCenterIndex: number;
  /** Timestamp (ms epoch) at which the user last added a new user message.
   *  Used to suppress viewport-center recompute for a brief window after
   *  typing so ZCode's chat auto-scroll-to-bottom doesn't drag the active
   *  bar away from the newly-typed message. Cleared naturally by the
   *  Date.now() - lastTypedAt < TYPED_HOLD_MS check in runCenterCompute. */
  lastTypedAt: number;
  generation: number;
  unsubscribe: (() => void) | null;
  observers: {
    scroll: { target: HTMLElement; handler: () => void } | null;
    resize: { handler: () => void } | null;
    ro: ResizeObserver | null;
    /** Watches document.body for childList changes. When ZCode swaps the
     *  chat root (e.g., on conversation switch), the previously-bound
     *  scroll container becomes a detached node and scroll events on the
     *  new chat never reach onScroll. This observer fires rebind so the
     *  listener migrates to the fresh chat container. */
    chatRoot: MutationObserver | null;
  };
  destroy: () => void;
  /** Set true at the start of destroyInstance; every observer / render callback
   *  must check this before touching the instance. */
  dead?: boolean;
  /** Last messages-length we recomputed cachedCenterIndex for; if either
   *  the array reference or the length changes, we re-run computeCenterIndex
   *  so the active bar follows the new conversation (covers both
   *  length-changing switches and same-length switches where the anchors
   *  array is rebuilt with fresh DOM nodes). */
  lastMessagesLen: number;
  lastMessagesRef: MessageAnchor[];
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

// Stable callback refs. React sees the SAME function identity across renders
// so Bar's memoization (and any future React.memo() wrap) skips re-render
// for unchanged bars. These are thin wrappers around store setters.
const setPrimaryRef = (id: string | null) => setHovered(id);
const setTooltipRef = (id: string | null) => setTooltipId(id);
const noopPick = (_a: MessageAnchor) => { /* scroll handled inside Bar */ };

function computeCenterIndex(startFrom = -1): number {
  const { messages } = getState();
  if (!messages || messages.length === 0) return -1;
  const center = window.innerHeight / 2;
  // Cheap fast-path: if startFrom is valid, check whether the same message
  // is still the closest to viewport center. Most consecutive scroll events
  // satisfy this — only a large wheel-tick or a conversation jump moves the
  // active message. We bound the fast-path check to a small window so a
  // message that's drifted off-screen by half a viewport still falls back to
  // the full scan below.
  if (startFrom >= 0 && startFrom < messages.length) {
    const a = messages[startFrom];
    if (a.el && a.el.isConnected) {
      const r = a.el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - center);
      if (d < window.innerHeight / 2) return startFrom;
    }
  }
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
  // Priority: hover > cachedCenterIndex. The earlier v1/v2 designs
  // added a "clickedId pin" that hard-set primaryIndex to the clicked bar for
  // ~800ms; this LOOKED right but produced the visible 1 → 5 → 4 → 3 → 2 → 1
  // jump on long-distance clicks (pin held active=1 for 800ms then expired
  // MID-SCROLL, and cachedCenterIndex — which was on bar 5 because the chat
  // was still animating — took over). The fix: no click-pin at all. cachedCenterIndex
  // already tracks the chat's smooth-scroll position via onScroll events, so
  // the active highlight follows the chat naturally (10 → 9 → 8 → … → 1).
  // This protects against two flicker sources:
//   1. Rail scrollIntoView (caused by clicking a far bar) moving the clicked
//      bar away from under the mouse and firing mouseenter on the bar that
//      lands under the cursor.
//   2. The user's own mouse motion during the click animation (e.g., a
//      flick of the wrist after pressing the mouse button) firing
//      mouseenter on an adjacent bar mid-click.
//
// Priority cascade: hover > cachedCenterIndex. The earlier v1/v2 designs
// added a "clickedId pin" that hard-set primaryIndex to the clicked bar for
// ~800ms; this LOOKED right but produced the visible 1 → 5 → 4 → 3 → 2 → 1
// jump on long-distance clicks (pin held active=1 for 800ms then expired
// MID-SCROLL, and cachedCenterIndex — which was on bar 5 because the chat
// was still animating — took over). The fix: no click-pin at all. cachedCenterIndex
// already tracks the chat's smooth-scroll position via onScroll events, so
// the active highlight follows the chat naturally (10 → 9 → 8 → … → 1).
let primaryIndex: number;
if (hoveredIdx != null && hoveredIdx >= 0) primaryIndex = hoveredIdx;
else primaryIndex = instance.cachedCenterIndex;
  const tooltipIdx = state.tooltipId == null ? null : messages.findIndex((a) => a.id === state.tooltipId);
  const tooltipAnchor = tooltipIdx != null && tooltipIdx >= 0 ? messages[tooltipIdx] : null;

  root.render(
    <>
      <Panel
        anchors={messages}
        primaryIndex={primaryIndex >= 0 ? primaryIndex : null}
        setPrimary={setPrimaryRef}
        setTooltip={setTooltipRef}
        onBarClick={noopPick}
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
  // Coalesce multiple scroll events into one computeCenterIndex per frame.
  // Continuous wheel-scroll fires 30+ scroll events/sec; without RAF
  // coalescing we recomputed layout-thrashing getBoundingClientRect for
  // every message on every event. Now only the latest wins per frame.
  let centerRafPending = false;

  const runCenterCompute = () => {
    centerRafPending = false;
    if (instance.dead) return;
    // Hold after a freshly-typed message: chat's auto-scroll-to-bottom
    // fires a flurry of scroll events over the next ~200-500ms while the
    // scrollIntoView animates. Letting each one run computeCenterIndex
    // would peel cachedCenterIndex away from the newly-appended last bar
    // (which we snap to in the subscribe handler) and let some older
    // viewport-center message steal primary. Holding for a short window
    // keeps the active bar pinned to the just-typed message while the
    // user actually has a chance to see it highlighted.
    if (Date.now() - instance.lastTypedAt < TYPED_HOLD_MS) return;
    // (The previous "hold for PIN_HOLD_MS after a bar click so the
    // chat's smooth-scrollIntoView events don't jostle the highlight"
    // gate is removed along with the click-pin mechanism — without the
    // pin there's no jostle to prevent, and the active highlight now
    // follows the chat's scroll position naturally.)
    const centerIdx = computeCenterIndex(instance.cachedCenterIndex);

    // (No pin-clear logic here — the click-pin mechanism was removed.
    // cachedCenterIndex tracks the chat's actual scroll center via
    // the scroll events themselves, so renderOnce's priority cascade
    // (hover > cachedCenterIndex) gives the user a smooth 10 → 9 → 8
    // → … → 1 transition during the click → smooth-scroll animation.)
    // also cleared the pin on any scroll past 350ms — that path is gone.
    // With the snap below, primaryIndex falls through to
    // cachedCenterIndex (which was snapped to the clicked bar on pin
    // fire) so the active highlight stays on the clicked bar even after
    // pin yields.
    if (centerIdx !== instance.cachedCenterIndex && centerIdx >= 0) {
      instance.cachedCenterIndex = centerIdx;
      renderOnce(instance, getState());
    }
  };

  const onScroll = () => {
    lastChatScrollAt = Date.now();
    if (instance.dead) return;
    if (centerRafPending) return;
    centerRafPending = true;
    requestAnimationFrame(runCenterCompute);
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

// Always attach a MutationObserver on document.body for childList changes.
  // When ZCode swaps the chat root (e.g., on conversation switch), the
  // previously-bound scroll container becomes a detached node and scroll
  // events on the new chat never reach onScroll. This observer fires
  // rebind so the listener migrates to the fresh chat container. It
  // observes document.body with subtree:true so it catches descendants
  // being replaced deep inside ZCode's component tree (the chat is ~17
  // levels below body). The rebind work is idempotent and cheap (just a
  // querySelector + add/removeEventListener), so deeper subtree is fine.
  const chatRootObserver = new MutationObserver(() => {
    if (instance.dead) return;
    rebindScrollContainer();
  });
  chatRootObserver.observe(document.body, { childList: true, subtree: true });
  instance.observers.chatRoot = chatRootObserver;
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
  // 2. Detach scroll/RO/chat-root listeners.
  if (instance.observers.scroll) {
    try { instance.observers.scroll.target.removeEventListener('scroll', instance.observers.scroll.handler as any); } catch {}
  }
  if (instance.observers.ro) {
    try { instance.observers.ro.disconnect(); } catch {}
  }
  if (instance.observers.chatRoot) {
    try { instance.observers.chatRoot.disconnect(); } catch {}
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
  // 0. Clear transient UI state (hover / tooltip / click-pin) so a
  //    conversation switch doesn't carry over stale ids from the previous
  //    session. Reset BEFORE destroying the instance so the destruction
  //    emits (subscribe fires renderOnce, but that's harmless on a fresh
  //    empty state).
  resetTransient();

  // 0b. Reset the chat-scroll timestamp gate so the initial scrollIntoView
  //     on a fresh mount (e.g., a long-session conversation switch where
  //     the new active bar is below index 50) isn't blocked by a stale
  //     timestamp from the previous session. Without this, an off-viewport
  //     primary bar would render highlighted-but-invisible until the user
  //     wheels the chat again.
  lastChatScrollAt = Date.now();

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
    cachedCenterIndex: computeCenterIndex(),
    lastTypedAt: 0,
    generation: 0,
    unsubscribe: null,
    observers: { scroll: null, resize: null, ro: null, chatRoot: null },
    destroy: () => destroyInstance(instance),
    dead: false,
    lastMessagesLen: getState().messages.length,
    lastMessagesRef: getState().messages,
  };

  // 3. Wire up store subscription BEFORE first render.
  instance.unsubscribe = subscribe(() => {
    if (instance.dead || globalThis.__zcodeTimelineInstance__ !== instance) return;  // stale
    const st = getState();
    // Recompute cachedCenterIndex when the messages array REFERENCE or
    // LENGTH changes. The reference check matters for same-length
    // conversation switches (e.g., 200 -> 200 messages) where the anchors
    // array is rebuilt with fresh DOM nodes but the count happens to
    // match. Without the reference check, cachedCenterIndex would stay at
    // the old session's value and the active bar would lag. Gating on
    // either ref or length — not "always recompute" — avoids the layout
    // thrash of running computeCenterIndex on every hover/click event
    // (which fires subscribe for setHovered/setClickedId too).
    if (st.messages !== instance.lastMessagesRef || st.messages.length !== instance.lastMessagesLen) {
      const lenGrew = st.messages.length > instance.lastMessagesLen;
      instance.lastMessagesRef = st.messages;
      instance.lastMessagesLen = st.messages.length;
      if (lenGrew && st.messages.length > 0) {
        // The user just sent a new message — snap the active bar to the
        // newly-appended last entry instead of running a viewport-center
        // scan, which would land on whichever old message happens to be
        // closest to chat-viewport center while ZCode is auto-scrolling
        // the new message into view. Open a short hold window so the
        // upcoming chat auto-scroll events don't steal primary back.
        instance.cachedCenterIndex = st.messages.length - 1;
        instance.lastTypedAt = Date.now();
      } else {
        // Reference change with same-or-shrinking length (session
        // switch, streaming mutation, deletion) — fall back to full
        // viewport-center recompute.
        instance.cachedCenterIndex = computeCenterIndex();
      }
    }
    // (The previous "always-snap cachedCenterIndex = clickedIdx when
    // pin active" branch is removed along with the click-pin mechanism
    // itself — see the renderOnce priority cascade for the rationale.
    // cachedCenterIndex now follows the chat's smooth-scroll events
    // naturally via runCenterCompute; no override needed here.)
    renderOnce(instance, getState());
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