// launcher/asar-patcher.mjs
// Patch ZCode's out/main/index.js to open
//     --remote-debugging-port=9229
// Idempotent. Auto-reapplies after upgrades via sha256 of app.asar.

import * as asar from '@electron/asar';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const MARKER_BEGIN = '/* ::zcode-timeline:bootstrap:begin:: */';
const MARKER_END = '/* ::zcode-timeline:bootstrap:end:: */';
const MARKER_BEGIN_RENDERER = '<!-- ::zcode-timeline:renderer:begin:: -->';
const MARKER_END_RENDERER = '<!-- ::zcode-timeline:renderer:end:: -->';
const INSTALL_BUNDLE = join(PROJECT_ROOT, 'dist', 'timeline.install.iife.js');
const INSTALL_BUNDLE_PARTS = ['out', 'zcode-timeline', 'timeline.install.iife.js'];
// index.html lives under out/renderer, so its ./zcode-timeline URL resolves to
// this second archive entry. Keep the root entry above for stable inspection.
const RENDERER_INSTALL_BUNDLE_PARTS = ['out', 'renderer', 'zcode-timeline', 'timeline.install.iife.js'];

const RENDERER_BLOCK = `${MARKER_BEGIN_RENDERER}
<script src="./zcode-timeline/timeline.install.iife.js" data-zcode-timeline="1"></script>
${MARKER_END_RENDERER}`;

// Maximum number of `app.asar.original-<hash>` backup files to retain.
// Override at runtime via the ZCODE_TIMELINE_MAX_BACKUPS env var (e.g.
// `set ZCODE_TIMELINE_MAX_BACKUPS=3` to keep 3 backups instead). The
// newest backup is always preserved; older ones are deleted to keep the
// resources folder from growing unboundedly across ZCode upgrades.
const DEFAULT_MAX_BACKUPS = 1;

// ESM-form prepend. ZCode's main entry is ESM (verified).
// Guarded by ZCODE_TIMELINE_DISABLE so users can opt out per launch.
const PREPEND_BLOCK = `${MARKER_BEGIN}
import { app as __zcodeTimelineApp } from 'electron';
if (!process.env.ZCODE_TIMELINE_DISABLE) {
  try {
    __zcodeTimelineApp.commandLine.appendSwitch('remote-debugging-port', process.env.ZCODE_TIMELINE_PORT || '9229');
    __zcodeTimelineApp.commandLine.appendSwitch('remote-allow-origins', '*');
  } catch (_) { /* ignore */ }
}
${MARKER_END}
`;

function computeFileSha256(p) {
  const data = readFileSync(p);
  const h = createHash('sha256');
  h.update(data);
  return h.digest('hex');
}

function loadState(stateFile) {
  if (!existsSync(stateFile)) return { originalHash: null, patchedHash: null, backups: [] };
  try {
    const j = JSON.parse(readFileSync(stateFile, 'utf8'));
    return {
      originalHash: j.originalHash || null,
      patchedHash: j.patchedHash || null,
      backups: Array.isArray(j.backups) ? j.backups : [],
    };
  } catch {
    return { originalHash: null, patchedHash: null, backups: [] };
  }
}

function saveState(stateFile, state) {
  writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
}

function patchMainContent(content) {
  if (content.includes(MARKER_BEGIN) && content.includes(MARKER_END)) {
    return { content, changed: false };
  }
  return { content: PREPEND_BLOCK + content, changed: true };
}

function patchRendererContent(content) {
  if (content.includes(MARKER_BEGIN_RENDERER) && content.includes(MARKER_END_RENDERER)) {
    return { content, changed: false };
  }
  const headEnd = content.lastIndexOf('</head>');
  if (headEnd < 0) throw new Error('renderer index.html has no </head> tag');
  return {
    content: `${content.slice(0, headEnd)}${RENDERER_BLOCK}\n  ${content.slice(headEnd)}`,
    changed: true,
  };
}

