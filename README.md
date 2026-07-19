# ZCode Timeline

**A vertical session timeline for [ZCode](https://github.com/x1han) — clickable, hover-previewable, never breaks your ZCode install.**

![demo](docs/demo.gif)

> Unofficial community tool. Currently **Windows only**.

---

## Features

- 📍 **One bar per user message**, rendered along the left edge of the chat panel
- 🔍 **Hover to preview** — after 500 ms, a tooltip shows the first 100 characters of the prompt
- 🪜 **Cascade on hover** — the hovered bar expands and its neighbors step up in size, like a stair
- 🎯 **Click to jump** — smooth-scrolls to that message and flashes a 1.4 s highlight
- ♻️ **Upgrade-safe** — ZCode auto-updates won't kill the timeline; launcher detects new `app.asar` via SHA-256 and re-patches
- 🛡 **Reversible** — original `app.asar` is always backed up; one command restores it
- 🔌 **No kill** — the launcher never `taskkill`s your existing ZCode instance

---

## Table of contents

- [Installation](#installation)
- [Verify it worked](#verify-it-worked)
- [Daily use](#daily-use)
- [Updating & uninstalling](#updating--uninstalling)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)
- [How it works](#how-it-works)
- [Development](#development)
- [License](#license)

---

## Installation

### Prerequisites

| | Requirement | Check |
|---|---|---|
| OS | **Windows 10 or 11** (macOS / Linux not yet supported — see [FAQ](#faq)) | `winver` |
| Node.js | **≥ 18** (Node 20 LTS recommended) | `node --version` |
| npm | bundled with Node | `npm --version` |
| ZCode | installed and launched at least once | open ZCode once |
| Disk | ~700 MB free (one `app.asar` backup ≈ 233 MB) | |
| Permissions | write access to ZCode's `resources\` directory | |

> ⚠️ **Important:** close **every** ZCode window (check the system tray too) before running `npm run start`. The launcher needs to atomically replace `app.asar`; ZCode keeps the file locked while running, which causes an `EPERM` failure.

### Step 1 — find your ZCode install

```powershell
# PowerShell — if ZCode is currently running:
powershell -NoProfile -Command "Get-Process -Name ZCode -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path"
```

If ZCode isn't running, check the most common paths:

```
C:\Users\<you>\AppData\Local\Programs\ZCode\ZCode.exe          ← default install
C:\Users\<you>\AppData\Local\Programs\ZCode Desktop\ZCode.exe  ← alternate
S:\ZCode\ZCode.exe                                             ← developer machine
```

If yours isn't there, set the path manually before launching:

```powershell
$env:ZCODE_EXE = "C:\Path\To\ZCode.exe"
```

The launcher also scans these automatically; you usually don't need to set anything.

### Step 2 — clone, install, build

```powershell
# PowerShell
git clone https://github.com/x1han/ZCode-Timeline.git
cd ZCode-Timeline
npm install
npm run build
```

> 💡 If `npm install` ends with `1 moderate severity vulnerability` — that's a known advisory in `esbuild`'s dev server. It does **not** affect the bundled output (`dist/timeline.iife.js`) and can be safely ignored.

### Step 3 — start the launcher

```powershell
# Make sure ZCode is closed first!
npm run start
```

You should see logs like:

```
[hh:mm:ss.mmm] ZCode found at: C:\...\ZCode.exe (source=running|candidate)
[hh:mm:ss.mmm] [asar] status=patched backup of original: ...\app.asar.original-xxxx
[hh:mm:ss.mmm] Port 9229 already responds (CDP endpoint up). Attaching to current ZCode.
[hh:mm:ss.mmm] Attaching to target <id> via port 9229 (file:///...)
[hh:mm:ss.mmm] CDP attached. Injecting timeline bundle...
[hh:mm:ss.mmm] Timeline mounted successfully.
```

The launcher will spawn a fresh ZCode if none was running. Once mounted, ZCode's chat panel should show the timeline rail on the **left edge** with one bar per user message.

---

## Verify it worked

```powershell
npm run verify
```

Expected output:

```
app.asar:
  path:        <wherever ZCode is>\resources\app.asar
  size:        236,375,574 bytes
  patched-in-asar: YES

.state.json:
  originalHash: <hash>
  patchedHash:  <different hash>
  backups:      1 file(s)

CDP endpoint (port 9229): UP
Browser: Chrome/...

Bundle (dist/timeline.iife.js): size: 210,333 bytes (production)
```

If `patched-in-asar: NO` or `CDP endpoint: DOWN`, see [Troubleshooting](#troubleshooting).

---

## Daily use

- **Do I need to start the launcher every time I open ZCode?** Yes — the launcher is what attaches to CDP and injects the bundle. After the first install, you can either re-run `npm run start`, or double-click `launcher\launcher.bat`.
- **Where does the timeline appear?** Along the **left edge** of the chat panel, vertically centered. Hover a bar to expand it; hover for 500 ms to see the prompt preview; click to jump.
- **How do I stop the launcher?** Switch to the terminal where you ran `npm run start` and press `Ctrl+C`. **ZCode keeps running** — the timeline UI continues to work until you restart ZCode, after which you'll need to re-run the launcher.
- **Can I keep the launcher running in the background?** Yes. Use a tool like [pm2](https://pm2.keymetrics.io/) or Windows Task Scheduler if you want it auto-starting on boot.

### Optional: desktop shortcut

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-shortcut.ps1
```

Creates a "ZCode with Timeline" shortcut on your desktop that runs the launcher.

---

## Updating & uninstalling

### When ZCode updates

**Nothing to do.** The launcher detects the new `app.asar` via SHA-256 on its next start, backs up the new original, and re-patches automatically. Verify with `npm run verify` — you should see new backup entries.

### When you want to update ZCode-Timeline itself

```powershell
git pull
npm install
npm run build
```

The launcher's `fsWatch` will pick up the new `dist/timeline.iife.js` and re-inject automatically — no need to restart the launcher.

### Uninstall completely

```powershell
# 1. Restore the original (unpatched) ZCode asar
powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1
# Optional flags: -WhatIf (dry-run) / -Force (skip prompt) / -Index N (pick a specific backup)

# 2. Delete the project directory
Remove-Item -Recurse -Force .\ZCode-Timeline

# 3. Restart ZCode so the in-memory timeline UI disappears
```

The restore script auto-detects your ZCode install via `$env:ZCODE_EXE`, common paths, or running processes. If detection fails, pass it explicitly:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -ZCodeResourcesDir "D:\Apps\ZCode\resources"
```

> The restore script always writes a `app.asar.before-restore-<timestamp>` snapshot of your current asar before swapping — change your mind and you can roll forward again.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `ZCode.exe not found.` | ZCode installed somewhere the launcher doesn't scan | Set `$env:ZCODE_EXE = "C:\Path\To\ZCode.exe"` then re-run |
| `asar patch failed: EPERM` or `rename failed` | ZCode is still running and holds `app.asar` open | Fully quit ZCode (right-click tray icon → Quit), then `npm run start` |
| `Port 9229 did not bind within 30s` | Patch never applied (often the EPERM above) or another app is using 9229 | Close ZCode; or set `$env:ZCODE_TIMELINE_PORT = "9228"` and use that port |
| `Timeline mounted successfully.` but no rail visible | Bundle injected but your current session has no user messages yet | Send a message in the current chat; rail appears |
| `npm install` hangs or fails | Network/proxy issue | Try `npm config set registry https://registry.npmjs.org/` and retry |
| `node: ... GLIBC_...` (Linux) or `darwin` (mac) errors | Project is Windows-only; you ran it on a different OS | See [FAQ](#faq) — macOS / Linux not supported yet |
| Want to keep more ZCode backups | `MAX_BACKUPS=1` is the default to save disk space | `$env:ZCODE_TIMELINE_MAX_BACKUPS = "5"; npm run start` |
| Antivirus quarantines the modified `app.asar` | False positive | Add the ZCode install directory to your AV's exclusion list |

For deeper diagnostics:

```powershell
npm run probe       # see which user-message DOM selector matched
```

---

## FAQ

**Is this an official ZCode plugin?**
No. It's a community tool that lives entirely in your user account (`S:\zcode_timeline\`) and never auto-updates ZCode. It modifies one file — `resources\app.asar` — and always backs it up first.

**What does it actually change?**
One thing: it adds `--remote-debugging-port=9229` to ZCode's main process startup arguments. This opens a CDP endpoint that the launcher connects to. Nothing in ZCode's source code or UI assets is touched.

**Will ZCode upgrades break it?**
No. ZCode's auto-updater rewrites `app.asar`; on the next launcher start we detect the SHA-256 change, back up the new original, and re-apply the patch. The timeline comes back automatically.

**Will ZCode send my conversations anywhere?**
No. The CDP connection is **loopback-only** (`127.0.0.1`) and is consumed only by the launcher on your machine. Nothing is sent over the network.

**Does it work on macOS or Linux?**
Not yet. The launcher currently uses PowerShell + `taskkill` + Windows path conventions. Adding macOS/Linux support is on the roadmap — see the [issue tracker](https://github.com/x1han/ZCode-Timeline/issues) (open an issue if you need it).

**Does it slow down ZCode?**
No measurable impact. The bundle is ~210 KB and runs once per page load. A `MutationObserver` watches the chat container for new messages with no perceptible overhead.

**Can I disable the timeline temporarily without uninstalling?**
Set `$env:ZCODE_TIMELINE_DISABLE = "1"` before launching ZCode manually — the bootstrap code in `app.asar` will skip enabling CDP. Unset the variable to re-enable.

**Why does `npm install` warn about a vulnerability in esbuild?**
The advisory affects esbuild's local dev server (which this project doesn't run). The bundled output `dist/timeline.iife.js` is unaffected. The warning can be safely ignored.

---

## How it works

```
┌──────────────────────────────────────────────────────────┐
│  ZCode-Timeline/                                         │
│                                                          │
│   launcher.mjs ─────► patches app.asar (atomic rename)   │
│        │              adds --remote-debugging-port=9229   │
│        │                                                 │
│        ├────────► connects via CDP at 127.0.0.1:9229     │
│        │                                                 │
│        └────────► injects dist/timeline.iife.js          │
│                       (React 19 + IIFE)                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

1. **Asar patch** — `launcher/asar-patcher.mjs` prepends a bootstrap block to `out\main\index.js` inside ZCode's `app.asar`. The bootstrap calls `electron.app.commandLine.appendSwitch('remote-debugging-port', '9229')`. The patched asar is written to `app.asar.new` and atomically `rename`'d over the original. The original is backed up as `app.asar.original-<hash[:12]>`.

2. **CDP connection** — once ZCode restarts with the flag, port 9229 is bound. The launcher attaches via `chrome-remote-interface`, enables the usual CDP domains, and `Page.setBypassCSP({enabled: true})` so the injection isn't blocked.

3. **Bundle injection** — `dist/timeline.iife.js` (a React 19 IIFE) is `Runtime.evaluate`'d into ZCode's renderer. The bundle:
   - inserts a single `<style>` element (idempotent)
   - mounts a React tree into a `<div class="zcode-timeline-host">` appended to `<body>`
   - a `MutationObserver` watches the chat container for new user messages
   - heartbeat / `fsWatch` keep it alive across page reloads

4. **Re-inject on change** — both the launcher (every 3s) and a `Page.addScriptToEvaluateOnNewDocument` (every navigation) ensure the timeline survives ZCode's SPA route changes.

5. **Cleanup** — the bundle is the only place that touches ZCode's DOM. Closing ZCode and running `restore-zcode-snapshot.ps1` restores `app.asar` exactly to its pre-patch state (the bootstrap block is removed; original is back from the backup). The `dist/` folder and project directory can then be deleted.

---

## Development

```bash
# Watch mode: rebuild on save and auto-reinject into ZCode
npm run dev

# Production build (minified, no sourcemap)
npm run build

# Dev build (unminified + inline sourcemap)
npm run build:dev

# Clean dist/
npm run clean
```

### Project structure

```
ZCode-Timeline/
├── launcher/         # Node-based asar patcher + CDP injector + heartbeat
├── timeline-src/     # React 19 bundle source (TypeScript + esbuild)
├── scripts/          # ops scripts (restore, probe, verify, install-shortcut)
├── package.json
├── tsconfig.json
└── README.md
```

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `ZCODE_EXE` | _auto-detected_ | Explicit path to `ZCode.exe` |
| `ZCODE_TIMELINE_PORT` | `9229` | CDP port (must match the patched value) |
| `ZCODE_TIMELINE_DISABLE` | _unset_ | Set to skip the asar patch on this run |
| `ZCODE_TIMELINE_MAX_BACKUPS` | `1` | Keep at most N `app.asar.original-<hash>` backups |

### Contributing

Issues and PRs welcome. For substantial changes please open an issue first to discuss the approach. Before opening a PR, run `npm run verify` and confirm the timeline still mounts in your local ZCode.

---

## License

[MIT](./LICENSE) © 2026 ZCode-Timeline contributors