/* ============================================================
   audio.js — sonido sin assets.
   - sfx(name): blips de UI sintetizados (hover, click, open, close…)
   - music: loop chiptune generado en vivo (nano.amp)
   Nada suena hasta que el usuario activa "sound mode" o aprieta play.
   ============================================================ */
window.NanoAudio = (() => {
  let ctx, master, sfxGain, musicGain, analyser, noiseBuf;
  let sfxOn = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = .9;
      sfxGain = ctx.createGain(); sfxGain.gain.value = .22;
      musicGain = ctx.createGain(); musicGain.gain.value = .6;
      analyser = ctx.createAnalyser(); analyser.fftSize = 64; analyser.smoothingTimeConstant = .78;
      sfxGain.connect(master);
      musicGain.connect(analyser); analyser.connect(master);
      master.connect(ctx.destination);
      // ruido blanco corto para hats
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .3, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* ---------- SFX ---------- */
  const SFX = {
    hover: { f: 1900, d: .022, type: 'square',   g: .05 },
    tick:  { f: 2600, d: .012, type: 'square',   g: .03 },
    click: { f: 640,  d: .07,  type: 'square',   g: .18, slide: .5 },
    open:  { f: 330,  d: .16,  type: 'triangle', g: .28, slide: 2 },
    close: { f: 520,  d: .14,  type: 'triangle', g: .25, slide: .45 },
    error: { f: 150,  d: .34,  type: 'sawtooth', g: .26, slide: .65 },
    nudge: { f: 95,   d: .38,  type: 'square',   g: .3,  slide: .6 },
    msg:   { f: 880,  d: .1,   type: 'sine',     g: .22, slide: 1.5 },
    ok:    { f: 523,  d: .12,  type: 'square',   g: .16, slide: 1.5 },
  };
  let lastSmall = 0;
  function sfx(name, force) {
    if (!sfxOn && !force) return;
    const p = SFX[name]; if (!p || !ensure()) return;
    if (p.d < .03) { const n = performance.now(); if (n - lastSmall < 45) return; lastSmall = n; }
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = p.type; o.frequency.setValueAtTime(p.f, t);
    if (p.slide) o.frequency.exponentialRampToValueAtTime(p.f * p.slide, t + p.d);
    g.gain.setValueAtTime(p.g, t); g.gain.exponentialRampToValueAtTime(.0001, t + p.d);
    o.connect(g).connect(sfxGain); o.start(t); o.stop(t + p.d + .03);
  }

  /* ---------- MUSIC: "dial-up dreams" (A minor, 112 bpm) ---------- */
  const BPM = 112, STEP = 60 / BPM / 4;             // semicorchea
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);  // midi → Hz
  // 0 = silencio. 32 pasos = 2 compases.
  const BASS  = [45,0,45,0,45,0,52,0, 41,0,41,0,43,0,43,0, 45,0,45,0,45,0,52,0, 41,0,43,0,47,0,43,0];
  const LEAD1 = [69,0,72,0,76,0,72,0, 77,0,76,0,72,0,69,0, 67,0,69,0,72,0,76,0, 79,0,76,0,72,0,67,0];
  const LEAD2 = [69,0,76,0,81,0,76,0, 77,0,81,0,84,0,81,0, 79,0,76,0,72,0,67,0, 69,0,0,0,64,0,67,0];
  const ARP   = [0,57,0,60,0,64,0,60, 0,53,0,57,0,55,0,59, 0,57,0,60,0,64,0,60, 0,53,0,55,0,59,0,55];
  let playing = false, step = 0, nextT = 0, timer = null, startedAt = 0, elapsedBase = 0, muted = false;

  function tone(freq, t, dur, type, gain, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + .005);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(dest || musicGain); o.start(t); o.stop(t + dur + .02);
  }
  function hat(t, gain) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + .045);
    s.connect(f).connect(g).connect(musicGain); s.start(t); s.stop(t + .06);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
    g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16);
    o.connect(g).connect(musicGain); o.start(t); o.stop(t + .18);
  }
  function playStep(i, t) {
    const b = BASS[i % 32]; if (b) tone(hz(b - 12), t, STEP * 1.7, 'square', .2);
    const L = (i % 128) < 64 ? LEAD1 : LEAD2; const l = L[i % 32]; if (l) tone(hz(l), t, STEP * 1.2, 'square', .11);
    const a = ARP[i % 32]; if (a && (i % 128) >= 32) tone(hz(a + 12), t, STEP * .9, 'triangle', .12);
    if (i % 8 === 0) kick(t);
    if (i % 4 === 2) hat(t, .08);
    if (i % 16 === 14) hat(t + STEP / 2, .05);
  }
  function sched() {
    while (nextT < ctx.currentTime + .15) { playStep(step, nextT); step = (step + 1) % 256; nextT += STEP; }
  }
  const music = {
    play() {
      if (!ensure() || playing) return;
      playing = true; nextT = ctx.currentTime + .05; startedAt = ctx.currentTime;
      timer = setInterval(sched, 60); sched();
    },
    pause() { if (!playing) return; playing = false; clearInterval(timer); elapsedBase += ctx.currentTime - startedAt; },
    toggle() { playing ? music.pause() : music.play(); },
    stop() { music.pause(); step = 0; elapsedBase = 0; },
    get playing() { return playing; },
    setVolume(v) { if (ensure()) musicGain.gain.value = muted ? 0 : v; music._v = v; },
    mute(on) { muted = on; if (ctx) musicGain.gain.value = on ? 0 : (music._v ?? .6); return muted; },
    get muted() { return muted; },
    elapsed() { return elapsedBase + (playing && ctx ? ctx.currentTime - startedAt : 0); },
    levels(n = 14) {
      const out = new Array(n).fill(0); if (!analyser || !playing) return out;
      const data = new Uint8Array(analyser.frequencyBinCount); analyser.getByteFrequencyData(data);
      for (let i = 0; i < n; i++) out[i] = data[Math.min(data.length - 1, i + 1)];
      return out;
    },
    _v: .6,
  };

  return {
    sfx, music,
    get sfxOn() { return sfxOn; },
    setSfx(on) { sfxOn = !!on; if (sfxOn) { ensure(); sfx('ok', true); } },
    unlock: ensure,
  };
})();
