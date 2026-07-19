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
    setPrimary(null);
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
    setPrimary(null);
    clearTooltipTimer();
    setTooltip(null);
  };

  // Cleanup timer on unmount.
  React.useEffect(() => clearTooltipTimer, []);

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
        onPick(anchor);
        scrollToAnchor(anchor);
        // A2: clicking a bar scrolls the page so the bar (and the mouse) moves
        // out from under the cursor. The browser does NOT fire mouseleave when
        // the element moves away — only when the mouse does. Clear tooltip
        // explicitly so it doesn't float over the new scroll position.
        setTooltip(null);
      }}
      aria-label={displayTitle}
    >
      <span className="zcode-timeline-bar-dot" />
    </button>
  );
};

export default Bar;