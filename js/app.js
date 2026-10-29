/* ============================================================
   app.js — orquesta todo.
   CONFIG → boot → reveal/scramble → clock + visitor counter →
   sound mode → programas (ventanas) → start menu → preview flotante →
   msn → amp → tracking de sección (clippy + taskbar) → detalles.
   ============================================================ */
const CONFIG = {
  email: 'marianogbarraza@gmail.com', // el msn arma un mailto con la conversación. Vacío = manda a LinkedIn
  visitorBase: 4219,                 // número con el que arranca el contador
  bootOnce: true,                    // true: el boot y el splash ENTER se ven una vez por sesión de navegador
  idleSoundHint: true,
  guestbookEndpoint: '',             // URL REST opcional (GET → JSON [], POST entrada). Vacío = las firmas quedan en el navegador del visitante
  screensaverAfter: 75,              // segundos quieto → screensaver
  prizeAfter: 14,                    // segundos → popup "visitante 1.000.000" (una vez por navegador)
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;

/* ---------- boot ---------- */
(function boot() {
  const loader = $('#loader'), log = $('#bootLog'), bar = $('#bootBar'), pct = $('#bootPct');
  const LINES = [
    ['Checking taste.............', 'OK'],
    ['Loading glitter.dll........', 'OK'],
    ['Dial-up modem..............', 'skipped (fiber now)'],
    ['clippy.dll.................', 'loaded (unfortunately)'],
    ['nano.amp...................', '0 kb, synth'],
    ['Rendering personality......', '100%'],
  ];
  let i = 0, t;
  const finish = (d = 0) => {
    clearInterval(t);
    setTimeout(() => {
      loader.classList.add('done');
      setTimeout(() => { loader.hidden = true; }, 700);   // saca la capa del todo, pase lo que pase con la transición
      document.documentElement.classList.add('booted');
      if (CONFIG.bootOnce) try { sessionStorage.setItem('booted', '1'); } catch (e) {}
      document.documentElement.dispatchEvent(new Event('booted'));
      setTimeout(() => {
        scramble($('.heroTag'));
        if (!$('#splash')) Clippy.say(Clippy.lang === 'es' ? '¡Hola! Parece que querés ver un portfolio. ¿Te ayudo? (No puedo ayudar, en realidad.)' : "Hi! It looks like you're trying to look at a portfolio. Want some help? (I can't actually help.)");
      }, 700);
    }, d);
  };
  let skip = false; try { skip = CONFIG.bootOnce && sessionStorage.getItem('booted'); } catch (e) {}
  if (reduceMotion || skip) { bar.style.width = '100%'; pct.textContent = '100%'; finish(120); return; }
  t = setInterval(() => {
    if (i < LINES.length) {
      const [a, b] = LINES[i++];
      const line = document.createElement('div'); line.innerHTML = `${a} <span class="ok"></span>`; line.querySelector('.ok').textContent = b; log.appendChild(line);
      const p = Math.round(i / LINES.length * 100); bar.style.width = p + '%'; pct.textContent = p + '%';
      NanoAudio.sfx('tick');
    } else finish(260);
  }, 210);
  const skipNow = () => finish(0);
  addEventListener('keydown', skipNow, { once: true });
  loader.addEventListener('click', skipNow, { once: true });
})();

/* ---------- scramble (decode) ---------- */
const CH = '!<>-_\\/[]{}=+*^?#%&';
function scramble(el, dur = 520) {
  if (!el || reduceMotion) return;
  const final = el.dataset.text || (el.dataset.text = el.textContent);
  const start = performance.now();
  el.classList.add('scrambling');
  (function frame(now) {
    const p = Math.min(1, (now - start) / dur);
    let out = '';
    for (let i = 0; i < final.length; i++) out += (i / final.length < p || final[i] === ' ') ? final[i] : CH[Math.random() * CH.length | 0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame); else el.classList.remove('scrambling');
  })(start);
}
$$('.nav a, .startList [data-go]').forEach(a => a.addEventListener('pointerenter', () => scramble(a, 360)));

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  const idx = e.target.querySelector(':scope > .secIndex') || (e.target.classList.contains('secIndex') ? e.target : null);
  if (idx) scramble(idx, 420);
  io.unobserve(e.target);
}), { threshold: .01, rootMargin: '0px 0px 25% 0px' });  // revela un poco antes de entrar: scrolleando rápido no se ve negro
$$('.reveal, .secIndex').forEach(el => io.observe(el));
// red de seguridad: si el observer no dispara (pestaña en segundo plano, navegadores viejos), revelamos por scroll
const revealFallback = () => $$('.reveal:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * 1.25) el.classList.add('in'); });
addEventListener('scroll', revealFallback, { passive: true });
setTimeout(revealFallback, 2500);

/* ---------- clock + visitor counter ---------- */
function clock() {
  const s = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date());
  $('#clock').textContent = s; const t = $('#trayClock'); if (t) t.textContent = s.slice(0, 5);
}
clock(); setInterval(clock, 1000);

