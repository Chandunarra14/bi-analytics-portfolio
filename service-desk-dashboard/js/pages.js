(function () {
  const S = window.SD;
  const F = window.SDF;
  const n = S.n;
  const C = (i) => S.col(i);
  const md = (r) => S.parseDate(r.month);
  const GOLIVE = { date: new Date(Date.UTC(2026, 1, 1)), text: 'Dashboard go-live' };
  const sortM = (rows) => rows.slice().sort((a, b) => (a.month < b.month ? -1 : 1));
  const CHANNELS = ['Email', 'Chat', 'Phone', 'Client Portal'];
  const CLS = ['Alerts', 'Incidents', 'Service Requests'];
  const CLS_KEY = { Alerts: 'alerts', Incidents: 'incidents', 'Service Requests': 'service_requests' };
  const CH_COLOR = { Email: C(0), Chat: C(1), Phone: C(2), 'Client Portal': C(3) };
  const CLS_COLOR = { Alerts: C(2), Incidents: C(0), 'Service Requests': C(1) };
  const empty = (el, msg) => { el.replaceChildren(); const p = document.createElement('p'); p.className = 'sd-fail'; p.textContent = msg || 'No data for this selection'; el.append(p); };
  const rows = (el, id) => { const d = S.get(el, id); return d ? d[0] : null; };

  // ---------- Overview KPIs (follow Period + Classification slicers) ----------
  function kp() {
    const r = dash.data('monthly_summary');
    if (r.status !== 'ok') return null;
    const m = sortM(r.data).filter(F.inRange);
    if (!m.length) return null;
    const last = m[m.length - 1], prev = m[m.length - 2] || last;
    const d = (k) => Math.round((n(last[k]) - n(prev[k])) * 10) / 10;
    const vol = F.state.cls ? CLS_KEY[F.state.cls] : 'created';
    return {
      months: m.length, latest_month: last.month,
      tickets: m.reduce((s, x) => s + n(x[vol]), 0),
      completed: m.reduce((s, x) => s + n(x.completed), 0),
      resolution_pct: n(last.resolution_pct), resolution_change: d('resolution_pct'),
      fcr_pct: n(last.fcr_pct), fcr_change: d('fcr_pct'),
      mttr_hrs: n(last.mttr_incident_hrs), csat_score: n(last.csat_score), csat_change: d('csat_score'),
    };
  }
  const k0 = (fn) => (el) => { const k = kp(); el.textContent = k ? fn(k) : '—'; };
  dash.draw('ov-month', k0((r) => S.fmtMonthLong(S.parseDate(r.latest_month))));
  dash.draw('ov-res', k0((r) => S.fmtPct(r.resolution_pct)));
  dash.draw('ov-fcr', k0((r) => S.fmtPct(r.fcr_pct)));
  dash.draw('ov-fcr-dir', k0((r) => (r.fcr_change === 0 ? ', flat on the month before' : ` (${r.fcr_change > 0 ? 'up' : 'down'} ${Math.abs(r.fcr_change)} pts on the month before)`)));
  dash.draw('ov-mttr', k0((r) => S.fmt1(r.mttr_hrs)));
  dash.draw('k-tickets-l', k0((r) => `${F.state.cls || 'Tickets'} created · ${r.months} mo`));
  dash.draw('k-tickets', k0((r) => S.fmtInt(r.tickets)));
  dash.draw('k-completed', k0((r) => S.fmtInt(r.completed)));
  dash.draw('k-res', k0((r) => S.fmtPct(r.resolution_pct)));
  dash.draw('k-fcr', k0((r) => S.fmtPct(r.fcr_pct)));
  dash.draw('k-csat', k0((r) => S.fmt1(r.csat_score)));
  const chip = (field) => (el) => {
    const k = kp();
    if (!k) { el.textContent = '—'; return; }
    const v = k[field];
    el.classList.toggle('sd-up', v >= 0);
    el.classList.toggle('sd-down', v < 0);
    el.textContent = (v > 0 ? '+' : '') + d3.format('.1f')(v);
  };
  dash.draw('k-res-d', chip('resolution_change'));
  dash.draw('k-fcr-d', chip('fcr_change'));
  dash.draw('k-csat-d', chip('csat_change'));

  // ---------- Overview charts ----------
  dash.draw('ov-trend', (el) => {
    const d = rows(el, 'monthly_summary'); if (!d) return;
    const m = sortM(d).filter(F.inRange); if (!m.length) return empty(el);
    S.line(el, { data: m, x: md, label: 'Tickets created and completed by month', yZero: true,
      series: [{ key: 'created', label: 'Created', color: C(0) }, { key: 'completed', label: 'Completed', color: C(1) }] });
  });
  dash.draw('ov-resrate', (el) => {
    const d = rows(el, 'monthly_summary'); if (!d) return;
    const m = sortM(d).filter(F.inRange); if (!m.length) return empty(el);
    S.line(el, { data: m, x: md, label: 'Resolution rate by month', yFmt: (v) => d3.format('.0f')(v) + '%', points: true, annotate: GOLIVE,
      series: [{ key: 'resolution_pct', label: 'Resolution rate', color: C(0) }] });
  });
  dash.draw('ov-class', (el) => {
    const d = rows(el, 'monthly_summary'); if (!d) return;
    const m = sortM(d).filter(F.inRange); if (!m.length) return empty(el);
    S.bars(el, { data: m, cat: 'month', stacked: true, values: true, label: 'Tickets by classification per month',
      catFmt: (x) => d3.utcFormat('%b')(S.parseDate(x)),
      series: F.classes(CLS).map((c) => ({ key: CLS_KEY[c], label: c, cls: c, color: CLS_COLOR[c] })),
      onPick: (d, s) => F.toggle('cls', s.cls), onLegend: (s) => F.toggle('cls', s.cls) });
  });
  dash.draw('ov-chmix', (el) => {
    const d = rows(el, 'channel_share'); if (!d) return;
    const m = d.filter(F.inRange); if (!m.length) return empty(el);
    S.bars(el, { data: m, cat: 'month', stacked: true, yMax: 100, label: 'Channel share by month', yFmt: (v) => d3.format('.0f')(v) + '%',
      catFmt: (x) => d3.utcFormat('%b')(S.parseDate(x)),
      series: F.channels(CHANNELS).map((c) => ({ key: c, label: c, color: CH_COLOR[c] })),
      onPick: (d, s) => F.toggle('channel', s.key), onLegend: (s) => F.toggle('channel', s.key) });
  });
  dash.draw('ov-daily', (el) => {
    const d = rows(el, 'daily_current_month'); if (!d) return;
    const dates = Array.from(new Set(d.map((r) => r.date))).sort();
    let chans = Array.from(new Set(d.map((r) => r.channel)));
    if (F.state.channel) chans = chans.filter((c) => c === F.state.channel);
    if (F.state.cls === 'Alerts') chans = chans.filter((c) => c === 'Monitoring Alert');
    else if (F.state.cls) chans = chans.filter((c) => c !== 'Monitoring Alert');
    if (!chans.length) return empty(el);
    const max = d3.max(d, (r) => n(r.tickets));
    el.replaceChildren();
    const g = document.createElement('div');
    g.className = 'sd-heat';
    g.style.gridTemplateColumns = `max-content repeat(${dates.length}, minmax(32px, 1fr)) max-content`;
    const cell = (cls, txt) => { const c = document.createElement('div'); c.className = cls; c.textContent = txt; g.append(c); return c; };
    cell('h', '');
    dates.forEach((dt) => cell('h', d3.utcFormat('%a %d')(S.parseDate(dt))));
    cell('h', 'Total');
    const tip = S.tip(el);
    const pickCh = (ch) => (ch === 'Monitoring Alert' ? F.toggle('cls', 'Alerts') : F.toggle('channel', ch));
    chans.forEach((ch) => {
      const rl = cell('rl', ch); rl.classList.add('sd-pick'); rl.addEventListener('click', () => pickCh(ch));
      let tot = 0;
      dates.forEach((dt) => {
        const r = d.find((x) => x.date === dt && x.channel === ch);
        const v = r ? n(r.tickets) : 0;
        tot += v;
        const c = cell('c', S.fmtInt(v));
        const pct = Math.round(8 + 80 * Math.sqrt(v / max));
        c.style.background = `color-mix(in srgb, ${C(0)} ${pct}%, transparent)`;
        if (pct > 55) c.style.color = '#fff';
        c.addEventListener('pointermove', (ev) => tip.show(ev, [`${ch} · ${S.fmtDay(S.parseDate(dt))}`, `${S.fmtInt(v)} tickets`]));
        c.addEventListener('pointerleave', () => tip.hide());
        c.style.cursor = 'pointer';
        c.addEventListener('click', () => { tip.hide(); pickCh(ch); });
      });
      const t = cell('c', S.fmtInt(tot)); t.style.fontWeight = '600';
    });
    el.prepend(g);
  });

  // ---------- Forecast (Channel + Classification slicers) ----------
  const CH_FC = { Email: 'Email', Chat: 'Chat', Phone: 'Phone', 'Client Portal': 'Client Portal' };
  const fcDraw = (dim) => (el) => {
    const d = rows(el, 'forecast'); if (!d) return;
    let r = d.filter((x) => x.dimension === dim);
    if (dim === 'Channel' && F.state.channel) r = r.filter((x) => x.category === CH_FC[F.state.channel]);
    if (dim === 'Classification' && F.state.cls) r = r.filter((x) => x.category === F.state.cls);
    if (!r.length) return empty(el);
    S.bars(el, { data: r, cat: 'category', values: true, label: `Actual vs forecast by ${dim}`,
      catFmt: (c) => c.replace(/^SEV ([0-9]) - .*/, 'SEV $1').replace('Monitoring Alert', 'Monitoring').replace('Service Requests', 'Requests'),
      series: [{ key: 'actual_mtd', label: 'Month to date', color: C(0) }, { key: 'forecast_month', label: 'Forecast', color: C(1) }],
      onPick: dim === 'Channel' ? (d) => (CHANNELS.includes(d.category) ? F.toggle('channel', d.category) : F.toggle('cls', 'Alerts'))
        : dim === 'Classification' ? (d) => F.toggle('cls', d.category) : null });
  };
  dash.draw('fc-sev', fcDraw('Severity'));
  dash.draw('fc-chan', fcDraw('Channel'));
  dash.draw('fc-class', fcDraw('Classification'));
  dash.draw('fc-weekday', (el) => {
    const d = rows(el, 'weekday_avg'); if (!d) return;
    S.bars(el, { data: d, cat: 'weekday', values: true, label: 'Average tickets by weekday', series: [{ key: 'avg_tickets', label: 'Avg tickets', color: C(0) }] });
  });
  dash.draw('fc-15', (el) => {
    const d = rows(el, 'last_15_days'); if (!d) return;
    S.line(el, { data: d, x: (r) => S.parseDate(r.date), xFmt: S.fmtDay, tipFmt: d3.utcFormat('%a %b %d'), yZero: true, label: 'Daily tickets, last 15 days',
      series: F.classes(CLS).map((c) => ({ key: CLS_KEY[c], label: c, cls: c, color: CLS_COLOR[c] })), onLegend: (s) => F.toggle('cls', s.cls) });
  });

  // ---------- Open tickets (Department + Classification slicers) ----------
  const openRows = () => {
    const r = dash.data('open_by_department');
    if (r.status !== 'ok') return null;
    return r.data.filter((x) => F.deptOk(x) && (!F.state.cls || x.classification === F.state.cls));
  };
  const openKpi = (cls) => (el) => {
    const r = openRows();
    if (!r) { el.textContent = '—'; return; }
    el.textContent = S.fmtInt(d3.sum(r.filter((x) => cls === 'All' || x.classification === cls), (x) => n(x.open_tickets)));
  };
  dash.draw('op-all', openKpi('All'));
  dash.draw('op-inc', openKpi('Incidents'));
  dash.draw('op-alert', openKpi('Alerts'));
  dash.draw('op-sr', openKpi('Service Requests'));
  const pivot = (rs, key) => {
    const o = {};
    rs.forEach((r) => { o[r[key]] = o[r[key]] || { [key]: r[key] }; o[r[key]][r.classification] = n(r.open_tickets); });
    return Object.values(o);
  };
  const clsSeries = () => F.classes(['Incidents', 'Alerts', 'Service Requests']).map((c) => ({ key: c, label: c === 'Service Requests' ? 'Service requests' : c, color: CLS_COLOR[c] }));
  dash.draw('op-dept', (el) => {
    const d = rows(el, 'open_by_department'); if (!d) return;
    const r = d.filter(F.deptOk); if (!r.length) return empty(el);
    S.bars(el, { data: pivot(r, 'department'), cat: 'department', stacked: true, values: true, label: 'Open tickets by department', series: clsSeries(),
      onPick: (d) => F.toggle('dept', d.department), onLegend: (s) => F.toggle('cls', s.key),
      catFmt: (c) => c.replace(' Engineering', ' Eng').replace('Business Continuity', 'Bus. Cont.') });
  });
  dash.draw('op-pri', (el) => {
    const d = rows(el, 'open_by_priority'); if (!d) return;
    S.bars(el, { data: pivot(d, 'priority'), cat: 'priority', stacked: true, values: true, label: 'Open tickets by priority', series: clsSeries(),
      onPick: (d, s) => F.toggle('cls', s.key), onLegend: (s) => F.toggle('cls', s.key) });
  });
  dash.draw('op-mix', (el) => {
    const r = openRows(); if (!r) return;
    const by = CLS.map((c) => ({ classification: c, open_tickets: d3.sum(r.filter((x) => x.classification === c), (x) => n(x.open_tickets)) })).filter((x) => x.open_tickets > 0);
    if (!by.length) return empty(el);
    S.donut(el, { data: by, labelKey: 'classification', value: 'open_tickets', colors: by.map((x) => CLS_COLOR[x.classification]), centerLabel: 'open', label: 'Open ticket mix', onPick: (d) => F.toggle('cls', d.classification) });
  });
  dash.draw('op-oldest', (tb) => {
    const r = dash.data('oldest_open');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const list = r.data.filter((x) => F.deptOk(x) && (!F.state.cls || x.classification === F.state.cls))
      .sort((a, b) => n(b.age_days) - n(a.age_days)).slice(0, 10);
    S.tbody(tb, list, [
      { key: 'ticket', render: (td, x) => { const s = document.createElement('span'); s.className = 'sd-pill'; s.textContent = x.ticket; td.append(s); } },
      { key: 'classification' },
      { key: 'department' },
      { key: 'created_on', fmt: (v) => d3.utcFormat('%b %d, %Y')(S.parseDate(v)) },
      { key: 'age_days', cls: 'r', render: (td, x) => {
        const v = n(x.age_days);
        if (v > 365) { const dot = document.createElement('span'); dot.className = 'sd-dot'; dot.style.background = 'var(--color-bad)'; td.append(dot); }
        td.append(document.createTextNode(S.fmtInt(v)));
      } },
    ]);
  });

  // ---------- CSAT (Period, Channel, Account level slicers) ----------
  const TARGET = 95;
  dash.draw('cs-rings', (el) => {
    const d = rows(el, 'channel_summary'); if (!d) return;
    el.replaceChildren();
    d.filter((r) => !F.state.channel || r.channel === F.state.channel).forEach((r) => {
      const card = document.createElement('div');
      card.className = 'sd-ringcard sd-pick';
      card.addEventListener('click', () => F.toggle('channel', r.channel));
      const ring = document.createElement('div');
      S.ring(ring, n(r.csat_score), TARGET, `${r.channel} CSAT ${r.csat_score}`);
      const txt = document.createElement('div'); txt.className = 'sd-ringtxt';
      const l = document.createElement('div'); l.className = 'sd-kpi-l'; l.textContent = r.channel;
      const v = document.createElement('div'); v.className = 'sd-kpi-v'; v.textContent = S.fmt1(n(r.csat_score));
      const s = document.createElement('div'); s.className = 'sd-kpi-d'; s.textContent = `${d3.format('.2f')(n(r.avg_rating))} / 5 avg rating`;
      txt.append(l, v, s); card.append(ring, txt); el.append(card);
    });
  });
  dash.draw('cs-trend', (el) => {
    const d = rows(el, 'channel_wide'); if (!d) return;
    const m = d.filter(F.inRange); if (!m.length) return empty(el);
    S.line(el, { data: m, x: md, label: 'CSAT score trend by channel', yFmt: (v) => d3.format('.0f')(v), legend: true,
      series: F.channels(CHANNELS).map((c) => ({ key: 'csat_' + c, label: c, ch: c, color: CH_COLOR[c] })), onLegend: (s) => F.toggle('channel', s.ch) });
  });
  dash.draw('cs-resp', (el) => {
    const d = rows(el, 'channel_summary'); if (!d) return;
    const r = d.filter((x) => !F.state.channel || x.channel === F.state.channel)
      .map((x) => ({ channel: x.channel, rate: Math.round((n(x.csat_responses) / n(x.tickets)) * 1000) / 10 })).sort((a, b) => b.rate - a.rate);
    S.hbars(el, { data: r, labelKey: 'channel', value: 'rate', fmt: (v) => d3.format('.1f')(v) + '%', color: C(0), label: 'Survey response rate by channel', onPick: (d) => F.toggle('channel', d.channel) });
  });
  dash.draw('cs-acct', (tb) => {
    const r = dash.data('accounts');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const list = r.data.filter(F.levelOk).sort((a, b) => n(b.tickets) - n(a.tickets));
    S.tbody(tb, list, [
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

  // ---------- FCR (Period + Channel slicers) ----------
  dash.draw('fcr-chan', (el) => {
    const d = rows(el, 'channel_summary'); if (!d) return;
    const r = d.filter((x) => !F.state.channel || x.channel === F.state.channel).sort((a, b) => n(b.fcr_pct) - n(a.fcr_pct));
    S.hbars(el, { data: r, labelKey: 'channel', value: 'fcr_pct', fmt: (v) => d3.format('.1f')(v) + '%', color: C(0), label: 'FCR by channel', onPick: (d) => F.toggle('channel', d.channel) });
  });
  dash.draw('fcr-trend', (el) => {
    const d = rows(el, 'monthly_summary'); if (!d) return;
    const m = sortM(d).filter(F.inRange); if (!m.length) return empty(el);
    S.line(el, { data: m, x: md, label: 'Overall FCR by month', yFmt: (v) => d3.format('.0f')(v) + '%', points: true, annotate: GOLIVE,
      series: [{ key: 'fcr_pct', label: 'FCR', color: C(0) }] });
  });
  dash.draw('fcr-chtrend', (el) => {
    const d = rows(el, 'channel_wide'); if (!d) return;
    const m = d.filter(F.inRange); if (!m.length) return empty(el);
    S.line(el, { data: m, x: md, label: 'FCR by channel by month', yFmt: (v) => d3.format('.0f')(v) + '%', annotate: GOLIVE, legend: true,
      series: F.channels(CHANNELS).map((c) => ({ key: 'fcr_' + c, label: c, ch: c, color: CH_COLOR[c] })), onLegend: (s) => F.toggle('channel', s.ch) });
  });
  dash.draw('fcr-issue', (tb) => {
    const r = dash.data('issue_types');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const list = r.data.slice().sort((a, b) => n(b.worked_hrs) - n(a.worked_hrs));
    const maxH = d3.max(list, (x) => n(x.worked_hrs));
    S.tbody(tb, list, [
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

  // ---------- MTTR (Period, Channel, Account level slicers) ----------
  dash.draw('mt-sev', (el) => {
    const d = rows(el, 'severity_mttr'); if (!d) return;
    S.bars(el, { data: d, cat: 'severity', values: true, height: 200, label: 'MTTR hours by severity', series: [{ key: 'mttr_hrs', label: 'MTTR hrs', color: C(0) }] });
  });
  dash.draw('mt-chan', (el) => {
    const d = rows(el, 'channel_summary'); if (!d) return;
    const r = d.filter((x) => !F.state.channel || x.channel === F.state.channel).sort((a, b) => n(a.avg_resolution_hrs) - n(b.avg_resolution_hrs));
    S.hbars(el, { data: r, labelKey: 'channel', value: 'avg_resolution_hrs', fmt: (v) => d3.format('.1f')(v) + ' h', color: C(1), label: 'Average resolution hours by channel', onPick: (d) => F.toggle('channel', d.channel) });
  });
  dash.draw('mt-trend', (el) => {
    const d = rows(el, 'monthly_summary'); if (!d) return;
    const m = sortM(d).filter(F.inRange); if (!m.length) return empty(el);
    S.line(el, { data: m, x: md, label: 'MTTR hours by month', yZero: true, yFmt: (v) => d3.format('.0f')(v), annotate: GOLIVE,
      series: [{ key: 'mttr_incident_hrs', label: 'Incidents', color: C(0) }, { key: 'mttr_sr_hrs', label: 'Service requests', color: C(1) }] });
  });
  dash.draw('mt-top', (el) => {
    const d = rows(el, 'accounts'); if (!d) return;
    const r = d.filter(F.levelOk).sort((a, b) => n(b.mttr_hrs) - n(a.mttr_hrs)).slice(0, 10);
    if (!r.length) return empty(el);
    S.hbars(el, { data: r, labelKey: 'account', value: 'mttr_hrs', fmt: (v) => S.fmtInt(v) + ' h', color: C(0), highlight: (x) => n(x.mttr_hrs) > 100, label: 'Top 10 clients by MTTR', onPick: (d) => F.toggle('level', d.service_level) });
  });

  // ---------- Accounts (Account level slicer + search; click a bar to focus that client) ----------
  const pickAcct = (d) => {
    const q = d.account.toLowerCase();
    SDState.acctQuery = SDState.acctQuery === q ? '' : q;
    const box = document.getElementById('ac-search'); if (box) box.value = SDState.acctQuery ? d.account : '';
    dash.redraw();
  };
  dash.draw('ac-alerts', (el) => {
    const d = rows(el, 'accounts'); if (!d) return;
    const r = d.filter(F.levelOk).sort((a, b) => n(b.alerts) - n(a.alerts)).slice(0, 10);
    if (!r.length) return empty(el);
    S.hbars(el, { data: r, labelKey: 'account', value: 'alerts', fmt: S.fmtInt, color: C(2), label: 'Top 10 clients by alerts', onPick: pickAcct });
  });
  // Negative clients: below median MRR and above the median ticket count for a type (medians across all clients).
  const NEG_TYPES = [['service_requests', 'Requests', C(1)], ['incidents', 'Incidents', C(0)], ['alerts', 'Alerts', C(2)]];
  const negInfo = (all) => {
    const mM = d3.median(all, (x) => n(x.mrr));
    const med = Object.fromEntries(NEG_TYPES.map(([k]) => [k, d3.median(all, (x) => n(x[k]))]));
    const flagsOf = (x) => NEG_TYPES.filter(([k]) => n(x.mrr) < mM && n(x[k]) > med[k]).map(([k]) => k);
    return { mM, med, flagsOf };
  };
  const negDraw = (key, label, color) => (el) => {
    const d = rows(el, 'accounts'); if (!d) return;
    const { mM, med } = negInfo(d);
    const r = d.filter((x) => F.levelOk(x) && n(x.mrr) < mM).sort((p, q) => n(q[key]) - n(p[key])).slice(0, 10);
    if (!r.length) return empty(el);
    S.hbars(el, { data: r, labelKey: 'account', value: key, fmt: S.fmtInt, color, highlight: (x) => n(x[key]) > med[key], muteOthers: true,
      right: (x) => S.fmtUsd(n(x.mrr)), rightHead: 'MRR', tipExtra: (x) => [`MRR: ${S.fmtUsd(n(x.mrr))}`],
      label: `Low-MRR clients with the most ${label}`, onPick: pickAcct });
  };
  dash.draw('ac-neg-sr', negDraw('service_requests', 'service requests', C(1)));
  dash.draw('ac-neg-inc', negDraw('incidents', 'incidents', C(0)));
  dash.draw('ac-neg-alert', negDraw('alerts', 'alerts', C(2)));
  dash.draw('ac-watch', (tb) => {
    const r = dash.data('accounts');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const { flagsOf } = negInfo(r.data);
    const list = r.data.filter((x) => F.levelOk(x) && flagsOf(x).length)
      .sort((p, q) => flagsOf(q).length - flagsOf(p).length || n(p.mrr) - n(q.mrr));
    if (!list.length) { tb.replaceChildren(); const tr = document.createElement('tr'); const td = document.createElement('td'); td.colSpan = 7; td.textContent = 'No negative clients for this selection'; tr.append(td); tb.append(tr); return; }
    const flagCell = (k) => ({ key: k, cls: 'r', render: (td, x) => {
      td.textContent = S.fmtInt(n(x[k]));
      if (flagsOf(x).includes(k)) { td.style.color = 'var(--color-bad)'; td.style.fontWeight = '600'; }
    } });
    S.tbody(tb, list, [
      { key: 'account', render: (td, x) => { td.textContent = x.account; td.style.fontWeight = '600'; td.style.cursor = 'pointer'; td.addEventListener('click', () => pickAcct(x)); } },
      { key: 'service_level' },
      { key: 'mrr', cls: 'r', fmt: (v) => S.fmtUsd(n(v)) },
      flagCell('service_requests'), flagCell('incidents'), flagCell('alerts'),
      { key: 'flags', render: (td, x) => {
        NEG_TYPES.filter(([k]) => flagsOf(x).includes(k)).forEach(([, lab, col]) => {
          const s = document.createElement('span'); s.className = 'sd-tag'; s.textContent = lab;
          s.style.background = `color-mix(in srgb, ${col} 18%, transparent)`; s.style.color = 'var(--color-fg)';
          td.append(s);
        });
      } },
    ]);
  });
  dash.draw('ac-table', (tb) => {
    const r = dash.data('accounts');
    if (r.status !== 'ok') { tb.replaceChildren(); return; }
    const s = SDState.acctSort, q = SDState.acctQuery;
    const numeric = !['account', 'service_level'].includes(s.key);
    const list = r.data.filter((x) => F.levelOk(x) && (!q || x.account.toLowerCase().includes(q)))
      .sort((a, b) => s.dir * (numeric ? n(a[s.key]) - n(b[s.key]) : String(a[s.key]).localeCompare(String(b[s.key]))));
    const i0 = (v) => S.fmtInt(n(v));
    S.tbody(tb, list, [
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
