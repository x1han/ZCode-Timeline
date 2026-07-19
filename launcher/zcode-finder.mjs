// launcher/zcode-finder.mjs
// Find a running or installable ZCode.exe.
//
// Search order:
//   1. ZCODE_EXE env var (full path to ZCode.exe)
//   2. Common install dirs (S:\ZCode, %LOCALAPPDATA%\Programs\ZCode\*, etc.)
//   3. Running process: powershell Get-Process ZCode
//
// Returns { exePath, source } or throws.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// process is a Node global; use it directly instead of importing.
const PATH_DELIM = process.platform === 'win32' ? ';' : ':';

function buildCandidates() {
  // Resolve the per-user AppData path dynamically instead of hardcoding a
  // username — works for any user account on the machine.
  const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
  const home = homedir();

  return [
    // 1. Explicit env override always wins.
    process.env.ZCODE_EXE,

    // 2. Common install roots. Includes both back-slash and forward-slash
    //    variants since some Windows shells display one or the other.
    'S:\\ZCode\\ZCode.exe',
    'S:\\zcode\\ZCode.exe',
    'C:\\ZCode\\ZCode.exe',
    'C:\\zcode\\ZCode.exe',

    // 3. Per-user AppData (was previously hardcoded to `hxsci`; now generic).
    join(localAppData, 'Programs', 'ZCode', 'ZCode.exe'),
    join(localAppData, 'Programs', 'ZCode Desktop', 'ZCode.exe'),
    join(home, 'AppData', 'Local', 'Programs', 'ZCode', 'ZCode.exe'),

    // 4. System-wide installs.
    'C:\\Program Files\\ZCode\\ZCode.exe',
    'C:\\Program Files (x86)\\ZCode\\ZCode.exe',

    // 5. Anywhere on PATH (rare but cheap to check).
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
  // Use Get-Process to ask for the path of a running ZCode.exe instance.
  // Returns null if ZCode is not running.
  try {
    const cmd = `powershell -NoProfile -Command "$p = Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path; if ($p) { $p } else { '' }"`;
    const out = execSync(cmd, { encoding: 'utf8', timeout: 5000, windowsHide: true }).trim();
    return out || null;
  } catch {
    return null;
  }
}

export function findZCodeExe() {
  // If ZCode is already running, prefer its path.
  const running = tryRunning();
  if (running && tryFile(running)) return { exePath: running, source: 'running' };

  for (const p of buildCandidates()) {
    const abs = tryFile(p);
    if (abs) return { exePath: abs, source: 'candidate' };
  }
  throw new Error(
    'ZCode.exe not found.\n' +
      '  Set ZCODE_EXE env var to its full path, e.g.:\n' +
      '    set ZCODE_EXE=C:\\Path\\To\\ZCode.exe\n' +
      '  Or install ZCode under one of the search roots:\n' +
      '    S:\\ZCode, C:\\ZCode, %LOCALAPPDATA%\\Programs\\ZCode, or C:\\Program Files\\ZCode.'
  );
}