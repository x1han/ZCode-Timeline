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
  if (content.includes(MARKER_BEGIN)) {
    return { content, changed: false };
  }
  return { content: PREPEND_BLOCK + content, changed: true };
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

/**
 * Cheap marker check without extracting the whole asar. Returns true if the
 * `out/main/index.js` (or `out\main\index.js`) inside the given asar already
 * contains our bootstrap marker.
 */
function asarHasMarker(asarPath) {
  try {
    const buf = asar.extractFile(asarPath, 'out/main/index.js');
    if (buf && buf.includes(MARKER_BEGIN)) return true;
  } catch {
    /* fall through to windows-style path */
  }
  try {
    const buf = asar.extractFile(asarPath, 'out\\main\\index.js');
    if (buf && buf.includes(MARKER_BEGIN)) return true;
  } catch {
    /* neither path works */
  }
  return false;
}

/**
 * Apply the asar patch on demand.
 *
 * @returns {Promise<{
 *   status: 'skipped' | 'patched' | 'failed',
 *   reason?: string,
 *   asarPath?: string,
 *   currentHash?: string,
 *   previousHash?: string,
 *   backupPath?: string,
 *   stateFile?: string,
 * }>}
 */
export async function ensurePatched({ zcodeExePath, stateFile, stagingDir, maxBackups, onLog } = {}) {
  const zcodeDir = dirname(zcodeExePath);
  const asarPath = join(zcodeDir, 'resources', 'app.asar');
  const statePath = stateFile || join(PROJECT_ROOT, '.state.json');
  const stagingRoot = stagingDir || join(PROJECT_ROOT, '.asar-staging');

  if (!existsSync(asarPath)) {
    return { status: 'failed', reason: `app.asar not found at ${asarPath}`, asarPath };
  }

  const currentHash = computeFileSha256(asarPath);
  const state = loadState(statePath);

  // B2: idempotency must trust the MARKER, not just the hash. A user could
  // manually restore app.asar.original-XXX back over app.asar (hash matches
  // state.patchedHash) — but the marker would be missing and 9229 wouldn't
  // open. Check the marker directly and re-patch when needed.
  //
  // ALSO check the marker even when the hash doesn't match state.patchedHash.
  // Without this, a single-byte mutation of an already-patched asar would
  // create an unnecessary backup that we'd then prune later — wasting a
  // ~233 MB copy for no reason.
  if (state.patchedHash === currentHash) {
    if (asarHasMarker(asarPath)) {
      return {
        status: 'skipped',
        reason: 'asar already patched at this version',
        asarPath, currentHash, stateFile: statePath,
      };
    }
    // Hash matched but marker missing: someone restored an unpatched copy
    // (or otherwise corrupted the state). Fall through to re-patch. The
    // backup logic below will preserve the *previous* original as the
    // existing backup; we only create a new backup if originalHash is null.
  } else if (asarHasMarker(asarPath)) {
    // Hash differs (e.g. user patched manually and state is stale, or a
    // single-byte mutation shifted the hash) but marker is present: just
    // refresh state and skip patching. No backup needed.
    saveState(statePath, {
      originalHash: state.originalHash || currentHash,
      patchedHash: currentHash,
      backups: state.backups,
    });
    return {
      status: 'skipped',
      reason: 'marker present despite hash mismatch; state refreshed',
      asarPath, currentHash, stateFile: statePath,
    };
  }

  // Backup if needed.
  let backupPath;
  let backups = state.backups;
  if (!state.originalHash) {
    const r = backupAsar(asarPath, currentHash, backups);
    backupPath = r.path; backups = r.backups;
  } else if (state.originalHash !== currentHash) {
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

  // Patch main entry.
  let mainAbs = join(stagingRoot, 'out\\main\\index.js');
  if (!existsSync(mainAbs)) mainAbs = join(stagingRoot, 'out/main/index.js');
  if (!existsSync(mainAbs)) {
    rmSync(stagingRoot, { recursive: true, force: true });
    return { status: 'failed', reason: `main entry not found in staging`, asarPath, stateFile: statePath };
  }

  const content = readFileSync(mainAbs, 'utf8');
  const { content: newContent, changed } = patchMainContent(content);
  if (!changed) {
    saveState(statePath, { originalHash: state.originalHash || currentHash, patchedHash: currentHash, backups });
    rmSync(stagingRoot, { recursive: true, force: true });
    return { status: 'skipped', reason: 'marker present in main entry, state refreshed', asarPath, currentHash, stateFile: statePath };
  }
  writeFileSync(mainAbs, newContent, 'utf8');

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
  } catch (e) {
    if (existsSync(tmpAsar)) rmSync(tmpAsar, { force: true });
    rmSync(stagingRoot, { recursive: true, force: true });
    return { status: 'failed', reason: `verification of new asar failed: ${e.message}`, asarPath, stateFile: statePath };
  }

  // Atomic swap. We DO NOT fall back to writeFileSync(asarPath, data): a
  // partial write would corrupt the user's ZCode install permanently.
  // If the rename fails because ZCode has the file open, we leave the
  // tmpAsar on disk and ask the user to close ZCode and re-run — never
  // touching the original asar with a non-atomic write.
  try {
    renameSync(tmpAsar, asarPath);
  } catch (e) {
    rmSync(stagingRoot, { recursive: true, force: true });
    const isLocked = e?.code === 'EPERM' || e?.code === 'EACCES' || e?.code === 'EBUSY';
    return {
      status: 'failed',
      reason: isLocked
        ? `Could not replace app.asar: ${e.message}.\n` +
          `  ZCode is running and holds the asar file open. Close all ZCode\n` +
          `  windows and re-run the launcher — the new asar is staged at\n` +
          `  ${tmpAsar} and will be swapped in on the next attempt.`
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
