// launcher/launcher.mjs
// 1. Patch ZCode's app.asar to open --remote-debugging-port=9229 (idempotent,
//    auto-reapplies after upgrades).
// 2. Connect to that CDP endpoint (uses whatever ZCode instance has port 9229
//    bound; spawns a fresh ZCode if none does — without killing the user's
//    existing instances).
// 3. Inject the Timeline bundle and keep it alive with heartbeat + reconnect.

import { spawn, execSync } from 'node:child_process';
import { readFileSync, existsSync, watch as fsWatch } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { findZCodeExe } from './zcode-finder.mjs';
import { ensurePatched } from './asar-patcher.mjs';
import { waitForZCodeTarget, attach, evaluate, addScriptOnNewDocument } from './cdp.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DIST_FILE = resolve(PROJECT_ROOT, 'dist', 'timeline.iife.js');

const READY_MARKER_JS = `(() => !!document.querySelector('.zcode-timeline-rail'))()`;

// B6: honor the same env var the asar patcher writes into ZCode's main.
// Without this, launcher.mjs would always probe 9229 even when the user
// configured ZCode to use a different remote-debugging-port.
const CDP_PORT = Number(process.env.ZCODE_TIMELINE_PORT) || 9229;

function log(...args) {
  const ts = new Date().toISOString().slice(11, 23);
  // eslint-disable-next-line no-console
  console.log(`[${ts}]`, ...args);
}
function err(...args) {
  const ts = new Date().toISOString().slice(11, 23);
  // eslint-disable-next-line no-console
  console.error(`[${ts}]`, ...args);
}

function readBundle() {
  // D2: even though build.mjs now writes via renameSync (atomic on the same
  // volume), the launcher's fsWatch may still fire in a window where the
  // file is briefly missing or truncated on certain Windows filesystems.
  // Retry a few times before giving up.
  const MAX_ATTEMPTS = 5;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (!existsSync(DIST_FILE)) {
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `Bundle not found at ${DIST_FILE} after ${MAX_ATTEMPTS} attempts.\n` +
            `Run "npm run build" first.`
        );
      }
      // busy-wait briefly (sync sleep)
      const until = Date.now() + 50;
      while (Date.now() < until) {}
      continue;
    }
    try {
      const buf = readFileSync(DIST_FILE, 'utf8');
      if (buf.length === 0) throw new Error('empty bundle');
      return buf;
    } catch (e) {
      if (attempt === MAX_ATTEMPTS) throw e;
      const until = Date.now() + 50;
      while (Date.now() < until) {}
    }
  }
  throw new Error('unreachable');
}

function makeWrappedSource(bundleJs) {
  // C1: bundle attaches the public API on window directly (see
  // timeline-src/index.tsx). The IIFE wrapper just executes the bundle and
  // then calls the mount hook it exposed. We don't reference any extra
  // "globalName" here — that was a leftover from an earlier design and was
  // overwritten by index.tsx anyway.
  return `
;(function () {
  if (window.top !== window) return;            // skip iframes (CDP may run in sub-frames)
  try {
    ${bundleJs}
    // Mount after the bundle has exposed globals. mount() is idempotent.
    if (typeof window.__ZCODE_TIMELINE_MOUNT__ === 'function') {
      window.__ZCODE_TIMELINE_LOADED__ = true;
      window.__ZCODE_TIMELINE_MOUNT__();
    }
  } catch (e) {
    console.error('[zcode-timeline] mount failed:', e);
  }
})();
`.trim();
}

