(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Entradas al scrollear ---------- */
  // Las clases las pone el JS: si no corre, todo se ve igual.
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('sc-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.classList.add('sc-in');
      // lo que se ve al entrar aparece escalonado
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.style.setProperty('--retraso', Math.min(i, 6) * 90 + 'ms');
      }
      io.observe(el);
    });
  }

  /* ---------- Sección actual en el menú ---------- */
  var links = document.querySelectorAll('.nav a');
  if ('IntersectionObserver' in window) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['datos', 'historia', 'fotos', 'video'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navIo.observe(el);
    });
  }

  /* ---------- Video ---------- */
  // Con el código de YouTube en data-youtube, el botón carga el reproductor.
  var screen = document.getElementById('video-screen');
  var play = document.getElementById('video-play');
  var soon = document.getElementById('video-soon');
  play.addEventListener('click', function () {
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
