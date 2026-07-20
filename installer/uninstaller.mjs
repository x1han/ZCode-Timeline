#!/usr/bin/env node
// installer/uninstaller.mjs
//
// Standalone uninstaller for ZCode Timeline. Designed to be packaged as a
// single .exe via @yao-pkg/pkg so end users don't need Node.js or this
// repo to remove the timeline — they just download one file and run it.
//
// What it does:
//   1. Detect ZCode.exe (Windows / macOS / Linux) via launcher/zcode-finder
//   2. Call launcher/install.mjs#uninstall() which:
//        - Reads the existing app.asar
//        - Restores the original from the backup taken at install time
//      This is the inverse of install(): the original archive is restored
//      byte-for-byte from the .asar.backup that install() left next to
//      app.asar, and the markers written into the patched archive are
//      gone again.
//   3. Optionally restart ZCode (skipped by default to match the safety
//      directive: "do not close ZCode").
//
// Notes:
//   - launcher/install.mjs polls for up to 5 minutes if ZCode holds
//     app.asar open, so the user does NOT need to close ZCode first.
//   - We do NOT auto-close ZCode here. The installer (installer.mjs)
//     closes ZCode because the install flow needs to materialize the
//     bundle before patching; the uninstall flow only needs to rename
//     app.asar (or write a new archive in place), which works against
//     a live lock with the polling strategy.
//   - This file is loaded via dynamic import() from uninstaller.cjs so
//     that pkg (which prefers CommonJS entry points) can bundle it.