async function probePort9229() {
  // Read /json/version quickly. Returns null if no CDP endpoint is up.
  try {
    const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function listRunningZCodePids() {
  try {
    const out = execSync(
      `powershell -NoProfile -Command "(Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id) -join ','"`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true, timeout: 5000 }
    ).trim();
    if (!out) return [];
    return out.split(',').map((s) => Number(s)).filter(Boolean);
  } catch {
    return [];
  }
}

async function spawnFreshZCode(exePath) {
  log(`Spawning fresh ZCode (because port ${CDP_PORT} has no CDP endpoint):`, exePath);
  // We pass --remote-debugging-port explicitly; even though the patched main
  // process also appends it, passing the same flag is harmless.
  const child = spawn(exePath, [`--remote-debugging-port=${CDP_PORT}`], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
  child.on('exit', (code) => log('Fresh ZCode exited with code', code));
  return child;
}

async function inject(ctx, source) {
  await evaluate({
    Runtime: ctx.Runtime,
    expression: source,
    awaitPromise: true,
    returnByValue: false,
  });
  await addScriptOnNewDocument({ Page: ctx.Page, source });
}

async function waitForMount(ctx, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const present = await evaluate({
        Runtime: ctx.Runtime,
        expression: READY_MARKER_JS,
        awaitPromise: false,
        returnByValue: true,
      });
      if (present) return true;
    } catch {
      // ignore
    }
    await delay(500);
  }
  return false;
}

