# scripts/uninstall-autostart.ps1
# Remove the autostart scheduled task installed by install-autostart.ps1.

$ErrorActionPreference = "Stop"

$taskName = "ZCode-Timeline (watch)"

if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "[autostart] removed task: $taskName" -ForegroundColor Green
} else {
  Write-Host "[autostart] no task named '$taskName' was registered." -ForegroundColor Yellow
}

# Also try to terminate any lingering launcher process from the autostart.
$running = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -like '*launcher.mjs*--watch*'
}
if ($running) {
  Write-Host "[autostart] stopping $($running.Count) running launcher process(es)..." -ForegroundColor Yellow
  $running | Stop-Process -Force
} else {
  Write-Host "[autostart] no running launcher processes to stop."
}