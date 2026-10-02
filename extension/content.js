// Meet Recorder: floating Record button injected into Google Meet.
// Captures the Meet tab (or whole screen) + tab/system audio + your mic, mixed into one file.
(() => {
  if (window.__meetRecorderLoaded) return;
  window.__meetRecorderLoaded = true;

  // AAC first: Windows Media Player / Films & TV play MP4+Opus as silent video
  const MIME_CANDIDATES = [
    'video/mp4;codecs=avc1.640028,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=avc1.640028,opus',
    'video/mp4;codecs=avc1,opus',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  const pickMime = () => MIME_CANDIDATES.find(m => MediaRecorder.isTypeSupported(m)) || '';
  const extFor = mime => (mime.startsWith('video/mp4') ? 'mp4' : 'webm');

  // ---- UI (shadow DOM so Meet's CSS can't touch it) ----
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:16px;bottom:96px;z-index:2147483647;';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      .box { font:13px/1.3 system-ui, Segoe UI, sans-serif; color:#fff; background:rgba(32,33,36,.92);
             border-radius:12px; padding:8px; display:flex; gap:6px; align-items:center;
             box-shadow:0 4px 16px rgba(0,0,0,.4); user-select:none; }
      button { font:inherit; border:0; border-radius:8px; padding:7px 12px; cursor:pointer; color:#fff; background:#3c4043; }
      button:hover { filter:brightness(1.2); }
      [hidden] { display:none !important; }
      #rec { background:#d93025; font-weight:600; }
      select { font:inherit; background:#3c4043; color:#fff; border:0; border-radius:8px; padding:6px; }
      .dot { width:10px; height:10px; border-radius:50%; background:#d93025; animation:b 1s infinite; }
      .dot.paused { animation:none; background:#9aa0a6; }
      @keyframes b { 50% { opacity:.2; } }
      #time { font:600 13px ui-monospace, Consolas, monospace; min-width:62px; }
      #msg { max-width:260px; color:#fdd663; }
      .meter { display:flex; align-items:center; gap:3px; font-size:11px; color:#9aa0a6; }
      .meter b { display:block; width:40px; height:6px; background:#3c4043; border-radius:3px; overflow:hidden; }
      .meter i { display:block; height:100%; width:0; background:#34a853; transition:width .15s; }
      .drag { cursor:move; color:#9aa0a6; padding:0 2px; }
    </style>
    <div class="box">
      <span class="drag" title="Drag">⠿</span>
      <select id="src" title="What to record">
        <option value="tab">This Meet tab</option>
        <option value="screen">Whole screen</option>
      </select>
      <label title="Record your microphone" style="display:flex;align-items:center;gap:4px">
        <input type="checkbox" id="mic" checked> Mic
      </label>
      <button id="rec">● Record</button>
      <span class="dot" id="dot" hidden></span>
      <span id="time" hidden>00:00:00</span>
      <span class="meter" id="mSys" hidden title="Meeting audio level">Meet<b><i></i></b></span>
      <span class="meter" id="mMic" hidden title="Your mic level">Mic<b><i></i></b></span>
      <button id="pause" hidden>Pause</button>
      <button id="stop" hidden>■ Stop</button>
      <span id="msg"></span>
    </div>`;
  document.documentElement.appendChild(host);
  const $ = id => root.getElementById(id);

  // Drag handle
  root.querySelector('.drag').addEventListener('pointerdown', e => {
    const r = host.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = ev => {
      host.style.left = Math.max(0, ev.clientX - dx) + 'px';
      host.style.top = Math.max(0, ev.clientY - dy) + 'px';
      host.style.bottom = 'auto';
    };
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); };
    addEventListener('pointermove', move); addEventListener('pointerup', up);
  });

  const say = (text, ms = 6000) => {
    $('msg').textContent = text;
    if (ms) setTimeout(() => { if ($('msg').textContent === text) $('msg').textContent = ''; }, ms);
  };

  // ---- Recording ----
  let displayStream, micStream, audioCtx, recorder, sink, timerId, elapsed = 0, lastTick = 0;
  let meters = [];
  let meetAudioBus = null;          // gain node that collects audio from Meet's own <audio> elements
  const tappedStreams = new Set();  // MediaStream ids already connected

  // Meet plays each remote speaker through an <audio> element whose srcObject is a WebRTC MediaStream.
  // Tapping those needs no "share audio" checkbox. New elements appear as people join, so this re-runs.
  function tapMeetAudio() {
    if (!meetAudioBus) return;
    document.querySelectorAll('audio, video').forEach(el => {
      const s = el.srcObject;
      if (!(s instanceof MediaStream) || tappedStreams.has(s.id) || !s.getAudioTracks().length) return;
      tappedStreams.add(s.id);
      audioCtx.createMediaStreamSource(s).connect(meetAudioBus);
    });
  }

  // Live level bar so you can see audio is actually flowing into the recording
  function addMeter(sourceNode, el) {
    const an = audioCtx.createAnalyser();
    an.fftSize = 512;
    sourceNode.connect(an);
    const buf = new Float32Array(an.fftSize);
    meters.push(() => {
      an.getFloatTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v));
      el.querySelector('i').style.width = Math.min(100, peak * 250) + '%';
    });
    el.hidden = false;
  }

  function stamp() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
  }

  function meetCode() {
    const m = location.pathname.match(/[a-z]{3}-[a-z]{4}-[a-z]{3}/);
    return m ? m[0] : 'meet';
  }

  // Streams chunks to disk if the user picks a file; otherwise buffers and downloads on stop
  async function makeSink(name, mime) {
    if (window.showSaveFilePicker) {
      try {
        const ext = '.' + extFor(mime);
        const fh = await window.showSaveFilePicker({
          suggestedName: name,
          startIn: 'videos',
          types: [{ description: 'Video', accept: { [mime.split(';')[0] || 'video/webm']: [ext] } }]
        });
        const w = await fh.createWritable();
        let chain = Promise.resolve();
        return {
          write: b => { chain = chain.then(() => w.write(b)); },
          close: () => chain.then(() => w.close()).then(() => say('Saved ✔'))
        };
      } catch (e) {
        if (e.name === 'AbortError') throw e;
      }
    }
    const chunks = [];
    return {
      write: b => chunks.push(b),
      close: async () => {
        const url = URL.createObjectURL(new Blob(chunks, { type: chunks[0]?.type }));
        const a = Object.assign(document.createElement('a'), { href: url, download: name });
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        say('Downloaded ✔');
      }
    };
  }

  function setRecordingUI(on) {
    $('rec').hidden = on; $('src').hidden = on; $('mic').parentElement.hidden = on;
    $('dot').hidden = !on; $('time').hidden = !on; $('pause').hidden = !on; $('stop').hidden = !on;
    $('pause').textContent = 'Pause'; $('dot').classList.remove('paused');
  }

  async function start() {
    const mime = pickMime();
    // Create + resume the mixer inside the click; created after the dialogs it can stay suspended and record silence
    audioCtx = new AudioContext();
    audioCtx.resume();
    try {
      sink = await makeSink(`${meetCode()}_${stamp()}.${extFor(mime)}`, mime);
    } catch {
      audioCtx.close(); audioCtx = null;
      return; // user cancelled the save dialog
    }

    try {
      const wantTab = $('src').value === 'tab';
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, suppressLocalAudioPlayback: false },
        preferCurrentTab: wantTab,
        selfBrowserSurface: 'include',
        systemAudio: 'include',
        monitorTypeSurfaces: wantTab ? 'exclude' : 'include'
      });

      if (audioCtx.state !== 'running') await audioCtx.resume();
      const dest = audioCtx.createMediaStreamDestination();
      const sysAudio = displayStream.getAudioTracks();
      if (sysAudio.length) {
        const src = audioCtx.createMediaStreamSource(new MediaStream(sysAudio));
        src.connect(dest);
        addMeter(src, $('mSys'));
      } else {
        // Share dialog gave no audio: pull it from Meet's players directly
        meetAudioBus = audioCtx.createGain();
        meetAudioBus.connect(dest);
        addMeter(meetAudioBus, $('mSys'));
        tapMeetAudio();
        say(tappedStreams.size ? 'Meeting audio taken directly from Meet ✔' : 'Waiting for meeting audio…');
      }

      if ($('mic').checked) {
        // Meet already has mic permission on this origin, so no extra prompt
        micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        const src = audioCtx.createMediaStreamSource(micStream);
        src.connect(dest);
        addMeter(src, $('mMic'));
      }
      if (audioCtx.state !== 'running') say('⚠ Audio engine is ' + audioCtx.state + '. Click the page once.', 0);

      const stream = new MediaStream([...displayStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
      recorder = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 4_000_000, audioBitsPerSecond: 128000 });
      const s = sink;
      recorder.ondataavailable = e => { if (e.data.size) s.write(e.data); };
      recorder.done = new Promise(res => { recorder.onstop = () => s.close().then(res); });
      recorder.start(1000);

      displayStream.getVideoTracks()[0].addEventListener('ended', stop);

      setRecordingUI(true);
      elapsed = 0; lastTick = Date.now();
      timerId = setInterval(tick, 200);
      tick();
    } catch (e) {
      say('Could not start: ' + e.message);
      cleanup();
    }
  }

  function tick() {
    const now = Date.now();
    if (recorder?.state === 'recording') elapsed += now - lastTick;
    lastTick = now;
    if (audioCtx?.state === 'suspended') audioCtx.resume();
    meters.forEach(m => m());
    tapMeetAudio();
    const t =Math.floor(elapsed / 1000), p = n => String(n).padStart(2, '0');
    $('time').textContent = `${p(Math.floor(t / 3600))}:${p(Math.floor(t / 60) % 60)}:${p(t % 60)}`;
  }

  function togglePause() {
    if (!recorder) return;
    if (recorder.state === 'paused') { recorder.resume(); $('pause').textContent = 'Pause'; $('dot').classList.remove('paused'); }
    else { recorder.pause(); $('pause').textContent = 'Resume'; $('dot').classList.add('paused'); }
  }

  async function stop() {
    if (!recorder) return;
    const r = recorder; recorder = null;
    clearInterval(timerId);
    if (r.state !== 'inactive') r.stop();
    say('Saving…', 0);
    await r.done;
    cleanup();
  }

  function cleanup() {
    [displayStream, micStream].forEach(s => s?.getTracks().forEach(t => t.stop()));
    displayStream = micStream = null;
    audioCtx?.close(); audioCtx = null;
    meters = [];
    meetAudioBus = null;
    tappedStreams.clear();
    $('mSys').hidden = true; $('mMic').hidden = true;
    setRecordingUI(false);
  }

  // Leaving the call or closing the tab finalises the file instead of losing it
  addEventListener('pagehide', () => { if (recorder) recorder.stop(); });
  addEventListener('beforeunload', e => { if (recorder) { e.preventDefault(); e.returnValue = ''; } });

  $('rec').onclick = start;
  $('pause').onclick = togglePause;
  $('stop').onclick = stop;
})();