async function sessionLoop() {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      log('Waiting for CDP target...');
      const { port, target } = await waitForZCodeTarget({});
      log(`Attaching to target ${target.id} via port ${port} (${target.url})`);

      const ctx = await attach({
        port,
        target,
        onDisconnect: () => log('CDP client disconnected'),
        log,
      });

      attempt = 0;
      log('CDP attached. Injecting timeline bundle...');

      const source = makeWrappedSource(readBundle());
      await inject(ctx, source);

      const mounted = await waitForMount(ctx);
      log(mounted ? 'Timeline mounted successfully.' : 'Timeline inject sent (mount marker not yet seen).');

      // B5: heartbeat tracks consecutive failures so we don't log-spam if the
      // CDP Runtime is permanently dead. After HEARTBEAT_MAX_FAILS, we stop
      // the interval and force the outer loop to re-attach by triggering
      // client.close() — which fires the disconnect handler below.
      const HEARTBEAT_MAX_FAILS = 5;
      let heartbeatFails = 0;
      const heartbeat = setInterval(async () => {
        try {
          const present = await evaluate({
            Runtime: ctx.Runtime,
            expression: READY_MARKER_JS,
            awaitPromise: false,
            returnByValue: true,
          });
          heartbeatFails = 0;
          if (!present) {
            log('Marker vanished, reinjecting...');
            const fresh = makeWrappedSource(readBundle());
            await inject(ctx, fresh);
          }
        } catch (e) {
          heartbeatFails += 1;
          log(`Heartbeat error (${heartbeatFails}/${HEARTBEAT_MAX_FAILS}):`, e.message);
          if (heartbeatFails >= HEARTBEAT_MAX_FAILS) {
            log('Heartbeat failing repeatedly; forcing client close to re-attach.');
            try { ctx.client.close(); } catch {}
          }
        }
      }, 3000);

      let lastBundle = readBundle();
      const watcher = existsSync(DIST_FILE)
        ? fsWatch(DIST_FILE, async () => {
            try {
              const next = readBundle();
              if (next === lastBundle) return;
              lastBundle = next;
              log('Bundle changed on disk; reinjecting.');
              await inject(ctx, makeWrappedSource(next));
            } catch (e) {
              log('Bundle reload failed:', e.message);
            }
          })
        : null;

      // B4: race the disconnect event against a hard timeout. If the client
      // closes without firing `disconnect` (rare but observed on Windows
      // when the parent target dies), this unblocks the outer loop so we
      // can re-attach. 60s is generous: a healthy session never trips it,
      // but it keeps the launcher from hanging forever after a zombie.
      await new Promise((resolveWait) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearInterval(heartbeat);
          if (watcher) watcher.close();
          resolveWait();
        };
        ctx.client.on('disconnect', finish);
        setTimeout(() => {
          if (!settled) {
            log('Disconnect not received within 60s; forcing re-attach.');
            finish();
          }
        }, 60_000).unref();
      });

      log('CDP disconnected; will re-attach when CDP is back.');
      await delay(1500);
    } catch (e) {
      attempt += 1;
      const wait = Math.min(30000, 1000 * Math.pow(2, Math.min(attempt, 5)));
      err('Session error:', e.message, `- retrying in ${wait}ms`);
      await delay(wait);
    }
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const probeOnly = argv.includes('--probe');
  const skipPatch = argv.includes('--no-patch');

  // 1. Find ZCode
  let exeInfo;
  try {
    exeInfo = findZCodeExe();
  } catch (e) {
    err(e.message);
    process.exit(1);
  }
  log(`ZCode found at: ${exeInfo.exePath} (source=${exeInfo.source})`);

  // 2. Patch asar (unless --no-patch or --probe)
  if (!skipPatch) {
    try {
      const r = await ensurePatched({ zcodeExePath: exeInfo.exePath, onLog: log });
      log(`[asar] status=${r.status}${r.reason ? ' reason=' + r.reason : ''}`);
      if (r.backupPath) log(`[asar] backup of original: ${r.backupPath}`);
      if (typeof r.backupsPruned === 'number' && r.backupsPruned > 0) {
        log(`[asar] pruned ${r.backupsPruned} old backup(s); ${r.backupsKept} kept`);
      }
    } catch (e) {
      err('asar patch failed:', e.message);
      err('  (continuing without patch — make sure you can rebuild with --no-patch if needed)');
    }
  }

  // 3. Probe port 9229. If up, attach directly. If not, spawn a fresh ZCode.
  let existingVersion = await probePort9229();
  if (existingVersion) {
    log('Port 9229 already responds (CDP endpoint up). Attaching to current ZCode.');
  } else {
    // Do NOT kill existing instances. Spawn a new one and wait for it to bind 9229.
    const beforePids = new Set(listRunningZCodePids());
    const child = await spawnFreshZCode(exeInfo.exePath);
    log('Waiting for port 9229 to bind (cold start)...');
    // B3: between probePort9229() returning null and spawnFreshZCode() actually
    // binding, the user may have manually launched ZCode and bound 9229
    // themselves. Detect this and kill the child we just spawned (which is
    // racing for the port) to avoid a duplicate ZCode process. Killing our
    // OWN freshly-spawned child is not "killing an existing instance".
    for (let i = 0; i < 30; i++) {
      await delay(1000);
      existingVersion = await probePort9229();
      if (!existingVersion) continue;
      const afterPids = new Set(listRunningZCodePids());
      const newPids = [...afterPids].filter((p) => !beforePids.has(p));
      if (newPids.length === 0) {
        // Port came up but no new PIDs — likely our child, keep going.
        break;
      }
      // Another ZCode came up after we probed. It owns 9229. Kill our child
      // so we don't end up with two ZCode instances.
      log('Another ZCode bound 9229 mid-spawn; killing our child to avoid duplicates.');
      try { child.kill(); } catch {}
      break;
    }
    if (!existingVersion) {
      err(`Port ${CDP_PORT} did not bind within 30s. Did the patch apply?`);
      err('Try: re-run with --probe to dump CDP targets.');
      err('Or:  set ZCODE_TIMELINE_PORT to a different port.');
      process.exit(2);
    }
    log(`Port ${CDP_PORT} is up now.`);
  }

  if (probeOnly) {
    const { port, target, targets } = await waitForZCodeTarget({ timeoutMs: 30000 });
    log(`Probe: port=${port}, targetId=${target.id}, url=${target.url}`);
    for (const t of targets) {
      log(`  - type=${t.type} url=${t.url} ws=${t.webSocketDebuggerUrl ? 'yes' : 'no'}`);
    }
    // eslint-disable-next-line no-constant-condition
    while (true) await delay(60000);
  }

  // 4. Ctrl+C handler
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    log('Launcher shutting down (ZCode keeps running).');
    setTimeout(() => process.exit(0), 200);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // 5. Session loop
  await sessionLoop();
}

main().catch((e) => {
  err('Fatal:', e);
  process.exit(1);
});
