/* ============================================
   MAIN.JS — Adsutori Portfolio
   All interactions, no dependencies
   ============================================ */

'use strict';

/* ─── NAVBAR SCROLL BEHAVIOR ─── */

(function initNav() {
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('drawer');

  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      hamburger.setAttribute(
        'aria-label',
        isOpen ? 'Zamknij menu' : 'Otwórz menu'
      );
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Otwórz menu');
        document.body.style.overflow = '';
      });
    });
  }
})();


/* ─── SCROLL REVEAL ─── */

(function initReveal() {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReduced) return;

  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ─── HERO LOAD ANIMATION ─── */

(function initHeroAnimation() {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReduced) return;

  // Hero reveal elements are handled by the scroll observer above,
  // but hero is already in viewport on load — trigger manually.
  const heroReveals = document.querySelectorAll('.hero .reveal');
  if (!heroReveals.length) return;

  // Small rAF delay ensures CSS transition is registered before class add
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroReveals.forEach(el => el.classList.add('is-visible'));
    });
  });
})();


/* ─── SCROLL INDICATOR HIDE ON SCROLL ─── */

(function initScrollIndicator() {
  const indicator = document.querySelector('.hero__scroll');
  if (!indicator) return;

  const hide = () => {
    if (window.scrollY > 80) {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
    } else {
      indicator.style.opacity = '';
      indicator.style.pointerEvents = '';
    }
  };

  window.addEventListener('scroll', hide, { passive: true });
})();


/* ─── COUNT-UP ANIMATION ─── */

(function initCountUp() {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Collect all elements with data-count attribute
  const targets = document.querySelectorAll('[data-count]');
  if (!targets.length) return;

  /**
   * Animate a single element from 0 to its target value.
   * Handles prefixes (+, −) and suffixes (%, etc.) automatically.
   * @param {HTMLElement} el
   */
  function animateCount(el) {
    const raw      = el.getAttribute('data-count');   // e.g. "340", "60"
    const display  = el.textContent.trim();            // e.g. "+340%", "−60%"
    const target   = parseInt(raw, 10);
    const duration = 1200; // ms
    const start    = performance.now();

    // Detect prefix and suffix from the rendered text
    const prefix = display.replace(/[\d]+.*$/, '');    // "+", "−", or ""
    const suffix = display.replace(/^[^0-9]*[\d]+/, ''); // "%", " tyg.", or ""

    if (prefersReduced) return; // leave text as-is

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);

      el.textContent = prefix + value + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Restore original display text exactly
        el.textContent = display;
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ─── FAQ ACCORDION ─── */

(function initFaq() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  /**
   * Open a single FAQ item.
   * @param {HTMLElement} item
   */
  function openItem(item) {
    const answer  = item.querySelector('.faq__answer');
    const btn     = item.querySelector('.faq__question');
    if (!answer || !btn) return;

    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');

    // Set explicit max-height for CSS transition
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }

  /**
   * Close a single FAQ item.
   * @param {HTMLElement} item
   */
  function closeItem(item) {
    const answer = item.querySelector('.faq__answer');
    const btn    = item.querySelector('.faq__question');
    if (!answer || !btn) return;

    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight = '0';
  }

  items.forEach(item => {
    const btn = item.querySelector('.faq__question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all other open items
      items.forEach(other => {
        if (other !== item) closeItem(other);
      });

      // Toggle clicked item
      isOpen ? closeItem(item) : openItem(item);
    });

    // Keyboard: Space and Enter already fire click on <button>.
    // Support Escape to close.
    btn.addEventListener('keydown', e => {
      if (e.key === 'Escape' && item.classList.contains('is-open')) {
        closeItem(item);
        btn.focus();
      }
    });
  });
})();


/* ─── CONTACT FORM ─── */

