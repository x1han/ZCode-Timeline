// launcher/cdp.mjs
// Thin CDP wrapper around chrome-remote-interface.
// - waits for a non-splash `page` target on the given port
// - attaches
// - enables the typical domains
// - exposes safe helpers and an eventing surface

import CDP from 'chrome-remote-interface';
import { setTimeout as delay } from 'node:timers/promises';

const HOST = '127.0.0.1';

// Port list tried when waitForZCodeTarget() is called without an explicit
// `ports` argument. The first entry is the env-overridable default so that
// users who set ZCODE_TIMELINE_PORT get matched against their actual port.
const ENV_PORT = Number(process.env.ZCODE_TIMELINE_PORT) || 9229;
const DEFAULT_PORTS = [
  ENV_PORT,
  ...[9229, 9222, 9223, 9224, 9225].filter((p) => p !== ENV_PORT),
];

async function fetchTargets(port) {
  const res = await fetch(`http://${HOST}:${port}/json/list`, {
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error(`/json/list -> ${res.status}`);
  return res.json();
}

async function fetchVersion(port) {
  try {
    const res = await fetch(`http://${HOST}:${port}/json/version`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Poll for a ZCode page target. B7: probe all candidate ports in parallel
 * so we don't spend 10s serially timing-out before reaching the live one.
 */
export async function waitForZCodeTarget({ ports = DEFAULT_PORTS, timeoutMs = 60000 } = {}) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    // Parallel version probe across all ports.
    const versions = await Promise.all(ports.map((p) => fetchVersion(p)));
    for (let i = 0; i < ports.length; i++) {
      const port = ports[i];
      const version = versions[i];
      if (!version) continue;

      let targets;
      try {
        targets = await fetchTargets(port);
      } catch {
        continue;
      }

      const target =
        targets.find(
          (t) =>
            t.type === 'page' &&
            t.webSocketDebuggerUrl &&
            !t.url.startsWith('devtools://')
        ) || null;

      if (target) {
        return { port, target, version, targets };
      }
    }

    await delay(500);
  }

  // Final fallback: try one more /json/list scan to give diagnostics.
  const lastScanned = [];
  for (const port of ports) {
    try {
      const tgts = await fetchTargets(port);
      lastScanned.push({ port, count: tgts.length, sample: tgts.slice(0, 3).map((t) => ({ type: t.type, url: t.url })) });
    } catch {
      lastScanned.push({ port, error: true });
    }
  }
  const err = new Error(
    'Timed out waiting for ZCode page target on CDP.\n' +
      `Ports tried: ${ports.join(', ')}.\n` +
      `Last scan: ${JSON.stringify(lastScanned, null, 2)}`
  );
  err.code = 'CDP_TARGET_TIMEOUT';
  throw err;
}

export async function attach({ port, target, onDisconnect, log }) {
  // Prefer the modern webSocketDebuggerUrl field over `target.id` — the id
  // can be rotated by Chromium across reloads even within one process.
  const client = await CDP({
    host: HOST,
    port,
    target: target.webSocketDebuggerUrl ?? target.id,
  });
  const { Page, Runtime, DOM, CSS, Network } = client;

  await Promise.all([Page.enable(), Runtime.enable(), DOM.enable(), CSS.enable(), Network.enable()]);

  // B9: CSP bypass isn't supported on every Chromium version. Surface the
  // failure so the caller knows bundle injection may be silently blocked
  // by a strict CSP on the page.
  try {
    await Page.setBypassCSP({ enabled: true });
  } catch (e) {
    if (log) log('CDP setBypassCSP unsupported; bundle injection may fail under strict CSP:', e.message);
  }

  client.on('disconnect', () => onDisconnect && onDisconnect());
  return {
    client,
    Page,
    Runtime,
    DOM,
    CSS,
    Network,
    targetId: target.id,
    url: target.url,
  };
}

export async function evaluate({ Runtime, expression, awaitPromise = true, returnByValue = true }) {
  const result = await Runtime.evaluate({
    expression,
    awaitPromise,
    returnByValue,
    allowUnsafeEvalBlockedByCSP: true,
  });
  if (result.exceptionDetails) {
    const e = new Error(
      `Runtime.evaluate threw: ${result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'unknown'}\n` +
        `expression: ${expression.slice(0, 200)}`
    );
    e.exceptionDetails = result.exceptionDetails;
    throw e;
  }
  return result.result?.value;
}

export async function addScriptOnNewDocument({ Page, source }) {
  return Page.addScriptToEvaluateOnNewDocument({ source });
}