(function visitors() {
  const el = $('#visits'); let n = 1;
  try { n = parseInt(localStorage.getItem('nano_visits') || '0', 10) + 1; localStorage.setItem('nano_visits', String(n)); } catch (e) {}
  const days = Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 864e5);
  const total = CONFIG.visitorBase + days * 3 + n;
  const pad = v => String(v).padStart(6, '0');
  const big = $('#visitsBig');
  const set = v => { el.textContent = pad(v); if (big) big.textContent = pad(v); };
  if (reduceMotion) { set(total); return; }
  const start = performance.now(), dur = 1400;
  (function f(now) {
    const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
    set(Math.round(total * e));
    if (p < 1) requestAnimationFrame(f);
  })(start);
  el.closest('span').title = `you are visit #${n} from this browser. the counter is local, like a real 2001 counter that lied a bit.`;
})();

/* ---------- sound mode + blips ---------- */
const snd = $('.sound');
function setSound(on) {
  NanoAudio.setSfx(on);
  snd.classList.toggle('on', on); snd.querySelector('b').textContent = on ? '[on]' : '[off]';
  $$('[data-sound-label]').forEach(b => b.textContent = on ? 'sound: on' : 'sound: off');
}
snd.addEventListener('click', () => setSound(!NanoAudio.sfxOn));
snd.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); snd.click(); } });
document.addEventListener('pointerover', e => {
  if (!NanoAudio.sfxOn || !finePointer) return;
  if (e.target.closest('a,button,.projectRow,.tile,.service,.deskIcon,.tag,.sound,.task,.panel,.badge')) NanoAudio.sfx('hover');
}, { passive: true });
document.addEventListener('click', e => { if (e.target.closest('a,button,.sound,.deskIcon')) NanoAudio.sfx('click'); });

/* ---------- programas (ventanas) ---------- */
const PROGRAMS = {
  amp:     { title: 'nano.amp — dial-up dreams', icon: 'amp', w: 340, onOpen: initAmp, onClose: () => NanoAudio.music.pause() },
  face:    { title: 'nano.jpg', icon: 'face', w: 230, onOpen: initFace },
  msn:     { title: 'nano — conversation', icon: 'msn', w: 390, onOpen: initMsn },
  readme:  { title: 'about_me.txt — notepad', icon: 'txt', w: 440 },
  makingof:{ title: 'making_of.txt — notepad', icon: 'txt', w: 520 },
  resume:  { title: 'resume.pdf', icon: 'pdf', w: 380 },
  recycle: { title: 'recycle bin', icon: 'bin', w: 380, onOpen: initRecycle },
  shop:    { title: 'hire_nano.shop — Netscape Navigator', icon: 'cart', w: 640, cls: 'shopWin', onOpen: initShop },
  error:   { title: 'nano.exe', icon: 'err', w: 380, cls: 'err', onOpen: initError },
};
function open(id, extra) { const p = PROGRAMS[id]; if (!p) return; closeStart(); return WM.open(id, { ...p, ...(extra || {}) }); }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-open]'); if (!b) return;
  e.preventDefault(); open(b.dataset.open);
});

/* nano.amp */
function initAmp(el) {
  const bars = $('.ampBars', el); for (let i = 0; i < 14; i++) bars.appendChild(document.createElement('i'));
  const bs = [...bars.children], clockEl = $('.ampClock', el), amp = $('.amp', el);
  const play = $('[data-amp=play]', el), pause = $('[data-amp=pause]', el), mute = $('[data-amp=mute]', el), vol = $('[data-amp=vol]', el);
  const sync = () => { const p = NanoAudio.music.playing; amp.classList.toggle('playing', p); play.classList.toggle('down', p); pause.classList.toggle('down', !p); mute.classList.toggle('down', NanoAudio.music.muted); };
  play.onclick = () => { NanoAudio.music.play(); sync(); if (!NanoAudio.sfxOn && CONFIG.idleSoundHint) Clippy.say("Music on. Turn 'sound mode' on (top right) and the whole site starts beeping too.", 'nano.amp'); };
  pause.onclick = () => { NanoAudio.music.pause(); sync(); };
  mute.onclick = () => { NanoAudio.music.mute(!NanoAudio.music.muted); sync(); };
  vol.oninput = () => NanoAudio.music.setVolume(vol.value / 100);
  NanoAudio.music.setVolume(vol.value / 100);
  sync();
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  (function loop() {
    if (!document.body.contains(el)) return;
    const lv = NanoAudio.music.levels(14);
    bs.forEach((b, i) => b.style.transform = `scaleY(${Math.max(.06, lv[i] / 255).toFixed(2)})`);
    clockEl.textContent = fmt(NanoAudio.music.elapsed());
    NanoAudio.music.playing ? requestAnimationFrame(loop) : setTimeout(loop, 250);
  })();
}

