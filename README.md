# Meet Recorder

A Chrome / Edge extension that adds a **● Record** button to Google Meet.

It records:
- the meeting video, including any screen someone shares
- everyone's voices
- your microphone

It's free, has no account or sign-up, and nothing is uploaded. Recordings are saved straight to your computer.

## Install (one time)

1. Download this repo: **Code → Download ZIP**. Unzip it somewhere permanent, for example `Documents\meet-recorder`. Don't delete the folder later, because Chrome loads the extension from it.
2. Open `chrome://extensions` (in Edge: `edge://extensions`).
3. Turn on **Developer mode** with the switch in the top-right corner.
4. Click **Load unpacked** and select the `extension` folder inside `meet-recorder`.
5. Open or refresh your Google Meet tab.

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

## Note

Tell everyone in the meeting before you record. In many places this is required by law.
