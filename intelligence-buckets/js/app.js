// Intelligence Buckets: architecture prototype. Domain semantic models, each with a data agent and MCP endpoint,
// in place of one AI agent searching the whole data lake.
(function () {
  const BUCKETS = [
    { id: 'projects', name: 'Projects', color: '#2f6fed', ep: '/mcp/projects', owner: 'Delivery and PMO',
      segs: ['Projects', 'Staffing', 'Ticketing & Support'], src: ['PSA & ticketing', 'Time entries'],
      tables: ['Projects', 'Project tasks', 'Time entries', 'Resources', 'Roles & planned mix', 'Calendar'],
      measures: ['Active projects', 'Backlog NRR', 'Margin %', 'RYG status', 'Target share', 'Bench hours'],
      qs: ['Which projects are over budget this month?', 'How much NRR is due to land in December?', 'Who on the Service Desk team is under target this week?'] },
    { id: 'contracts', name: 'Contracts', color: '#18a999', ep: '/mcp/contracts', owner: 'Client success',
      segs: ['Account Management', 'Client Success Team', 'Device & Asset Mgmt', 'Backup & Recovery', 'Security & Vulnerability', 'Customer Satisfaction', 'Cloud Subscriptions'],
      src: ['PSA contracts', 'RMM', 'Backup', 'Security tools', 'CSAT surveys'],
      tables: ['Contracts', 'Accounts', 'Devices', 'Churn risk', 'CSAT responses', 'Calendar'],
      measures: ['Active MRR', 'Churn rate', 'Days to expiry', 'Churn probability', 'At-risk MRR', 'EOL servers'],
      qs: ['Which contracts over $2K MRR expire in the next 90 days?', 'What is our churn rate this year?', 'Which clients still run Server 2012?'] },
    { id: 'sales', name: 'Sales', color: '#f2a541', ep: '/mcp/sales', owner: 'Sales and sales ops',
      segs: ['Sales & Pipeline', 'Sales Leads', 'Account Management', 'Contacts', 'Device & Asset Mgmt'],
      src: ['CRM', 'PSA tickets'],
      tables: ['Opportunities', 'PSR tickets', 'Accounts', 'Contacts', 'Calendar'],
      measures: ['Open pipeline NRR', 'Win %', 'Days to scope', 'Cycle time', 'PSRs pending scope'],
      qs: ['What is our win rate on final PSRs this quarter?', 'Which PSRs have waited more than 60 days for scoping?', 'How much refresh NRR is open?'] },
    { id: 'marketing', name: 'Marketing', color: '#8b5cf6', ep: '/mcp/marketing', owner: 'Marketing',
      segs: ['Sales Campaigns', 'Sales Leads', 'Contacts', 'Customer Satisfaction'],
      src: ['CRM campaigns', 'CSAT surveys'],
      tables: ['Campaigns', 'Campaign members', 'Leads', 'Contacts', 'CSAT responses', 'Calendar'],
      measures: ['Leads', 'Lead to opportunity %', 'Campaign response %', 'CSAT score', 'Promoters'],
      qs: ['Which campaign brought in the most opportunities this year?', 'What is CSAT for Level 1 clients?'] },
    { id: 'finance', name: 'Finance', color: '#e5484d', ep: '/mcp/finance', owner: 'Finance',
      segs: ['Financial', 'Cloud Subscriptions', 'Staffing'],
      src: ['Accounting', 'Cloud marketplace'],
      tables: ['Invoices', 'Payments', 'GL summary', 'Customers', 'Calendar'],
      measures: ['Open AR', 'Past due', 'Days to pay', 'Collected %', 'Revenue', 'Gross margin %'],
      qs: ['Who owes us more than $10K past 90 days?', 'What was collected % for October?', 'How did days to pay change since last quarter?'] },
  ];
  const SEGS = ['Account Management', 'Contacts', 'Client Success Team', 'Ticketing & Support', 'Projects', 'Financial', 'Sales & Pipeline', 'Staffing', 'Sales Leads', 'Sales Campaigns',
    'Device & Asset Mgmt', 'Backup & Recovery', 'Cloud Subscriptions', 'Security & Vulnerability', 'Customer Satisfaction'];
  const SYSTEMS = ['RMM', 'PSA & ticketing', 'Network monitoring', 'IT documentation', 'Backup', 'Microsoft 365', 'MDR', 'Endpoint security', 'Email security', 'Client portal',
    'SaaS management', 'Accounting', 'CRM', 'Contract e-sign', 'Firewall', 'Automation', 'Cloud marketplace', 'CSAT surveys'];

  // ---------- architecture diagram ----------
  const LAYERS = [
    { id: 'ux', label: 'UX / Collaboration', items: [
      { id: 'hub', name: 'The Hub', sub: 'Internal portal (future)', tag: 'future', d: 'A single internal portal where people ask questions and see the answers next to the dashboards. Planned, not built yet.' },
      { id: 'teams', name: 'Teams, Windows, URL', sub: 'Where people ask today', d: 'Users reach the agents from Microsoft Teams, the Windows desktop app or a web link. No new tool to learn.' }] },
    { id: 'llm', label: 'LLM / Analytics', items: [
      { id: 'claude', name: 'Anthropic Claude', sub: 'Connects to bucket MCP endpoints', d: 'Claude connects to one or more bucket MCP endpoints. It only sees the buckets the user has access to, and asks for measures instead of writing SQL against raw tables.' },
      { id: 'copilot', name: 'Microsoft Copilot Studio', sub: 'Agents in Teams', d: 'Copilot Studio agents in Teams use the same bucket endpoints and data agents, so Claude and Copilot give the same numbers.' }] },
    { id: 'sem', label: 'Semantic models / Data agents', items: BUCKETS.map((b) => ({ id: b.id, name: b.name, sub: 'Semantic model + data agent + MCP', color: b.color, bucket: true,
      d: `The ${b.name} bucket: a Power BI semantic model with ${b.tables.length} tables and approved measures like ${b.measures.slice(0, 3).join(', ')}. Its data agent and MCP endpoint (${b.ep}) are the only way AI reaches this data.` })) },
    { id: 'data', label: 'Data: structure, segmentation and policy', items: [
      { id: 'onelake', name: 'OneLake in Microsoft Fabric', sub: 'AI / analytics data, split into 15 segments', d: 'Cleaned, modeled data in Fabric OneLake. It is split into 15 data segments (accounts, contracts, projects, financial and so on), and each bucket only reads the segments it needs.' },
      { id: 'graph', name: 'Microsoft Graph API', sub: 'Users, groups and access', d: 'Users and security groups from Microsoft 365. Used to decide which buckets a person can reach and to apply row-level security.' },
      { id: 'etl', name: 'Data transformation', sub: 'Fabric pipelines and notebooks', d: 'Fabric pipelines and notebooks clean, join and segment the operational data before it lands in OneLake.' },
      { id: 'mysql', name: 'Operational MySQL store', sub: 'Azure Database for MySQL', d: 'The operational store where raw data from every source system lands first, through the API layer.' }] },
    { id: 'api', label: 'Integration', items: [
      { id: 'apil', name: 'API layer', sub: 'Scheduled pulls and webhooks from 18 systems', d: 'Connectors that pull data from each source system on a schedule (or by webhook) into the operational store.' }] },
    { id: 'ext', label: 'External systems', items: [{ id: 'systems', name: '18 source systems', sub: SYSTEMS.join(' · '), wide: true, d: 'The business tools the data comes from: ' + SYSTEMS.join(', ') + '.' }] },
  ];
  // links: which parts work together, used to light up a path on click
  const LINKS = [['hub', 'claude'], ['hub', 'copilot'], ['teams', 'claude'], ['teams', 'copilot'],
    ...BUCKETS.flatMap((b) => [['claude', b.id], ['copilot', b.id], [b.id, 'onelake'], [b.id, 'graph']]),
    ['onelake', 'etl'], ['etl', 'mysql'], ['mysql', 'apil'], ['apil', 'systems'], ['graph', 'onelake']];
  const ALL = LAYERS.flatMap((l) => l.items);
  let picked = 'claude';

  function diagram(el) {
    el.replaceChildren();
    const near = new Set([picked]); LINKS.forEach(([a, b]) => { if (a === picked) near.add(b); if (b === picked) near.add(a); });
    const wrap = document.createElement('div'); wrap.className = 'ib-arch';
    const left = document.createElement('div'); left.className = 'ib-layers';
    LAYERS.forEach((L, i) => {
      if (i) { const ar = document.createElement('div'); ar.className = 'ib-flow'; ar.innerHTML = '<span>▲ ▼</span>'; left.append(ar); }
      const row = document.createElement('div'); row.className = 'ib-layer';
      const lab = document.createElement('div'); lab.className = 'ib-llabel'; lab.textContent = L.label; row.append(lab);
      const box = document.createElement('div'); box.className = 'ib-items ib-n' + L.items.length;
      L.items.forEach((it) => {
        const b = document.createElement('button'); b.type = 'button';
        b.className = 'ib-node' + (it.bucket ? ' ib-bucket' : '') + (it.wide ? ' ib-wide' : '') + (it.tag === 'future' ? ' ib-future' : '') + (it.id === picked ? ' is-on' : near.has(it.id) ? ' is-near' : picked ? ' is-dim' : '');
        if (it.color) b.style.setProperty('--c', it.color);
        b.innerHTML = `<b>${it.name}</b><span>${it.sub}</span>`;
        b.onclick = () => { picked = it.id; diagram(el); };
        box.append(b);
      });
      row.append(box); left.append(row);
    });
    const it = ALL.find((x) => x.id === picked);
    const side = document.createElement('aside'); side.className = 'ib-detail';
    const conn = ALL.filter((x) => x.id !== picked && near.has(x.id)).map((x) => x.name);
    side.innerHTML = `<div class="ib-eye">Selected</div><h4>${it.name}</h4><p>${it.d}</p>` + (conn.length ? `<div class="ib-eye">Works with</div><ul>${conn.map((c) => `<li>${c}</li>`).join('')}</ul>` : '') +
      '<p class="sd-note">Click any box to see what it does and what it connects to.</p>';
    wrap.append(left, side); el.append(wrap);
  }

  function flowSteps(el) {
    const steps = [
      ['Ask', 'A finance lead asks in Teams: "Who owes us more than $10K past 90 days?"'],
      ['Route', 'Claude or Copilot sees which buckets this user can use (Graph API groups) and picks Finance.'],
      ['Query', 'It calls the Finance MCP endpoint, which asks the Finance data agent for the Past due measure, filtered to 90+ days.'],
      ['Secure', 'The semantic model applies row-level security, so the user only gets the customers they are allowed to see.'],
      ['Answer', 'The answer uses the exact measure behind the Accounts Receivable dashboard, so the numbers match.'],
    ];
    el.innerHTML = '<ol class="ib-steps">' + steps.map(([t, x], i) => `<li><span class="ib-sn">${i + 1}</span><div><b>${t}</b><p>${x}</p></div></li>`).join('') + '</ol>';
  }

  function bucketCards(el, F) {
    el.replaceChildren();
    const g = document.createElement('div'); g.className = 'ib-bgrid';
    BUCKETS.forEach((b) => {
      const c = document.createElement('div'); c.className = 'ib-bcard' + (F.state.bucket && F.state.bucket !== b.id ? ' is-dim' : '') + (F.state.bucket === b.id ? ' is-on' : '');
      c.style.setProperty('--c', b.color);
      c.innerHTML = `<div class="ib-bh"><b>${b.name}</b><code>${b.ep}</code></div><div class="ib-bo">Owner: ${b.owner}</div>
        <div class="ib-eye">Approved measures</div><div class="ib-chips">${b.measures.map((m) => `<span>${m}</span>`).join('')}</div>
        <div class="ib-eye">Tables in the model</div><p>${b.tables.join(', ')}</p>
        <div class="ib-eye">Ask it</div><ul>${b.qs.map((q) => `<li>“${q}”</li>`).join('')}</ul>`;
      c.onclick = () => F.toggle('bucket', b.id);
      g.append(c);
    });
    el.append(g);
  }

  if (!document.getElementById('ib-css')) { const st = document.createElement('style'); st.id = 'ib-css'; st.textContent = `
    .ib-arch { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 18px; }
    @media (max-width: 1000px) { .ib-arch { grid-template-columns: 1fr; } }
    .ib-layer { display: grid; grid-template-columns: 150px minmax(0, 1fr); gap: 12px; align-items: stretch; }
    .ib-llabel { font-size: 12px; font-weight: 600; color: var(--color-fg-muted); display: flex; align-items: center; line-height: 1.3; }
    .ib-items { display: grid; gap: 10px; } .ib-n1 { grid-template-columns: 1fr; } .ib-n2 { grid-template-columns: repeat(2, 1fr); } .ib-n4 { grid-template-columns: repeat(4, 1fr); } .ib-n5 { grid-template-columns: repeat(5, 1fr); }
    @media (max-width: 760px) { .ib-n4, .ib-n5 { grid-template-columns: 1fr 1fr; } }
    .ib-node { font: inherit; text-align: left; background: var(--color-panel); border: 1px solid var(--color-border-line); border-radius: 10px; padding: 10px 12px; cursor: pointer; display: flex; flex-direction: column; gap: 3px; transition: opacity .15s, border-color .15s; color: inherit; }
    .ib-node b { font-size: 13.5px; } .ib-node span { font-size: 11.5px; color: var(--color-fg-muted); line-height: 1.35; }
    .ib-bucket { border-top: 4px solid var(--c); } .ib-future { border-style: dashed; }
    .ib-node:hover { border-color: #2f6fed; } .ib-node.is-on { border-color: #0b3b63; box-shadow: 0 0 0 2px #0b3b63 inset; background: #eef4fe; }
    .ib-node.is-near { border-color: #7fa8e8; background: #f6f9ff; } .ib-node.is-dim { opacity: .45; }
    .ib-flow { text-align: center; color: #9aa3ae; font-size: 11px; letter-spacing: 4px; padding: 3px 0 3px 162px; }
    .ib-detail { background: var(--color-bg); border-radius: 12px; padding: 16px; align-self: start; position: sticky; top: 12px; }
    .ib-detail h4 { margin: 2px 0 6px; font-size: 16px; } .ib-detail p { font-size: 13.5px; line-height: 1.5; margin: 0 0 12px; } .ib-detail ul { margin: 0 0 12px; padding-left: 18px; font-size: 13px; }
    .ib-eye { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--color-fg-muted); font-weight: 600; margin: 10px 0 4px; }
    .ib-steps { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    @media (max-width: 1000px) { .ib-steps { grid-template-columns: 1fr; } }
    .ib-steps li { display: flex; gap: 10px; background: var(--color-bg); border-radius: 10px; padding: 12px; } .ib-steps p { margin: 4px 0 0; font-size: 13px; color: var(--color-fg-muted); line-height: 1.45; }
    .ib-sn { flex: none; width: 24px; height: 24px; border-radius: 50%; background: #0b3b63; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .ib-bgrid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
    @media (max-width: 1200px) { .ib-bgrid { grid-template-columns: repeat(2, 1fr); } }
    .ib-bcard { border: 1px solid var(--color-border-line); border-top: 5px solid var(--c); border-radius: 12px; padding: 14px 16px; cursor: pointer; background: var(--color-panel); transition: opacity .15s; }
    .ib-bcard.is-dim { opacity: .45; } .ib-bcard.is-on { box-shadow: 0 0 0 2px var(--c); }
    .ib-bh { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; } .ib-bh b { font-size: 17px; } .ib-bh code { font-size: 11.5px; color: var(--color-fg-muted); background: var(--color-bg); padding: 2px 6px; border-radius: 5px; }
    .ib-bo { font-size: 12px; color: var(--color-fg-muted); margin-top: 2px; }
    .ib-bcard p { font-size: 13px; margin: 0; line-height: 1.45; } .ib-bcard ul { margin: 0; padding-left: 16px; font-size: 13px; line-height: 1.5; color: var(--color-fg-muted); }
    .ib-chips { display: flex; flex-wrap: wrap; gap: 5px; } .ib-chips span { font-size: 11.5px; background: var(--color-bg); border-radius: 999px; padding: 2px 9px; }
    .sd-table th.c { text-align: center; }
    .ib-cell { display: inline-block; width: 14px; height: 14px; border-radius: 4px; vertical-align: middle; }
  `; document.head.append(st); }

  const yes = (b, seg) => b.segs.includes(seg);
  App({
    title: 'Intelligence Buckets',
    eyebrow: 'AI platform · Architecture',
    sub: 'Splitting company data into domain buckets, each with its own Power BI semantic model, data agent and MCP endpoint, so Claude and Copilot answer from governed numbers instead of searching the whole data lake.',
    badge: 'Architecture prototype',
    guide: false,
    files: {},
    story: {
      headline: 'An AI agent pointed at the whole data lake was slow, hard to secure, and gave answers nobody could fully trust.',
      sub: 'The first AI assistant was connected to every table in the lake, about 1,000 of them. For each question it had to hunt for the right tables, check access on each one and work out the business logic itself, so two people asking the same question could get two different numbers.',
      who: 'Leadership, finance, sales, client success and delivery teams who want answers in Teams without opening a dashboard',
      problem: [['Too many tables', 'About 1,000 tables from 18 source systems. The agent spent most of its effort just finding where the data lived.'],
        ['Access checked table by table', 'Every question meant checking permissions on each table it touched. Slow, and easy to get wrong.'],
        ['No shared definitions', 'The agent rebuilt logic like revenue or utilization each time, so its numbers often didn\'t match the dashboards.'],
        ['Hard to grow', 'Adding a new source or a new team meant retesting the whole agent.']],
      built: [['Data split into domain buckets', 'Projects, Contracts, Sales, Marketing and Finance each get their own Power BI semantic model with only the tables and approved measures they need.'],
        ['One MCP endpoint per bucket', 'Claude and Copilot Studio connect only to the buckets a person is allowed to use.'],
        ['Same numbers as the dashboards', 'Agents ask for the same DAX measures that power the reports, so every answer matches what people already trust.'],
        ['Security set once per bucket', 'Workspace roles and row-level security on each model, driven by Microsoft 365 groups, with no table-by-table checks.']],
      resultsTitle: 'Design goals',
      results: { hero: { value: '5', unit: 'domain buckets', label: 'Each with a semantic model, data agent and MCP endpoint' },
        stats: [{ value: '~1,000 → ~40', label: 'Tables in scope per question', unit: 'One bucket instead of the whole lake' }, { value: '1', label: 'Definition per metric', unit: 'Shared with the dashboards' },
          { value: '2', label: 'AI clients, same answers', unit: 'Claude and Copilot Studio' }, { value: '18', label: 'Source systems', unit: 'Through one API layer' }], ba: [] },
      foot: 'These are design goals for the architecture, not measured results. System names are generic.',
      pages: [['architecture', 'Architecture', 'The layers from source systems to Teams, and how a question flows.'], ['buckets', 'Buckets', 'What each bucket holds, its measures, and example questions.'], ['segments', 'Data segments', 'Which of the 15 data segments feed each bucket.']],
    },
    slicers: [{ key: 'bucket', label: 'Bucket', all: 'All buckets', options: () => BUCKETS.map((b) => ({ value: b.id, label: b.name })) }],
    pages: [
      { id: 'context', label: 'Context', slicers: [], blocks: [{ type: 'story' }] },
      { id: 'architecture', label: 'Architecture', slicers: [], blocks: [
        { type: 'row', blocks: [{ type: 'card', span: 12, title: 'System integration', note: 'Data flows up from the source systems; questions flow down from Teams. Click a box to see what it does and what it connects to.', h: 520, draw: (el) => diagram(el) }] },
        { type: 'row', blocks: [{ type: 'card', span: 12, title: 'How a question flows', note: 'One question, end to end.', h: 120, draw: (el) => flowSteps(el) }] },
        { type: 'row', blocks: [{ type: 'table', span: 12, title: 'Before and after', note: 'One agent over the whole lake vs one agent per bucket.',
          cols: [{ label: '', key: 'a' }, { label: 'Before: one agent over the lake', key: 'b' }, { label: 'After: Intelligence Buckets', key: 'c' }],
          rows: () => [
            { a: 'What the agent can see', b: 'About 1,000 tables', c: 'One domain model, roughly 5 to 60 tables' },
            { a: 'Business logic', b: 'Written by the agent each time', c: 'Approved DAX measures, the same ones the dashboards use' },
            { a: 'Access control', b: 'Checked table by table, per question', c: 'Set once per bucket with workspace roles and row-level security' },
            { a: 'Adding a team or source', b: 'Retest the whole agent', c: 'Add or extend one bucket' },
            { a: 'AI clients', b: 'One custom agent', c: 'Any MCP client: Claude, Copilot Studio, and The Hub later' },
          ] }] },
      ] },
      { id: 'buckets', label: 'Buckets', slicers: ['bucket'], blocks: [
        { type: 'row', blocks: [{ type: 'card', span: 12, title: 'The five buckets', note: 'Each bucket is a Power BI semantic model with a data agent and its own MCP endpoint. Click a bucket to focus on it.', h: 300, draw: (el, D, F) => bucketCards(el, F) }] },
        { type: 'row', blocks: [{ type: 'table', span: 12, title: 'Bucket details', note: 'Who owns each bucket, where the data comes from and what it serves.',
          cols: [{ label: 'Bucket', key: 'name', render: (td, r) => { td.innerHTML = `<span class="sd-dot" style="background:${r.color}"></span><b>${r.name}</b>`; } }, { label: 'MCP endpoint', key: 'ep' }, { label: 'Owner', key: 'owner' },
            { label: 'Source data', key: 'src', render: (td, r) => { td.textContent = r.src.join(', '); } }, { label: 'Tables', key: 'nt', cls: 'r', render: (td, r) => { td.textContent = r.tables.length; } },
            { label: 'Measures', key: 'nm', cls: 'r', render: (td, r) => { td.textContent = r.measures.length; } }, { label: 'Data segments', key: 'ns', cls: 'r', render: (td, r) => { td.textContent = r.segs.length; } }],
          rows: (D, F) => BUCKETS.filter((b) => !F.state.bucket || F.state.bucket === b.id), onRow: (r, F) => F.toggle('bucket', r.id) }] },
      ] },
      { id: 'segments', label: 'Data segments', slicers: ['bucket'], blocks: [
        { type: 'kpis', items: [
          { label: 'Data segments', value: () => String(SEGS.length), sub: () => 'Ways the lake is split by type' },
          { label: 'Buckets', value: () => String(BUCKETS.length), sub: () => 'Projects, Contracts, Sales, Marketing, Finance' },
          { label: 'Source systems', value: () => String(SYSTEMS.length), sub: () => 'Through one API layer' },
          { label: 'Segments in this bucket', value: (D, F) => String(F.state.bucket ? BUCKETS.find((b) => b.id === F.state.bucket).segs.length : SEGS.length), sub: (D, F) => (F.state.bucket ? BUCKETS.find((b) => b.id === F.state.bucket).name : 'All buckets') },
        ] },
        { type: 'row', blocks: [{ type: 'table', span: 12, title: 'Data segmentation by bucket', note: 'Which segments of the lake each bucket can read. A segment can feed more than one bucket. Use the Bucket slicer to focus on one.',
          cols: [{ label: 'Data segment', key: 'label' }].concat(BUCKETS.map((b) => ({ label: b.name, key: b.id, cls: 'c', render: (td, r) => { if (yes(b, r.seg)) td.innerHTML = `<span class="ib-cell" style="background:${b.color}"></span>`; td.style.textAlign = 'center'; } })))
            .concat([{ label: 'Buckets', key: 'n', cls: 'r' }]),
          rows: (D, F) => SEGS.map((seg, i) => ({ label: `${i + 1}. ${seg}`, seg, n: BUCKETS.filter((b) => yes(b, seg)).length }))
            .filter((r) => !F.state.bucket || yes(BUCKETS.find((b) => b.id === F.state.bucket), r.seg)) }] },
      ] },
    ],
  });
})();
