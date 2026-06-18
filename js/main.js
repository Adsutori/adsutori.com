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

  if (!form) return;

  /**
   * Validate a single input element.
   * Returns true if valid, false otherwise.
   * @param {HTMLInputElement|HTMLTextAreaElement} input
   * @returns {boolean}
   */
  function validateField(input) {
    const value = input.value.trim();
    let valid   = true;

    if (input.required && !value) {
      valid = false;
    }

    if (input.type === 'email' && value) {
      // Simple RFC-ish check
      valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    input.classList.toggle('is-error', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  }

  // Live validation on blur (not on every keystroke — less annoying)
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));

    // Clear error state as soon as user starts correcting
    input.addEventListener('input', () => {
      if (input.classList.contains('is-error')) {
        input.classList.remove('is-error');
        input.setAttribute('aria-invalid', 'false');
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate all fields
    const inputs  = Array.from(form.querySelectorAll('.form-input'));
    const allValid = inputs.map(validateField).every(Boolean);

    if (!allValid) {
      // Focus first invalid field
      const firstError = form.querySelector('.is-error');
      if (firstError) firstError.focus();
      return;
    }

    // Loading state
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Wysyłanie…';

    try {
      /*
       * PRODUCTION NOTE:
       * Replace this with your actual form endpoint.
       * Options: Formspree, Netlify Forms, custom API route.
       *
       * Example with Formspree:
       * const res = await fetch('https://formspree.io/f/YOUR_ID', {
       *   method: 'POST',
       *   headers: { 'Accept': 'application/json' },
       *   body: new FormData(form)
       * });
       * if (!res.ok) throw new Error('Network response was not ok');
       */

      // Simulated async submission (replace with real fetch above)
      await new Promise(resolve => setTimeout(resolve, 900));

      // Success state
      form.reset();
      form.hidden           = true;
      successMsg.hidden     = false;
      successMsg.focus();

    } catch (err) {
      // Restore button on error
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Umów bezpłatną konsultację';

      // Show inline error (accessible)
      const errorEl = document.createElement('p');
      errorEl.setAttribute('role', 'alert');
      errorEl.style.cssText = `
        font-size: var(--text-sm);
        color: #f87171;
        margin-top: var(--space-2);
        font-family: var(--font-mono);
      `;
      errorEl.textContent = 'Coś poszło nie tak. Napisz bezpośrednio na kontakt@adsutori.com';

      // Remove previous error if exists
      const prev = form.querySelector('[role="alert"]');
      if (prev) prev.remove();

      form.appendChild(errorEl);
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
