# scripts/install-autostart.ps1
# Register ZCode-Timeline's --watch mode to auto-start at user login.
# Result: timeline injects automatically every time ZCode launches, including
# after a reboot, without you ever opening a terminal.
#
# Usage (PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts\install-autostart.ps1
#
# Uninstall:
#   powershell -ExecutionPolicy Bypass -File scripts\uninstall-autostart.ps1

$ErrorActionPreference = "Stop"

# Resolve script directory (= repo root). The autostart entry should run
# `node launcher/launcher.mjs --watch` from the repo root.
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$launcher = Join-Path $repoRoot 'launcher\launcher.mjs'
$node = (Get-Command node.exe -ErrorAction Stop).Source

if (-not (Test-Path $launcher)) {
  Write-Host "[error] launcher not found at $launcher" -ForegroundColor Red
  exit 1
}

$taskName = "ZCode-Timeline (watch)"
$taskDescription = "Auto-injects Timeline UI into ZCode on launch. Runs silently in background."

# Argument string: --watch + --no-patch (assume user already ran `npm run start`
# once to apply the asar patch; if they haven't, the watch mode will try to patch
# on next login).
$arguments = "`"$launcher`" --watch"

# Idempotency: if a task with this name already exists, replace it.
if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
  Write-Host "[autostart] task already exists; replacing..." -ForegroundColor Yellow
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the task. Trigger = at user logon. Action = run node in a hidden window.
# RunOnlyIfNetworkAvailable is OFF — we don't need network.
# MultipleInstances = IgnoreNew — if it's already running, ignore re-trigger.
$action = New-ScheduledTaskAction `
  -Execute $node `
  -Argument $arguments `
  -WorkingDirectory $repoRoot

$trigger = New-ScheduledTaskTrigger -AtLogOn

$principal = New-ScheduledTaskPrincipal `
  -UserId $env:USERNAME `
  -LogonType Interactive `
  -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Days 0)   # 0 = no timeout

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Description $taskDescription | Out-Null

Write-Host ""
Write-Host "[autostart] registered successfully." -ForegroundColor Green
Write-Host ""
Write-Host "  Task name : $taskName"
Write-Host "  Trigger   : at user logon"
Write-Host "  Action    : node $launcher --watch"
Write-Host "  CWD       : $repoRoot"
Write-Host ""
Write-Host "What happens now:"
Write-Host "  - On your next Windows login, this task starts the launcher in watch mode."
Write-Host "  - Whenever you open ZCode, the launcher auto-injects the timeline."
Write-Host "  - When you close ZCode, the launcher keeps waiting for the next launch."
Write-Host ""
Write-Host "To remove: run scripts\uninstall-autostart.ps1"