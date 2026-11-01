(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover)').matches;

  /* ---------- Pantalla de carga ---------- */
  // Dura lo que tarda la barra (unos 1,3 s) o lo que tarde en cargar la página,
  // lo que pase último. Se muestra una sola vez por sesión.
  var introStart = 0;
  if (root.classList.contains('intro')) {
    var minTime = new Promise(function (ok) { setTimeout(ok, 1300); });
    var loaded = new Promise(function (ok) {
      if (document.readyState === 'complete') ok();
      else window.addEventListener('load', ok, { once: true });
    });
    Promise.all([minTime, loaded]).then(function () {
      root.classList.add('is-loaded');
      try { sessionStorage.setItem('ib-intro', '1'); } catch (e) {}
    });
    introStart = 1450;
  }

  /* ---------- El nombre entra letra por letra ---------- */
  var split = document.querySelector('[data-split]');
  if (split && !reduceMotion) {
    var text = split.textContent;
    var n = 0;
    split.setAttribute('aria-label', text);
    split.innerHTML = text.split(' ').map(function (word) {
      return '<span class="split-word" aria-hidden="true">' + word.split('').map(function (ch) {
        return '<span class="split-ch"><span style="--i:' + (n++) + '">' + ch + '</span></span>';
      }).join('') + '</span>';
    }).join(' ');
    root.style.setProperty('--start', introStart + 'ms');
    split.classList.add('is-split');
  } else {
    root.style.setProperty('--start', introStart + 'ms');
  }

  /* ---------- Preferencias de accesibilidad ---------- */
  var PREFS_KEY = 'ib-prefs';

  function readPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch (e) { return {}; }
  }
  function savePrefs(prefs) {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {}
  }

  var prefs = readPrefs();
  if (!prefs.theme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.dataset.theme = 'dark';
  }

  function bindToggle(id, isOn, apply, labels) {
    var btn = document.getElementById(id);
    if (!btn) return;
    function sync() {
      btn.setAttribute('aria-pressed', String(isOn()));
      if (labels) btn.dataset.tip = isOn() ? labels[1] : labels[0];
    }
    sync();
    btn.addEventListener('click', function () {
      apply(!isOn());
      sync();
      savePrefs(prefs);
    });
  }

  bindToggle('btn-theme',
    function () { return root.dataset.theme === 'dark'; },
    function (on) { prefs.theme = on ? 'dark' : 'light'; root.dataset.theme = prefs.theme; },
    ['Modo oscuro', 'Modo claro']);

  bindToggle('btn-reading',
    function () { return root.dataset.reading === 'on'; },
    function (on) { prefs.reading = on; if (on) root.dataset.reading = 'on'; else delete root.dataset.reading; },
    ['Modo lectura', 'Sacar modo lectura']);

  bindToggle('btn-cvd',
    function () { return root.dataset.cvd === 'on'; },
    function (on) { prefs.cvd = on; if (on) root.dataset.cvd = 'on'; else delete root.dataset.cvd; },
    ['Colores para daltonismo', 'Sacar colores para daltonismo']);

  /* ---------- Menú móvil ---------- */
  var menuBtn = document.getElementById('btn-menu');
  var mobileNav = document.getElementById('mobile-nav');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    mobileNav.hidden = !open;
  }
  menuBtn.addEventListener('click', function () {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });
  mobileNav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });

  /* ---------- Contadores ---------- */
  function countUp(el) {
    var target = Number(el.dataset.count);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) return;
    var start = performance.now();
    var dur = 1400;
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 4);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Entradas al scrollear ---------- */
  // Escalonado de 55 ms entre hermanos, como en FreeWheel: con más de diez
  // elementos deja de crecer para que no se sienta como una carga lenta.
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.querySelectorAll(':scope > .reveal'), function (el, i) {
      el.style.setProperty('--retraso', Math.min(i, 10) * 55 + 'ms');
    });
  });

  var revealEls = document.querySelectorAll('.reveal');
  function show(el) {
    el.classList.add('sc-visible', 'is-in');
    el.querySelectorAll('[data-count]').forEach(countUp);
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) {
      el.classList.add('sc-in');
      // lo que ya está en pantalla al cargar espera a que termine la intro
      if (introStart && el.getBoundingClientRect().top < window.innerHeight) {
        el.style.setProperty('--retraso', introStart + 250 + (parseInt(el.style.getPropertyValue('--retraso'), 10) || 0) + 'ms');
      }
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Barra de progreso y sección actual ---------- */
  var bar = document.getElementById('progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['inicio', 'proyectos', 'datos', 'contacto'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) navIo.observe(s);
    });
  }

  /* ---------- Tarjetas de proyectos ---------- */
  var projs = document.querySelectorAll('.proj');
  projs.forEach(function (card) {
    var media = card.querySelector('.proj__media');
    // brillo que sigue al mouse
    media.addEventListener('pointermove', function (e) {
      var r = media.getBoundingClientRect();
      media.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      media.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    // En el celu no hay "pasar el mouse": el primer toque muestra la captura
    // y cómo funciona, el segundo abre el proyecto.
    media.addEventListener('click', function (e) {
      if (canHover) return;
      if (!card.classList.contains('is-open')) {
        e.preventDefault();
        projs.forEach(function (c) { c.classList.remove('is-open'); });
        card.classList.add('is-open');
      }
    });
    if (media.tagName !== 'A') {
      media.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('is-open');
        }
      });
    }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.proj')) projs.forEach(function (c) { c.classList.remove('is-open'); });
  });

  /* ---------- Actividad del último año ---------- */
  // Commits por día, sacados de todos mis repos (públicos y privados) al 1/11/2026.
  var ACTIVITY = {
    start: '2025-11-02',
    counts: [0,0,0,0,0,0,2,0,0,0,0,0,1,0,0,4,0,0,0,0,0,0,0,0,0,0,0,6,16,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,0,6,0,0,0,9,0,0,0,0,0,3,0,0,0,2,0,0,0,0,0,3,3,0,0,4,4,11,8,14,0,7,0,18,4,0,2,0,0,0,0,0,0,1,0,0,2,0,0,0,7,13,3,15,6,10,20,16,0,20,0,0,6,10,4,0,0,0,7,0,0,0,0,0,0,11,0,6,4,0,0,0,1,0,0,0,0,0,0,2,2,13,0,0,1,0,0,0,1,0,0,0,0,0,0,2,0,0,0,2,8,0,4,3,0,1,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,2,3,1,1,0,0,3,1,0,0,0,3,2,1,2,0,0,3,6,25,0,1,0,1,3,21,11,6,3,0,3,0,0,0,0,0,0,0,0,0,0,0,2,0,6,1,0,0,1,1,1,3,5,11,1,0,1,0,0,0,0,0,1,9,0,0,0,26,2,0,0,0,0,0,0,0,1,5,0,0,0,0,0,5,2,0,0,0,0,4,0,0,0,1,3,0,1]
  };
  var grid = document.getElementById('activity-grid');
  var foot = document.getElementById('activity-foot');
  if (grid) {
    var first = new Date(ACTIVITY.start + 'T00:00:00');
    var offset = first.getDay();
    var frag = document.createDocumentFragment();
    var total = 0;
    var active = 0;
    var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    for (var p = 0; p < offset; p++) {
      var pad = document.createElement('i');
      pad.style.visibility = 'hidden';
      frag.appendChild(pad);
    }
    ACTIVITY.counts.forEach(function (c, i) {
      var day = new Date(first.getTime() + i * 864e5);
      var cell = document.createElement('i');
      var level = c === 0 ? 0 : c < 3 ? 1 : c < 7 ? 2 : c < 14 ? 3 : 4;
      cell.dataset.l = level;
      cell.style.setProperty('--w', Math.floor((i + offset) / 7));
      cell.title = day.getDate() + ' ' + meses[day.getMonth()] + ' ' + day.getFullYear() + ': ' +
        c + (c === 1 ? ' commit' : ' commits');
      total += c;
      if (c) active++;
      frag.appendChild(cell);
    });
    grid.appendChild(frag);
    foot.textContent = total + ' commits en ' + active + ' días durante el último año';
  }

  /* ---------- ¿Me contratarías? ---------- */
  var zone = document.getElementById('hire-zone');
  var yes = document.getElementById('hire-yes');
  var no = document.getElementById('hire-no');
  var hireMsg = document.getElementById('hire-msg');
  var escapes = 0;

  function runAway() {
    var zw = zone.clientWidth;
    var zh = zone.clientHeight;
    var bw = no.offsetWidth;
    var bh = no.offsetHeight;
    var yesBox = { r: yes.offsetLeft + yes.offsetWidth + 16, b: yes.offsetTop + yes.offsetHeight + 16 };
    var x, y, tries = 0;
    do {
      x = Math.random() * Math.max(zw - bw, 0);
      y = Math.random() * Math.max(zh - bh, 0);
      tries++;
    } while (x < yesBox.r && y < yesBox.b && tries < 20);
    no.style.left = x + 'px';
    no.style.top = y + 'px';
    escapes++;
    if (escapes >= 3) {
      hireMsg.textContent = '¡No seas malo! :(';
      hireMsg.classList.add('is-sad');
    }
  }

  no.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') runAway(); });
  no.addEventListener('click', function (e) { e.preventDefault(); runAway(); });
  yes.addEventListener('click', function () {
    hireMsg.classList.remove('is-sad');
    hireMsg.textContent = '¡Genial! Contame tu idea acá abajo y arrancamos.';
    no.hidden = true;
    document.getElementById('idea').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { document.getElementById('f-name').focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
  });

  /* ---------- Formulario de ideas ---------- */
  // Se manda de verdad con FormSubmit: el mail llega a mi casilla sin abrir
  // el correo de quien escribe.
  var form = document.getElementById('idea-form');
  var msg = document.getElementById('form-msg');
  var send = document.getElementById('form-send');
  var MAIL = 'britosignacio106@gmail.com';

  function fallback(text) {
    var body = encodeURIComponent(form.idea.value.trim() + '\n\n' + form.nombre.value.trim() + '\n' + form.email.value.trim());
    msg.classList.remove('is-ok');
    msg.innerHTML = text + ' <a href="mailto:' + MAIL + '?subject=' + encodeURIComponent('Propuesta desde el portafolio') +
      '&body=' + body + '">Mandalo desde tu correo</a>.';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = [form.nombre, form.email, form.idea];
    var firstBad = null;
    fields.forEach(function (f) {
      var ok = f.value.trim() !== '' && f.checkValidity();
      f.setAttribute('aria-invalid', String(!ok));
      if (!ok && !firstBad) firstBad = f;
    });
    if (firstBad) {
      msg.classList.remove('is-ok');
      msg.textContent = 'Completá tu nombre, un mail válido y tu idea.';
      firstBad.focus();
      return;
    }

    send.disabled = true;
    send.textContent = 'Enviando...';
    msg.classList.remove('is-ok');
    msg.textContent = '';

    fetch('https://formsubmit.co/ajax/' + MAIL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre.value.trim(),
        email: form.email.value.trim(),
        idea: form.idea.value.trim(),
        _replyto: form.email.value.trim(),
        _subject: 'Nueva propuesta de ' + form.nombre.value.trim(),
        _template: 'table',
        _captcha: 'false',
        _honey: form._honey.value
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (String(data.success) === 'true') {
          form.reset();
          msg.classList.add('is-ok');
          msg.textContent = '¡Listo! Me llegó tu idea, te respondo a tu mail.';
        } else {
          fallback('No se pudo enviar.');
        }
      })
      .catch(function () { fallback('No se pudo enviar.'); })
      .then(function () {
        send.disabled = false;
        send.textContent = 'Enviar propuesta';
      });
  });
})();
