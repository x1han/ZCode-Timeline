// timeline-src/build.mjs
// Bundles timeline-src/index.tsx into dist/timeline.iife.js using esbuild.

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DIST_DIR = resolve(PROJECT_ROOT, 'dist');
const ENTRY = resolve(PROJECT_ROOT, 'timeline-src', 'index.tsx');
const OUTFILE = resolve(DIST_DIR, 'timeline.iife.js');
const INSTALL_OUTFILE = resolve(DIST_DIR, 'timeline.install.iife.js');

if (!existsSync(DIST_DIR)) mkdirSync(DIST_DIR, { recursive: true });

const minify = process.env.NODE_ENV !== 'development' && !process.argv.includes('--dev');

// D2: write the bundle to a sibling .tmp file first, then atomically rename.
// This way the launcher's fsWatch(DIST_FILE) never observes a 0-byte or
// partial file mid-write. esbuild's `outfile` is final, so we ask esbuild
// for a temp filename and rename after it succeeds.
const TMP_OUTFILE = `${OUTFILE}.tmp`;

await build({
  entryPoints: [ENTRY],
  bundle: true,
  format: 'iife',
  // No `globalName` — index.tsx attaches the public API directly on window
  // (window.__ZCODE_TIMELINE_MOUNT__, window.__ZCODE_TIMELINE_REFRESH__, …).
  // Putting a globalName here would also leak a stale `var … = ()` IIFE that
  // nothing on the launcher side ever reads; we removed it for clarity.
  outfile: TMP_OUTFILE,
  jsx: 'automatic',
  platform: 'browser',
  target: ['chrome120'],
  minify,
  sourcemap: !minify ? 'inline' : false,
  loader: { '.css': 'text' },           // we do our own inline style injection
  define: {
    'process.env.NODE_ENV': JSON.stringify(minify ? 'production' : 'development'),
  },
  logLevel: 'info',
  metafile: false,
});

// Sanity check: refuse to ship a 0-byte bundle (corrupted esbuild output).
const sz = statSync(TMP_OUTFILE).size;
if (sz < 1024) {
  rmSync(TMP_OUTFILE, { force: true });
  throw new Error(`esbuild produced a suspiciously small bundle (${sz} bytes); aborting rename`);
}

// Atomic swap on Windows when both files are on the same volume (which they
// always are here — both in dist/). renameSync is atomic on NTFS for same-
// volume moves/replaces.
renameSync(TMP_OUTFILE, OUTFILE);

console.log(`[build] wrote ${OUTFILE} (${sz} bytes)`);

// Install mode uses a second, self-mounting artifact. Keep the plain IIFE byte-
// for-byte unchanged because the dev launcher still wraps and invokes it itself.
const bundleJs = readFileSync(OUTFILE, 'utf8');
const installJs = `;(function () {
  if (window.top !== window) return;
  try {
${bundleJs}
    const mountTimeline = () => {
      try {
        if (typeof window.__ZCODE_TIMELINE_MOUNT__ === 'function') {
          window.__ZCODE_TIMELINE_LOADED__ = true;
          window.__ZCODE_TIMELINE_MOUNT__();
        }
      } catch (e) {
        console.error('[zcode-timeline] mount failed:', e);
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountTimeline, { once: true });
    } else {
      mountTimeline();
    }
  } catch (e) {
    console.error('[zcode-timeline] bundle failed:', e);
  }
})();
`;
const installTmp = `${INSTALL_OUTFILE}.tmp`;
writeFileSync(installTmp, installJs, 'utf8');
const installSize = statSync(installTmp).size;
if (installSize < sz) {
  rmSync(installTmp, { force: true });
  throw new Error(`install bundle is smaller than the plain bundle (${installSize} < ${sz}); aborting rename`);
}
renameSync(installTmp, INSTALL_OUTFILE);

console.log(`[build] wrote ${INSTALL_OUTFILE} (${installSize} bytes)`);
