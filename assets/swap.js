/* ==========================================================
   Cambio de portafolio desde el logo (lo usan las dos páginas)
   Primer toque: el cuadradito gira 360° y muestra al otro.
   Segundo toque: una cortina sale del logo y lleva a la otra página.
   ========================================================== */
(function () {
  'use strict';

  var brand = document.querySelector('[data-swap]');
  if (!brand) return;

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mark = brand.querySelector('.brand__mark');
  var name = brand.querySelector('.brand__name');
  var own = {
    mark: mark.innerHTML,
    name: name.innerHTML,
    label: brand.getAttribute('aria-label'),
    color: brand.dataset.color
  };
  var alt = {
    mark: brand.dataset.altMark,
    name: brand.dataset.altName,
    label: brand.dataset.altLabel,
    color: brand.dataset.altColor
  };
  var isAlt = false;
  var busy = false;
  var timer;

  function show(toAlt) {
    var d = toAlt ? alt : own;
    mark.innerHTML = d.mark;
    name.innerHTML = d.name;
    brand.setAttribute('aria-label', d.label);
    brand.classList.toggle('is-alt', toAlt);
    isAlt = toAlt;
  }

  // el contenido cambia justo cuando el cuadradito está de canto
  function spin(toAlt) {
    busy = true;
    brand.classList.remove('is-spinning');
    void brand.offsetWidth;
    brand.classList.add('is-spinning');
    setTimeout(function () { show(toAlt); }, reduce ? 0 : 330);
    setTimeout(function () {
      brand.classList.remove('is-spinning');
      busy = false;
    }, reduce ? 0 : 760);
  }

  function cover(color, text) {
    var r = mark.getBoundingClientRect();
    var el = document.createElement('div');
    el.className = 'swap-cover';
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--swap-x', r.left + r.width / 2 + 'px');
    el.style.setProperty('--swap-y', r.top + r.height / 2 + 'px');
    el.style.setProperty('--swap-color', color);
    el.innerHTML = '<span>' + text + '</span>';
    document.body.appendChild(el);
    return el;
  }

  function go() {
    var url = location.protocol === 'file:' ? brand.dataset.swapFile : brand.dataset.swap;
    try { sessionStorage.setItem('swap-in', '1'); } catch (e) {}
    clearTimeout(timer);
    if (reduce) { location.href = url; return; }
    var el = cover(alt.color, alt.mark);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('is-on'); });
    });
    setTimeout(function () { location.href = url; }, 820);
  }

  brand.addEventListener('click', function (e) {
    e.preventDefault();
    if (busy) return;
    if (!isAlt) {
      spin(true);
      clearTimeout(timer);
      // si no se vuelve a tocar, después de unos segundos vuelve solo
      timer = setTimeout(function () { if (isAlt) spin(false); }, 6000);
    } else {
      go();
    }
  });

  // al volver con el botón de atrás, el logo arranca en su lugar
  window.addEventListener('pageshow', function () {
    if (isAlt) show(false);
    document.querySelectorAll('.swap-cover').forEach(function (c) { c.remove(); });
  });

  // llegada desde el otro portafolio: la cortina se cierra sobre el logo
  if (root.classList.contains('swap-entering')) {
    var el = cover(own.color, own.mark);
    el.classList.add('is-on', 'is-instant');
    root.classList.remove('swap-entering');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.remove('is-instant', 'is-on');
        setTimeout(function () { el.remove(); }, 900);
      });
    });
  }
})();
