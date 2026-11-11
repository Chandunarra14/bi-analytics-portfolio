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
          { t: 'visual', name: 'Autotask vs Salesforce', h: 220, chart: (el) => GX.bars(el, { cats: ['Won NRR', 'Lost NRR', 'Open NRR', 'Won MRR', 'Open MRR'], fmt: (v) => '$' + d3.format('.2~s')(v), series: [['Autotask', '#1e3a8a', [2100000, 1600000, 2200000, 64000, 42000]], ['Salesforce', '#0ea5e9', [2180000, 1640000, 2350000, 66000, 45000]]] }), how: "The same PSRs added up twice: once with Autotask values, once with the matching Salesforce opportunity values.", kind: 'Grouped bars', legend: [['Autotask', '#1e3a8a'], ['Salesforce', '#0ea5e9']], what: 'Won, lost and open NRR, plus won and open MRR, valued in each system.', read: 'The two bars in each pair should match.', watch: 'A big gap in any pair. Find the PSRs behind it and fix whichever system is wrong.', ex: 'Lighthouse Pediatrics adds $6,978 to Autotask Lost NRR and $8,527 to Salesforce Lost NRR.' },
          { t: 'visual', name: 'Open PSRs pending scope, by age', h: 200, chart: (el) => GX.bars(el, { cats: ['0-30', '31-60', '61-90', '90+'], series: [['PSRs', '#2f6fed', [28, 14, 8, 6]]] }), kind: 'Column chart', what: 'Unscoped requests by how long they have been waiting: 0-30, 31-60, 61-90 and 90+ days.', read: 'You want most requests in the first column.', watch: 'Anything in 90+. Those clients have waited three months for a price.', how: 'Days since created, for open PSRs with scoped = No.' },
          { t: 'visual', name: 'Open opportunities by stage', h: 210, chart: (el) => GX.donut(el, { center: 'open', items: [['Qualify', 52, '#2f6fed'], ['Proposal', 46, '#18a999'], ['Negotiate', 30, '#f2a541'], ['Verbal', 20, '#8b5cf6']] }), watch: "A big early-stage slice with few deals near the end.", how: "Count of open PSRs by their Salesforce stage.", kind: 'Donut', what: 'Open PSRs by Salesforce stage.', read: 'Each slice is a stage. Hover for the count.', click: 'Click a slice to filter the page to that stage.' },
          { t: 'visual', name: 'Outcomes by month', h: 210, chart: (el) => GX.bars(el, { cats: GX.months(12).map((m) => m.slice(0, 3)), series: [['Closed lost', '#e5484d', [6, 5, 7, 4, 5, 6, 4, 5, 3, 4, 5, 4]], ['Closed won', '#18a999', [4, 5, 4, 6, 7, 6, 8, 7, 8, 9, 7, 8]]] }), watch: "Several months in a row where red is taller than green.", kind: 'Grouped bars', legend: [['Closed lost', '#e5484d'], ['Closed won', '#18a999']], what: 'PSRs closed won and closed lost in each of the last 12 months.', read: 'Green taller than red is a good month.', how: 'Counted by close month.' },
          { t: 'visual', name: 'Top 25 open PSRs by NRR', h: 110, chart: (el) => GX.table(el, ['Ticket', 'Account', 'Type', 'Stage', 'Architect', 'Scoped', 'Age', 'NRR'], [['T20261002.4410', 'Maple Ridge Nonprofit', 'PSR - Final', 'Proposal', 'Frankie Lowe', 'Yes', '39', '$84,500'], ['T20260918.1172', 'Lighthouse Pediatrics', 'PSR - Budgetary', 'Qualify', 'Dana Brooks', 'No', '53', '$61,200']]), watch: "Big deals that are still unscoped or getting old.", how: "Open PSRs sorted by Autotask NRR, largest first, top 25.", kind: 'Table', what: 'The biggest open requests with ticket, account, type, stage, architect, CSM, scoped flag, age, NRR and MRR.', read: 'Start at the top: these are the deals worth chasing first.', click: 'Click a row to filter to that solutions architect.' },
        ] },
      { group: 'Funnel trend', id: 'funnel', title: 'Funnel trend', lede: 'How many requests come in, get scoped and get won over time.',
        blocks: [
          { t: 'visual', name: 'Created, scoped and won by month', h: 230, chart: (el) => GX.bars(el, { cats: GX.months(12).map((m) => m.slice(0, 3)), values: false, series: [['Created', '#1e3a8a', [22, 25, 24, 28, 26, 30, 27, 29, 31, 28, 30, 26]], ['Scoped', '#0ea5e9', [15, 18, 20, 24, 24, 27, 26, 27, 29, 27, 28, 24]], ['Won', '#18a999', [4, 5, 4, 6, 7, 6, 8, 7, 8, 9, 7, 8]]] }), kind: 'Grouped bars', legend: [['Created', '#1e3a8a'], ['Scoped', '#0ea5e9'], ['Won', '#18a999']], what: 'Three counts for each of the last 12 months.', read: 'Scoped should keep up with created. Won is always the smallest.', watch: 'Created rising while scoped stays flat. The backlog is growing.', how: 'Created counts by created date, scoped by scoped date, won by close date.' },
          { t: 'visual', name: 'NRR requested vs won', h: 210, chart: (el) => GX.line(el, { cats: GX.months(12), zero: true, fmt: (v) => '$' + d3.format('.2~s')(v), series: [['Requested NRR', '#1e3a8a', [420, 460, 440, 510, 480, 530, 500, 520, 560, 510, 540, 490].map((v) => v * 1000)], ['Won NRR', '#18a999', [80, 95, 90, 120, 140, 130, 160, 150, 170, 180, 150, 165].map((v) => v * 1000)]] }), watch: "The won line falling while requests stay high.", how: "Requested = NRR of PSRs by created month. Won = NRR of PSRs closed won by close month.", kind: 'Line chart', legend: [['Requested NRR', '#1e3a8a'], ['Won NRR', '#18a999']], what: 'NRR of requests created each month, against NRR closed won.', read: 'The gap between the lines is demand that didn\'t turn into revenue (yet).' },
          { t: 'visual', name: 'Weekly requests, last 13 weeks', h: 210, chart: (el) => GX.line(el, { cats: ['Aug 17', 'Aug 24', 'Aug 31', 'Sep 07', 'Sep 14', 'Sep 21', 'Sep 28', 'Oct 05', 'Oct 12', 'Oct 19', 'Oct 26', 'Nov 02', 'Nov 09'], zero: true, series: [['Created', '#1e3a8a', [6, 7, 5, 8, 7, 6, 9, 7, 6, 8, 7, 6, 5]], ['Scoped', '#0ea5e9', [5, 6, 5, 6, 7, 6, 7, 7, 6, 6, 7, 6, 4]]] }), watch: "Weeks where created is well above scoped. The queue grows.", how: "PSRs counted by the Monday of the week they were created or scoped.", kind: 'Line chart', legend: [['Created', '#1e3a8a'], ['Scoped', '#0ea5e9']], what: 'PSRs created and scoped each week.', read: 'Use it to spot a busy week coming into the scoping queue.' },
        ] },
      { group: 'Win / loss', id: 'winloss', title: 'Win / loss',
        blocks: [
          { t: 'kpi', label: 'Budgetary win %', value: '38%', what: 'Win rate for budgetary (rough estimate) PSRs.', how: 'Won ÷ (won + lost), budgetary PSRs only. Open ones are left out.', click: 'Click the card to filter to budgetary PSRs.' },
          { t: 'kpi', label: 'Final win %', value: '52%', what: 'Win rate for final (full quote) PSRs.', how: 'Won ÷ (won + lost), final PSRs only.', click: 'Click the card to filter to final PSRs.' },
          { t: 'kpi', label: 'Overall win %', value: '46%', tone: 'good', what: 'Win rate across all closed PSRs.', how: 'Won ÷ (won + lost).', colors: 'Green at 45% or more, amber below.', ex: '46 won and 54 lost = 46%.' },
          { t: 'kpi', label: 'Won NRR', value: '$2.1M', tone: 'good', what: 'NRR on PSRs closed won.' },
          { t: 'kpi', label: 'Lost NRR', value: '$1.6M', tone: 'bad', what: 'NRR on PSRs closed lost.', ex: 'Lighthouse Pediatrics adds $6,978.' },
          { t: 'visual', name: 'Outcomes by PSR type', h: 210, chart: (el) => GX.bars(el, { cats: ['Budgetary', 'Final'], stacked: true, series: [['Closed lost', '#e5484d', [31, 23]], ['Closed won', '#18a999', [19, 27]]] }), watch: "Budgetary PSRs that rarely turn into wins: they cost scoping time.", how: "Closed PSRs counted by type and outcome. Open ones are left out.", kind: 'Stacked bars', legend: [['Closed lost', '#e5484d'], ['Closed won', '#18a999']], what: 'Closed won and lost for budgetary and final PSRs.', read: 'Final PSRs usually win more often, because the client already asked for a full quote.', click: 'Click a bar to filter by type.' },
          { t: 'visual', name: 'CSM performance', h: 110, chart: (el) => GX.table(el, ['CSM', 'Tickets', 'Won', 'Lost', 'Win %', 'Won NRR', 'Lost NRR'], [['Morgan Reyes', '48', '14', '12', GX.dot('var(--color-ok)', '54%'), '$610K', '$420K'], ['Riley Carter', '41', '9', '15', GX.dot('var(--color-bad)', '38%'), '$380K', '$510K']]), watch: "A CSM with a low win % and high lost NRR.", how: "Win % = won \u00f7 (won + lost). Tickets counts every PSR, open or closed.", kind: 'Table', what: 'Tickets, won, lost, win %, won NRR and lost NRR for each CSM.', read: 'The small bar in the Win % column is colored by the rule on the colors page.', click: 'Click a row to filter to that CSM.' },
        ] },
      { group: 'Scoping', id: 'scoping', title: 'Scoping', lede: 'Where requests are waiting and who has them.',
        blocks: [
          { t: 'visual', name: 'PSRs scoped per month', h: 200, chart: (el) => GX.bars(el, { cats: GX.months(12).map((m) => m.slice(0, 3)), series: [['Scoped', '#1e3a8a', [15, 18, 20, 24, 24, 27, 26, 27, 29, 27, 28, 24]]] }), watch: "A drop in scoped while new requests keep coming.", how: "PSRs counted by the month they were scoped.", kind: 'Column chart', what: 'How many PSRs were scoped in each of the last 12 months.', read: 'This is the scoping team\'s output.' },
          { t: 'visual', name: 'Open PSRs by queue', h: 170, chart: (el) => GX.hbars(el, { items: [['Solutions Architect', 62], ['Client Success Manager', 44], ['Project Coordination', 26], ['Sales Engineering', 16]], color: '#0ea5e9' }), read: "The longest bar is the queue holding the most open requests.", how: "Open PSRs counted by their Autotask queue.", kind: 'Horizontal bars', what: 'Which Autotask queue each open request is sitting in.', watch: 'A long bar on one queue means requests are stuck there.' },
          { t: 'visual', name: 'Open PSRs by solutions architect', h: 110, chart: (el) => GX.table(el, ['Architect', 'Open', 'Scoped', 'Unscoped', 'Unscoped NRR', 'Avg days to scope'], [['Dana Brooks', '24', '12', '12', '$310K', '26'], ['Frankie Lowe', '19', '15', '4', '$90K', '14']]), watch: "An architect with many unscoped requests and a high average days to scope.", how: "Open PSRs per architect, split by scoped flag. Average days to scope uses all their scoped PSRs.", kind: 'Table', what: 'Open, scoped and unscoped PSRs per architect, unscoped NRR, and their average days to scope.', read: 'Sorted by most unscoped first.', click: 'Click a row to filter to that architect.' },
          { t: 'visual', name: 'Top 25 oldest PSRs still waiting for scope', h: 110, chart: (el) => GX.table(el, ['Ticket', 'Architect', 'NRR', 'Age'], [['T20260702.3311', 'Dana Brooks', '$42K', GX.dot('var(--color-bad)', '131')], ['T20260811.0941', 'Frankie Lowe', '$18K', '91']]), read: "Oldest first. Each one is a client still waiting for a price.", how: "Open, unscoped PSRs sorted by days since created, top 25.", kind: 'Table', what: 'The longest-waiting unscoped requests with architect, NRR and age.', watch: 'Red dots are over 90 days.' },
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
