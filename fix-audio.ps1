# Converts Opus audio in MP4 recordings to AAC so Windows Media Player / Films & TV can play it.
# Video is copied untouched (fast). Originals are moved to <folder>\original-opus\.
#
# HOW TO USE
#   Easiest:  double-click "Fix Recordings Audio.cmd"   (fixes your Videos folder)
#   Other folder:
#     powershell -ExecutionPolicy Bypass -File fix-audio.ps1 -Folder "D:\Recordings"
#   Needs ffmpeg:  winget install Gyan.FFmpeg
param([string]$Folder = "$env:USERPROFILE\Videos")

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Host "ffmpeg is not installed. Run this once in PowerShell, then try again:"
    Write-Host "    winget install Gyan.FFmpeg"
    return
}

$backup = Join-Path $Folder 'original-opus'
Get-ChildItem $Folder -Filter *.mp4 | ForEach-Object {
    $codec = & ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 $_.FullName
    if ($codec -ne 'opus') { return }

    $tmp = Join-Path $Folder ($_.BaseName + '.aac-tmp.mp4')
    & ffmpeg -v error -y -i $_.FullName -map 0 -c:v copy -c:a aac -b:a 160k -movflags +faststart $tmp
    if ($LASTEXITCODE -eq 0 -and (Test-Path $tmp)) {
        New-Item -ItemType Directory -Force $backup | Out-Null
        Move-Item $_.FullName (Join-Path $backup $_.Name) -Force
        Move-Item $tmp $_.FullName
        Write-Host "Fixed: $($_.Name)"
    } else {
        Remove-Item $tmp -ErrorAction SilentlyContinue
        Write-Host "FAILED: $($_.Name)"
    }
}
