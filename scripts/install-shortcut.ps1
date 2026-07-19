# scripts/install-shortcut.ps1
# Creates (or replaces) a Desktop shortcut to launcher.bat.
# Optional: run once if you want a "ZCode with Timeline" icon on the desktop.

param(
  [string]$ShortcutName = "ZCode with Timeline"
)

$ErrorActionPreference = "Stop"

$scriptPath = $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptPath
$launcherBat = Join-Path $projectDir "..\launcher\launcher.bat"
$launcherBat = (Resolve-Path $launcherBat).Path

$desktopDir = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopDir "$ShortcutName.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $launcherBat
$shortcut.WorkingDirectory = (Split-Path -Parent $launcherBat)
$shortcut.WindowStyle = 7              # minimized
$shortcut.IconLocation = "C:\Windows\System32\shell32.dll,12"
$shortcut.Description = "Launches ZCode with the Session Timeline sidebar (CDP-injected, upgrade-safe)."
$shortcut.Save()

Write-Host "[shortcut] created: $shortcutPath"
Write-Host "[shortcut] target:  $launcherBat"
