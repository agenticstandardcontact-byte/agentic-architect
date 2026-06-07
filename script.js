/* =========================================================
   Agentic Architect — Marketing site interactions
   - Sticky CTA visibility after hero
   - Scroll reveals
   - Exit-intent modal (desktop) / scroll-tail trigger (mobile)
   - Current year stamp
   ========================================================= */

(() => {
  'use strict';

  /* ---------- Cookie consent (site-wide, injected once) ---------- */
  const COOKIE_KEY = 'aa_cookie_consent_v1';
  const PREFS_KEY = 'aa_cookie_prefs_v1';

  const sitePrefix = () => {
    const path = window.location.pathname;
    const marker = '/agentic-architect/';
    const idx = path.indexOf(marker);
    const rest = idx >= 0 ? path.slice(idx + marker.length) : path.replace(/^\//, '');
    const depth = (rest.match(/\//g) || []).length;
    return depth ? '../'.repeat(depth) : '';
  };

  const readPrefs = () => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore corrupt prefs */ }
    return { analytics: true, marketing: true };
  };

  const writePrefs = (prefs) => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  };

  const applyConsent = (choice, prefs) => {
    localStorage.setItem(COOKIE_KEY, choice);
    if (prefs) writePrefs(prefs);
    document.documentElement.classList.add('cookie-consent-set');
    document.dispatchEvent(new CustomEvent('aa:cookie-consent', { detail: { choice, prefs: prefs || readPrefs() } }));
  };

  const hideBar = (bar) => {
    bar.classList.add('is-hidden');
    bar.setAttribute('aria-hidden', 'true');
  };

  const prefix = sitePrefix();
  const privacyHref = `${prefix}privacy-policy.html`;
  const thirdPartyHref = `${prefix}index.html#faq`;

  const infoIcon = '<svg class="cookie-consent-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>';

  const mountCookieConsent = () => {
    if (document.getElementById('cookie-consent')) return;

    const bar = document.createElement('div');
    bar.id = 'cookie-consent';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML = `
      <div class="cookie-consent-inner">
        ${infoIcon}
        <div class="cookie-consent-body">
          <p class="cookie-consent-text">
            We use optional cookies for analytics (GoatCounter) and to improve the site, including newsletter forms (MailerLite).
            You can accept, reject, or manage preferences.
            See our <a href="${privacyHref}">Privacy statement</a> and
            <a href="${thirdPartyHref}">Third-party cookies</a>.
          </p>
          <div class="cookie-consent-actions">
            <button type="button" class="cookie-consent-btn cookie-consent-btn--accept" data-cookie-action="accept">Accept</button>
            <button type="button" class="cookie-consent-btn cookie-consent-btn--reject" data-cookie-action="reject">Reject</button>
            <button type="button" class="cookie-consent-btn cookie-consent-btn--manage" data-cookie-action="manage" aria-expanded="false" aria-controls="cookie-consent-panel">Manage cookies</button>
          </div>
          <div class="cookie-consent-panel" id="cookie-consent-panel">
            <div class="cookie-pref-row">
              <div class="cookie-pref-info">
                <strong>Essential</strong>
                <span>Required for the site to work. Always on.</span>
              </div>
              <label class="cookie-pref-toggle" aria-label="Essential cookies, always on">
                <input type="checkbox" checked disabled>
                <span class="cookie-pref-slider"></span>
              </label>
            </div>
            <div class="cookie-pref-row">
              <div class="cookie-pref-info">
                <strong>Analytics</strong>
                <span>GoatCounter, privacy-friendly page views. No ad tracking.</span>
              </div>
              <label class="cookie-pref-toggle" aria-label="Analytics cookies">
                <input type="checkbox" id="cookie-pref-analytics" checked>
                <span class="cookie-pref-slider"></span>
              </label>
            </div>
            <div class="cookie-pref-row">
              <div class="cookie-pref-info">
                <strong>Marketing</strong>
                <span>MailerLite signup forms and optional newsletter features.</span>
              </div>
              <label class="cookie-pref-toggle" aria-label="Marketing cookies">
                <input type="checkbox" id="cookie-pref-marketing" checked>
                <span class="cookie-pref-slider"></span>
              </label>
            </div>
            <div class="cookie-consent-panel-actions">
              <button type="button" class="cookie-consent-btn cookie-consent-btn--accept" data-cookie-action="save-prefs">Save preferences</button>
              <button type="button" class="cookie-consent-btn cookie-consent-btn--reject" data-cookie-action="cancel-manage">Cancel</button>
            </div>
          </div>
        </div>
      </div>`;

    const insertTarget = document.body.firstChild;
    if (insertTarget) document.body.insertBefore(bar, insertTarget);
    else document.body.appendChild(bar);

    const manageBtn = bar.querySelector('[data-cookie-action="manage"]');
    const analyticsInput = bar.querySelector('#cookie-pref-analytics');
    const marketingInput = bar.querySelector('#cookie-pref-marketing');

    const openManage = () => {
      const prefs = readPrefs();
      analyticsInput.checked = !!prefs.analytics;
      marketingInput.checked = !!prefs.marketing;
      bar.classList.add('is-managing');
      manageBtn.setAttribute('aria-expanded', 'true');
    };

    const closeManage = () => {
      bar.classList.remove('is-managing');
      manageBtn.setAttribute('aria-expanded', 'false');
    };

    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cookie-action]');
      if (!btn) return;

      const action = btn.getAttribute('data-cookie-action');
      if (action === 'accept') {
        applyConsent('accepted', { analytics: true, marketing: true });
        hideBar(bar);
        return;
      }
      if (action === 'reject') {
        applyConsent('rejected', { analytics: false, marketing: false });
        hideBar(bar);
        return;
      }
      if (action === 'manage') {
        openManage();
        return;
      }
      if (action === 'save-prefs') {
        const prefs = {
          analytics: analyticsInput.checked,
          marketing: marketingInput.checked,
        };
        applyConsent('managed', prefs);
        hideBar(bar);
        return;
      }
      if (action === 'cancel-manage') closeManage();
    });

    return bar;
  };

  const storedConsent = localStorage.getItem(COOKIE_KEY);
  if (storedConsent) {
    document.documentElement.classList.add('cookie-consent-set');
  } else {
    mountCookieConsent();
  }

  /* ---------- Year stamp ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Shared nav CTAs (Get the free kit + Buy now) ---------- */
  const freeKitHref = /\/(blog|hardware|learn)\//.test(window.location.pathname)
    ? '../#free-kit-signup'
    : '#free-kit-signup';
  const STRIPE_BUY =
    'https://buy.stripe.com/9B68wP8XE3I5dZ4aKmcIE01?utm_source=site&utm_medium=nav_buy&utm_campaign=paid_kit';

  const mountNavCtas = () => {
    const navInner = document.querySelector('.nav-inner');
    const navPanel = document.querySelector('.nav-links-panel');
    const navToggle = document.querySelector('.nav-toggle');
    if (!navInner || !navPanel) return;

    navInner.querySelectorAll('.nav-cta').forEach((el) => el.remove());
    navPanel.querySelectorAll('.nav-menu-cta').forEach((el) => el.remove());

    const makeBtn = (href, label, extraClass, external = false) => {
      const a = document.createElement('a');
      a.href = href;
      a.className = extraClass;
      a.textContent = label;
      if (external) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      return a;
    };

    if (!navInner.querySelector('.nav-ctas')) {
      const desktop = document.createElement('div');
      desktop.className = 'nav-ctas';
      desktop.appendChild(makeBtn(freeKitHref, 'Get the free kit', 'btn btn-ghost btn-sm nav-cta-free'));
      desktop.appendChild(makeBtn(STRIPE_BUY, 'Buy now', 'btn btn-primary btn-sm nav-cta-buy', true));
      if (navToggle) navInner.insertBefore(desktop, navToggle);
      else navInner.appendChild(desktop);
    }

    if (!navPanel.querySelector('.nav-menu-ctas')) {
      const mobile = document.createElement('div');
      mobile.className = 'nav-menu-ctas';
      mobile.appendChild(makeBtn(freeKitHref, 'Get the free kit', 'btn btn-ghost btn-sm'));
      mobile.appendChild(makeBtn(STRIPE_BUY, 'Buy now', 'btn btn-primary btn-sm', true));
      navPanel.appendChild(mobile);
    }
  };

  mountNavCtas();

  /* ---------- Mobile nav (overlay panel + auto-close) ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navPanel = document.querySelector('.nav-links-panel');
  if (navToggle && navPanel) {
    let backdrop = document.querySelector('.nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'nav-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdrop);
    }

    const closeNav = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      navPanel.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.classList.remove('nav-open');
    };
    const openNav = () => {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Close menu');
      navPanel.classList.add('open');
      backdrop.classList.add('open');
      document.body.classList.add('nav-open');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeNav();
      else openNav();
    });

    backdrop.addEventListener('click', closeNav);

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

  /* ---------- Free kit signup UX (MailerLite embed) ---------- */
  const mountFreeKitSignup = () => {
    const section = document.getElementById('free-kit-signup');
    if (!section) return;

    const box = section.querySelector('.ml-capture-box');
    const successPanel = section.querySelector('#ml-capture-success');
    const successBody = section.querySelector('#ml-capture-success-body');
    if (!box || !successPanel || !successBody) return;

    const SESSION_KEY = 'aa_free_kit_signup_v2';

    const getEmail = () => {
      const input = box.querySelector('input[type="email"]');
      return input?.value?.trim() || '';
    };

    const captureMailerLiteMessage = () => {
      const selectors = [
        '.ml-form-successBody',
        '.ml-form-embedSuccess .ml-form-successContent',
        '.ml-form-embedSuccess',
        '.row-success',
      ];
      for (const sel of selectors) {
        const el = box.querySelector(sel);
        if (el?.textContent?.trim()) {
          return el.innerHTML.trim();
        }
      }
      return '';
    };

    const showSuccess = (email, messageHtml) => {
      const html =
        messageHtml ||
        captureMailerLiteMessage() ||
        `<p><strong>Check your inbox!</strong></p><p>We sent a confirmation link to <strong>${email || 'your email address'}</strong>. Open that message to verify your address.</p>`;

      box.classList.remove('is-submitting');
      box.classList.add('is-submitted');
      successBody.innerHTML = html;
      successPanel.hidden = false;
      try {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ email: email || '', messageHtml: html, at: Date.now() })
        );
      } catch (_) { /* private mode */ }
    };

    const setSubmitting = (on) => {
      box.classList.toggle('is-submitting', on);
      const btn = box.querySelector('button[type="submit"], button.primary');
      if (!btn) return;
      if (on) {
        if (!btn.dataset.aaOriginalLabel) {
          btn.dataset.aaOriginalLabel = btn.textContent.trim();
        }
        btn.disabled = true;
        btn.textContent = 'Sending…';
        btn.classList.add('is-loading');
        btn.setAttribute('aria-busy', 'true');
      } else if (!box.classList.contains('is-submitted')) {
        btn.disabled = false;
        btn.textContent = btn.dataset.aaOriginalLabel || 'Get the free kit';
        btn.classList.remove('is-loading');
        btn.removeAttribute('aria-busy');
      }
    };

    const mailerLiteSucceeded = () => {
      if (box.querySelector('.ml-form-successBody, .ml-form-embedSuccess, .row-success')) {
        return true;
      }
      const formBody = box.querySelector('.ml-form-embedBody');
      const successWrap = box.querySelector('.ml-form-successContent, .ml-form-successBody');
      if (successWrap && successWrap.offsetParent !== null) return true;
      if (formBody && formBody.style.display === 'none') return true;
      return false;
    };

    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { email, messageHtml } = JSON.parse(saved);
        showSuccess(email, messageHtml);
        return;
      }
    } catch (_) { /* ignore */ }

    box.addEventListener(
      'submit',
      (e) => {
        if (box.classList.contains('is-submitted')) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        setSubmitting(true);
        window.setTimeout(() => {
          if (!box.classList.contains('is-submitted')) setSubmitting(false);
        }, 15000);
      },
      true
    );

    box.addEventListener(
      'click',
      (e) => {
        const btn = e.target.closest('button[type="submit"], button.primary');
        if (!btn || !box.contains(btn) || box.classList.contains('is-submitted')) return;
        if (box.classList.contains('is-submitting')) return;
        setSubmitting(true);
        window.setTimeout(() => {
          if (!box.classList.contains('is-submitted')) setSubmitting(false);
        }, 15000);
      },
      true
    );

    const observer = new MutationObserver(() => {
      if (box.classList.contains('is-submitted')) return;
      if (mailerLiteSucceeded()) {
        showSuccess(getEmail());
        observer.disconnect();
      }
    });
    observer.observe(box, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
  };

  mountFreeKitSignup();
})();
