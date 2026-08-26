document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 0. Nav: estado al hacer scroll ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = function () {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- 1. Menú móvil ---------- */
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', function () {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cerrar el menú al tocar un enlace
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    });
  });


  /* ---------- 3. Animaciones al hacer scroll ---------- */
  const revealTargets = document.querySelectorAll(
    '.feature, .card, .aud, .dev, .quote, .section__head, .client'
  );
  revealTargets.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('in'); });
  }

});

/* =========================================================
   4. Telescopio interactivo: circuito + constelación
   Las pistas nacen del cuerpo del tubo. El telescopio es una capa
   aparte por delante, así que el circuito siempre queda detrás.
   ========================================================= */
(function () {
  var scope = document.getElementById('scope');
  if (!scope) return;

  var gTraces = scope.querySelector('.scope__traces');
  var gNodes = scope.querySelector('.scope__nodes');
  var circle = scope.querySelector('.hero__circle');
  var btn = scope.querySelector('.scope__btn');
  var NS = 'http://www.w3.org/2000/svg';
  var RAD = Math.PI / 180;

  // Origen: mitad del cuerpo del tubo (viewBox 1000x1000)
  var OX = 488, OY = 479;

  var seed = 20260826;
  function rnd() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function mk(n, a) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function snap45(d) { return Math.round(d / 45) * 45; }

  function route(baseDeg, total, legs, turn) {
    var dir = snap45(baseDeg), x = OX, y = OY, pts = [[x, y]];
    for (var i = 0; i < legs; i++) {
      var dg = (i % 2 === 0) ? dir : dir + 45 * turn;
      var len = (total / legs) * (0.7 + 0.6 * rnd());
      x += Math.cos(dg * RAD) * len; y += Math.sin(dg * RAD) * len;
      x = Math.max(30, Math.min(970, x)); y = Math.max(20, Math.min(900, y));
      pts.push([x, y]);
    }
    return pts;
  }
  function trim(c, t, r) {
    var dx = t[0] - c[0], dy = t[1] - c[1], l = Math.hypot(dx, dy) || 1, k = Math.min(r, l / 2);
    return [c[0] + dx / l * k, c[1] + dy / l * k];
  }
  function toPath(pts, r) {
    var s = 'M ' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length - 1; i++) {
      var a = trim(pts[i], pts[i - 1], r), b = trim(pts[i], pts[i + 1], r);
      s += ' L ' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' Q ' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1);
    }
    var l = pts[pts.length - 1];
    return s + ' L ' + l[0].toFixed(1) + ' ' + l[1].toFixed(1);
  }
  function node(delay, build) {
    var g = mk('g', { 'class': 'node' });
    g.style.setProperty('--nd', delay.toFixed(2) + 's');
    build(g); gNodes.appendChild(g);
  }

  // Estrella de 4 (u 8) puntas
  function star(x, y, delay, s, eight) {
    node(delay, function (g) {
      var a = 30 * s, w = a * 0.15, b = a * 0.5, bw = b * 0.22;
      g.appendChild(mk('circle', { cx: x, cy: y, r: 15 * s, 'class': 'node__glow' }));
      g.appendChild(mk('path', {
        'class': 'node__ray',
        d: 'M ' + (x - a) + ' ' + y + ' L ' + x + ' ' + (y - w) + ' L ' + (x + a) + ' ' + y + ' L ' + x + ' ' + (y + w) + ' Z' +
           ' M ' + x + ' ' + (y - a) + ' L ' + (x + w) + ' ' + y + ' L ' + x + ' ' + (y + a) + ' L ' + (x - w) + ' ' + y + ' Z'
      }));
      if (eight) {
        var k = b * 0.7071, kw = bw * 0.7071;
        g.appendChild(mk('path', {
          'class': 'node__ray--sm',
          d: 'M ' + (x - k) + ' ' + (y - k) + ' L ' + (x + kw) + ' ' + (y - kw) + ' L ' + (x + k) + ' ' + (y + k) + ' L ' + (x - kw) + ' ' + (y + kw) + ' Z' +
             ' M ' + (x + k) + ' ' + (y - k) + ' L ' + (x + kw) + ' ' + (y + kw) + ' L ' + (x - k) + ' ' + (y + k) + ' L ' + (x - kw) + ' ' + (y - kw) + ' Z'
        }));
      }
      g.appendChild(mk('circle', { cx: x, cy: y, r: 3 * s, 'class': 'node__core' }));
    });
  }
  // via pequeña sobre la pista
  function via(x, y, delay) {
    node(delay, function (g) {
      g.appendChild(mk('circle', { cx: x, cy: y, r: 9, 'class': 'node__glow' }));
      g.appendChild(mk('circle', { cx: x, cy: y, r: 5.5, 'class': 'node__via' }));
    });
  }
  function tag(x, y, delay, text, anchor) {
    node(delay, function (g) {
      var t = mk('text', { x: x, y: y, 'class': 'node__tag', 'text-anchor': anchor });
      t.textContent = text; g.appendChild(t);
    });
  }

  // 11 ramas (menos carga visual que antes)
  var angles = [-168, -140, -118, -96, -74, -52, -30, -6, 20, 48, 152];
  var labels = { 1: '</>', 5: '{ }', 8: '1011' };

  angles.forEach(function (a, i) {
    var legs = 2 + Math.floor(rnd() * 2.4);
    var total = 260 + rnd() * 260;
    var pts = route(a, total, legs, rnd() < 0.5 ? -1 : 1);
    var d = toPath(pts, 18);
    var delay = 0.06 * i + rnd() * 0.1;

    var halo = mk('path', { d: d, 'class': 'tr tr--halo' });
    var line = mk('path', { d: d, 'class': 'tr' });
    var pulse = mk('path', { d: d, 'class': 'tr tr--pulse' });
    gTraces.appendChild(halo); gTraces.appendChild(line); gTraces.appendChild(pulse);

    var len = Math.ceil(line.getTotalLength());
    [halo, line, pulse].forEach(function (p) {
      p.style.setProperty('--len', len);
      p.style.setProperty('--d', delay.toFixed(2) + 's');
    });
    pulse.style.setProperty('--nlen', -len);
    pulse.style.setProperty('--pd', (delay + rnd() * 2).toFixed(2) + 's');

    var end = pts[pts.length - 1], td = delay + 0.66;
    star(end[0], end[1], td, 0.8 + rnd() * 0.6, i % 3 === 0);

    if (labels[i]) {
      var right = end[0] > OX;
      tag(end[0] + (right ? 26 : -26), end[1] - 20, td + 0.22, labels[i], right ? 'start' : 'end');
    }
    if (pts.length > 2 && rnd() < 0.45) {
      var m = pts[1 + Math.floor(rnd() * (pts.length - 2))];
      via(m[0], m[1], delay + 0.42);
    }
  });

  // --- Activación: logo o botón ---
  var off;
  function live(on) {
    clearTimeout(off);
    if (on) scope.classList.add('is-live');
    else off = setTimeout(function () { scope.classList.remove('is-live'); }, 120);
  }
  [circle, btn].forEach(function (el) {
    if (!el) return;
    el.addEventListener('mouseenter', function () { live(true); });
    el.addEventListener('mouseleave', function () { live(false); });
  });
  if (btn) {
    btn.addEventListener('focus', function () { live(true); });
    btn.addEventListener('blur', function () { live(false); });
  }
  if (window.matchMedia('(hover: none)').matches) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { live(true); io.unobserve(e.target); } });
      }, { threshold: 0.4 });
      io.observe(scope);
    } else { live(true); }
  }
})();
