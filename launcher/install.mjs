// launcher/install.mjs
// One-shot installer for baking the self-mounting timeline into ZCode's app.asar.

import * as asar from '@electron/asar';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import {
  ensurePatched,
  extractEntry,
  getAsarMarkers,
  restoreOriginal,
} from './asar-patcher.mjs';
import { findZCodeExe } from './zcode-finder.mjs';

const LOCK_POLL_MS = 2000;
const LOCK_WAIT_MS = 5 * 60 * 1000;
const INSTALL_BUNDLE_PARTS = ['out', 'zcode-timeline', 'timeline.install.iife.js'];
const RENDERER_INSTALL_BUNDLE_PARTS = ['out', 'renderer', 'zcode-timeline', 'timeline.install.iife.js'];

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

function isLockError(e) {
  return e?.code === 'EPERM' || e?.code === 'EACCES' || e?.code === 'EBUSY';
}

function isZCodeRunning() {
  try {
    if (process.platform === 'win32') {
      const output = execFileSync(
        'powershell',
        [
          '-NoProfile',
          '-Command',
          "@(Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue).Count",
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true, timeout: 5000 }
      ).trim();
      return Number(output) > 0;
    }
    execFileSync('pgrep', ['-x', 'ZCode'], {
      stdio: 'ignore',
      timeout: 5000,
    });
    return true;
  } catch {
    return false;
  }
}

async function waitForZCodeExit() {
  log('waiting for ZCode to close...');
  const deadline = Date.now() + LOCK_WAIT_MS;
  while (Date.now() < deadline) {
    if (!isZCodeRunning()) return true;
    await delay(Math.min(LOCK_POLL_MS, deadline - Date.now()));
  }
  return !isZCodeRunning();
}

function findInstall() {
  const info = findZCodeExe();
  const appAsar = join(dirname(info.exePath), 'resources', 'app.asar');
  return { ...info, appAsar };
}

async function install(opts = {}) {
  // Allow callers (e.g. the bundled installer) to override ZCode detection
  // and tee logs into their own logger. When called as a CLI we use the
  // defaults so behavior is unchanged.
  const onLog = opts.onLog || log;
  const found = opts.zcodeExePath
    ? { exePath: opts.zcodeExePath, source: opts.source || 'override' }
    : findInstall();
  onLog(`ZCode found at: ${found.exePath} (source=${found.source})`);

  let result = await ensurePatched({
    zcodeExePath: found.exePath,
    installMode: true,
    installBundlePath: opts.installBundlePath,
    stateFile: opts.stateFile,
    stagingDir: opts.stagingDir,
    onLog,
  });

  if (result.status === 'failed' && result.locked) {
    const exited = await waitForZCodeExit();
    if (!exited) {
      throw new Error(
        `Timed out after 5 minutes waiting for ZCode to close. The original app.asar was not changed. ` +
        `The new archive remains staged at ${result.stagedAsar || `${found.appAsar}.new`}. ` +
        `Fully quit ZCode, then run "npm run install" again.`
      );
    }
    result = await ensurePatched({
      zcodeExePath: found.exePath,
      installMode: true,
      installBundlePath: opts.installBundlePath,
      stateFile: opts.stateFile,
      stagingDir: opts.stagingDir,
      onLog,
    });
  }

  if (result.status === 'failed') {
    if (result.locked) {
      throw new Error(
        `${result.reason} Fully quit ZCode and run "npm run install" again; ` +
        `the original app.asar is still intact.`
      );
    }
    throw new Error(result.reason || 'ASAR install failed');
  }

  onLog(`[asar] status=${result.status}${result.reason ? ` reason=${result.reason}` : ''}`);
  if (result.backupPath) onLog(`[asar] backup of original: ${result.backupPath}`);
  onLog('Timeline installed. Start ZCode normally; no launcher daemon is required.');
}

