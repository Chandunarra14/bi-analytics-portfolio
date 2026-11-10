(function () {
  const S = SD, n = S.n;
  const f0 = d3.format(',.0f'), usd = S.fmtUsd, usdK = (v) => '$' + d3.format('.3~s')(v).replace('G', 'B'), pct = (v) => d3.format('.0f')(v) + '%';
  const map = { type: 'psr_type', csm: 'csm', sa: 'sa', stage: 'stage' };
  const base = (D, F) => D.psr.filter((r) => F.ok(r, map));
  const open = (rs) => rs.filter((r) => r.outcome === 'Open');
  const sum = (rs, k) => d3.sum(rs, (r) => n(r[k]));
  const avg = (rs, k) => { const v = rs.filter((r) => r[k] !== '').map((r) => n(r[k])); return v.length ? d3.mean(v) : 0; };
  const mkey = (d) => (d ? d.slice(0, 7) + '-01' : '');
  const months = (D) => Array.from(new Set(D.psr.map((r) => mkey(r.created)))).sort().slice(-12);
  const AGE = [['0-30', 0, 30], ['31-60', 31, 60], ['61-90', 61, 90], ['90+', 91, 1e9]];
  const winp = (rs) => { const c = rs.filter((r) => r.outcome !== 'Open'); return c.length ? (c.filter((r) => r.outcome === 'Won').length / c.length) * 100 : 0; };
  const link = (td, r) => { const s = document.createElement('span'); s.className = 'sd-pill'; s.textContent = r.ticket; td.append(s); };

  App({
    title: 'PSR Pipeline',
    eyebrow: 'Managed services · Autotask + Salesforce',
    sub: 'Professional services requests from first ask to scoping to won or lost, with Autotask and Salesforce side by side so mismatches show up straight away.',
    files: { psr: 'data/psr.csv', impact: 'data/impact.csv' },
    slicers: [
      { key: 'type', label: 'PSR type', all: 'All types', options: (D) => SDu.uniq(D.psr, 'psr_type') },
      { key: 'csm', label: 'CSM', all: 'All CSMs', options: (D) => SDu.uniq(D.psr, 'csm') },
      { key: 'sa', label: 'Solutions architect', all: 'All architects', options: (D) => SDu.uniq(D.psr, 'sa') },
      { key: 'stage', label: 'Stage', all: 'All stages', options: (D) => SDu.uniq(D.psr, 'stage') },
    ],
    pages: [
      { id: 'executive', label: 'Executive overview', slicers: ['type', 'csm', 'sa', 'stage'], blocks: [
        { type: 'text', html: (D, F) => { const o = open(base(D, F)); return `<b>${f0(o.length)}</b> PSRs are open, worth <b>${usdK(sum(o, 'at_nrr'))}</b> in NRR. <b>${f0(o.filter((r) => r.is_scoped === 'No').length)}</b> still need scoping, and the oldest of those has waited <b>${f0(d3.max(o.filter((r) => r.is_scoped === 'No'), (r) => n(r.age_days)) || 0)}</b> days.`; } },
        { type: 'kpis', items: [
          { label: 'Open PSRs', value: (D, F) => f0(open(base(D, F)).length) },
          { label: 'Scoped, awaiting decision', value: (D, F) => f0(open(base(D, F)).filter((r) => r.is_scoped === 'Yes').length), sub: (D, F) => `NRR ${usdK(sum(open(base(D, F)).filter((r) => r.is_scoped === 'Yes'), 'at_nrr'))}` },
          { label: 'Needs scope', value: (D, F) => f0(open(base(D, F)).filter((r) => r.is_scoped === 'No').length), tone: () => 'warn', sub: (D, F) => `NRR ${usdK(sum(open(base(D, F)).filter((r) => r.is_scoped === 'No'), 'at_nrr'))}` },
          { label: 'Open MRR', value: (D, F) => usdK(sum(open(base(D, F)), 'at_mrr')) },
          { label: 'Avg days to scope', value: (D, F) => f0(avg(base(D, F), 'days_to_scope')), sub: () => 'created to scoped' },
          { label: 'Avg cycle time', value: (D, F) => f0(avg(base(D, F), 'cycle_days')), sub: () => 'days, created to closed' },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 7, title: 'Autotask vs Salesforce', note: 'The same PSRs, valued in each system. Gaps point to records that need fixing.', h: 240, draw: (el, D, F) => {
            const r = base(D, F); const by = (o) => r.filter((x) => x.outcome === o);
            const data = [['Won NRR', by('Won'), 'nrr'], ['Lost NRR', by('Lost'), 'nrr'], ['Open NRR', by('Open'), 'nrr'], ['Won MRR', by('Won'), 'mrr'], ['Open MRR', by('Open'), 'mrr']]
              .map(([c, xs, k]) => ({ c, at: sum(xs, 'at_' + k), sf: sum(xs, 'sf_' + k) }));
            S.bars(el, { data, cat: 'c', values: true, yFmt: usdK, series: [{ key: 'at', label: 'Autotask', color: '#1e3a8a' }, { key: 'sf', label: 'Salesforce', color: '#0ea5e9' }], label: 'Autotask vs Salesforce values' });
          } },
          { type: 'card', span: 5, title: 'Open PSRs pending scope, by age', note: 'Days since the request was created.', h: 240, draw: (el, D, F) => {
            const o = open(base(D, F)).filter((r) => r.is_scoped === 'No');
            S.bars(el, { data: AGE.map(([l, a, b]) => ({ l, v: o.filter((r) => n(r.age_days) >= a && n(r.age_days) <= b).length })), cat: 'l', values: true, yFmt: f0,
              series: [{ key: 'v', label: 'PSRs', color: '#2f6fed' }], label: 'Unscoped PSRs by age' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Open opportunities by stage', note: 'Click a slice to filter the page.', h: 240, draw: (el, D, F) => {
            const o = open(D.psr.filter((r) => F.ok(r, { type: 'psr_type', csm: 'csm', sa: 'sa' })));
            const data = Array.from(d3.rollup(o, (v) => v.length, (r) => r.stage), ([s, v]) => ({ s, v })).sort((a, b) => b.v - a.v);
            S.donut(el, { data, labelKey: 's', value: 'v', colors: data.map((d, i) => S.col(i)), centerLabel: 'open', onPick: (d) => F.toggle('stage', d.s), label: 'Open PSRs by stage' });
          } },
          { type: 'card', span: 7, title: 'Outcomes by month', note: 'PSRs closed won vs closed lost, by close month.', h: 240, draw: (el, D, F) => {
            const r = base(D, F).filter((x) => x.closed); const ms = months(D);
            S.bars(el, { data: ms.map((m) => ({ m, won: r.filter((x) => mkey(x.closed) === m && x.outcome === 'Won').length, lost: r.filter((x) => mkey(x.closed) === m && x.outcome === 'Lost').length })),
              cat: 'm', values: true, yFmt: f0, catFmt: (m) => d3.utcFormat('%b')(S.parseDate(m)), series: [{ key: 'lost', label: 'Closed lost', color: '#e5484d' }, { key: 'won', label: 'Closed won', color: '#18a999' }], label: 'Won and lost PSRs by month' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Top 25 open PSRs by NRR', note: 'Click a row to filter to that solutions architect.', maxH: 420, limit: 25, onRow: (r, F) => F.toggle('sa', r.sa),
            cols: [{ label: 'Ticket', key: 'ticket', render: link }, { label: 'Account', key: 'account' }, { label: 'Type', key: 'psr_type' }, { label: 'Stage', key: 'stage' }, { label: 'Architect', key: 'sa' }, { label: 'CSM', key: 'csm' },
              { label: 'Scoped', key: 'is_scoped' }, { label: 'Age', key: 'age_days', cls: 'r' }, { label: 'NRR', key: 'at_nrr', cls: 'r', fmt: (v) => usd(n(v)) }, { label: 'MRR', key: 'at_mrr', cls: 'r', fmt: (v) => usd(n(v)) }],
            rows: (D, F) => open(base(D, F)).sort((a, b) => n(b.at_nrr) - n(a.at_nrr)) },
        ] },
      ] },
      { id: 'funnel', label: 'Funnel trend', slicers: ['type', 'csm', 'sa'], blocks: [
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'Created, scoped and won by month', note: 'Last 12 months.', h: 260, draw: (el, D, F) => {
            const r = base(D, F); const ms = months(D);
            S.bars(el, { data: ms.map((m) => ({ m, c: r.filter((x) => mkey(x.created) === m).length, s: r.filter((x) => mkey(x.scoped) === m).length, w: r.filter((x) => mkey(x.closed) === m && x.outcome === 'Won').length })),
              cat: 'm', values: true, yFmt: f0, catFmt: (m) => d3.utcFormat('%b %y')(S.parseDate(m)), series: [{ key: 'c', label: 'Created', color: '#1e3a8a' }, { key: 's', label: 'Scoped', color: '#0ea5e9' }, { key: 'w', label: 'Won', color: '#18a999' }], label: 'PSR funnel by month' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'NRR requested vs won', note: 'NRR of PSRs created each month vs NRR closed won.', h: 240, draw: (el, D, F) => {
            const r = base(D, F); const ms = months(D);
            S.line(el, { data: ms.map((m) => ({ m, req: sum(r.filter((x) => mkey(x.created) === m), 'at_nrr'), won: sum(r.filter((x) => mkey(x.closed) === m && x.outcome === 'Won'), 'at_nrr') })),
              x: (d) => S.parseDate(d.m), yZero: true, yFmt: usdK, series: [{ key: 'req', label: 'Requested NRR', color: '#1e3a8a' }, { key: 'won', label: 'Won NRR', color: '#18a999' }], label: 'NRR requested and won' });
          } },
          { type: 'card', span: 6, title: 'Weekly requests, last 13 weeks', note: 'PSRs created and scoped each week.', h: 240, draw: (el, D, F) => {
            const r = base(D, F); const end = d3.utcMonday.floor(new Date(Date.UTC(2026, 10, 10))); const wks = d3.utcMonday.range(d3.utcWeek.offset(end, -12), d3.utcWeek.offset(end, 1));
            const wk = (s) => (s ? +d3.utcMonday.floor(S.parseDate(s)) : 0);
            S.line(el, { data: wks.map((w) => ({ w, c: r.filter((x) => wk(x.created) === +w).length, s: r.filter((x) => wk(x.scoped) === +w).length })),
              x: (d) => d.w, xFmt: S.fmtDay, tipFmt: (d) => 'Week of ' + S.fmtDay(d), yZero: true, yFmt: f0, series: [{ key: 'c', label: 'Created', color: '#1e3a8a' }, { key: 's', label: 'Scoped', color: '#0ea5e9' }], label: 'Weekly PSRs' });
          } },
        ] },
      ] },
      { id: 'winloss', label: 'Win / loss', slicers: ['type', 'csm', 'sa'], blocks: [
        { type: 'kpis', items: [
          { label: 'Budgetary win %', value: (D, F) => pct(winp(base(D, F).filter((r) => r.psr_type === 'PSR - Budgetary'))), pick: (F) => F.toggle('type', 'PSR - Budgetary'), picked: (F) => F.is('type', 'PSR - Budgetary') },
          { label: 'Final win %', value: (D, F) => pct(winp(base(D, F).filter((r) => r.psr_type === 'PSR - Final'))), pick: (F) => F.toggle('type', 'PSR - Final'), picked: (F) => F.is('type', 'PSR - Final') },
          { label: 'Overall win %', value: (D, F) => pct(winp(base(D, F))), tone: (D, F) => (winp(base(D, F)) >= 45 ? 'good' : 'warn') },
          { label: 'Won NRR', value: (D, F) => usdK(sum(base(D, F).filter((r) => r.outcome === 'Won'), 'at_nrr')), tone: () => 'good' },
          { label: 'Lost NRR', value: (D, F) => usdK(sum(base(D, F).filter((r) => r.outcome === 'Lost'), 'at_nrr')), tone: () => 'bad' },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Outcomes by PSR type', note: 'Closed PSRs only. Click a bar to filter by type.', h: 250, draw: (el, D, F) => {
            const r = D.psr.filter((x) => F.ok(x, { csm: 'csm', sa: 'sa' }));
            S.bars(el, { data: SDu.uniq(D.psr, 'psr_type').map((t) => ({ t, won: r.filter((x) => x.psr_type === t && x.outcome === 'Won').length, lost: r.filter((x) => x.psr_type === t && x.outcome === 'Lost').length })),
              cat: 't', stacked: true, values: true, yFmt: f0, onPick: (d) => F.toggle('type', d.t), catFmt: (c) => c.replace('PSR - ', ''),
              series: [{ key: 'lost', label: 'Closed lost', color: '#e5484d' }, { key: 'won', label: 'Closed won', color: '#18a999' }], label: 'Outcomes by PSR type' });
          } },
          { type: 'table', span: 7, title: 'CSM performance', note: 'Click a row to filter to that CSM.', onRow: (r, F) => F.toggle('csm', r.csm),
            cols: [{ label: 'CSM', key: 'csm' }, { label: 'Tickets', key: 't', cls: 'r' }, { label: 'Won', key: 'w', cls: 'r', render: (td, r) => { td.textContent = r.w; td.style.color = 'var(--color-ok)'; td.style.fontWeight = '600'; } },
              { label: 'Lost', key: 'l', cls: 'r', render: (td, r) => { td.textContent = r.l; td.style.color = 'var(--color-bad)'; td.style.fontWeight = '600'; } },
              { label: 'Win %', key: 'p', cls: 'r', render: (td, r) => { const w = document.createElement('div'); w.className = 'sd-inbar'; const b = document.createElement('span'); b.style.width = Math.round(r.p * 0.7) + 'px'; b.style.background = r.p >= 50 ? 'var(--color-ok)' : r.p >= 35 ? 'var(--color-warn)' : 'var(--color-bad)'; w.append(b, document.createTextNode(pct(r.p))); td.append(w); } },
              { label: 'Won NRR', key: 'wn', cls: 'r', fmt: (v) => usdK(v) }, { label: 'Lost NRR', key: 'ln', cls: 'r', fmt: (v) => usdK(v) }],
            rows: (D, F) => Array.from(d3.group(D.psr.filter((x) => F.ok(x, { type: 'psr_type', sa: 'sa' })), (r) => r.csm), ([csm, xs]) => ({ csm, t: xs.length, w: xs.filter((r) => r.outcome === 'Won').length, l: xs.filter((r) => r.outcome === 'Lost').length, p: winp(xs), wn: sum(xs.filter((r) => r.outcome === 'Won'), 'at_nrr'), ln: sum(xs.filter((r) => r.outcome === 'Lost'), 'at_nrr') })).sort((a, b) => b.t - a.t) },
        ] },
      ] },
      { id: 'scoping', label: 'Scoping', slicers: ['type', 'csm', 'sa'], blocks: [
        { type: 'row', blocks: [
          { type: 'card', span: 7, title: 'PSRs scoped per month', note: 'Last 12 months.', h: 240, draw: (el, D, F) => {
            const r = base(D, F); const ms = months(D);
            S.bars(el, { data: ms.map((m) => ({ m, v: r.filter((x) => mkey(x.scoped) === m).length })), cat: 'm', values: true, yFmt: f0, catFmt: (m) => d3.utcFormat('%b')(S.parseDate(m)), series: [{ key: 'v', label: 'Scoped', color: '#1e3a8a' }], label: 'PSRs scoped by month' });
          } },
          { type: 'card', span: 5, title: 'Open PSRs by queue', note: 'Where the open requests are sitting.', h: 240, draw: (el, D, F) => {
            const o = open(base(D, F)); const data = Array.from(d3.rollup(o, (v) => v.length, (r) => r.queue), ([q, v]) => ({ q, v })).sort((a, b) => b.v - a.v);
            S.hbars(el, { data, labelKey: 'q', value: 'v', fmt: f0, color: '#0ea5e9', label: 'Open PSRs by queue' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 6, title: 'Open PSRs by solutions architect', note: 'Click a row to filter.', onRow: (r, F) => F.toggle('sa', r.sa),
            cols: [{ label: 'Architect', key: 'sa' }, { label: 'Open', key: 't', cls: 'r' }, { label: 'Scoped', key: 's', cls: 'r' }, { label: 'Unscoped', key: 'u', cls: 'r' }, { label: 'Unscoped NRR', key: 'un', cls: 'r', fmt: (v) => usdK(v) }, { label: 'Avg days to scope', key: 'd', cls: 'r', fmt: f0 }],
            rows: (D, F) => Array.from(d3.group(D.psr.filter((x) => F.ok(x, { type: 'psr_type', csm: 'csm' })), (r) => r.sa), ([sa, xs]) => { const o = open(xs); return { sa, t: o.length, s: o.filter((r) => r.is_scoped === 'Yes').length, u: o.filter((r) => r.is_scoped === 'No').length, un: sum(o.filter((r) => r.is_scoped === 'No'), 'at_nrr'), d: avg(xs, 'days_to_scope') }; }).sort((a, b) => b.u - a.u) },
          { type: 'table', span: 6, title: 'Top 25 oldest PSRs still waiting for scope', maxH: 420, limit: 25,
            cols: [{ label: 'Ticket', key: 'ticket', render: link }, { label: 'Architect', key: 'sa' }, { label: 'NRR', key: 'at_nrr', cls: 'r', fmt: (v) => usdK(n(v)) },
              { label: 'Age', key: 'age_days', cls: 'r', render: (td, r) => { if (n(r.age_days) > 90) { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = 'var(--color-bad)'; td.append(d); } td.append(document.createTextNode(r.age_days)); } }],
            rows: (D, F) => open(base(D, F)).filter((r) => r.is_scoped === 'No').sort((a, b) => n(b.age_days) - n(a.age_days)) },
        ] },
      ] },
      { id: 'impact', label: 'Impact', impact: true, blocks: [{ type: 'impact' }] },
    ],
    impactNote: 'PSRs created (days to scope) or closed (win rate) in the first 3 months of the data vs the latest 3 months.',
    impactChart: { title: 'Days to scope, by month created', note: 'Average days from request to scoped.', h: 240, draw: (el, D) => {
      const ms = months(D).slice(0, -1);
      S.line(el, { data: ms.map((m) => ({ m, d: avg(D.psr.filter((x) => mkey(x.created) === m), 'days_to_scope') })), x: (d) => S.parseDate(d.m), yZero: true, points: true, yFmt: f0,
        annotate: { date: new Date(Date.UTC(2026, 1, 1)), text: 'Go-live' }, series: [{ key: 'd', label: 'Days to scope', color: '#2f6fed' }], label: 'Days to scope by month' });
    } },
    impactMethod: 'Before = first 3 months of the data, after = latest 3 months. Days to scope uses PSRs created in each window; win rate uses PSRs closed in each window. Reconciliation effort figures are estimates. Every figure here is sample data built for this prototype.',
  });
})();
