/* ============================================
   HERO-CANVAS.JS — Particle mesh background
   Canvas-based, no dependencies
   Respects prefers-reduced-motion
   ============================================ */

'use strict';

(function initHeroCanvas() {

  /* ── Reduced motion guard ── */
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReduced) return;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  /* ══════════════════════════════════════════
     CONFIG — all visual decisions live here
  ══════════════════════════════════════════ */

  const CONFIG = {
    /* Particle count scales with viewport */
    particleBase:    52,
    particleMobile:  28,

    /* Connection */
    connectionRadius: 160,   /* px — max distance to draw a line  */
    connectionOpacityMax: 0.18,

    /* Particle appearance */
    particleRadius:    1.4,
    particleOpacity:   0.55,

    /* Speed — very slow, calm */
    speedMin:  0.08,
    speedMax:  0.19,

    /* Colors — pulled from design tokens */
    colorParticle:    '255, 255, 255',   /* white                  */
    colorLineAccent:  '59, 130, 246',    /* --accent               */
    colorLineNeutral: '255, 255, 255',   /* white for distant lines */

    /* Accent line threshold:
       lines shorter than this % of connectionRadius
       get accent color, rest get neutral */
    accentThreshold: 0.45,

    /* Mouse interaction */
    mouseRadius:      200,
    mouseForce:       0.012,

    /* Fade-in after init */
    fadeInDelay: 200,
  };

  /* ══════════════════════════════════════════
     STATE
  ══════════════════════════════════════════ */

  let W, H, dpr, particles, animId;
  const mouse = { x: -9999, y: -9999 };

  /* ══════════════════════════════════════════
     PARTICLE CLASS
  ══════════════════════════════════════════ */

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x  = Math.random() * W;
      this.y  = initial ? Math.random() * H : (Math.random() < 0.5 ? -8 : H + 8);
      this.vx = (Math.random() - 0.5) * 2 * CONFIG.speedMax;
      this.vy = (Math.random() - 0.5) * 2 * CONFIG.speedMax;

      /* Enforce minimum speed */
      const speed = Math.hypot(this.vx, this.vy);
      if (speed < CONFIG.speedMin) {
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * CONFIG.speedMin;
        this.vy = Math.sin(angle) * CONFIG.speedMin;
      }

      /* Slight size variation */
      this.r = CONFIG.particleRadius * (0.7 + Math.random() * 0.6);

      /* Individual opacity variation */
      this.opacity = CONFIG.particleOpacity * (0.6 + Math.random() * 0.4);
    }

    update() {
      /* Mouse repulsion */
      const dx    = this.x - mouse.x;
      const dy    = this.y - mouse.y;
      const dist  = Math.hypot(dx, dy);

      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force  = (1 - dist / CONFIG.mouseRadius) * CONFIG.mouseForce;
        this.vx += (dx / dist) * force * 60;
        this.vy += (dy / dist) * force * 60;
      }

      /* Velocity damping — keeps speed stable */
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > CONFIG.speedMax * 3) {
        this.vx = (this.vx / speed) * CONFIG.speedMax * 3;
        this.vy = (this.vy / speed) * CONFIG.speedMax * 3;
      }

      this.x += this.vx;
      this.y += this.vy;

      /* Wrap around edges with small buffer */
      const buf = 20;
      if (this.x < -buf)  this.x = W + buf;
      if (this.x > W + buf) this.x = -buf;
      if (this.y < -buf)  this.y = H + buf;
      if (this.y > H + buf) this.y = -buf;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.colorParticle}, ${this.opacity})`;
      ctx.fill();
    }
  }

  /* ══════════════════════════════════════════
     SETUP
  ══════════════════════════════════════════ */

  function setup() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W   = canvas.offsetWidth;
    H   = canvas.offsetHeight;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const count = W < 768
      ? CONFIG.particleMobile
      : CONFIG.particleBase;

    particles = Array.from({ length: count }, () => new Particle());
  }

  /* ══════════════════════════════════════════
     DRAW CONNECTIONS
  ══════════════════════════════════════════ */

  function drawConnections() {
    const r  = CONFIG.connectionRadius;
    const r2 = r * r;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a  = particles[i];
        const b  = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;

        if (d2 > r2) continue;

        const dist     = Math.sqrt(d2);
        const progress = 1 - dist / r;  /* 1 = close, 0 = far */

        /* Opacity falls off with distance */
        const opacity = progress * CONFIG.connectionOpacityMax;

        /* Color: accent for close connections, neutral for distant */
        const color = progress > CONFIG.accentThreshold
          ? CONFIG.colorLineAccent
          : CONFIG.colorLineNeutral;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${color}, ${opacity})`;
        ctx.lineWidth   = progress * 0.8;
        ctx.stroke();
      }
    }
  }

  /* ══════════════════════════════════════════
     ANIMATION LOOP
  ══════════════════════════════════════════ */

  function tick() {
    ctx.clearRect(0, 0, W, H);

    drawConnections();

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    animId = requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════════
     RESIZE HANDLER — debounced
  ══════════════════════════════════════════ */

  let resizeTimer;

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      setup();
      tick();
    }, 150);
  }

  /* ══════════════════════════════════════════
     MOUSE / TOUCH TRACKING
  ══════════════════════════════════════════ */

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function onTouchMove(e) {
    if (!e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }

  /* ══════════════════════════════════════════
     VISIBILITY — pause when tab hidden
  ══════════════════════════════════════════ */

  function onVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      tick();
    }
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */

  setup();
  tick();

  /* Fade in after short delay — avoids flash on load */
  setTimeout(() => {
    canvas.classList.add('is-ready');
  }, CONFIG.fadeInDelay);

  /* Event listeners */
  window.addEventListener('resize',           onResize,           { passive: true });
  window.addEventListener('mousemove',        onMouseMove,        { passive: true });
  window.addEventListener('mouseleave',       onMouseLeave);
  window.addEventListener('touchmove',        onTouchMove,        { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

})();
