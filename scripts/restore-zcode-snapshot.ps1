# scripts/restore-zcode-snapshot.ps1
# Manually restore app.asar to its original (unpatched) state.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -Index 2     # pick a specific backup
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -Force       # skip the prompt
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -WhatIf      # dry-run
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -ZCodeResourcesDir "D:\Apps\ZCode\resources"
#
# D1: before overwriting the current app.asar, snapshot it to
# `app.asar.before-restore-<timestamp>`. The user may change their mind and
# want the patched state back without having to re-run `npm run start`.

param(
  [string]$ZCodeResourcesDir = "",
  [string]$BackupGlob = "app.asar.original-*",
  [int]$Index = 1,
  [switch]$Force,
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

# Auto-detect ZCode's resources dir if -ZCodeResourcesDir was not supplied.
# Probe order:
#   1. Explicit -ZCodeResourcesDir argument (already in $ZCodeResourcesDir)
#   2. $env:ZCODE_EXE + sibling "resources" folder
#   3. S:\ZCode\resources, C:\ZCode\resources (developer paths)
#   4. %LOCALAPPDATA%\Programs\ZCode\resources, ZCode Desktop, ZCode-Dev
#   5. Currently running ZCode.exe (Get-Process) → its resources dir
function Resolve-ZCodeResourcesDir {
  param([string]$Explicit)
  if ($Explicit -and (Test-Path $Explicit)) { return $Explicit }

  if ($env:ZCODE_EXE -and (Test-Path $env:ZCODE_EXE)) {
    $dir = Join-Path (Split-Path $env:ZCODE_EXE -Parent) 'resources'
    if (Test-Path $dir) { return $dir }
  }

  $candidates = @(
    'S:\ZCode\resources',
    'C:\ZCode\resources',
    (Join-Path $env:LOCALAPPDATA 'Programs\ZCode\resources'),
    (Join-Path $env:LOCALAPPDATA 'Programs\ZCode Desktop\resources'),
    (Join-Path $env:LOCALAPPDATA 'Programs\ZCode-Dev\resources')
  )
  foreach ($c in $candidates) {
    if ($c -and (Test-Path $c)) { return $c }
  }

  try {
    $runningExe = & powershell -NoProfile -Command "(Get-Process -Name 'ZCode' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Path)"
    if ($runningExe -and (Test-Path $runningExe)) {
      $dir = Join-Path (Split-Path $runningExe -Parent) 'resources'
      if (Test-Path $dir) { return $dir }
    }
  } catch { }

  return $null
}

if (-not $ZCodeResourcesDir) {
  $ZCodeResourcesDir = Resolve-ZCodeResourcesDir -Explicit $ZCodeResourcesDir
}

if (-not $ZCodeResourcesDir -or -not (Test-Path $ZCodeResourcesDir)) {
  Write-Host "[error] could not find ZCode's resources directory." -ForegroundColor Red
  Write-Host "Pass -ZCodeResourcesDir explicitly, e.g.:" -ForegroundColor Yellow
  Write-Host "  powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -ZCodeResourcesDir 'D:\Apps\ZCode\resources'" -ForegroundColor Yellow
  exit 1
}

$currentAsar = Join-Path $ZCodeResourcesDir "app.asar"
$backups = Get-ChildItem -Path $ZCodeResourcesDir -Filter $BackupGlob -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending

if (-not $backups -or $backups.Count -eq 0) {
  Write-Host "[error] no backups found matching $BackupGlob in $ZCodeResourcesDir" -ForegroundColor Red
  exit 2
}

Write-Host "[restore] backups available (newest first):" -ForegroundColor Yellow
$i = 1
foreach ($b in $backups) {
  $marker = if ($i -eq $Index) { " <-- selected" } else { "" }
  Write-Host ("  [{0}]  {1}  {2}  ({3:N0} bytes){4}" -f $i, $b.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'), $b.Name, $b.Length, $marker)
  $i++
}

if ($Index -lt 1 -or $Index -gt $backups.Count) {
  Write-Host "[error] -Index $Index out of range (1..$($backups.Count))" -ForegroundColor Red
  exit 3
}

$chosen = $backups[$Index - 1]

# D1: safety backup of the *current* asar so the user can recover the
# patched state if they change their mind.
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$safetyBackup = Join-Path $ZCodeResourcesDir ("app.asar.before-restore-{0}" -f $stamp)

Write-Host ""
Write-Host "[restore] plan:" -ForegroundColor Cyan
Write-Host "  chosen     : $($chosen.FullName)"
Write-Host "  destination: $currentAsar"
Write-Host "  safety     : $safetyBackup"
if ($WhatIf) {
  Write-Host ""
  Write-Host "[restore] -WhatIf specified; no changes made." -ForegroundColor Yellow
  exit 0
}

if (-not $Force) {
  Write-Host ""
  $reply = Read-Host "Proceed? [y/N]"
  if ($reply -ne 'y' -and $reply -ne 'Y') {
    Write-Host "[restore] cancelled."
    exit 0
  }
}

# 1. Safety snapshot of current asar (only if it exists).
if (Test-Path $currentAsar) {
  Copy-Item -Path $currentAsar -Destination $safetyBackup -Force
  Write-Host "[restore] safety backup written: $safetyBackup" -ForegroundColor Green
} else {
  Write-Host "[restore] no current app.asar to safety-backup; skipping." -ForegroundColor Yellow
}

# 2. Stage the chosen backup to a sibling .new then atomically rename. Same
# pattern as asar-patcher.mjs: never writeFileSync over the live file.
$tmpAsar = "$currentAsar.new"
Copy-Item -Path $chosen.FullName -Destination $tmpAsar -Force
try {
  Move-Item -Path $tmpAsar -Destination $currentAsar -Force
} catch {
  Remove-Item -Path $tmpAsar -Force -ErrorAction SilentlyContinue
  Write-Host "[error] failed to swap app.asar: $_" -ForegroundColor Red
  Write-Host "  Your current asar is at $safetyBackup." -ForegroundColor Yellow
  exit 4
}

# 3. Note: this script doesn't update .state.json. After running, the
# launcher will detect the rolled-back asar via asarHasMarker() (B2) and
# re-patch on the next start.
Write-Host ""
Write-Host "[restore] done. Verify with:" -ForegroundColor Green
Write-Host "  npm run verify"
Write-Host ""
Write-Host "Note: your patched state is preserved at:" -ForegroundColor Yellow
Write-Host "  $safetyBackup"
Write-Host "To re-patch on the next launcher start, just run \`npm run start\`." -ForegroundColor Yellow