/* hire_nano.shop — add to cart → checkout → mail / linkedin / resume */
function initShop(el) {
  const count = $('[data-cart-count]', el), product = $('[data-shop-step=product]', el), checkout = $('[data-shop-step=checkout]', el);
  const order = '#2001-' + String(Math.floor(1000 + Math.random() * 9000));
  $('[data-order]', el).textContent = order;
  const avail = $('#availLine'); if (avail) $('[data-shop-avail]', el).textContent = avail.textContent;
  $('[data-shop=linkedin]', el).href = NANO.links.linkedin;
  // reviews: solo las reales de data.js. sin estrellas: con pocas reviews se leerían como una mala nota
  const revs = NANO.reviews || [];
  if (revs.length) {
    const sum = $('[data-reviews-summary]', el);
    sum.innerHTML = `💬 <a href="#" data-shop-reviews></a>`;
    $('a', sum).textContent = `${revs.length} customer review${revs.length > 1 ? 's' : ''} from people who worked with him`;
    $('a', sum).onclick = e => { e.preventDefault(); $('[data-reviews]', el).scrollIntoView({ behavior: 'smooth' }); };
    const list = $('.shopRevList', el);
    revs.forEach(r => {
      const d = document.createElement('div'); d.className = 'shopRev';
      d.innerHTML = '<p></p><div><b></b><span></span></div>';
      $('p', d).textContent = `“${r.text}”`;
      const who = $('b', d);
      if (r.url) { const a = document.createElement('a'); a.href = r.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = r.name; who.appendChild(a); } else who.textContent = r.name;
      $('span', d).textContent = [r.role, r.company].filter(Boolean).join(' · ');
      list.appendChild(d);
    });
    $('[data-reviews]', el).hidden = false;
  }
  const mail = $('[data-shop=mail]', el);
  mail.href = CONFIG.email
    ? `mailto:${CONFIG.email}?subject=${encodeURIComponent(`hire_nano.shop — order ${order}`)}&body=${encodeURIComponent("hey nano,\n\n1× Senior Visual Designer, 2026 Edition.\n\nthe project:\nthe timing:\nreferences (ugly ones welcome):\n")}`
    : NANO.links.linkedin;
  const step = toCheckout => { product.hidden = toCheckout; checkout.hidden = !toCheckout; $('.winBody', el).scrollTop = 0; };
  const add = () => {
    count.textContent = '1';
    NanoAudio.sfx('open');
    step(true);
    if (!document.documentElement.classList.contains('recruiter'))
      Clippy.say(Clippy.lang === 'es' ? 'Excelente elección. Solo queda uno. Bueno, siempre hubo uno solo.' : 'Excellent choice. Only one left in stock. There was only ever one.', 'hire_nano.shop');
  };
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-shop]');
    if (b) {
      const act = b.dataset.shop;
      if (act === 'add') add();
      else if (act === 'buy') { count.textContent = '1'; location.href = mail.href; }
      else if (act === 'cart') { if (count.textContent !== '0') step(true); else NanoAudio.sfx('error', false); }
      else if (act === 'back') { e.preventDefault(); step(false); }
      else if (act === 'go') { const u = $('.shopUrl', el); u.classList.remove('flash'); void u.offsetWidth; u.classList.add('flash'); }
      return;
    }
    // links que llevan a una sección del sitio: cierran la tienda y scrollean
    const c = e.target.closest('[data-shop-close]');
    if (c) { e.preventDefault(); WM.close('shop'); $(c.getAttribute('href'))?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }
  });
}

/* nano.jpg */
function initFace(el) {
  const img = $('img', el);
  WM.makeDraggable(el, img);                       // la cara se arrastra desde la foto
  img.addEventListener('dblclick', () => { img.classList.remove('spin'); void img.offsetWidth; img.classList.add('spin'); NanoAudio.sfx('open'); Clippy.say('Wheee. That was a 360 at 8fps. Stop-motion, baby.'); });
}

