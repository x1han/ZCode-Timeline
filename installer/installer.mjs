#!/usr/bin/env node
// installer/installer.mjs
//
// Implementation of the top-level installer. Designed to be packaged as
// a single .exe via @yao-pkg/pkg so end users don't need Node.js or
// this repo to install the timeline — they just download one file and
// run it.
//
// Flow:
//   1. Verify Node.js, npm, and git are available on PATH
//   2. Detect ZCode.exe (Windows / macOS / Linux)
//   3. Clone the repo to ~/.zcode-timeline (or git pull if already cloned)
//   4. npm install + npm run build
//   5. Run launcher/install.mjs to patch ZCode's app.asar
//   6. Optionally restart ZCode
//
// Notes:
//   - The dangerous asar-patching work lives in launcher/install.mjs and
//     is unchanged by this script — this is just orchestration.
//   - launcher/install.mjs polls for up to 5 minutes if ZCode is holding
//     app.asar open, so the user does NOT need to close ZCode first.
//   - We restart ZCode at the end so the patched asar is loaded.
//   - This file is loaded via dynamic import() from installer.cjs so that
//     pkg (which prefers CommonJS entry points) can bundle it cleanly.

import { execSync, spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import { findZCodeExe } from '../launcher/zcode-finder.mjs';
import { install as runInstall } from '../launcher/install.mjs';

const DEFAULT_INSTALL_DIR =
  process.env.ZCODE_TIMELINE_DIR || join(homedir(), '.zcode-timeline');

// Always-on log file. Critical for Windows .exe users who double-click the
// installer — when it crashes the console window closes immediately and
// they have no way to see what failed. The log file persists so the user
// (and we, when debugging) can inspect the full transcript.
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

// Catch-all for crashes that bypass our main().catch() handler (e.g. an
// exception thrown from a setTimeout callback, or a synchronous throw
// inside the patcher subprocess).
process.on('uncaughtException', (e) => {
  err('Uncaught exception:', e && e.message ? e.message : String(e));
  if (e && e.stack) err(e.stack);
});
process.on('unhandledRejection', (e) => {
  err('Unhandled rejection:', e && e.message ? e.message : String(e));
  if (e && e.stack) err(e.stack);
});

function hasCommand(cmd) {
  try {
    const probe =
      process.platform === 'win32' ? `where ${cmd}` : `command -v ${cmd}`;
    execSync(probe, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getVersion(cmd) {
  try {
    const out = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const parts = out.split(/\s+/);
    return parts[parts.length - 1] || out;
  } catch {
    return null;
  }
}

function run(cmd, opts = {}) {
  log(`> ${cmd}`);
  try {
    return execSync(cmd, { stdio: 'inherit', shell: true, ...opts });
  } catch (e) {
    // Capture subprocess stderr into our log so we don't lose the cause
    // when a command (git clone, npm install, etc.) fails silently.
    if (e.stderr) {
      err('Subprocess stderr:');
      for (const line of e.stderr.toString().split(/\r?\n/)) {
        if (line.trim()) err(`  ${line}`);
      }
    }
    if (e.stdout) {
      const out = e.stdout.toString();
      const tail = out.length > 2000 ? out.slice(-2000) : out;
      err('Subprocess stdout (tail):');
      for (const line of tail.split(/\r?\n/)) {
        if (line.trim()) err(`  ${line}`);
      }
    }
    throw e;
  }
}

// Like run() but explicitly sets the working directory of the spawned shell.
// We don't rely on `cd "path" && cmd` because that depends on shell-specific
// behavior; the `cwd` option is the documented Node.js way.
function runIn(cwd, cmd, opts = {}) {
  log(`> (cwd=${cwd}) ${cmd}`);
  return run(cmd, { cwd, ...opts });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isZCodeRunning() {
  try {
    if (process.platform === 'win32') {
      const out = execSync(
        `powershell -NoProfile -Command "(Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue | Measure-Object).Count"`,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      ).trim();
      return Number(out) > 0;
    }
    // macOS / Linux
    const out = execSync('pgrep -x ZCode', {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
    return out.trim().length > 0;
  } catch {
    // pgrep returns exit code 1 when no match — that means not running.
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

export async function main() {
  const argv = process.argv.slice(2);
  const noRestart = argv.includes('--no-restart');
  const skipBuild = argv.includes('--skip-build');

  log('=== ZCode Timeline Installer ===');

  // Windows-only. The .exe is built for Windows targets only (see
  // package.json pkg.targets + scripts/build-release.mjs) — running this
  // binary on macOS or Linux will fail in subtle ways (PowerShell probes,
  // taskkill, .asar byte-for-byte writes that break macOS code signature,
  // etc.). Surface an explicit error immediately instead of letting the
  // failure cascade.
  if (process.platform !== 'win32') {
    err('This installer is Windows-only. Detected platform: ' + process.platform);
    err('macOS and Linux are not currently supported by the .exe release.');
    err('On macOS/Linux, use the dev launcher instead:');
    err('  git clone https://github.com/x1han/ZCode-Timeline');
    err('  cd ZCode-Timeline && npm install && npm run install');
    pauseOnError();
    process.exit(1);
  }

  // 1. Prerequisite check
  log('Checking prerequisites...');
  const checks = [
    { name: 'Node.js', cmd: 'node', url: 'https://nodejs.org/' },
    { name: 'npm', cmd: 'npm', url: 'https://nodejs.org/' },
    { name: 'git', cmd: 'git', url: 'https://git-scm.com/' },
  ];
  for (const c of checks) {
    if (!hasCommand(c.cmd)) {
      err(`${c.name} is required but was not found on PATH.`);
      err(`Install from: ${c.url}`);
      process.exit(1);
    }
    log(`  ${c.name}: ${getVersion(`${c.cmd} --version`) || 'OK'}`);
  }

  // 2. Detect ZCode
  log('Detecting ZCode installation...');
  let zcodeInfo;
  try {
    zcodeInfo = findZCodeExe();
  } catch (e) {
    err(e.message);
    err(
      'If ZCode is installed in an unusual location, set ZCODE_EXE to the\n' +
        '  full path before running this installer, e.g.:\n' +
        '    set ZCODE_EXE=C:\\Path\\To\\ZCode.exe',
    );
    process.exit(1);
  }
  log(`  Found: ${zcodeInfo.exePath} (source=${zcodeInfo.source})`);

  // 2.5. Auto-close ZCode if it's running, with a short countdown so the
  //      user can cancel (Ctrl+C) and save work first. The patch step
  //      needs ZCode's app.asar unlocked, and waiting 5 minutes for the
  //      user to close it manually is hostile UX.
  if (await isZCodeRunning()) {
    log('');
    log('  ⚠  ZCode is currently running.');
    log('  The installer needs to close ZCode to safely patch app.asar.');
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

  // 3. Materialize the bundled timeline bundle to disk. The .exe embeds
  //    the pre-built dist/timeline.install.iife.js as a string constant
  //    (see installer/bundle.mjs). We don't clone, npm install, or
  //    rebuild at install time — that flow was fragile (cloned public
  //    repo lacks the install-mode build artifacts) and required the
  //    user to have Node/npm/git installed.
  log(`Preparing install directory: ${DEFAULT_INSTALL_DIR}`);
  const bundlePath = join(DEFAULT_INSTALL_DIR, 'dist', 'timeline.install.iife.js');
  try {
    mkdirSync(dirname(bundlePath), { recursive: true });
    writeFileSync(bundlePath, __TIMELINE_INSTALL_BUNDLE_PLACEHOLDER__, 'utf8');
    log(`  Wrote embedded bundle to: ${bundlePath}`);
  } catch (e) {
    err(`  Failed to materialize bundle: ${e.message}`);
    err(`  Make sure ${DEFAULT_INSTALL_DIR} is writable.`);
    pauseOnError();
    process.exit(1);
  }

  // 4. Patch asar in-process. Calling runInstall() (bundled) directly
  //    avoids the spawn-`node` subprocess that previously broke with
  //    ERR_REQUIRE_ESM / MODULE_NOT_FOUND inside the pkg snapshot.
  //    We override stateFile / stagingDir / installBundlePath so the
  //    asar-patcher uses the real on-disk locations rather than its
  //    own baked-in PROJECT_ROOT (which is the snapshot path inside
  //    the .exe, not where our bundle and state actually live).
  log('Patching ZCode...');
  await runInstall({
    zcodeExePath: zcodeInfo.exePath,
    installBundlePath: bundlePath,
    stateFile: join(DEFAULT_INSTALL_DIR, '.state.json'),
    stagingDir: join(DEFAULT_INSTALL_DIR, '.asar-staging'),
    onLog: log,
  });

  // 6. Restart ZCode
  if (noRestart) {
    log('--no-restart set; restart ZCode manually to activate.');
  } else {
    log('Restarting ZCode...');
    const child = spawn(zcodeInfo.exePath, [], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    child.unref();
    log(`  Launched ZCode (pid ${child.pid ?? '?'}).`);
  }

  log('');
  log('========================================');
  log('  Timeline installed. Welcome.');
  log('========================================');
}

// Direct execution is handled by the bundled CommonJS entry (see
// installer/bundle.mjs footer and installer/installer.cjs). When this
// .mjs file is run directly via `node installer/installer.mjs`, esbuild
// has not generated a CJS wrapper, so we fall through to manual
// invocation for development.
const isDevDirectInvocation =
  import.meta.url === `file://${process.argv[1]}`;
if (isDevDirectInvocation) {
  main().catch((e) => {
    err('Install failed:', e && e.message ? e.message : String(e));
    if (process.env.ZCODE_TIMELINE_DEBUG && e && e.stack) err(e.stack);
    pauseOnError();
    process.exit(1);
  });
}

// Keep the console window open on Windows when the installer is launched
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