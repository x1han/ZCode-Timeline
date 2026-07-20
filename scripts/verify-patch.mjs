// scripts/verify-patch.mjs
// Diagnostic for the native install markers, embedded bundle, state, and CDP.

import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

import {
  extractEntry,
  getAsarMarkers,
  sha256,
} from '../launcher/asar-patcher.mjs';
import { findZCodeExe } from '../launcher/zcode-finder.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const STATE_FILE = join(PROJECT_ROOT, '.state.json');
const INSTALL_BUNDLE_PARTS = ['out', 'zcode-timeline', 'timeline.install.iife.js'];
const RENDERER_INSTALL_BUNDLE_PARTS = ['out', 'renderer', 'zcode-timeline', 'timeline.install.iife.js'];

async function checkCdp(port) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/json/version`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!r.ok) return { up: false, reason: `HTTP ${r.status}` };
    return { up: true, version: await r.json() };
  } catch (e) {
    return { up: false, reason: e.message };
  }
}

async function main() {
  const failures = [];
  console.log('=== ZCode Timeline — Native Install Status ===');
  console.log('');

  let appAsar = null;
  try {
    const found = findZCodeExe();
    appAsar = join(dirname(found.exePath), 'resources', 'app.asar');
  } catch (e) {
    failures.push(e.message);
  }

  if (!appAsar || !existsSync(appAsar)) {
    console.log('app.asar: NOT FOUND');
    failures.push('ZCode app.asar was not found');
  } else {
    const stat = statSync(appAsar);
    const hash = sha256(appAsar).slice(0, 16);
    const markers = getAsarMarkers(appAsar);
    const embedded = extractEntry(appAsar, INSTALL_BUNDLE_PARTS);
    const rendererEmbedded = extractEntry(appAsar, RENDERER_INSTALL_BUNDLE_PARTS);

    console.log('app.asar:');
    console.log('  path:', appAsar);
    console.log('  size:', stat.size.toLocaleString(), 'bytes');
    console.log('  sha256[0:16]:', hash);
    console.log('  main marker:', markers.main ? 'YES' : 'NO');
    console.log('  renderer marker:', markers.renderer ? 'YES' : 'NO');
    console.log('  embedded bundle:', embedded ? 'YES' : 'NO');
    console.log('  embedded bundle size:', embedded ? `${embedded.length.toLocaleString()} bytes` : '(missing)');
    console.log('  renderer-loadable bundle:', rendererEmbedded ? 'YES' : 'NO');
    console.log('  renderer-loadable bundle size:', rendererEmbedded ? `${rendererEmbedded.length.toLocaleString()} bytes` : '(missing)');

    if (!markers.main) failures.push('main-process marker is missing');
    if (!markers.renderer) failures.push('renderer marker is missing');
    if (!embedded) failures.push('embedded install bundle is missing');
    if (!rendererEmbedded) failures.push('renderer-loadable install bundle is missing');
  }

  console.log('');
  console.log('.state.json:');
  if (existsSync(STATE_FILE)) {
    try {
      const state = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
      console.log('  originalHash[0:16]:', state.originalHash?.slice(0, 16) ?? '(none)');
      console.log('  patchedHash[0:16]:', state.patchedHash?.slice(0, 16) ?? '(none)');
      console.log('  backups:', (state.backups ?? []).length);
      for (const backup of state.backups ?? []) console.log('   ', backup);
    } catch (e) {
      console.log('  invalid:', e.message);
      failures.push('.state.json is invalid');
    }
  } else {
    console.log('  (no state file yet)');
  }

  console.log('');
  const port = process.env.ZCODE_TIMELINE_PORT || 9229;
  console.log(`CDP endpoint (port ${port}):`);
  const cdp = await checkCdp(port);
  if (cdp.up) {
    console.log('  status: UP');
    console.log('  Browser:', cdp.version.Browser || '(unknown)');
    console.log('  Protocol:', cdp.version['Protocol-Version'] || '(unknown)');
  } else {
    console.log('  status: DOWN —', cdp.reason);
    console.log('  (CDP is optional for native install mode and expected to be down before a restart)');
  }

  console.log('');
  if (failures.length) {
    console.error('Verification: FAILED');
    for (const failure of failures) console.error('  -', failure);
    process.exitCode = 1;
  } else {
    console.log('Verification: PASSED');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