/* msn */
function readForm() {
  const g = n => ($(`.form [name=${n}]`)?.value || '').trim();
  return { name: g('name'), contact: g('contact'), type: g('type'), note: g('note') };
}
function mailHref(extra = []) {
  if (!CONFIG.email) return (window.NANO?.links.linkedin) || '#';
  const f = readForm();
  const body = [f.name && `name: ${f.name}`, f.contact && `contact: ${f.contact}`, f.type && `project: ${f.type}`, f.note && `note: ${f.note}`, ...extra.map(m => `> ${m}`)].filter(Boolean).join('\n');
  return `mailto:${CONFIG.email}?subject=${encodeURIComponent(`hey nano — ${f.type || 'a project'}`)}&body=${encodeURIComponent(body || "hey nano, let's make something.")}`;
}
function initMsn(el) {
  const log = $('.msnLog', el), input = $('.msnInput', el), mail = $('.msnMail', el);
  const sent = [];
  const REPLIES = [
    "hey! nano here. well, a script pretending to be nano. the real one answers email in under a day.",
    "noted. is this a campaign, a system, or 'we have a deck on friday'?",
    "love that. send me references if you have them. ugly ones welcome.",
    "ok ok. hit 'email' below and this whole chat goes into the mail. no data leaves this page otherwise.",
    "brb, mate's getting cold 🧉",
  ];
  let r = 0; const history = [];
  const push = (who, text) => {
    const d = document.createElement('div'); d.className = 'm ' + who;
    d.innerHTML = `<b></b><span></span>`; d.querySelector('b').textContent = (who === 'me' ? 'you' : 'nano') + ' says:'; d.querySelector('span').textContent = text;
    log.appendChild(d); log.scrollTop = log.scrollHeight; NanoAudio.sfx('msg'); history.push({ role: who, text });
  };
  const reply = async () => {
    const t = document.createElement('div'); t.className = 'typing'; t.textContent = 'nano is typing…'; log.appendChild(t); log.scrollTop = log.scrollHeight;
    const wait = new Promise(res => setTimeout(res, 700 + Math.random() * 600));
    let text = null;
    if (window.Extras && Extras.ai) text = await Extras.aiReply(history);   // claude.ai: respuesta real
    await wait; t.remove();
    push('nano', text || REPLIES[r++ % REPLIES.length]);
  };
  const f = readForm();
  if (f.note) { push('me', f.note); sent.push(f.note); }
  const ai = window.Extras && Extras.ai;
  push('nano', f.name ? `hey ${f.name}! this is nano's msn. ${ai ? 'ask me anything about the work' : "type here or just hit 'send for real' below"}.` : (ai ? "hey! nano bot here. ask me about the work, the photos, or what it's like at DEPT®. the real nano answers e-mail in under a day." : "hey! this is nano's msn. the real inbox is email, but you can type here and i'll pretend to be online."));
  if (ai) $('.msnHead i', el).textContent = '(online — nano bot, powered by claude)';
  const send = () => {
    const t = input.value.trim(); if (!t) { NanoAudio.sfx('error'); return; }
    push('me', t); sent.push(t); input.value = ''; mail.href = mailHref(sent); reply();
  };
  $('[data-msn=send]', el).onclick = send;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  $('[data-msn=nudge]', el).onclick = () => nudge(el);
  mail.href = mailHref(sent);
  setTimeout(() => input.focus(), 250);
}
function nudge(winEl) {
  [winEl, document.body].forEach(n => { n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake'); });
  NanoAudio.buzz();
  navigator.vibrate?.([90, 40, 90, 40, 90]);   // en el celu también vibra
  setTimeout(() => [winEl, document.body].forEach(n => n.classList.remove('shake')), 600);
  Clippy.say('You just sent a nudge. In 2004 this ended friendships.', 'msn');
}
/* el botón "Sign guestbook" lo maneja extras.js (guestbook) */

/* recycle bin */
function initRecycle(el) {
  $$('[data-restore]', el).forEach(b => b.onclick = () => { NanoAudio.sfx('error'); Clippy.say(`"${b.dataset.restore}" — nope. Deleted for a reason.`, 'recycle bin'); b.textContent = 'no'; b.disabled = true; });
}
/* nano.exe crashed */
function initError(el) {
  NanoAudio.sfx('error', true);
  $('[data-err=send]', el).onclick = () => { WM.close('error'); Clippy.say('Error report sent to 1999. They say hi.', 'nano.exe'); };
  $('[data-err=dont]', el).onclick = () => { WM.close('error'); Clippy.say("Fine. Keep your secrets.", 'nano.exe'); };
}

/* ---------- start menu + taskbar ---------- */
const startBtn = $('#startBtn'), startMenu = $('#startMenu');
function closeStart() { startMenu.hidden = true; startBtn.classList.remove('on'); }
startBtn.addEventListener('click', e => { e.stopPropagation(); startMenu.hidden = !startMenu.hidden; startBtn.classList.toggle('on', !startMenu.hidden); NanoAudio.sfx(startMenu.hidden ? 'close' : 'open'); });
document.addEventListener('click', e => { if (!e.target.closest('#startMenu,#startBtn')) closeStart(); });
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!startMenu.hidden) closeStart(); else if (WM.active) WM.close(WM.active);
});
$$('[data-go]').forEach(b => b.addEventListener('click', () => { closeStart(); document.querySelector(b.dataset.go)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); }));

