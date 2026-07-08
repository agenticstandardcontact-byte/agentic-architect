/* =========================================================
   Agentic Architect — Homepage dual-terminal comparison demo (B5 v2)
   Scripted preview: Plain Cursor vs Agentic Architect kit.
   Renders Cursor-style chat messages (avatars, code blocks,
   rule callouts, status lines). No live LLM, no API, no backend.
   ========================================================= */

(function () {
  'use strict';

  /** @typedef {'system'|'user'|'ai'|'code'|'rule'|'ok'|'warn'|'bad'} LineType */
  /** @typedef {{ type: LineType, text: string, delayMs?: number }} Line */

  /**
   * @typedef {Object} Scenario
   * @property {string} id
   * @property {string} label
   * @property {Line[]} plain
   * @property {Line[]} kit
   */

  /** @type {Scenario[]} */
  const SCENARIOS = [
    {
      id: 'di-singleton',
      label: 'DI lifetime bug',
      plain: [
        { type: 'system', text: 'No rules loaded' },
        { type: 'user', text: 'Register OrderRepository with DbContext in DI for the API.' },
        { type: 'ai', text: 'Sure. In Program.cs:', delayMs: 500 },
        { type: 'code', text: 'builder.Services.AddSingleton<OrderRepository>();' },
        { type: 'code', text: 'builder.Services.AddDbContext<AppDbContext>();' },
        { type: 'ok', text: 'Compiles clean.', delayMs: 400 },
        { type: 'warn', text: 'Runtime: Cannot resolve scoped AppDbContext from singleton OrderRepository.', delayMs: 700 },
        { type: 'bad', text: 'Captive dependency — fails under load, not in dev.', delayMs: 300 }
      ],
      kit: [
        { type: 'system', text: 'Loaded di-scoping.mdc · LEARNING_LOG #2' },
        { type: 'user', text: 'Register OrderRepository with DbContext in DI for the API.' },
        { type: 'rule', text: 'di-scoping.mdc: DbContext is Scoped. Never inject into a Singleton.', delayMs: 500 },
        { type: 'ai', text: 'Refusing AddSingleton<OrderRepository> — captive dependency.' },
        { type: 'code', text: 'builder.Services.AddScoped<IOrderRepository, OrderRepository>();' },
        { type: 'ai', text: 'Interface in Application/, impl in Infrastructure/.' },
        { type: 'ok', text: 'No lifetime conflict. Compiles + runs.', delayMs: 400 }
      ]
    },
    {
      id: 'result-pattern',
      label: 'Result<T> vs throw',
      plain: [
        { type: 'system', text: 'No rules loaded' },
        { type: 'user', text: 'Add GET /orders/{id} — return 404 when missing.' },
        { type: 'ai', text: 'In OrdersController.cs:', delayMs: 500 },
        { type: 'code', text: 'var order = await _repo.GetByIdAsync(id);\nif (order is null)\n    throw new NotFoundException(id);\nreturn Ok(order);' },
        { type: 'warn', text: 'Throw in controller — exception-driven control flow.', delayMs: 600 },
        { type: 'bad', text: 'No Result<T>. Stack trace on every missing order.', delayMs: 300 }
      ],
      kit: [
        { type: 'system', text: 'Loaded result-pattern.mdc · LEARNING_LOG #14' },
        { type: 'user', text: 'Add GET /orders/{id} — return 404 when missing.' },
        { type: 'rule', text: 'result-pattern.mdc: Controllers return Result<T>. No throw for business failures.', delayMs: 500 },
        { type: 'code', text: 'var result = await _repo.GetByIdAsync(id);\nreturn result.IsSuccess\n    ? Ok(result.Value)\n    : NotFound(result.Error);' },
        { type: 'ok', text: 'Thin controller. No exception path for expected 404.', delayMs: 400 }
      ]
    },
    {
      id: 'ef-read',
      label: 'EF read tracking',
      plain: [
        { type: 'system', text: 'No rules loaded' },
        { type: 'user', text: 'Add a read-only list endpoint for orders with customer names.' },
        { type: 'ai', text: 'In OrderRepository.cs:', delayMs: 500 },
        { type: 'code', text: 'return await _db.Orders\n    .Include(o => o.Customer)\n    .ToListAsync();' },
        { type: 'warn', text: 'Tracked query on a read path — change tracker fills up.', delayMs: 600 },
        { type: 'bad', text: 'N+1 risk + memory bloat on large lists.', delayMs: 300 }
      ],
      kit: [
        { type: 'system', text: 'Loaded ef-core-reads.mdc · LEARNING_LOG #21' },
        { type: 'user', text: 'Add a read-only list endpoint for orders with customer names.' },
        { type: 'rule', text: 'ef-core-reads.mdc: Read-only queries use AsNoTracking() + projection to DTO.', delayMs: 500 },
        { type: 'code', text: 'return await _db.Orders.AsNoTracking()\n    .Select(o => new OrderListDto(\n        o.Id, o.Customer.Name, o.Total))\n    .ToListAsync();' },
        { type: 'ok', text: 'No tracking. Single query. DTO projection.', delayMs: 400 }
      ]
    }
  ];

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TYPE_SPEED = REDUCED_MOTION ? 0 : 12;   // ms per char
  const LINE_GAP = REDUCED_MOTION ? 0 : 110;     // ms between lines
  const SIDE_OFFSET = REDUCED_MOTION ? 0 : 420; // kit lags plain slightly

  // Avatar config per line type
  const AVATAR = {
    system: { cls: 'chat-avatar-sys', glyph: '·' },
    user: { cls: 'chat-avatar-user', glyph: 'U' },
    ai: { cls: 'chat-avatar-ai', glyph: 'AI' },
    code: { cls: 'chat-avatar-ai', glyph: 'AI' },
    rule: { cls: 'chat-avatar-rule', glyph: '§' },
    ok: { cls: 'chat-avatar-sys', glyph: '✓' },
    warn: { cls: 'chat-avatar-sys', glyph: '!' },
    bad: { cls: 'chat-avatar-sys', glyph: '✕' }
  };
  const ROLE = {
    system: 'system',
    user: 'You',
    ai: 'Cursor',
    code: 'Cursor',
    rule: 'rule',
    ok: 'status',
    warn: 'status',
    bad: 'status'
  };

  function track(name, props) {
    try {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        window.goatcounter.count({
          path: function () { return name; },
          title: props && props.label ? props.label : name,
          event: true
        });
      }
    } catch (_) { /* analytics must never break the demo */ }
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  // Build a chat message block for a line.
  function buildMessage(line) {
    const av = AVATAR[line.type] || AVATAR.ai;
    const msg = el('div', 'chat-msg');

    const avatar = el('div', 'chat-avatar ' + av.cls, av.glyph);
    msg.appendChild(avatar);

    const content = el('div', 'chat-content');
    const role = el('div', 'chat-role', ROLE[line.type] || 'Cursor');
    content.appendChild(role);
    msg.appendChild(content);

    if (line.type === 'code') {
      const code = el('pre', 'chat-code');
      content.appendChild(code);
      return { msg: msg, body: code };
    }
    if (line.type === 'rule') {
      const rule = el('div', 'chat-rule');
      content.appendChild(rule);
      return { msg: msg, body: rule };
    }
    if (line.type === 'ok' || line.type === 'warn' || line.type === 'bad') {
      const status = el('div', 'chat-status chat-status-' + line.type);
      content.appendChild(status);
      return { msg: msg, body: status };
    }
    // system / user / ai -> plain text
    const text = el('div', 'chat-text');
    content.appendChild(text);
    return { msg: msg, body: text };
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function typewriter(body, text, speed) {
    if (speed <= 0) { body.textContent = text; return Promise.resolve(); }
    return new Promise(function (resolve) {
      let i = 0;
      function step() {
        if (i >= text.length) { resolve(); return; }
        const chunk = Math.max(1, Math.round(text.length / 90));
        i = Math.min(text.length, i + chunk);
        body.textContent = text.slice(0, i);
        setTimeout(step, speed);
      }
      step();
    });
  }

  async function renderLines(container, lines) {
    container.innerHTML = '';
    for (const line of lines) {
      if (line.delayMs) await sleep(REDUCED_MOTION ? 0 : line.delayMs);
      const built = buildMessage(line);
      container.appendChild(built.msg);
      container.scrollTop = container.scrollHeight;
      await typewriter(built.body, line.text, TYPE_SPEED);
      await sleep(LINE_GAP);
    }
  }

  function setBusy(root, busy) {
    root.setAttribute('aria-busy', busy ? 'true' : 'false');
    root.querySelectorAll('.scenario-chip, .demo-run, .comparison-tabs button').forEach(function (b) {
      b.disabled = busy;
    });
  }

  function paintStatic(container, lines) {
    // idle preview: show first 2 lines without animation
    container.innerHTML = '';
    lines.slice(0, 2).forEach(function (line) {
      const built = buildMessage(line);
      built.body.textContent = line.text;
      container.appendChild(built.msg);
    });
  }

  function initComparisonDemo(root) {
    if (!root) return;
    const chipsWrap = root.querySelector('.scenario-chips');
    const plainBody = root.querySelector('[data-terminal="plain"] .chat-window');
    const kitBody = root.querySelector('[data-terminal="kit"] .chat-window');
    const runBtn = root.querySelector('.demo-run');
    const tabs = root.querySelectorAll('.comparison-tabs button');
    const panels = root.querySelectorAll('.comparison-panel');
    if (!chipsWrap || !plainBody || !kitBody) return;

    let currentId = SCENARIOS[0].id;
    let running = false;

    // build chips
    SCENARIOS.forEach(function (s, i) {
      const chip = el('button', 'scenario-chip' + (i === 0 ? ' is-active' : ''), s.label);
      chip.type = 'button';
      chip.setAttribute('role', 'radio');
      chip.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
      chip.setAttribute('data-scenario', s.id);
      chip.addEventListener('click', function () {
        if (running) return;
        currentId = s.id;
        chipsWrap.querySelectorAll('.scenario-chip').forEach(function (c) {
          c.classList.remove('is-active');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('is-active');
        chip.setAttribute('aria-checked', 'true');
        paintIdle(s);
      });
      chipsWrap.appendChild(chip);
    });

    function paintIdle(s) {
      paintStatic(plainBody, s.plain);
      paintStatic(kitBody, s.kit);
    }

    async function run() {
      if (running) return;
      const s = SCENARIOS.filter(function (x) { return x.id === currentId; })[0];
      if (!s) return;
      running = true;
      setBusy(root, true);
      track('demo-run', { label: s.id });
      track('demo-scenario-' + s.id);

      plainBody.innerHTML = '';
      kitBody.innerHTML = '';

      const plainTask = renderLines(plainBody, s.plain);
      const kitTask = sleep(SIDE_OFFSET).then(function () { return renderLines(kitBody, s.kit); });

      await Promise.all([plainTask, kitTask]);

      running = false;
      setBusy(root, false);
    }

    runBtn.addEventListener('click', run);

    // mobile tabs — toggle .is-active (CSS shows/hides via .is-active on <=820px).
    // Only swap visibility on mobile; on desktop both panels stay side-by-side.
    var mobileMQ = window.matchMedia('(max-width: 820px)');
    function isMobile() { return mobileMQ.matches; }
    // keep both panels visible on desktop regardless of tab state
    function syncDesktop() {
      if (!isMobile()) {
        panels.forEach(function (p) {
          p.classList.add('is-active');
          p.hidden = false;
        });
      }
    }
    mobileMQ.addEventListener('change', syncDesktop);
    syncDesktop();

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
        tab.setAttribute('aria-selected', 'true');
        if (!isMobile()) { syncDesktop(); return; }
        panels.forEach(function (p) {
          var match = p.getAttribute('data-panel') === target;
          p.classList.toggle('is-active', match);
          p.hidden = !match; // a11y; CSS .is-active overrides [hidden] on mobile
        });
      });
    });

    // demo CTA tracking
    root.querySelectorAll('[data-demo-cta]').forEach(function (a) {
      a.addEventListener('click', function () {
        track(a.getAttribute('data-demo-cta'));
      });
    });

    // initial idle state
    paintIdle(SCENARIOS[0]);
  }

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    document.querySelectorAll('.comparison-demo').forEach(initComparisonDemo);
  });
})();
