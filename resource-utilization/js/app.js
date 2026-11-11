(function () {
  const S = SD, n = S.n;
  const CATS = ['Managed Services', 'Revenue Project', 'COMPed', 'SG&A', 'Internal Projects', 'Sustained Engineering', 'Admin', 'Bench', 'PTO'];
  const WORK = CATS.slice(0, 6);
  const COL = { 'Managed Services': '#0a84d6', 'Revenue Project': '#0b3b63', 'COMPed': '#14b8a6', 'SG&A': '#65a30d', 'Internal Projects': '#f08a0c',
    'Sustained Engineering': '#8b5cf6', 'Admin': '#7c8796', 'Bench': '#d14343', 'PTO': '#c9ced6' };
  const G = { t: '#0b3b63', nt: '#f08a0c', ad: '#7c8796', be: '#d14343', pto: '#c9ced6' };
  const FLOOR = 80;
  const f0 = d3.format(',.0f'), f1 = d3.format(',.1f'), pct = (v) => d3.format('.0f')(v) + '%', pct1 = (v) => d3.format('.1f')(v) + '%';
  const NOUN = { WTD: 'week', MTD: 'month', QTD: 'quarter', YTD: 'year' };
  let ctx;

  function prep(D) {
    D.weekly_hours.forEach((r) => CATS.forEach((c) => { r[c] = +r[c]; }));
    D.plan = {};
    D.planned_mix.forEach((r) => { (D.plan[r.role] = D.plan[r.role] || {})[r.category] = n(r.planned_pct); });
    D.weeks = Array.from(new Set(D.weekly_hours.map((r) => r.week))).sort();
    D.byWeek = d3.group(D.weekly_hours, (r) => r.week);
    ctx = D;
  }

  // ---------- periods ----------
  const qKey = (w) => w.slice(0, 4) + '-Q' + Math.ceil(+w.slice(5, 7) / 3);
  const groups = (keyFn) => Array.from(d3.group(ctx.weeks, keyFn), ([k, ws]) => ({ k, ws }));
  const fmtM = (k) => d3.utcFormat('%b %y')(S.parseDate(k + '-01'));
  const P = {};
  function period(F) {
    const p = F.state.period || 'WTD';
    if (P[p]) return P[p];
    const W = ctx.weeks;
    let out;
    if (p === 'WTD') {
      out = { cur: [W.at(-1)], prior: [W.at(-2)], avg: W.slice(-4).map((w) => [w]), labels: ['This week', 'Prior week', '4-week average'],
        trend: W.slice(-13).map((w) => ({ label: S.fmtDay(S.parseDate(w)), date: S.parseDate(w), ws: [w] })), trendTitle: '13-week trend', curLabel: 'week of ' + S.fmtDay(S.parseDate(W.at(-1))) };
    } else if (p === 'MTD') {
      const g = groups((w) => w.slice(0, 7));
      out = { cur: g.at(-1).ws, prior: g.at(-2).ws, avg: g.slice(-3).map((x) => x.ws), labels: ['This month', 'Last month', '3-month average'],
        trend: g.slice(-6).map((x) => ({ label: fmtM(x.k), date: S.parseDate(x.k + '-01'), ws: x.ws })), trendTitle: '6-month trend', curLabel: d3.utcFormat('%B %Y')(S.parseDate(g.at(-1).k + '-01')) };
    } else if (p === 'QTD') {
      const g = groups(qKey);
      out = { cur: g.at(-1).ws, prior: g.at(-2).ws, avg: g.slice(-3).map((x) => x.ws), labels: ['This quarter', 'Last quarter', '3-quarter average'],
        trend: g.slice(-4).map((x) => ({ label: x.k.replace('-', ' '), date: S.parseDate(x.ws[0]), ws: x.ws })), trendTitle: '4-quarter trend', curLabel: g.at(-1).k.replace('-', ' ') };
    } else {
      const g = groups((w) => w.slice(0, 4)); const m = groups((w) => w.slice(0, 7));
      out = { cur: g.at(-1).ws, prior: W.slice(-52), avg: [g.at(-1).ws], labels: ['This year (YTD)', 'Last 12 months', ''],
        trend: m.slice(-13).map((x) => ({ label: fmtM(x.k), date: S.parseDate(x.k + '-01'), ws: x.ws })), trendTitle: '13-month trend', curLabel: g.at(-1).k + ' to date' };
    }
    out.p = p; out.noun = NOUN[p];
    P[p] = out;
    return out;
  }

  // ---------- summary of a set of weeks for a set of people ----------
  const memo = new Map();
  function summary(weeks, ppl) {
    const key = weeks[0] + weeks.length + '|' + ppl.length + '|' + (ppl[0] || {}).resource + (ppl.at(-1) || {}).resource;
    if (memo.has(key)) return memo.get(key);
    const per = new Map(ppl.map((p) => [p.resource, { p, cat: Object.fromEntries(CATS.map((c) => [c, 0])), over: 0 }]));
    weeks.forEach((w) => (ctx.byWeek.get(w) || []).forEach((r) => {
      const x = per.get(r.resource); if (!x) return;
      let tot = 0; CATS.forEach((c) => { x.cat[c] += r[c]; tot += r[c]; });
      x.over += Math.max(0, tot - 40);
    }));
    const out = { n: ppl.length, weeks: weeks.length, cat: Object.fromEntries(CATS.map((c) => [c, 0])), planned: Object.fromEntries(CATS.map((c) => [c, 0])),
      inT: Object.fromEntries(CATS.map((c) => [c, 0])), outT: Object.fromEntries(CATS.map((c) => [c, 0])), avail: 0, target: 0, nontarget: 0, over: 0, people: [] };
    let mixNum = 0, mixDen = 0;
    per.forEach(({ p, cat, over }) => {
      const plan = ctx.plan[p.role] || {};
      const avail = 40 * weeks.length - cat.PTO;
      let tgt = 0, nt = 0, mn = 0, md = 0;
      WORK.forEach((c) => { const pl = ((plan[c] || 0) / 100) * avail; out.planned[c] += pl; if (plan[c]) { tgt += cat[c]; out.inT[c] += cat[c]; } else { nt += cat[c]; out.outT[c] += cat[c]; } mn += Math.min(cat[c], pl); md += pl; });
      ['Admin', 'Bench', 'PTO'].forEach((c) => { out.outT[c] += cat[c]; });
      CATS.forEach((c) => { out.cat[c] += cat[c]; });
      out.avail += avail; out.target += tgt; out.nontarget += nt; out.over += over; mixNum += mn; mixDen += md;
      const goal = avail * FLOOR / 100;
      out.people.push({ resource: p.resource, department: p.department, role: p.role, avail, target: tgt, nontarget: nt, admin: cat.Admin, bench: cat.Bench, pto: cat.PTO,
        worked: tgt + nt, goal, attain: goal ? (tgt / goal) * 100 : 0, share: avail ? (tgt / avail) * 100 : 0, mix: md ? (mn / md) * 100 : 0, cat, plan });
    });
    out.mix = mixDen ? (mixNum / mixDen) * 100 : 0;
    out.share = out.avail ? (out.target / out.avail) * 100 : 0;
    out.goal = out.avail * FLOOR / 100;
    out.attain = out.goal ? (out.target / out.goal) * 100 : 0;
    out.pp = (v) => (out.n ? v / out.n : 0);
    out.pa = (v) => (out.avail ? (v / out.avail) * 100 : 0);
    memo.set(key, out);
    return out;
  }
  const people = (F, all) => ctx.resources.filter((r) => all || F.ok(r, { dept: 'department', resource: 'resource' }));
  const teamPeople = (F) => ctx.resources.filter((r) => F.ok(r, { dept: 'department' }));
  const cur = (F, ppl) => summary(period(F).cur, ppl || people(F));
  const tone = (v) => (v >= FLOOR ? 'good' : v >= 60 ? 'warn' : 'bad');
  const isYTD = (D, F) => (F.state.period || 'WTD') === 'YTD';
  const notYTD = (D, F) => !isYTD(D, F);

  // ---------- shared drawings ----------
  const catRow = (label, s) => Object.assign({ label }, Object.fromEntries(CATS.map((c) => [c, s.pp(s.cat[c])])));
  function whereWent(el, F, ppl, single) {
    const pd = period(F);
    const rows = [catRow(pd.labels[0], summary(pd.cur, ppl))];
    if (!single) {
      rows.push(catRow(pd.labels[1], summary(pd.prior, ppl)));
      const avg = pd.avg.map((ws) => summary(ws, ppl));
      rows.push(Object.assign({ label: pd.labels[2] }, Object.fromEntries(CATS.map((c) => [c, d3.mean(avg, (s) => s.pp(s.cat[c]))]))));
    }
    S.hstack(el, { rows, fmt: (v) => d3.format(',.0f')(v), series: CATS.map((c) => ({ key: c, label: c, color: COL[c], outline: c === 'Bench' })), label: 'Hours per person by category' });
  }
  const xf = (pd, data) => (pd.p === 'WTD' ? S.fmtDay : pd.p === 'QTD' ? (d) => (data.find((x) => +x.date === +d) || {}).label || '' : S.fmtMonth);
  function trendShareMix(el, F, ppl) {
    const pd = period(F);
    const data = pd.trend.map((t) => { const s = summary(t.ws, ppl); return { date: t.date, label: t.label, share: s.share, mix: s.mix, floor: FLOOR }; });
    S.line(el, { data, x: (r) => r.date, xFmt: xf(pd, data), tipFmt: (d) => (data.find((x) => +x.date === +d) || {}).label || '', yFmt: (v) => d3.format('.0f')(v) + '%', points: data.length <= 13, label: 'Target share and mix alignment',
      series: [{ key: 'mix', label: 'Mix alignment', color: '#65a30d' }, { key: 'share', label: 'Target share', color: '#0a84d6' }, { key: 'floor', label: '80% floor', color: 'var(--cds-chart-reference)' }] });
  }
  function trendDist(el, F, ppl) {
    const pd = period(F);
    const data = pd.trend.map((t) => { const s = summary(t.ws, ppl); return { date: t.date, label: t.label, t: s.pa(s.target), nt: s.pa(s.nontarget), ad: s.pa(s.cat.Admin), be: s.pa(s.cat.Bench) }; });
    S.line(el, { data, x: (r) => r.date, xFmt: xf(pd, data), tipFmt: (d) => (data.find((x) => +x.date === +d) || {}).label || '', yZero: true, yFmt: (v) => d3.format('.0f')(v) + '%', label: 'Share of available hours',
      series: [{ key: 't', label: 'Target work', color: G.t }, { key: 'nt', label: 'Non-target work', color: G.nt }, { key: 'ad', label: 'Admin', color: G.ad }, { key: 'be', label: 'Bench', color: G.be }] });
  }
  function perPersonBars(el, F, s, withPto) {
    el.replaceChildren(); el.classList.add('sd-xscroll');
    const inner = document.createElement('div'); inner.style.position = 'relative';
    const rows = s.people.slice().sort((a, b) => a.target - b.target);
    inner.style.width = Math.max(el.clientWidth || 600, rows.length * 22 + 60) + 'px';
    el.append(inner);
    const series = [{ key: 'target', label: 'Target work', color: G.t }, { key: 'nontarget', label: 'Non-target work', color: G.nt }, { key: 'admin', label: 'Admin', color: G.ad }, { key: 'bench', label: 'Bench', color: G.be }];
    if (withPto) series.push({ key: 'pto', label: 'PTO', color: G.pto });
    const goal = d3.mean(rows, (r) => r.goal) || 0;
    S.bars(inner, { data: rows, cat: 'resource', stacked: true, rotate: true, height: 340, yFmt: f0, series, onPick: (d) => F.toggle('resource', d.resource),
      refLines: [{ value: goal, label: `80% target: ${f0(goal)}`, color: 'var(--color-fg)' }], label: 'Hours by resource' });
  }
  function targetMix(el, F, s) {
    const k = s.n || 1;
    S.bars(el, { data: CATS.map((c) => ({ c, pl: s.planned[c] / k, inT: s.inT[c] / k, outT: s.outT[c] / k })), cat: 'c', values: true, yFmt: (v) => d3.format(',.0f')(v), height: 270,
      catFmt: (c) => c.replace('Sustained Engineering', 'Sustained Eng').replace('Internal Projects', 'Internal').replace('Managed Services', 'Managed Svcs').replace('Revenue Project', 'Revenue Proj'),
      series: [{ key: 'pl', label: 'Planned (role mix)', color: '#c9ced6' }, { key: 'inT', label: 'Actual, in target', color: G.t }, { key: 'outT', label: 'Actual, out of target', color: G.be }], label: 'Planned vs actual hours by category' });
  }
  const dot = (td, color, txt) => { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = color; td.append(d, document.createTextNode(txt)); };
  const status = (td, r) => { const st = r.attain >= 110 ? ['Exceeds target', 'var(--color-ok)'] : r.attain >= 100 ? ['On target', 'var(--color-ok)'] : r.attain >= 80 ? ['Near target', 'var(--color-warn)'] : ['Missed target', 'var(--color-bad)']; dot(td, st[1], st[0]); };
  const benchCell = (td, r) => { td.textContent = f1(r.bench); if (r.avail && r.bench / r.avail > 0.15) td.style.color = 'var(--color-bad)'; };

  // ---------- page blocks ----------
  const indKpis = { type: 'kpis', when: notYTD, items: [
    { label: 'Available hours', value: (D, F) => f0(cur(F).pp(cur(F).avail)), sub: (D, F) => `per person · ${period(F).curLabel}` },
    { label: 'Target work hours', value: (D, F) => f0(cur(F).pp(cur(F).target)), sub: (D, F) => `of ${f0(cur(F).pp(cur(F).goal))} target · ${pct(cur(F).attain)}`, tone: (D, F) => tone(cur(F).attain * 0.8) },
    { label: (D, F) => `Target share of ${period(F).noun}`, value: (D, F) => pct(cur(F).share), sub: (D, F) => `of the ${f0(cur(F).pp(cur(F).avail))}-hr ${period(F).noun} · floor 80%`, tone: (D, F) => tone(cur(F).share) },
    { label: 'Admin hours', value: (D, F) => f1(cur(F).pp(cur(F).cat.Admin)), sub: (D, F) => `${pct(cur(F).pa(cur(F).cat.Admin))} of ${period(F).noun} · allowance 20%`, tone: (D, F) => (cur(F).pa(cur(F).cat.Admin) <= 20 ? 'good' : 'bad') },
    { label: 'Bench hours', value: (D, F) => f1(cur(F).pp(cur(F).cat.Bench)), sub: (D, F) => `${pct(cur(F).pa(cur(F).cat.Bench))} of ${period(F).noun}`, tone: (D, F) => (cur(F).pa(cur(F).cat.Bench) > 15 ? 'bad' : 'warn') },
    { label: 'Overage', value: (D, F) => pct1(cur(F).pa(cur(F).over)), sub: () => 'hours past 40 a week' },
    { label: 'Mix alignment', value: (D, F) => pct(cur(F).mix), sub: () => 'vs planned hours · 80% floor', tone: (D, F) => tone(cur(F).mix) },
  ] };
  const ytdGrid = { type: 'kpis', when: isYTD, items: [{ label: 'Total available hrs', value: (D, F) => f0(cur(F).pp(cur(F).avail)), sub: () => 'per person, year to date' }]
    .concat(CATS.map((c) => ({ label: c, value: (D, F) => f0(cur(F).pp(cur(F).cat[c])), sub: (D, F) => pct(cur(F).pa(cur(F).cat[c])) + ' of available' }))) };
  const ytdKpis = { type: 'kpis', when: isYTD, items: [
    { label: 'Target work hrs', value: (D, F) => f0(cur(F).pp(cur(F).target)), sub: (D, F) => `of ${f0(cur(F).pp(cur(F).goal))} target`, tone: (D, F) => tone(cur(F).attain * 0.8) },
    { label: 'Target share', value: (D, F) => pct(cur(F).share), tone: (D, F) => tone(cur(F).share), sub: () => 'floor 80%' },
    { label: 'Bench hrs', value: (D, F) => f0(cur(F).pp(cur(F).cat.Bench)), tone: () => 'bad', sub: (D, F) => pct(cur(F).pa(cur(F).cat.Bench)) + ' of available' },
    { label: 'Mix alignment', value: (D, F) => pct(cur(F).mix), tone: (D, F) => tone(cur(F).mix) },
  ] };
  const T = (F) => cur(F, teamPeople(F));
  const teamKpis = { type: 'kpis', when: notYTD, items: [
    { label: 'Team target share', value: (D, F) => pct(T(F).share), sub: (D, F) => `${f0(T(F).target)} of ${f0(T(F).avail)} available hrs · target 80%`, tone: (D, F) => tone(T(F).share) },
    { label: 'Target attainment', value: (D, F) => pct(T(F).attain), sub: (D, F) => `${f0(T(F).target)} of ${f0(T(F).goal)} target hrs`, tone: (D, F) => tone(T(F).attain * 0.8) },
    { label: 'Bench', value: (D, F) => f0(T(F).pp(T(F).cat.Bench)), sub: (D, F) => `hrs/person · ${pct1(T(F).pa(T(F).cat.Bench))} of available · ${T(F).people.filter((p) => p.bench > 0.5).length} of ${T(F).n} people`, tone: () => 'bad' },
    { label: 'Admin share', value: (D, F) => pct1(T(F).pa(T(F).cat.Admin)), sub: (D, F) => `${f0(T(F).cat.Admin)} hrs · allowance ${f0(T(F).avail * 0.2)} (20%)`, tone: (D, F) => (T(F).pa(T(F).cat.Admin) <= 20 ? 'good' : 'bad') },
    { label: 'Mix alignment', value: (D, F) => pct(T(F).mix), sub: () => 'hours-weighted across the team', tone: (D, F) => tone(T(F).mix) },
    { label: 'On or above target', value: (D, F) => `${T(F).people.filter((p) => p.attain >= 100).length} of ${T(F).n}`, sub: (D, F) => `${T(F).people.filter((p) => p.attain >= 110).length} exceed · ${T(F).people.filter((p) => p.attain < 100).length} missed` },
  ] };
  const tv = (s, k) => (k in s.cat ? s.cat[k] : s[k]);
  const teamYtdKpis = { type: 'kpis', when: isYTD, items: [['Available', 'avail', null], ['Target work', 'target', 'good'], ['Non-target work', 'nontarget', 'warn'], ['Admin', 'Admin', null], ['Bench', 'Bench', 'bad'], ['PTO', 'PTO', null]].map(([l, k, t]) => ({
    label: l, value: (D, F) => f0(T(F).pp(tv(T(F), k))) + ' hrs', tone: () => t,
    sub: (D, F) => (k === 'avail' ? 'avg per person' : `avg per person · ${pct(T(F).pa(tv(T(F), k)))} of available`) })) };

  App({
    story: {"headline": "Nobody could see where 111 people's working hours actually went, or whether that time matched what each role was hired to do.", "sub": "Time was logged in the PSA, but turning it into a utilization view meant every team lead building their own spreadsheet each week. By the time anyone saw a problem, the quarter was over.", "who": "Team leads, department heads and operations leadership", "problem": [["Hours spent on reporting, not managing", "Team leads spent about 14 hours a week between them exporting time entries and building utilization sheets by hand."], ["No shared definition of 'utilized'", "Each team counted billable, admin and bench time differently, so numbers from two teams could never be compared."], ["Problems found a quarter late", "Under-target engineers and growing bench time were only spotted in quarterly reviews, about 30 days after the fact at best."], ["No link to role plans", "Nobody could tell if a Technician was doing Technician work, or just staying busy on things outside their plan."]], "built": [["One live view for every person and team", "Individual and Team views with week, month, quarter and year-to-date, refreshed from PSA time data."], ["A single set of rules", "40-hour weeks minus PTO, an 80% target-share floor, a 20% admin allowance and a planned work mix for every role."], ["Coaching lists built in", "People are sorted lowest target work first, with bench and off-plan time shown in color, so leads know who to talk to this week."], ["Mix alignment", "Shows whether target work went to the right work areas, not just whether people were busy."]], "pages": [["individual", "Individual view", "One person or the average person: where the hours went and how close they are to target."], ["team", "Team view", "A department as a group: target share, bench, the roster and who needs help."], ["impact", "★ Impact", "Before vs after go-live: recovered target hours, less bench and less admin."]]},
    title: 'Resource Utilization',
    eyebrow: 'Managed services · Time accounting',
    sub: 'Where every available hour goes, for each person and team, against an 80% target-share floor. Switch between week, month, quarter and year to date.',
    files: { resources: 'data/resources.csv', planned_mix: 'data/planned_mix.csv', weekly_hours: 'data/weekly_hours.csv', impact: 'data/impact.csv' },
    prep,
    slicers: [
      { key: 'period', label: 'Period', seg: true, default: 'WTD', options: [{ value: 'WTD', label: 'WTD' }, { value: 'MTD', label: 'MTD' }, { value: 'QTD', label: 'QTD' }, { value: 'YTD', label: 'YTD' }] },
      { key: 'dept', label: 'Department', all: 'All departments', options: (D) => SDu.uniq(D.resources, 'department') },
      { key: 'resource', label: 'Resource', all: 'All resources', options: (D) => SDu.uniq(D.resources, 'resource') },
    ],
    pages: [
      { id: 'context', label: 'Context', slicers: [], blocks: [{ type: 'story' }] },
      { id: 'individual', label: 'Individual view', slicers: ['period', 'dept', 'resource'], blocks: [
        { type: 'text', html: (D, F) => { const s = cur(F); return `For the <b>${period(F).curLabel}</b>, <b>${pct(s.share)}</b> of available hours went to target work against an 80% floor. Bench took <b>${pct(s.pa(s.cat.Bench))}</b> and admin <b>${pct(s.pa(s.cat.Admin))}</b>, and mix alignment is <b>${pct(s.mix)}</b>.`; } },
        { type: 'heading', text: 'Where every available hour went', when: isYTD },
        ytdGrid, ytdKpis, indKpis,
        { type: 'row', blocks: [
          { type: 'card', span: 7, title: (D, F) => `Where the ${period(F).noun} went`, note: (D, F) => (isYTD(D, F) ? 'Average hours per person. The bar adds up to total available hours.' : 'Average hours per person, by category. Bench is outlined.'), h: 200, draw: (el, D, F) => whereWent(el, F, people(F), isYTD(D, F)) },
          { type: 'card', span: 5, when: notYTD, title: (D, F) => period(F).trendTitle, note: 'Target share and mix alignment against the 80% floor.', h: 240, draw: (el, D, F) => trendShareMix(el, F, people(F)) },
          { type: 'card', span: 5, when: isYTD, title: 'Distribution to target', note: 'People by percentage of their target hours.', h: 240, draw: (el, D, F) => {
            const s = cur(F); const B = [['Under 40%', 0, 40], ['40 to 60%', 40, 60], ['60 to 80%', 60, 80], ['80 to 100%', 80, 100], ['100%+', 100, 1e9]];
            S.bars(el, { data: B.map(([l, a, b]) => ({ l, v: s.people.filter((p) => p.attain >= a && p.attain < b).length })), cat: 'l', values: true, yFmt: f0, series: [{ key: 'v', label: 'People', color: G.t }], label: 'People by attainment' });
            el.querySelectorAll('svg rect').forEach((r, i) => { if (i < 5) r.style.fill = ['#d14343', '#e5484d', '#f08a0c', '#22a06b', '#15803d'][i]; });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, when: notYTD, title: 'Distribution to target, by resource', note: 'Sorted lowest to highest target hours, so coaching starts on the left. Scroll sideways for everyone; click a bar to focus on that person.', h: 360, draw: (el, D, F) => perPersonBars(el, F, cur(F), false) },
          { type: 'card', span: 7, when: isYTD, title: 'Hours distribution trend', note: 'Share of available hours by month, PTO excluded.', h: 270, draw: (el, D, F) => trendDist(el, F, people(F)) },
          { type: 'card', span: 5, when: isYTD, title: 'Target mix: planned vs actual', note: 'Hours per person.', h: 270, draw: (el, D, F) => targetMix(el, F, cur(F)) },
        ] },
        { type: 'row', when: notYTD, blocks: [
          { type: 'card', span: 12, title: 'Target mix: planned vs actual', note: 'Hours per person. Planned comes from each role\'s mix; red is time spent outside the role\'s target categories.', h: 290, draw: (el, D, F) => targetMix(el, F, cur(F)) },
        ] },
        { type: 'row', when: notYTD, blocks: [
          { type: 'table', span: 12, title: 'Export: resource by category', note: 'Target % and actual % each add up to 100% per person. Red actual % is more than 10 points under target.', maxH: 380,
            cols: [{ label: 'Resource', key: 'resource' }, { label: 'Department', key: 'department' }, { label: 'Role', key: 'role' }, { label: 'Category', key: 'category' },
              { label: 'Target hrs', key: 'thrs', cls: 'r', fmt: f0 }, { label: 'Actual hrs', key: 'ahrs', cls: 'r', fmt: f0 }, { label: 'Target %', key: 'tp', cls: 'r', fmt: pct },
              { label: 'Actual %', key: 'ap', cls: 'r', render: (td, r) => { td.textContent = pct(r.ap); if (r.tp - r.ap > 10) { td.style.color = 'var(--color-bad)'; td.style.fontWeight = '600'; } else if (r.ap > r.tp && r.tp > 0) td.style.color = 'var(--color-ok)'; } }],
            rows: (D, F) => { const s = cur(F); const out = []; s.people.forEach((p) => { const tot = CATS.reduce((a, c) => a + p.cat[c], 0) || 1; CATS.forEach((c) => {
              const t = c === 'PTO' ? (p.pto / (40 * s.weeks)) * 100 : (p.plan[c] || 0); out.push({ resource: p.resource, department: p.department, role: p.role, category: c, thrs: c === 'PTO' ? p.pto : (t / 100) * p.avail, ahrs: p.cat[c], tp: t, ap: (p.cat[c] / tot) * 100 }); }); });
              return out.sort((a, b) => a.resource.localeCompare(b.resource)); } },
        ] },
        { type: 'row', when: isYTD, blocks: [
          { type: 'table', span: 12, title: 'Hours by person', note: 'Available hours add up across the row: target + non-target + admin + bench. Red bench is over 15% of available.', maxH: 440,
            onRow: (r, F) => F.toggle('resource', r.resource),
            cols: [{ label: 'Resource', key: 'resource' }, { label: 'Department', key: 'department' }, { label: 'Available hrs', key: 'avail', cls: 'r', fmt: f1 }, { label: 'Target work hrs', key: 'target', cls: 'r', fmt: f1 },
              { label: 'Non-target hrs', key: 'nontarget', cls: 'r', fmt: f1 }, { label: 'Admin hrs', key: 'admin', cls: 'r', fmt: f1 }, { label: 'Bench hrs', key: 'bench', cls: 'r', render: benchCell },
              { label: 'Attainment', key: 'attain', cls: 'r', render: (td, r) => { td.textContent = pct1(r.attain); td.style.color = r.attain >= 100 ? 'var(--color-ok)' : 'var(--color-bad)'; } }],
            rows: (D, F) => cur(F).people.slice().sort((a, b) => b.target - a.target) },
        ] },
      ] },

      { id: 'team', label: 'Team view', slicers: ['period', 'dept'], blocks: [
        { type: 'text', html: (D, F) => { const s = T(F); return `${F.state.dept || 'Across all departments'}, <b>${s.people.filter((p) => p.attain >= 100).length} of ${s.n}</b> people hit target for the <b>${period(F).curLabel}</b>. Team target share is <b>${pct(s.share)}</b>, with <b>${f0(s.cat.Bench)}</b> bench hours to put back to work.`; } },
        teamKpis, teamYtdKpis,
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Cumulative team hours by work area', note: (D, F) => `Total hours, ${period(F).curLabel}.`, h: 270, draw: (el, D, F) => {
            const s = T(F); S.hbars(el, { data: CATS.map((c) => ({ c, v: s.cat[c] })), labelKey: 'c', value: 'v', fmt: S.fmtK, color: '#0a84d6', label: 'Hours by work area' });
            el.querySelectorAll('svg rect').forEach((r, i) => { r.style.fill = COL[CATS[i]]; if (CATS[i] === 'Bench') { r.style.fill = 'var(--color-panel)'; r.style.stroke = COL.Bench; r.style.strokeWidth = 1.5; } });
          } },
          { type: 'card', span: 7, title: (D, F) => period(F).trendTitle.replace('trend', 'hours distribution'), note: 'Share of available hours, PTO excluded.', h: 270, draw: (el, D, F) => trendDist(el, F, teamPeople(F)) },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 12, title: 'Hours by resource', note: 'Each person\'s hours for the period, split by how the time was spent. Sorted by target hours; scroll sideways for everyone.', h: 360, draw: (el, D, F) => perPersonBars(el, F, T(F), true) },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Team roster', note: 'One row per person. Click a row to open them in the Individual view.', maxH: 440,
            onRow: (r, F) => { F.state.resource = r.resource; F.go('individual'); },
            cols: [{ label: 'Resource', key: 'resource' }, { label: 'Department', key: 'department' }, { label: 'Target work hrs', key: 'target', cls: 'r', fmt: f1 }, { label: 'Non-target hrs', key: 'nontarget', cls: 'r', fmt: f1 },
              { label: 'Admin hrs', key: 'admin', cls: 'r', fmt: f1 }, { label: 'Bench hrs', key: 'bench', cls: 'r', render: benchCell }, { label: 'Worked hrs', key: 'worked', cls: 'r', fmt: f1 },
              { label: 'Available hrs', key: 'avail', cls: 'r', fmt: f1 }, { label: 'Mix alignment', key: 'mix', cls: 'r', fmt: pct }, { label: 'Attainment', key: 'attain', cls: 'r', fmt: pct1 }, { label: 'Status', key: 'attain', render: status }],
            rows: (D, F) => T(F).people.slice().sort((a, b) => a.attain - b.attain),
            total: { target: (rs) => f1(d3.sum(rs, (r) => r.target)), nontarget: (rs) => f1(d3.sum(rs, (r) => r.nontarget)), admin: (rs) => f1(d3.sum(rs, (r) => r.admin)), bench: (rs) => f1(d3.sum(rs, (r) => r.bench)), worked: (rs) => f1(d3.sum(rs, (r) => r.worked)), avail: (rs) => f1(d3.sum(rs, (r) => r.avail)) } },
        ] },
      ] },

      { id: 'impact', label: 'Impact', impact: true, blocks: [{ type: 'impact' }] },
    ],
    impactNote: 'First 13 weeks of the data (Nov 2025 – Jan 2026) vs the latest 13 weeks, all people.',
    impactChart: { title: 'Target share and bench, week by week', note: 'All people, last 53 weeks.', h: 240, draw: (el, D) => {
      const data = D.weeks.map((w) => { const s = summary([w], D.resources); return { week: w, share: s.share, bench: s.pa(s.cat.Bench) }; });
      S.line(el, { data, x: (r) => S.parseDate(r.week), xFmt: S.fmtMonth, tipFmt: (d) => 'Week of ' + S.fmtDay(d), yZero: true, yFmt: (v) => d3.format('.0f')(v) + '%', label: 'Weekly target share and bench share',
        annotate: { date: new Date(Date.UTC(2026, 1, 1)), text: 'Go-live' }, series: [{ key: 'share', label: 'Target share', color: 'var(--color-ok)' }, { key: 'bench', label: 'Bench share', color: '#e5484d' }] });
    } },
    impactMethod: 'Before = the first 13 weeks in the data, after = the latest 13 weeks. Target share = hours in a role\'s planned work categories ÷ available hours (40 a week minus PTO). Target = 80% of available hours. Recovered hours = rise in target hours per week between the two windows. Reporting effort figures are estimates. Every figure here is sample data built for this prototype.',
  });
})();
