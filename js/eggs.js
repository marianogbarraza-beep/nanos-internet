/* ============================================================
   eggs.js — easter eggs.
   konami → CRT mode · logo ×5 → nano.exe crashed · "bsod" → pantalla azul
   "msn" → abre el messenger · shutdown desde el start menu
   ============================================================ */
window.Eggs = (() => {
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let ki = 0, buf = '';
  const overlay = document.getElementById('bsod');

  addEventListener('keydown', e => {
    if (e.target.matches('input,textarea,[contenteditable]')) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    ki = (k === KONAMI[ki]) ? ki + 1 : (k === KONAMI[0] ? 1 : 0);
    if (ki === KONAMI.length) { ki = 0; toggleCRT(); }
    if (e.key.length === 1) {
      buf = (buf + k).slice(-10);
      if (buf.endsWith('bsod')) { buf = ''; bsod(); }
      if (buf.endsWith('msn')) { buf = ''; window.App && App.open('msn'); }
      if (buf.endsWith('nano')) { buf = ''; window.App && App.open('face'); }
    }
  });

  function toggleCRT(force) {
    const on = force ?? !document.documentElement.classList.contains('crt');
    document.documentElement.classList.toggle('crt', on);
    Clippy.say(on ? 'CRT MODE ENABLED. 640×480, 60Hz, headache included.' : 'CRT mode off. Your eyes thank you.', 'easter_egg');
    NanoAudio.sfx(on ? 'open' : 'close');
    document.querySelectorAll('[data-crt-label]').forEach(b => b.textContent = on ? 'crt mode: on' : 'crt mode: off');
    return on;
  }

  function bsod() {
    overlay.className = 'bsod'; overlay.hidden = false;
    overlay.innerHTML =
      `<b>nano</b>\n\nA problem has been detected and your portfolio has been shut down to prevent damage to your taste.\n\n` +
      `TOO_MUCH_PERSONALITY_EXCEPTION\n\nIf this is the first time you've seen this screen, relax. It's fake.\n` +
      `If it keeps happening, that's on purpose too.\n\nTechnical information:\n\n*** STOP: 0x00002004 (0xY2K, 0x56K, 0xCLIPPY, 0xMSN)\n\n` +
      `Press any key to continue _`;
    NanoAudio.sfx('error', true);
    const off = () => { overlay.hidden = true; Clippy.say("That was fake. The real one happened in 2003, the night before a deadline."); removeEventListener('keydown', off); };
    setTimeout(() => { addEventListener('keydown', off, { once: true }); overlay.addEventListener('click', off, { once: true }); }, 400);
    setTimeout(off, 5000);
  }

  function shutdown() {
    overlay.className = 'bsod off'; overlay.hidden = false;
    overlay.innerHTML = `<div>It's now safe to turn off your computer.<br><br><small style="color:#777;font-size:11px">(or click anywhere, it's 2026)</small></div>`;
    NanoAudio.music.pause();
    NanoAudio.sfx('close', true);
    const back = () => { overlay.hidden = true; Clippy.say("Rebooted. Nothing was saved. Just like old times."); };
    setTimeout(() => { overlay.addEventListener('click', back, { once: true }); addEventListener('keydown', back, { once: true }); }, 500);
  }

  // logo ×5 rápido → crash
  let clicks = 0, last = 0;
  document.querySelector('.logo').addEventListener('click', e => {
    const now = Date.now(); clicks = now - last < 700 ? clicks + 1 : 1; last = now;
    if (clicks >= 5) { clicks = 0; e.preventDefault(); window.App && App.open('error'); }
  });

  // doble click en el fondo del hero → scramble del tag (chiquito)
  return { toggleCRT, bsod, shutdown };
})();
