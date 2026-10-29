# nano internet — portfolio v13

Sitio estático. HTML + CSS + JS, sin build, sin framework. Se sube a cualquier hosting (Netlify, Vercel, GitHub Pages, un FTP de 2003).

## Estructura

```
index.html        contenido + templates de las ventanas (editá textos acá)
css/base.css      la página 2001: estrellas, WordArt, cajas GeoCities neón, hero azul tipo Disney, tiles, guestbook
css/system.css    el "sistema operativo" Win98: cursor + estela, ventanas, taskbar, start menu, clippy, amp, msn, eggs
img/              imágenes locales (+ tu nano.png / nano.gif)
js/audio.js       sonido sin assets: blips de UI + chiptune generado en vivo
js/windows.js     window manager (abrir, arrastrar, minimizar, cerrar, taskbar)
js/clippy.js      asistente: textos por sección, idle, ojos que siguen el mouse
js/eggs.js        easter eggs: konami/CRT, logo×5, "bsod", "msn", "nano", shutdown
js/app.js         orquesta: boot, reveal, contador, sound mode, programas, preview, msn, start menu
```

## Contenido

- **Proyectos, fotos y redes**: `js/data.js` (`NANO.projects`, `NANO.photos`, `NANO.links`). Cada proyecto tiene `cover` (archivo en `img/`), `description`, `url` (Behance) opcional. Los que tienen `featured:true` son los 3 grandes; el resto sale en las grillas. Para agregar uno: entrada en data.js + un `<a data-project="id">` en index.html.
- **Assets**: todo en `img/` (los gifs retro, `retro-face.gif` = tu cara, fotos DEPT `dept-NNN.webp`).
- **Textos** (about, experiencia, to-do, marquee): directo en `index.html`.

## La capa "sitio loco del 2000" (js/extras.js)

- **Splash ENTER** (con sonido / quieto) una vez por sesión; "con sonido" prende los blips y arranca nanoamp.
- **Guestbook**: en el link de claude.ai las firmas y el contador de visitas son compartidos de verdad (base de datos del artifact: una firma por persona, cuenta cada persona con sesión iniciada). En hosting estático las firmas quedan en el navegador del visitante + botón "e-mail it". Tercera opción: una URL REST en `CONFIG.guestbookEndpoint` (GET devuelve `[]` de entradas, POST recibe `{name, from, date, text}`).
- **Cursores**: arrow / plumbob (Sims) / hourglass / pixel, desde el start menu.
- **Skins de nanoamp**: classic / bubblegum / chrome / amber. Se eligen en la ventana y quedan guardados.
- **Clippy ES/EN**: botón "ES" en el globo o en el start menu. Textos en `js/clippy.js` (`LINES` / `LINES_ES`).
- **Screensaver**: a los 75 s quieto (`CONFIG.screensaverAfter`) o desde el start menu. Logo rebotando estilo DVD + tus gifs.
- **Popup "visitante 1.000.000"** a los 14 s (`CONFIG.prizeAfter`), una vez por navegador. El premio es un proyecto random.
- **Click derecho**: menú Win98 (back, refresh, nanoamp, random work, set as wallpaper, view source, properties).
- **Wallpapers**: stars / tiles / grid / skulls / hearts, desde el start menu o el click derecho.

Fotos sin portada todavía (muestran una cámara): `img/nightshift.png`, `img/brc.png`, `img/ciones.png`. Dejá ahí los archivos y listo.

## MSN con cerebro

En el link de claude.ai el msn contesta de verdad: "nano bot" es Claude con una persona y los datos de `data.js` (proyectos, experiencia, links). Reglas: no inventa clientes ni tarifas, deriva al mail para cosas serias, responde en el idioma del visitante. Persona e instrucciones en `js/extras.js` → `persona()`. En hosting estático vuelve a las frases enlatadas de `js/app.js` → `REPLIES`.

## Storytelling (round 7)

