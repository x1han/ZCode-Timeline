// launcher/start-zcode-clean.mjs
// One-shot helper: kill all running ZCode instances, wait, spawn a fresh one,
// wait for it to bind port 9229 (CDP), then return. launcher.mjs will run
// next and attach automatically.
//
// SAFETY:
//   - Refuses to run unless process.env.START_ZCODE_CLEAN_CONFIRM === 'yes-do-it'
//   - Each step prints clearly what's about to happen.
//
// Env vars:
//   START_ZCODE_CLEAN_CONFIRM=yes-do-it   (required)
//   START_ZCODE_CLEAN_TIMEOUT=60          (max seconds to wait for 9229)
//   ZCODE_EXE                              (overrides path discovery)

import { execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { findZCodeExe } from './zcode-finder.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function log(...a) { console.log('[start-clean]', ...a); }
function die(msg, code = 2) { console.error('[start-clean] ERROR:', msg); process.exit(code); }

async function listZCodePids() {
  try {
    const out = execSync(
      `powershell -NoProfile -Command "(Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue | ForEach-Object { '{0} {1}' -f $_.Id, $_.WorkingSet64 })"`,
      { encoding: 'utf8', windowsHide: true, timeout: 5000 }
    ).trim();
    if (!out) return [];
    return out.split(/\r?\n/).filter(Boolean).map((l) => {
      const [pid] = l.trim().split(/\s+/);
      return Number(pid);
    });
  } catch {
    return [];
  }
}

async function waitForPort(port, timeoutSec) {
  const deadline = Date.now() + timeoutSec * 1000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) return true;
    } catch {
      // not yet
    }
    await delay(1000);
  }
  return false;
}

async function main() {
  if (process.env.START_ZCODE_CLEAN_CONFIRM !== 'yes-do-it') {
    die(
      'Refusing to run without explicit confirmation.\n' +
        'Re-run with:  set START_ZCODE_CLEAN_CONFIRM=yes-do-it && launcher\\start-zcode-clean.bat\n' +
        '(or just double-click start-zcode-clean.bat — the .bat sets this for you.)'
    );
  }

  // 1. Discover exe
  let info;
  try {
    info = findZCodeExe();
  } catch (e) {
    die(e.message);
  }
  log('ZCode at:', info.exePath);

  // 2. List current PIDs (informational)
  const before = await listZCodePids();
  log(`Current ZCode processes: ${before.length}`);
  for (const pid of before) {
    try {
      const cmd = `powershell -NoProfile -Command "(Get-Process -Id ${pid} -ErrorAction SilentlyContinue | Select-Object -First 1).Path"`;
      const p = execSync(cmd, { encoding: 'utf8', windowsHide: true, timeout: 3000 }).trim();
      log(`  pid=${pid} path=${p || '(unknown)'}`);
    } catch {
      log(`  pid=${pid} (no longer alive)`);
    }
  }

  // 3. Kill
  log('Taskkill /F /IM ZCode.exe /T (and child trees) ...');
  try {
    execSync('taskkill /F /IM ZCode.exe /T', {
      stdio: 'pipe',
      windowsHide: true,
    });
  } catch (e) {
    log('  taskkill exited non-zero (likely no process matched):', e.message);
  }

  // 4. Wait for all ZCode to be gone
  for (let i = 0; i < 30; i++) {
    const live = await listZCodePids();
    if (live.length === 0) break;
    await delay(500);
  }
  const stillAlive = await listZCodePids();
  if (stillAlive.length > 0) {
    die(
      `Failed to terminate all ZCode processes. Still alive:\n  ${stillAlive.join(', ')}\n` +
        `Try manually closing the ZCode window(s) and rerun.`
    );
  }
  log('All ZCode processes terminated.');

  // 5. Spawn one fresh
  log('Spawning fresh ZCode ...');
  const fresh = spawn(info.exePath, [], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  fresh.unref();
  fresh.on('exit', (code) => log(`  fresh ZCode exited code=${code}`));

  // 6. Wait for 9229
  const timeout = Number(process.env.START_ZCODE_CLEAN_TIMEOUT || 60);
  log(`Waiting up to ${timeout}s for CDP port 9229 to bind ...`);
  const ok = await waitForPort(9229, timeout);
  if (!ok) {
    die(
      `Port 9229 did not bind within ${timeout}s.\n` +
        `Possible causes:\n` +
        `  - the asar patch hasn't been applied yet — run \`node launcher/launcher.mjs\` to apply.\n` +
        `  - ZCode is blocked from binding — try: netstat -ano | findstr :9229\n` +
        `  - antivirus/sandbox is interfering.`
    );
  }
  log('Port 9229 is up. Handing off to launcher.');

  // 7. Hand-off to launcher.mjs by exec'ing it with stdio inherited.
  const launcherPath = join(__dirname, 'launcher.mjs');
  log('Executing launcher:', launcherPath);
  const child = spawn(process.execPath, [launcherPath], {
    stdio: 'inherit',
    windowsHide: false,
  });
  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((e) => die(e.message, 1));
