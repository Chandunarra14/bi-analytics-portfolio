// User guide content for the Server End-of-Life Pipeline dashboard. Rendered by ../shared/guide.js.
(function () {
  const ST = [['Needs PSR', '#e5484d'], ['PSR In Progress', '#f59e0b'], ['Presented To Client', '#8b5cf6'], ['Closed Won', '#18a999'], ['Closed Lost', '#64748b'], ['Decommissioning', '#0ea5e9'], ['Not Actionable', '#cbd5e1']];
  const ok = (t) => `<span class="g-pill ok">${t}</span>`, warn = (t) => `<span class="g-pill warn">${t}</span>`, bad = (t) => `<span class="g-pill bad">${t}</span>`;

  window.GUIDE = {
    title: 'Server End-of-Life Pipeline',
    tagline: 'How to read the Overview, Account pipeline, Campaign trend and Impact pages',
    chapters: [
      { group: 'Basics', id: 'start', nav: 'Start here', title: 'Read this guide in 60 seconds',
        lede: 'The dashboard lists every client server running an old Windows Server version, and tracks the refresh campaign and sales pipeline for each of those clients.',
        blocks: [
          { t: 'quick', items: [
            { h: 'Three OS versions are tracked', p: 'Server 2008 and 2012 are already past end of life. Server 2016 reaches end of life in January 2027.' },
            { h: 'Every client gets a status', p: 'Each affected client sits in one campaign status, from Needs PSR to Closed Won. That shows where the refresh conversation is.' },
            { h: 'NRR is the money', p: 'Gross NRR is the one-time project revenue from the refresh. It comes from the CRM opportunity linked to the client.' },
          ] },
          { t: 'box', accent: 'accent', eyebrow: 'One example used throughout this guide', h: 'Alpine Veterinary',
            html: '<p>Alpine Veterinary is a Level 5 client with <b>7 servers</b> on old versions: <b>2 on Server 2012</b> and <b>5 on Server 2016</b>. Its status is <b>PSR In Progress</b>, it has an open opportunity worth <b>$105K NRR</b>, and the note says "Talking to client Friday, budget in place".</p>',
            bar: [{ label: '2 already EOL', v: 2, color: '#e5484d' }, { label: '5 nearing EOL', v: 5, color: '#f2a541' }] },
          { t: 'table', eyebrow: 'Slicers', head: ['Slicer', 'What it does'], rows: [
            ['OS version', 'Shows only clients that run at least one server on that version.'], ['Campaign status', 'Shows only clients in that status.'],
            ['CSM', 'Shows only one CSM\'s book of clients.'], ['Account level', 'Shows only clients at that level (Level 1 to 5).'],
          ], note: 'Most bars, slices and rows are also clickable: click once to filter, click again to clear. The Campaign trend page always shows everything.' },
        ] },
      { group: 'Basics', id: 'colors', title: 'What the colors mean',
        blocks: [
          { t: 'table', head: ['Color', 'Meaning'], rows: [
            [bad('Red'), 'Already past end of life (Server 2008 and 2012), Closed lost, or Needs PSR.'],
            [warn('Amber'), 'Nearing end of life (Server 2016).'], [ok('Green'), 'Closed won, or servers retired.'],
          ] },
          { t: 'box', eyebrow: 'Campaign statuses', html: ST.map(([s, c]) => `<span style="display:inline-block;margin:0 14px 6px 0"><i style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${c};margin-right:6px"></i>${s}</span>`).join('') },
        ] },
      { group: 'Overview', id: 'ov-cards', title: 'Overview: the cards', lede: 'Six cards across the top. They all follow the slicers.',
        blocks: [
          { t: 'kpi', label: 'Servers tracked', value: '1,240', sub: '186 clients', what: 'All servers on the three tracked versions, and how many clients they belong to.', how: 'Server 2008 + 2012 + 2016 servers, added up across clients.', ex: 'Alpine Veterinary adds 7 servers and 1 client.' },
          { t: 'kpi', label: 'Critical (already EOL)', value: '412', sub: '98 affected clients', tone: 'bad', what: 'Servers that no longer get security updates.', how: 'Server 2008 + Server 2012 servers.', ex: 'Alpine Veterinary adds 2.' },
          { t: 'kpi', label: 'Nearing EOL (2016)', value: '828', sub: '160 affected clients', tone: 'warn', what: 'Servers that lose support in January 2027.', how: 'Server 2016 servers.', ex: 'Alpine Veterinary adds 5.' },
          { t: 'kpi', label: 'Open opportunities', value: '42', sub: 'Open NRR $1.9M', what: 'Clients with a refresh opportunity that is still open, and the NRR on them.', how: 'Count of clients whose opportunity is Open. NRR is added up.', ex: 'Alpine Veterinary is open at $105K.' },
          { t: 'kpi', label: 'Closed won', value: '31', sub: 'Won NRR $1.2M', tone: 'good', what: 'Clients who agreed to the refresh.', how: 'Count of clients whose opportunity is Won.', click: 'Click the card to filter to Closed Won. Click again to clear.' },
          { t: 'kpi', label: 'Closed lost', value: '9', sub: 'Lost NRR $310K', tone: 'bad', what: 'Clients who said no to the refresh.', how: 'Count of clients whose opportunity is Lost.', click: 'Click the card to filter to Closed Lost.' },
        ] },
      { group: 'Overview', id: 'ov-charts', title: 'Overview: the charts',
        blocks: [
          { t: 'visual', name: 'Server footprint by OS version', kind: 'Horizontal bars', what: 'How many servers run each version.', read: 'Red bars are already past end of life. The blue bar is Server 2016.', watch: 'A long red bar. Those servers have no security updates.', how: 'Servers on that version, added up across the clients selected.', click: 'Click a bar to show only clients running that version.' },
          { t: 'visual', name: 'Refresh campaign progress', kind: 'Column chart', what: 'How many clients sit in each campaign status.', read: 'Over time you want clients moving right, toward Closed Won and Decommissioning.', watch: 'A tall Needs PSR column. Those clients have no proposal yet.', how: 'Count of clients in each status. This chart ignores the status slicer so you can always see the full picture.', click: 'Click a bar to filter the page to that status.' },
          { t: 'visual', name: 'Pipeline NRR by status', kind: 'Donut', legend: ST, what: 'Refresh NRR split by campaign status. The middle shows the total.', read: 'The legend shows each status\'s NRR and its share of the total.', watch: 'A big Presented To Client slice. That money is waiting on the client.', how: 'Gross NRR added up by status.', click: 'Click a slice to filter to that status.' },
          { t: 'visual', name: 'EOL servers by CSM', kind: 'Stacked bars', legend: [['Already EOL', '#e5484d'], ['Nearing EOL', '#f2a541']], what: 'Old servers in each CSM\'s book, split into already EOL and nearing EOL.', read: 'Tallest bar first. The red part is the urgent work.', watch: 'A CSM with a lot of red and few open opportunities.', how: '2008 + 2012 servers (red) and 2016 servers (amber) for each CSM\'s clients.', click: 'Click a bar to filter to that CSM.' },
        ] },
      { group: 'Account pipeline', id: 'accounts', title: 'Account pipeline', lede: 'One table with every affected client on it.',
        blocks: [
          { t: 'visual', name: 'One-panel view', kind: 'Table', what: 'Every affected client with servers by version, CSM, PSR ticket, status, notes and gross NRR.', read: 'Most urgent clients are at the top. The bottom row has totals.', how: 'Sorted by an urgency score: each 2008 server counts 3, each 2012 server counts 2 and each 2016 server counts 1.', click: 'Click a row to filter to that client\'s status.', ex: 'Alpine Veterinary scores 2×2 + 5×1 = 9.' },
        ] },
      { group: 'Campaign trend', id: 'trend', title: 'Campaign trend', lede: 'How the campaign has moved month by month. This page has no slicers.',
        blocks: [
          { t: 'kpi', label: 'EOL servers remaining', value: '1,240', sub: 'from 1,356 a year ago', what: 'Old servers still in use at the latest month end.', how: 'The latest month-end count. The line under it adds back the servers retired since the first month.' },
          { t: 'kpi', label: 'Retired last 3 months', value: '46', tone: 'good', what: 'Old servers replaced or shut down in the last 3 months.', how: 'Servers retired, added up over the latest 3 months.' },
          { t: 'kpi', label: 'Refresh PSRs last 3 months', value: '31', what: 'New refresh proposals opened in the last 3 months.', how: 'PSRs created, added up over the latest 3 months.' },
          { t: 'kpi', label: 'Won NRR, 12 months', value: '$339K', tone: 'good', what: 'Refresh revenue won over the last year.', how: 'Running total of won NRR at the latest month.' },
          { t: 'visual', name: 'EOL servers remaining', kind: 'Line chart', what: 'Month-end count of old servers, with the dashboard go-live marked.', read: 'You want the line going down.', watch: 'A flat line after go-live means servers are not being retired.' },
          { t: 'visual', name: 'Won refresh NRR by month', kind: 'Column chart', what: 'NRR closed won from refresh opportunities in each month.', read: 'Taller is better. Look for a steady run, not one big month.' },
        ] },
      { group: 'Impact', id: 'impact', title: 'The Impact page', lede: 'What changed after the dashboard went live in February 2026. It compares fixed windows, so the slicers do not apply.',
        blocks: [
          { t: 'table', head: ['Section', 'What it shows'], rows: [
            ['Effort saved (big card)', 'Time saved each month. Matching RMM exports to CRM opportunities in a spreadsheet used to take about 10 hours a week.'],
            ['Stat cards', 'Hours saved a year, servers retired, won NRR from the campaign, and the two systems now joined in one view.'],
            ['Before vs after', 'Servers retired, PSRs created and NRR won per month, and days to list affected clients. Before is the first 3 months of data, after is the latest 3.'],
            ['Monthly chart', 'Servers retired and PSRs created each month.'],
            ['What it meant for clients', 'Security gaps closed, owners and next steps on every client, and revenue booked ahead of the 2016 deadline.'],
            ['How the work changed', 'Each part of the process before and after. These are effort estimates, not system data.'],
          ] },
        ] },
    ],
    glossary: [
      ['EOL', 'End of life. Microsoft no longer ships security updates for that version.'], ['ESU', 'Extended Security Updates. Paid updates for a short time after EOL.'],
      ['RMM', 'The remote monitoring tool that reports each server\'s OS.'], ['PSR', 'Professional services request: the proposal ticket for the refresh project.'],
      ['NRR', 'Non-recurring revenue: one-time project revenue.'], ['CSM', 'Client success manager who owns the client relationship.'],
      ['Decommissioning', 'The server will be shut down instead of replaced.'], ['Not Actionable', 'Nothing to sell, for example the server belongs to a third party.'],
    ],
  };
})();
