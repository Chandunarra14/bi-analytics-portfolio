(function () {
  const S = SD, n = S.n;
  const f0 = d3.format(',.0f'), usd = S.fmtUsd, usdK = (v) => '$' + d3.format('.3~s')(v).replace('G', 'B'), pct = (v) => d3.format('.0f')(v) + '%';
  const TYPES = ['Recurring Service', 'Fixed Price', 'Block Hours', 'Time & Materials'];
  const TCOL = { 'Recurring Service': '#1e3a8a', 'Fixed Price': '#0ea5e9', 'Block Hours': '#f97316', 'Time & Materials': '#8b5cf6' };
  const TODAY = new Date(Date.UTC(2026, 10, 10));
  const CUR = '2026-11-01';
  const map = { type: 'type', csm: 'csm', mgr: 'manager', closure: 'closure_type', acct: 'account' };
  const base = (D, F, skip) => D.contracts.filter((r) => F.ok(r, Object.fromEntries(Object.entries(map).filter(([k]) => k !== skip))));
  const act = (rs) => rs.filter((r) => r.active === 'Yes');
  const sum = (rs, k) => d3.sum(rs, (r) => n(r[k]));
  const days = (r) => Math.round((S.parseDate(r.end) - TODAY) / 864e5);
  const BK = [['Overdue', -1e9, -1], ['0-30', 0, 30], ['31-60', 31, 60], ['61-90', 61, 90], ['91-180', 91, 180], ['181-360', 181, 360], ['360+', 361, 1e9]];
  const next12 = Array.from({ length: 12 }, (_, i) => d3.utcFormat('%Y-%m-%d')(d3.utcMonth.offset(new Date(Date.UTC(2026, 10, 1)), i)));
  const y2026 = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, '0')}-01`);
  const mon = (m) => d3.utcFormat('%b')(S.parseDate(m));
  const CH = [{ key: 'churn', label: 'Churn', color: '#e5484d' }, { key: 'renewal', label: 'Renewal', color: '#1e3a8a' }];
  const acctSummary = (D, F) => Array.from(d3.group(act(base(D, F, 'acct')), (r) => r.account), ([account, xs]) => {
    const fut = xs.map(days).filter((d) => d >= 0);
    return { account, csm: xs[0].csm, manager: xs[0].manager, active: xs.length, mrr: sum(xs.filter((r) => r.type === 'Recurring Service'), 'mrr'),
      fixed: sum(xs.filter((r) => r.type === 'Fixed Price'), 'est_rev'), block: sum(xs.filter((r) => r.type === 'Block Hours'), 'est_rev'),
      next: fut.length ? d3.min(fut) : null, churn: xs.filter((r) => r.closure_type === 'Churn').length };
  }).sort((a, b) => b.mrr - a.mrr);

  App({
    story: {"headline": "Client contracts were quietly expiring, and the company found out when the revenue stopped.", "sub": "Renewal dates sat in the PSA. Each CSM kept their own spreadsheet, so contracts slipped through, renewal talks started about 30 days before expiry, and almost half of the recurring contracts that ended didn't renew.", "who": "Client success managers, account managers, finance and leadership", "problem": [["Spreadsheets per CSM", "Renewal lists were pulled from the PSA and tracked by hand, about 15 hours a week combined."], ["Too little notice", "Renewal conversations started about 30 days before expiry: too late to fix anything."], ["High churn", "About 46% of ending recurring contracts churned, losing about $5.4K of MRR every month."], ["Missed renewals", "About 12 contracts a quarter simply auto-expired because nobody noticed."]], "built": [["Every contract and its end date", "Active contracts by type, days until expiry and expected outcome."], ["Churn vs renewal", "Counts and MRR at risk by month, for recurring and one-time contracts."], ["New vs closing", "Contracts coming in against contracts ending, with net MRR movement."], ["Top accounts and concentration", "Which clients hold the most revenue and how much depends on a few of them."]], "pages": [["home", "Home", "What is active and what is ending in the next 12 months."], ["recurring", "Recurring", "Monthly service contracts: churn rate and MRR at risk."], ["onetime", "One-time", "Fixed price, block hours and T&M contracts."], ["trend", "New & closing", "What came in this year and what is left to close."], ["top", "Top accounts", "Biggest clients and revenue concentration."], ["impact", "★ Impact", "Lower churn and earlier renewals since go-live."]]},
    title: 'Contracts & Renewals',
    eyebrow: 'Managed services · Contract lifecycle',
    sub: 'Every active contract by type, what expires when, and whether it renews or churns, with the recurring revenue at stake.',
    files: { contracts: 'data/contracts.csv', impact: 'data/impact.csv' },
    slicers: [
      { key: 'type', label: 'Contract type', all: 'All types', options: TYPES },
      { key: 'csm', label: 'CSM', all: 'All CSMs', options: (D) => SDu.uniq(D.contracts, 'csm') },
      { key: 'mgr', label: 'Account manager', all: 'All managers', options: (D) => SDu.uniq(D.contracts, 'manager') },
      { key: 'closure', label: 'Closure type', all: 'All', options: ['Renewal', 'Churn'] },
      { key: 'acct', label: 'Account', all: 'All accounts', options: (D) => SDu.uniq(D.contracts, 'account') },
    ],
    pages: [
      { id: 'context', label: 'Context', slicers: [], blocks: [{ type: 'story' }] },
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
      { id: 'trend', label: 'New & closing', slicers: ['type', 'csm', 'mgr', 'acct'], blocks: [
        { type: 'text', html: (D, F) => { const r = base(D, F); const nw = r.filter((x) => x.start.startsWith('2026')); const lost = r.filter((x) => x.end_month.startsWith('2026') && x.closure_type === 'Churn' && x.type === 'Recurring Service');
          const net = sum(nw.filter((x) => x.type === 'Recurring Service'), 'mrr') - sum(lost, 'mrr');
          return `<b>${f0(nw.length)}</b> contracts started in 2026, adding <b>${usdK(sum(nw.filter((x) => x.type === 'Recurring Service'), 'mrr'))}</b> of recurring MRR. After <b>${usdK(sum(lost, 'mrr'))}</b> of churned MRR, net recurring MRR is <b style='color:${net >= 0 ? 'var(--color-ok)' : 'var(--color-bad)'}'>${net >= 0 ? '+' : '−'}${usdK(Math.abs(net))}</b> for the year.`; } },
        { type: 'kpis', items: [
          { label: 'New contracts, 2026', value: (D, F) => f0(base(D, F).filter((r) => r.start.startsWith('2026')).length), sub: (D, F) => usdK(sum(base(D, F).filter((r) => r.start.startsWith('2026')), 'est_rev')) + ' est. revenue' },
          { label: 'New recurring MRR', value: (D, F) => usdK(sum(base(D, F).filter((r) => r.start.startsWith('2026') && r.type === 'Recurring Service'), 'mrr')), tone: () => 'good' },
          { label: 'Churned MRR, 2026', value: (D, F) => usdK(sum(base(D, F).filter((r) => r.end_month.startsWith('2026') && r.closure_type === 'Churn' && r.type === 'Recurring Service'), 'mrr')), tone: () => 'bad' },
          { label: 'Still to close this year', value: (D, F) => f0(base(D, F).filter((r) => r.end_month === '2026-11-01' || r.end_month === '2026-12-01').length), tone: () => 'warn', sub: (D, F) => usdK(sum(base(D, F).filter((r) => r.end_month === '2026-11-01' || r.end_month === '2026-12-01'), 'mrr')) + ' MRR in Nov–Dec' },
          { label: 'Flagged to churn (Nov–Dec)', value: (D, F) => f0(base(D, F).filter((r) => (r.end_month === '2026-11-01' || r.end_month === '2026-12-01') && r.closure_type === 'Churn').length), tone: () => 'bad', sub: (D, F) => usdK(sum(base(D, F).filter((r) => (r.end_month === '2026-11-01' || r.end_month === '2026-12-01') && r.closure_type === 'Churn'), 'mrr')) + ' MRR at risk' },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 7, title: 'Contracts started vs ending, 2026', note: 'Contracts that started each month vs contracts that ended (renewed or churned).', h: 250, draw: (el, D, F) => {
            const r = base(D, F);
            S.bars(el, { data: y2026.map((m) => ({ m, nw: r.filter((x) => x.start.slice(0, 7) === m.slice(0, 7)).length, ren: r.filter((x) => x.end_month === m && x.closure_type !== 'Churn').length, ch: r.filter((x) => x.end_month === m && x.closure_type === 'Churn').length })),
              cat: 'm', yFmt: f0, catFmt: mon, series: [{ key: 'nw', label: 'Started', color: '#22a06b' }, { key: 'ren', label: 'Ended · renewed', color: '#1e3a8a' }, { key: 'ch', label: 'Ended · churned', color: '#e5484d' }], label: 'Started vs ending by month' });
          } },
          { type: 'card', span: 5, title: 'Net recurring MRR movement, 2026', note: 'New recurring MRR each month minus churned MRR. Final bar is the year\'s net.', h: 250, draw: (el, D, F) => {
            const r = base(D, F).filter((x) => x.type === 'Recurring Service');
            S.waterfall(el, { data: y2026.map((m) => ({ label: mon(m), value: sum(r.filter((x) => x.start.slice(0, 7) === m.slice(0, 7)), 'mrr') - sum(r.filter((x) => x.end_month === m && x.closure_type === 'Churn'), 'mrr') })),
              total: 'Net', fmt: usdK, color: '#22a06b', totalColor: '#1e3a8a', label: 'Net MRR movement' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'New contracts by type, 2026', note: 'Click a bar to filter by type.', h: 220, draw: (el, D, F) => {
            const r = base(D, F, 'type').filter((x) => x.start.startsWith('2026'));
            S.hbars(el, { data: TYPES.map((t) => ({ t, v: r.filter((x) => x.type === t).length })), labelKey: 't', value: 'v', fmt: f0, color: '#22a06b', onPick: (d) => F.toggle('type', d.t), tipExtra: (d) => [usdK(sum(r.filter((x) => x.type === d.t), 'est_rev')) + ' est. revenue'], label: 'New contracts by type' });
          } },
          { type: 'card', span: 6, title: 'Still to close this year, by type', note: 'Contracts ending in November and December.', h: 220, draw: (el, D, F) => {
            const a = base(D, F, 'type').filter((r) => r.end_month === '2026-11-01' || r.end_month === '2026-12-01');
            S.bars(el, { data: TYPES.map((t) => ({ t, nov: a.filter((r) => r.type === t && r.end_month === '2026-11-01').length, dec: a.filter((r) => r.type === t && r.end_month === '2026-12-01').length })), cat: 't', stacked: true, values: true, yFmt: f0, onPick: (d) => F.toggle('type', d.t),
              series: [{ key: 'nov', label: 'November', color: '#e5484d' }, { key: 'dec', label: 'December', color: '#f97316' }], label: 'Closing contracts by type' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Closing this year: contract detail', note: 'Every contract ending in November or December, churn risks first. Click a row to focus on that account.', maxH: 420, onRow: (r, F) => F.toggle('acct', r.account),
            cols: [{ label: 'Contract ID', key: 'contract_id' }, { label: 'Account', key: 'account' }, { label: 'Contract', key: 'contract' }, { label: 'Type', key: 'type' }, { label: 'CSM', key: 'csm' },
              { label: 'End', key: 'end', fmt: (v) => d3.utcFormat('%b %d, %Y')(S.parseDate(v)) }, { label: 'Days left', key: 'end', cls: 'r', render: (td, r) => { const d = days(r); td.textContent = d; if (d < 0) { td.style.color = 'var(--color-bad)'; td.style.fontWeight = '600'; } } },
              { label: 'Outcome', key: 'closure_type', render: (td, r) => { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = r.closure_type === 'Churn' ? '#e5484d' : '#1e3a8a'; td.append(d, document.createTextNode(r.closure_type || 'Renewal')); } },
              { label: 'MRR', key: 'mrr', cls: 'r', fmt: (v) => usd(n(v)) }, { label: 'Est. revenue', key: 'est_rev', cls: 'r', fmt: (v) => usd(n(v)) }],
            rows: (D, F) => base(D, F).filter((r) => r.end_month === '2026-11-01' || r.end_month === '2026-12-01').sort((a, b) => (a.closure_type === 'Churn' ? 0 : 1) - (b.closure_type === 'Churn' ? 0 : 1) || n(b.mrr) - n(a.mrr)),
            total: { mrr: (rs) => usd(sum(rs, 'mrr')), est_rev: (rs) => usd(sum(rs, 'est_rev')) } },
        ] },
      ] },
      { id: 'top', label: 'Top accounts', slicers: ['type', 'csm', 'mgr'], blocks: [
        { type: 'text', html: (D, F) => { const t = acctSummary(D, F); const tot = d3.sum(t, (r) => r.mrr) || 1; const top10 = d3.sum(t.slice(0, 10), (r) => r.mrr);
          return `The top 10 accounts carry <b>${pct((top10 / tot) * 100)}</b> of active recurring MRR. <b>${t.filter((r) => r.churn > 0).length}</b> accounts have at least one contract flagged to churn, and <b>${t.filter((r) => r.next != null && r.next <= 90).length}</b> have a contract expiring in the next 90 days.`; } },
        { type: 'kpis', items: [
          { label: 'Active accounts', value: (D, F) => f0(acctSummary(D, F).length) },
          { label: 'Active recurring MRR', value: (D, F) => usdK(d3.sum(acctSummary(D, F), (r) => r.mrr)) },
          { label: 'Avg MRR per account', value: (D, F) => { const t = acctSummary(D, F); return usdK(t.length ? d3.sum(t, (r) => r.mrr) / t.length : 0); } },
          { label: 'Top 10 share of MRR', value: (D, F) => { const t = acctSummary(D, F); return pct((d3.sum(t.slice(0, 10), (r) => r.mrr) / (d3.sum(t, (r) => r.mrr) || 1)) * 100); }, tone: (D, F) => { const t = acctSummary(D, F); return d3.sum(t.slice(0, 10), (r) => r.mrr) / (d3.sum(t, (r) => r.mrr) || 1) > 0.4 ? 'warn' : null; }, sub: () => 'concentration risk' },
          { label: 'Accounts with churn flags', value: (D, F) => f0(acctSummary(D, F).filter((r) => r.churn > 0).length), tone: () => 'bad' },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 4, title: 'Top 10 by recurring MRR', note: 'Red = has a contract flagged to churn. Click to focus.', h: 300, draw: (el, D, F) => {
            S.hbars(el, { data: acctSummary(D, F).filter((r) => r.mrr > 0).slice(0, 10), labelKey: 'account', value: 'mrr', fmt: usdK, color: '#1e3a8a', highlight: (d) => d.churn > 0, onPick: (d) => F.toggle('acct', d.account),
              tipExtra: (d) => [`${d.active} active contracts`, d.churn ? `${d.churn} flagged to churn` : 'No churn flags'], label: 'Top accounts by MRR' });
          } },
          { type: 'card', span: 4, title: 'Top 10 by fixed-price revenue', note: 'Active fixed-price contracts. Click to focus.', h: 300, draw: (el, D, F) => {
            S.hbars(el, { data: acctSummary(D, F).filter((r) => r.fixed > 0).sort((a, b) => b.fixed - a.fixed).slice(0, 10), labelKey: 'account', value: 'fixed', fmt: usdK, color: '#0ea5e9', onPick: (d) => F.toggle('acct', d.account), label: 'Top accounts by fixed-price revenue' });
          } },
          { type: 'card', span: 4, title: 'Top 10 by active contracts', note: 'All contract types. Click to focus.', h: 300, draw: (el, D, F) => {
            S.hbars(el, { data: acctSummary(D, F).slice().sort((a, b) => b.active - a.active).slice(0, 10), labelKey: 'account', value: 'active', fmt: f0, color: '#8b5cf6', onPick: (d) => F.toggle('acct', d.account), label: 'Top accounts by contract count' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'MRR concentration', note: 'Share of active recurring MRR held by account tiers.', h: 250, draw: (el, D, F) => {
            const t = acctSummary(D, F).filter((r) => r.mrr > 0); const s = (a, b) => d3.sum(t.slice(a, b), (r) => r.mrr);
            const data = [{ k: 'Top 5', v: s(0, 5) }, { k: 'Next 5 (6–10)', v: s(5, 10) }, { k: 'Next 15 (11–25)', v: s(10, 25) }, { k: `Rest (${Math.max(0, t.length - 25)})`, v: s(25) }].filter((d) => d.v > 0);
            S.donut(el, { data, labelKey: 'k', value: 'v', colors: ['#1e3a8a', '#2f6fed', '#0ea5e9', '#cbd5e1'], centerLabel: 'recurring MRR', label: 'MRR concentration' });
            el.querySelector('.sd-donut-v').textContent = usdK(d3.sum(data, (d) => d.v));
            el.querySelectorAll('.sd-dlegend b').forEach((b, i) => { b.textContent = `${usdK(data[i].v)} · ${d3.format('.0%')(data[i].v / d3.sum(data, (d) => d.v))}`; });
          } },
          { type: 'card', span: 7, title: 'Top 10 accounts: MRR by contract type', note: 'How each top account\'s active revenue splits across contract types.', h: 280, draw: (el, D, F) => {
            const top = acctSummary(D, F).slice(0, 10);
            S.hstack(el, { rows: top.map((r) => ({ label: r.account, rec: r.mrr, fix: r.fixed / 12, blk: r.block / 12 })), rowH: 26, fmt: usdK,
              series: [{ key: 'rec', label: 'Recurring MRR', color: '#1e3a8a' }, { key: 'fix', label: 'Fixed price (monthly equiv.)', color: '#0ea5e9' }, { key: 'blk', label: 'Block hours (monthly equiv.)', color: '#f97316' }], label: 'Top account revenue mix' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Account detail', note: 'Every active account, largest MRR first. Next expiry in red when under 90 days. Click a row to open its contracts on the New & closing page.', maxH: 460,
            onRow: (r, F) => { F.state.acct = r.account; F.go('trend'); },
            cols: [{ label: 'Account', key: 'account' }, { label: 'CSM', key: 'csm' }, { label: 'Manager', key: 'manager' }, { label: 'Active', key: 'active', cls: 'r' },
              { label: 'Recurring MRR', key: 'mrr', cls: 'r', fmt: usd }, { label: 'Fixed price', key: 'fixed', cls: 'r', fmt: usd }, { label: 'Block hours', key: 'block', cls: 'r', fmt: usd },
              { label: 'Next expiry', key: 'next', cls: 'r', render: (td, r) => { if (r.next == null) return; td.textContent = r.next + ' days'; if (r.next <= 90) { td.style.color = 'var(--color-bad)'; td.style.fontWeight = '600'; } } },
              { label: 'Churn flags', key: 'churn', cls: 'r', render: (td, r) => { if (r.churn) { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = '#e5484d'; td.append(d, document.createTextNode(r.churn)); } else td.textContent = '—'; } }],
            rows: (D, F) => acctSummary(D, F),
            total: { active: (rs) => f0(d3.sum(rs, (r) => r.active)), mrr: (rs) => usd(d3.sum(rs, (r) => r.mrr)), fixed: (rs) => usd(d3.sum(rs, (r) => r.fixed)), block: (rs) => usd(d3.sum(rs, (r) => r.block)) } },
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
