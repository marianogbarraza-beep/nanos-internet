/* ============================================================
   clean/main.js — arma las secciones desde js/data.js (el mismo
   contenido que la versión classic) y maneja: nav, reveal, preview
   del índice, visor de galería y case study por capítulos.
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IMG = f => `img/${f}`;   // la página vive en la raíz (index.html); clean/ solo tiene estilos y lógica
const reduceMotion = matchMedia('(prefers-reduced-motion:reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;
const P = id => NANO.projects.find(p => p.id === id);
// miniaturas livianas para el índice (las originales quedan para el visor)
const THUMB = { christmas: 'th-christmas.jpg', trubit: 'th-trubit.jpg', diskhe: 'th-diskhe.jpg', soledad: 'th-soledad.jpg', altra: 'th-altra.jpg' };
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

/* ---------- featured: los 3 grandes ---------- */
(function featured() {
  const box = $('#featured');
  NANO.projects.filter(p => p.featured).forEach((p, i) => {
    const art = el('article', 'feat reveal');
    const media = el('a', 'featMedia win'); media.href = '#'; media.dataset.view = p.id;
    media.innerHTML = '<div class="winBar"><span></span><i>_</i><i>□</i><i>×</i></div><div class="winBody"><img loading="lazy" alt=""></div>';
    $('.winBar span', media).textContent = `${String(i + 1).padStart(2, '0')}_${p.id}.jpg`;
    const img = $('img', media); img.src = IMG(p.cover); img.alt = p.name;
    const info = el('div', 'featInfo');
    info.append(el('span', 'featNum', `${String(i + 1).padStart(2, '0')} / ${String(NANO.projects.filter(x => x.featured).length).padStart(2, '0')}`));
    info.append(el('h3', '', p.name));
    info.append(el('p', 'featMeta', `${p.client} · ${p.year} · ${p.role}`));
    info.append(el('p', 'featDesc', p.description));
    const btns = el('div', 'featBtns');
    const cs = el('button', 'btn', 'Case study →'); cs.dataset.case = p.id;
    const gal = el('button', 'btn ghost', `Gallery (${(p.images || [p.cover]).length})`); gal.dataset.view = p.id;
    btns.append(cs, gal); info.append(btns);
    art.append(media, info); box.append(art);
  });
})();

/* ---------- now @ DEPT: google 2026 ---------- */
(function now() {
  const box = $('#nowGrid');
  NANO.projects.filter(p => p.group === 'google26').forEach(p => {
    const b = el('button', 'card'); b.dataset.view = p.id;
    b.innerHTML = '<div class="thumb"><img loading="lazy" alt=""></div><b></b><small></small>';
    $('img', b).src = IMG(p.cover); $('img', b).alt = p.name;
    $('b', b).textContent = p.name.replace(/^Google /, ''); $('small', b).textContent = p.role;
    box.append(b);
  });
})();

/* ---------- índice ---------- */
(function index() {
  const list = $('#indexList');
  NANO.projects.filter(p => p.group === 'more').sort((a, b) => b.year - a.year).forEach(p => {
    const li = el('li');
    const b = el('button', 'indexRow'); b.dataset.view = p.id; b.dataset.peek = IMG(THUMB[p.id] || p.cover); b.dataset.peekTitle = `${p.id}.jpg`;
    b.append(el('span', 'y', p.year), el('span', 't', p.name), el('span', 'c', p.client), el('span', 'r', p.role), el('span', 'a', '→'));
    li.append(b); list.append(li);
  });
})();

