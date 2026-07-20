#!/usr/bin/env node
// scripts/build-release.mjs
//
// One-shot release artifact builder. Produces the two .zip files
// referenced by README.md's "Installation" section:
//
//   dist-installer/zcode-timeline-windows-x64.zip   (installer.exe + uninstaller.exe)
//   dist-installer/zcode-timeline-windows-arm64.zip (installer-arm64.exe + uninstaller-arm64.exe)
//
// Each zip is what end users download from the GitHub release page.
// We bundle x64 + arm64 into a single npm script (not separate
// `build:release:x64` / `:arm64`) because every release needs both —
// a release that ships only one arch leaves half the users stranded.
//
// After the zips are built this script prints their paths + sizes and
// a suggested `gh release create` command. Uploading is NOT done here:
// that's a public, destructive action that requires human approval
// (release tag name, release notes). Run the printed command after
// you've reviewed the artifacts.
//
// Why PowerShell Compress-Archive and not `zip`:
//   This machine's Git Bash PATH does not include GNU `zip`. Windows
//   PowerShell's Compress-Archive is built into every supported
//   Windows version (Win10+) so the script has zero new dependencies.
//   Trade-off: script is Windows-only. A macOS/Linux build host would
//   need a different zip mechanism (e.g., the `archiver` npm package).
//   Acceptable for now — the project's only build host is Windows.

import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const DIST_INSTALLER = resolve(PROJECT_ROOT, 'dist-installer');

// Verify prerequisites before we start. The pkg binaries themselves
// don't need anything special, but PowerShell Compress-Archive needs
// powershell.exe on PATH (it is on every Windows install) and we need
// npm run scripts for the underlying builds.
function ensurePrereqs() {
  // Both checks use shell:true because Windows resolves .exe suffixes
  // through the shell rather than as part of CreateProcess. With shell:
  // false, execFileSync("powershell.exe") would error with ENOENT
  // even when powershell is plainly on PATH.
  // Note: powershell does NOT accept `--version` (GNU-style); it's
  // a parsed-as-script argument and errors out with a parser error.
  // We use `-Command "$PSVersionTable.PSVersion"` which always
  // succeeds on any installed PowerShell and prints the version.
  for (const [cmd, args] of [
    ['npm', ['--version']],
    ['powershell.exe', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion']],
  ]) {
    try {
      execFileSync(cmd, args, { stdio: 'ignore', shell: true });
    } catch {
      throw new Error(`${cmd} not found or failed. Required to build release.`);
    }
  }
  if (!existsSync(DIST_INSTALLER)) {
    throw new Error(`dist-installer/ does not exist. Run 'npm run build:exe:x64' first?`);
  }
}

// Run an npm script by name with output streaming through to the
// terminal. Throws on non-zero exit so callers get a clear failure.
function runNpmScript(scriptName) {
  console.log(`\n[build-release] > npm run ${scriptName}`);
  execFileSync('npm', ['run', scriptName], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: true,
  });
}

// Build a single architecture's installer + uninstaller .exe pair.
// Returns the absolute paths of both. We run two npm scripts per arch
// because the installer and uninstaller are built from different entry
// scripts (installer/installer.cjs vs installer/uninstaller.cjs) and
// need separate pkg invocations.
function buildArch(arch) {
  const installerScript = arch === 'x64' ? 'build:exe:x64' : 'build:exe:arm64';
  const uninstallerScript = arch === 'x64'
    ? 'build:exe:uninstaller:x64'
    : 'build:exe:uninstaller:arm64';

  runNpmScript(installerScript);
  runNpmScript(uninstallerScript);

  const installerName = arch === 'x64'
    ? 'zcode-timeline-installer.exe'
    : 'zcode-timeline-installer-arm64.exe';
  const uninstallerName = arch === 'x64'
    ? 'zcode-timeline-uninstaller.exe'
    : 'zcode-timeline-uninstaller-arm64.exe';
  const installerPath = join(DIST_INSTALLER, installerName);
  const uninstallerPath = join(DIST_INSTALLER, uninstallerName);
  if (!existsSync(installerPath)) {
    throw new Error(`expected ${installerPath} after ${installerScript}, not found`);
  }
  if (!existsSync(uninstallerPath)) {
    throw new Error(`expected ${uninstallerPath} after ${uninstallerScript}, not found`);
  }
  return { installerPath, uninstallerPath };
}

// Use PowerShell Compress-Archive to zip a list of files into a
// single archive. Returns the zip's absolute path.
function zipFiles(zipPath, filePaths) {
  // Compress-Archive takes a comma-separated list of paths. Quote each
  // path so PowerShell handles spaces (e.g., "Program Files").
  const quotedPaths = filePaths.map((p) => `'${p.replace(/'/g, "''")}'`).join(',');
  const quotedDest = `'${zipPath.replace(/'/g, "''")}'`;
  const psCommand =
    `Compress-Archive -Force -Path ${quotedPaths} -DestinationPath ${quotedDest}`;
  console.log(`\n[build-release] > powershell Compress-Archive -> ${zipPath}`);
  execFileSync('powershell.exe', ['-NoProfile', '-Command', psCommand], {
    stdio: 'inherit',
  });
  if (!existsSync(zipPath)) {
    throw new Error(`expected ${zipPath} after Compress-Archive, not found`);
  }
  return zipPath;
}

function formatMB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function main() {
  ensurePrereqs();

  // Build both architectures. x64 first because it's the primary
  // target — if it fails we don't waste time on arm64.
  const x64 = buildArch('x64');
  const arm64 = buildArch('arm64');

  // Zip each arch's pair into a single release artifact.
  const x64Zip = join(DIST_INSTALLER, 'zcode-timeline-windows-x64.zip');
  const arm64Zip = join(DIST_INSTALLER, 'zcode-timeline-windows-arm64.zip');
  zipFiles(x64Zip, [x64.installerPath, x64.uninstallerPath]);
  zipFiles(arm64Zip, [arm64.installerPath, arm64.uninstallerPath]);

  // Print a summary + the gh release command for the user to run
  // after they've decided on the tag name and release notes.
  console.log('\n[build-release] ============================================');
  console.log('[build-release] Release artifacts ready:');
  console.log(`[build-release]   ${x64Zip}    (${formatMB(statSync(x64Zip).size)})`);
  console.log(`[build-release]   ${arm64Zip}  (${formatMB(statSync(arm64Zip).size)})`);
  console.log('[build-release]');
  console.log('[build-release] To publish as a GitHub release, review the zips');
  console.log('[build-release] then run (substituting your tag name + notes):');
  console.log('[build-release]');
  console.log('[build-release]   git tag v0.2.0 && git push origin v0.2.0');
  console.log('[build-release]   gh release create v0.2.0 \\');
  console.log(`[build-release]     "${x64Zip}" \\`);
  console.log(`[build-release]     "${arm64Zip}" \\`);
  console.log('[build-release]     --title "v0.2.0" \\');
  console.log('[build-release]     --notes "<release notes here>"');
  console.log('[build-release] ============================================');
}

main();