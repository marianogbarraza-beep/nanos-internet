/* ============================================================
   clippy.js — asistente bilingüe. Habla por sección, cuando lo tocás,
   cuando te quedás quieto, y cuando pasa algo (easter eggs).
   Para editar los textos: LINES (inglés) y LINES_ES (rioplatense).
   Clippy.setLang('es'|'en')
   ============================================================ */
window.Clippy = (() => {
  const el = document.getElementById('clippy');
  const bubble = el.querySelector('.bubble');
  const txt = bubble.querySelector('p');
  const tag = bubble.querySelector('b');
  const pupils = el.querySelectorAll('.pupil');

  const LINES = {
    hero: [
      "Hi! It looks like you're trying to look at a portfolio. Want some help? (I can't actually help.)",
      "Welcome to Nano's internet. Try the icons on the left. Or don't. I'll still be here.",
    ],
    about: [
      "There's a person in this machine. Senior Visual Designer at DEPT®. Unreasonable number of open tabs.",
      "2004: FrontPage, 56k, one GIF per hour. 2026: ideas become interactive in one afternoon. Taste is still the slow part.",
    ],
    work: [
      "It looks like you're a recruiter. Should I pretend the Google project was easy?",
      "Hover a project. The thumbnail detaches and follows you. It's clingy. Like me.",
      "16 files, one brain. Google, Netflix, Chevy… and a crypto card. Range.",
    ],
    play: ["Side B. This is where the taste lives.", "AI posters from 2023. Before it was cool. Or after. Hard to tell."],
    photo: ["He also shoots. Of course he does.", "Chile, Mexico, Búzios, Disney. And the DEPT office through a fisheye at 2am."],
    sideb: ["Side B. Photos and experiments. This is where the taste comes from.", "Two tabs: photo archive and play. The DEPT office through a fisheye at 2am is in the first one."],
    contact: [
      "It looks like you're writing a message. Press 'zumbido' for maximum 2004.",
      "Sign the guestbook. Leave a trace. No auto-replies from outer space.",
    ],
    idle: [
      "Still there? I've been here since 1997.",
      "Pro tip: ↑ ↑ ↓ ↓ ← → ← → B A.",
      "Try clicking the logo five times. Fast.",
      "Type 'bsod' anywhere. You've been warned.",
      "Right-click somewhere. Go on.",
    ],
    generic: [
      "Everything here is HTML, CSS and JS. No framework was harmed.",
      "The music is synthesized live. Zero mp3s. Your data plan thanks you.",
      "You can drag any window. Even me? No. Not me. Stop trying.",
      "There's a recycle bin on the desktop. Rejected ideas live there.",
      "Best viewed at 1024×768 with the lights off.",
      "I used to interrupt people's essays. Now I interrupt portfolios. Growth.",
      "nanoamp has skins now. Like Winamp. Like 2001.",
    ],
  };
  const LINES_ES = {
    hero: [
      "¡Hola! Parece que querés ver un portfolio. ¿Te ayudo? (No puedo ayudar, en realidad.)",
      "Bienvenido al internet de Nano. Probá los íconos de la izquierda. O no. Yo me quedo igual.",
    ],
    about: [
      "Hay una persona adentro de esta máquina. Senior Visual Designer en DEPT®. Cantidad irrazonable de pestañas abiertas.",
      "2004: FrontPage, 56k, un GIF por hora. 2026: una idea se vuelve clickeable en una tarde. El gusto sigue siendo lo lento.",
    ],
    work: [
      "Parece que sos recruiter. ¿Hago como que lo de Google fue fácil?",
      "Pasá el mouse por un proyecto. La miniatura se despega y te sigue. Es pegajosa. Como yo.",
      "16 archivos, un cerebro. Google, Netflix, Chevy… y una tarjeta cripto. Rango.",
    ],
    play: ["Lado B. Acá vive el gusto.", "Posters con IA del 2023. Antes de que fuera cool. O después. Difícil saber."],
    photo: ["También saca fotos. Obvio.", "Chile, México, Búzios, Disney. Y la oficina de DEPT con ojo de pez a las 2am."],
    sideb: ["Lado B. Fotos y experimentos. De acá sale el gusto.", "Dos pestañas: archivo de fotos y play. La oficina de DEPT con ojo de pez a las 2am está en la primera."],
    contact: [
      "Parece que estás escribiendo un mensaje. Apretá 'zumbido' para máximo 2004.",
      "Firmá el guestbook. Dejá huella. No hay respuestas automáticas desde el espacio.",
    ],
    idle: [
      "¿Seguís ahí? Yo estoy acá desde 1997.",
      "Dato: ↑ ↑ ↓ ↓ ← → ← → B A.",
      "Hacé click en el logo cinco veces. Rápido.",
      "Escribí 'bsod' en cualquier lado. Avisado estás.",
      "Click derecho en algún lado. Dale.",
    ],
    generic: [
      "Todo esto es HTML, CSS y JS. Ningún framework fue lastimado.",
      "La música se sintetiza en vivo. Cero mp3. Tu plan de datos agradece.",
      "Podés arrastrar cualquier ventana. ¿A mí? No. A mí no. Dejá de intentar.",
      "Hay una papelera en el escritorio. Ahí viven las ideas rechazadas.",
      "Se ve mejor a 1024×768 con la luz apagada.",
      "Antes interrumpía monografías. Ahora interrumpo portfolios. Crecimiento personal.",
      "nanoamp tiene skins ahora. Como Winamp. Como 2001.",
    ],
  };

  let lang = 'en';
  const L = () => lang === 'es' ? LINES_ES : LINES;
  let section = 'hero', hidden = false, timer = null, talkT = null;
  const seen = new Set(['hero']);
  const counters = {};

  function say(text, label = 'clippy.exe', ms = 9000) {
    if (hidden) return;
    txt.textContent = text; tag.textContent = label;
    bubble.classList.remove('hide');
    bubble.style.animation = 'none'; void bubble.offsetWidth; bubble.style.animation = '';
    el.classList.add('talking'); clearTimeout(talkT); talkT = setTimeout(() => el.classList.remove('talking'), 900);
    window.NanoAudio && NanoAudio.sfx('msg');
    clearTimeout(timer); if (ms) timer = setTimeout(() => bubble.classList.add('hide'), ms);
  }
  function sayFor(sec) {
    const arr = L()[sec] || L().generic;
    counters[sec] = (counters[sec] || 0);
    say(arr[counters[sec]++ % arr.length]);
  }
  function setSection(sec) {
    if (sec === section) return;
    section = sec;
    // en el celu el globo taparía los proyectos: en work se calla
    if (sec === 'work' && innerWidth <= 640) return;
    if (!seen.has(sec)) { seen.add(sec); sayFor(sec); }
  }
  function random() {
    const pool = [...(L()[section] || []), ...L().generic];
    say(pool[Math.floor(Math.random() * pool.length)]);
  }
  function hide() { hidden = true; el.classList.add('hidden'); }
  function show() { hidden = false; el.classList.remove('hidden'); say(lang === 'es' ? 'Volví. No te podés deshacer de mí. Nadie pudo.' : "I'm back. You can't get rid of me. Nobody could."); }
  function toggle() { hidden ? show() : hide(); }
  function setLang(l) { lang = l === 'es' ? 'es' : 'en'; document.querySelectorAll('[data-lang-label]').forEach(b => b.textContent = lang === 'es' ? 'Clippy: español' : 'Clippy: english'); const sw = el.querySelector('.langSw'); if (sw) sw.textContent = lang === 'es' ? 'EN' : 'ES'; }

  el.querySelector('.clipBody').addEventListener('click', e => { if (e.target.closest('.clipBye')) return; random(); });
  el.querySelector('.clipBye').addEventListener('click', e => { e.stopPropagation(); hide(); window.NanoAudio && NanoAudio.sfx('close'); });
  bubble.querySelector('.x').addEventListener('click', e => { e.stopPropagation(); bubble.classList.add('hide'); });

  // los ojos siguen el cursor
  if (matchMedia('(pointer:fine)').matches) {
    let raf = 0;
    addEventListener('pointermove', e => {
      if (raf || hidden) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const cx = r.right - 31, cy = r.top + r.height * .35;
        const a = Math.atan2(e.clientY - cy, e.clientX - cx);
        const dx = (Math.cos(a) * 1.8).toFixed(2), dy = (Math.sin(a) * 1.8).toFixed(2);
        pupils.forEach(p => p.setAttribute('transform', `translate(${dx} ${dy})`));
      });
    }, { passive: true });
  }

  // idle
  let idleT;
  const resetIdle = () => { clearTimeout(idleT); idleT = setTimeout(() => { if (!document.hidden) sayFor('idle'); resetIdle(); }, 45000); };
  ['pointermove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(ev => addEventListener(ev, resetIdle, { passive: true }));
  resetIdle();

  return { say, sayFor, setSection, hide, show, toggle, random, setLang, get lang() { return lang; }, get hidden() { return hidden; } };
})();