async function uninstall() {
  const found = findInstall();
  log(`ZCode found at: ${found.exePath} (source=${found.source})`);
  try {
    // Resolve the state file from CWD before asar-patcher falls back to
    // PROJECT_ROOT. Inside a pkg snapshot PROJECT_ROOT is the snapshot
    // path inside the .exe, not the user's project dir, so the default
    // statePath would be empty. CWD-based lookup lets the same uninstall
    // function work from `node launcher/install.mjs uninstall` (cwd =
    // project root), `npm run uninstall` (cwd = project root), and the
    // packaged uninstaller.exe (cwd varies, but if the user double-
    // clicked the .exe from the project root or via a shortcut, CWD
    // is the project root and we find .state.json there).
    const { existsSync } = await import('node:fs');
    const { resolve } = await import('node:path');
    let stateFile;
    let dir = process.cwd();
    for (let i = 0; i < 6 && dir; i++) {
      const candidate = resolve(dir, '.state.json');
      if (existsSync(candidate)) { stateFile = candidate; break; }
      const parent = resolve(dir, '..');
      if (parent === dir) break;
      dir = parent;
    }
    const result = await restoreOriginal({ zcodeExePath: found.exePath, stateFile });
    if (!result.ok) throw new Error(result.reason || 'no original archive could be restored');
    log(`Restored original app.asar from: ${result.restoredFrom}`);
  } catch (e) {
    if (isLockError(e)) {
      throw new Error(
        `Could not restore app.asar while ZCode holds it open. Fully quit ZCode and run ` +
        `"npm run uninstall" again. The current app.asar was not partially written.`
      );
    }
    throw e;
  }
}

function status() {
  const found = findInstall();
  const markers = existsSync(found.appAsar)
    ? getAsarMarkers(found.appAsar)
    : { main: false, renderer: false };
  const rootBundle = existsSync(found.appAsar)
    ? extractEntry(found.appAsar, INSTALL_BUNDLE_PARTS)
    : null;
  const rendererBundle = existsSync(found.appAsar)
    ? extractEntry(found.appAsar, RENDERER_INSTALL_BUNDLE_PARTS)
    : null;
  const embeddedBundle = {
    exists: Boolean(rootBundle),
    size: rootBundle?.length ?? 0,
    rendererExists: Boolean(rendererBundle),
    rendererSize: rendererBundle?.length ?? 0,
  };

  let patchStatus = 'unpatched';
  if (markers.main && markers.renderer && embeddedBundle.exists && embeddedBundle.rendererExists) {
    patchStatus = 'installed';
  } else if (markers.main && !markers.renderer) {
    patchStatus = 'dev-only';
  } else if (markers.main || markers.renderer || embeddedBundle.exists || embeddedBundle.rendererExists) {
    patchStatus = 'incomplete';
  }

  console.log(JSON.stringify({
    zcodeExe: found.exePath,
    appAsar: found.appAsar,
    patchStatus,
    embeddedBundle,
    markers,
  }, null, 2));
}

export { install, uninstall, status };

export async function runCli() {
  const command = process.argv[2] || 'status';

  // npm invokes an "install" lifecycle script during plain `npm install`.
  // Dependency installation must not modify ZCode; only explicit
  // `npm run install` (npm_command=run-script) performs the one-shot patch.
  if (
    command === 'install' &&
    process.env.npm_lifecycle_event === 'install' &&
    process.env.npm_command === 'install'
  ) {
    log('Dependencies installed. Run "npm run build", then "npm run install" to patch ZCode.');
    return;
  }

  if (command === 'install') return install();
  if (command === 'uninstall') return uninstall();
  if (command === 'status') return status();
  throw new Error(`Unknown command "${command}". Use install, uninstall, or status.`);
}

// Direct CLI execution when invoked as `node launcher/install.mjs`.
const isDirectInvocation =
  import.meta.url === `file://${process.argv[1]}`;
if (isDirectInvocation) {
  runCli().catch((e) => {
    err(e.message || e);
    process.exit(1);
  });
}
