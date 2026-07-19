# scripts/restore-zcode-snapshot.ps1
# Manually restore app.asar to its original (unpatched) state.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -Index 2     # pick a specific backup
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -Force       # skip the prompt
#   powershell -ExecutionPolicy Bypass -File scripts\restore-zcode-snapshot.ps1 -WhatIf      # dry-run
#
# D1: before overwriting the current app.asar, snapshot it to
# `app.asar.before-restore-<timestamp>`. The user may change their mind and
# want the patched state back without having to re-run `npm run start`.

param(
  [string]$ZCodeResourcesDir = "S:\ZCode\resources",
  [string]$BackupGlob = "app.asar.original-*",
  [int]$Index = 1,
  [switch]$Force,
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ZCodeResourcesDir)) {
  Write-Host "[error] directory not found: $ZCodeResourcesDir" -ForegroundColor Red
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