/* ---------- visor de proyectos (data.js) ---------- */
function openProject(id, startAt = 0) {
  let p = NANO.projects.find(x => x.id === id);
  if (id === 'chevy-ev-2') { p = NANO.projects.find(x => x.id === 'chevy-ev'); startAt = 1; id = 'chevy-ev'; }
  if (!p) return;
  const imgs = p.images && p.images.length ? p.images : [p.cover];
  const html =
    `<div class="viewer"><div class="gal"><div class="detailArt"><img src="img/${imgs[startAt]}" alt="${p.name}"></div>` +
    `<div class="galNav"><button class="btn" data-gal="-1" title="previous (←)">◀</button><span class="galCount"></span><button class="btn" data-gal="1" title="next (→)">▶</button></div>` +
    `<div class="galThumbs">${imgs.map((s, i) => `<img src="img/${s}" alt="" data-i="${i}" loading="lazy">`).join('')}</div></div>` +
    `<div class="detailCopy"><div><h3></h3><p class="vmeta"></p><p class="vdesc"></p><div class="lines"></div></div>` +
    `<div class="row">${p.url ? `<a class="btn hi" href="${p.url}" target="_blank" rel="noopener">[ open original ↗ ]</a>` : `<a class="btn" href="${NANO.links.behance}" target="_blank" rel="noopener">[ more on behance ↗ ]</a>`}<button class="btn" data-random>random work</button></div></div></div>`;
  const rec = WM.open('proj-' + id, { title: `${p.name} — Image Viewer`, icon: 'img', w: Math.min(680, innerWidth - 16), html });
  const el = rec.el;
  $('h3', el).textContent = p.name;
  $('.vmeta', el).textContent = `${p.client} · ${p.role} · ${p.year}`;
  $('.vdesc', el).textContent = p.description;
  renderLines($('.lines', el), p);
  // galería ← →
  let i = startAt; const big = $('.detailArt img', el), count = $('.galCount', el), thumbs = $$('.galThumbs img', el);
  const show = n => {
    i = (n + imgs.length) % imgs.length; big.src = `img/${imgs[i]}`;
    count.textContent = `${i + 1} / ${imgs.length}`; thumbs.forEach((t, k) => t.classList.toggle('cur', k === i));
    NanoAudio.sfx('tick');
  };
  $$('[data-gal]', el).forEach(b => b.onclick = () => show(i + +b.dataset.gal));
  thumbs.forEach(t => t.onclick = () => show(+t.dataset.i));
  big.onclick = () => show(i + 1);
  el.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
  el.tabIndex = -1; el.focus({ preventScroll: true });
  if (imgs.length < 2) $('.galNav', el).hidden = $('.galThumbs', el).hidden = true;
  show(i);
}
function randomProject() {
  const list = NANO.projects.filter(p => !p.featured);
  openProject(list[Math.floor(Math.random() * list.length)].id);
  Clippy.say('Random work. Like channel surfing, but with taste.', 'surf');
}
document.addEventListener('click', e => {
  const p = e.target.closest('[data-project]'); if (p) { e.preventDefault(); openProject(p.dataset.project); return; }
  if (e.target.closest('[data-random]')) { e.preventDefault(); closeStart(); randomProject(); }
});

/* ---------- las tres líneas de cada proyecto (contexto / qué hice / por qué) ---------- */
function renderLines(box, p) {
  if (!box) return; box.innerHTML = '';
  [['context', 'the brief'], ['did', 'what i did'], ['why', 'why it works']].forEach(([k, label]) => {
    if (!p[k]) return;
    const d = document.createElement('div'); d.className = 'line';
    d.innerHTML = `<b></b><span></span>`; $('b', d).textContent = label; $('span', d).textContent = p[k];
    box.appendChild(d);
  });
}
$$('[data-lines]').forEach(box => { const p = NANO.projects.find(x => x.id === box.dataset.lines); if (p) renderLines(box, p); });

/* ---------- status line (MSN personal message) + disponibilidad, desde data.js ---------- */
if (NANO.status) {
  const s = $('#statusLine'); if (s && NANO.status.line) s.textContent = NANO.status.line;
  const a = $('#availLine'); if (a && NANO.status.availability) a.textContent = NANO.status.availability;
}

/* ---------- Side B: pestañas fotos / experimentos ---------- */
function showTab(name, scroll) {
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name));
  $$('.tabPane').forEach(p => { p.hidden = p.dataset.pane !== name; });
  $$(`.tabPane[data-pane=${name}] .reveal:not(.in)`).forEach(el => el.classList.add('in'));
  if (scroll) $('#sideb').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]'); if (!t) return;
  if (t.classList.contains('tab')) { showTab(t.dataset.tab, false); NanoAudio.sfx('click'); return; }
  // links/íconos con data-tab: activan la pestaña y van a Side B
  e.preventDefault(); closeStart(); showTab(t.dataset.tab, true);
});
if (location.hash === '#play' || location.hash === '#photo') showTab(location.hash.slice(1), false);

/* ---------- webring (data.js → NANO.webring) ---------- */
(function webring() {
  const ring = $('#webring'); if (!ring || !NANO.webring || !NANO.webring.length) return;
  ring.hidden = false; let i = 0;
  const go = n => { i = (n + NANO.webring.length) % NANO.webring.length; window.open(NANO.webring[i].url, '_blank', 'noopener'); };
  $$('[data-ring]', ring).forEach(a => a.addEventListener('click', e => {
    e.preventDefault(); const k = a.dataset.ring;
    go(k === 'prev' ? i - 1 : k === 'next' ? i + 1 : Math.floor(Math.random() * NANO.webring.length));
  }));
})();

