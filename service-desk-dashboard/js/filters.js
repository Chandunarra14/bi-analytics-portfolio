// Slicers: shared filter state, helpers used by the drawings, and per-page slicer visibility.
(function () {
  const F = { from: '', to: '', channel: '', cls: '', dept: '', level: '' };
  const $ = (id) => document.getElementById(id);

  const SDF = {
    state: F,
    inRange: (r) => (!F.from || r.month >= F.from) && (!F.to || r.month <= F.to),
    channels: (all) => (F.channel ? all.filter((c) => c === F.channel) : all),
    classes: (all) => (F.cls ? all.filter((c) => c === F.cls) : all),
    deptOk: (r) => !F.dept || r.department === F.dept,
    levelOk: (r) => !F.level || r.service_level === F.level,
    showFor(page) {
      let any = false;
      document.querySelectorAll('#sd-slicers [data-pages]').forEach((el) => {
        const on = el.dataset.pages.split(' ').includes(page);
        el.hidden = !on;
        any = any || on;
      });
      const bar = $('sd-slicers');
      if (bar) bar.hidden = !any;
      const note = $('sd-slicer-note');
      if (note) note.hidden = any;
    },
  };
  window.SDF = SDF;

  function redraw() { if (window.dash && dash.redraw) dash.redraw(); }

  // Month options come from the data once it loads.
  function fillMonths() {
    const r = dash.data('monthly_summary');
    const from = $('f-from'), to = $('f-to');
    if (r.status !== 'ok' || !from || from.options.length) return;
    const months = r.data.map((x) => x.month).sort();
    const fmt = d3.utcFormat('%b %Y');
    months.forEach((m) => {
      from.append(new Option(fmt(d3.utcParse('%Y-%m-%d')(m)), m));
      to.append(new Option(fmt(d3.utcParse('%Y-%m-%d')(m)), m));
    });
    F.from = months[0]; F.to = months[months.length - 1];
    from.value = F.from; to.value = F.to;
    from.dataset.def = F.from; to.dataset.def = F.to;
  }

  window.addEventListener('DOMContentLoaded', () => {
    dash.onData(fillMonths);
    const bind = (id, key) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener('change', () => {
        F[key] = el.value;
        if (key === 'from' && F.to && F.from > F.to) { F.to = F.from; $('f-to').value = F.to; }
        if (key === 'to' && F.from && F.to < F.from) { F.from = F.to; $('f-from').value = F.from; }
        redraw();
      });
    };
    bind('f-from', 'from'); bind('f-to', 'to'); bind('f-channel', 'channel');
    bind('f-cls', 'cls'); bind('f-dept', 'dept'); bind('f-level', 'level');
    const reset = $('f-reset');
    if (reset) reset.addEventListener('click', () => {
      ['channel', 'cls', 'dept', 'level'].forEach((k) => { F[k] = ''; });
      ['f-channel', 'f-cls', 'f-dept', 'f-level'].forEach((id) => { if ($(id)) $(id).value = ''; });
      if ($('f-from')) { F.from = $('f-from').dataset.def || ''; $('f-from').value = F.from; }
      if ($('f-to')) { F.to = $('f-to').dataset.def || ''; $('f-to').value = F.to; }
      redraw();
    });
    const active = document.querySelector('[data-page]:not([hidden])');
    SDF.showFor(active ? active.id : 'overview');
  });
})();
