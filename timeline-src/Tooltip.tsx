// timeline-src/Tooltip.tsx
// Hover tooltip — shows a short thumbnail of the user message (first 100
// characters). Rendered via React Portal into document.body so its
// `position: fixed` is anchored to the viewport (the host has a transform
// which would otherwise create a new containing block).

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { MessageAnchor } from './message-collector';

interface Props {
  anchor: MessageAnchor | null;
  index: number;
  total: number;
}

const MAX_CHARS = 100;
const EDGE_PAD = 8;          // min distance from viewport edge
const TOOLTIP_W = 280;       // matches styles.css .zcode-timeline-tooltip
const TOOLTIP_H_EST = 40;    // rough estimate; only used for vertical clamp

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const Tooltip: React.FC<Props> = ({ anchor }) => {
  const rawText = anchor?.text ?? '';
  if (!anchor || !rawText) return null;

  const collapsed = rawText.replace(/\s+/g, ' ').trim();
  const truncated = collapsed.length > MAX_CHARS
    ? collapsed.slice(0, MAX_CHARS) + '…'
    : collapsed;

  // Read the corresponding bar's viewport coords directly. We use querySelector
  // here (rather than passing refs down through Panel) because the tooltip is
  // portaled out of the host tree and is the only consumer of this geometry.
  // The selector itself uses CSS.escape to safely handle id strings with
  // punctuation / unicode.
  let topPx: number | null = null;
  let leftPx: number | null = null;

  const barEl = anchor.id
    ? document.querySelector<HTMLElement>(`.zcode-timeline-bar[data-tl-id="${CSS.escape(anchor.id)}"]`)
    : null;
  if (barEl) {
    const barRect = barEl.getBoundingClientRect();
    topPx = barRect.top + barRect.height / 2;
  }

  const railEl = document.querySelector<HTMLElement>('.zcode-timeline-rail');
  if (railEl) {
    const railRect = railEl.getBoundingClientRect();
    leftPx = railRect.right + EDGE_PAD;
  }

  // A9: clamp to viewport so the tooltip never runs off-screen. Even though
  // the bar should be inside the viewport, the tooltip itself extends 280px
  // to the right and ~40px tall; on narrow viewports or when the chat is
  // pinned to the right edge this matters.
  if (leftPx != null) {
    const maxLeft = window.innerWidth - TOOLTIP_W - EDGE_PAD;
    leftPx = clamp(leftPx, EDGE_PAD, maxLeft);
  }
  if (topPx != null) {
    topPx = clamp(topPx, EDGE_PAD + TOOLTIP_H_EST / 2, window.innerHeight - EDGE_PAD - TOOLTIP_H_EST / 2);
  }

  const style: React.CSSProperties = {
    left: leftPx != null ? `${leftPx}px` : '56px',
    top: topPx != null ? `${topPx}px` : '50%',
    transform: 'translateY(-50%)',
  };

  return createPortal(
    <div className="zcode-timeline-tooltip" style={style}>
      {truncated}
    </div>,
    document.body
  );
};

export default Tooltip;