/* ---------- photo archive (data.js) ---------- */
(function photoGrid() {
  const g = $('#photoGrid'); if (!g || !window.NANO) return;
  NANO.photos.forEach(p => {
    const a = document.createElement('a'); a.className = 'tile photo'; a.href = p.url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = `<i class="tape"></i><img loading="lazy" alt=""><h3></h3><p></p>`;
    const img = $('img', a); img.src = `img/${p.cover}`; img.alt = p.name; if (p.fallback) img.dataset.fallback = `img/${p.fallback}`;
    $('h3', a).textContent = p.name; $('p', a).textContent = `${p.sub} · behance ↗`;
    g.appendChild(a);
  });
})();

/* ---------- filmstrip DEPT (fotos fisheye) ---------- */
/* ---------- case study (hi-res! style): un proyecto contado por capítulos, a pantalla completa ----------
   se arma solo con los campos del proyecto en data.js: context / did / images / why.
   navegación fragmentada (números sueltos), flechas, y una salida siempre a la vista. */
const Case = (() => {
  const box = $('#case'), stage = $('.caseStage', box), nav = $('.caseNav', box), prog = $('.caseProg i', box);
  let chapters = [], cur = 0, proj = null, lastFocus = null;
  const build = p => {
    const gal = (p.images || []).slice(1, 4);
    return [
      { k: `${p.client} · ${p.year}`, t: p.name, x: p.role, img: p.cover, intro: true },
      { k: '01 / the brief', t: 'the brief', x: p.context, img: p.images?.[1] || p.cover },
      { k: '02 / what i did', t: 'what i did', x: p.did, gal: gal.length ? gal : [p.cover] },
      { k: '03 / why it works', t: 'why it works', x: p.why, img: p.cover },
      { k: 'end of tape', t: 'that was it.', x: 'want the full thing, or the human behind it?', end: true },
    ];
  };
  function render() {
    const c = chapters[cur];
    stage.innerHTML = '';
    const s = document.createElement('div'); s.className = 'caseSlide' + (c.intro ? ' intro' : '') + (c.end ? ' end' : '');
    s.innerHTML = `<div class="caseCopy"><small></small><h2></h2><p></p></div>`;
    $('small', s).textContent = c.k; $('h2', s).textContent = c.t; $('p', s).textContent = c.x;
    if (c.img) { const f = document.createElement('figure'); f.className = 'caseArt'; f.innerHTML = '<img alt="">'; $('img', f).src = `img/${c.img}`; $('img', f).alt = proj.name; s.prepend(f); }
    if (c.gal) { const g = document.createElement('div'); g.className = 'caseGal'; c.gal.forEach((im, i) => { const b = document.createElement('button'); b.innerHTML = '<img alt="">'; $('img', b).src = `img/${im}`; $('img', b).alt = `${proj.name} — ${i + 1}`; b.onclick = () => openProject(proj.id, i + 1); g.appendChild(b); }); s.prepend(g); }
    if (c.end) {
      const a = document.createElement('div'); a.className = 'caseEnd';
      a.innerHTML = (proj.url ? `<a class="btn hi" target="_blank" rel="noopener">[ open original on behance ↗ ]</a>` : '') +
        `<button class="btn" data-case="gallery">[ all images ]</button><button class="btn hi" data-case="hire">[ 🛒 hire_nano.shop ]</button><button class="btn" data-case="exit">[ back to the work ]</button>`;
      if (proj.url) $('a', a).href = proj.url;
      $('.caseCopy', s).appendChild(a);
    }
    stage.appendChild(s);
    $$('button', nav).forEach((b, i) => b.classList.toggle('on', i === cur));
    prog.style.width = `${(cur / (chapters.length - 1)) * 100}%`;
    NanoAudio.sfx(cur ? 'tick' : 'open');
  }
  function go(i) { cur = Math.max(0, Math.min(chapters.length - 1, i)); render(); }
  function open(id) {
    proj = NANO.projects.find(p => p.id === id); if (!proj) return;
    chapters = build(proj); cur = 0; lastFocus = document.activeElement;
    $('.caseTitle', box).textContent = `${proj.name.toLowerCase().replace(/\s+/g, '_')}.case`;
    nav.innerHTML = '';
    chapters.forEach((c, i) => {
      const b = document.createElement('button'); b.textContent = i === chapters.length - 1 ? '■' : String(i).padStart(2, '0');
      b.title = c.t; b.style.setProperty('--r', `${(i * 37) % 11 - 5}deg`); b.onclick = () => go(i); nav.appendChild(b);
    });
    box.hidden = false; document.documentElement.classList.add('caseOpen');
    render(); $('.caseExit', box).focus();
  }
  function close() {
    if (box.hidden) return;
    box.hidden = true; document.documentElement.classList.remove('caseOpen'); NanoAudio.sfx('close');
    $('#' + proj.id)?.scrollIntoView({ block: 'start' }); lastFocus?.focus?.();
  }
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-case]');
    if (b) { const a = b.dataset.case; if (a === 'exit') close(); else if (a === 'gallery') openProject(proj.id); else if (a === 'hire') { close(); App.open('shop'); } return; }
    if (e.target.closest('button,a,.caseBar,.caseNav')) return;
    go(cur + (e.clientX < innerWidth / 3 ? -1 : 1));   // click en el tercio izquierdo vuelve, el resto avanza
  });
  addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft') go(cur - 1);
  });
  document.addEventListener('click', e => { const b = e.target.closest('[data-case-open]'); if (b) { e.preventDefault(); open(b.dataset.caseOpen); } });
  return { open, close };
})();

