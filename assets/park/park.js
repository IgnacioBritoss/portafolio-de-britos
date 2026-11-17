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

  /* ---------- La jugada en la cancha ---------- */
  var court = document.querySelector('.court');
  var lastPlay = 0;
  function play() {
    if (!court || reduce || performance.now() - lastPlay < 2200) return;
    lastPlay = performance.now();
    court.classList.remove('is-play');
    void court.getBoundingClientRect();
    court.classList.add('is-play');
  }
  // se repite al pasar por encima o tocar la tarjeta
  var posTile = document.getElementById('posicion');
  if (posTile) {
    posTile.addEventListener('mouseenter', play);
    posTile.addEventListener('click', play);
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
    ['inicio', 'datos', 'fotos', 'video'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) navIo.observe(s);
    });
  }

  /* ---------- Fotos de partidos ---------- */
  // Un clic: se va la portada y aparece la foto. Otro clic: se cierra.
  var shots = document.querySelectorAll('.shot');
  function setShot(card, open) {
    card.classList.toggle('is-open', open);
    card.querySelector('.shot__media').setAttribute('aria-pressed', String(open));
  }
  shots.forEach(function (card) {
    var btn = card.querySelector('.shot__media');
    var frame = card.querySelector('.shot__frame');
    // brillo que sigue al mouse
    btn.addEventListener('pointermove', function (e) {
      var r = frame.getBoundingClientRect();
      frame.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      frame.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    btn.addEventListener('click', function () {
      var open = !card.classList.contains('is-open');
      shots.forEach(function (c) { if (c !== card) setShot(c, false); });
      setShot(card, open);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') shots.forEach(function (c) { setShot(c, false); });
  });

  /* ---------- Video ---------- */
  // Con el código de YouTube en data-youtube, el botón carga el reproductor.
  var screen = document.getElementById('video-screen');
  var playBtn = document.getElementById('video-play');
  var soon = document.getElementById('video-soon');
  playBtn.addEventListener('click', function () {
    var id = screen.dataset.youtube;
    if (!id) {
      soon.textContent = 'El video está en camino';
      return;
    }
    var frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    frame.title = 'Mis mejores jugadas';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    screen.innerHTML = '';
    screen.appendChild(frame);
  });
})();
