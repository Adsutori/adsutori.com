/* ============================================
   HERO-BG-PARALLAX.JS
   Parallax z myszką dla hero__bg-image
   Działa razem z idle zoom z CSS
   ============================================ */

'use strict';

(function initHeroBgParallax() {

  /* ── Reduced motion guard ── */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const bgImage = document.querySelector('.hero__bg-image');
  const hero    = document.querySelector('.hero');
  if (!bgImage || !hero) return;

  /* ══════════════════════════════════════════
     CONFIG
  ══════════════════════════════════════════ */

  const CONFIG = {
    /* Jak mocno zdjęcie reaguje na myszkę
       Im mniejsza wartość, tym subtelniejszy ruch */
    strength: 14,

    /* Smooth lerp — ile klatek zajmuje doganianie kursora
       0.05 = bardzo leniwe, 0.12 = responsywne ale płynne */
    lerp: 0.055,
  };

  /* ══════════════════════════════════════════
     STATE
  ══════════════════════════════════════════ */

  let targetX  = 0;
  let targetY  = 0;
  let currentX = 0;
  let currentY = 0;
  let animId   = null;
  let isActive = false;

  /* ══════════════════════════════════════════
     MOUSE TRACKING
     Normalizujemy pozycję do [-1, 1]
  ══════════════════════════════════════════ */

  function onMouseMove(e) {
    const rect = hero.getBoundingClientRect();

    /* Tylko gdy kursor jest nad sekcją hero */
    if (
      e.clientY < rect.top    ||
      e.clientY > rect.bottom ||
      e.clientX < rect.left   ||
      e.clientX > rect.right
    ) return;

    /* Normalizacja: środek ekranu = 0, krawędzie = ±1 */
    const normalX = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
    const normalY = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);

    targetX = normalX * CONFIG.strength * -1;  /* -1 = ruch przeciwny do kursora */
    targetY = normalY * CONFIG.strength * -1;
  }

  /* Gdy kursor opuszcza hero — płynny powrót do centrum */
  function onMouseLeave() {
    targetX = 0;
    targetY = 0;
  }

  /* ══════════════════════════════════════════
     TOUCH — delikatny tilt na mobile
  ══════════════════════════════════════════ */

  function onDeviceOrientation(e) {
    if (!e.gamma || !e.beta) return;

    /* gamma = przechył lewo/prawo, beta = przód/tył */
    const tiltX = Math.max(-30, Math.min(30, e.gamma)) / 30;
    const tiltY = Math.max(-30, Math.min(30, e.beta - 30)) / 30;

    targetX = tiltX * CONFIG.strength * -0.5;
    targetY = tiltY * CONFIG.strength * -0.5;
  }

  /* ══════════════════════════════════════════
     LERP ANIMATION LOOP
     Płynne doganianie targetu
  ══════════════════════════════════════════ */

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function tick() {
    /* Interpolacja do targetu */
    currentX = lerp(currentX, targetX, CONFIG.lerp);
    currentY = lerp(currentY, targetY, CONFIG.lerp);

    /* Aplikuj transform — CSS animation (idle zoom) nadal działa
       bo używamy tego samego transform, ale JS go nadpisuje
       Dlatego musimy zachować skalę z animacji przez CSS var */
    bgImage.style.transform = `translate(${currentX}px, ${currentY}px)`;

    animId = requestAnimationFrame(tick);
  }

  /* ══════════════════════════════════════════
     VISIBILITY — pause gdy tab niewidoczny
  ══════════════════════════════════════════ */

  function onVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animId);
      isActive = false;
    } else {
      if (!isActive) {
        isActive = true;
        tick();
      }
    }
  }

  /* ══════════════════════════════════════════
     INIT
  ══════════════════════════════════════════ */

  isActive = true;
  tick();

  window.addEventListener('mousemove',        onMouseMove,        { passive: true });
  window.addEventListener('mouseleave',        onMouseLeave);
  window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);

})();
