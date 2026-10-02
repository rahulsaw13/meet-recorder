@echo off
rem ==============================================================
rem  Meet Recorder - Fix Recordings Audio
rem  HOW TO USE: double-click this file after a meeting.
rem  Use it when a recording plays WITHOUT SOUND in Windows Media
rem  Player / Films & TV. It converts the audio of every .mp4 in
rem  your Videos folder to AAC. The video is not re-encoded.
rem  Originals are moved to Videos\original-opus.
rem  Needs ffmpeg (Setup.cmd can install it).
rem ==============================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0fix-audio.ps1"
pause
