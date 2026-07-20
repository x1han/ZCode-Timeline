// launcher/zcode-finder.mjs
// Find a running or installed ZCode executable.
//
// Search order:
//   1. Running Windows process: PowerShell Get-Process ZCode
//   2. ZCODE_EXE env var
//   3. Platform-specific install roots and PATH
//
// Returns { exePath, source } or throws.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// process is a Node global; use it directly instead of importing.
const PATH_DELIM = process.platform === 'win32' ? ';' : ':';

function buildCandidates() {
  const home = homedir();
  const explicit = [process.env.ZCODE_EXE];

  if (process.platform === 'darwin') {
    return [
      ...explicit,
      '/Applications/ZCode.app/Contents/MacOS/ZCode',
      join(home, 'Applications', 'ZCode.app', 'Contents', 'MacOS', 'ZCode'),
      ...pathDirs('ZCode'),
    ].filter(Boolean);
  }

  if (process.platform === 'linux') {
    return [
      ...explicit,
      '/opt/ZCode/ZCode',
      '/usr/local/ZCode/ZCode',
      join(home, '.local', 'share', 'ZCode', 'ZCode'),
      ...pathDirs('ZCode'),
    ].filter(Boolean);
  }

  // Resolve the per-user AppData path dynamically instead of hardcoding a
  // username — works for any user account on the machine.
  const localAppData = process.env.LOCALAPPDATA || join(home, 'AppData', 'Local');
  return [
    ...explicit,
    'S:\\ZCode\\ZCode.exe',
    'S:\\zcode\\ZCode.exe',
    'C:\\ZCode\\ZCode.exe',
    'C:\\zcode\\ZCode.exe',
    'D:\\ZCode\\ZCode.exe',
    'D:\\zcode\\ZCode.exe',
    'E:\\ZCode\\ZCode.exe',
    'E:\\zcode\\ZCode.exe',
    join(localAppData, 'Programs', 'ZCode', 'ZCode.exe'),
    join(localAppData, 'Programs', 'ZCode Desktop', 'ZCode.exe'),
    join(home, 'AppData', 'Local', 'Programs', 'ZCode', 'ZCode.exe'),
    'C:\\Program Files\\ZCode\\ZCode.exe',
    'C:\\Program Files (x86)\\ZCode\\ZCode.exe',
    ...pathDirs('ZCode.exe'),
  ].filter(Boolean);
}

function pathDirs(name) {
  const out = [];
  for (const dir of (process.env.PATH || '').split(PATH_DELIM)) {
    if (!dir) continue;
    out.push(join(dir, name));
  }
  return out;
}

function tryFile(p) {
  if (!p) return null;
  try {
    if (existsSync(p)) return p;
  } catch {
    /* unreadable path on Windows (long path, perms) — skip */
  }
  return null;
}

function tryRunning() {
  // Preserve the Windows Get-Process fallback so nonstandard installs can be
  // discovered from an already-running ZCode instance.
  if (process.platform !== 'win32') return null;
  try {
    const cmd = `powershell -NoProfile -Command "$p = Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path; if ($p) { $p } else { '' }"`;
    const out = execSync(cmd, { encoding: 'utf8', timeout: 5000, windowsHide: true }).trim();
    return out || null;
  } catch {
    return null;
  }
}

export function findZCodeExe() {
  const explicit = tryFile(process.env.ZCODE_EXE);
  if (explicit) return { exePath: explicit, source: 'env' };

  // If ZCode is already running, prefer its path over inferred candidates.
  const running = tryRunning();
  if (running && tryFile(running)) return { exePath: running, source: 'running' };

  for (const p of buildCandidates()) {
    const abs = tryFile(p);
    if (abs) return { exePath: abs, source: 'candidate' };
  }
  throw new Error(
    'ZCode executable not found.\n' +
      '  Set ZCODE_EXE to the full executable path.\n' +
      '  The installer also searches common Windows, macOS, and Linux roots plus PATH.'
  );
}