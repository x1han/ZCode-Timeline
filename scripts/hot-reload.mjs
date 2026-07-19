// scripts/hot-reload.mjs
// Watcher for development. Rebuilds dist/timeline.iife.js on each saved change.
// The launcher already auto-reinjects when the file changes on disk.
//
// Run with: npm run dev
//
// C2: pass --dev to the build so we get an unminified bundle with inline
// sourcemap. Without this, "npm run dev" silently produced the production
// minified bundle and any thrown error in ZCode had its stack mangled to
// single-letter names.

import { watch as fsWatch } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const WATCH_DIR = resolve(PROJECT_ROOT, 'timeline-src');
const BUILD_SCRIPT = resolve(PROJECT_ROOT, 'timeline-src', 'build.mjs');

let pending = null;

function scheduleRebuild() {
  if (pending) clearTimeout(pending);
  pending = setTimeout(async () => {
    pending = null;
    console.log('[dev] rebuilding...');
    try {
      await runBuild();
      console.log('[dev] rebuild done; launcher will auto-reinject');
    } catch (e) {
      console.error('[dev] build failed:', e.message);
    }
  }, 250);
}

function runBuild() {
  return new Promise((resolveP, rejectP) => {
    // D2: write to a temp file then atomically rename so the launcher's
    // fsWatch never observes a 0-byte or partial bundle. (build.mjs already
    // does this via renameSync at the end.) The launcher's readBundle
    // retry-after-ENOENT/empty patch is the second line of defence.
    const child = spawn(process.execPath, [BUILD_SCRIPT, '--dev'], {
      stdio: 'inherit',
      cwd: PROJECT_ROOT,
    });
    child.on('exit', (code) => {
      if (code === 0) resolveP();
      else rejectP(new Error(`build exited with ${code}`));
    });
  });
}

console.log('[dev] watching', WATCH_DIR);
fsWatch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  if (/\.(ts|tsx|css|mjs)$/.test(filename)) {
    console.log('[dev] change:', filename);
    scheduleRebuild();
  }
});

// initial build
scheduleRebuild();

// fsWatch with a recursive:true watcher keeps the Node event loop alive on
// its own; no setInterval keep-alive is needed. (Previously had a hack
// setInterval(() => {}, 1 << 30) here — removed.)
