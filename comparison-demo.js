/* =========================================================
   Agentic Architect — Homepage dual-terminal comparison demo (B5)
   Scripted preview: Plain Cursor vs Agentic Architect kit.
   No live LLM, no API, no backend. Static scenarios only.
   ========================================================= */

(function () {
  'use strict';

  /** @typedef {'system'|'user'|'ai'|'dim'|'ok'|'warn'|'bad'|'rule'} LineType */
  /** @typedef {{ type: LineType, text: string, delayMs?: number, cls?: string }} Line */

  /**
   * @typedef {Object} Scenario
   * @property {string} id
   * @property {string} label
   * @property {string} prompt
   * @property {Line[]} plain
   * @property {Line[]} kit
   */

  /** @type {Scenario[]} */
  const SCENARIOS = [
    {
      id: 'di-singleton',
      label: 'DI lifetime bug',
      prompt: 'Register OrderRepository with DbContext in DI for the API.',
      plain: [
        { type: 'system', text: 'cursor agent — no rules loaded' },
        { type: 'user', text: 'Register OrderRepository with DbContext in DI for the API.' },
        { type: 'ai', text: 'Sure. In Program.cs:', delayMs: 500 },
        { type: 'ai', text: 'builder.Services.AddSingleton<OrderRepository>();', cls: 'code' },
        { type: 'ai', text: 'builder.Services.AddDbContext<AppDbContext>();', cls: 'code' },
        { type: 'dim', text: '// compiles clean ✓', delayMs: 400 },
        { type: 'warn', text: '⚠ Runtime: Cannot resolve scoped service AppDbContext from singleton OrderRepository.', delayMs: 700 },
        { type: 'bad', text: 'Captive dependency — fails under load, not in dev.', delayMs: 300 }
      ],
      kit: [
        { type: 'system', text: '✓ Loaded di-scoping.mdc · LEARNING_LOG #2' },
        { type: 'user', text: 'Register OrderRepository with DbContext in DI for the API.' },
        { type: 'rule', text: 'di-scoping.mdc: DbContext is Scoped. Never inject into a Singleton.', delayMs: 500 },
        { type: 'ai', text: 'Refusing AddSingleton<OrderRepository> — captive dependency.', cls: 'code' },
        { type: 'ai', text: 'Use AddScoped<IOrderRepository, OrderRepository>()', cls: 'code' },
        { type: 'ai', text: 'Interface lives in Application/, impl in Infrastructure/.', cls: 'code' },
        { type: 'ok', text: '✓ No lifetime conflict. Compiles + runs.', delayMs: 400 }
      ]
    },
    {
      id: 'result-pattern',
      label: 'Result<T> vs throw',
      prompt: 'Add GET /orders/{id} — return 404 when missing.',
      plain: [
        { type: 'system', text: 'cursor agent — no rules loaded' },
        { type: 'user', text: 'Add GET /orders/{id} — return 404 when missing.' },
        { type: 'ai', text: 'In OrdersController.cs:', delayMs: 500 },
        { type: 'ai', text: 'var order = await _repo.GetByIdAsync(id);', cls: 'code' },
        { type: 'ai', text: 'if (order is null) throw new NotFoundException(id);', cls: 'code' },
        { type: 'ai', text: 'return Ok(order);', cls: 'code' },
        { type: 'warn', text: '⚠ Throw in controller — exception-driven control flow.', delayMs: 600 },
        { type: 'bad', text: 'No Result<T>. Stack trace on every missing order.', delayMs: 300 }
      ],
      kit: [
        { type: 'system', text: '✓ Loaded result-pattern.mdc · LEARNING_LOG #14' },
        { type: 'user', text: 'Add GET /orders/{id} — return 404 when missing.' },
        { type: 'rule', text: 'result-pattern.mdc: Controllers return Result<T>. No throw for business failures.', delayMs: 500 },
        { type: 'ai', text: 'var result = await _repo.GetByIdAsync(id);', cls: 'code' },
        { type: 'ai', text: 'return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);', cls: 'code' },
        { type: 'ok', text: '✓ Thin controller. No exception path for expected 404.', delayMs: 400 }
      ]
    },
    {
      id: 'ef-read',
      label: 'EF read tracking',
      prompt: 'Add a read-only list endpoint for orders with customer names.',
      plain: [
        { type: 'system', text: 'cursor agent — no rules loaded' },
        { type: 'user', text: 'Add a read-only list endpoint for orders with customer names.' },
        { type: 'ai', text: 'In OrderRepository.cs:', delayMs: 500 },
        { type: 'ai', text: 'return await _db.Orders', cls: 'code' },
        { type: 'ai', text: '  .Include(o => o.Customer)', cls: 'code' },
        { type: 'ai', text: '  .ToListAsync();', cls: 'code' },
        { type: 'warn', text: '⚠ Tracked query on a read path — change tracker fills up.', delayMs: 600 },
        { type: 'bad', text: 'N+1 risk + memory bloat on large lists.', delayMs: 300 }
      ],
      kit: [
        { type: 'system', text: '✓ Loaded ef-core-reads.mdc · LEARNING_LOG #21' },
        { type: 'user', text: 'Add a read-only list endpoint for orders with customer names.' },
        { type: 'rule', text: 'ef-core-reads.mdc: Read-only queries use AsNoTracking() + projection to DTO.', delayMs: 500 },
        { type: 'ai', text: 'return await _db.Orders.AsNoTracking()', cls: 'code' },
        { type: 'ai', text: '  .Select(o => new OrderListDto(o.Id, o.Customer.Name, o.Total))', cls: 'code' },
        { type: 'ai', text: '  .ToListAsync();', cls: 'code' },
        { type: 'ok', text: '✓ No tracking. Single query. DTO projection.', delayMs: 400 }
      ]
    }
  ];

  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TYPE_SPEED = REDUCED_MOTION ? 0 : 14;   // ms per char
  const LINE_GAP = REDUCED_MOTION ? 0 : 120;     // ms between lines
  const SIDE_OFFSET = REDUCED_MOTION ? 0 : 450; // kit lags plain slightly

  const CLASS_MAP = {
    system: 't-dim',
    user: 't-prompt',
    ai: 't-ai',
    dim: 't-dim',
    ok: 't-ok',
    warn: 't-warn',
    bad: 't-bad',
    rule: 't-rule'
  };

  const LABEL_MAP = {
    system: '',
    user: 'You',
    ai: 'AI',
    dim: '',
    ok: '',
    warn: '',
    bad: '',
    rule: 'rule'
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

  function buildLine(line) {
    const p = el('p', 'term-line');
    const cls = CLASS_MAP[line.type] || '';
    const label = LABEL_MAP[line.type] || '';
    if (label) {
      const lab = el('span', 't-label ' + cls, label);
      p.appendChild(lab);
      p.appendChild(document.createTextNode(' '));
    }
    const body = el('span', (line.cls === 'code' ? 't-code ' : '') + cls);
    p.appendChild(body);
    return { p: p, body: body };
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function typewriter(body, text, speed) {
    if (speed <= 0) { body.textContent = text; return Promise.resolve(); }
    return new Promise(function (resolve) {
      let i = 0;
      function step() {
        if (i >= text.length) { resolve(); return; }
        // type a few chars per frame for snappy feel on long lines
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
      const built = buildLine(line);
      container.appendChild(built.p);
      // scroll the active terminal to bottom as it grows
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
      const built = buildLine(line);
      built.body.textContent = line.text;
      container.appendChild(built.p);
    });
  }

  function initComparisonDemo(root) {
    if (!root) return;
    const chipsWrap = root.querySelector('.scenario-chips');
    const plainBody = root.querySelector('[data-terminal="plain"] .terminal-body');
    const kitBody = root.querySelector('[data-terminal="kit"] .terminal-body');
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

      // reset
      plainBody.innerHTML = '';
      kitBody.innerHTML = '';

      // both start the user prompt simultaneously
      const plainTask = renderLines(plainBody, s.plain);
      const kitTask = sleep(SIDE_OFFSET).then(function () { return renderLines(kitBody, s.kit); });

      await Promise.all([plainTask, kitTask]);

      running = false;
      setBusy(root, false);
    }

    runBtn.addEventListener('click', run);

    // mobile tabs
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.setAttribute('aria-selected', 'false'); });
        tab.setAttribute('aria-selected', 'true');
        panels.forEach(function (p) {
          p.hidden = p.getAttribute('data-panel') !== target;
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
