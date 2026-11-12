(function () {
  const S = SD, n = S.n;
  const f0 = d3.format(',.0f'), usd = S.fmtUsd, usdK = (v) => '$' + d3.format('.3~s')(v).replace('G', 'B'), pct = (v) => d3.format('.0f')(v) + '%';
  const RISK = ['1-25', '26-50', '51-75', '76-100'];
  const RCOL = { '1-25': '#22a06b', '26-50': '#f2c230', '51-75': '#f97316', '76-100': '#e5484d' };
  const AGING = ['0-30', '31-60', '61-90', '91-180', '181-360', 'Over 360'];
  const map = { owner: 'owner', csm: 'csm', cls: 'classification', acct: 'account', type: 'type', reason: 'reason', risk: 'risk_level', aging: 'aging' };
  const base = (D, F, skip) => D.contracts.filter((r) => F.ok(r, Object.fromEntries(Object.entries(map).filter(([k]) => k !== skip))));
  const sum = (rs, k) => d3.sum(rs, (r) => n(r[k]));
  // MRR-weighted churn probability
  const churnP = (rs) => { const m = sum(rs, 'mrr'); return m ? d3.sum(rs, (r) => n(r.mrr) * n(r.risk_prob)) / m : 0; };
  const atRisk = (rs) => rs.filter((r) => n(r.risk_prob) > 0);
  const exp = (D, F) => base(D, F).filter((r) => r.aging === '0-30' || r.aging === '31-60' || r.aging === '61-90');
  const next3 = ['2026-11-01', '2026-12-01', '2027-01-01', '2027-02-01'];
  const one = (rs) => (new Set(rs.map((r) => r.account)).size === 1 ? rs[0] : null);
  const byGroup = (rs, key, f) => Array.from(d3.rollup(rs, f, (r) => r[key]), ([k, v]) => ({ k, v }));

  function gauge(el, value) {
    el.replaceChildren();
    const W = Math.min(260, el.clientWidth || 260), H = W * 0.62, R = W / 2 - 10;
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H + 30).attr('role', 'img').attr('aria-label', `Churn probability ${value.toFixed(0)}%`);
    const g = svg.append('g').attr('transform', `translate(${W / 2},${H})`);
    const a = (v) => -Math.PI / 2 + (Math.PI * v) / 100;
    [[0, 25, RCOL['1-25']], [25, 50, RCOL['26-50']], [50, 75, RCOL['51-75']], [75, 100, RCOL['76-100']]].forEach(([s, e, c]) =>
      g.append('path').attr('d', d3.arc().innerRadius(R - 22).outerRadius(R).startAngle(a(s)).endAngle(a(e)).padAngle(0.01)()).style('fill', c).style('opacity', 0.9));
    const ang = a(Math.min(100, value));
    g.append('line').attr('x1', 0).attr('y1', 0).attr('x2', Math.sin(ang) * (R - 30)).attr('y2', -Math.cos(ang) * (R - 30)).style('stroke', 'var(--color-fg)').attr('stroke-width', 4).attr('stroke-linecap', 'round');
    g.append('circle').attr('r', 8).style('fill', 'var(--color-fg)');
    g.append('text').attr('y', 32).attr('text-anchor', 'middle').attr('class', 'sd-donut-v').style('font-size', '30px').text(value.toFixed(0) + '%');
    g.append('text').attr('x', -R + 11).attr('y', 16).attr('text-anchor', 'middle').attr('class', 'sd-donut-l').text('0');
    g.append('text').attr('x', R - 11).attr('y', 16).attr('text-anchor', 'middle').attr('class', 'sd-donut-l').text('100');
  }

  App({
    story: {"headline": "Clients were leaving, and the warning signs were buried in CSM notes that nobody could add up.", "sub": "Account risk lived in free-text notes and a shared spreadsheet that took about 15 hours a week to update. By the time a risk got attention it was often too late: only about 20% of flagged accounts were saved.", "who": "CSMs, account owners and leadership", "problem": [["Risk hidden in notes", "Each CSM described risk their own way, so it couldn't be counted, ranked or compared."], ["Slow to act", "It took about 25 days from a risk being noticed to anyone acting on it."], ["Revenue walking out", "About $22.6K of MRR and 6 accounts were lost every month."], ["No view of why", "Reasons like price, budget cuts or service issues were never tracked in one place."]], "built": [["An ML churn model built in Microsoft Fabric", "Scores a churn probability for every active contract. CSMs add the reason, and any group is weighted by MRR."], ["Revenue at risk", "At-risk and high-risk MRR, expected loss and risk by CSM and reason."], ["What's ending soon", "Contracts and MRR expiring in the next months by group."], ["Account-level detail", "Every active contract with risk, reason, owner and end date."]], "pages": [["overview", "Churn risk overview", "The churn gauge and MRR by account group."], ["retention", "Revenue retention", "At-risk MRR by CSM, risk level and reason."], ["expiry", "Expiry trends", "What expires in the coming months."], ["portfolio", "Client portfolio", "Every active contract with its risk."], ["impact", "★ Impact", "More flagged accounts saved and less MRR lost since go-live."]]},
    title: 'Retention Risk',
    eyebrow: 'Managed services · Client success',
    sub: 'Churn risk across every active contract: how likely each client is to leave, why, how much MRR is at stake and what expires next. Churn probability is scored by an ML model built in Microsoft Fabric.',
    files: { contracts: 'data/contracts.csv', hist: 'data/monthly_retention.csv', impact: 'data/impact.csv' },
    slicers: [
      { key: 'owner', label: 'Account owner', all: 'All owners', options: (D) => SDu.uniq(D.contracts, 'owner') },
      { key: 'csm', label: 'CSM', all: 'All CSMs', options: (D) => SDu.uniq(D.contracts, 'csm') },
      { key: 'cls', label: 'Classification', all: 'All', options: (D) => SDu.uniq(D.contracts, 'classification') },
      { key: 'acct', label: 'Account', all: 'All accounts', options: (D) => SDu.uniq(D.contracts, 'account') },
      { key: 'type', label: 'Contract type', all: 'All types', options: (D) => SDu.uniq(D.contracts, 'type') },
      { key: 'reason', label: 'Reason', all: 'All reasons', options: (D) => SDu.uniq(D.contracts, 'reason') },
      { key: 'risk', label: 'Risk category', all: 'All', options: RISK },
      { key: 'aging', label: 'End date period', all: 'All', options: AGING },
    ],
    pages: [
      { id: 'context', label: 'Context', slicers: [], blocks: [{ type: 'story' }] },
      { id: 'overview', label: 'Churn risk overview', slicers: ['owner', 'csm', 'cls', 'acct', 'type', 'reason'], blocks: [
        { type: 'text', html: (D, F) => { const r = base(D, F); const ar = atRisk(r).filter((x) => n(x.risk_prob) > 50);
          return `MRR-weighted churn probability is <b>${pct(churnP(r))}</b> across <b>${f0(r.length)}</b> active contracts. <b>${usdK(sum(ar, 'mrr'))}</b> of MRR sits on contracts above 50% risk, at <b>${new Set(ar.map((x) => x.account)).size}</b> accounts.`; } },
        { type: 'row', blocks: [
          { type: 'card', span: 3, title: 'Churn probability', note: 'Scored by the Fabric ML model, MRR-weighted across selected contracts.', h: 380, draw: (el, D, F) => {
            const r = base(D, F); const box = document.createElement('div'); el.replaceChildren(box); gauge(box, churnP(r));
            const sel = one(r);
            [[usdK(sum(r, 'mrr')), 'Active MRR'], [f0(r.length), 'Active contracts'], [sel ? sel.csm : 'No account selected', 'CSM'], [sel ? sel.owner : 'No account selected', 'Owner']].forEach(([v, l]) => {
              const d = document.createElement('div'); d.style.textAlign = 'center'; d.style.margin = '10px 0';
              const b = document.createElement('div'); b.className = 'sd-kpi-v'; b.style.fontSize = sel || l.startsWith('Active') ? '1.4rem' : '1rem'; b.textContent = v;
              const s = document.createElement('div'); s.className = 'sd-kpi-l'; s.textContent = l; d.append(b, s); el.append(d);
            });
          } },
          { type: 'card', span: 5, title: 'MRR by classification', note: 'Click a bar to filter.', h: 380, draw: (el, D, F) => {
            S.hbars(el, { data: byGroup(base(D, F, 'cls'), 'classification', (v) => d3.sum(v, (r) => n(r.mrr))).sort((a, b) => b.v - a.v), labelKey: 'k', value: 'v', fmt: usdK, color: '#1e3a8a',
              highlight: (d) => /Risk|Loss|Departed/.test(d.k), onPick: (d) => F.toggle('cls', d.k), label: 'MRR by classification' });
          } },
          { type: 'card', span: 4, title: 'Active contracts by classification', note: 'Red = at-risk, departing or revenue-loss groups.', h: 380, draw: (el, D, F) => {
            S.hbars(el, { data: byGroup(base(D, F, 'cls'), 'classification', (v) => v.length).sort((a, b) => b.v - a.v), labelKey: 'k', value: 'v', fmt: f0, color: '#0ea5e9',
              highlight: (d) => /Risk|Loss|Departed/.test(d.k), onPick: (d) => F.toggle('cls', d.k), label: 'Contracts by classification' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Client portfolio: latest billing', note: 'Accounts by MRR. Click a row to select that account.', maxH: 420, onRow: (r, F) => F.toggle('acct', r.k),
            cols: [{ label: 'Account', key: 'k' }, { label: 'Contracts', key: 'c', cls: 'r' }, { label: 'MRR', key: 'm', cls: 'r', fmt: usd },
              { label: 'Churn probability', key: 'p', cls: 'r', render: (td, r) => { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = r.p > 50 ? RCOL['76-100'] : r.p > 25 ? RCOL['51-75'] : r.p > 0 ? RCOL['26-50'] : RCOL['1-25']; td.append(d, document.createTextNode(pct(r.p))); } }],
            rows: (D, F) => Array.from(d3.group(base(D, F, 'acct'), (r) => r.account), ([k, xs]) => ({ k, c: xs.length, m: sum(xs, 'mrr'), p: churnP(xs) })).sort((a, b) => b.m - a.m),
            total: { c: (rs) => f0(d3.sum(rs, (r) => r.c)), m: (rs) => usd(d3.sum(rs, (r) => r.m)) } },
        ] },
      ] },
      { id: 'retention', label: 'Revenue retention', slicers: ['owner', 'csm', 'cls', 'risk', 'type', 'reason'], blocks: [
        { type: 'kpis', items: [
          { label: 'At-risk MRR', value: (D, F) => usdK(sum(atRisk(base(D, F)), 'mrr')), tone: () => 'warn', sub: (D, F) => `${atRisk(base(D, F)).length} contracts` },
          { label: 'High risk (51–100)', value: (D, F) => usdK(sum(base(D, F).filter((r) => n(r.risk_prob) > 50), 'mrr')), tone: () => 'bad', sub: (D, F) => `${base(D, F).filter((r) => n(r.risk_prob) > 50).length} contracts` },
          { label: 'Expected MRR loss', value: (D, F) => usdK(d3.sum(base(D, F), (r) => (n(r.mrr) * n(r.risk_prob)) / 100)), sub: () => 'MRR × churn probability' },
          { label: 'Accounts at risk', value: (D, F) => f0(new Set(atRisk(base(D, F)).map((r) => r.account)).size) },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 4, title: 'Retention opportunity by CSM', note: 'At-risk MRR in each CSM\'s book. Click to filter.', h: 260, draw: (el, D, F) => {
            S.bars(el, { data: byGroup(atRisk(base(D, F, 'csm')), 'csm', (v) => d3.sum(v, (r) => n(r.mrr))).sort((a, b) => b.v - a.v), cat: 'k', values: true, yFmt: usdK, catFmt: (c) => c.split(' ')[0],
              onPick: (d) => F.toggle('csm', d.k), series: [{ key: 'v', label: 'At-risk MRR', color: '#1e3a8a' }], label: 'At-risk MRR by CSM' });
          } },
          { type: 'card', span: 4, title: 'Active contracts by risk level', note: 'Contracts with a risk score. Click a slice to filter.', h: 260, draw: (el, D, F) => {
            const r = base(D, F, 'risk'); const data = RISK.map((k) => ({ k, v: r.filter((x) => x.risk_level === k).length })).filter((d) => d.v);
            S.donut(el, { data, labelKey: 'k', value: 'v', colors: data.map((d) => RCOL[d.k]), centerLabel: 'contracts', onPick: (d) => F.toggle('risk', d.k), label: 'Contracts by risk level' });
          } },
          { type: 'card', span: 4, title: 'Active MRR by risk level', note: 'Click a slice to filter.', h: 260, draw: (el, D, F) => {
            const r = base(D, F, 'risk'); const data = RISK.map((k) => ({ k, v: sum(r.filter((x) => x.risk_level === k), 'mrr') })).filter((d) => d.v);
            S.donut(el, { data, labelKey: 'k', value: 'v', colors: data.map((d) => RCOL[d.k]), centerLabel: 'at-risk MRR', onPick: (d) => F.toggle('risk', d.k), label: 'MRR by risk level' });
            el.querySelector('.sd-donut-v').textContent = usdK(d3.sum(data, (d) => d.v));
            el.querySelectorAll('.sd-dlegend b').forEach((b, i) => { b.textContent = `${usdK(data[i].v)} · ${d3.format('.0%')(data[i].v / d3.sum(data, (d) => d.v))}`; });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'Risk reasons', note: 'At-risk MRR by reason. Click a bar to filter.', h: 230, draw: (el, D, F) => {
            S.hbars(el, { data: byGroup(atRisk(base(D, F, 'reason')), 'reason', (v) => d3.sum(v, (r) => n(r.mrr))).sort((a, b) => b.v - a.v), labelKey: 'k', value: 'v', fmt: usdK, color: '#f97316', onPick: (d) => F.toggle('reason', d.k), label: 'At-risk MRR by reason' });
          } },
          { type: 'card', span: 6, title: 'Revenue retention trend', note: 'Expiring MRR on at-risk contracts, next 4 months.', h: 230, draw: (el, D, F) => {
            const r = atRisk(base(D, F));
            S.line(el, { data: next3.map((m) => ({ m, v: sum(r.filter((x) => x.end_month === m), 'mrr'), c: r.filter((x) => x.end_month === m).length })), x: (d) => S.parseDate(d.m), yZero: true, points: true, yFmt: usdK,
              series: [{ key: 'v', label: 'Expiring at-risk MRR', color: '#1e3a8a' }], label: 'Expiring at-risk MRR by month' });
          } },
        ] },
      ] },
      { id: 'expiry', label: 'Expiry trends', slicers: ['owner', 'csm', 'cls', 'type', 'reason', 'aging'], blocks: [
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'Monthly contract expiry trend', note: 'Contracts ending in each of the next 4 months.', h: 230, draw: (el, D, F) => {
            const r = base(D, F);
            S.bars(el, { data: next3.map((m) => ({ m, v: r.filter((x) => x.end_month === m).length })), cat: 'm', values: true, yFmt: f0, catFmt: (m) => d3.utcFormat('%B')(S.parseDate(m)), series: [{ key: 'v', label: 'Contracts', color: '#1e3a8a' }], label: 'Contracts expiring by month' });
          } },
          { type: 'card', span: 6, title: 'MRR expiration by month', note: 'MRR on contracts ending in each of the next 4 months.', h: 230, draw: (el, D, F) => {
            const r = base(D, F);
            S.bars(el, { data: next3.map((m) => ({ m, v: sum(r.filter((x) => x.end_month === m), 'mrr') })), cat: 'm', values: true, yFmt: usdK, catFmt: (m) => d3.utcFormat('%B')(S.parseDate(m)), series: [{ key: 'v', label: 'MRR', color: '#0ea5e9' }], label: 'MRR expiring by month' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Contracts expiring in the next 90 days, by classification', note: 'Counts and MRR, with each row\'s share of the total. Click a row to filter.', onRow: (r, F) => F.toggle('cls', r.k),
            cols: [{ label: 'Classification', key: 'k' }, { label: 'Active #', key: 'c', cls: 'r' }, { label: 'MRR', key: 'm', cls: 'r', fmt: usd }, { label: '% of contracts', key: 'pc', cls: 'r', fmt: pct },
              { label: '% of MRR', key: 'pm', cls: 'r', render: (td, r) => { const w = document.createElement('div'); w.className = 'sd-inbar'; const b = document.createElement('span'); b.style.width = Math.round(r.pm * 1.2) + 'px'; b.style.background = /Risk|Loss|Departed/.test(r.k) ? 'var(--color-bad)' : '#1e3a8a'; w.append(b, document.createTextNode(pct(r.pm))); td.append(w); } }],
            rows: (D, F) => { const r = exp(D, F); const tc = r.length || 1, tm = sum(r, 'mrr') || 1; return Array.from(d3.group(r, (x) => x.classification), ([k, xs]) => ({ k, c: xs.length, m: sum(xs, 'mrr'), pc: (xs.length / tc) * 100, pm: (sum(xs, 'mrr') / tm) * 100 })).sort((a, b) => a.k.localeCompare(b.k)); },
            total: { c: (rs) => f0(d3.sum(rs, (r) => r.c)), m: (rs) => usd(d3.sum(rs, (r) => r.m)), pc: () => '100%', pm: () => '100%' } },
        ] },
      ] },
      { id: 'portfolio', label: 'Client portfolio', slicers: ['owner', 'csm', 'cls', 'type', 'reason', 'aging'], blocks: [
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Account-level contract and billing details', note: 'Every active contract, largest MRR first. Risk above 50% is red.', maxH: 640,
            cols: [{ label: 'Account', key: 'account' }, { label: 'Contract', key: 'contract_id' }, { label: 'Aging', key: 'aging' }, { label: 'Type', key: 'type' }, { label: 'Classification', key: 'classification' },
              { label: 'Risk %', key: 'risk_prob', cls: 'r', render: (td, r) => { td.textContent = r.risk_prob; if (n(r.risk_prob) > 50) { td.style.color = 'var(--color-bad)'; td.style.fontWeight = '600'; } } },
              { label: 'Reason', key: 'reason', cls: 'sd-wrap' }, { label: 'MRR', key: 'mrr', cls: 'r', fmt: (v) => usd(n(v)) }, { label: 'Owner', key: 'owner' }, { label: 'CSM', key: 'csm' },
              { label: 'End date', key: 'end', fmt: (v) => d3.utcFormat('%m/%d/%Y')(S.parseDate(v)) }],
            rows: (D, F) => base(D, F).slice().sort((a, b) => n(b.mrr) - n(a.mrr)) },
        ] },
      ] },
      { id: 'impact', label: 'Impact', impact: true, blocks: [{ type: 'impact' }] },
    ],
    impactNote: 'Average of the first 3 months of the data vs the latest 3 months.',
    impactChart: { title: 'MRR saved vs lost each month', note: 'At-risk MRR kept after intervention vs MRR that churned.', h: 240, draw: (el, D) => {
      S.bars(el, { data: D.hist, cat: 'month', yFmt: usdK, catFmt: (m) => d3.utcFormat('%b')(S.parseDate(m)), series: [{ key: 'saved_mrr', label: 'MRR saved', color: 'var(--color-ok)' }, { key: 'lost_mrr', label: 'MRR lost', color: '#e5484d' }], label: 'MRR saved vs lost' });
    } },
    impactMethod: 'Before = first 3 months of the data, after = latest 3 months. Churn probability is MRR-weighted across contracts. Flagged accounts saved = MRR kept ÷ at-risk MRR. Review effort figures are estimates. Every figure here is sample data built for this prototype.',
  });
})();
