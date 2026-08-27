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
