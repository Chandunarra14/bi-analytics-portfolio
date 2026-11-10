// Minimal stand-in for the dashboard runtime, so the page runs as a plain static site.
// Loads the CSVs in /data, evaluates calcs, and re-runs drawings on data, tab and resize changes.
(function () {
  const FILES = [
    'monthly_summary', 'monthly_channel', 'daily_current_month', 'forecast', 'weekday_avg', 'last_15_days',
    'open_by_department', 'open_by_priority', 'oldest_open', 'channel_summary', 'issue_types', 'severity_mttr',
    'accounts', 'impact_assumptions',
  ];
  const store = {};
  const calcs = {};
  const calcCache = {};
  const draws = {};
  const listeners = [];

  function data(id) {
    if (calcs[id]) {
      const ins = calcs[id].inputs.map(data);
      if (ins.some((r) => r.status !== 'ok')) return { status: 'loading', data: null };
      if (!calcCache[id]) calcCache[id] = { status: 'ok', data: calcs[id].fn(...ins.map((r) => r.data)) };
      return calcCache[id];
    }
    return store[id] || { status: 'loading', data: [] };
  }

  function visible(el) { return !el.closest('[hidden]'); }

  function runDraw(name) {
    document.querySelectorAll(`[data-draw="${name}"]`).forEach((el) => {
      if (!visible(el)) return;
      try { draws[name](el); } catch (e) { console.error('draw', name, e); }
    });
  }
  function runAll() {
    listeners.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    Object.keys(draws).forEach(runDraw);
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; runAll(); });
  }

  window.dash = {
    colors: ['#2f6fed', '#18a999', '#f2a541', '#8b5cf6', '#e5484d', '#64748b'],
    data,
    calc(id, def) { calcs[id] = def; },
    loader() {},
    draw(name, fn) {
      if (typeof fn === 'function') { draws[name] = fn; return; }
      if (draws[name]) runDraw(name);
    },
    onData(fn) { listeners.push(fn); fn(); },
    refresh() {},
    redraw() { schedule(); },
    params: () => ({}),
    setParams() {},
    resetParams() {},
    setLink(id) { history.replaceState(null, '', '#' + id); },
  };

  // Load every CSV, then draw.
  window.addEventListener('DOMContentLoaded', () => {
    Promise.all(FILES.map((f) => d3.csv(`data/${f}.csv`).then(
      (rows) => { store[f] = { status: 'ok', data: rows }; },
      () => { store[f] = { status: 'error', data: [] }; },
    ))).then(schedule);

    // Re-draw when a tab is shown or the window resizes.
    const mo = new MutationObserver(schedule);
    document.querySelectorAll('[data-page]').forEach((p) => mo.observe(p, { attributes: true, attributeFilter: ['hidden'] }));
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(schedule, 150); });
    schedule();
  });
})();