- **Status line MSN** bajo tu cara y **disponibilidad** en contacto: `js/data.js` → `NANO.status`.
- **NOW**: la tira de Google 2026 arriba de todo en work.
- **Tres líneas por proyecto** (the brief / what i did / why it works): `context`, `did`, `why` en cada proyecto de `data.js`. ⚠ Son borradores de Claude, corregilos.
- **making_of.txt**: `index.html` → `<template id="tpl-makingof">`.
- **resume.pdf**: dejá tu CV como `resume.pdf` al lado de `index.html`; el ícono lo abre. Si no existe, abre una ventana que manda a LinkedIn.
- **Splash "I'm a recruiter"**: sin Clippy, sin popup, sin marquee, derecho a work (dura la sesión).
- **30-second tour**: Start → "30-second tour" (también click derecho y blinkie). Pasos y textos en `data.js` → `NANO.tour`.
- **Side B** con pestañas Photo archive / Play.
- **Webring**: `data.js` → `NANO.webring` (lista de {name, url}); vacío = oculto.
- **og:image** para previews: `img/og.jpg`; en `index.html` apunta a `https://marianogbarraza-beep.github.io/nanos-internet/` (cambialo si le ponés dominio propio).

## Publicado
- **GitHub Pages**: https://marianogbarraza-beep.github.io/nanos-internet/ — repo `marianogbarraza-beep/nanos-internet`, rama `main`. Para actualizar: commit + push a main y en ~1 minuto está online.
- Fuera de claude.ai el guestbook y el contador se guardan en el navegador de cada visitante.

## Cosas que vas a querer tocar

- **Tu mail**: `js/app.js` → `CONFIG.email`. Lo usa el botón "email ↗" del msn (arma un `mailto:` con lo que escribieron).
- **Textos de Clippy**: `js/clippy.js` → `LINES` (por sección: hero, about, work, play, photo, services, contact, idle, generic).
- **Ventanas**: el contenido de cada una está en `index.html` dentro de `<template id="tpl-…">`. Para agregar una nueva: template + entrada en `PROGRAMS` (`js/app.js`) + un botón con `data-open="id"`.
- **Marquee**: `index.html`, bloque `.marquee` (el texto está duplicado a propósito para que el loop sea continuo).
- **Boot**: líneas en `js/app.js` → `LINES` dentro de `boot()`. `CONFIG.bootOnce=false` si querés verlo en cada carga.
- **Contador**: `CONFIG.visitorBase`. Es local (localStorage + días desde enero 2026), no hay backend. Como los de 2001, miente un poquito.
- **Música**: `js/audio.js` → `BASS`, `LEAD1`, `LEAD2`, `ARP` son notas MIDI por semicorchea (0 = silencio). `BPM` también.
- **Colores**: `css/base.css` → `:root` (`--hi` es el lima).

## Interacciones

| qué | dónde |
|---|---|
| sound mode (blips sintetizados) | header, o start menu |
| nano.amp (player + visualizador) | ícono del desktop / start |
| nano.jpg (cara arrastrable, doble click gira) | ícono, click en el retrato del hero, o tipear `nano` |
| msn (chat falso + zumbido + email) | ícono, botón [send] del form, o tipear `msn` |
| readme.txt / recycle bin | íconos del desktop |
| clippy | habla por sección, click = otra frase, × = chau; vuelve desde start |
| preview flotante | hover en la lista de work (solo mouse) |
| CRT mode | konami: ↑↑↓↓←→←→BA |
| nano.exe crashed | 5 clicks rápidos en el logo |
| pantalla azul | tipear `bsod` |
| shut down | start menu |
| Esc | cierra start menu / la ventana activa |

## Notas

- Las imágenes siguen apuntando a Framer/Behance como en la v12. Si alguna no carga aparece un patrón con el alt; conviene bajarlas a `img/` y cambiar los `src`.
- `prefers-reduced-motion` apaga grain, marquee, stop-motion y el boot.
- Sin JS el contenido se ve igual (sin la capa de sistema).