function backupAsar(asarPath, hash, existingBackups) {
  const stamp = hash.slice(0, 12);
  const backupPath = `${asarPath}.original-${stamp}`;
  if (!existsSync(backupPath)) {
    copyFileSync(asarPath, backupPath);
  }
  // Always include in the list (idempotent)
  const next = existingBackups.includes(backupPath)
    ? existingBackups
    : [...existingBackups, backupPath];
  return { path: backupPath, backups: next };
}

/**
 * Delete old backup files beyond the most recent `keep` ones, and return
 * the pruned list. Disk safety: backups are ~233 MB each, so without this
 * limit, dozens of ZCode upgrades would balloon the resources folder.
 *
 * The newest backups are kept (sorted by mtime desc). Files that are
 * missing on disk are silently dropped from the list (e.g. user manually
 * deleted one). The most-recent backup is always preserved regardless of
 * `keep` (set keep=0 to keep just the latest).
 */
function pruneOldBackups(backups, keep, log) {
  if (keep < 0) keep = 0;
  // Sort by file mtime descending; missing files rank last so they're culled.
  const sorted = [...backups].sort((a, b) => {
    const ea = existsSync(a);
    const eb = existsSync(b);
    if (ea && !eb) return -1;
    if (!ea && eb) return 1;
    if (!ea && !eb) return 0;
    return statSync(a).mtimeMs - statSync(b).mtimeMs;
  }).reverse();
  const toKeep = sorted.slice(0, Math.max(1, keep));
  const toDelete = sorted.slice(Math.max(1, keep));
  for (const p of toDelete) {
    if (!existsSync(p)) continue;
    try {
      unlinkSync(p);
      if (log) log(`[asar] pruned old backup: ${p}`);
    } catch (e) {
      if (log) log(`[asar] could not prune ${p}: ${e.message}`);
    }
  }
  return { kept: toKeep, pruned: toDelete.length, list: toKeep };
}

/** Extract an archive entry using the host separator first, with fallbacks. */
function extractAsarFile(asarPath, parts) {
  const candidates = [...new Set([
    join(...parts),
    parts.join('/'),
    parts.join('\\'),
  ])];
  for (const candidate of candidates) {
    try {
      return asar.extractFile(asarPath, candidate);
    } catch {
      /* try the next path style */
    }
  }
  return null;
}

/**
 * Single-file SHA-256 hex digest. Public helper re-exported so scripts
 * and other launchers can share this implementation rather than carrying
 * their own copy.
 */
export function sha256(p) {
  return computeFileSha256(p);
}

function asarHasExpectedInstallBundle(asarPath, expectedBundle) {
  const rootBundle = extractAsarFile(asarPath, INSTALL_BUNDLE_PARTS);
  const rendererBundle = extractAsarFile(asarPath, RENDERER_INSTALL_BUNDLE_PARTS);
  return Boolean(
    rootBundle && rendererBundle &&
    rootBundle.equals(expectedBundle) && rendererBundle.equals(expectedBundle)
  );
}

/**
 * Check the main-process and renderer marker pairs without extracting the
 * entire archive.
 *
 * @returns {{main: boolean, renderer: boolean}}
 */
export function getAsarMarkers(asarPath) {
  const main = extractAsarFile(asarPath, ['out', 'main', 'index.js']);
  const renderer = extractAsarFile(asarPath, ['out', 'renderer', 'index.html']);
  return {
    main: Boolean(main && main.includes(MARKER_BEGIN) && main.includes(MARKER_END)),
    renderer: Boolean(
      renderer &&
      renderer.includes(MARKER_BEGIN_RENDERER) &&
      renderer.includes(MARKER_END_RENDERER)
    ),
  };
}

/**
 * Extract an asar entry by its path parts. Public helper consolidated here so
 * launcher/install.mjs and scripts/verify-patch.mjs don't carry duplicates.
 * Returns null if no path style matches.
 */
export function extractEntry(asarPath, parts) {
  return extractAsarFile(asarPath, parts);
}

