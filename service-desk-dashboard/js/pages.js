(function () {
  const S = window.SD;
  const n = S.n;
  const C = (i) => S.col(i);
  const md = (r) => S.parseDate(r.month);
  const GOLIVE = { date: new Date(Date.UTC(2026, 1, 1)), text: 'Dashboard go-live' };
  const sortM = (rows) => rows.slice().sort((a, b) => (a.month < b.month ? -1 : 1));
  const CHANNELS = ['Email', 'Chat', 'Phone', 'Client Portal'];
  const CLS = ['Alerts', 'Incidents', 'Service Requests'];
  const k0 = (fn) => (el) => S.text(el, 'overview_kpis', (rows) => fn(rows[0]));

  // ---------- Overview ----------
  dash.draw('ov-month', k0((r) => S.fmtMonthLong(S.parseDate(r.latest_month))));
  dash.draw('ov-res', k0((r) => S.fmtPct(r.resolution_pct)));
  dash.draw('ov-fcr', k0((r) => S.fmtPct(r.fcr_pct)));
  dash.draw('ov-fcr-dir', (el) => {
    const d = S.get(el, 'overview_kpis');
    if (!d) return;
    const c = d[0][0].fcr_change;
    el.textContent = c === 0 ? ', flat on last month' : ` (${c > 0 ? 'up' : 'down'} ${Math.abs(c)} pts on last month)`;
  });
  dash.draw('ov-mttr', k0((r) => S.fmt1(r.mttr_hrs)));
  dash.draw('k-tickets', k0((r) => S.fmtInt(r.tickets_12m)));
  dash.draw('k-completed', k0((r) => S.fmtInt(r.completed_12m)));
  dash.draw('k-res', k0((r) => S.fmtPct(r.resolution_pct)));
  dash.draw('k-fcr', k0((r) => S.fmtPct(r.fcr_pct)));
  dash.draw('k-csat', k0((r) => S.fmt1(r.csat_score)));
  const chip = (field, higherGood) => (el) => {
    const d = S.get(el, 'overview_kpis', { text: true });
    if (!d) return;
    const v = d[0][0][field];
    const good = higherGood ? v >= 0 : v <= 0;
    el.classList.toggle('sd-up', good);
    el.classList.toggle('sd-down', !good);
    el.textContent = (v > 0 ? '+' : '') + d3.format('.1f')(v);
  };
  dash.draw('k-res-d', chip('resolution_change', true));
  dash.draw('k-fcr-d', chip('fcr_change', true));
  dash.draw('k-csat-d', chip('csat_change', true));

  dash.draw('ov-trend', (el) => {
    const d = S.get(el, 'monthly_summary'); if (!d) return;
    S.line(el, { data: sortM(d[0]), x: md, label: 'Tickets created and completed by month', yZero: true,
      series: [{ key: 'created', label: 'Created', color: C(0) }, { key: 'completed', label: 'Completed', color: C(1) }] });
  });
  dash.draw('ov-resrate', (el) => {
    const d = S.get(el, 'monthly_summary'); if (!d) return;
    S.line(el, { data: sortM(d[0]), x: md, label: 'Resolution rate by month', yFmt: (v) => d3.format('.0f')(v) + '%', points: true, annotate: GOLIVE,
      series: [{ key: 'resolution_pct', label: 'Resolution rate', color: C(0) }] });
  });
  dash.draw('ov-class', (el) => {
    const d = S.get(el, 'monthly_summary'); if (!d) return;
    S.bars(el, { data: sortM(d[0]), cat: 'month', stacked: true, values: true, label: 'Tickets by classification per month',
      catFmt: (m) => d3.utcFormat('%b')(S.parseDate(m)),
      series: [{ key: 'alerts', label: 'Alerts', color: C(2) }, { key: 'incidents', label: 'Incidents', color: C(0) }, { key: 'service_requests', label: 'Service requests', color: C(1) }] });
  });
  dash.draw('ov-chmix', (el) => {
    const d = S.get(el, 'channel_share'); if (!d) return;
    S.bars(el, { data: d[0], cat: 'month', stacked: true, yMax: 100, label: 'Channel share by month', yFmt: (v) => d3.format('.0f')(v) + '%',
      catFmt: (m) => d3.utcFormat('%b')(S.parseDate(m)),
      series: CHANNELS.map((c, i) => ({ key: c, label: c, color: C(i) })) });
  });
  dash.draw('ov-daily', (el) => {
    const d = S.get(el, 'daily_current_month'); if (!d) return;
    const rows = d[0];
    const dates = Array.from(new Set(rows.map((r) => r.date))).sort();
    const chans = Array.from(new Set(rows.map((r) => r.channel)));
    const max = d3.max(rows, (r) => n(r.tickets));
    el.replaceChildren();
    const g = document.createElement('div');
    g.className = 'sd-heat';
    g.style.gridTemplateColumns = `max-content repeat(${dates.length}, minmax(32px, 1fr)) max-content`;
    g.setAttribute('role', 'table');
    const cell = (cls, txt) => { const c = document.createElement('div'); c.className = cls; c.textContent = txt; g.append(c); return c; };
    cell('h', '');
    dates.forEach((dt) => cell('h', d3.utcFormat('%a %d')(S.parseDate(dt))));
    cell('h', 'Total');
    const tip = S.tip(el);
    chans.forEach((ch) => {
      cell('rl', ch);
      let tot = 0;
      dates.forEach((dt) => {
        const r = rows.find((x) => x.date === dt && x.channel === ch);
        const v = r ? n(r.tickets) : 0;
        tot += v;
        const c = cell('c', S.fmtInt(v));
        const pct = Math.round(8 + 80 * Math.sqrt(v / max));
        c.style.background = `color-mix(in srgb, ${C(0)} ${pct}%, transparent)`;
        if (pct > 55) c.style.color = 'var(--color-bg)';
        c.addEventListener('pointermove', (ev) => tip.show(ev, [`${ch} · ${S.fmtDay(S.parseDate(dt))}`, `${S.fmtInt(v)} tickets`]));
        c.addEventListener('pointerleave', () => tip.hide());
      });
      const t = cell('c', S.fmtInt(tot)); t.style.fontWeight = '600';
    });
    el.prepend(g);
  });

  // ---------- Forecast ----------
  const fcDraw = (dim) => (el) => {
    const d = S.get(el, 'forecast'); if (!d) return;
    S.bars(el, { data: d[0].filter((r) => r.dimension === dim), cat: 'category', values: true, label: `Actual vs forecast by ${dim}`,
      catFmt: (c) => c.replace(/^SEV ([0-9]) - .*/, 'SEV $1').replace('Monitoring Alert', 'Monitoring').replace('Service Requests', 'Requests'),
      series: [{ key: 'actual_mtd', label: 'Month to date', color: C(0) }, { key: 'forecast_month', label: 'Forecast', color: C(1) }] });
  };
  dash.draw('fc-sev', fcDraw('Severity'));
  dash.draw('fc-chan', fcDraw('Channel'));
  dash.draw('fc-class', fcDraw('Classification'));
  dash.draw('fc-weekday', (el) => {
    const d = S.get(el, 'weekday_avg'); if (!d) return;
    S.bars(el, { data: d[0], cat: 'weekday', values: true, label: 'Average tickets by weekday', series: [{ key: 'avg_tickets', label: 'Avg tickets', color: C(0) }] });
  });
  dash.draw('fc-15', (el) => {
    const d = S.get(el, 'last_15_days'); if (!d) return;
    S.line(el, { data: d[0], x: (r) => S.parseDate(r.date), xFmt: S.fmtDay, tipFmt: d3.utcFormat('%a %b %d'), yZero: true, label: 'Daily tickets, last 15 days',
      series: [{ key: 'alerts', label: 'Alerts', color: C(2) }, { key: 'incidents', label: 'Incidents', color: C(0) }, { key: 'service_requests', label: 'Service requests', color: C(1) }] });
  });

  // ---------- Open ----------
  const openKpi = (cls) => (el) => S.text(el, 'open_totals', (rows) => S.fmtInt((rows.find((r) => r.classification === cls) || {}).open_tickets));
  dash.draw('op-all', openKpi('All'));
  dash.draw('op-inc', openKpi('Incidents'));
  dash.draw('op-alert', openKpi('Alerts'));
  dash.draw('op-sr', openKpi('Service Requests'));
  const pivot = (rows, key) => {
    const o = {};
    rows.forEach((r) => { o[r[key]] = o[r[key]] || { [key]: r[key] }; o[r[key]][r.classification] = n(r.open_tickets); });
    return Object.values(o);
  };
  const clsSeries = [{ key: 'Incidents', label: 'Incidents', color: C(0) }, { key: 'Alerts', label: 'Alerts', color: C(2) }, { key: 'Service Requests', label: 'Service requests', color: C(1) }];
  dash.draw('op-dept', (el) => {
    const d = S.get(el, 'open_by_department'); if (!d) return;
    S.bars(el, { data: pivot(d[0], 'department'), cat: 'department', stacked: true, values: true, label: 'Open tickets by department', series: clsSeries,
      catFmt: (c) => c.replace(' Engineering', ' Eng').replace('Business Continuity', 'Bus. Cont.') });
  });
  dash.draw('op-pri', (el) => {
    const d = S.get(el, 'open_by_priority'); if (!d) return;
    S.bars(el, { data: pivot(d[0], 'priority'), cat: 'priority', stacked: true, values: true, label: 'Open tickets by priority', series: clsSeries });
  });
  dash.draw('op-mix', (el) => {
    const d = S.get(el, 'open_totals'); if (!d) return;
    const rows = CLS.map((c) => d[0].find((r) => r.classification === c)).filter(Boolean);
    S.donut(el, { data: rows, labelKey: 'classification', value: 'open_tickets', colors: [C(2), C(0), C(1)], centerLabel: 'open', label: 'Open ticket mix' });
  });
  dash.draw('op-oldest', (tb) => {
    const r = dash.data('oldest_open');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const rows = r.data.filter((x) => x.classification === SDState.oldestCls).sort((a, b) => n(b.age_days) - n(a.age_days)).slice(0, 10);
    S.tbody(tb, rows, [
      { key: 'ticket', render: (td, x) => { const s = document.createElement('span'); s.className = 'sd-pill'; s.textContent = x.ticket; td.append(s); } },
      { key: 'department' },
      { key: 'created_on', fmt: (v) => d3.utcFormat('%b %d, %Y')(S.parseDate(v)) },
      { key: 'age_days', cls: 'r', render: (td, x) => {
        const v = n(x.age_days);
        if (v > 365) { const dot = document.createElement('span'); dot.className = 'sd-dot'; dot.style.background = 'var(--color-bad)'; td.append(dot); }
        td.append(document.createTextNode(S.fmtInt(v)));
      } },
    ]);
  });

  // ---------- CSAT ----------
  const TARGET = 95;
  dash.draw('cs-rings', (el) => {
    const d = S.get(el, 'channel_summary'); if (!d) return;
    el.replaceChildren();
    d[0].forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'sd-ringcard';
      const ring = document.createElement('div');
      S.ring(ring, n(r.csat_score), TARGET, `${r.channel} CSAT ${r.csat_score}`);
      const txt = document.createElement('div'); txt.className = 'sd-ringtxt';
      const l = document.createElement('div'); l.className = 'sd-kpi-l'; l.textContent = r.channel;
      const v = document.createElement('div'); v.className = 'sd-kpi-v'; v.textContent = S.fmt1(n(r.csat_score));
      v.dataset.source = 'channel_summary'; v.dataset.field = 'csat_score'; v.dataset.where = 'channel=' + r.channel;
      const s = document.createElement('div'); s.className = 'sd-kpi-d'; s.textContent = `${d3.format('.2f')(n(r.avg_rating))} / 5 avg rating`;
      txt.append(l, v, s); card.append(ring, txt); el.append(card);
    });
  });
  dash.draw('cs-trend', (el) => {
    const d = S.get(el, 'channel_wide'); if (!d) return;
    S.line(el, { data: d[0], x: md, label: 'CSAT score trend by channel', yFmt: (v) => d3.format('.0f')(v),
      series: CHANNELS.map((c, i) => ({ key: 'csat_' + c, label: c, color: C(i) })) });
  });
  dash.draw('cs-resp', (el) => {
    const d = S.get(el, 'channel_summary'); if (!d) return;
    const rows = d[0].map((r) => ({ channel: r.channel, rate: Math.round((n(r.csat_responses) / n(r.tickets)) * 1000) / 10 })).sort((a, b) => b.rate - a.rate);
    S.hbars(el, { data: rows, labelKey: 'channel', value: 'rate', fmt: (v) => d3.format('.1f')(v) + '%', color: C(0), label: 'Survey response rate by channel' });
  });
  dash.draw('cs-acct', (tb) => {
    const r = dash.data('accounts');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const rows = r.data.slice().sort((a, b) => n(b.tickets) - n(a.tickets));
    S.tbody(tb, rows, [
      { key: 'account' }, { key: 'service_level' },
      { key: 'tickets', cls: 'r', fmt: (v) => S.fmtInt(n(v)) },
      { key: 'csat_responses', cls: 'r', fmt: (v) => S.fmtInt(n(v)) },
      { key: 'avg_rating', cls: 'r', render: (td, x) => {
        const v = n(x.avg_rating);
        const dot = document.createElement('span'); dot.className = 'sd-dot';
        dot.style.background = v >= 4.8 ? 'var(--color-ok)' : v >= 4.6 ? 'var(--color-warn)' : 'var(--color-bad)';
        td.append(dot, document.createTextNode(d3.format('.2f')(v)));
      } },
    ]);
  });

  // ---------- FCR ----------
  dash.draw('fcr-chan', (el) => {
    const d = S.get(el, 'channel_summary'); if (!d) return;
    S.hbars(el, { data: d[0].slice().sort((a, b) => n(b.fcr_pct) - n(a.fcr_pct)), labelKey: 'channel', value: 'fcr_pct', fmt: (v) => d3.format('.1f')(v) + '%', color: C(0), label: 'FCR by channel' });
  });
  dash.draw('fcr-trend', (el) => {
    const d = S.get(el, 'monthly_summary'); if (!d) return;
    S.line(el, { data: sortM(d[0]), x: md, label: 'Overall FCR by month', yFmt: (v) => d3.format('.0f')(v) + '%', points: true, annotate: GOLIVE,
      series: [{ key: 'fcr_pct', label: 'FCR', color: C(0) }] });
  });
  dash.draw('fcr-chtrend', (el) => {
    const d = S.get(el, 'channel_wide'); if (!d) return;
    S.line(el, { data: d[0], x: md, label: 'FCR by channel by month', yFmt: (v) => d3.format('.0f')(v) + '%', annotate: GOLIVE,
      series: CHANNELS.map((c, i) => ({ key: 'fcr_' + c, label: c, color: C(i) })) });
  });
  dash.draw('fcr-issue', (tb) => {
    const r = dash.data('issue_types');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const rows = r.data.slice().sort((a, b) => n(b.worked_hrs) - n(a.worked_hrs));
    const maxH = d3.max(rows, (x) => n(x.worked_hrs));
    S.tbody(tb, rows, [
      { key: 'issue' },
      { key: 'tickets', cls: 'r', fmt: (v) => S.fmtInt(n(v)) },
      { key: 'avg_hrs', cls: 'r', fmt: (v) => S.fmtInt(n(v)) },
      { key: 'worked_hrs', cls: 'r', render: (td, x) => {
        const w = document.createElement('div'); w.className = 'sd-inbar';
        const b = document.createElement('span'); b.style.width = Math.round(70 * n(x.worked_hrs) / maxH) + 'px'; b.style.background = C(1);
        w.append(b, document.createTextNode(S.fmtInt(n(x.worked_hrs)))); td.append(w);
      } },
      { key: 'fcr_tickets', cls: 'r', fmt: (v) => S.fmtInt(n(v)) },
      { key: 'fcr_pct', cls: 'r', render: (td, x) => {
        const v = n(x.fcr_pct);
        const w = document.createElement('div'); w.className = 'sd-inbar';
        const b = document.createElement('span'); b.style.width = Math.round(0.7 * v) + 'px';
        b.style.background = v >= 45 ? 'var(--color-ok)' : v >= 30 ? 'var(--color-warn)' : 'var(--color-bad)';
        w.append(b, document.createTextNode(d3.format('.0f')(v) + '%')); td.append(w);
      } },
    ]);
  });

  // ---------- MTTR ----------
  dash.draw('mt-sev', (el) => {
    const d = S.get(el, 'severity_mttr'); if (!d) return;
    S.bars(el, { data: d[0], cat: 'severity', values: true, height: 200, label: 'MTTR hours by severity', series: [{ key: 'mttr_hrs', label: 'MTTR hrs', color: C(0) }] });
  });
  dash.draw('mt-chan', (el) => {
    const d = S.get(el, 'channel_summary'); if (!d) return;
    S.hbars(el, { data: d[0].slice().sort((a, b) => n(a.avg_resolution_hrs) - n(b.avg_resolution_hrs)), labelKey: 'channel', value: 'avg_resolution_hrs', fmt: (v) => d3.format('.1f')(v) + ' h', color: C(1), label: 'Average resolution hours by channel' });
  });
  dash.draw('mt-trend', (el) => {
    const d = S.get(el, 'monthly_summary'); if (!d) return;
    S.line(el, { data: sortM(d[0]), x: md, label: 'MTTR hours by month', yZero: true, yFmt: (v) => d3.format('.0f')(v), annotate: GOLIVE,
      series: [{ key: 'mttr_incident_hrs', label: 'Incidents', color: C(0) }, { key: 'mttr_sr_hrs', label: 'Service requests', color: C(1) }] });
  });
  dash.draw('mt-top', (el) => {
    const d = S.get(el, 'accounts'); if (!d) return;
    const rows = d[0].slice().sort((a, b) => n(b.mttr_hrs) - n(a.mttr_hrs)).slice(0, 10);
    S.hbars(el, { data: rows, labelKey: 'account', value: 'mttr_hrs', fmt: (v) => S.fmtInt(v) + ' h', color: C(0), highlight: (x) => n(x.mttr_hrs) > 100, label: 'Top 10 clients by MTTR' });
  });

  // ---------- Accounts ----------
  dash.draw('ac-alerts', (el) => {
    const d = S.get(el, 'accounts'); if (!d) return;
    S.hbars(el, { data: d[0].slice().sort((a, b) => n(b.alerts) - n(a.alerts)).slice(0, 10), labelKey: 'account', value: 'alerts', fmt: S.fmtInt, color: C(2), label: 'Top 10 clients by alerts' });
  });
  dash.draw('ac-ratio', (el) => {
    const d = S.get(el, 'accounts'); if (!d) return;
    S.hbars(el, { data: d[0].slice().sort((a, b) => n(b.tickets_per_mrr_ratio) - n(a.tickets_per_mrr_ratio)).slice(0, 10), labelKey: 'account', value: 'tickets_per_mrr_ratio',
      fmt: (v) => d3.format('.2f')(v), color: C(0), highlight: (x) => n(x.tickets_per_mrr_ratio) > 1, label: 'Top 10 clients by ticket load vs MRR' });
  });
  dash.draw('ac-table', (tb) => {
    const r = dash.data('accounts');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const s = SDState.acctSort, q = SDState.acctQuery;
    const numeric = !['account', 'service_level'].includes(s.key);
    const rows = r.data.filter((x) => !q || x.account.toLowerCase().includes(q))
      .sort((a, b) => s.dir * (numeric ? n(a[s.key]) - n(b[s.key]) : String(a[s.key]).localeCompare(String(b[s.key]))));
    const i0 = (v) => S.fmtInt(n(v));
    S.tbody(tb, rows, [
      { key: 'account' }, { key: 'service_level' },
      { key: 'mrr', cls: 'r', fmt: (v) => S.fmtUsd(n(v)) },
      { key: 'alerts', cls: 'r', fmt: i0 }, { key: 'incidents', cls: 'r', fmt: i0 }, { key: 'service_requests', cls: 'r', fmt: i0 },
      { key: 'mttr_hrs', cls: 'r', fmt: (v) => S.fmt1(n(v)) },
      { key: 'tickets_per_mrr_ratio', cls: 'r', render: (td, x) => {
        const v = n(x.tickets_per_mrr_ratio);
        const dot = document.createElement('span'); dot.className = 'sd-dot';
        dot.style.background = v > 1 ? 'var(--color-bad)' : v >= 0.5 ? 'var(--color-warn)' : 'var(--color-ok)';
        td.append(dot, document.createTextNode(d3.format('.2f')(v)));
      } },
    ]);
  });
})();
