@echo off
rem ==============================================================
rem  Meet Recorder - Standalone screen recorder
rem  HOW TO USE: double-click this file. It opens meet-recorder.html
rem  in Chrome. Click "Start recording", pick "Entire screen" and
rem  tick "Also share system audio". Works with any app (Zoom, Teams,
rem  YouTube...), not only Google Meet. Click "Stop" to save.
rem ==============================================================
rem Opens Meet Recorder in its own Chrome window (falls back to Edge)
set "PAGE=%~dp0meet-recorder.html"
where chrome >nul 2>nul && (start "" chrome --new-window "%PAGE%" & exit /b)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --new-window "%PAGE%" & exit /b)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --new-window "%PAGE%" & exit /b)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --new-window "%PAGE%" & exit /b)
start "" msedge --new-window "%PAGE%"