/* ---------- side B ---------- */
(function sideB() {
  const lab = $('#lab');
  NANO.projects.filter(p => p.group === 'play').sort((a, b) => b.year - a.year).forEach(p => {
    const li = el('li'), b = el('button', 'labRow'); b.dataset.view = p.id;
    b.innerHTML = '<img loading="lazy" alt=""><div><small></small><b></b><p></p></div>';
    $('img', b).src = IMG(p.cover); $('img', b).alt = p.name;
    $('small', b).textContent = `${p.year} · ${p.role.toLowerCase()}`; $('b', b).textContent = p.name; $('p', b).textContent = p.context;
    li.append(b); lab.append(li);
  });
  const ph = $('#photos');
  NANO.photos.forEach(f => {
    const a = el('a'); a.href = f.url; a.target = '_blank'; a.rel = 'noopener';
    a.innerHTML = '<div class="thumb"><img loading="lazy" alt=""></div><span></span>';
    $('img', a).src = IMG(f.cover); $('img', a).alt = f.name; $('span', a).textContent = f.name;
    ph.append(a);
  });
})();

/* ---------- recomendaciones: las mismas reviews reales que la tienda de la classic ---------- */
(function quotes() {
  const revs = NANO.reviews || []; if (!revs.length) return;
  const list = $('#quoteList');
  revs.forEach(r => {
    const f = el('figure', 'quote reveal');
    f.append(el('blockquote', '', `“${r.text}”`));
    const cap = el('figcaption');
    const who = r.url ? Object.assign(el('a', '', r.name), { href: r.url, target: '_blank', rel: 'noopener' }) : el('b', '', r.name);
    cap.append(who, el('span', '', [r.role, r.company].filter(Boolean).join(' · ')));
    f.append(cap); list.append(f);
  });
  $('#quotes').hidden = false;
})();

