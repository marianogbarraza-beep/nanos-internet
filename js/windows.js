/* ============================================================
   windows.js — mini window manager.
   WM.open(id, {title, icon, w, x, y, cls, html, onOpen, onClose})
   El contenido sale de <template id="tpl-{id}"> si no se pasa html.
   Cada ventana: arrastrable (pointer events), minimizar a la taskbar,
   cerrar con animación stop-motion, foco al click.
   ============================================================ */
window.WM = (() => {
  const layer = document.getElementById('winLayer');
  const tasks = document.getElementById('tasks');
  const wins = new Map();
  let z = 10, active = null;
  // las ventanas tienen zoom:var(--z) → sus coordenadas viven en un viewport dividido por z
  const Z = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--z')) || 1;
  const vw = () => window.innerWidth / Z(), vh = () => window.innerHeight / Z();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const BAR = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar')) || 38;

  function open(id, opts = {}) {
    if (wins.has(id)) { restore(id); return wins.get(id); }
    const tpl = document.getElementById('tpl-' + id);
    const el = document.createElement('section');
    el.className = 'win ' + (opts.cls || '');
    el.dataset.id = id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', opts.title || id);
    el.innerHTML =
      `<div class="winBar"><span class="wicon">${opts.icon ? `<svg><use href="#i-${opts.icon}"/></svg>` : ''}</span>` +
      `<span class="t"></span>` +
      `<button class="winBtn" data-act="min" title="minimize" aria-label="minimize">_</button>` +
      `<button class="winBtn" data-act="close" title="close" aria-label="close">×</button></div>` +
      `<div class="winBody"></div>`;
    el.querySelector('.t').textContent = opts.title || id;
    const body = el.querySelector('.winBody');
    if (opts.html) body.innerHTML = opts.html; else if (tpl) body.appendChild(tpl.content.cloneNode(true));

    const w = Math.min(opts.w || 360, vw() - 16);
    el.style.width = w + 'px';
    const n = wins.size;
    let x = opts.x ?? Math.round(vw() / 2 - w / 2 + (n % 5) * 28 - 40);
    let y = opts.y ?? Math.round(vh() * .2 + (n % 5) * 24);
    if (vw() < 640) { x = 8; y = Math.round(vh() * .1 + (n % 4) * 18); }
    el.style.left = clamp(x, 8, Math.max(8, vw() - w - 8)) + 'px';
    el.style.top = clamp(y, 8, Math.max(8, vh() - BAR() - 120)) + 'px';
    layer.appendChild(el);
    el.addEventListener('animationend', () => el.classList.add('ready'), { once: true });

    const task = document.createElement('button');
    task.className = 'task';
    task.innerHTML = `${opts.icon ? `<svg width="12" height="12"><use href="#i-${opts.icon}"/></svg>` : ''}<span></span>`;
    task.querySelector('span').textContent = opts.title || id;
    task.onclick = () => { if (el.classList.contains('min') || active !== id) restore(id); else minimize(id); };
    tasks.appendChild(task);

    const rec = { id, el, task, opts };
    wins.set(id, rec);
    el.addEventListener('pointerdown', () => focus(id), true);
    makeDraggable(el, el.querySelector('.winBar'));
    el.querySelector('[data-act=close]').onclick = e => { e.stopPropagation(); close(id); };
    el.querySelector('[data-act=min]').onclick = e => { e.stopPropagation(); minimize(id); };
    focus(id);
    window.NanoAudio && NanoAudio.sfx('open');
    opts.onOpen && opts.onOpen(el, rec);
    return rec;
  }
  function focus(id) {
    const r = wins.get(id); if (!r) return;
    r.el.style.zIndex = ++z;
    wins.forEach((o, k) => { o.el.classList.toggle('active', k === id); o.task.classList.toggle('active', k === id); });
    active = id;
  }
  function minimize(id) {
    const r = wins.get(id); if (!r) return;
    r.el.classList.add('min'); r.task.classList.remove('active'); r.el.classList.remove('active');
    if (active === id) active = null;
    window.NanoAudio && NanoAudio.sfx('close');
  }
  function restore(id) { const r = wins.get(id); if (!r) return; r.el.classList.remove('min'); focus(id); }
  function close(id) {
    const r = wins.get(id); if (!r) return;
    r.el.classList.remove('ready'); r.el.classList.add('closing');
    window.NanoAudio && NanoAudio.sfx('close');
    r.opts.onClose && r.opts.onClose(r.el);
    wins.delete(id); if (active === id) active = null;
    r.task.remove();
    setTimeout(() => r.el.remove(), 200);
  }
  function closeAll() { [...wins.keys()].forEach(close); }
  function toggle(id, opts) { wins.has(id) && !wins.get(id).el.classList.contains('min') && active === id ? minimize(id) : open(id, opts); }

  function makeDraggable(el, handle) {
    let sx, sy, ox, oy, dragging = false;
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('.winBtn') || e.button === 2) return;
      dragging = true; handle.setPointerCapture(e.pointerId);
      sx = e.clientX / Z(); sy = e.clientY / Z(); ox = el.offsetLeft; oy = el.offsetTop;
      el.classList.add('dragging');
    });
    handle.addEventListener('pointermove', e => {
      if (!dragging) return;
      // snap a 3px: el movimiento queda un toque "a mano", stop-motion sutil
      const nx = Math.round(clamp(ox + e.clientX / Z() - sx, -el.offsetWidth + 70, vw() - 70) / 3) * 3;
      const ny = Math.round(clamp(oy + e.clientY / Z() - sy, 0, vh() - BAR() - 30) / 3) * 3;
      el.style.left = nx + 'px'; el.style.top = ny + 'px';
    });
    const up = () => { dragging = false; el.classList.remove('dragging'); };
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  }

  // si cambia el viewport, que ninguna ventana quede afuera
  window.addEventListener('resize', () => {
    wins.forEach(r => {
      r.el.style.left = clamp(r.el.offsetLeft, -r.el.offsetWidth + 70, vw() - 70) + 'px';
      r.el.style.top = clamp(r.el.offsetTop, 0, vh() - BAR() - 30) + 'px';
    });
  });

  return { open, close, closeAll, focus, minimize, restore, toggle, makeDraggable,
    has: id => wins.has(id), get: id => wins.get(id)?.el, get active() { return active; } };
})();
