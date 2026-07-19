// scripts/verify-patch.mjs
// Quick diagnostic: state of the asar patch, CDP endpoint, and bundled IIFE.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const STATE_FILE = join(PROJECT_ROOT, '.state.json');

const ZCODE_EXE_CANDIDATES = [
  process.env.ZCODE_EXE,
  'S:\\ZCode\\ZCode.exe',
  'C:\\Users\\hxsci\\AppData\\Local\\Programs\\ZCode\\ZCode.exe',
].filter(Boolean);

function findAsar() {
  for (const p of ZCODE_EXE_CANDIDATES) {
    if (!p) continue;
    const ap = join(dirname(p), 'resources', 'app.asar');
    if (existsSync(ap)) return { asarPath: ap, fromExe: p };
  }
  return null;
}

function sha256(p) {
  const data = readFileSync(p);
  const h = createHash('sha256');
  h.update(data);
  return h.digest('hex');
}

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
  console.log('=== ZCode Timeline — Patch Status ===');
  console.log('');

  // 1. asar
  const ap = findAsar();
  if (!ap) {
    console.log('app.asar: NOT FOUND');
    console.log('  Could not locate ZCode. Set ZCODE_EXE or install under one of:');
    ZCODE_EXE_CANDIDATES.forEach((p) => console.log('   ', p));
  } else {
    const stat = statSync(ap.asarPath);
    const hash = sha256(ap.asarPath).slice(0, 16);
    console.log('app.asar:');
    console.log('  path:', ap.asarPath);
    console.log('  size:', stat.size.toLocaleString(), 'bytes');
    console.log('  sha256[0:16]:', hash);

    // check for marker in the asar bytes
    const buf = readFileSync(ap.asarPath);
    const hasMarker = buf.includes(Buffer.from('zcode-timeline:bootstrap:begin'));
    console.log('  patched-in-asar:', hasMarker ? 'YES' : 'NO');
  }

  console.log('');

  // 2. state
  console.log('.state.json:');
  if (existsSync(STATE_FILE)) {
    const s = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
    console.log('  originalHash[0:16]:', s.originalHash?.slice(0, 16) ?? '(none)');
    console.log('  patchedHash[0:16]:', s.patchedHash?.slice(0, 16) ?? '(none)');
    console.log('  backups:', (s.backups ?? []).length);
    for (const b of s.backups ?? []) console.log('   ', b);
  } else {
    console.log('  (no state file yet)');
  }

  console.log('');

  // 3. CDP endpoint
  const port = process.env.ZCODE_TIMELINE_PORT || 9229;
  console.log(`CDP endpoint (port ${port}):`);
  const cdp = await checkCdp(port);
  if (cdp.up) {
    console.log('  status: UP');
    console.log('  Browser:', cdp.version.Browser || '(unknown)');
    console.log('  Protocol:', cdp.version['Protocol-Version'] || '(unknown)');
  } else {
    console.log('  status: DOWN —', cdp.reason);
    console.log('  (this is expected if no ZCode has run since the patch was applied)');
  }

  console.log('');

  // 4. bundle
  const bundle = join(PROJECT_ROOT, 'dist', 'timeline.iife.js');
  console.log('Bundle (dist/timeline.iife.js):');
  if (existsSync(bundle)) {
    const sz = statSync(bundle).size;
    console.log('  size:', sz.toLocaleString(), 'bytes', sz > 100_000 ? '(production)' : '(dev)');
  } else {
    console.log('  (missing — run `npm run build`)');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
