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

  /* ---------- 2. Starfield del hero ---------- */
  const field = document.getElementById('starfield');
  if (field && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('i');
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
      s.style.opacity = (0.3 + Math.random() * 0.6).toFixed(2);
      const size = (Math.random() * 1.5 + 1).toFixed(1);
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      frag.appendChild(s);
    }
    field.appendChild(frag);
  }

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