/**
 * Apply the asar patch on demand.
 *
 * @param {object} [options]
 * @param {boolean} [options.installMode=false] Embed and wire the self-mounting renderer bundle.
 * @returns {Promise<{
 *   status: 'skipped' | 'patched' | 'failed',
 *   reason?: string,
 *   locked?: boolean,
 *   stagedAsar?: string,
 *   asarPath?: string,
 *   currentHash?: string,
 *   previousHash?: string,
 *   backupPath?: string,
 *   stateFile?: string,
 * }>}
 */
export async function ensurePatched({ zcodeExePath, stateFile, stagingDir, maxBackups, installMode = false, installBundlePath, onLog } = {}) {
  const zcodeDir = dirname(zcodeExePath);
  const asarPath = join(zcodeDir, 'resources', 'app.asar');
  const statePath = stateFile || join(PROJECT_ROOT, '.state.json');
  const stagingRoot = stagingDir || join(PROJECT_ROOT, '.asar-staging');
  // The install bundle is normally co-located with the project at
  // PROJECT_ROOT/dist/timeline.install.iife.js. When called from the
  // bundled .exe, PROJECT_ROOT is the snapshot path inside the binary and
  // the actual bundle lives in the cloned install dir — accept an explicit
  // override.
  const bundlePath = installBundlePath || INSTALL_BUNDLE;

  if (!existsSync(asarPath)) {
    return { status: 'failed', reason: `app.asar not found at ${asarPath}`, asarPath };
  }

  let expectedInstallBundle = null;
  if (installMode) {
    if (!existsSync(bundlePath)) {
      return {
        status: 'failed',
        reason: `install bundle not found at ${bundlePath}; run "npm run build" first`,
        asarPath,
      };
    }
    expectedInstallBundle = readFileSync(bundlePath);
    if (expectedInstallBundle.length < 1024) {
      return {
        status: 'failed',
        reason: `install bundle is suspiciously small (${expectedInstallBundle.length} bytes)`,
        asarPath,
      };
    }
  }

  const currentHash = computeFileSha256(asarPath);
  const state = loadState(statePath);
  const markers = getAsarMarkers(asarPath);
  const installBundleCurrent = !installMode || asarHasExpectedInstallBundle(asarPath, expectedInstallBundle);
  const requiredPatchPresent = markers.main && (!installMode || (markers.renderer && installBundleCurrent));

  // B2: idempotency trusts archive contents, not just the hash. Install mode
  // requires both marker pairs and the current self-mounting bundle; dev mode
  // continues to require only the unchanged main-process CDP marker.
  if (state.patchedHash === currentHash) {
    if (requiredPatchPresent) {
      return {
        status: 'skipped',
        reason: installMode
          ? 'asar already patched in install mode at this version'
          : 'asar already patched at this version',
        asarPath, currentHash, stateFile: statePath,
      };
    }
    // Hash matched but a required marker or bundle is missing. Fall through
    // and rebuild the archive without replacing the recorded original backup.
  } else if (requiredPatchPresent) {
    // The state is stale but the required patch is complete. Refresh state
    // without creating another large backup.
    saveState(statePath, {
      originalHash: state.originalHash || currentHash,
      patchedHash: currentHash,
      backups: state.backups,
    });
    return {
      status: 'skipped',
      reason: 'required markers and bundle present despite hash mismatch; state refreshed',
      asarPath, currentHash, stateFile: statePath,
    };
  }

  // Backup if needed.
  let backupPath;
  let backups = state.backups;
  if (!state.originalHash) {
    const r = backupAsar(asarPath, currentHash, backups);
    backupPath = r.path; backups = r.backups;
  } else if (state.originalHash !== currentHash && state.patchedHash !== currentHash) {
    // A genuinely new ZCode archive needs a fresh pristine backup. Do not
    // back up a known patched archive when upgrading it from dev to install
    // mode or refreshing the embedded timeline bundle.
    const r = backupAsar(asarPath, currentHash, backups);
    backupPath = r.path; backups = r.backups;
  }

  // Stage fresh
  if (existsSync(stagingRoot)) rmSync(stagingRoot, { recursive: true, force: true });
  mkdirSync(stagingRoot, { recursive: true });

  try {
    asar.extractAll(asarPath, stagingRoot);
  } catch (e) {
    rmSync(stagingRoot, { recursive: true, force: true });
    return { status: 'failed', reason: `extractAll failed: ${e.message}`, asarPath, stateFile: statePath };
  }

  // Patch main entry. The CDP bootstrap remains unchanged for the dev launcher.
  let mainAbs = join(stagingRoot, 'out\\main\\index.js');
  if (!existsSync(mainAbs)) mainAbs = join(stagingRoot, 'out/main/index.js');
  if (!existsSync(mainAbs)) {
    rmSync(stagingRoot, { recursive: true, force: true });
    return { status: 'failed', reason: `main entry not found in staging`, asarPath, stateFile: statePath };
  }

  const mainPatch = patchMainContent(readFileSync(mainAbs, 'utf8'));
  if (mainPatch.changed) writeFileSync(mainAbs, mainPatch.content, 'utf8');

  if (installMode) {
    let rendererAbs = join(stagingRoot, 'out\\renderer\\index.html');
    if (!existsSync(rendererAbs)) rendererAbs = join(stagingRoot, 'out/renderer/index.html');
    if (!existsSync(rendererAbs)) {
      rmSync(stagingRoot, { recursive: true, force: true });
      return { status: 'failed', reason: 'renderer index.html not found in staging', asarPath, stateFile: statePath };
    }

    try {
      const rendererPatch = patchRendererContent(readFileSync(rendererAbs, 'utf8'));
      if (rendererPatch.changed) writeFileSync(rendererAbs, rendererPatch.content, 'utf8');
    } catch (e) {
      rmSync(stagingRoot, { recursive: true, force: true });
      return { status: 'failed', reason: `renderer patch failed: ${e.message}`, asarPath, stateFile: statePath };
    }

    const rootBundleDir = join(stagingRoot, ...INSTALL_BUNDLE_PARTS.slice(0, -1));
    const rendererBundleDir = join(stagingRoot, ...RENDERER_INSTALL_BUNDLE_PARTS.slice(0, -1));
    mkdirSync(rootBundleDir, { recursive: true });
    mkdirSync(rendererBundleDir, { recursive: true });
    copyFileSync(bundlePath, join(rootBundleDir, INSTALL_BUNDLE_PARTS.at(-1)));
    copyFileSync(bundlePath, join(rendererBundleDir, RENDERER_INSTALL_BUNDLE_PARTS.at(-1)));
  }

  // **Critical safety**: pack to a temp file first, verify it, THEN rename over original.
  const tmpAsar = `${asarPath}.new`;
  if (existsSync(tmpAsar)) rmSync(tmpAsar, { force: true });

  try {
    await asar.createPackage(stagingRoot, tmpAsar);
  } catch (e) {
    if (existsSync(tmpAsar)) rmSync(tmpAsar, { force: true });
    rmSync(stagingRoot, { recursive: true, force: true });
    return { status: 'failed', reason: `createPackage failed: ${e.message}`, asarPath, stateFile: statePath };
  }

  // Verify the new asar is reasonable: size > 1MB and listPackage works.
  try {
    const sz = statSync(tmpAsar).size;
    if (sz < 1024 * 1024) {
      rmSync(tmpAsar, { force: true });
      rmSync(stagingRoot, { recursive: true, force: true });
      return { status: 'failed', reason: `pack produced a suspiciously small asar (${sz} bytes)`, asarPath, stateFile: statePath };
    }
    const list = asar.listPackage(tmpAsar);
    if (!list || list.length < 100) {
      rmSync(tmpAsar, { force: true });
      rmSync(stagingRoot, { recursive: true, force: true });
      return { status: 'failed', reason: `packed asar has only ${list?.length ?? 0} entries`, asarPath, stateFile: statePath };
    }
    const packedMarkers = getAsarMarkers(tmpAsar);
    if (!packedMarkers.main || (installMode && !packedMarkers.renderer)) {
      rmSync(tmpAsar, { force: true });
      rmSync(stagingRoot, { recursive: true, force: true });
      return {
        status: 'failed',
        reason: `packed asar is missing required marker(s): ${JSON.stringify(packedMarkers)}`,
        asarPath,
        stateFile: statePath,
      };
    }
    if (installMode && !asarHasExpectedInstallBundle(tmpAsar, expectedInstallBundle)) {
      rmSync(tmpAsar, { force: true });
      rmSync(stagingRoot, { recursive: true, force: true });
      return { status: 'failed', reason: 'packed asar is missing the install bundle', asarPath, stateFile: statePath };
    }
  } catch (e) {
    if (existsSync(tmpAsar)) rmSync(tmpAsar, { force: true });
    rmSync(stagingRoot, { recursive: true, force: true });
    return { status: 'failed', reason: `verification of new asar failed: ${e.message}`, asarPath, stateFile: statePath };
  }

  // Atomic swap. We DO NOT fall back to writeFileSync(asarPath, data): a
  // partial write would corrupt the user's ZCode install permanently. A lock
  // failure leaves tmpAsar staged so the install CLI can wait and retry.
  try {
    renameSync(tmpAsar, asarPath);
  } catch (e) {
    rmSync(stagingRoot, { recursive: true, force: true });
    const isLocked = e?.code === 'EPERM' || e?.code === 'EACCES' || e?.code === 'EBUSY';
    return {
      status: 'failed',
      locked: isLocked,
      stagedAsar: existsSync(tmpAsar) ? tmpAsar : undefined,
      reason: isLocked
        ? `Could not replace app.asar: ${e.message}. The new archive remains staged at ${tmpAsar}.`
        : `rename failed: ${e.message}`,
      asarPath, stateFile: statePath,
    };
  }

  rmSync(stagingRoot, { recursive: true, force: true });

  const newHash = computeFileSha256(asarPath);

  // Prune old backups AFTER the new one is in place and the rename has
  // succeeded. We only ever run this on a successful patch, so a failed
  // patch never deletes a backup. The newest backup (just created) is
  // always kept.
  const keep = Number(
    maxBackups ?? process.env.ZCODE_TIMELINE_MAX_BACKUPS ?? DEFAULT_MAX_BACKUPS
  );
  const pruneResult = pruneOldBackups(backups, keep, onLog);
  backups = pruneResult.list;

  saveState(statePath, {
    originalHash: state.originalHash || currentHash,
    patchedHash: newHash,
    backups,
  });

  return {
    status: 'patched',
    asarPath,
    currentHash: newHash,
    previousHash: currentHash,
    backupPath,
    backupsKept: pruneResult.kept.length,
    backupsPruned: pruneResult.pruned,
    stateFile: statePath,
  };
}

