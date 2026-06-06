/* =========================================================
   Agentic Architect — Marketing site interactions
   - Rolling 48h countdown (persisted via localStorage)
   - Sticky CTA visibility after hero
   - Scroll reveals
   - Exit-intent modal (desktop) / scroll-tail trigger (mobile)
   - Current year stamp
   ========================================================= */

(() => {
  'use strict';

  /* ---------- Year stamp ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav (hamburger + auto-close) ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navPanel = document.querySelector('.nav-links-panel');
  if (navToggle && navPanel) {
    const closeNav = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      navPanel.classList.remove('open');
      document.body.classList.remove('nav-open');
    };
    const openNav = () => {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
      navPanel.classList.add('open');
      document.body.classList.add('nav-open');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeNav();
      else openNav();
    });

    navPanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeNav());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navPanel.classList.contains('open')) closeNav();
    });

    const desktopMQ = window.matchMedia('(min-width: 821px)');
    const onDesktop = (e) => { if (e.matches) closeNav(); };
    if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', onDesktop);
    else desktopMQ.addListener(onDesktop);
  }

  /* ---------- Countdown (rolling 48h, persisted) ---------- */
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const KEY = 'aa_deadline_v1';
    const WINDOW_MS = 48 * 60 * 60 * 1000; // 48h rolling deadline

    let deadline = parseInt(localStorage.getItem(KEY) || '0', 10);
    const now = Date.now();
    if (!deadline || deadline < now) {
      deadline = now + WINDOW_MS;
      localStorage.setItem(KEY, String(deadline));
    }

    const pad = (n) => String(Math.max(0, n)).padStart(2, '0');
    const tick = () => {
      const diff = deadline - Date.now();
      if (diff <= 0) {
        countdownEl.textContent = '00:00:00';
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countdownEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Sticky CTA visibility ---------- */
  const sticky = document.getElementById('stickyCTA');
  const hero = document.querySelector('.hero');
  if (sticky && hero) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) sticky.classList.add('visible');
          else sticky.classList.remove('visible');
        });
      },
      { threshold: 0, rootMargin: '-200px 0px 0px 0px' }
    );
    io.observe(hero);
  }

  /* ---------- Scroll reveals ---------- */
  const revealTargets = document.querySelectorAll(
    '.section-head, .pain-card, .ba-col, .kit-card, .step, .quote, .two-col-card, .pricing-card, .bonus-stack, .math-grid, .final-cta, .trust-strip, .hero-details-inner, .example-card, .related-card'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  const revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach((el) => revealIO.observe(el));

  /* ---------- Exit intent modal ---------- */
  const modal = document.getElementById('exitModal');
  if (modal) {
    const SHOWN_KEY = 'aa_exit_shown_v1';
    const open = () => {
      if (sessionStorage.getItem(SHOWN_KEY)) return;
      sessionStorage.setItem(SHOWN_KEY, '1');
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });

    const isTouch = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;

    if (!isTouch) {
      let armed = false;
      setTimeout(() => { armed = true; }, 8000); // arm after 8s so it isn't annoying
      document.addEventListener('mouseout', (e) => {
        if (!armed) return;
        if (!e.relatedTarget && e.clientY <= 4) open();
      });
    } else {
      // Mobile fallback: trigger near the FAQ scroll position once
      let triggered = false;
      const onScroll = () => {
        if (triggered) return;
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.documentElement.scrollHeight;
        if (scrolled / total > 0.75) {
          triggered = true;
          open();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }
})();
