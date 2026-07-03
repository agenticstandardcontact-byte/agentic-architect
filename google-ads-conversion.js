/* Google Ads Purchase conversion — thank-you-paid.html only; Marketing consent required */
(() => {
  'use strict';

  const SEND_TO = 'AW-18295180192/zqSeCLSh5skcEKCX6ZNE';
  const CONVERSION_KEY = 'aa_google_ads_conversion_paid_v1';
  const PREFS_KEY = 'aa_cookie_prefs_v1';

  const marketingGranted = () => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) return !!JSON.parse(raw).marketing;
    } catch (_) { /* ignore corrupt prefs */ }
    return false;
  };

  const parseTransactionId = () => {
    const params = new URLSearchParams(window.location.search);
    const candidates = [
      'sale_id',
      'transaction_id',
      'order_id',
      'order',
      'id',
      'payhip_sale_id',
      'receipt',
    ];
    for (const key of candidates) {
      const val = params.get(key);
      if (val && val.trim()) return val.trim();
    }

    const qs = window.location.search;
    if (qs && qs.length > 1) {
      try {
        return 'qs-' + btoa(qs).replace(/[^a-zA-Z0-9]/g, '').slice(0, 40);
      } catch (_) {
        return 'qs-' + qs.slice(1, 48).replace(/[^a-zA-Z0-9_-]/g, '');
      }
    }

    try {
      let id = sessionStorage.getItem('aa_google_ads_txn_id');
      if (!id) {
        id = 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem('aa_google_ads_txn_id', id);
      }
      return id;
    } catch (_) {
      return 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    }
  };

  const parseValue = () => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('value') || params.get('amount') || params.get('price');
    const n = raw ? parseFloat(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 1.0;
  };

  const parseCurrency = () => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('currency');
    return c && c.trim() ? c.trim().toUpperCase() : 'GBP';
  };

  const fireConversion = () => {
    try {
      if (sessionStorage.getItem(CONVERSION_KEY)) return;
    } catch (_) { /* private mode — still attempt once per load */ }

    if (!marketingGranted()) return;
    if (typeof gtag !== 'function') return;

    const transaction_id = parseTransactionId();
    if (!transaction_id) return;

    gtag('event', 'conversion', {
      send_to: SEND_TO,
      value: parseValue(),
      currency: parseCurrency(),
      transaction_id,
    });

    try {
      sessionStorage.setItem(CONVERSION_KEY, transaction_id);
    } catch (_) { /* ignore */ }
  };

  const armConversion = () => {
    if (!marketingGranted()) return;
    if (window.__aaGoogleAdsLoaded && typeof gtag === 'function') {
      fireConversion();
      return;
    }
    document.addEventListener('aa:google-ads-ready', fireConversion, { once: true });
  };

  document.addEventListener('aa:cookie-consent', (e) => {
    if (e.detail?.prefs?.marketing) armConversion();
  });

  armConversion();
})();
