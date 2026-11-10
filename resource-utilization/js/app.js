(function () {
  const S = SD, n = S.n;
  const CATS = ['Managed Services', 'Revenue Project', 'COMPed', 'SG&A', 'Internal Projects', 'Sustained Engineering', 'Admin', 'Bench', 'PTO'];
  const WORK = CATS.slice(0, 6);
  const COL = { 'Managed Services': '#2f6fed', 'Revenue Project': '#1e3a8a', 'COMPed': '#14b8a6', 'SG&A': '#65a30d', 'Internal Projects': '#f59e0b',
    'Sustained Engineering': '#8b5cf6', 'Admin': '#64748b', 'Bench': '#e5484d', 'PTO': '#a16207' };
  const FLOOR = 80;
  const f0 = d3.format(',.0f'), f1 = d3.format(',.1f'), pct = (v) => d3.format('.0f')(v) + '%';

  let ctx;
  function prep(D) {
    D.res = Object.fromEntries(D.resources.map((r) => [r.resource, r]));
    D.plan = {};
    D.planned_mix.forEach((r) => { (D.plan[r.role] = D.plan[r.role] || {})[r.category] = n(r.planned_pct); });
    D.weeks = Array.from(new Set(D.weekly_hours.map((r) => r.week))).sort();
    D.byWeek = d3.group(D.weekly_hours, (r) => r.week);
    ctx = D;
  }
  const periodN = (F) => +(F.state.period || 4);
  const people = (F) => ctx.resources.filter((r) => F.ok(r, { dept: 'department', resource: 'resource' }));
  // Summarise a set of weeks for the people passing the slicers
  function summary(weeks, F, ppl) {
    ppl = ppl || people(F);
    const set = new Set(ppl.map((p) => p.resource));
    const per = {};
    ppl.forEach((p) => { per[p.resource] = { p, cat: Object.fromEntries(CATS.map((c) => [c, 0])) }; });
    weeks.forEach((w) => (ctx.byWeek.get(w) || []).forEach((r) => { if (set.has(r.resource)) per[r.resource].cat[r.category] += n(r.hours); }));
    const out = { n: ppl.length, weeks: weeks.length, cat: Object.fromEntries(CATS.map((c) => [c, 0])), planned: Object.fromEntries(WORK.map((c) => [c, 0])), avail: 0, target: 0, nontarget: 0, people: [] };
    Object.values(per).forEach(({ p, cat }) => {
      const plan = ctx.plan[p.role] || {};
      const avail = 40 * weeks.length - cat.PTO;
      let tgt = 0, nt = 0;
      WORK.forEach((c) => { if (plan[c]) tgt += cat[c]; else nt += cat[c]; out.planned[c] += (plan[c] || 0) / 100 * avail; });
      CATS.forEach((c) => { out.cat[c] += cat[c]; });
      out.avail += avail; out.target += tgt; out.nontarget += nt;
      const goal = n(p.weekly_target_hrs) * weeks.length;
      const mixNum = WORK.reduce((s, c) => s + Math.min(cat[c], (plan[c] || 0) / 100 * avail), 0);
      const mixDen = WORK.reduce((s, c) => s + (plan[c] || 0) / 100 * avail, 0);
      out.people.push({ resource: p.resource, department: p.department, role: p.role, avail, target: tgt, nontarget: nt, admin: cat.Admin, bench: cat.Bench, pto: cat.PTO,
        worked: tgt + nt, attain: goal ? (tgt / goal) * 100 : 0, mix: mixDen ? (mixNum / mixDen) * 100 : 0, cat, plan });
    });
    const mixNum = WORK.reduce((s, c) => s + Math.min(out.cat[c], out.planned[c]), 0);
    const mixDen = WORK.reduce((s, c) => s + out.planned[c], 0);
    out.mix = mixDen ? (mixNum / mixDen) * 100 : 0;
    out.share = out.avail ? (out.target / out.avail) * 100 : 0;
    out.goal = ppl.reduce((s, p) => s + n(p.weekly_target_hrs), 0) * weeks.length;
    out.attain = out.goal ? (out.target / out.goal) * 100 : 0;
    return out;
  }
  const cur = (F) => ctx.weeks.slice(-periodN(F));
  const prior = (F) => ctx.weeks.slice(-2 * periodN(F), -periodN(F));
  const perPerson = (s, v) => (s.n ? v / s.n : 0);
  const shareTone = (v) => (v >= 70 ? 'good' : v >= 55 ? 'warn' : 'bad');
  const memo = new Map();
  const sumCur = (F) => { const k = 'c' + JSON.stringify(F.state); if (!memo.has(k)) memo.set(k, summary(cur(F), F)); return memo.get(k); };
  const periodLabel = (F) => ({ 1: 'last week', 4: 'last 4 weeks', 13: 'last 13 weeks', 26: 'last 26 weeks' }[periodN(F)]);
  const trend = (F) => ctx.weeks.slice(-13).map((w) => { const s = summary([w], F); return { week: w, share: s.share, mix: s.mix, floor: FLOOR,
    t: s.avail ? (s.target / s.avail) * 100 : 0, nt: s.avail ? (s.nontarget / s.avail) * 100 : 0, ad: s.avail ? (s.cat.Admin / s.avail) * 100 : 0, be: s.avail ? (s.cat.Bench / s.avail) * 100 : 0 }; });

  App({
    title: 'Resource Utilization',
    eyebrow: 'Managed services · Time accounting',
    sub: 'Where every available hour goes, for each person and team: target work, non-target work, admin and bench against an 80% target-share floor.',
    files: { resources: 'data/resources.csv', planned_mix: 'data/planned_mix.csv', weekly_hours: 'data/weekly_hours.csv', impact: 'data/impact.csv' },
    prep,
    slicers: [
      { key: 'period', label: 'Period', all: 'Last 4 weeks', options: [{ value: '1', label: 'Last week' }, { value: '13', label: 'Last 13 weeks' }, { value: '26', label: 'Last 26 weeks' }] },
      { key: 'dept', label: 'Department', all: 'All departments', options: (D) => SDu.uniq(D.resources, 'department') },
      { key: 'resource', label: 'Resource', all: 'All resources', options: (D) => SDu.uniq(D.resources, 'resource') },
    ],
    pages: [
      { id: 'individual', label: 'Individual view', slicers: ['period', 'dept', 'resource'], blocks: [
        { type: 'text', html: (D, F) => { const s = sumCur(F); return `Over the <b>${periodLabel(F)}</b>, <b>${pct(s.share)}</b> of available hours went to target work, against an ${FLOOR}% floor. Bench averaged <b>${f1(perPerson(s, s.cat.Bench) / s.weeks)}</b> hours per person-week and mix alignment is <b>${pct(s.mix)}</b>.`; } },
        { type: 'kpis', items: [
          { label: 'Available hrs / person', value: (D, F) => f0(perPerson(sumCur(F), sumCur(F).avail)), sub: (D, F) => `${periodLabel(F)} · PTO excluded` },
          { label: 'Target work hrs / person', value: (D, F) => f0(perPerson(sumCur(F), sumCur(F).target)), sub: (D, F) => `of ${f0(perPerson(sumCur(F), sumCur(F).goal))} goal · ${pct(sumCur(F).attain)}`, tone: (D, F) => shareTone(sumCur(F).attain) },
          { label: 'Target share', value: (D, F) => pct(sumCur(F).share), sub: () => `floor ${FLOOR}%`, tone: (D, F) => shareTone(sumCur(F).share) },
          { label: 'Admin hrs / person', value: (D, F) => f1(perPerson(sumCur(F), sumCur(F).cat.Admin)), sub: (D, F) => `${pct((sumCur(F).cat.Admin / sumCur(F).avail) * 100)} of available` },
          { label: 'Bench hrs / person', value: (D, F) => f1(perPerson(sumCur(F), sumCur(F).cat.Bench)), sub: (D, F) => `${pct((sumCur(F).cat.Bench / sumCur(F).avail) * 100)} of available`, tone: (D, F) => (sumCur(F).cat.Bench / sumCur(F).avail > 0.15 ? 'bad' : null) },
          { label: 'Mix alignment', value: (D, F) => pct(sumCur(F).mix), sub: () => 'actual vs planned role mix', tone: (D, F) => shareTone(sumCur(F).mix) },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 7, title: 'Where the time went', note: 'Average hours per person per week, by category. Bench is outlined.', h: 190, draw: (el, D, F) => {
            const s1 = sumCur(F), s0 = summary(prior(F), F), s13 = summary(ctx.weeks.slice(-13), F);
            const mk = (label, s) => Object.assign({ label }, Object.fromEntries(CATS.map((c) => [c, s.n && s.weeks ? s.cat[c] / s.n / s.weeks : 0])));
            S.hstack(el, { rows: [mk('This period', s1), mk('Prior period', s0), mk('13-week avg', s13)], fmt: (v) => d3.format('.0f')(v),
              series: CATS.map((c) => ({ key: c, label: c, color: COL[c], outline: c === 'Bench' })), label: 'Hours per person-week by category' });
          } },
          { type: 'card', span: 5, title: '13-week trend', note: 'Target share and mix alignment by week, against the 80% floor.', h: 230, draw: (el, D, F) => {
            S.line(el, { data: trend(F), x: (r) => S.parseDate(r.week), xFmt: S.fmtDay, tipFmt: (d) => 'Week of ' + S.fmtDay(d), yFmt: (v) => d3.format('.0f')(v) + '%', label: 'Weekly target share and mix alignment',
              series: [{ key: 'mix', label: 'Mix alignment', color: '#65a30d' }, { key: 'share', label: 'Target share', color: '#2f6fed' }, { key: 'floor', label: '80% floor', color: 'var(--cds-chart-reference)' }] });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 7, title: 'Lowest target hours: coaching starts here', note: 'The 15 people with the fewest target hours per week. Click a bar to focus on that person.', h: 360, draw: (el, D, F) => {
            const s = sumCur(F);
            const rows = s.people.slice().sort((a, b) => a.target - b.target).slice(0, 15).map((p) => ({ label: p.resource, t: p.target / s.weeks, nt: p.nontarget / s.weeks, ad: p.admin / s.weeks, be: p.bench / s.weeks }));
            S.hstack(el, { rows, rowH: 24, fmt: (v) => d3.format('.0f')(v), onPick: (r) => F.toggle('resource', r.label),
              series: [{ key: 't', label: 'Target work', color: '#1e3a8a' }, { key: 'nt', label: 'Non-target work', color: '#f59e0b' }, { key: 'ad', label: 'Admin', color: '#64748b' }, { key: 'be', label: 'Bench', color: '#e5484d', outline: true }] });
          } },
          { type: 'card', span: 5, title: 'Target mix: planned vs actual', note: 'Work categories only, hours per person per week.', h: 300, draw: (el, D, F) => {
            const s = sumCur(F); const k = s.n * s.weeks || 1;
            S.bars(el, { data: WORK.map((c) => ({ cat: c, planned: s.planned[c] / k, actual: s.cat[c] / k })), cat: 'cat', values: true, yFmt: (v) => d3.format('.0f')(v),
              catFmt: (c) => c.replace('Sustained Engineering', 'Sustained Eng').replace('Internal Projects', 'Internal').replace('Managed Services', 'Managed Svcs').replace('Revenue Project', 'Revenue Proj'),
              series: [{ key: 'planned', label: 'Planned', color: 'var(--cds-chart-muted)' }, { key: 'actual', label: 'Actual', color: '#1e3a8a' }], label: 'Planned vs actual hours by category' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Resource by category', note: 'Target % and actual % each add up to 100% per person. Red actual % is more than 10 points under target.', maxH: 380,
            cols: [{ label: 'Resource', key: 'resource' }, { label: 'Department', key: 'department' }, { label: 'Role', key: 'role' }, { label: 'Category', key: 'category' },
              { label: 'Target hrs', key: 'thrs', cls: 'r', fmt: f0 }, { label: 'Actual hrs', key: 'ahrs', cls: 'r', fmt: f0 }, { label: 'Target %', key: 'tp', cls: 'r', fmt: pct },
              { label: 'Actual %', key: 'ap', cls: 'r', render: (td, r) => { td.textContent = pct(r.ap); if (r.tp - r.ap > 10) { td.style.color = 'var(--color-bad)'; td.style.fontWeight = '600'; } else if (r.ap > r.tp && r.tp > 0) td.style.color = 'var(--color-ok)'; } }],
            rows: (D, F) => { const s = sumCur(F); const out = []; s.people.forEach((p) => { const tot = CATS.reduce((a, c) => a + p.cat[c], 0) || 1; CATS.filter((c) => c !== 'PTO').forEach((c) => {
              const t = (p.plan[c] || 0); out.push({ resource: p.resource, department: p.department, role: p.role, category: c, thrs: t / 100 * p.avail, ahrs: p.cat[c], tp: t, ap: (p.cat[c] / tot) * 100 }); }); });
              return out.sort((a, b) => a.resource.localeCompare(b.resource)); } },
        ] },
      ] },
      { id: 'team', label: 'Team view', slicers: ['period', 'dept'], blocks: [
        { type: 'kpis', items: [
          { label: 'Team target share', value: (D, F) => pct(sumCur(F).share), sub: (D, F) => `${f0(sumCur(F).target)} of ${f0(sumCur(F).avail)} available hrs`, tone: (D, F) => shareTone(sumCur(F).share) },
          { label: 'Target attainment', value: (D, F) => pct(sumCur(F).attain), sub: (D, F) => `${f0(sumCur(F).target)} of ${f0(sumCur(F).goal)} target hrs`, tone: (D, F) => shareTone(sumCur(F).attain) },
          { label: 'Bench hrs / person-week', value: (D, F) => { const s = sumCur(F); return f1(s.cat.Bench / s.n / s.weeks); }, sub: (D, F) => `${pct((sumCur(F).cat.Bench / sumCur(F).avail) * 100)} of available`, tone: (D, F) => (sumCur(F).cat.Bench / sumCur(F).avail > 0.15 ? 'bad' : 'good') },
          { label: 'Admin share', value: (D, F) => pct((sumCur(F).cat.Admin / sumCur(F).avail) * 100), sub: () => 'allowance 20%', tone: (D, F) => (sumCur(F).cat.Admin / sumCur(F).avail > 0.2 ? 'bad' : 'good') },
          { label: 'Mix alignment', value: (D, F) => pct(sumCur(F).mix), sub: () => 'hours-weighted across the team', tone: (D, F) => shareTone(sumCur(F).mix) },
          { label: 'On or above target', value: (D, F) => { const s = sumCur(F); return `${s.people.filter((p) => p.attain >= 100).length} of ${s.n}`; }, sub: (D, F) => { const s = sumCur(F); return `${s.people.filter((p) => p.attain >= 110).length} exceed · ${s.people.filter((p) => p.attain < 100).length} missed`; } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Team hours by work area', note: 'Total hours in the period.', h: 260, draw: (el, D, F) => {
            const s = sumCur(F); S.hbars(el, { data: CATS.map((c) => ({ c, v: s.cat[c] })), labelKey: 'c', value: 'v', fmt: S.fmtK, color: '#2f6fed', label: 'Hours by work area' });
          } },
          { type: 'card', span: 7, title: '13-week hours distribution', note: 'Share of available hours by week, PTO excluded.', h: 260, draw: (el, D, F) => {
            S.line(el, { data: trend(F), x: (r) => S.parseDate(r.week), xFmt: S.fmtDay, tipFmt: (d) => 'Week of ' + S.fmtDay(d), yFmt: (v) => d3.format('.0f')(v) + '%', yZero: true, label: 'Weekly share of hours',
              series: [{ key: 't', label: 'Target work', color: '#1e3a8a' }, { key: 'nt', label: 'Non-target work', color: '#f59e0b' }, { key: 'ad', label: 'Admin', color: '#64748b' }, { key: 'be', label: 'Bench', color: '#e5484d' }] });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'Hours by department', note: 'Average hours per person-week, split by how the time was spent. Click a bar to filter to that department.', h: 280, draw: (el, D, F) => {
            const s = sumCur(F); const by = d3.group(s.people, (p) => p.department);
            const data = Array.from(by, ([d, ps]) => { const k = ps.length * s.weeks; return { dept: d, t: d3.sum(ps, (p) => p.target) / k, nt: d3.sum(ps, (p) => p.nontarget) / k, ad: d3.sum(ps, (p) => p.admin) / k, be: d3.sum(ps, (p) => p.bench) / k, pto: d3.sum(ps, (p) => p.pto) / k }; }).sort((a, b) => b.t - a.t);
            S.bars(el, { data, cat: 'dept', stacked: true, values: true, yFmt: (v) => d3.format('.0f')(v), onPick: (d) => F.toggle('dept', d.dept), label: 'Hours per person-week by department',
              catFmt: (c) => c.replace(' Engineering', ' Eng').replace('Professional Services', 'Prof Services').replace('Security Operations', 'Security Ops').replace('Business Continuity', 'Bus Continuity').replace('Project Management', 'Project Mgmt'),
              series: [{ key: 't', label: 'Target work', color: '#1e3a8a' }, { key: 'nt', label: 'Non-target work', color: '#f59e0b' }, { key: 'ad', label: 'Admin', color: '#64748b' }, { key: 'be', label: 'Bench', color: '#e5484d' }, { key: 'pto', label: 'PTO', color: '#a16207' }] });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Team roster', note: 'One row per person for the period. Click a row to open them in the Individual view.', maxH: 420,
            onRow: (r, F) => { F.state.resource = r.resource; F.go('individual'); },
            cols: [{ label: 'Resource', key: 'resource' }, { label: 'Department', key: 'department' }, { label: 'Target hrs', key: 'target', cls: 'r', fmt: f1 }, { label: 'Non-target hrs', key: 'nontarget', cls: 'r', fmt: f1 },
              { label: 'Admin hrs', key: 'admin', cls: 'r', fmt: f1 }, { label: 'Bench hrs', key: 'bench', cls: 'r', fmt: f1 }, { label: 'Worked hrs', key: 'worked', cls: 'r', fmt: f1 }, { label: 'Mix alignment', key: 'mix', cls: 'r', fmt: pct },
              { label: 'Attainment', key: 'attain', cls: 'r', fmt: pct },
              { label: 'Status', key: 'attain', render: (td, r) => { const d = document.createElement('span'); d.className = 'sd-dot'; const st = r.attain >= 110 ? ['Exceeds target', 'var(--color-ok)'] : r.attain >= 100 ? ['On target', 'var(--color-ok)'] : r.attain >= 80 ? ['Near target', 'var(--color-warn)'] : ['Missed target', 'var(--color-bad)']; d.style.background = st[1]; td.append(d, document.createTextNode(st[0])); } }],
            rows: (D, F) => sumCur(F).people.sort((a, b) => a.attain - b.attain) },
        ] },
      ] },
      { id: 'impact', label: 'Impact', impact: true, blocks: [{ type: 'impact' }] },
    ],
    impactNote: 'First 13 weeks of the data vs the latest 13 weeks, all people.',
    impactChart: { title: 'Target share and bench, week by week', note: 'All people, last 26 weeks.', h: 240, draw: (el, D) => {
      const F0 = { state: {}, ok: () => true };
      const data = D.weeks.map((w) => { const s = summary([w], F0, D.resources); return { week: w, share: s.share, bench: (s.cat.Bench / s.avail) * 100 }; });
      S.line(el, { data, x: (r) => S.parseDate(r.week), xFmt: S.fmtDay, tipFmt: (d) => 'Week of ' + S.fmtDay(d), yZero: true, yFmt: (v) => d3.format('.0f')(v) + '%', label: 'Weekly target share and bench share',
        series: [{ key: 'share', label: 'Target share', color: 'var(--color-ok)' }, { key: 'bench', label: 'Bench share', color: '#e5484d' }] });
    } },
    impactMethod: 'Before = the first 13 weeks in the data, after = the latest 13 weeks. Target share = hours in a role\'s planned work categories ÷ available hours (40 per week minus PTO). Recovered hours = rise in target hours per week between the two windows. Reporting effort figures are estimates. Every figure here is sample data built for this prototype.',
  });
})();
