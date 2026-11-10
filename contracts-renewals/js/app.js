(function () {
  const S = SD, n = S.n;
  const f0 = d3.format(',.0f'), usd = S.fmtUsd, usdK = (v) => '$' + d3.format('.3~s')(v).replace('G', 'B'), pct = (v) => d3.format('.0f')(v) + '%';
  const TYPES = ['Recurring Service', 'Fixed Price', 'Block Hours', 'Time & Materials'];
  const TCOL = { 'Recurring Service': '#1e3a8a', 'Fixed Price': '#0ea5e9', 'Block Hours': '#f97316', 'Time & Materials': '#8b5cf6' };
  const TODAY = new Date(Date.UTC(2026, 10, 10));
  const CUR = '2026-11-01';
  const map = { type: 'type', csm: 'csm', mgr: 'manager', closure: 'closure_type' };
  const base = (D, F, skip) => D.contracts.filter((r) => F.ok(r, Object.fromEntries(Object.entries(map).filter(([k]) => k !== skip))));
  const act = (rs) => rs.filter((r) => r.active === 'Yes');
  const sum = (rs, k) => d3.sum(rs, (r) => n(r[k]));
  const days = (r) => Math.round((S.parseDate(r.end) - TODAY) / 864e5);
  const BK = [['Overdue', -1e9, -1], ['0-30', 0, 30], ['31-60', 31, 60], ['61-90', 61, 90], ['91-180', 91, 180], ['181-360', 181, 360], ['360+', 361, 1e9]];
  const next12 = Array.from({ length: 12 }, (_, i) => d3.utcFormat('%Y-%m-%d')(d3.utcMonth.offset(new Date(Date.UTC(2026, 10, 1)), i)));
  const y2026 = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, '0')}-01`);
  const mon = (m) => d3.utcFormat('%b')(S.parseDate(m));
  const CH = [{ key: 'churn', label: 'Churn', color: '#e5484d' }, { key: 'renewal', label: 'Renewal', color: '#1e3a8a' }];
  const topTable = (title, note, rowsFn, col, fmt) => ({ type: 'table', span: 4, title, note,
    cols: [{ label: 'Account', key: 'account' }, { label: col, key: 'v', cls: 'r', fmt }], rows: rowsFn, total: { v: (rs) => fmt(d3.sum(rs, (r) => r.v)) } });
  const topBy = (rs, f) => Array.from(d3.rollup(rs, f, (r) => r.account), ([account, v]) => ({ account, v })).filter((d) => d.v > 0).sort((a, b) => b.v - a.v).slice(0, 10);

  App({
    title: 'Contracts & Renewals',
    eyebrow: 'Managed services · Contract lifecycle',
    sub: 'Every active contract by type, what expires when, and whether it renews or churns, with the recurring revenue at stake.',
    files: { contracts: 'data/contracts.csv', impact: 'data/impact.csv' },
    slicers: [
      { key: 'type', label: 'Contract type', all: 'All types', options: TYPES },
      { key: 'csm', label: 'CSM', all: 'All CSMs', options: (D) => SDu.uniq(D.contracts, 'csm') },
      { key: 'mgr', label: 'Account manager', all: 'All managers', options: (D) => SDu.uniq(D.contracts, 'manager') },
      { key: 'closure', label: 'Closure type', all: 'All', options: ['Renewal', 'Churn'] },
    ],
    pages: [
      { id: 'home', label: 'Home', slicers: ['type', 'csm', 'mgr', 'closure'], blocks: [
        { type: 'text', html: (D, F) => { const a = act(base(D, F)); const soon = a.filter((r) => days(r) >= 0 && days(r) <= 90);
          return `<b>${f0(a.length)}</b> contracts are active. <b>${f0(soon.length)}</b> expire in the next 90 days, carrying <b>${usdK(sum(soon, 'mrr'))}</b> of MRR, and <b>${f0(soon.filter((r) => r.closure_type === 'Churn').length)}</b> of those are flagged to churn.`; } },
        { type: 'kpis', items: [{ label: 'Active contracts', value: (D, F) => f0(act(base(D, F)).length), sub: (D, F) => `${usdK(sum(act(base(D, F)), 'mrr'))} MRR` }].concat(TYPES.map((t) => ({
          label: t, value: (D, F) => f0(act(base(D, F, 'type')).filter((r) => r.type === t).length), sub: (D, F) => usdK(sum(act(base(D, F, 'type')).filter((r) => r.type === t), 'est_rev')) + ' est. revenue',
          pick: (F) => F.toggle('type', t), picked: (F) => F.is('type', t) }))) },
        { type: 'row', blocks: [
          { type: 'card', span: 8, title: 'Upcoming expirations, next 12 months', note: 'Active contracts by end month, split by expected outcome. Click a legend item to filter.', h: 250, draw: (el, D, F) => {
            const a = act(base(D, F, 'closure'));
            S.bars(el, { data: next12.map((m) => ({ m, churn: a.filter((r) => r.end_month === m && r.closure_type === 'Churn').length, renewal: a.filter((r) => r.end_month === m && r.closure_type !== 'Churn').length })),
              cat: 'm', stacked: true, values: true, yFmt: f0, catFmt: (m) => d3.utcFormat('%b %y')(S.parseDate(m)), series: CH, onLegend: (s) => F.toggle('closure', s.label), label: 'Expirations by month' });
          } },
          { type: 'card', span: 4, title: 'This month: renewal vs churn', note: 'Contracts ending in November.', h: 250, draw: (el, D, F) => {
            const a = base(D, F, 'closure').filter((r) => r.end_month === CUR); const data = [{ s: 'Renewal', v: a.filter((r) => r.closure_type !== 'Churn').length }, { s: 'Churn', v: a.filter((r) => r.closure_type === 'Churn').length }].filter((d) => d.v);
            S.donut(el, { data, labelKey: 's', value: 'v', colors: data.map((d) => (d.s === 'Churn' ? '#e5484d' : '#1e3a8a')), centerLabel: 'ending', onPick: (d) => F.toggle('closure', d.s), label: 'Current month expiry' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Days until expiry', note: 'Active contracts by time left.', h: 240, draw: (el, D, F) => {
            const a = act(base(D, F));
            S.bars(el, { data: BK.map(([l, x, y]) => ({ l, v: a.filter((r) => days(r) >= x && days(r) <= y).length })), cat: 'l', values: true, yFmt: f0, series: [{ key: 'v', label: 'Contracts', color: '#1e3a8a' }], label: 'Contracts by days until expiry' });
          } },
          { type: 'table', span: 7, title: 'Expiring soonest', note: 'Active contracts ending in the next 90 days.', maxH: 300,
            cols: [{ label: 'Contract ID', key: 'contract_id' }, { label: 'Account', key: 'account' }, { label: 'Contract', key: 'contract' }, { label: 'Type', key: 'type' }, { label: 'End', key: 'end', fmt: (v) => d3.utcFormat('%b %d, %Y')(S.parseDate(v)) },
              { label: 'Outcome', key: 'closure_type', render: (td, r) => { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = r.closure_type === 'Churn' ? '#e5484d' : '#1e3a8a'; td.append(d, document.createTextNode(r.closure_type || 'Renewal')); } },
              { label: 'MRR', key: 'mrr', cls: 'r', fmt: (v) => usd(n(v)) }],
            rows: (D, F) => act(base(D, F)).filter((r) => days(r) <= 90).sort((a, b) => a.end.localeCompare(b.end)) },
        ] },
      ] },
      { id: 'recurring', label: 'Recurring', slicers: ['csm', 'mgr'], blocks: [
        { type: 'kpis', items: [
          { label: 'Expiring this month', value: (D, F) => f0(base(D, F).filter((r) => r.type === 'Recurring Service' && r.end_month === CUR).length) },
          { label: 'Expiring next 90 days', value: (D, F) => f0(act(base(D, F)).filter((r) => r.type === 'Recurring Service' && days(r) >= 0 && days(r) <= 90).length) },
          { label: 'Expiring in 2026', value: (D, F) => f0(base(D, F).filter((r) => r.type === 'Recurring Service' && r.end_month.startsWith('2026')).length) },
          { label: 'Churn rate, 2026', value: (D, F) => { const s = base(D, F).filter((r) => r.type === 'Recurring Service' && r.end_month.startsWith('2026') && r.closure_type); return pct(s.length ? (s.filter((r) => r.closure_type === 'Churn').length / s.length) * 100 : 0); }, tone: () => 'warn' },
          { label: 'Churned MRR, 2026', value: (D, F) => usdK(sum(base(D, F).filter((r) => r.type === 'Recurring Service' && r.end_month.startsWith('2026') && r.closure_type === 'Churn'), 'mrr')), tone: () => 'bad' },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 4, title: 'Renewal vs churn, 2026', note: 'Recurring contracts ending this year.', h: 240, draw: (el, D, F) => {
            const s = base(D, F).filter((r) => r.type === 'Recurring Service' && r.end_month.startsWith('2026') && r.closure_type);
            S.donut(el, { data: [{ s: 'Renewal', v: s.filter((r) => r.closure_type === 'Renewal').length }, { s: 'Churn', v: s.filter((r) => r.closure_type === 'Churn').length }], labelKey: 's', value: 'v', colors: ['#1e3a8a', '#e5484d'], centerLabel: 'contracts', label: 'Renewal vs churn' });
          } },
          { type: 'card', span: 8, title: 'Contract retention by month', note: 'Recurring contracts ending each month of 2026.', h: 240, draw: (el, D, F) => {
            const s = base(D, F).filter((r) => r.type === 'Recurring Service');
            S.bars(el, { data: y2026.map((m) => ({ m, churn: s.filter((r) => r.end_month === m && r.closure_type === 'Churn').length, renewal: s.filter((r) => r.end_month === m && r.closure_type === 'Renewal').length })), cat: 'm', values: true, yFmt: f0, catFmt: mon, series: CH, label: 'Retention by month' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'MRR impact: churn vs renewal', note: 'MRR on recurring contracts ending each month of 2026.', h: 240, draw: (el, D, F) => {
            const s = base(D, F).filter((r) => r.type === 'Recurring Service');
            S.bars(el, { data: y2026.map((m) => ({ m, churn: sum(s.filter((r) => r.end_month === m && r.closure_type === 'Churn'), 'mrr'), renewal: sum(s.filter((r) => r.end_month === m && r.closure_type === 'Renewal'), 'mrr') })), cat: 'm', values: true, yFmt: usdK, catFmt: mon, series: CH, label: 'MRR by outcome by month' });
          } },
        ] },
      ] },
      { id: 'onetime', label: 'One-time', slicers: ['csm', 'mgr'], blocks: [
        { type: 'kpis', items: ['Fixed Price', 'Block Hours', 'Time & Materials'].map((t) => ({ label: t, value: (D, F) => f0(act(base(D, F)).filter((r) => r.type === t).length), sub: (D, F) => usdK(sum(act(base(D, F)).filter((r) => r.type === t), 'est_rev')) + ' est. revenue' })) },
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'Share of one-time contracts by type', h: 230, draw: (el, D, F) => {
            const a = act(base(D, F)).filter((r) => r.type !== 'Recurring Service'); const data = ['Fixed Price', 'Block Hours', 'Time & Materials'].map((t) => ({ t, v: a.filter((r) => r.type === t).length })).filter((d) => d.v);
            S.donut(el, { data, labelKey: 't', value: 'v', colors: data.map((d) => TCOL[d.t]), centerLabel: 'contracts', label: 'One-time contracts by type' });
          } },
          { type: 'card', span: 6, title: 'Share of one-time revenue by type', h: 230, draw: (el, D, F) => {
            const a = act(base(D, F)).filter((r) => r.type !== 'Recurring Service'); const data = ['Fixed Price', 'Block Hours', 'Time & Materials'].map((t) => ({ t, v: sum(a.filter((r) => r.type === t), 'est_rev') })).filter((d) => d.v);
            S.donut(el, { data, labelKey: 't', value: 'v', colors: data.map((d) => TCOL[d.t]), centerLabel: 'est. revenue', label: 'One-time revenue by type' });
            el.querySelector('.sd-donut-v').textContent = usdK(d3.sum(data, (d) => d.v));
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'One-time contract expiry: churn vs renewal', note: 'Non-recurring contracts ending each month of 2026.', h: 230, draw: (el, D, F) => {
            const s = base(D, F).filter((r) => r.type !== 'Recurring Service');
            S.bars(el, { data: y2026.map((m) => ({ m, churn: s.filter((r) => r.end_month === m && r.closure_type === 'Churn').length, renewal: s.filter((r) => r.end_month === m && r.closure_type === 'Renewal').length })), cat: 'm', values: true, yFmt: f0, catFmt: mon, series: CH, label: 'One-time expiry by month' });
          } },
        ] },
      ] },
      { id: 'trend', label: 'New & closing', slicers: ['csm', 'mgr'], blocks: [
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'Recurring: new contracts in 2026', note: 'Cumulative contracts started each month.', h: 240, draw: (el, D, F) => {
            const s = base(D, F).filter((r) => r.type === 'Recurring Service' && r.start.startsWith('2026'));
            S.waterfall(el, { data: y2026.slice(0, 11).map((m) => ({ label: mon(m), value: s.filter((r) => r.start.slice(0, 7) === m.slice(0, 7)).length })), fmt: f0, color: '#22a06b', totalColor: '#1e3a8a', label: 'New recurring contracts' });
          } },
          { type: 'card', span: 6, title: 'Fixed price: new contracts in 2026', note: 'Cumulative contracts started each month.', h: 240, draw: (el, D, F) => {
            const s = base(D, F).filter((r) => r.type === 'Fixed Price' && r.start.startsWith('2026'));
            S.waterfall(el, { data: y2026.slice(0, 11).map((m) => ({ label: mon(m), value: s.filter((r) => r.start.slice(0, 7) === m.slice(0, 7)).length })), fmt: f0, color: '#22a06b', totalColor: '#1e3a8a', label: 'New fixed-price contracts' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'Contracts still to close this year', note: 'Active contracts ending in November and December, by type.', h: 240, draw: (el, D, F) => {
            const a = base(D, F).filter((r) => r.end_month === '2026-11-01' || r.end_month === '2026-12-01');
            S.bars(el, { data: TYPES.map((t) => ({ t, nov: a.filter((r) => r.type === t && r.end_month === '2026-11-01').length, dec: a.filter((r) => r.type === t && r.end_month === '2026-12-01').length })), cat: 't', stacked: true, values: true, yFmt: f0,
              series: [{ key: 'nov', label: 'November', color: '#e5484d' }, { key: 'dec', label: 'December', color: '#f97316' }], label: 'Closing contracts by type' });
          } },
        ] },
      ] },
      { id: 'top', label: 'Top accounts', slicers: ['csm', 'mgr'], blocks: [
        { type: 'row', blocks: [
          topTable('Top 10 by recurring MRR', 'Active recurring contracts.', (D, F) => topBy(act(base(D, F)).filter((r) => r.type === 'Recurring Service'), (v) => d3.sum(v, (r) => n(r.mrr))), 'MRR', usd),
          topTable('Top 10 by fixed-price revenue', 'Active fixed-price contracts.', (D, F) => topBy(act(base(D, F)).filter((r) => r.type === 'Fixed Price'), (v) => d3.sum(v, (r) => n(r.est_rev))), 'Est. revenue', usd),
          topTable('Top 10 by active contracts', 'All active contract types.', (D, F) => topBy(act(base(D, F)), (v) => v.length), 'Contracts', f0),
        ] },
      ] },
      { id: 'impact', label: 'Impact', impact: true, blocks: [{ type: 'impact' }] },
    ],
    impactNote: 'Recurring contracts ending Jan–Mar 2026 vs those ending in the latest 3 months.',
    impactChart: { title: 'Recurring churn rate by end month', note: 'Share of recurring contracts ending each month that churned.', h: 240, draw: (el, D) => {
      const s = D.contracts.filter((r) => r.type === 'Recurring Service' && r.closure_type);
      const data = y2026.slice(0, 10).map((m) => { const x = s.filter((r) => r.end_month === m); return { m, v: x.length ? (x.filter((r) => r.closure_type === 'Churn').length / x.length) * 100 : 0 }; });
      S.line(el, { data, x: (d) => S.parseDate(d.m), yZero: true, points: true, yFmt: (v) => d3.format('.0f')(v) + '%', annotate: { date: new Date(Date.UTC(2026, 1, 1)), text: 'Go-live' }, series: [{ key: 'v', label: 'Churn rate', color: '#e5484d' }], label: 'Churn rate by month' });
    } },
    impactMethod: 'Before = recurring contracts ending Jan–Mar 2026, after = those ending in the latest 3 months. Churned MRR is the monthly MRR on contracts that did not renew. Tracking effort and notice figures are estimates. Every figure here is sample data built for this prototype.',
  });
})();
