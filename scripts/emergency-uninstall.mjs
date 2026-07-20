#!/usr/bin/env node
// scripts/emergency-uninstall.mjs
//
// One-shot helper to fully restore ZCode's pristine app.asar when the
// normal uninstall path is broken (e.g., the state file points to a
// temp-stub path that no longer exists on disk). This is the operation
// the user asked for to test whether the timeline inject is causing
// observed ZCode hangs.
//
// What it does:
//   1. Find ZCode.exe via zcode-finder
//   2. Find the most recent app.asar.original-<hash> next to app.asar
//   3. Rewrite .state.json to point at the real backup path
//   4. Call asar-patcher.restoreOriginal()
//   5. Verify the new app.asar has no zcode-timeline markers
//
// Safety: this does NOT close ZCode. If ZCode holds app.asar open,
// restoreOriginal will fail with EBUSY; the user must close ZCode
// first (or wait — restore is instant once the rename succeeds).

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { restoreOriginal, getAsarMarkers } from '../launcher/asar-patcher.mjs';
import { findZCodeExe } from '../launcher/zcode-finder.mjs';

const STATE_PATH = '.state.json';

function log(...a) { console.log('[emergency-uninstall]', ...a); }
function err(...a) { console.error('[emergency-uninstall]', ...a); }

async function main() {
  const zcode = findZCodeExe();
  const zcodeDir = dirname(zcode.exePath);
  const asarPath = join(zcodeDir, 'resources', 'app.asar');
  log(`ZCode: ${zcode.exePath}`);
  log(`app.asar: ${asarPath}`);

  // 1. Find a real on-disk backup. Prefer state-listed backups if they
  //    exist on disk; otherwise scan the resources/ dir for any
  //    app.asar.original-* and pick the most recent.
  let realBackups = [];
  if (existsSync(STATE_PATH)) {
    try {
      const j = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
      for (const b of j.backups || []) {
        if (existsSync(b)) realBackups.push(b);
        else log(`  state-listed backup missing on disk: ${b}`);
      }
    } catch {}
  }

  // Fall back to scanning the resources/ folder
  if (realBackups.length === 0) {
    const { readdirSync, statSync } = await import('node:fs');
    const entries = readdirSync(zcodeDir + '/resources');
    for (const name of entries) {
      if (name.startsWith('app.asar.original-')) {
        const full = join(zcodeDir, 'resources', name);
        try { statSync(full); realBackups.push(full); } catch {}
      }
    }
    if (realBackups.length === 0) {
      err('No app.asar.original-* backup found next to app.asar.');
      err('Cannot restore without a pristine archive.');
      process.exit(1);
    }
    log(`  found ${realBackups.length} backup(s) on disk:`);
    for (const b of realBackups) log(`    - ${b}`);
  }

  // 2. Rewrite state file with the real paths
  const state = existsSync(STATE_PATH)
    ? JSON.parse(readFileSync(STATE_PATH, 'utf8'))
    : { originalHash: null, patchedHash: null, backups: [] };
  state.backups = realBackups;
  // Don't reset originalHash/patchedHash here — restoreOriginal will do it
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  log(`Updated ${STATE_PATH} with ${realBackups.length} real backup path(s).`);

  // 3. Restore
  log('Calling restoreOriginal()...');
  const r = await restoreOriginal({ zcodeExePath: zcode.exePath });
  if (!r.ok) {
    err(`restoreOriginal failed: ${r.reason}`);
    if (r.reason && /lock|EBUSY|EPERM|EACCES/i.test(r.reason)) {
      err('ZCode is holding app.asar open. Close ZCode and re-run this script.');
    }
    process.exit(1);
  }
  log(`Restored from: ${r.restoredFrom}`);

  // 4. Verify markers are gone
  const markers = getAsarMarkers(asarPath);
  log(`Post-restore markers: main=${markers.main} renderer=${markers.renderer}`);
  if (markers.main || markers.renderer) {
    err('WARNING: timeline markers still present in restored app.asar.');
    err('The original backup may itself have been a patched archive.');
    process.exit(2);
  }
  log('SUCCESS: timeline markers absent; app.asar restored to pristine.');
}

main().catch((e) => {
  err('Unhandled error:', e && e.message ? e.message : String(e));
  if (e && e.stack) err(e.stack);
  process.exit(1);
});