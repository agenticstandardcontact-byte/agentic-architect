/* Microsoft Ads (Bing UET) — default consent + loader. Consent updates via script.js. */
window.uetq = window.uetq || [];
window.uetq.push('consent', 'default', { ad_storage: 'denied' });

(function (w, d, t, r, u) {
  var f, n, i;
  w[u] = w[u] || [];
  f = function () {
    var o = { ti: '97254901', enableAutoSpaTracking: true };
    o.q = w[u];
    w[u] = new UET(o);
    w[u].push('pageLoad');
  };
  n = d.createElement(t);
  n.src = r;
  n.async = 1;
  n.onload = n.onreadystatechange = function () {
    var s = this.readyState;
    if (s && s !== 'loaded' && s !== 'complete') return;
    f();
    n.onload = n.onreadystatechange = null;
  };
  i = d.getElementsByTagName(t)[0];
  i.parentNode.insertBefore(n, i);
})(window, document, 'script', '//bat.bing.com/bat.js', 'uetq');
