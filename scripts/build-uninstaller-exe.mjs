#!/usr/bin/env node
// scripts/build-uninstaller-exe.mjs
//
// Build wrapper for the uninstaller .exe.
//
// Why this exists:
//   pkg uses the `<input>` argument's nearest package.json (or a `-c`
//   config file) to determine the entry script. When run inside the
//   ZCode-Timeline project, the project's own package.json contains a
//   `pkg` config pointing at installer/installer.cjs — so passing
//   `pkg .pkg-uninstaller.json` produces a snapshot whose entry is
//   installer.cjs, not uninstaller.cjs. The result is a silently-empty
//   .exe that exits 0 without ever calling main().
//
//   The fix: copy the uninstaller.cjs + a tiny package.json into a
//   scratch directory with NO other config, run pkg there, and copy
//   the resulting .exe back into dist-installer.
//
//   `pkg -c .pkg-uninstaller.json` from the project root does NOT
//   work either — pkg treats the `-c` argument and the input
//   directory's package.json as mutually exclusive ("Specify either
//   'package.json' or config. Not both"), and prefers the input
//   directory's package.json. So we have to use a fresh directory.

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');

const arch = process.argv[2] || 'x64';
if (arch !== 'x64' && arch !== 'arm64') {
  console.error(`build-uninstaller-exe: unknown arch "${arch}". Use x64 or arm64.`);
  process.exit(1);
}

// On Windows, node_modules/.bin/pkg is a .cmd batch wrapper. execFileSync
// (which we use to capture output cleanly) can't run .cmd files unless
// `shell: true` is set, which spawns cmd.exe and treats arguments
// differently. Prefer the pkg ESM entry (lib-es5/bin.js) on Windows
// because it runs in-process as plain Node; fall back to the .bin shim
// with shell:true on other platforms where it's a #!/usr/bin/env node
// script that execFileSync can run directly.
function findPkgCommand() {
  const libEntry = resolve(PROJECT_ROOT, 'node_modules', '@yao-pkg', 'pkg', 'lib-es5', 'bin.js');
  if (existsSync(libEntry)) {
    return { cmd: process.execPath, args: [libEntry], useShell: false };
  }
  // Fallback: .bin shim.
  const shimWin = resolve(PROJECT_ROOT, 'node_modules', '.bin', 'pkg.cmd');
  const shimNix = resolve(PROJECT_ROOT, 'node_modules', '.bin', 'pkg');
  if (process.platform === 'win32' && existsSync(shimWin)) {
    return { cmd: shimWin, args: [], useShell: true };
  }
  if (existsSync(shimNix)) {
    return { cmd: shimNix, args: [], useShell: false };
  }
  throw new Error(
    `pkg not found (looked at ${libEntry}, ${shimWin}, ${shimNix}). Run "npm install" first.`
  );
}

const scratchDir = join(tmpdir(), `zcode-uninstaller-pkg-${process.pid}-${Date.now()}`);
mkdirSync(scratchDir, { recursive: true });

try {
  // 1. Copy the bundled uninstaller.cjs into the scratch dir.
  const srcCjs = resolve(PROJECT_ROOT, 'installer', 'uninstaller.cjs');
  copyFileSync(srcCjs, join(scratchDir, 'uninstaller.cjs'));

  // 2. Write a minimal package.json that points pkg at uninstaller.cjs.
  //    Crucially, the `pkg` field is empty (no scripts/targets) — pkg's
  //    defaults handle those via CLI flags. The `bin` field is what
  //    pkg uses to determine the entry script for the snapshot's main
  //    module, and that's what we set to uninstaller.cjs.
  writeFileSync(
    join(scratchDir, 'package.json'),
    JSON.stringify(
      {
        name: 'zcode-timeline-uninstaller-build',
        version: '0.0.1',
        private: true,
        bin: 'uninstaller.cjs',
      },
      null,
      2,
    ),
    'utf8',
  );

  // 3. Run pkg from the scratch dir. Pass `--targets` and `--output`
  //    explicitly so we don't depend on a pkg config file.
  const outDir = resolve(PROJECT_ROOT, 'dist-installer');
  mkdirSync(outDir, { recursive: true });
  const outName = arch === 'arm64'
    ? 'zcode-timeline-uninstaller-arm64.exe'
    : 'zcode-timeline-uninstaller.exe';
  const outPath = join(outDir, outName);

  const pkg = findPkgCommand();
  console.log(`build-uninstaller-exe: building ${arch} from scratch dir ${scratchDir}`);
  console.log(`build-uninstaller-exe: pkg cmd = ${pkg.cmd} ${pkg.args.join(' ')}`);
  execFileSync(
    pkg.cmd,
    [...pkg.args,
      '.',
      '--targets', `node22-win-${arch}`,
      '--no-bytecode',
      '--public',
      '--output', outPath,
    ],
    { cwd: scratchDir, stdio: 'inherit', shell: pkg.useShell },
  );

  if (!existsSync(outPath)) {
    console.error(`build-uninstaller-exe: pkg did not produce ${outPath}`);
    process.exit(1);
  }
  console.log(`build-uninstaller-exe: wrote ${outPath}`);
} finally {
  // Clean up scratch dir (best-effort — Windows may hold files briefly).
  try { rmSync(scratchDir, { recursive: true, force: true }); } catch {}
}