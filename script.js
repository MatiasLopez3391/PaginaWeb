document.addEventListener('DOMContentLoaded', function () {

  /* ---------- 0. Nav: estado al hacer scroll ---------- */
  const nav = document.querySelector('.nav');
  const navFill = document.querySelector('.nav__fill');
  const navStars = document.getElementById('navStars');
  const NAV_THRESHOLD = 200; // px de scroll hasta el color pleno
  const onScroll = function () {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    const p = Math.max(0, Math.min(1, window.scrollY / NAV_THRESHOLD)).toFixed(3);
    if (navFill) navFill.style.opacity = p;
    if (navStars) navStars.style.opacity = p;
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

  // Cerrar el menú al tocar fuera o presionar Escape
  document.addEventListener('click', function (e) {
    if (links.classList.contains('open') && !links.contains(e.target) && !toggle.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
    }
  });

  /* ---------- 2. Protección: Bloqueo de atajos y clic derecho ---------- */
  // Bloquear menú contextual (clic derecho)
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  // Evitar arrastre de imágenes
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG' || e.target.closest('img')) {
      e.preventDefault();
    }
  });

  // Bloquear F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S (y equivalentes en Mac)
  document.addEventListener('keydown', function (e) {
    // Tecla F12
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const key = e.key ? e.key.toUpperCase() : '';

    if (isCtrlOrCmd) {
      // Inspector de elementos y consola (Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
      if (e.shiftKey && (key === 'I' || key === 'J' || key === 'C')) {
        e.preventDefault();
        return false;
      }
      // Ver código fuente (Ctrl+U) y guardar página (Ctrl+S)
      if (key === 'U' || key === 'S') {
        e.preventDefault();
        return false;
      }
    }
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
   4. Constelación interactiva (Canvas / Red Neuronal)
   ========================================================= */
(function () {
  const canvas = document.getElementById('constellationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  const maxParticles = 75; // Número de nodos (estrellas)
  const connectionDistance = 100; // Distancia máxima para conectar nodos entre sí
  const mouseConnectionDistance = 160; // Radio de alcance del cursor
  
  let mouse = { x: null, y: null };
  
  function resize() {
    // Manejar densidad de píxeles (Retina displays) para que no se vea borroso
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    width = rect.width;
    height = rect.height;
  }
  
  window.addEventListener('resize', resize);
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7; // Velocidad X
      this.vy = (Math.random() - 0.5) * 0.7; // Velocidad Y
      this.radius = Math.random() * 1.5 + 0.8; // Tamaño del nodo
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      // Rebote suave en los bordes del canvas
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)'; // Color cian
      ctx.fill();
    }
  }
  
  function init() {
    resize();
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }
  
  function animate() {
    // Limpiar canvas en cada frame
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
      // Dibujar conexiones entre nodos
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          // Opacidad basada en la distancia
          ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / connectionDistance) * 0.4})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
      
      // Conexiones dinámicas hacia el cursor del mouse
      if (mouse.x !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouseConnectionDistance) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          // Línea más fuerte y con tono violeta al interactuar
          ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - dist / mouseConnectionDistance) * 0.8})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      
      particles[i].update();
      particles[i].draw();
    }
    
    requestAnimationFrame(animate);
  }
  
  canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  
  canvas.addEventListener('mouseleave', function() {
    mouse.x = null;
    mouse.y = null;
  });
  
  // Iniciar al cargar (pequeño retraso para asegurar dimensiones correctas)
  setTimeout(() => {
    init();
    animate();
  }, 50);
})();

/* =========================================================
   5. Estrellas de fondo para sección Servicios
   ========================================================= */
