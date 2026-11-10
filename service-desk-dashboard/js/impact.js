(function () {
  const S = window.SD;
  const n = S.n;
  const one = (id, fn) => (el) => S.text(el, id, (rows) => fn(rows[0]));
  const where = (id, key, val, fn) => (el) => S.text(el, id, (rows) => fn(rows.find((r) => r[key] === val) || {}));

  dash.draw('im-weeks', one('impact_time', (r) => S.fmt1(r.report_weeks_saved_month)));
  dash.draw('im-before-hrs', where('impact_assumptions', 'id', 'report_hours', (r) => S.fmtInt(n(r.before))));
  dash.draw('im-after-hrs', where('impact_assumptions', 'id', 'report_hours', (r) => S.fmtInt(n(r.after))));
  dash.draw('im-cut', one('impact_time', (r) => r.report_effort_cut_pct + '%'));
  dash.draw('im-hrs-yr', one('impact_time', (r) => S.fmtInt(r.total_hours_saved_year)));
  dash.draw('im-value', one('impact_time', (r) => S.fmtUsd(r.value_saved_year)));
  dash.draw('im-rate', where('impact_assumptions', 'id', 'rate', (r) => S.fmtUsd(n(r.before))));
  dash.draw('im-fte', one('impact_time', (r) => d3.format('.0%')(r.fte_equivalent)));
  dash.draw('im-reports', where('impact_assumptions', 'id', 'sources', (r) => S.fmtInt(n(r.before))));
  dash.draw('im-downtime', one('impact_ops', (r) => S.fmtK(r.downtime_hours_avoided_month)));
  dash.draw('im-downtime-yr', one('impact_ops', (r) => S.fmtK(r.downtime_hours_avoided_year)));
  dash.draw('im-fcrx', one('impact_ops', (r) => S.fmtInt(r.extra_fcr_tickets_month)));
  dash.draw('im-resx', one('impact_ops', (r) => S.fmtInt(r.extra_resolved_month)));
  dash.draw('im-aged', one('impact_ops', (r) => S.fmtInt(r.aged_backlog_cleared)));
  dash.draw('im-qbr-after', where('impact_assumptions', 'id', 'qbr_hours', (r) => d3.format('~g')(n(r.after))));
  dash.draw('im-qbr-before', where('impact_assumptions', 'id', 'qbr_hours', (r) => d3.format('~g')(n(r.before))));
  dash.draw('im-qbr-yr', one('impact_time', (r) => S.fmtInt(r.qbr_hours_saved_year)));

  const unitFmt = (u, v) => (u === 'pct' ? d3.format('.1f')(v) + '%' : u === 'hrs' ? d3.format('.1f')(v) + ' h' : u === 'min' ? d3.format('.0f')(v) + ' min' : u === 'tickets' ? S.fmtInt(v) : d3.format('.1f')(v));

  dash.draw('im-ba', (el) => {
    const d = S.get(el, 'impact_compare'); if (!d) return;
    el.replaceChildren();
    const first = !el.dataset.drawn && window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    d[0].forEach((r) => {
      const card = document.createElement('div');
      card.className = 'sd-card';
      const h = document.createElement('div'); h.className = 'sd-kpi-l'; h.textContent = r.label;
      const row = document.createElement('div'); row.className = 'sd-ba-row';
      const b = document.createElement('span'); b.className = 'sd-ba-before'; b.textContent = unitFmt(r.unit, r.before);
      b.dataset.source = 'impact_compare'; b.dataset.field = 'before'; b.dataset.where = 'metric=' + r.metric;
      const ar = document.createElement('span'); ar.className = 'sd-ba-arrow'; ar.textContent = '→';
      const a = document.createElement('span'); a.className = 'sd-ba-after'; a.textContent = unitFmt(r.unit, r.after);
      a.dataset.source = 'impact_compare'; a.dataset.field = 'after'; a.dataset.where = 'metric=' + r.metric;
      row.append(b, ar, a);
      const chip = document.createElement('span');
      chip.className = 'sd-chip ' + (r.improved ? 'sd-up' : 'sd-down');
      const pct = Math.abs(r.change_pct);
      chip.textContent = `${r.change > 0 ? '▲' : '▼'} ${d3.format('.0f')(pct)}% ${r.improved ? 'better' : 'worse'}`;
      chip.dataset.source = 'impact_compare'; chip.dataset.field = 'change_pct'; chip.dataset.where = 'metric=' + r.metric;
      // progress-style track: after relative to the larger of before/after
      const track = document.createElement('div'); track.className = 'sd-ba-track';
      const fill = document.createElement('span');
      const ratio = Math.min(r.before, r.after) / Math.max(r.before, r.after);
      const w = r.improved ? (r.after > r.before ? 100 : ratio * 100) : 50;
      fill.style.background = r.improved ? 'var(--color-ok)' : 'var(--color-bad)';
      fill.style.width = first ? '0%' : w + '%';
      if (first) {
        fill.style.transition = 'width var(--cds-dur-slow) var(--cds-ease-out)';
        requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = w + '%'; }));
      }
      track.append(fill);
      const foot = document.createElement('div'); foot.className = 'sd-kpi-d'; foot.style.marginTop = '8px';
      foot.append(chip);
      card.append(h, row, track, foot);
      el.append(card);
    });
    el.dataset.drawn = '1';
  });

  dash.draw('im-trend', (el) => {
    const d = S.get(el, 'monthly_summary'); if (!d) return;
    const rows = d[0].slice().sort((a, b) => (a.month < b.month ? -1 : 1));
    // Two different units: draw two small aligned panels so neither axis is faked.
    el.replaceChildren();
    const top = document.createElement('div'); top.style.position = 'relative';
    const bot = document.createElement('div'); bot.style.position = 'relative';
    const lab = (t) => { const p = document.createElement('p'); p.className = 'sd-note'; p.style.margin = '4px 0 0'; p.textContent = t; return p; };
    el.append(lab('FCR %'), top, lab('Incident MTTR (hours)'), bot);
    const GL = { date: new Date(Date.UTC(2026, 1, 1)), text: 'Go-live' };
    S.line(top, { data: rows, x: (r) => S.parseDate(r.month), height: 150, yFmt: (v) => d3.format('.0f')(v) + '%', annotate: GL, label: 'FCR by month',
      series: [{ key: 'fcr_pct', label: 'FCR', color: 'var(--color-ok)' }] });
    S.line(bot, { data: rows, x: (r) => S.parseDate(r.month), height: 150, yFmt: (v) => d3.format('.0f')(v), annotate: GL, label: 'Incident MTTR by month',
      series: [{ key: 'mttr_incident_hrs', label: 'Incident MTTR', color: S.col(0) }] });
  });

  dash.draw('im-assume', (tb) => {
    const r = dash.data('impact_assumptions');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const f = (v) => d3.format(',~g')(n(v));
    S.tbody(tb, r.data, [
      { key: 'area', render: (td, x) => { const s = document.createElement('span'); s.className = 'sd-pill'; s.textContent = x.area; td.append(s); } },
      { key: 'metric' },
      { key: 'before', cls: 'r', fmt: f },
      { key: 'after', cls: 'r', render: (td, x) => { const b = document.createElement('b'); b.textContent = f(x.after); td.append(b); } },
      { key: 'unit' },
      { key: 'note', render: (td, x) => { td.style.whiteSpace = 'normal'; td.style.minWidth = '260px'; td.textContent = x.note; } },
    ]);
  });
})();
