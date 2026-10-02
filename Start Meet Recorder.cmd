@echo off
rem Opens Meet Recorder in its own Chrome window (falls back to Edge)
set "PAGE=%~dp0meet-recorder.html"
where chrome >nul 2>nul && (start "" chrome --new-window "%PAGE%" & exit /b)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --new-window "%PAGE%" & exit /b)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --new-window "%PAGE%" & exit /b)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --new-window "%PAGE%" & exit /b)
start "" msedge --new-window "%PAGE%"