/**
 * Roll back to the most recent backup. Used by launcher/maintenance.
 */
export async function restoreOriginal({ zcodeExePath, stateFile } = {}) {
  const zcodeDir = dirname(zcodeExePath);
  const asarPath = join(zcodeDir, 'resources', 'app.asar');
  const statePath = stateFile || join(PROJECT_ROOT, '.state.json');
  const state = loadState(statePath);
  if (!state.backups.length) return { ok: false, reason: 'no backups recorded' };

  // Pick the most recent backup.
  const backupPath = state.backups[state.backups.length - 1];
  if (!existsSync(backupPath)) return { ok: false, reason: `backup not found at ${backupPath}` };

  // Find a sibling .new to verify.
  const tmpAsar = `${asarPath}.new`;
  copyFileSync(backupPath, tmpAsar);
  renameSync(tmpAsar, asarPath);

  saveState(statePath, { originalHash: null, patchedHash: null, backups: [] });
  return { ok: true, asarPath, restoredFrom: backupPath };
}

/**
 * Utility: uninstall — remove all backups and reset state.
 */
export async function purgeBackups({ stateFile } = {}) {
  const statePath = stateFile || join(PROJECT_ROOT, '.state.json');
  const state = loadState(statePath);
  let removed = 0;
  for (const p of state.backups) {
    if (existsSync(p)) {
      try { unlinkSync(p); removed++; } catch { /* ignore */ }
    }
  }
  saveState(statePath, { originalHash: null, patchedHash: null, backups: [] });
  return { removed };
}
