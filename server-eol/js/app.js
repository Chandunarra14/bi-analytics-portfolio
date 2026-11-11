(function () {
  const S = SD, n = S.n;
  const f0 = d3.format(',.0f'), usd = S.fmtUsd, usdK = (v) => '$' + d3.format('.3~s')(v).replace('G', 'B');
  const STATUSES = ['Needs PSR', 'PSR In Progress', 'Presented To Client', 'Closed Won', 'Closed Lost', 'Decommissioning', 'Not Actionable'];
  const ST_COL = { 'Needs PSR': '#e5484d', 'PSR In Progress': '#f59e0b', 'Presented To Client': '#8b5cf6', 'Closed Won': '#18a999', 'Closed Lost': '#64748b', 'Decommissioning': '#0ea5e9', 'Not Actionable': '#cbd5e1' };
  const OS = [{ key: 'server_2008', label: 'Server 2008 / 2008 R2', note: 'EOL critical · ended Jan 2020', color: '#e5484d' },
    { key: 'server_2012', label: 'Server 2012 / 2012 R2', note: 'EOL · Oct 2023 (ESU ending)', color: '#f97316' },
    { key: 'server_2016', label: 'Server 2016', note: 'Nearing EOL · Jan 2027', color: '#f2a541' }];
  const map = { csm: 'csm', status: 'status', level: 'level' };
  const rows = (D, F) => D.accounts.filter((r) => F.ok(r, map) && (!F.state.os || n(r[F.state.os]) > 0));
  const sum = (rs, k) => d3.sum(rs, (r) => n(r[k]));

  App({
    story: {"headline": "Hundreds of client servers were running Windows versions that no longer get security updates, and nobody had one list of who was affected.", "sub": "The RMM knew which servers were old. The CRM knew which clients had a refresh deal. Matching the two was a weekly spreadsheet job, so the refresh campaign moved slowly and revenue was left on the table.", "who": "Client success managers, account managers and service delivery leadership", "problem": [["Two systems, no join", "Server OS data lived in the RMM and refresh opportunities in the CRM. Engineers matched them by hand: about 10 hours a week."], ["Security risk with no owner", "Clients on Server 2008 and 2012 had no clear CSM, PSR or next step, so the riskiest servers sat untouched."], ["A deadline coming", "Server 2016 reaches end of life in January 2027, adding hundreds more servers to the problem."], ["Slow to answer simple questions", "Listing every affected client took about 5 days of pulling and cleaning exports."]], "built": [["Every affected client in one table", "Servers by OS version, CSM, PSR ticket, campaign status, notes and NRR, most urgent first."], ["Campaign tracking", "Each client moves through Needs PSR, In progress, Presented and Closed, so stalled clients stand out."], ["Pipeline value", "Open, won and lost NRR from the refresh campaign, by status and by CSM."], ["Month-by-month progress", "EOL servers remaining and won NRR over time, with the go-live date marked."]], "pages": [["overview", "Overview", "How many servers are at risk, where the campaign stands and the NRR in play."], ["accounts", "Account pipeline", "Every affected client with servers, owner, status and notes."], ["progress", "Campaign trend", "Servers retired and NRR won month by month."], ["impact", "★ Impact", "Faster retirements, more PSRs and more NRR since go-live."]]},
    title: 'Server End-of-Life Pipeline',
    eyebrow: 'Managed services · RMM + CRM',
    sub: 'Every client server running an end-of-life Windows Server version, matched to the refresh campaign status and sales pipeline for that account.',
    files: { accounts: 'data/accounts.csv', progress: 'data/monthly_progress.csv', impact: 'data/impact.csv' },
    slicers: [
      { key: 'os', label: 'OS version', all: 'All versions', options: OS.map((o) => ({ value: o.key, label: o.label })) },
      { key: 'status', label: 'Campaign status', all: 'All statuses', options: STATUSES },
      { key: 'csm', label: 'CSM', all: 'All CSMs', options: (D) => SDu.uniq(D.accounts, 'csm') },
      { key: 'level', label: 'Account level', all: 'All levels', options: (D) => SDu.uniq(D.accounts, 'level') },
    ],
    pages: [
      { id: 'context', label: 'Context', slicers: [], blocks: [{ type: 'story' }] },
      { id: 'overview', label: 'Overview', slicers: ['os', 'status', 'csm', 'level'], blocks: [
        { type: 'text', html: (D, F) => { const r = rows(D, F); const crit = sum(r, 'server_2008') + sum(r, 'server_2012');
          return `<b>${f0(crit)}</b> servers across <b>${r.filter((x) => n(x.server_2008) + n(x.server_2012) > 0).length}</b> clients are already past end of life, and <b>${f0(sum(r, 'server_2016'))}</b> more hit EOL in January. <b>${usdK(sum(r.filter((x) => x.opportunity === 'Open'), 'gross_nrr'))}</b> of refresh NRR is in the open pipeline.`; } },
        { type: 'kpis', items: [
          { label: 'Servers tracked', value: (D, F) => f0(sum(rows(D, F), 'servers')), sub: (D, F) => `${rows(D, F).length} clients` },
          { label: 'Critical (already EOL)', value: (D, F) => f0(sum(rows(D, F), 'server_2008') + sum(rows(D, F), 'server_2012')), tone: () => 'bad', sub: (D, F) => `${rows(D, F).filter((x) => n(x.server_2008) + n(x.server_2012) > 0).length} affected clients` },
          { label: 'Nearing EOL (2016)', value: (D, F) => f0(sum(rows(D, F), 'server_2016')), tone: () => 'warn', sub: (D, F) => `${rows(D, F).filter((x) => n(x.server_2016) > 0).length} affected clients` },
          { label: 'Open opportunities', value: (D, F) => f0(rows(D, F).filter((x) => x.opportunity === 'Open').length), sub: (D, F) => `Open NRR ${usdK(sum(rows(D, F).filter((x) => x.opportunity === 'Open'), 'gross_nrr'))}` },
          { label: 'Closed won', value: (D, F) => f0(rows(D, F).filter((x) => x.opportunity === 'Won').length), tone: () => 'good', sub: (D, F) => `Won NRR ${usdK(sum(rows(D, F).filter((x) => x.opportunity === 'Won'), 'gross_nrr'))}`, pick: (F) => F.toggle('status', 'Closed Won'), picked: (F) => F.is('status', 'Closed Won') },
          { label: 'Closed lost', value: (D, F) => f0(rows(D, F).filter((x) => x.opportunity === 'Lost').length), tone: () => 'bad', sub: (D, F) => `Lost NRR ${usdK(sum(rows(D, F).filter((x) => x.opportunity === 'Lost'), 'gross_nrr'))}`, pick: (F) => F.toggle('status', 'Closed Lost'), picked: (F) => F.is('status', 'Closed Lost') },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Server footprint by OS version', note: 'Click a bar to show only clients running that version.', h: 200, draw: (el, D, F) => {
            const r = rows(D, F);
            S.hbars(el, { data: OS.map((o) => ({ os: o.label, key: o.key, v: sum(r, o.key) })), labelKey: 'os', value: 'v', fmt: f0, color: '#2f6fed',
              highlight: (d) => d.key !== 'server_2016', onPick: (d) => F.toggle('os', d.key), tipExtra: (d) => [OS.find((o) => o.key === d.key).note], label: 'Servers by OS version' });
          } },
          { type: 'card', span: 7, title: 'Refresh campaign progress', note: 'Clients by campaign status. Click a bar to filter.', h: 230, draw: (el, D, F) => {
            const r = D.accounts.filter((x) => F.ok(x, { csm: 'csm', level: 'level' }) && (!F.state.os || n(x[F.state.os]) > 0));
            S.bars(el, { data: STATUSES.map((s) => ({ s, v: r.filter((x) => x.status === s).length })), cat: 's', values: true, yFmt: f0, onPick: (d) => F.toggle('status', d.s),
              catFmt: (c) => c.replace('Presented To Client', 'Presented').replace('PSR In Progress', 'In progress').replace('Decommissioning', 'Decom'),
              series: [{ key: 'v', label: 'Clients', color: '#2f6fed' }], label: 'Clients by campaign status' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Pipeline NRR by status', note: 'Gross refresh NRR. Click a slice to filter.', h: 240, draw: (el, D, F) => {
            const r = rows(D, F); const data = STATUSES.map((s) => ({ s, v: sum(r.filter((x) => x.status === s), 'gross_nrr') })).filter((d) => d.v > 0);
            S.donut(el, { data, labelKey: 's', value: 'v', colors: data.map((d) => ST_COL[d.s]), centerLabel: 'gross NRR', onPick: (d) => F.toggle('status', d.s), label: 'NRR by status' });
            el.querySelector('.sd-donut-v').textContent = usdK(d3.sum(data, (d) => d.v));
            el.querySelectorAll('.sd-dlegend b').forEach((b, i) => { b.textContent = `${usdK(data[i].v)} · ${d3.format('.0%')(data[i].v / d3.sum(data, (d) => d.v))}`; });
          } },
          { type: 'card', span: 7, title: 'EOL servers by CSM', note: 'Already-EOL and nearing-EOL servers in each CSM\'s book. Click a bar to filter.', h: 260, draw: (el, D, F) => {
            const r = rows(D, F); const by = d3.group(r, (x) => x.csm);
            const data = Array.from(by, ([c, xs]) => ({ csm: c, crit: sum(xs, 'server_2008') + sum(xs, 'server_2012'), near: sum(xs, 'server_2016') })).sort((a, b) => b.crit + b.near - a.crit - a.near);
            S.bars(el, { data, cat: 'csm', stacked: true, values: true, yFmt: f0, onPick: (d) => F.toggle('csm', d.csm), catFmt: (c) => c.split(' ')[0],
              series: [{ key: 'crit', label: 'Already EOL', color: '#e5484d' }, { key: 'near', label: 'Nearing EOL', color: '#f2a541' }], label: 'EOL servers by CSM' });
          } },
        ] },
      ] },
      { id: 'accounts', label: 'Account pipeline', slicers: ['os', 'status', 'csm', 'level'], blocks: [
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'One-panel view', note: 'Every affected client with its servers, owner, PSR, status, notes and NRR. Click a row to filter to that client\'s status.', maxH: 620,
            onRow: (r, F) => F.toggle('status', r.status),
            cols: [{ label: 'Account', key: 'account' }, { label: 'Level', key: 'level' }, { label: '2008', key: 'server_2008', cls: 'r' }, { label: '2012', key: 'server_2012', cls: 'r' }, { label: '2016', key: 'server_2016', cls: 'r' },
              { label: 'CSM', key: 'csm' }, { label: 'PSR', key: 'psr_number', render: (td, r) => { if (r.psr_number) { const s = document.createElement('span'); s.className = 'sd-pill'; s.textContent = r.psr_number; td.append(s); } } },
              { label: 'Status', key: 'status', render: (td, r) => { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = ST_COL[r.status]; td.append(d, document.createTextNode(r.status)); } },
              { label: 'Notes', key: 'notes', cls: 'sd-wrap' }, { label: 'Gross NRR', key: 'gross_nrr', cls: 'r', fmt: (v) => usd(n(v)) }],
            rows: (D, F) => rows(D, F).slice().sort((a, b) => n(b.server_2008) * 3 + n(b.server_2012) * 2 + n(b.server_2016) - (n(a.server_2008) * 3 + n(a.server_2012) * 2 + n(a.server_2016))),
            total: { server_2008: (rs) => f0(sum(rs, 'server_2008')), server_2012: (rs) => f0(sum(rs, 'server_2012')), server_2016: (rs) => f0(sum(rs, 'server_2016')), gross_nrr: (rs) => usd(sum(rs, 'gross_nrr')) } },
        ] },
      ] },
      { id: 'progress', label: 'Campaign trend', slicers: [], blocks: [
        { type: 'kpis', items: [
          { label: 'EOL servers remaining', value: (D) => f0(n(D.progress[D.progress.length - 1].eol_servers_remaining)), sub: (D) => `from ${f0(n(D.progress[0].eol_servers_remaining) + n(D.progress[0].servers_retired))} a year ago` },
          { label: 'Retired last 3 months', value: (D) => f0(d3.sum(D.progress.slice(-3), (r) => n(r.servers_retired))), tone: () => 'good' },
          { label: 'Refresh PSRs last 3 months', value: (D) => f0(d3.sum(D.progress.slice(-3), (r) => n(r.psrs_created))) },
          { label: 'Won NRR, 12 months', value: (D) => usdK(n(D.progress[D.progress.length - 1].won_nrr_cumulative)), tone: () => 'good' },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'EOL servers remaining', note: 'Month-end count of servers on an unsupported or soon-unsupported OS.', h: 240, draw: (el, D) => {
            S.line(el, { data: D.progress, x: (r) => S.parseDate(r.month), yZero: true, points: true, yFmt: f0, annotate: { date: new Date(Date.UTC(2026, 1, 1)), text: 'Dashboard go-live' }, series: [{ key: 'eol_servers_remaining', label: 'EOL servers', color: '#e5484d' }], label: 'EOL servers remaining by month' });
          } },
          { type: 'card', span: 6, title: 'Won refresh NRR by month', note: 'Closed-won NRR from EOL refresh opportunities.', h: 240, draw: (el, D) => {
            S.bars(el, { data: D.progress, cat: 'month', values: true, yFmt: usdK, catFmt: (m) => d3.utcFormat('%b')(S.parseDate(m)), series: [{ key: 'won_nrr', label: 'Won NRR', color: '#18a999' }], label: 'Won NRR by month' });
          } },
        ] },
      ] },
      { id: 'impact', label: 'Impact', impact: true, blocks: [{ type: 'impact' }] },
    ],
    impactNote: 'Average of the first 3 months of the campaign data vs the latest 3 months.',
    impactChart: { title: 'Servers retired and PSRs created each month', note: 'Campaign activity picked up once every affected client was visible in one place.', h: 240, draw: (el, D) => {
      S.bars(el, { data: D.progress, cat: 'month', catFmt: (m) => d3.utcFormat('%b')(S.parseDate(m)), yFmt: f0, series: [{ key: 'servers_retired', label: 'Servers retired', color: 'var(--color-ok)' }, { key: 'psrs_created', label: 'PSRs created', color: '#2f6fed' }], label: 'Monthly campaign activity' });
    } },
    impactMethod: 'Before = first 3 months of campaign data, after = latest 3 months. Servers, PSRs and NRR come from the sample RMM and CRM files. Reporting effort figures are estimates. Every figure here is sample data built for this prototype.',
  });
})();