/* lab_log: experimentos (group 'play') del más nuevo al más viejo, cada uno con su pregunta y lo que salió */
(function labLog() {
  const list = $('#labList'); if (!list || !window.NANO) return;
  const items = NANO.projects.filter(p => p.group === 'play').sort((a, b) => b.year - a.year);
  $('#labCount').textContent = String(items.length).padStart(2, '0');
  items.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML =
      `<div class="labDate"><b></b><small></small></div>` +
      `<button class="labThumb" data-project="${p.id}"><img loading="lazy" alt=""></button>` +
      `<div class="labBody"><h3><span class="labDir"></span></h3><p class="labQ"><i>q:</i> <span></span></p><p class="labA"><i>→</i> <span></span></p>` +
      `<div class="labActs"><a href="#" data-project="${p.id}">[ open ]</a></div></div>`;
    $('.labDate b', li).textContent = p.year;
    $('.labDate small', li).textContent = `#${String(items.length - i).padStart(3, '0')}`;
    $('.labThumb img', li).src = `img/${p.cover}`; $('.labThumb img', li).alt = p.name;
    $('.labDir', li).textContent = p.id.replace(/-/g, '_') + '/';
    $('h3', li).append(` ${p.name} · ${p.role.toLowerCase()}`);
    $('.labQ span', li).textContent = p.context;
    $('.labA span', li).textContent = p.why;
    if (p.url) { const a = document.createElement('a'); a.href = p.url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '[ full project on behance ↗ ]'; $('.labActs', li).append(' ', a); }
    list.appendChild(li);
  });
})();
(function filmstrip() {
  const fs = $('#filmstrip'); if (!fs || !window.NANO) return;
  NANO.dept.forEach(n => {
    const id = String(n).padStart(3, '0');
    const a = document.createElement('a'); a.href = '#'; a.title = `frame_${id}.jpg`;
    a.innerHTML = `<img loading="lazy" src="img/dept-${id}.webp" alt="DEPT 2nd floor opening — frame ${id}">`;
    a.addEventListener('click', ev => {
      ev.preventDefault();
      WM.open('frame-' + id, { title: `FRAME_${id}.JPG — Image Viewer`, icon: 'img', w: Math.min(560, innerWidth - 16), html: `<div class="detailArt"><img src="img/dept-${id}.webp" alt="frame ${id}"></div><p class="muted" style="margin:6px 0 0">dept® 2nd floor opening · after hours · through a fisheye</p>` });
    });
    fs.appendChild(a);
  });
})();
$('[data-act=sound]').addEventListener('click', () => { setSound(!NanoAudio.sfxOn); closeStart(); });
$$('[data-act=crt]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); Eggs.toggleCRT(); closeStart(); }));
$('[data-act=clippy]').addEventListener('click', () => { Clippy.toggle(); closeStart(); });
$('[data-act=shutdown]').addEventListener('click', () => { closeStart(); Eggs.shutdown(); });

/* ---------- tracking de sección (clippy + tray) ---------- */
const secIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const id = e.target.dataset.sec; $('#traySec').textContent = id; Clippy.setSection(id);
}), { rootMargin: '-45% 0px -45% 0px' });
$$('[data-sec]').forEach(s => secIO.observe(s));

/* ---------- preview flotante en work (solo mouse) ---------- */
if (finePointer && !reduceMotion) {
  const prev = $('#preview'), pimg = $('img', prev), plab = $('small', prev);
  let tx = 0, ty = 0, cx = 0, cy = 0, rot = 0, vis = false, running = false;
  $$('.projectRow').forEach(row => {
    const img = $('img', row);
    row.addEventListener('pointerenter', e => {
      pimg.src = img.currentSrc || img.src; plab.textContent = $('.pmeta', row).textContent;
      if (!vis) { cx = e.clientX / Z(); cy = e.clientY / Z(); }
      vis = true; prev.classList.add('on'); row.classList.add('lift'); if (!running) tick();
    });
    row.addEventListener('pointerleave', () => { vis = false; prev.classList.remove('on'); row.classList.remove('lift'); });
  });
  const Z = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z')) || 1;
  addEventListener('pointermove', e => { tx = e.clientX / Z(); ty = e.clientY / Z(); }, { passive: true });
  function tick() {
    running = true;
    cx += (tx - cx) * .16; cy += (ty - cy) * .16;
    rot += (((tx - cx) * .06) - rot) * .2;
    // cuantizado a 4px / 1.5°: el seguimiento queda un toque "a mano"
    const qx = Math.round(cx / 4) * 4, qy = Math.round(cy / 4) * 4, qr = Math.round(rot / 1.5) * 1.5;
    prev.style.transform = `translate(${qx}px,${qy}px) translate(-50%,-50%) rotate(${qr}deg)`;
    if (vis || Math.abs(tx - cx) > 1 || Math.abs(ty - cy) > 1) requestAnimationFrame(tick); else running = false;
  }
}

