#!/usr/bin/env node
// scripts/build-release.mjs
//
// One-shot release artifact builder. Produces two versioned .zip files
// referenced by README.md's "Installation" section:
//
//   dist-installer/zcode-timeline-windows-v0.3.0-x64.zip
//   dist-installer/zcode-timeline-windows-v0.3.0-arm64.zip
//
// Each zip contains an installer + uninstaller pair named with the
// same version + arch suffix (so the files inside the zip are also
// self-identifying — multiple versions can coexist on disk without
// renaming):
//
//   zcode-timeline-installer-v0.3.0-x64.exe
//   zcode-timeline-uninstaller-v0.3.0-x64.exe
//   zcode-timeline-installer-v0.3.0-arm64.exe
//   zcode-timeline-uninstaller-v0.3.0-arm64.exe
//
// The version tag is read from the most recent git tag
// (`git describe --tags --abbrev=0`) so the local artifacts always
// match the tag under which the release will be published. Renaming
// is done AFTER `pkg` produces its un-versioned output, so the
// package.json npm scripts (`build:exe:x64` etc.) stay platform-
// agnostic and the version lives in exactly one place (git).
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
import { existsSync, renameSync, statSync } from 'node:fs';
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

// Resolve the version tag from the most recent git tag. We use
// `git describe --tags --abbrev=0` rather than reading package.json
// so the filename always matches the tag the release is published
// under (which is what the user cares about). Accept either the
// 'v1.2.3' or the bare '1.2.3' form and normalize to 'v1.2.3'.
function getVersionTag() {
  let raw;
  try {
    raw = execFileSync('git', ['describe', '--tags', '--abbrev=0'], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      shell: true,
    }).trim();
  } catch {
    throw new Error(
      'No git tag found. Create one before building a release:\n' +
        '  git tag v0.3.0 && git push origin v0.3.0',
    );
  }
  return raw.startsWith('v') ? raw : `v${raw}`;
}

// Rename a freshly-built .exe to include the version tag + arch in its
// filename, e.g. `zcode-timeline-installer.exe` becomes
// `zcode-timeline-installer-v0.3.0-x64.exe`. Rename (move) — pkg's
// un-versioned output is consumed in the same call, so no stale
// un-versioned file remains in dist-installer/.
function renameWithVersion(origPath, versionTag, arch) {
  const dir = dirname(origPath);
  const base = origPath.slice(dir.length + 1, -('.exe'.length));
  // pkg names the arm64 installer `...-installer-arm64.exe` (not
  // `...-installer.exe`); strip the trailing `-arm64` so the versioned
  // name doesn't double-up the arch suffix.
  const cleanBase = base.replace(/-arm64$/, '');
  const newName = `${cleanBase}-${versionTag}-${arch}.exe`;
  const newPath = join(dir, newName);
  renameSync(origPath, newPath);
  return newPath;
}

// Build a single architecture's installer + uninstaller .exe pair and
// rename both to include the version + arch. Returns the renamed absolute
// paths. We run two npm scripts per arch because the installer and
// uninstaller are built from different entry scripts (installer/installer.cjs
// vs installer/uninstaller.cjs) and need separate pkg invocations.
function buildArch(arch, versionTag) {
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
  const installerPathRaw = join(DIST_INSTALLER, installerName);
  const uninstallerPathRaw = join(DIST_INSTALLER, uninstallerName);
  if (!existsSync(installerPathRaw)) {
    throw new Error(`expected ${installerPathRaw} after ${installerScript}, not found`);
  }
  if (!existsSync(uninstallerPathRaw)) {
    throw new Error(`expected ${uninstallerPathRaw} after ${uninstallerScript}, not found`);
  }
  const installerPath = renameWithVersion(installerPathRaw, versionTag, arch);
  const uninstallerPath = renameWithVersion(uninstallerPathRaw, versionTag, arch);
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

  const versionTag = getVersionTag();
  console.log(`[build-release] version tag: ${versionTag}`);

  // Build both architectures. x64 first because it's the primary
  // target — if it fails we don't waste time on arm64.
  const x64 = buildArch('x64', versionTag);
  const arm64 = buildArch('arm64', versionTag);

  // Zip each arch's pair into a single release artifact. Zip names
  // include the version so a release-zip bundle for one version is
  // visually distinct from another (no filename collisions if a user
  // downloads multiple releases for comparison).
  const x64Zip = join(DIST_INSTALLER, `zcode-timeline-windows-${versionTag}-x64.zip`);
  const arm64Zip = join(DIST_INSTALLER, `zcode-timeline-windows-${versionTag}-arm64.zip`);
  zipFiles(x64Zip, [x64.installerPath, x64.uninstallerPath]);
  zipFiles(arm64Zip, [arm64.installerPath, arm64.uninstallerPath]);

  // Print a summary + the gh release command for the user to run.
  // The suggested tag matches the version in our zip + .exe names, so
  // uploading is a copy-paste away.
  console.log('\n[build-release] ============================================');
  console.log('[build-release] Release artifacts ready:');
  console.log(`[build-release]   ${x64Zip}    (${formatMB(statSync(x64Zip).size)})`);
  console.log(`[build-release]   ${arm64Zip}  (${formatMB(statSync(arm64Zip).size)})`);
  console.log('[build-release]');
  console.log('[build-release] Inside each zip:');
  console.log(`[build-release]   zcode-timeline-installer-${versionTag}-x64.exe`);
  console.log(`[build-release]   zcode-timeline-uninstaller-${versionTag}-x64.exe`);
  console.log('[build-release]');
  console.log('[build-release] To publish as a GitHub release, review the zips');
  console.log('[build-release] then run:');
  console.log('[build-release]');
  console.log(`[build-release]   git tag ${versionTag} && git push origin ${versionTag}`);
  console.log(`[build-release]   gh release create ${versionTag} \\`);
  console.log(`[build-release]     "${x64Zip}" \\`);
  console.log(`[build-release]     "${arm64Zip}" \\`);
  console.log(`[build-release]     --title "${versionTag}" \\`);
  console.log('[build-release]     --notes "<release notes here>"');
  console.log('[build-release] ============================================');
}

main();