(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Pantalla de carga ---------- */
  // Dura lo que tarda la barra o lo que tarde en cargar la página,
  // lo que pase último. Se muestra una sola vez por sesión.
  var introStart = 0;
  if (root.classList.contains('intro')) {
    var minTime = new Promise(function (ok) { setTimeout(ok, 1200); });
    var loaded = new Promise(function (ok) {
      if (document.readyState === 'complete') ok();
      else window.addEventListener('load', ok, { once: true });
    });
    Promise.all([minTime, loaded]).then(function () {
      root.classList.add('is-loaded');
      try { sessionStorage.setItem('lp-intro', '1'); } catch (e) {}
    });
    introStart = 1350;
  }
  root.style.setProperty('--start', introStart + 'ms');

  /* ---------- El nombre entra letra por letra ---------- */
  if (!reduce) {
    var n = 0;
    document.querySelectorAll('[data-split]').forEach(function (el) {
      el.innerHTML = el.textContent.trim().split('').map(function (ch) {
        return '<span class="split-ch" aria-hidden="true"><span style="--i:' + (n++) + '">' + ch + '</span></span>';
      }).join('');
      el.parentNode.classList.add('is-split');
    });
  }

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
    if (reduce) return;
    var target = Number(el.dataset.count);
    var start = performance.now();
    var dur = 1200;
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Rotación en la cancha ---------- */
  // Las zonas en el orden en que se rota (en el sentido del reloj):
  // el que está en la 4 pasa a la 3, de la 3 a la 2, de la 2 a la 1, etc.
  var SEQ = [4, 3, 2, 1, 6, 5];
  var SPOT = { 4: [70, 80], 3: [150, 80], 2: [230, 80], 5: [70, 200], 6: [150, 200], 1: [230, 200] };
  var SAY = {
    4: 'Zona 4 · Adelante: mi zona de ataque',
    3: 'Zona 3 · Adelante, al medio',
    2: 'Zona 2 · Adelante, a la derecha',
    1: 'Zona 1 · Atrás: me toca sacar',
    6: 'Zona 6 · Atrás, al medio',
    5: 'Zona 5 · Atrás, a la izquierda'
  };
  var court = document.getElementById('court');
  var players = court ? court.querySelectorAll('.pl') : [];
  var steps = document.querySelectorAll('#rot-steps li');
  var status = document.getElementById('rot-status');
  var game = document.getElementById('game');
  var turn = 0;

  // salto y remate, solo cuando estoy en la zona 4
  function play() {
    if (!court || reduce || SEQ[turn] !== 4) return;
    court.classList.remove('is-play');
    void court.getBoundingClientRect();
    court.classList.add('is-play');
  }

  function place() {
    players.forEach(function (p) {
      var xy = SPOT[SEQ[(Number(p.dataset.i) + turn) % 6]];
      p.removeAttribute('transform');
      p.style.transform = 'translate(' + xy[0] + 'px, ' + xy[1] + 'px)';
    });
    var zone = SEQ[turn];
    status.textContent = SAY[zone];
    steps.forEach(function (s, i) { s.classList.toggle('is-on', i === turn); });
    game.querySelectorAll('li').forEach(function (li) {
      li.classList.toggle('is-on', li.dataset.zones.split(' ').indexOf(String(zone)) > -1);
    });
    court.classList.toggle('is-z4', zone === 4);
    court.setAttribute('aria-label', 'Cancha de vóley vista desde arriba, con la red arriba. Lucas, con la 10, está en la zona ' +
      zone + (zone === 4 || zone === 3 || zone === 2 ? ', adelante.' : ', atrás.'));
  }

  if (court) {
    game.classList.add('is-live');
    court.classList.add('is-z4');
    place();
    document.getElementById('rot-btn').addEventListener('click', function () {
      turn = (turn + 1) % 6;
      place();
      if (turn === 0) setTimeout(play, 650);
    });
  }

  /* ---------- Entradas al scrollear ---------- */
  // Lo que entra junto aparece escalonado, de a 80 ms. Al cargar, espera
  // a que termine de entrar el nombre.
  var t0 = performance.now();
  var revealEls = document.querySelectorAll('.reveal');
  function show(el, delay) {
    el.style.setProperty('--retraso', delay + 'ms');
    el.classList.add('sc-visible', 'is-in');
    setTimeout(function () { el.querySelectorAll('[data-count]').forEach(countUp); }, delay);
    if (el.contains(court)) setTimeout(play, delay + 200);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      var wait = Math.max(0, introStart + 300 - (performance.now() - t0));
      entries.filter(function (entry) { return entry.isIntersecting; }).forEach(function (entry, k) {
        show(entry.target, wait + Math.min(k, 8) * 80);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) {
      el.classList.add('sc-in');
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
    ['inicio', 'datos', 'cancha', 'fotos', 'video'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) navIo.observe(s);
    });
  }

  /* ---------- Video ---------- */
  // El botón rojo lo reproduce con sonido. Después quedan los controles
  // del navegador, y al terminar vuelve el botón para verlo de nuevo.
  var screen = document.getElementById('video-screen');
  var clip = document.getElementById('video-clip');
  var playBtn = document.getElementById('video-play');
  playBtn.addEventListener('click', function () {
    clip.controls = true;
    clip.play();
  });
  clip.addEventListener('play', function () { screen.classList.add('is-playing'); });
  clip.addEventListener('ended', function () {
    screen.classList.remove('is-playing');
    clip.controls = false;
    playBtn.focus();
  });
})();