/* ---------- botón magnético [send] ---------- */
if (finePointer && !reduceMotion) {
  const b = $('.send');
  addEventListener('pointermove', e => {
    const r = b.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
    const dx = e.clientX - mx, dy = e.clientY - my, d = Math.hypot(dx, dy);
    b.style.transform = d < 110 ? `translate(${Math.round(dx * .18 / 2) * 2}px,${Math.round(dy * .18 / 2) * 2}px)` : '';
  }, { passive: true });
}

/* ---------- cara del hero → abre nano.jpg ---------- */
$('.faceCut img').addEventListener('click', () => open('face'));

/* la cara te mira: gira hacia el cursor en 3D, a saltos de 4° (stop-motion, como el resto del sitio).
   guiño a los portfolios de 2004 con ojos que seguían el mouse */
if (finePointer && !reduceMotion) {
  const face = $('.faceCut');
  let raf = 0, mx = 0, my = 0;
  const look = () => {
    raf = 0;
    const r = face.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const dx = (mx - (r.left + r.width / 2)) / innerWidth, dy = (my - (r.top + r.height / 2)) / innerHeight;
    const snap = v => Math.round(v / 4) * 4;
    const ry = snap(Math.max(-24, Math.min(24, dx * 60))), rx = snap(Math.max(-16, Math.min(16, -dy * 40)));
    face.style.transform = `perspective(600px) rotateY(${ry}deg) rotateX(${rx}deg)`;
  };
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(look); }, { passive: true });
  document.addEventListener('pointerleave', () => { face.style.transform = ''; });
}

/* ---------- "e-mail nano" del hero → msn con el texto ---------- */
$('[data-quick]').addEventListener('submit', e => {
  e.preventDefault();
  const v = e.target.quick.value.trim();
  if (v) { const n = $('.form [name=note]'); if (n && !n.value) n.value = v; }
  e.target.quick.value = '';
  open('msn');
});

/* ---------- imágenes rotas (hotlinks, o tu foto/gif que todavía no pusiste) ---------- */
$$('img').forEach(i => {
  const broken = () => {
    if (i.dataset.fallback && i.getAttribute('src') !== i.dataset.fallback) { i.src = i.dataset.fallback; i.classList.add('isFallback'); return; }
    i.classList.add('noimg');
    i.closest('.faceCut')?.classList.add('noimg');
    const g = i.closest('.gifBox'); if (g) g.hidden = true;
  };
  i.addEventListener('error', broken);
  if (i.complete && i.naturalWidth === 0 && i.getAttribute('src')) broken();   // ya falló antes de que llegáramos
});

/* ---------- estela de estrellitas (solo mouse) ---------- */
if (finePointer && !reduceMotion) {
  const trail = $('#trail'), N = 10, COLORS = ['#fff', '#39ff14', '#00f0ff', '#ff3cf0', '#ffe600'];
  const dots = Array.from({ length: N }, (_, i) => { const d = document.createElement('i'); d.style.background = COLORS[i % COLORS.length]; trail.appendChild(d); return { el: d, x: 0, y: 0 }; });
  let mx = -100, my = -100, moving = 0;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; moving = 12; }, { passive: true });
  (function loop() {
    let px = mx, py = my;
    dots.forEach((d, i) => {
      d.x += (px - d.x) * .35; d.y += (py - d.y) * .35;
      const s = 1 - i / N;
      d.el.style.transform = `translate(${Math.round(d.x / 2) * 2}px,${Math.round(d.y / 2) * 2}px) translate(-50%,-50%) scale(${s.toFixed(2)}) rotate(${(i * 36) % 360}deg)`;
      d.el.style.opacity = moving > 0 ? (s * .9).toFixed(2) : '0';
      px = d.x; py = d.y;
    });
    if (moving > 0) moving--;
    requestAnimationFrame(loop);
  })();
}

/* ---------- título de la pestaña ---------- */
const TITLE = document.title;
document.addEventListener('visibilitychange', () => { document.title = document.hidden ? '⟵ nano is waiting…' : TITLE; });

/* ---------- API pública (la usan eggs.js y los templates) ---------- */
window.App = { open, setSound, nudge, mailHref, readForm, openProject, randomProject, showTab, closeStart, CONFIG };
