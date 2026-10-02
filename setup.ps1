# ==============================================================
#  Meet Recorder - Setup
# ==============================================================
#  HOW TO USE
#    Double-click "Setup.cmd" (it runs this script).
#
#  WHAT IT DOES
#    1. Copies the extension folder path to your clipboard
#    2. Opens the Chrome (or Edge) extensions page
#    3. Shows you the 4 clicks needed to add the extension
#    4. Offers to install ffmpeg (only needed if recordings play
#       without sound in Windows Media Player)
# ==============================================================

$ErrorActionPreference = 'Stop'
$extDir = Join-Path $PSScriptRoot 'extension'

function Step($n, $text) { Write-Host "`n[$n] $text" -ForegroundColor Cyan }
function Info($text)     { Write-Host "    $text" }

Write-Host '=============================================' -ForegroundColor Yellow
Write-Host '          MEET RECORDER - SETUP              ' -ForegroundColor Yellow
Write-Host '=============================================' -ForegroundColor Yellow

if (-not (Test-Path (Join-Path $extDir 'manifest.json'))) {
    Write-Host "`nCannot find the 'extension' folder next to this script." -ForegroundColor Red
    Write-Host 'Unzip the whole download first, then run Setup.cmd again.'
    Read-Host "`nPress Enter to close"
    exit 1
}

Write-Host "`nKeep this folder where it is. Chrome loads the extension from it:"
Write-Host "    $PSScriptRoot" -ForegroundColor Green

# --- Find a browser ---
$candidates = @(
    @{ Name = 'Chrome'; Page = 'chrome://extensions'; Paths = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LocalAppData\Google\Chrome\Application\chrome.exe") },
    @{ Name = 'Edge'; Page = 'edge://extensions'; Paths = @(
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") }
)
$browser = $null
foreach ($c in $candidates) {
    $exe = $c.Paths | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($exe) { $browser = $c; $browser.Exe = $exe; break }
}

# --- Step 1: copy path ---
Step 1 'Extension folder path copied to clipboard:'
Set-Clipboard -Value $extDir
Info $extDir

# --- Step 2: open extensions page ---
if ($browser) {
    Step 2 "Opening $($browser.Name) extensions page..."
    Start-Process $browser.Exe $browser.Page
} else {
    Step 2 'Chrome/Edge not found automatically.'
    Info 'Open Chrome and type  chrome://extensions  in the address bar.'
}

# --- Step 3: what to click ---
Step 3 'In the extensions page:'
Info 'a) Turn ON "Developer mode"  (top-right switch; in Edge: left sidebar)'
Info 'b) Click "Load unpacked"'
Info 'c) In the folder box at the top, press Ctrl+V, then Enter'
Info 'd) Click "Select Folder"'
Info '=> "Meet Recorder" appears in the list. Make sure its switch is ON.'
Read-Host "`n    Press Enter when done"

# --- Step 4: ffmpeg (optional) ---
Step 4 'Optional: ffmpeg (fixes recordings that play silent in Windows Media Player)'
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    Info 'ffmpeg is already installed.'
} elseif (Get-Command winget -ErrorAction SilentlyContinue) {
    $ans = Read-Host '    Install ffmpeg now? (y/n)'
    if ($ans -match '^[yY]') {
        winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
        Info 'Done. Restart your computer or log out and back in so "Fix Recordings Audio.cmd" can find it.'
    } else {
        Info 'Skipped. You can play recordings in VLC instead.'
    }
} else {
    Info 'winget not available. Download ffmpeg from https://www.gyan.dev/ffmpeg/builds/'
    Info 'or play recordings in VLC instead.'
}

# --- How to use ---
Write-Host "`n=============================================" -ForegroundColor Yellow
Write-Host '               HOW TO RECORD                 ' -ForegroundColor Yellow
Write-Host '=============================================' -ForegroundColor Yellow
Info '1. Open or REFRESH your Google Meet tab (F5).'
Info '2. A small recorder bar appears at the bottom-left of Meet.'
Info '3. Choose "This Meet tab" (records shared screens too) or "Whole screen".'
Info '4. Keep "Mic" ticked to include your own voice.'
Info '5. Click "Record" and choose where to save the file.'
Info '6. In Chrome''s share dialog keep "Also share tab audio" ON.'
Info '7. Check the "Meet" and "Mic" bars move when people talk.'
Info '8. Click "Stop" when done. The file is saved.'
Info ''
Info 'No sound in Windows Media Player?  Double-click "Fix Recordings Audio.cmd"'
Info 'or play the file in VLC / Chrome.'
Info ''
Info 'Tell everyone in the meeting before you record.'
Read-Host "`nSetup complete. Press Enter to close"
