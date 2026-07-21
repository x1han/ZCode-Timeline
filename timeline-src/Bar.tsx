// timeline-src/Bar.tsx
// One horizontal bar per user message. Receives a `primaryIndex` (the bar
// currently focused — driven by mouse hover, immediately). Computes its
// distance from the primary and applies a "staircase" gradient: bars closer
// to primary get taller + darker.
//
// Hovering promotes the bar to PRIMARY IMMEDIATELY (drives the staircase
// highlight). Separately, the TOOLTIP only appears after HOVER_DELAY_MS of
// staying on the bar — quick fly-bys just trigger the highlight without a
// tooltip popup.

import * as React from 'react';
import { requestHoverClear, setHovered, setTooltipId } from './store';
import type { MessageAnchor } from './message-collector';
import { scrollToAnchor } from './scroll-to';

const HOVER_DELAY_MS = 500;

interface Props {
  anchor: MessageAnchor;
  index: number;
  primaryIndex: number | null;
  setPrimary: (id: string | null) => void;   // immediate on mouseenter
  setTooltip: (id: string | null) => void;   // after HOVER_DELAY_MS
  onPick: (anchor: MessageAnchor) => void;
}

const Bar: React.FC<Props> = ({ anchor, index, primaryIndex, setPrimary, setTooltip, onPick }) => {
  const tooltipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const titleText = (anchor.text || '(empty message)').replace(/\s+/g, ' ');
  const displayTitle = titleText.length > 80 ? `${titleText.slice(0, 80)}…` : titleText;

  const distance = primaryIndex == null ? Infinity : Math.abs(index - primaryIndex);

  const classes = ['zcode-timeline-bar'];
  if (primaryIndex != null && distance === 0) classes.push('is-primary');
  else if (distance === 1) classes.push('is-near-1');
  else if (distance === 2) classes.push('is-near-2');

  const clearTooltipTimer = () => {
    if (tooltipTimerRef.current != null) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
  };

  const onMouseEnter = () => {
    // Promote to primary IMMEDIATELY so the staircase follows the mouse.
    setPrimary(anchor.id);
    // Schedule the tooltip separately (after HOVER_DELAY_MS).
    clearTooltipTimer();
    tooltipTimerRef.current = setTimeout(() => {
      tooltipTimerRef.current = null;
      setTooltip(anchor.id);
    }, HOVER_DELAY_MS);
  };

  const onMouseLeave = () => {
    // Debounced clear of the hover-driven primary. The previous
    // immediate setPrimary(null) made the active highlight snap back
    // to cachedCenterIndex mid-decision: when the user moved the cursor
    // across the gap between two bars, every brief mouse-out cancelled
    // the hover immediately. requestHoverClear schedules the clear
    // after 200ms; if the cursor re-enters this bar or any other bar
    // within that window, setHovered() (called from onMouseEnter)
    // cancels the pending clear so the active highlight stays put.
    requestHoverClear(anchor.id);
    clearTooltipTimer();
    setTooltip(null);
  };

  const onFocus = () => {
    setPrimary(anchor.id);
    clearTooltipTimer();
    tooltipTimerRef.current = setTimeout(() => {
      tooltipTimerRef.current = null;
      setTooltip(anchor.id);
    }, HOVER_DELAY_MS);
  };

  const onBlur = () => {
    // Keyboard blur clears immediately — no debounce. A tab-focused
    // bar that loses focus doesn't have a cursor that could "re-enter"
    // within the 200ms debounce window, so the delay would just feel
    // sluggish without buying anything.
    setPrimary(null);
    clearTooltipTimer();
    setTooltip(null);
  };

  // Cleanup tooltip timer on unmount. The click-pin timer is owned by
  // store.ts (centralized so rapid cross-bar clicks don't have stale
  // per-instance timers clearing each other's pins), so we don't touch
  // it here.
  React.useEffect(() => {
    return () => {
      clearTooltipTimer();
    };
  }, []);

  return (
    <button
      className={classes.join(' ')}
      data-tl-id={anchor.id}
      data-tl-index={index}
      data-tl-distance={distance}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={(e) => {
        e.preventDefault();

        // Drop hover-primary so the priority cascade falls through to
        // cachedCenterIndex. We deliberately do NOT set a click-pin here.
        // Two earlier designs tried it and both produced visible jumps:
        //   v1 "pin for PIN_HOLD_MS then yield" — pin held active=1 for
        //     800ms, expired MID-SCROLL, cachedCenterIndex (on bar 5
        //     because the chat was still mid-animation) took over, so
        //     the highlight jumped from 1 → 5 and tracked the rest of
        //     the scroll (10 → 9 → 8 → … → 1 looks fine, but 1 → 5 is
        //     the jarring one).
        //   v2 "click-pin forever, released only by TYPED_HOLD_MS gate"
        //     — same problem; the 1.5s gate made it impossible to
        //     wheel-scroll away from the pinned bar.
        // Current design has no pin at all and no time gate. Active
        // follows cachedCenterIndex naturally during the smooth-scroll,
        // and computeCenterIndex's boundary clamp pins the result to
        // 0/length-1 when the chat's scrollTop hits an extreme — so
        // clicking bar 1 ends with active=1 (not some middle bar) and
        // clicking bar N ends with active=N. The smooth 10 → 9 → 8
        // → … → 1 transition happens because cachedCenterIndex tracks
        // the scroll events frame-by-frame, not because of a pin.
        setHovered(null);

        onPick(anchor);

        // Scroll the target prompt to viewport vertical center. If the
        // clicked anchor's element was detached (ZCode just swapped
        // placeholder → finalized DOM for a fresh prompt), scrollToAnchor
        // refreshes via collectMessages and resolves to the element at
        // the same index, falling back to id-lookup, falling back to
        // last-anchor only when the original click was the last bar.
        // Without this, the "user just sent a prompt → new bar appears
        // at bottom → click does nothing" bug (Bug B) recurs.
        scrollToAnchor(anchor, index);

        // Clicking a bar scrolls the page so the bar (and the mouse) move
        // out from under the cursor. The browser does NOT fire mouseleave
        // when the element moves away — only when the mouse does — so we
        // clear tooltip explicitly to avoid it floating over the new pos.
        setTooltip(null);
      }}
      aria-label={displayTitle}
    >
      <span className="zcode-timeline-bar-dot" />
    </button>
  );
};

export default Bar;