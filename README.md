# Meet Recorder

A Chrome / Edge extension that adds a **● Record** button to Google Meet.

It records:
- the meeting video, including any screen someone shares
- everyone's voices
- your microphone

It's free, has no account or sign-up, and nothing is uploaded. Recordings are saved straight to your computer.

## Requirements

- Windows, Mac or Linux
- Google Chrome or Microsoft Edge, recent version
- Optional: ffmpeg, only needed to fix silent audio in Windows' player (see below)

## Setup (one time, about 2 minutes)

### Step 1: Download

**Option A, no git:**
1. On this GitHub page, click the green **Code** button, then **Download ZIP**.
2. Right-click the downloaded ZIP and choose **Extract All**.
3. Move the extracted folder somewhere permanent, for example `Documents\meet-recorder`.

**Option B, with git:**
```bash
git clone https://github.com/rahulsaw13/meet-recorder.git
```

Keep this folder. Chrome loads the extension from it, so deleting or moving it removes the extension.

### Step 2: Add the extension to Chrome

1. In the address bar, type `chrome://extensions` and press Enter. In Edge, use `edge://extensions`.
2. Turn on **Developer mode**. In Chrome it's a switch in the top-right corner. In Edge it's in the left sidebar.
3. Click **Load unpacked**.
4. Open the `meet-recorder` folder, select the **`extension`** folder inside it, and click **Select Folder**.
5. **Meet Recorder** now appears in the list. Make sure its switch is on.
6. Optional: click the puzzle-piece icon in the toolbar, then the pin next to Meet Recorder.

### Step 3: Check it works

1. Open or refresh a Google Meet call. Pages that were already open must be refreshed.
2. A small dark recorder bar should appear in the bottom-left corner of the Meet page.
3. If it doesn't appear, see [Troubleshooting](#troubleshooting).

### Step 4 (Windows, optional): Install ffmpeg

You need ffmpeg only if recordings play without sound in Windows Media Player.
1. Open PowerShell and run:
   ```powershell
   winget install Gyan.FFmpeg
   ```
2. Close PowerShell and open it again.

### Updating to a new version

1. Download the new files into the same folder, or run `git pull` in it.
2. Go to `chrome://extensions` and click **⟳** (reload) on Meet Recorder.
3. Refresh your Meet tab.

## Record

1. Join the meeting. A small recorder bar appears in the bottom-left corner. You can drag it by the ⠿ handle.
2. Choose what to record:
   - **This Meet tab** records exactly what Meet shows, including shared screens.
   - **Whole screen** records everything on your screen.
3. Keep **Mic** ticked to include your own voice.
4. Click **● Record** and choose where to save the file.
5. In Chrome's share dialog, keep **"Also share tab audio"** turned on.
6. Check that the **Meet** and **Mic** level bars move while people talk.
7. Click **■ Stop** when you're done. The file is saved.

**Tip:** to make a shared screen big in the recording, pin it in Meet. Click the three dots on the presentation tile, then **Pin**.

## No sound in Windows Media Player?

Some Chrome versions save the audio in a format (Opus) that Windows' built-in player can't play. The sound is in the file. Fix it with either option:

- Play the file in **VLC**, or drag it into Chrome.
- Convert it:
  1. Install ffmpeg once. In PowerShell, run `winget install Gyan.FFmpeg`, then reopen PowerShell.
  2. Double-click **`Fix Recordings Audio.cmd`**. It converts the recordings in your `Videos` folder to AAC audio and moves the originals to `Videos\original-opus`.

## Standalone recorder (any app, not only Meet)

Double-click **`Start Meet Recorder.cmd`**. It opens `meet-recorder.html` in Chrome, which records your screen, system audio and mic, and can also record the webcam to a separate file.

## Troubleshooting

**The recorder bar doesn't appear in Meet**
- Refresh the Meet tab with F5.
- Go to `chrome://extensions` and check that Meet Recorder is turned on and has no **Errors** button.
- The bar shows only on `meet.google.com`.

**"No meeting audio" warning, or the Meet bar doesn't move**
- In Chrome's share dialog, **"Also share tab audio"** must be on. For "Whole screen", tick **"Also share system audio"**.
- If the warning still shows, the extension takes the audio straight from Meet's own players instead.
- If you're alone in the call, nobody else is talking, so the bar stays empty. Join from your phone to test.

**My own voice is missing**
- Keep **Mic** ticked before you click Record.
- Make sure Meet itself has mic permission. Click the lock icon in the address bar, then **Microphone → Allow**.

**The recording plays without sound**
- See [No sound in Windows Media Player?](#no-sound-in-windows-media-player)

**Chrome shows "Disable developer mode extensions" at startup**
- This warning is normal for extensions loaded with **Load unpacked**. Click **✕** (keep the extension), not Disable.

## Note

Tell everyone in the meeting before you record. In many places this is required by law.
