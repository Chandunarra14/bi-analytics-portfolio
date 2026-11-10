// User guide content for the PSR Pipeline dashboard. Rendered by ../shared/guide.js.
(function () {
  const ok = (t) => `<span class="g-pill ok">${t}</span>`, warn = (t) => `<span class="g-pill warn">${t}</span>`, bad = (t) => `<span class="g-pill bad">${t}</span>`;
  window.GUIDE = {
    title: 'PSR Pipeline',
    tagline: 'How to read the Executive overview, Funnel trend, Win / loss, Scoping and Impact pages',
    chapters: [
      { group: 'Basics', id: 'start', nav: 'Start here', title: 'Read this guide in 60 seconds',
        lede: 'A PSR (professional services request) is a client asking for project work. This dashboard follows each one from the first ask, to scoping, to won or lost, using Autotask and Salesforce side by side.',
        blocks: [
          { t: 'quick', items: [
            { h: 'Every PSR has a life cycle', p: 'Created in Autotask, scoped by a solutions architect, then closed won or closed lost in Salesforce.' },
            { h: 'Scoping is the bottleneck', p: 'A PSR can\'t be priced until it is scoped. The dashboard shows how many are waiting and for how long.' },
            { h: 'Two systems, one view', p: 'The same PSR is valued in Autotask and in Salesforce. When the numbers don\'t match, a record needs fixing.' },
          ] },
          { t: 'box', accent: 'accent', eyebrow: 'One example used throughout this guide', h: 'A request from Lighthouse Pediatrics',
            html: '<p>Ticket T20251101.3249 was <b>created on Nov 1</b>, <b>scoped on Dec 1</b> (30 days to scope) and <b>closed lost on Jan 7</b> (67-day cycle). Autotask values it at <b>$6,978 NRR</b>, Salesforce at <b>$8,527</b>. That $1,549 gap is the kind of mismatch the dashboard surfaces.</p>' },
          { t: 'table', eyebrow: 'Slicers', head: ['Slicer', 'What it does'], rows: [
            ['PSR type', 'Budgetary (a rough estimate) or Final (a full quote).'], ['CSM', 'The client success manager on the account.'],
            ['Solutions architect', 'The person who scopes the work.'], ['Stage', 'The Salesforce opportunity stage. Only on the Executive overview.'],
          ], note: 'Click bars, slices and rows to filter. Click the same thing again to clear it.' },
        ] },
      { group: 'Basics', id: 'colors', title: 'What the colors mean',
        blocks: [
          { t: 'table', head: ['Where', 'Rule'], rows: [
            ['Needs scope card', warn('Amber') + ' always. These requests are waiting.'],
            ['Overall win %', ok('Green') + ' at 45% or more, ' + warn('amber') + ' below.'],
            ['Won NRR / Lost NRR', ok('Green') + ' for won, ' + bad('red') + ' for lost.'],
            ['CSM win % bar', ok('Green') + ' at 50%+, ' + warn('amber') + ' from 35%, ' + bad('red') + ' below 35%.'],
            ['Oldest PSRs table', 'A ' + bad('red dot') + ' marks requests waiting over 90 days.'],
          ] },
        ] },
      { group: 'Executive overview', id: 'ex-cards', title: 'Executive overview: the cards',
        blocks: [
          { t: 'kpi', label: 'Open PSRs', value: '148', what: 'Requests that are not closed yet.', how: 'Count of PSRs with outcome Open.' },
          { t: 'kpi', label: 'Scoped, awaiting decision', value: '92', sub: 'NRR $1.4M', what: 'Open requests that are scoped and priced, waiting on the client.', how: 'Open PSRs where scoped = Yes. NRR is the Autotask value.' },
          { t: 'kpi', label: 'Needs scope', value: '56', sub: 'NRR $780K', tone: 'warn', what: 'Open requests nobody has scoped yet.', how: 'Open PSRs where scoped = No.' },
          { t: 'kpi', label: 'Open MRR', value: '$42K', what: 'Monthly recurring revenue attached to open requests.', how: 'Autotask MRR added up across open PSRs.' },
          { t: 'kpi', label: 'Avg days to scope', value: '18', sub: 'created to scoped', what: 'How long a request waits before it is scoped.', how: 'Average of (scoped date − created date) for scoped PSRs.', ex: 'Lighthouse Pediatrics: Dec 1 − Nov 1 = 30 days.' },
          { t: 'kpi', label: 'Avg cycle time', value: '54', sub: 'days, created to closed', what: 'How long a request takes from the first ask to a decision.', how: 'Average of (closed date − created date) for closed PSRs.', ex: 'Lighthouse Pediatrics: 67 days.' },
        ] },
      { group: 'Executive overview', id: 'ex-charts', title: 'Executive overview: the charts',
        blocks: [
          { t: 'visual', name: 'Autotask vs Salesforce', kind: 'Grouped bars', legend: [['Autotask', '#1e3a8a'], ['Salesforce', '#0ea5e9']], what: 'Won, lost and open NRR, plus won and open MRR, valued in each system.', read: 'The two bars in each pair should match.', watch: 'A big gap in any pair. Find the PSRs behind it and fix whichever system is wrong.', ex: 'Lighthouse Pediatrics adds $6,978 to Autotask Lost NRR and $8,527 to Salesforce Lost NRR.' },
          { t: 'visual', name: 'Open PSRs pending scope, by age', kind: 'Column chart', what: 'Unscoped requests by how long they have been waiting: 0-30, 31-60, 61-90 and 90+ days.', read: 'You want most requests in the first column.', watch: 'Anything in 90+. Those clients have waited three months for a price.', how: 'Days since created, for open PSRs with scoped = No.' },
          { t: 'visual', name: 'Open opportunities by stage', kind: 'Donut', what: 'Open PSRs by Salesforce stage.', read: 'Each slice is a stage. Hover for the count.', click: 'Click a slice to filter the page to that stage.' },
          { t: 'visual', name: 'Outcomes by month', kind: 'Grouped bars', legend: [['Closed lost', '#e5484d'], ['Closed won', '#18a999']], what: 'PSRs closed won and closed lost in each of the last 12 months.', read: 'Green taller than red is a good month.', how: 'Counted by close month.' },
          { t: 'visual', name: 'Top 25 open PSRs by NRR', kind: 'Table', what: 'The biggest open requests with ticket, account, type, stage, architect, CSM, scoped flag, age, NRR and MRR.', read: 'Start at the top: these are the deals worth chasing first.', click: 'Click a row to filter to that solutions architect.' },
        ] },
      { group: 'Funnel trend', id: 'funnel', title: 'Funnel trend', lede: 'How many requests come in, get scoped and get won over time.',
        blocks: [
          { t: 'visual', name: 'Created, scoped and won by month', kind: 'Grouped bars', legend: [['Created', '#1e3a8a'], ['Scoped', '#0ea5e9'], ['Won', '#18a999']], what: 'Three counts for each of the last 12 months.', read: 'Scoped should keep up with created. Won is always the smallest.', watch: 'Created rising while scoped stays flat. The backlog is growing.', how: 'Created counts by created date, scoped by scoped date, won by close date.' },
          { t: 'visual', name: 'NRR requested vs won', kind: 'Line chart', legend: [['Requested NRR', '#1e3a8a'], ['Won NRR', '#18a999']], what: 'NRR of requests created each month, against NRR closed won.', read: 'The gap between the lines is demand that didn\'t turn into revenue (yet).' },
          { t: 'visual', name: 'Weekly requests, last 13 weeks', kind: 'Line chart', legend: [['Created', '#1e3a8a'], ['Scoped', '#0ea5e9']], what: 'PSRs created and scoped each week.', read: 'Use it to spot a busy week coming into the scoping queue.' },
        ] },
      { group: 'Win / loss', id: 'winloss', title: 'Win / loss',
        blocks: [
          { t: 'kpi', label: 'Budgetary win %', value: '38%', what: 'Win rate for budgetary (rough estimate) PSRs.', how: 'Won ÷ (won + lost), budgetary PSRs only. Open ones are left out.', click: 'Click the card to filter to budgetary PSRs.' },
          { t: 'kpi', label: 'Final win %', value: '52%', what: 'Win rate for final (full quote) PSRs.', how: 'Won ÷ (won + lost), final PSRs only.', click: 'Click the card to filter to final PSRs.' },
          { t: 'kpi', label: 'Overall win %', value: '46%', tone: 'good', what: 'Win rate across all closed PSRs.', how: 'Won ÷ (won + lost).', colors: 'Green at 45% or more, amber below.', ex: '46 won and 54 lost = 46%.' },
          { t: 'kpi', label: 'Won NRR', value: '$2.1M', tone: 'good', what: 'NRR on PSRs closed won.' },
          { t: 'kpi', label: 'Lost NRR', value: '$1.6M', tone: 'bad', what: 'NRR on PSRs closed lost.', ex: 'Lighthouse Pediatrics adds $6,978.' },
          { t: 'visual', name: 'Outcomes by PSR type', kind: 'Stacked bars', legend: [['Closed lost', '#e5484d'], ['Closed won', '#18a999']], what: 'Closed won and lost for budgetary and final PSRs.', read: 'Final PSRs usually win more often, because the client already asked for a full quote.', click: 'Click a bar to filter by type.' },
          { t: 'visual', name: 'CSM performance', kind: 'Table', what: 'Tickets, won, lost, win %, won NRR and lost NRR for each CSM.', read: 'The small bar in the Win % column is colored by the rule on the colors page.', click: 'Click a row to filter to that CSM.' },
        ] },
      { group: 'Scoping', id: 'scoping', title: 'Scoping', lede: 'Where requests are waiting and who has them.',
        blocks: [
          { t: 'visual', name: 'PSRs scoped per month', kind: 'Column chart', what: 'How many PSRs were scoped in each of the last 12 months.', read: 'This is the scoping team\'s output.' },
          { t: 'visual', name: 'Open PSRs by queue', kind: 'Horizontal bars', what: 'Which Autotask queue each open request is sitting in.', watch: 'A long bar on one queue means requests are stuck there.' },
          { t: 'visual', name: 'Open PSRs by solutions architect', kind: 'Table', what: 'Open, scoped and unscoped PSRs per architect, unscoped NRR, and their average days to scope.', read: 'Sorted by most unscoped first.', click: 'Click a row to filter to that architect.' },
          { t: 'visual', name: 'Top 25 oldest PSRs still waiting for scope', kind: 'Table', what: 'The longest-waiting unscoped requests with architect, NRR and age.', watch: 'Red dots are over 90 days.' },
        ] },
      { group: 'Impact', id: 'impact', title: 'The Impact page', lede: 'What changed after the dashboard went live in February 2026. The slicers do not apply here.',
        blocks: [
          { t: 'table', head: ['Section', 'What it shows'], rows: [
            ['Effort saved (big card)', 'Matching Autotask PSR tickets to Salesforce opportunities by hand took about 20 hours a week. Now it is about 2 hours of exception review.'],
            ['Stat cards and before vs after', 'Hours saved a year, days to scope and win rate. Days to scope uses PSRs created in each window, win rate uses PSRs closed in each window.'],
            ['Chart', 'Average days to scope by month created, with go-live marked.'],
            ['How the work changed', 'Each part of the process before and after. These are effort estimates, not system data.'],
          ], note: 'Before = first 3 months of the data, after = latest 3 months. Every figure is sample data.' },
        ] },
    ],
    glossary: [
      ['PSR', 'Professional services request: a client asking for project work.'], ['Budgetary', 'A rough price so the client can plan.'], ['Final', 'A full, detailed quote.'],
      ['Scoped', 'An architect has worked out what the job needs and what it costs.'], ['NRR', 'Non-recurring (one-time) revenue.'], ['MRR', 'Monthly recurring revenue.'],
      ['Cycle time', 'Days from created to closed.'], ['Win %', 'Won ÷ (won + lost). Open PSRs are left out.'], ['Queue', 'The Autotask queue the ticket is assigned to.'],
    ],
  };
})();