(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('submit-btn');
  const successMsg = document.getElementById('form-success');
  const errorEl    = document.getElementById('form-error');

  if (!form) return;

  // ─── Walidacja ────────────────────────────────────────────
  function validateField(input) {
    const value = input.value.trim();
    let valid = true;
    if (input.required && !value) valid = false;
    if (input.type === 'email' && value) {
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    input.classList.toggle('is-error', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error')) {
        input.classList.remove('is-error');
        input.setAttribute('aria-invalid', 'false');
      }
    });
  });

  // ─── Helpers ──────────────────────────────────────────────
  function resetBtn() {
    submitBtn.disabled = false;
    submitBtn.removeAttribute('data-loading');
    submitBtn.innerHTML = `Umów bezpłatną konsultację
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
    setTimeout(() => { errorEl.hidden = true; }, 6000);
  }

  // ─── Submit ───────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs   = Array.from(form.querySelectorAll('.form-input'));
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) {
      const firstError = form.querySelector('.is-error');
      if (firstError) firstError.focus();
      return;
    }

    // Ładowanie
    submitBtn.disabled = true;
    submitBtn.setAttribute('data-loading', 'true');
    let dots = 0;
    const loadingInterval = setInterval(() => {
      dots = (dots + 1) % 4;
      submitBtn.textContent = 'Wysyłanie' + '.'.repeat(dots);
    }, 350);

    try {
      const res = await fetch('https://formspree.io/f/xnjkndrl', {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    new FormData(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.errors?.[0]?.message || 'Błąd serwera');
      }

      clearInterval(loadingInterval);
      form.reset();

      // Formularz wygasa
      form.classList.add('is-hiding');

      setTimeout(() => {
        form.hidden = true;
        form.classList.remove('is-hiding');
        successMsg.hidden = false;

        requestAnimationFrame(() => requestAnimationFrame(() => {
          successMsg.classList.add('is-visible');
          successMsg.focus();
        }));

        // Auto-znikanie po 10s
        setTimeout(() => {
          successMsg.classList.remove('is-visible');
          successMsg.classList.add('is-hiding-out');

          setTimeout(() => {
            successMsg.hidden = true;
            successMsg.classList.remove('is-hiding-out');
            form.hidden = false;
            resetBtn();

            requestAnimationFrame(() => requestAnimationFrame(() => {
              form.classList.add('is-entering');
              setTimeout(() => form.classList.remove('is-entering'), 500);
            }));
          }, 600);
        }, 10000);

      }, 400);

    } catch (err) {
      clearInterval(loadingInterval);
      console.error('Form error:', err);
      resetBtn();
      showError('Coś poszło nie tak. Napisz bezpośrednio na kontakt@adsutori.com');
    }
  });
})();




/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ─── */

(function initSmoothScroll() {
  // Native scroll-behavior: smooth is set in base.css.
  // This handles the navbar offset so sections aren't hidden under sticky nav.

  const NAV_HEIGHT = 64; // px — matches CSS nav height

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id     = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top
                + window.scrollY
                - NAV_HEIGHT
                - 16; // 16px extra breathing room

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─── ACTIVE NAV LINK ON SCROLL ─── */

(function initActiveNav() {
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const NAV_HEIGHT = 64;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const id = entry.target.getAttribute('id');

        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          const isActive = href === `#${id}`;
          link.classList.toggle('is-active', isActive);
          link.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      });
    },
    {
      rootMargin: `-${NAV_HEIGHT + 8}px 0px -60% 0px`,
      threshold: 0
    }
  );

  sections.forEach(section => observer.observe(section));
})();


/* ─── CARD HOVER — KEYBOARD ACCESSIBLE ─── */

(function initCardKeyboard() {
  // Cards with a primary link should be fully keyboard navigable.
  // Clicking the card (not just the link) navigates to the case study.

  document.querySelectorAll('.card').forEach(card => {
    const primaryLink = card.querySelector('.card__footer .btn-link');
    if (!primaryLink) return;

    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'link');
    card.setAttribute(
      'aria-label',
      (card.querySelector('.card__title')?.textContent?.trim() || 'Projekt')
      + ' — zobacz case study'
    );

    card.addEventListener('click', (e) => {
      // Don't double-fire if the actual link was clicked
      if (e.target.closest('a')) return;
      primaryLink.click();
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        primaryLink.click();
      }
    });
  });
})();


/* ─── ACTIVE NAV LINK STYLE (CSS hook) ─── */

/*
  Add to css/components.css if not already present:

  .nav__link.is-active {
    color: var(--text-primary);
  }
  .nav__link.is-active::after {
    width: 100%;
  }
*/
