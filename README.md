# ZCode Timeline

**A vertical session timeline for [ZCode](https://github.com/x1han), with click-to-jump and hover previews.**

![demo](docs/demo.gif)

> Unofficial community tool. Windows is the tested platform; ZCode discovery also covers common macOS and Linux installs.

---

## Features

- One bar per user message along the left edge of the chat panel
- Hover previews and a cascade effect for nearby bars
- Click a bar to smooth-scroll to that message
- Native startup loading after a one-shot install: no daemon and no CDP injection
- Atomic, reversible `app.asar` patching with an original backup
- The existing CDP launcher remains available for development and hot reload

## Quick install (Windows .exe)

For most users. Download one file, double-click, done. No terminal, no `git`, no manual steps.

1. Download `zcode-timeline-installer.exe` from the [latest release](https://github.com/x1han/ZCode-Timeline/releases/latest) (Windows x64) or `zcode-timeline-installer-arm64.exe` for ARM Windows.
2. Double-click it.
3. Wait for it to finish (about 30 seconds — it clones the repo, builds, and patches ZCode).
4. Restart ZCode.

The installer auto-detects ZCode, polls for up to 5 minutes if ZCode is holding `app.asar` open, and relaunches ZCode at the end. If ZCode is locked when you run it, just close ZCode and double-click the installer again — the staged `.new` will be picked up.

You still need **Node.js + npm + git** installed on the machine (the installer calls `npm install` and `git clone` under the hood). If any of those are missing, the installer prints which one and where to get it.

### Build the installer yourself

```powershell
git clone https://github.com/x1han/ZCode-Timeline.git
cd ZCode-Timeline
npm install
npm run build:exe          # produces dist-installer\zcode-timeline-installer.exe
                            # and dist-installer\zcode-timeline-installer-arm64.exe
```

## Installation

### Prerequisites

- Node.js 18 or newer and npm
- ZCode installed and launched at least once
- Write access to ZCode's `resources` directory
- Enough free disk space for one `app.asar` backup

### One-shot install

```powershell
git clone https://github.com/x1han/ZCode-Timeline.git
cd ZCode-Timeline
npm install
npm run build
npm run install
```

`npm install` only installs dependencies; it does not patch ZCode. `npm run build` creates both the plain development bundle and the self-mounting install bundle. `npm run install` finds ZCode, backs up its original `app.asar`, embeds the timeline, and atomically swaps the new archive into place.

The installer never terminates ZCode. On Windows, if ZCode has `app.asar` locked, the installer stages `app.asar.new`, prints one waiting message, and polls for up to five minutes. Fully quit ZCode, including its tray process, during that window. If the lock remains, the original archive is untouched and the error tells you where the staged archive was left.

After installation, start ZCode normally from its usual shortcut. The timeline loads on every ZCode startup without `npm run start`, a background process, or CDP injection.

### ZCode auto-detection

The installer first honors `ZCODE_EXE`, then checks a running Windows `ZCode` process, common platform paths, and `PATH`:

- Windows: `S:\ZCode`, `C:\ZCode`, `D:\ZCode`, `E:\ZCode`, `%LOCALAPPDATA%\Programs\ZCode`, and Program Files
- macOS: `/Applications/ZCode.app/Contents/MacOS/ZCode` and `~/Applications/ZCode.app/Contents/MacOS/ZCode`
- Linux: `/opt/ZCode/ZCode`, `/usr/local/ZCode/ZCode`, `~/.local/share/ZCode/ZCode`, and `ZCode` on `PATH`

For a nonstandard installation, set the executable explicitly:

```powershell
$env:ZCODE_EXE = "D:\Apps\ZCode\ZCode.exe"
npm run install
```

## Verify it worked

```powershell
npm run install:status
npm run verify
```

`install:status` reports the detected executable, `app.asar`, patch state, both marker states, and embedded bundle sizes. `npm run verify` exits non-zero unless the main marker, renderer marker, and embedded self-mounting bundle are all present.

A successful verification ends with:

```text
  main marker: YES
  renderer marker: YES
  embedded bundle: YES
  embedded bundle size: 210,000+ bytes
Verification: PASSED
```

The CDP endpoint may be down in install mode; the installed sidebar does not depend on it.

## Daily use

Open ZCode normally. No terminal, launcher daemon, scheduled task, or special shortcut is required.

When ZCode updates, its updater may replace `resources/app.asar`. Re-run the one-shot installer to embed the timeline into the new version:

```powershell
npm run build
npm run install
```

The patcher detects the new archive, keeps a backup of the new original, and reapplies the native install.

To update ZCode Timeline itself:

```powershell
git pull
npm install
npm run build
npm run install
```

## Uninstall

Fully quit ZCode if the operating system holds `app.asar` open, then run:

```powershell
npm run uninstall
```

This atomically restores the most recent recorded original archive. `npm run verify` should then exit non-zero and report the install as absent.

## Troubleshooting

### Windows says `EPERM`, `EACCES`, or `EBUSY`

ZCode is holding `resources\app.asar` open. The installer does not kill any process and never partial-writes the original. It waits silently after one `waiting for ZCode to close...` line, polling every two seconds for up to five minutes. Quit all ZCode windows and the tray process. If the timeout expires, run `npm run install` again after ZCode is fully closed; the error includes the staged `.new` path.

### macOS reports a damaged or untrusted application

Changing `app.asar` inside a signed `ZCode.app` invalidates the application signature. Gatekeeper may reject ZCode on its next launch. This is an inherent consequence of modifying a signed app bundle, not an atomic-write failure. Reinstalling the official ZCode application restores its original signature; use install mode on macOS only if you understand the local signing implications.

### `ZCODE_TIMELINE_DISABLE` does not hide the installed timeline

`ZCODE_TIMELINE_DISABLE` is a no-op for the install-mode sidebar. The renderer script is baked into `index.html` and mounts independently of `process.env`. To disable it, run `npm run uninstall`. The variable remains relevant only to the CDP bootstrap used by the development launcher.

### ZCode is not detected

Set `ZCODE_EXE` to the full executable path and retry. On Windows PowerShell:

```powershell
$env:ZCODE_EXE = "C:\Path\To\ZCode.exe"
npm run install
```

### The markers pass but no rail is visible

Restart ZCode so it loads the newly replaced archive, then open a conversation containing at least one user message. Run `npm run install:status` and `npm run verify` again. For DOM-level development diagnostics, use `npm run probe`.

## How it works

`npm run build` leaves `dist/timeline.iife.js` unchanged for the development launcher and also creates `dist/timeline.install.iife.js`. The install artifact keeps the same window globals, skips iframes, waits for `DOMContentLoaded` when necessary, and invokes `window.__ZCODE_TIMELINE_MOUNT__()`. Mounting is idempotent: the existing timeline instance is destroyed before a new React root is created.

`npm run install` performs these steps:

1. Detects the ZCode executable and derives `resources/app.asar` from its directory.
2. Extracts the archive into a staging directory.
3. Keeps the existing main-process CDP-port marker for compatibility with the development launcher.
4. Inserts this renderer marker block immediately before `</head>` in `out/renderer/index.html`:

   ```html
   <!-- ::zcode-timeline:renderer:begin:: -->
   <script src="./zcode-timeline/timeline.install.iife.js" data-zcode-timeline="1"></script>
   <!-- ::zcode-timeline:renderer:end:: -->
   ```

5. Embeds the self-mounting bundle in the archive, packs to `app.asar.new`, validates the markers and bundle, and atomically renames it over the original.

ZCode's renderer has no CSP (`out/renderer/index.html` does not declare one; `setContentSecurityPolicy` and `webRequest.onHeadersReceived` are absent from the main bundle), so a `<script>` tag injection in `index.html` executes freely.

The original archive is stored as `app.asar.original-<hash>` and tracked in `.state.json`. Marker checks make repeated installs idempotent, while bundle comparison ensures a newly built timeline is embedded even when the markers already exist.

## Dev workflow

The daemon-based launcher is retained for development only. It uses the plain IIFE, CDP evaluation, heartbeat reinjection, and file watching:

```powershell
# Build, launch/attach, and inject once
npm run start

# Keep the launcher waiting across ZCode restarts
npm run start -- --watch

# Rebuild on source changes and reinject
npm run dev

# Unminified bundle with inline source map
npm run build:dev
```

The older `scripts/install-autostart.ps1` and `scripts/install-shortcut.ps1` helpers target this CDP development launcher. They are deprecated for normal installation because native install mode needs neither autostart nor a special shortcut.

### Project structure

```text
ZCode-Timeline/
├── launcher/         # one-shot installer, ASAR patcher, and dev CDP launcher
├── timeline-src/     # React 19 timeline source and esbuild entry
├── scripts/          # verification, probes, and legacy dev helpers
├── package.json
└── README.md
```

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `ZCODE_EXE` | auto-detected | Explicit ZCode executable path |
| `ZCODE_TIMELINE_PORT` | `9229` | CDP port for the development launcher |
| `ZCODE_TIMELINE_DISABLE` | unset | Dev CDP bootstrap only; no-op for the install-mode sidebar |
| `ZCODE_TIMELINE_MAX_BACKUPS` | `1` | Maximum retained `app.asar.original-<hash>` backups |

## License

[MIT](./LICENSE) © 2026 ZCode-Timeline contributors