(function () {
  const canvas = document.getElementById('serviciosStars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  // Dibuja una estrella de 4 puntas centrada en (cx, cy)
  function drawStar(cx, cy, outerR, opacity, blur) {
    const innerR = outerR * 0.25;
    const points = 4;
    ctx.save();
    if (blur > 0) {
      ctx.shadowBlur = blur;
      ctx.shadowColor = `rgba(56,189,248,${opacity})`;
    }
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(56,189,248,${opacity})`;
    ctx.fill();
    ctx.restore();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(dpr, dpr);
    W = rect.width;
    H = rect.height;
  }

  function spawnStars() {
    stars = [];
    // Más densas en los extremos, más escasas en el centro (donde va el contenido)
    const count = Math.floor((W * H) / 6000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        // Tamaño variado: mayoría pequeñas, pocas grandes
        r: Math.random() < 0.85 ? Math.random() * 1.5 + 0.4 : Math.random() * 3.5 + 1.5,
        baseOpacity: Math.random() * 0.35 + 0.05,
        // Cada estrella tiene su propia fase y velocidad de parpadeo
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.008,
        blur: Math.random() < 0.15 ? Math.random() * 6 + 2 : 0, // Sólo ~15% con halo
      });
    }
  }

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    frame++;
    stars.forEach(s => {
      // Parpadeo suave con seno de baja frecuencia
      const twinkle = Math.sin(s.phase + frame * s.speed);
      const opacity = s.baseOpacity + twinkle * s.baseOpacity * 0.5;
      drawStar(s.x, s.y, s.r, Math.max(0, opacity), s.blur);
    });
    requestAnimationFrame(draw);
  }

  function init() {
    resize();
    spawnStars();
    draw();
  }

  window.addEventListener('resize', () => { resize(); spawnStars(); });
  // Esperar a que la sección esté pintada
  setTimeout(init, 80);
})();

/* =========================================================
   6. Campo de estrellas / constelaciones (hero + navbar)
   ========================================================= */
(function () {
  var STAR = 'rgba(226,240,255,';
  var LINE = 'rgba(56,189,248,';

  function Field(canvas, host, density, baseLink) {
    this.canvas = canvas;
    this.host = host;
    this.density = density;
    this.baseLink = baseLink;
    this.stars = [];
    this.mouse = { x: -9999, y: -9999, in: false };
    var self = this;
    host.addEventListener('pointermove', function (e) {
      var r = self.canvas.getBoundingClientRect();
      self.mouse = { x: e.clientX - r.left, y: e.clientY - r.top, in: true };
    });
    host.addEventListener('pointerleave', function () {
      self.mouse = { x: -9999, y: -9999, in: false };
    });
    this.size();
    if (window.ResizeObserver) new ResizeObserver(function () { self.size(); }).observe(host);
    window.addEventListener('resize', function () { self.size(); });
  }

  Field.prototype.size = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = this.canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.ctx = this.canvas.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = r.width;
    this.h = r.height;
    var n = Math.max(18, Math.round((r.width * r.height) / this.density));
    this.stars = [];
    for (var i = 0; i < n; i++) {
      this.stars.push({
        x: Math.random() * r.width,
        y: Math.random() * r.height,
        r: Math.random() * 1.35 + 0.25,
        ph: Math.random() * Math.PI * 2,
        sp: 0.4 + Math.random() * 1.1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.42 - 0.06,
        ox: 0, oy: 0,
        depth: 0.35 + Math.random() * 0.9
      });
    }
  };

  Field.prototype.links = function (pts, max, gain, R) {
    if (gain <= 0) return;
    var ctx = this.ctx;
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d >= max) continue;
        var prox = (pts[i].d != null) ? 1 - Math.max(pts[i].d, pts[j].d) / R : 1;
        var a = (1 - d / max) * gain * prox;
        if (a <= 0.01) continue;
        ctx.strokeStyle = LINE + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[j].x, pts[j].y);
        ctx.stroke();
      }
    }
  };

  Field.prototype.draw = function (time) {
    if (!this.ctx) { this.size(); if (!this.ctx) return; }
    var ctx = this.ctx, w = this.w, h = this.h, m = this.mouse;
    var R = h < 160 ? 150 : 210, pts = [], near = [];
    ctx.clearRect(0, 0, w, h);
    for (var k = 0; k < this.stars.length; k++) {
      var st = this.stars[k];
      st.x += st.vx;
      st.y += st.vy;
      if (st.x < -4) st.x = w + 4; else if (st.x > w + 4) st.x = -4;
      if (st.y < -4) st.y = h + 4; else if (st.y > h + 4) st.y = -4;
      var tx = 0, ty = 0;
      if (m.in) {
        tx = ((m.x - w / 2) / w) * 26 * st.depth;
        ty = ((m.y - h / 2) / h) * 26 * st.depth;
        var dx = st.x + tx - m.x, dy = st.y + ty - m.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < R && d > 0.001) {
          var push = (1 - d / R) * 34 * st.depth;
          tx += (dx / d) * push;
          ty += (dy / d) * push;
        }
      }
      st.ox += (tx - st.ox) * 0.07;
      st.oy += (ty - st.oy) * 0.07;
      var x = st.x + st.ox, y = st.y + st.oy;
      var a = 0.28 + 0.55 * (0.5 + 0.5 * Math.sin(time * st.sp + st.ph));
      if (m.in) {
        var dmx = x - m.x, dmy = y - m.y;
        var dm = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dm < R) {
          a = Math.min(1, a + (1 - dm / R) * 0.6);
          near.push({ x: x, y: y, d: dm });
        }
      }
      pts.push({ x: x, y: y });
      ctx.beginPath();
      ctx.fillStyle = STAR + a.toFixed(3) + ')';
      ctx.arc(x, y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineWidth = 1;
    this.links(pts, 105, this.baseLink, R);
    if (near.length) this.links(near, 110, 0.5, R);
  };

  var heroCanvas = document.getElementById('heroStars');
  var navCanvas = document.getElementById('navStars');
  var hero = heroCanvas && heroCanvas.parentElement;
  var navInner = navCanvas && navCanvas.parentElement;
  var heroField = heroCanvas ? new Field(heroCanvas, hero, 9000, 0.1) : null;
  var navField = navCanvas ? new Field(navCanvas, navInner, 6200, 0.14) : null;

  // Fondos animados de "Para quién trabajamos" y "Quiénes somos"
  var sectionFields = [];
  ['skyStars'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) sectionFields.push(new Field(el, el.parentElement, 11000, 0.1));
  });

  (function frame(t) {
    requestAnimationFrame(frame);
    var time = t / 1000;
    if (heroField) heroField.draw(time);
    if (navField && parseFloat(navCanvas.style.opacity || 0) > 0.01) navField.draw(time);
    for (var i = 0; i < sectionFields.length; i++) {
      var f = sectionFields[i];
      var r = f.canvas.getBoundingClientRect();
      if (r.bottom > -200 && r.top < window.innerHeight + 200) f.draw(time);
    }
  })(0);
})();