/* ---------- nav: fondo al scrollear + sección activa ---------- */
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
const secIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) $$('.navLinks a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['work', 'about', 'sideb', 'contact'].forEach(id => secIO.observe(document.getElementById(id)));

/* ---------- reveal ---------- */
$$('.secHead h2').forEach(h => { const s = el('span', '', h.textContent); h.textContent = ''; h.append(s); });   // el título de sección sube desde su máscara
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in', 'lines-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
$$('.reveal, .mail').forEach(r => io.observe(r));
// red de seguridad: si el navegador restauró el scroll a mitad de página, lo que ya está a la vista se revela igual
const revealVisible = () => $$('.reveal:not(.in), .mail:not(.in)').forEach(r => { const b = r.getBoundingClientRect(); if (b.top < innerHeight && b.bottom > 0) r.classList.add('in', 'lines-in'); });
addEventListener('load', () => setTimeout(revealVisible, 400)); addEventListener('pageshow', () => setTimeout(revealVisible, 400));

/* ---------- entrada del hero: líneas que suben, cara que se revela ---------- */
(document.fonts?.ready || Promise.resolve()).then(() => setTimeout(() => document.documentElement.classList.add('lines-in'), 120));

/* ---------- scroll: progreso, parallax y marquee que acelera ---------- */
(function scrollFx() {
  const prog = $('#progress'), big = $('.heroBig'), track = $('.clientsTrack'), feats = $$('.featMedia');
  let last = scrollY, vel = 0, raf = 0;
  const frame = () => {
    raf = 0;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${h ? y / h : 0})`;
    if (!reduceMotion) {
      big.style.transform = `translate3d(0,${y * .35}px,0)`;                     // el NANO de fondo se queda atrás
      vel += ((y - last) - vel) * .15; last = y;
      track.style.setProperty('--skew', `${Math.max(-12, Math.min(12, -vel * .4))}deg`);   // el marquee se inclina con la velocidad
      feats.forEach(f => {                                                           // la imagen se desliza dentro de su ventana
        const r = f.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;             // -0.5 … 0.5
        f.style.setProperty('--py', (p * r.height * .16 + r.height * .08).toFixed(1));
      });
      if (Math.abs(vel) > .2) raf = requestAnimationFrame(frame);                   // sigue hasta que el skew se asienta
    }
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(frame); }, { passive: true });
  addEventListener('resize', frame); frame();
})();

/* ---------- tooltip del sistema: "View" / "Play" al pasar sobre el trabajo, pegado al cursor de Win98 ---------- */
if (finePointer) {
  const cur = $('#cursor'), label = $('span', cur);
  addEventListener('pointermove', e => {
    const t = e.target.closest('[data-view],[data-case],[data-peek]');
    cur.classList.toggle('view', !!t);
    if (t) { label.textContent = t.dataset.case ? 'Play case study' : 'View project'; cur.style.transform = `translate3d(${e.clientX + 18}px,${e.clientY + 22}px,0)`; }
  }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.remove('view'));
}

/* ---------- reloj + contador (local, como en 2001: miente un poco) ---------- */
(function clock() {
  const c = $('#clock');
  const tick = () => { const t = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date()); c.textContent = t + ' in BS.AS.'; $('#clockTray').textContent = t; };
  tick(); setInterval(tick, 30000);
  let n = 4219; try { n = +(localStorage.getItem('clean.visits') || 4219 + Math.floor(Math.random() * 900)) + 1; localStorage.setItem('clean.visits', n); } catch (e) {}
  $('#visits').textContent = String(n).padStart(6, '0');
})();

/* ---------- la cara te mira (guiño 2004) ---------- */
if (finePointer && !reduceMotion) {
  const face = $('.heroFace'); let raf = 0, mx = 0, my = 0;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY; if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0; const r = face.getBoundingClientRect(); if (r.bottom < 0) return;
      const ry = Math.round(((mx - r.left - r.width / 2) / innerWidth) * 40 / 4) * 4, rx = Math.round((-(my - r.top - r.height / 2) / innerHeight) * 24 / 4) * 4;
      face.style.transform = `perspective(700px) rotateY(${ry}deg) rotateX(${rx}deg) rotate(2deg)`;
    });
  }, { passive: true });
}

/* ---------- preview flotante del índice ---------- */
if (finePointer) {
  const peek = $('#peek'), pimg = $('img', peek), ptit = $('.winBar span', peek);
  let tx = 0, ty = 0, cx = 0, cy = 0, run = false;
  const loop = () => { cx += (tx - cx) * .18; cy += (ty - cy) * .18; peek.style.transform = `translate(${cx + 24}px,${cy - 120}px)`; if (run) requestAnimationFrame(loop); };
  $$('[data-peek]').forEach(r => {
    r.addEventListener('pointerenter', e => { pimg.src = r.dataset.peek; ptit.textContent = r.dataset.peekTitle; tx = cx = e.clientX; ty = cy = e.clientY; peek.classList.add('on'); if (!run) { run = true; loop(); } });
    r.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
    r.addEventListener('pointerleave', () => { peek.classList.remove('on'); run = false; });
  });
}

/* ---------- capas (visor / case): bloquear scroll y devolver foco ---------- */
let lastFocus = null;
const lock = (box, on) => {
  box.hidden = !on;
  document.documentElement.classList.toggle('locked', !$('#viewer').hidden || !$('#case').hidden || (!$('#classicWin').hidden && !$('#classicWin').classList.contains('min')));
  if (on) { lastFocus = document.activeElement; setTimeout(() => $('button', box)?.focus(), 30); } else lastFocus?.focus?.();
};

/* ---------- visor de galería ---------- */
const Viewer = (() => {
  const box = $('#viewer'), img = $('.viewerStage img', box);
  let p = null, imgs = [], i = 0;
  const show = () => {
    img.src = IMG(imgs[i]); img.alt = `${p.name} — ${i + 1}`;
    $('.viewerCount', box).textContent = `${String(i + 1).padStart(2, '0')} / ${String(imgs.length).padStart(2, '0')}`;
    $$('.viewerNav', box).forEach(b => b.style.visibility = imgs.length > 1 ? '' : 'hidden');
  };
  function open(id, start = 0) {
    p = P(id); if (!p) return; imgs = p.images?.length ? p.images : [p.cover]; i = start;
    $('.viewerTitle', box).textContent = `${p.name} — ${p.client} · ${p.year}`;
    $('.viewerText', box).textContent = p.description;
    const link = $('.viewerLink', box); link.hidden = !p.url; if (p.url) link.href = p.url;
    show(); lock(box, true);
  }
  const go = d => { i = (i + d + imgs.length) % imgs.length; show(); };
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-v]')?.dataset.v;
    if (a === 'close') lock(box, false); else if (a === 'prev') go(-1); else if (a === 'next') go(1);
    else if (e.target === img && imgs.length > 1) go(e.offsetX < img.clientWidth / 2 ? -1 : 1);   // en el celu: tocar la mitad
  });
  addEventListener('keydown', e => {
    if (box.hidden) return;
    e.stopImmediatePropagation();   // la galería es la capa de arriba: que el case study no reciba la misma tecla
    if (e.key === 'Escape') lock(box, false); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1);
  });
  return { open };
})();

/* ---------- case study por capítulos ----------
   se arma con context / did / why / images de cada proyecto en data.js */
const Case = (() => {
  const box = $('#case'), stage = $('.caseStage', box), dots = $('.caseDots', box);
  let p = null, ch = [], i = 0;
  const build = q => [
    { k: `${q.client} · ${q.year}`, t: q.name, x: q.role + '. ' + q.description, img: q.cover },
    { k: '01 — The brief', t: 'The brief', x: q.context, img: q.images?.[1] || q.cover },
    { k: '02 — What I did', t: 'What I did', x: q.did, gal: (q.images || []).slice(1, 4) },
    { k: '03 — Why it works', t: 'Why it works', x: q.why, img: q.cover },
    { k: 'End', t: 'Thanks for watching.', x: 'Want the full project, or the human behind it?', end: true },
  ];
  function render() {
    const c = ch[i]; stage.innerHTML = '';
    const s = el('div', 'caseSlide' + (c.end || (!c.img && !c.gal?.length) ? ' text' : ''));
    if (c.img) {
      const f = el('figure', 'caseArt win'); f.style.margin = '0';
      f.innerHTML = '<div class="winBar"><span></span><i>_</i><i>□</i><i>×</i></div><div class="winBody"><img alt=""></div>';
      $('.winBar span', f).textContent = c.img; $('img', f).src = IMG(c.img); $('img', f).alt = p.name; s.append(f);
    } else if (c.gal?.length) {
      const g = el('div', 'caseGal');
      c.gal.forEach((im, n) => { const b = el('button'); b.innerHTML = '<img alt="">'; $('img', b).src = IMG(im); $('img', b).alt = `${p.name} — ${n + 2}`; b.onclick = () => Viewer.open(p.id, n + 1); g.append(b); });
      s.append(g);
    }
    const copy = el('div', 'caseCopy');
    copy.append(el('small', '', c.k), el('h2', '', c.t), el('p', '', c.x));
    if (c.end) {
      const e = el('div', 'caseEnd');
      if (p.url) { const a = el('a', 'btn', 'Open on Behance ↗'); a.href = p.url; a.target = '_blank'; a.rel = 'noopener'; e.append(a); }
      const g = el('button', 'btn ghost', 'Gallery'); g.onclick = () => Viewer.open(p.id);
      const c2 = el('a', 'btn ghost', 'Contact'); c2.href = '#contact'; c2.onclick = () => lock(box, false);
      e.append(g, c2); copy.append(e);
    }
    s.append(copy); stage.append(s); stage.scrollTop = 0;
    $('.caseProg i', box).style.width = `${(i / (ch.length - 1)) * 100}%`;
    $$('i', dots).forEach((d, n) => d.classList.toggle('on', n === i));
    $('[data-c=prev]', box).disabled = i === 0; $('[data-c=next]', box).disabled = i === ch.length - 1;
  }
  function open(id) {
    p = P(id); if (!p) return; ch = build(p); i = 0;
    $('.caseTitle', box).textContent = `Case study — ${p.name}`;
    dots.innerHTML = ''; ch.forEach(() => dots.append(el('i')));
    render(); lock(box, true);
  }
  const go = d => { const n = Math.max(0, Math.min(ch.length - 1, i + d)); if (n !== i) { i = n; render(); } };
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-c]')?.dataset.c;
    if (a === 'close') lock(box, false); else if (a === 'prev') go(-1); else if (a === 'next') go(1);
  });
  addEventListener('keydown', e => {
    if (box.hidden || !$('#viewer').hidden) return;
    if (e.key === 'Escape') lock(box, false); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1);
  });
  return { open };
})();

/* ---------- classic.exe: la 2001 edition en una ventana sobre el sitio (el link sigue funcionando sin JS) ---------- */
const Classic = (() => {
  const box = $('#classicWin'), frame = $('iframe', box);
  function open() {
    if (!frame.src) frame.src = 'classic.html';
    box.classList.remove('min', 'max'); lock(box, true); Sound.play('open');
    // minimizada queda como "tarea" en la barra: el botón classic.exe la vuelve a abrir
    const task = $('#classicTask'); task.hidden = false; task.classList.add('on');
  }
  function close() { lock(box, false); box.classList.remove('min', 'max'); $('#classicTask').hidden = true; Sound.play('close'); }
  box.addEventListener('click', e => {
    const a = e.target.closest('[data-cw]')?.dataset.cw;
    if (a === 'close') close(); else if (a === 'max') box.classList.toggle('max'); else if (a === 'min') { box.classList.add('min'); document.documentElement.classList.remove('locked'); }
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-classic]'); if (!a || e.ctrlKey || e.metaKey || e.button === 1) return;
    e.preventDefault(); if (box.hidden || !box.classList.contains('min')) open(); else { box.classList.remove('min'); lock(box, true); }
  });
  addEventListener('keydown', e => { if (!box.hidden && e.key === 'Escape') close(); });
  return { open, close };
})();

/* ---------- click de Windows 98: apagado por defecto, se prende en la bandeja ---------- */
const Sound = (() => {
  let ctx = null, on = false;
  try { on = localStorage.getItem('clean.sound') === '1'; } catch (e) {}
  const btn = $('#soundBtn');
  const sync = () => { btn.setAttribute('aria-pressed', on); btn.title = `click sounds: ${on ? 'on' : 'off'}`; };
  const ensure = () => { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } if (ctx?.state === 'suspended') ctx.resume(); return ctx; };
  // el "click" de Win98: un golpecito seco de ruido filtrado + un tic grave. open/close: dos tonos cortos
  function play(kind = 'click') {
    if (!on || !ensure()) return;
    const t = ctx.currentTime;
    if (kind === 'click') {
      const b = ctx.createBuffer(1, ctx.sampleRate * .03, ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = b; f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 1.2; g.gain.value = .25;
      s.connect(f).connect(g).connect(ctx.destination); s.start(t);
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'square'; o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(400, t + .02);
      og.gain.setValueAtTime(.08, t); og.gain.exponentialRampToValueAtTime(.0001, t + .03); o.connect(og).connect(ctx.destination); o.start(t); o.stop(t + .04);
    } else {
      const up = kind === 'open';
      [0, .09].forEach((dt, i) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = up ? [440, 660][i] : [660, 440][i];
        g.gain.setValueAtTime(.0001, t + dt); g.gain.exponentialRampToValueAtTime(.18, t + dt + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dt + .12); o.connect(g).connect(ctx.destination); o.start(t + dt); o.stop(t + dt + .14); });
    }
  }
  btn.addEventListener('click', e => { e.stopPropagation(); on = !on; try { localStorage.setItem('clean.sound', on ? '1' : '0'); } catch (err) {} sync(); if (on) { ensure(); play('open'); } });
  document.addEventListener('click', e => { if (e.target.closest('a,button') && !e.target.closest('#soundBtn')) play('click'); });
  sync();
  return { play, get on() { return on; } };
})();

/* ---------- delegados: abrir visor / case ---------- */
document.addEventListener('click', e => {
  const c = e.target.closest('[data-case]'); if (c) { e.preventDefault(); Case.open(c.dataset.case); return; }
  const v = e.target.closest('[data-view]'); if (v && !v.closest('#viewer')) { e.preventDefault(); Viewer.open(v.dataset.view); }
});
