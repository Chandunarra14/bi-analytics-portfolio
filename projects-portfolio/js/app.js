(function () {
  const S = SD, n = S.n;
  const f0 = d3.format(',.0f'), usd = S.fmtUsd, usdK = (v) => '$' + d3.format('.3~s')(v).replace('G', 'B'), pct = (v) => d3.format('.0f')(v) + '%';
  const RYG = ['Green', 'Yellow', 'Red', 'Blue'];
  const RCOL = { Green: '#22a06b', Yellow: '#f2c230', Red: '#e5484d', Blue: '#2f6fed' };
  const BUD = ['Above Rate', 'Under Value', 'Over Budget', 'Zero Budget'];
  const BCOL = { 'Above Rate': '#22a06b', 'Under Value': '#f97316', 'Over Budget': '#e5484d', 'Zero Budget': '#94a3b8' };
  const map = { lead: 'lead', imp: 'imp_type', cls: 'classification', ryg: 'ryg', budget: 'budget_status' };
  const base = (D, F, skip) => D.projects.filter((r) => F.ok(r, Object.fromEntries(Object.entries(map).filter(([k]) => k !== skip))));
  const active = (rs) => rs.filter((r) => r.is_open === 'Yes');
  const sum = (rs, k) => d3.sum(rs, (r) => n(r[k]));
  const mk = (d) => (d ? d.slice(0, 7) + '-01' : '');
  const CUR = '2026-11-01';
  const past12 = Array.from({ length: 12 }, (_, i) => d3.utcFormat('%Y-%m-%d')(d3.utcMonth.offset(new Date(Date.UTC(2026, 10, 1)), i - 12)));
  const dot = (td, color, txt) => { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = color; td.append(d, document.createTextNode(txt)); };

  App({
    story: {"headline": "Projects were running long and over budget, and leadership only found out when the monthly report was built by hand.", "sub": "Project status, backlog and margin lived in PSA exports. PMs and finance spent about 80 hours a month building status packs, and projects that were burning hours past what was sold weren't caught until they closed.", "who": "Project managers, project leads, finance and operations leadership", "problem": [["Monthly packs built by hand", "PMs and finance spent about 80 hours a month turning PSA exports into status, backlog and margin reports."], ["Stuck projects stayed stuck", "About 27% of open projects were more than 180 days old, with no early warning."], ["Margin leaks found too late", "About 26% of projects closed over budget, and average margin on closed projects was only 6%."], ["Backlog was a guess", "Nobody could say how much sold revenue would be delivered next month or next quarter."]], "built": [["Project health at a glance", "Red, Yellow, Green and Blue status by age, type and lead."], ["Revenue movement", "New vs closed projects, NRR and MRR each month, plus revenue booked ahead."], ["Backlog burndown", "Undelivered NRR by the month it should land."], ["Budget and margin", "Contracted vs worked hours on every project, with over-budget work flagged early."]], "pages": [["active", "Active projects", "Health of every open project by status, type and lead."], ["revenue", "Revenue movement", "Projects and revenue in vs delivered."], ["backlog", "NRR backlog", "Revenue sold but not yet delivered, and when it lands."], ["budget", "Budget & margin", "Which projects are using more hours than were sold."], ["impact", "★ Impact", "Fewer over-budget projects and better margins since go-live."]]},
    title: 'Projects Portfolio',
    eyebrow: 'Managed services · Project delivery',
    sub: 'Active project health, revenue movement, NRR backlog and margins in one place: what is on track, what is stuck, and what it means for revenue.',
    files: { projects: 'data/projects.csv', impact: 'data/impact.csv' },
    slicers: [
      { key: 'lead', label: 'Project lead', all: 'All leads', options: (D) => SDu.uniq(D.projects, 'lead') },
      { key: 'imp', label: 'Implementation type', all: 'All types', options: (D) => SDu.uniq(D.projects, 'imp_type') },
      { key: 'cls', label: 'Classification', all: 'All levels', options: (D) => SDu.uniq(D.projects, 'classification') },
      { key: 'ryg', label: 'RYG status', all: 'All statuses', options: RYG },
      { key: 'budget', label: 'Budget status', all: 'All', options: BUD },
    ],
    pages: [
      { id: 'context', label: 'Context', slicers: [], blocks: [{ type: 'story' }] },
      { id: 'active', label: 'Active projects', slicers: ['lead', 'imp', 'cls', 'ryg'], blocks: [
        { type: 'text', html: (D, F) => { const a = active(base(D, F)); return `<b>${f0(a.length)}</b> projects are active, carrying <b>${usdK(sum(a, 'nrr'))}</b> in NRR. <b>${a.filter((r) => r.ryg === 'Red').length}</b> are Red (in progress over 180 days) and <b>${a.filter((r) => r.ryg === 'Yellow').length}</b> are Yellow.`; } },
        { type: 'kpis', items: [
          { label: 'Active projects', value: (D, F) => f0(active(base(D, F)).length) },
          { label: 'Active NRR', value: (D, F) => usdK(sum(active(base(D, F)), 'nrr')), sub: (D, F) => `${active(base(D, F)).filter((r) => n(r.nrr) > 0).length} NRR projects` },
          { label: 'Active MRR projects', value: (D, F) => f0(active(base(D, F)).filter((r) => n(r.mrr) > 0).length), sub: (D, F) => `${usdK(sum(active(base(D, F)), 'mrr'))} MRR` },
          { label: 'Red', value: (D, F) => f0(active(base(D, F)).filter((r) => r.ryg === 'Red').length), tone: () => 'bad', sub: () => '> 180 days in progress', pick: (F) => F.toggle('ryg', 'Red'), picked: (F) => F.is('ryg', 'Red') },
          { label: 'Yellow', value: (D, F) => f0(active(base(D, F)).filter((r) => r.ryg === 'Yellow').length), tone: () => 'warn', sub: () => '121–180 days', pick: (F) => F.toggle('ryg', 'Yellow'), picked: (F) => F.is('ryg', 'Yellow') },
          { label: 'Avg age', value: (D, F) => f0(d3.mean(active(base(D, F)), (r) => n(r.age_days)) || 0), sub: () => 'days' },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 4, title: 'Projects by RYG status', note: 'Click a slice to filter.', h: 240, draw: (el, D, F) => {
            const a = active(base(D, F, 'ryg')); const data = RYG.map((s) => ({ s, v: a.filter((r) => r.ryg === s).length })).filter((d) => d.v);
            S.donut(el, { data, labelKey: 's', value: 'v', colors: data.map((d) => RCOL[d.s]), centerLabel: 'active', onPick: (d) => F.toggle('ryg', d.s), label: 'Active projects by RYG' });
          } },
          { type: 'card', span: 8, title: 'RYG status by implementation type', note: 'Click a bar to filter by type, or a legend item to filter by status.', h: 240, draw: (el, D, F) => {
            const a = active(base(D, F, 'imp'));
            S.bars(el, { data: SDu.uniq(D.projects, 'imp_type').map((t) => Object.assign({ t }, Object.fromEntries(RYG.map((s) => [s, a.filter((r) => r.imp_type === t && r.ryg === s).length])))),
              cat: 't', stacked: true, values: true, yFmt: f0, onPick: (d) => F.toggle('imp', d.t), onLegend: (s) => F.toggle('ryg', s.key), series: RYG.map((s) => ({ key: s, label: s, color: RCOL[s] })), label: 'RYG by implementation type' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'Projects by lead and RYG status', note: 'Click a bar to filter to that lead.', h: 240, draw: (el, D, F) => {
            const a = active(base(D, F, 'lead'));
            const data = Array.from(d3.group(a, (r) => r.lead), ([l, xs]) => Object.assign({ l }, Object.fromEntries(RYG.map((s) => [s, xs.filter((r) => r.ryg === s).length])))).sort((x, y) => d3.sum(RYG, (s) => y[s]) - d3.sum(RYG, (s) => x[s]));
            S.bars(el, { data, cat: 'l', stacked: true, values: true, yFmt: f0, onPick: (d) => F.toggle('lead', d.l), onLegend: (s) => F.toggle('ryg', s.key), series: RYG.map((s) => ({ key: s, label: s, color: RCOL[s] })), label: 'Projects by lead' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Project details', note: 'Active projects, oldest first.', maxH: 420,
            cols: [{ label: 'Project', key: 'project', render: (td, r) => { const s = document.createElement('span'); s.className = 'sd-pill'; s.textContent = r.project; td.append(s); } },
              { label: 'RYG', key: 'ryg', render: (td, r) => dot(td, RCOL[r.ryg], r.ryg) }, { label: 'Account', key: 'account' }, { label: 'Level', key: 'classification' }, { label: 'Type', key: 'imp_type' },
              { label: 'Status', key: 'status' }, { label: 'Lead', key: 'lead' }, { label: 'Started', key: 'created', fmt: (v) => d3.utcFormat('%b %d, %Y')(S.parseDate(v)) },
              { label: 'Age', key: 'age_days', cls: 'r' }, { label: '% done', key: 'pct_complete', cls: 'r', fmt: (v) => v + '%' }, { label: 'NRR', key: 'nrr', cls: 'r', fmt: (v) => usd(n(v)) }, { label: 'MRR', key: 'mrr', cls: 'r', fmt: (v) => usd(n(v)) }],
            rows: (D, F) => active(base(D, F)).sort((a, b) => n(b.age_days) - n(a.age_days)) },
        ] },
      ] },
      { id: 'revenue', label: 'Revenue movement', slicers: ['lead', 'imp', 'cls'], blocks: [
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'New vs closed projects by month', note: 'Last 12 months.', h: 250, draw: (el, D, F) => {
            const r = base(D, F);
            S.bars(el, { data: past12.map((m) => ({ m, nw: r.filter((x) => mk(x.created) === m).length, cl: r.filter((x) => mk(x.closed) === m).length })), cat: 'm', values: true, yFmt: f0,
              catFmt: (m) => d3.utcFormat('%b %y')(S.parseDate(m)), series: [{ key: 'nw', label: 'New', color: '#1e3a8a' }, { key: 'cl', label: 'Closed', color: '#0ea5e9' }], label: 'New vs closed projects' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'NRR: new bookings vs closed', note: 'NRR of projects opened vs completed each month.', h: 230, draw: (el, D, F) => {
            const r = base(D, F);
            S.line(el, { data: past12.map((m) => ({ m, nw: sum(r.filter((x) => mk(x.created) === m), 'nrr'), cl: sum(r.filter((x) => mk(x.closed) === m), 'nrr') })), x: (d) => S.parseDate(d.m), yZero: true, yFmt: usdK,
              series: [{ key: 'nw', label: 'New', color: '#1e3a8a' }, { key: 'cl', label: 'Closed', color: '#0ea5e9' }], label: 'NRR new vs closed' });
          } },
          { type: 'card', span: 6, title: 'MRR: new vs closed', note: 'MRR from onboarding projects opened vs completed.', h: 230, draw: (el, D, F) => {
            const r = base(D, F);
            S.line(el, { data: past12.map((m) => ({ m, nw: sum(r.filter((x) => mk(x.created) === m), 'mrr'), cl: sum(r.filter((x) => mk(x.closed) === m), 'mrr') })), x: (d) => S.parseDate(d.m), yZero: true, yFmt: usdK,
              series: [{ key: 'nw', label: 'New', color: '#1e3a8a' }, { key: 'cl', label: 'Closed', color: '#0ea5e9' }], label: 'MRR new vs closed' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'Monthly NRR: delivered, this month and booked ahead', note: 'Past 12 months by completion month, this month, and the next months by each open project\'s current end date.', h: 260, draw: (el, D, F) => {
            const r = base(D, F); const ahead = Array.from({ length: 6 }, (_, i) => d3.utcFormat('%Y-%m-%d')(d3.utcMonth.offset(new Date(Date.UTC(2026, 10, 1)), i + 1)));
            const data = [...past12.map((m) => ({ m, past: sum(r.filter((x) => mk(x.closed) === m), 'nrr'), cur: 0, fut: 0 })),
              { m: CUR, past: 0, cur: sum(r.filter((x) => x.end_month === CUR || mk(x.closed) === CUR), 'nrr'), fut: 0 },
              ...ahead.map((m) => ({ m, past: 0, cur: 0, fut: sum(r.filter((x) => x.is_open === 'Yes' && x.end_month === m), 'nrr') }))];
            S.bars(el, { data, cat: 'm', stacked: true, values: true, yFmt: usdK, catFmt: (m) => d3.utcFormat('%b %y')(S.parseDate(m)),
              series: [{ key: 'past', label: 'Past 12 months', color: '#1e3a8a' }, { key: 'cur', label: 'Current month', color: '#0ea5e9' }, { key: 'fut', label: 'Next months', color: '#f97316' }], label: 'Monthly NRR performance' });
          } },
        ] },
      ] },
      { id: 'backlog', label: 'NRR backlog', slicers: ['lead', 'imp', 'cls'], blocks: [
        { type: 'kpis', items: [
          { label: 'Backlog NRR (active)', value: (D, F) => usdK(sum(active(base(D, F)), 'nrr')) },
          { label: 'Due this month', value: (D, F) => usdK(sum(active(base(D, F)).filter((r) => r.end_month === CUR), 'nrr')), sub: (D, F) => `${active(base(D, F)).filter((r) => r.end_month === CUR).length} projects` },
          { label: 'Completed this month', value: (D, F) => usdK(sum(base(D, F).filter((r) => mk(r.closed) === CUR), 'nrr')), tone: () => 'good', sub: (D, F) => `${base(D, F).filter((r) => mk(r.closed) === CUR).length} projects` },
          { label: 'Past end date', value: (D, F) => f0(active(base(D, F)).filter((r) => r.end_month < CUR).length), tone: () => 'bad', sub: () => 'still open after planned end' },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'Backlog burndown by planned end month', note: 'Active project NRR by the month each is due to finish.', h: 250, draw: (el, D, F) => {
            const a = active(base(D, F)); const ms = Array.from(new Set(a.map((r) => (r.end_month < CUR ? CUR : r.end_month)))).sort().slice(0, 6);
            S.waterfall(el, { data: ms.map((m) => ({ label: d3.utcFormat('%b %y')(S.parseDate(m)), value: sum(a.filter((r) => (r.end_month < CUR ? CUR : r.end_month) === m), 'nrr') })), fmt: usdK, color: '#0ea5e9', totalColor: '#1e3a8a', label: 'NRR burndown' });
          } },
          { type: 'card', span: 6, title: 'Backlog NRR by account level', note: 'Click a slice to filter.', h: 250, draw: (el, D, F) => {
            const a = active(base(D, F, 'cls')); const data = SDu.uniq(D.projects, 'classification').map((c) => ({ c, v: sum(a.filter((r) => r.classification === c), 'nrr') })).filter((d) => d.v > 0);
            S.donut(el, { data, labelKey: 'c', value: 'v', colors: data.map((d, i) => S.col(i)), centerLabel: 'backlog NRR', onPick: (d) => F.toggle('cls', d.c), label: 'Backlog by level' });
            el.querySelector('.sd-donut-v').textContent = usdK(d3.sum(data, (d) => d.v));
            el.querySelectorAll('.sd-dlegend b').forEach((b, i) => { b.textContent = `${usdK(data[i].v)} · ${d3.format('.0%')(data[i].v / d3.sum(data, (d) => d.v))}`; });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'Active portfolio by % complete', note: 'How far along active projects are.', h: 220, draw: (el, D, F) => {
            const a = active(base(D, F)); const B = [['0%', 0, 0], ['1–25%', 1, 25], ['26–50%', 26, 50], ['51–75%', 51, 75], ['76–99%', 76, 99], ['100%', 100, 100]];
            S.bars(el, { data: B.map(([l, x, y]) => ({ l, v: a.filter((r) => n(r.pct_complete) >= x && n(r.pct_complete) <= y).length })), cat: 'l', values: true, yFmt: f0, series: [{ key: 'v', label: 'Projects', color: '#1e3a8a' }], label: 'Projects by percent complete' });
          } },
        ] },
      ] },
      { id: 'budget', label: 'Budget & margin', slicers: ['lead', 'imp', 'cls', 'budget'], blocks: [
        { type: 'kpis', items: BUD.map((b) => ({ label: b, value: (D, F) => f0(active(base(D, F, 'budget')).filter((r) => r.budget_status === b).length), sub: () => 'active projects',
          tone: () => (b === 'Above Rate' ? 'good' : b === 'Over Budget' ? 'bad' : b === 'Under Value' ? 'warn' : null), pick: (F) => F.toggle('budget', b), picked: (F) => F.is('budget', b) }))
          .concat([{ label: 'Avg margin (active)', value: (D, F) => pct(d3.mean(active(base(D, F)).filter((r) => n(r.contracted_hrs) > 5), (r) => n(r.margin_pct)) || 0) }]) },
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Active project health', note: 'Click a slice to filter.', h: 240, draw: (el, D, F) => {
            const a = active(base(D, F, 'budget')); const data = BUD.map((b) => ({ b, v: a.filter((r) => r.budget_status === b).length })).filter((d) => d.v);
            S.donut(el, { data, labelKey: 'b', value: 'v', colors: data.map((d) => BCOL[d.b]), centerLabel: 'active', onPick: (d) => F.toggle('budget', d.b), label: 'Active projects by budget status' });
          } },
          { type: 'card', span: 7, title: 'Completed projects by budget status', note: 'All completed projects in the data. Click a bar to filter.', h: 200, draw: (el, D, F) => {
            const c = base(D, F, 'budget').filter((r) => r.is_open === 'No');
            S.hbars(el, { data: BUD.map((b) => ({ b, v: c.filter((r) => r.budget_status === b).length })), labelKey: 'b', value: 'v', fmt: f0, color: '#1e3a8a', highlight: (d) => d.b === 'Over Budget', onPick: (d) => F.toggle('budget', d.b), label: 'Completed by budget status' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Active NRR projects: contracted vs realized margin', note: 'Margin = 1 − worked ÷ contracted hours. Red under 0%, amber 0–20%, green over 20%.', maxH: 440,
            cols: [{ label: 'Project', key: 'project' }, { label: 'Account', key: 'account' }, { label: 'Type', key: 'imp_type' }, { label: 'Lead', key: 'lead' }, { label: 'Age', key: 'age_days', cls: 'r' },
              { label: 'NRR', key: 'nrr', cls: 'r', fmt: (v) => usd(n(v)) }, { label: 'Contracted hrs', key: 'contracted_hrs', cls: 'r' }, { label: 'Worked hrs', key: 'worked_hrs', cls: 'r', fmt: (v) => f0(n(v)) },
              { label: 'Margin %', key: 'margin_pct', cls: 'r', render: (td, r) => { const v = n(r.margin_pct); dot(td, v < 0 ? 'var(--color-bad)' : v < 20 ? 'var(--color-warn)' : 'var(--color-ok)', pct(v)); } },
              { label: 'Budget status', key: 'budget_status', render: (td, r) => dot(td, BCOL[r.budget_status], r.budget_status) }],
            rows: (D, F) => active(base(D, F)).filter((r) => n(r.nrr) > 0).sort((a, b) => n(a.margin_pct) - n(b.margin_pct)) },
        ] },
      ] },
      { id: 'impact', label: 'Impact', impact: true, blocks: [{ type: 'impact' }] },
    ],
    impactNote: 'Projects closed in the first 3 months of the data vs projects closed in the latest 3 months.',
    impactChart: { title: 'Share of closed projects over budget, by month', note: 'Projects completed each month that used more than 110% of contracted hours.', h: 240, draw: (el, D) => {
      const data = past12.slice(0, 12).map((m) => { const c = D.projects.filter((r) => mk(r.closed) === m); return { m, v: c.length ? (c.filter((r) => r.budget_status === 'Over Budget').length / c.length) * 100 : 0 }; });
      S.line(el, { data, x: (d) => S.parseDate(d.m), yZero: true, points: true, yFmt: (v) => d3.format('.0f')(v) + '%', annotate: { date: new Date(Date.UTC(2026, 1, 1)), text: 'Go-live' }, series: [{ key: 'v', label: 'Over budget', color: '#e5484d' }], label: 'Over-budget share by month' });
    } },
    impactMethod: 'Before = projects closed in the first 3 months of the data, after = projects closed in the latest 3 months. Over budget = worked hours above 110% of contracted. Red = in progress over 180 days. Reporting effort figures are estimates. Every figure here is sample data built for this prototype.',
  });
})();