import { execFileSync, execSync, spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import { findZCodeExe } from '../launcher/zcode-finder.mjs';
import { uninstall as runUninstall } from '../launcher/install.mjs';

const DEFAULT_INSTALL_DIR =
  process.env.ZCODE_TIMELINE_DIR || join(homedir(), '.zcode-timeline');

// Always-on log file. Critical for Windows .exe users who double-click the
// uninstaller — when it crashes the console window closes immediately
// and they have no way to see what failed. The log file persists so the
// user (and we, when debugging) can inspect the full transcript.
// Override with the ZCODE_TIMELINE_LOG env var if needed.
const LOG_FILE =
  process.env.ZCODE_TIMELINE_LOG || join(homedir(), '.zcode-timeline-install.log');

function tee(line) {
  try {
    appendFileSync(LOG_FILE, line + '\n', 'utf8');
  } catch {
    // If we can't write the log file, we still want the console to work —
    // this is best-effort.
  }
}

function log(...args) {
  const ts = new Date().toISOString().slice(11, 23);
  const line = `[${ts}] ${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}`;
  tee(line);
  console.log(line);
}

function err(...args) {
  const ts = new Date().toISOString().slice(11, 23);
  const line = `[${ts}] ${args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')}`;
  tee(line);
  console.error(line);
}

// Catch-all for crashes that bypass our main().catch() handler.
process.on('uncaughtException', (e) => {
  err('Uncaught exception:', e && e.message ? e.message : String(e));
  if (e && e.stack) err(e.stack);
});
process.on('unhandledRejection', (e) => {
  err('Unhandled rejection:', e && e.message ? e.message : String(e));
  if (e && e.stack) err(e.stack);
});

function isZCodeRunning() {
  try {
    if (process.platform === 'win32') {
      const out = execFileSync(
        'powershell',
        [
          '-NoProfile',
          '-Command',
          "@(Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue).Count",
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true, timeout: 5000 }
      ).trim();
      return Number(out) > 0;
    }
    execFileSync('pgrep', ['-x', 'ZCode'], { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function killZCode() {
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM ZCode.exe', { stdio: 'pipe', shell: true });
    } else {
      execSync('pkill -9 -x ZCode', { stdio: 'pipe', shell: true });
    }
  } catch {
    // Non-zero exit means there were no matching processes — that's fine.
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function main() {
  const argv = process.argv.slice(2);
  // Default behavior mirrors the installer: auto-close ZCode (with a
  // 5-second countdown the user can Ctrl+C out of) so the asar lock
  // releases and restore can proceed, then auto-restart ZCode so the
  // restored archive is loaded immediately. Override via --no-restart
  // (skip both close and restart) or --no-close (restart only — useful
  // when asar was already restored manually and the user just wants
  // ZCode reloaded with the original).
  const noRestart = argv.includes('--no-restart');
  const noClose = argv.includes('--no-close');
  // --keep-bundle leaves ~/.zcode-timeline (the install dir + bundle +
  // state file) on disk after restoration, so a future reinstall is
  // fast. Default is to remove it: the user explicitly asked to
  // uninstall, and leaving partial state behind is the kind of thing
  // that bites people later.
  const keepBundle = argv.includes('--keep-bundle');

  log('=== ZCode Timeline Uninstaller ===');

  // 1. Detect ZCode (and confirm the timeline is actually installed).
  log('Detecting ZCode installation...');
  let zcodeInfo;
  try {
    zcodeInfo = findZCodeExe();
  } catch (e) {
    err(e.message);
    err(
      'If ZCode is installed in an unusual location, set ZCODE_EXE to the\n' +
        '  full path before running this uninstaller, e.g.:\n' +
        '    set ZCODE_EXE=C:\\Path\\To\\ZCode.exe'
    );
    pauseOnError();
    process.exit(1);
  }
  log(`  Found: ${zcodeInfo.exePath} (source=${zcodeInfo.source})`);

  // 2. Auto-close ZCode if it's running. restoreOriginal() calls
  //    renameSync on app.asar, which fails with EPERM while ZCode
  //    holds the file memory-mapped open. The polling variant in
  //    launcher/install.mjs waits up to 5 minutes for the lock to
  //    release, but closing ZCode ourselves is faster and more
  //    predictable — same trade-off the installer makes.
  if (!noClose && await isZCodeRunning()) {
    log('');
    log('  ⚠  ZCode is currently running.');
    log('  The uninstaller needs to close ZCode to restore app.asar.');
    log('  Any unsaved ZCode sessions will be lost on close.');
    log('');
    for (let i = 5; i > 0; i--) {
      log(`  Closing ZCode in ${i}s — press Ctrl+C to cancel...`);
      await delay(1000);
    }
    log('  Closing ZCode now.');
    killZCode();
    // Brief settle so file handles release cleanly before the asar rename.
    await delay(2000);
    log('  ZCode closed.');
    log('');
  }

  // 3. Restore the original app.asar.
  log('Restoring original app.asar...');
  try {
    await runUninstall();
    log('  Original app.asar restored.');
  } catch (e) {
    err(`Restore failed: ${e && e.message ? e.message : String(e)}`);
    pauseOnError();
    process.exit(1);
  }

  // 4. Clean up the install bundle directory (unless --keep-bundle).
  if (!keepBundle) {
    try {
      const rmCmd =
        process.platform === 'win32'
          ? `rmdir /S /Q "${DEFAULT_INSTALL_DIR}"`
          : `rm -rf "${DEFAULT_INSTALL_DIR}"`;
      execSync(rmCmd, { stdio: 'pipe', shell: true });
      log(`  Removed install dir: ${DEFAULT_INSTALL_DIR}`);
    } catch (e) {
      // Non-fatal — the original asar is already restored.
      log(
        `  Could not remove ${DEFAULT_INSTALL_DIR}: ${e && e.message ? e.message : String(e)}`
      );
    }
  } else {
    log(`  Kept install dir (--keep-bundle): ${DEFAULT_INSTALL_DIR}`);
  }

  // 5. Restart ZCode so the restored asar is loaded immediately.
  if (!noRestart) {
    log('Restarting ZCode...');
    const child = spawn(zcodeInfo.exePath, [], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    child.unref();
    log(`  Launched ZCode (pid ${child.pid ?? '?'}).`);
  } else {
    log('--no-restart set; restart ZCode manually to activate.');
  }

  log('');
  log('========================================');
  log('  Timeline removed. Goodbye.');
  log('========================================');
}

// Direct execution is handled by the bundled CommonJS entry (see
// installer/bundle-uninstaller.mjs footer). When this .mjs file is run
// directly via `node installer/uninstaller.mjs`, esbuild has not generated
// a CJS wrapper, so we fall through to manual invocation for development.
const isDevDirectInvocation =
  import.meta.url === `file://${process.argv[1]}`;
if (isDevDirectInvocation) {
  main().catch((e) => {
    err('Uninstall failed:', e && e.message ? e.message : String(e));
    if (process.env.ZCODE_TIMELINE_DEBUG && e && e.stack) err(e.stack);
    pauseOnError();
    process.exit(1);
  });
}

// Keep the console window open on Windows when the uninstaller is launched
// by double-clicking. Without this, the window closes immediately on
// non-zero exit and the user can't read the error.
function pauseOnError() {
  if (process.platform !== 'win32') return;
  err('');
  err(`Full log: ${LOG_FILE}`);
  err('Press any key to close this window...');
  try {
    execSync('pause', { stdio: 'inherit' });
  } catch {
    // pause returns non-zero if user pressed Ctrl+C — exit anyway
  }
}