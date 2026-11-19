/* ==========================================================
   main.js, portafolio de Ignacio Britos
   Todo el comportamiento de la página, sin librerías ni frameworks.
   Está envuelto en una función que se ejecuta sola (IIFE) para que
   ninguna variable quede suelta en el navegador.

   Bloques principales:
   - Pantalla de carga y nombre letra por letra
   - Accesibilidad: modo oscuro, modo lectura y daltonismo
   - Entradas al scrollear (sistema traído de FreeWheel)
   - Tarjetas de proyectos: un toque abre, dos entran
   - ¿Me contratarías?: el botón "No" que se escapa
   - Formulario que manda el mail de verdad (FormSubmit)
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  // Si la persona tiene activado "reducir movimiento" en su sistema,
  // la página no anima nada (mismo criterio que en FreeWheel).
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  // Parto el texto del h1 en una caja por letra (<span>) y a cada una le
  // paso su número en la variable --i. El CSS usa ese número para que cada
  // letra arranque 35 ms después de la anterior. El h1 conserva el texto
  // completo en aria-label para los lectores de pantalla.
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
  // Los números (815, 51, 149) suben desde cero cuando aparecen. Uso
  // requestAnimationFrame, que dibuja al ritmo de la pantalla, y una curva
  // que frena al final (1 - (1 - t)^4) para que no lleguen de golpe.
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

  /* ==========================================================
     ENTRADAS AL SCROLLEAR (sistema traído de FreeWheel)
     Es el mismo motor de entradas que hice para FreeWheel:
     1. JavaScript le pone .sc-in a cada .reveal (queda invisible y corrido).
        Si el JS no carga, esa clase nunca se pone y todo se ve igual.
     2. Un IntersectionObserver avisa cuando el bloque entra en pantalla y
        ahí le agrego .sc-visible, que dispara la animación del CSS.
     3. Los hermanos entran escalonados: 55 ms cada uno, con tope en 10.
        Abajo de 30 ms no se nota y arriba de 80 parece una carga lenta.
     ========================================================== */
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
        io.unobserve(entry.target); // cada bloque se anima una sola vez
      });
    // threshold 0.12: se dispara cuando se ve un 12% del bloque.
    // rootMargin -40px: espera a que suba un poco desde el borde de abajo.
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

  /* ==========================================================
     BARRA DE PROGRESO AL SCROLLEAR (la misma de la landing de FreeWheel)
     La línea celeste de arriba avanza de izquierda a derecha mientras
     bajás. Es la misma técnica que usé en la landing de FreeWheel
     (allá está en src/hooks/useScroll.js y src/components/Nav.jsx):
     1. Calculo cuánto bajaste, de 0 a 1:
        scrollY / (alto total de la página - alto de la pantalla).
     2. Ese número va a transform: scaleX(...). Escalar no obliga al
        navegador a recalcular el diseño; cambiar el ancho sí.
     3. El evento scroll se dispara muchísimas veces por segundo. El
        listener no calcula nada: marca "ticking" y pide un
        requestAnimationFrame, así el cálculo corre como mucho una vez
        por cuadro ("rAF throttling").
     4. { passive: true } le promete al navegador que no voy a frenar el
        scroll, así no espera a mi código y en el celu no se siente pegajoso.
     ========================================================== */
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
  onScroll(); // la dibujo una vez al cargar, por si la página abre scrolleada

  // marca en el menú la sección que se está viendo

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

  /* ==========================================================
     TARJETAS DE PROYECTOS: un toque abre, dos entran
     Toda la parte de arriba de la tarjeta (.proj__media) es un link <a>
     a la web en vivo o al repositorio (el href está en index.html).
     - Primer clic: freno el link con preventDefault() y le agrego la
       clase .is-open a la tarjeta. El CSS hace el resto: la portada se
       recorta hacia arriba, aparece la captura y baja "Cómo funciona".
     - Segundo clic: la tarjeta ya tiene .is-open, así que no freno nada
       y el navegador abre el link normalmente.
     Funciona igual en compu y en celu, porque no depende del hover.
     ========================================================== */
  var projs = document.querySelectorAll('.proj');
  function closeAll(except) {
    projs.forEach(function (c) { if (c !== except) c.classList.remove('is-open'); });
  }
  projs.forEach(function (card) {
    var media = card.querySelector('.proj__media');
    var frame = card.querySelector('.proj__frame');
    // brillo que sigue al mouse: guardo la posición del puntero en las
    // variables --mx y --my y el CSS dibuja ahí un degradado suave.
    media.addEventListener('pointermove', function (e) {
      var r = frame.getBoundingClientRect();
      frame.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      frame.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    media.addEventListener('click', function (e) {
      var isLink = media.tagName === 'A';
      // segundo clic: dejo que el link se abra solo
      if (card.classList.contains('is-open') && isLink) return;
      // primer clic: freno el link, cierro las otras y abro esta
      e.preventDefault();
      closeAll(card);
      card.classList.toggle('is-open');
    });
    // PetCare no tiene link (repositorio privado): su tarjeta es un <div>,
    // así que le agrego Enter y Espacio para poder abrirla con teclado.
    if (media.tagName !== 'A') {
      media.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          media.click();
        }
      });
    }
  });
  // un clic afuera de cualquier tarjeta, o la tecla Escape, las cierra
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.proj')) closeAll(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });

  /* ---------- Actividad del último año ---------- */
  // Commits por día, sacados de todos mis repos (públicos y privados) al 1/11/2026.
  // No dependo de una API externa: los conté del historial de cada repo y
  // armo la grilla acá, una columna por semana, como la de GitHub.
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

  /* ==========================================================
     ¿ME CONTRATARÍAS?: el botón "No" que se escapa
     - pointerenter detecta cuando el mouse entra al botón (solo mouse).
       En el celu no hay mouse, así que se escapa al tocarlo (click).
     - runAway() elige un lugar al azar con Math.random() dentro del
       recuadro, restando el tamaño del botón para que no se salga.
     - Si ese lugar pisa el botón "Sí", prueba otro, hasta 20 veces.
     - El movimiento suave lo da la transición de left/top en el CSS.
     - Al tercer escape aparece "¡No seas malo! :(".
     ========================================================== */
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
    // zona ocupada por el "Sí", con 16 px de margen
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
  // "Sí": esconde el "No", baja hasta el formulario y deja el cursor
  // listo en el campo del nombre.
  yes.addEventListener('click', function () {
    hireMsg.classList.remove('is-sad');
    hireMsg.textContent = '¡Genial! Contame tu idea acá abajo y arrancamos.';
    no.hidden = true;
    document.getElementById('idea').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setTimeout(function () { document.getElementById('f-name').focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
  });

  /* ==========================================================
     FORMULARIO QUE MANDA EL MAIL DE VERDAD (FormSubmit)
     El portafolio no tiene servidor propio, así que uso FormSubmit:
     un servicio que recibe los datos y me los reenvía a mi Gmail.
     1. Valido los campos antes de mandar nada (checkValidity revisa
        que el mail tenga formato válido).
     2. Mando los datos con fetch en formato JSON, sin recargar la página.
     3. Si sale bien muestro el mensaje de listo; si falla, ofrezco un
        plan B: un link que abre el correo con el mensaje ya escrito.
     La primera vez, FormSubmit manda un mail para activar la casilla.
     ========================================================== */
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

    // desactivo el botón para que no se mande dos veces
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
        _replyto: form.email.value.trim(),  // "Responder" en Gmail le contesta a quien escribió
        _subject: 'Nueva propuesta de ' + form.nombre.value.trim(), // asunto del mail
        _template: 'table',                 // el mail llega ordenado en una tabla
        _captcha: 'false',                  // sin captcha, el envío es directo
        _honey: form._honey.value           // trampa anti-spam: si viene lleno, es un robot
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (String(data.success) === 'true') {
          form.reset();
          msg.classList.add('is-ok');
          msg.textContent = '¡Listo! Me llegó tu idea, te responderé a tu mail.';
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
