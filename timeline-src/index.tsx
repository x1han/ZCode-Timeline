// timeline-src/index.tsx
// Entry point. Bundles everything into a single IIFE that exposes
//   window.__ZCODE_TIMELINE_MOUNT__ / __REFRESH__ / __SET_SELECTORS__
//   / __DIAGNOSE__
// on window for the launcher wrapper to call. No `ZCodeTimeline` global —
// see build.mjs (no globalName) for rationale.

import * as React from 'react';
// @ts-ignore — esbuild's text loader returns a string here.
import stylesCss from './styles.css';
import { mountPanel, unmountPanel } from './TimelinePanel';
import { collectMessages, refreshCustomSelectors, watchMessages } from './message-collector';
import { diagnose } from './dom-probe';
import { setMessages } from './store';

let styleEl: HTMLStyleElement | null = null;

function injectStyles() {
  // Idempotent across re-injections AND across concurrent bundle instances.
  // The launcher can re-inject the bundle at any moment (hot-reload, page
  // navigation), and we can end up with two bundles mounting concurrently
  // for a brief window. Each one would otherwise create its own <style>
  // tag. We always consolidate to a single tag here.
  for (const old of document.querySelectorAll('style[data-zcode-timeline]')) {
    if (old !== styleEl) old.remove();
  }
  if (!styleEl || !styleEl.isConnected) {
    styleEl = document.querySelector<HTMLStyleElement>('style[data-zcode-timeline]');
  }
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-zcode-timeline', '');
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = stylesCss;
}

let watcherHandle: { stop: () => void } | null = null;

function startWatcher() {
  if (watcherHandle) return;
  watcherHandle = watchMessages(() => {
    // store already updated via setMessages inside watchMessages
  });
}

function stopWatcher() {
  watcherHandle?.stop();
  watcherHandle = null;
}

function mount() {
  try {
    // Run initial collect BEFORE mounting, so the panel has content on first render.
    const anchors = collectMessages();
    setMessages(anchors);

    injectStyles();
    mountPanel();
    startWatcher();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[zcode-timeline] mount failed:', e);
  }
}

function unmount() {
  stopWatcher();
  unmountPanel();
  if (styleEl && styleEl.parentElement) {
    styleEl.parentElement.removeChild(styleEl);
  }
  styleEl = null;
}

function refresh() {
  // Idempotent re-mount. Safe to call any time; the single-instance guard
  // inside mountPanel will destroy the previous React tree first.
  mount();
}

function setCustomSelectors(selectors: string[]) {
  refreshCustomSelectors(selectors);
}

function runDiagnose() {
  const result = diagnose(document.body);
  // eslint-disable-next-line no-console
  console.log('[zcode-timeline] DOM diagnose:', result);
  return result;
}

const api = { mount, unmount, refresh, setCustomSelectors, diagnose };

// Public surface exposed to the launcher wrapper. No dev-only / test-only
// hooks leak through this surface; the previous __ZCODE_TIMELINE_TEST_HOVER__
// and __ZCODE_TIMELINE_SET_HOVER__ globals were removed because nothing
// production reads them and they exposed internal store mutation to any
// script in the page.
if (typeof window !== 'undefined') {
  (window as any).__ZCODE_TIMELINE_MOUNT__ = mount;
  (window as any).__ZCODE_TIMELINE_UNMOUNT__ = unmount;
  (window as any).__ZCODE_TIMELINE_REFRESH__ = refresh;
  (window as any).__ZCODE_TIMELINE_SET_SELECTORS__ = setCustomSelectors;
  (window as any).__ZCODE_TIMELINE_DIAGNOSE__ = runDiagnose;
}