> ⚠️ **DEPRECATED** — ZCode 3.4.1 ships a built-in timeline panel that
> covers this project's functionality. **This repository is no longer
> maintained and no further releases are planned.**
>
> If you've already installed ZCode-Timeline and want to restore
> ZCode's pristine `app.asar`, run the uninstaller `.exe` from any
> release zip below, or `npm run uninstall` from a cloned checkout.

# ZCode Timeline

**A vertical session timeline for [ZCode](https://github.com/x1han), with click-to-jump and hover previews.**

![demo](docs/demo.gif)

> Unofficial community tool. Windows is the tested platform; ZCode discovery also covers common macOS and Linux installs.

---

## Features

- One bar per user message along the left edge of the chat panel
- Hover previews and a smooth staircase effect for nearby bars
- Click a bar to smooth-scroll to that message
- Native startup loading after a one-shot install: no daemon and no CDP injection
- Atomic, reversible `app.asar` patching with an original backup
- Standalone `.exe` installer and uninstaller — no terminal required

---

## Installation

Download the latest release zip and run the installer.

1. Open the [latest release page](https://github.com/x1han/ZCode-Timeline/releases/latest).
2. Download `zcode-timeline-windows-vX.Y.Z-x64.zip` (or `zcode-timeline-windows-vX.Y.Z-arm64.zip` for ARM Windows). The version is in the zip name, so multiple releases can coexist in your Downloads folder without overwriting. The zip contains:
   - `zcode-timeline-installer-vX.Y.Z-x64.exe` — installs or upgrades the timeline
   - `zcode-timeline-uninstaller-vX.Y.Z-x64.exe` — restores the original ZCode `app.asar`
3. Extract the zip anywhere (Desktop is fine).
4. Double-click the installer `.exe`.
5. If ZCode is currently running, the installer will offer a 5-second countdown before closing it. Press `Ctrl+C` in the console window to cancel.
6. Wait for the installer to finish. It auto-detects your ZCode installation, backs up the original `app.asar`, embeds the timeline bundle, atomically swaps the patched archive into place, and re-launches ZCode.

That's it. The timeline loads automatically on every ZCode startup afterwards.

### Prerequisites

- Windows x64 or ARM64 (the release zip includes both variants)
- ZCode installed and launched at least once
- Write access to ZCode's `resources\` directory (the installer will tell you if this fails)
- The installer currently checks for `node`, `npm`, and `git` on `PATH` and exits if any are missing. This check is over-conservative — the actual install does not use any of them — but it remains in place for safety. If you hit the check on a fresh machine, the message includes the install URL for each missing tool. (See "Troubleshooting" below if you want to work around it.)

### macOS / Linux

The release zip is Windows-only because the install flow patches `app.asar` in place, which breaks the macOS code signature and requires sudo on Linux. A native macOS/Linux release is not currently published. Use the dev launcher (see below) on those platforms, or run the install on Windows under WSL with `ZCODE_EXE` pointed at the Linux binary.

---

## Updating

When a new timeline version is released:

1. Download the latest release zip (same as install).
2. Double-click the new release's installer `.exe`. It detects the existing install and replaces the embedded bundle without touching your ZCode install.
3. Restart ZCode if the installer did not do so automatically.

The original `app.asar` backup from your first install is preserved on disk; you can always go back to it.

---

## Uninstalling

Double-click the release zip's uninstaller `.exe`.

The uninstaller mirrors the installer: 5-second countdown → close ZCode → restore original `app.asar` from the backup → remove the install directory → re-launch ZCode. After it finishes, ZCode is back to its pristine, un-timeline state.

If you do not have the uninstaller anymore, the original backup lives at `ZCode\resources\app.asar.original-<hash>` next to `app.asar`. Move it over `app.asar` manually.

---

## How it works

`app.asar` is ZCode's packed application archive. The installer's only job is to write a tiny HTML marker into `out/renderer/index.html` (so ZCode loads the timeline bundle from `out/renderer/zcode-timeline/timeline.install.iife.js` on startup) and to embed that bundle inside `app.asar`. No background process, no CDP injection, no launcher daemon.

The flow:

1. Detect the ZCode executable (honors `ZCODE_EXE`, then a running ZCode process, then common install paths).
2. Take a SHA-256 of the current `app.asar` and copy it to `app.asar.original-<hash>` if no backup exists yet.
3. Extract the archive into a staging directory.
4. Insert the renderer marker before `</head>` in `out/renderer/index.html` (idempotent — already-marked archives are skipped).
5. Copy the pre-built timeline bundle into the staging directory at the two expected paths.
6. Pack the staging directory into `app.asar.new`, validate the markers and bundle, then atomically rename it over the original `app.asar`.
7. Record the install state (original hash, patched hash, backup paths) in `.state.json` next to the bundle, so the uninstaller knows what to restore.

If ZCode is running and holds `app.asar` open, step 6 fails with `EPERM`/`EACCES`/`EBUSY`. The installer does not partial-write the original in that case; it leaves `app.asar.new` staged and reports the error path.

---

## Troubleshooting

### "Node.js is required but was not found on PATH"

The installer checks for `node`, `npm`, and `git` but does not actually use them. The check is defensive. Two options:

- Install Node.js LTS from [nodejs.org](https://nodejs.org/) (this also gives you `npm`). Install Git from [git-scm.com](https://git-scm.com/). Re-run the installer.
- Or, if you want to skip the check, run the installer from a shell that has those commands available (e.g., a "Git Bash" terminal that has `git` in its `PATH`). The `node`/`npm`/`git` commands do not actually need to do anything; they just need to exist.

(Removing the check is on the to-do list. Track the issue if you want it fixed sooner.)

### The installer says `EPERM`, `EACCES`, or `EBUSY`

ZCode is still holding `app.asar` open. The installer auto-closes ZCode after a 5-second countdown, but if you cancelled the countdown (`Ctrl+C`), ZCode is still running. Close all ZCode windows and the tray icon, then double-click the installer again. The staged `.new` archive will be picked up automatically.

### The installer says it succeeded but ZCode still has no timeline

Restart ZCode. The patched archive only loads on next launch.

### macOS reports the application is "damaged" or "untrusted"

Modifying `app.asar` inside a signed `.app` bundle invalidates the code signature. Gatekeeper will block ZCode on next launch. This is an inherent consequence of patching a signed bundle, not an installer bug. Reinstalling the official ZCode `.app` from the developer restores the original signature.

### The timeline looks wrong after a ZCode update

ZCode's auto-updater may have replaced `resources/app.asar` with a fresh archive. Re-run the release zip's installer — the installer detects the new archive, takes a fresh backup of the pristine archive, and re-embeds the timeline.

---

## Dev workflow

For contributors working on the timeline source itself. This is not part of the end-user install flow.

```powershell
git clone https://github.com/x1han/ZCode-Timeline.git
cd ZCode-Timeline
npm install
npm run build:dev      # unminified bundle with inline source map
npm run start          # build, launch/attach ZCode via CDP, inject once
npm run start -- --watch   # keep the launcher attached across ZCode restarts
npm run dev            # rebuild on source changes and reinject automatically
```

`scripts/install-autostart.ps1` and `scripts/install-shortcut.ps1` are CDP-launcher helpers from the pre-install-mode era. They are no longer needed for end users.

### Project structure

```text
ZCode-Timeline/
├── installer/           # standalone installer.exe + uninstaller.exe sources and bundles
├── launcher/            # shared asar-patcher + CDP dev launcher
├── timeline-src/        # React 19 timeline source and esbuild entry
├── scripts/             # verification, probes, build wrappers
├── package.json
└── README.md
```

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `ZCODE_EXE` | auto-detected | Explicit ZCode executable path |
| `ZCODE_TIMELINE_PORT` | `9229` | CDP port for the dev launcher only |
| `ZCODE_TIMELINE_DISABLE` | unset | Dev CDP bootstrap only; no-op for the install-mode sidebar |
| `ZCODE_TIMELINE_MAX_BACKUPS` | `1` | Maximum retained `app.asar.original-<hash>` backups |
| `ZCODE_TIMELINE_LOG` | `~/.zcode-timeline-install.log` | Override the installer/uninstaller log file path |

## License

[MIT](./LICENSE) © 2026 ZCode-Timeline contributors