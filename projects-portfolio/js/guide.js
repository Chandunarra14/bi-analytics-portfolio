// User guide content for the Projects Portfolio dashboard. Rendered by ../shared/guide.js.
(function () {
  const RYG = [['Green', '#22a06b'], ['Yellow', '#f2c230'], ['Red', '#e5484d'], ['Blue', '#2f6fed']];
  const BUD = [['Above Rate', '#22a06b'], ['Under Value', '#f97316'], ['Over Budget', '#e5484d'], ['Zero Budget', '#94a3b8']];
  const ok = (t) => `<span class="g-pill ok">${t}</span>`, warn = (t) => `<span class="g-pill warn">${t}</span>`, bad = (t) => `<span class="g-pill bad">${t}</span>`, nav = (t) => `<span class="g-pill nav">${t}</span>`;
  window.GUIDE = {
    title: 'Projects Portfolio',
    tagline: 'How to read the Active projects, Revenue movement, NRR backlog, Budget & margin and Impact pages',
    chapters: [
      { group: 'Basics', id: 'start', nav: 'Start here', title: 'Read this guide in 60 seconds',
        lede: 'The dashboard covers every client project: which ones are on track, which are stuck, how much revenue is still to be delivered, and whether projects are making money.',
        blocks: [
          { t: 'quick', items: [
            { h: 'RYG is about age', p: 'A project turns Yellow after 120 days in progress and Red after 180. Blue means it is on hold.' },
            { h: 'NRR is the backlog', p: 'NRR is one-time project revenue. An active project\'s NRR is revenue still to be delivered.' },
            { h: 'Margin is about hours', p: 'Margin compares hours worked with hours sold. Going over the sold hours eats the margin.' },
          ] },
          { t: 'box', accent: 'accent', eyebrow: 'One example used throughout this guide', h: 'A Fix-Bid project for Hilltop Family Medicine',
            html: '<p>The project was sold with <b>18 contracted hours</b> and <b>$3,150 NRR</b>. The team worked <b>10.5 hours</b> and finished it in 65 days.</p><p>Margin = 1 − 10.5 ÷ 18 = <b>42%</b>. It earned $300 per worked hour, so its budget status is <b>Above Rate</b>.</p>' },
          { t: 'table', eyebrow: 'Slicers', head: ['Slicer', 'What it does'], rows: [
            ['Project lead', 'Projects run by one lead.'], ['Implementation type', 'Onboarding, Fix-Bid, Billable Service Request or OffBoarding.'],
            ['Classification', 'The client\'s account level.'], ['RYG status', 'Only on the Active projects page.'], ['Budget status', 'Only on the Budget & margin page.'],
          ], note: 'Click bars, slices, legend items and cards to filter. Click again to clear.' },
        ] },
      { group: 'Basics', id: 'colors', title: 'What the colors mean',
        blocks: [
          { t: 'table', eyebrow: 'RYG status (active projects)', head: ['Status', 'Rule'], rows: [
            [ok('Green'), 'In progress 120 days or less.'], [warn('Yellow'), 'In progress 121 to 180 days.'], [bad('Red'), 'In progress more than 180 days.'], [nav('Blue'), 'On hold.'],
          ] },
          { t: 'table', eyebrow: 'Budget status', head: ['Status', 'Rule'], rows: [
            [ok('Above Rate'), 'Within budget and earning at least $140 per worked hour.'], [warn('Under Value'), 'Earning less than $140 per worked hour.'],
            [bad('Over Budget'), 'Worked hours are more than 110% of contracted hours.'], ['<span class="g-pill">Zero Budget</span>', 'No NRR on the project.'],
          ] },
          { t: 'table', eyebrow: 'Margin %', head: ['Color', 'Rule'], rows: [[bad('Red'), 'Under 0%: more hours worked than sold.'], [warn('Amber'), '0% to 20%.'], [ok('Green'), 'Over 20%.']] },
        ] },
      { group: 'Active projects', id: 'active', title: 'Active projects',
        blocks: [
          { t: 'kpi', label: 'Active projects', value: '214', what: 'Projects that are still open.', how: 'Count of projects not yet completed.' },
          { t: 'kpi', label: 'Active NRR', value: '$3.4M', sub: '168 NRR projects', what: 'One-time revenue on open projects, and how many of them carry NRR.', how: 'NRR added up across active projects.' },
          { t: 'kpi', label: 'Active MRR projects', value: '61', sub: '$48K MRR', what: 'Open projects that bring new monthly revenue, usually onboarding.', how: 'Active projects with MRR above zero.' },
          { t: 'kpi', label: 'Red', value: '24', sub: '> 180 days in progress', tone: 'bad', what: 'Projects open more than 180 days.', click: 'Click the card to filter to Red projects.' },
          { t: 'kpi', label: 'Yellow', value: '31', sub: '121–180 days', tone: 'warn', what: 'Projects open 121 to 180 days.', click: 'Click the card to filter to Yellow projects.' },
          { t: 'kpi', label: 'Avg age', value: '96', sub: 'days', what: 'Average days since active projects started.' },
          { t: 'visual', name: 'Projects by RYG status', h: 200, chart: (el) => GX.donut(el, { center: 'active', items: [['Green', 148, '#22a06b'], ['Yellow', 31, '#f2c230'], ['Red', 24, '#e5484d'], ['Blue', 11, '#2f6fed']] }), watch: "A growing red slice.", how: "Active projects counted by RYG, which comes from days in progress.", kind: 'Donut', legend: RYG, what: 'Active projects split by RYG.', read: 'You want most of the donut green.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'RYG status by implementation type', h: 220, chart: (el) => GX.bars(el, { cats: ['Onboarding', 'Fix-Bid', 'Billable SR', 'OffBoarding'], stacked: true, series: [['Green', '#22a06b', [52, 60, 28, 8]], ['Yellow', '#f2c230', [12, 10, 6, 3]], ['Red', '#e5484d', [11, 7, 3, 3]], ['Blue', '#2f6fed', [4, 4, 2, 1]]] }), read: "Compare how much of each bar is red and yellow.", how: "Active projects counted by implementation type and RYG.", kind: 'Stacked bars', legend: RYG, what: 'RYG split for each implementation type.', watch: 'A type with a lot of red, for example onboardings that drag on.', click: 'Click a bar to filter by type, or a legend item to filter by status.' },
          { t: 'visual', name: 'Projects by lead and RYG status', h: 230, chart: (el) => GX.bars(el, { cats: ['Diane', 'John', 'Priya', 'Marcus', 'Elena'], stacked: true, series: [['Green', '#22a06b', [34, 30, 28, 30, 26]], ['Yellow', '#f2c230', [8, 7, 6, 5, 5]], ['Red', '#e5484d', [7, 6, 5, 3, 3]], ['Blue', '#2f6fed', [3, 2, 2, 2, 2]]] }), watch: "A lead with lots of red projects on a full plate.", how: "Active projects counted by lead and RYG.", kind: 'Stacked bars', legend: RYG, what: 'Each lead\'s open projects, split by RYG. Busiest lead on the left.', read: 'Compare load and health. A tall bar with lots of red is a lead who needs help.', click: 'Click a bar to filter to that lead.' },
          { t: 'visual', name: 'Project details', h: 110, chart: (el) => GX.table(el, ['Project', 'RYG', 'Account', 'Type', 'Lead', 'Age', '% done', 'NRR'], [['P20260302.0114', GX.dot('#e5484d', 'Red'), 'Coastal Ortho Group', 'Onboarding', 'Diane Foster', '253', '70%', '$24,500'], ['P20260714.0302', GX.dot('#22a06b', 'Green'), 'Hilltop Family Medicine', 'Fix-Bid', 'John Atwood', '119', '40%', '$3,150']]), watch: "Old projects with low % done.", how: "Active projects sorted by age, oldest first.", kind: 'Table', what: 'Every active project with RYG, account, level, type, status, lead, start date, age, % done, NRR and MRR.', read: 'Oldest first, so the stuck projects are at the top.' },
        ] },
      { group: 'Revenue movement', id: 'revenue', title: 'Revenue movement', lede: 'Projects and revenue coming in against projects and revenue being delivered.',
        blocks: [
          { t: 'visual', name: 'New vs closed projects by month', h: 210, chart: (el) => GX.bars(el, { cats: GX.months(12).map((m) => m.slice(0, 3)), values: false, series: [['New', '#1e3a8a', [22, 25, 24, 28, 26, 30, 27, 29, 31, 28, 30, 26]], ['Closed', '#0ea5e9', [20, 22, 25, 24, 27, 26, 29, 28, 27, 30, 29, 28]]] }), watch: "New taller than closed for several months.", how: "Projects counted by created month and by completion month.", kind: 'Grouped bars', legend: [['New', '#1e3a8a'], ['Closed', '#0ea5e9']], what: 'Projects opened and completed in each of the last 12 months.', read: 'If New is taller than Closed for months in a row, the backlog is growing.' },
          { t: 'visual', name: 'NRR: new bookings vs closed', h: 210, chart: (el) => GX.line(el, { cats: GX.months(12), zero: true, fmt: (v) => '$' + d3.format('.2~s')(v), series: [['New', '#1e3a8a', [310, 290, 340, 360, 330, 380, 350, 400, 370, 390, 410, 380].map((v) => v * 1000)], ['Closed', '#0ea5e9', [260, 280, 300, 310, 320, 330, 340, 350, 360, 345, 370, 365].map((v) => v * 1000)]] }), watch: "New NRR falling for a few months: less work coming in.", how: "NRR added up by created month (new) and by completion month (closed).", kind: 'Line chart', legend: [['New', '#1e3a8a'], ['Closed', '#0ea5e9']], what: 'NRR of projects opened each month against NRR of projects completed.', read: 'Closed NRR is revenue delivered. New NRR is revenue booked.' },
          { t: 'visual', name: 'MRR: new vs closed', h: 210, chart: (el) => GX.line(el, { cats: GX.months(12), zero: true, fmt: (v) => '$' + d3.format('.2~s')(v), series: [['New', '#1e3a8a', [8, 9, 7, 10, 11, 9, 12, 10, 11, 13, 12, 11].map((v) => v * 1000)], ['Closed', '#0ea5e9', [6, 7, 8, 8, 9, 10, 9, 11, 10, 11, 12, 12].map((v) => v * 1000)]] }), watch: "A gap where closed MRR lags new MRR: onboardings are slow to go live.", how: "MRR added up by created month and by completion month.", kind: 'Line chart', what: 'The same view for MRR, mostly from onboarding projects.', read: 'MRR usually starts when the onboarding project closes.' },
          { t: 'visual', name: 'Monthly NRR: delivered, this month and booked ahead', h: 230, chart: (el) => GX.bars(el, { cats: ['Jul 26', 'Aug 26', 'Sep 26', 'Oct 26', 'Nov 26', 'Dec 26', 'Jan 27', 'Feb 27'], stacked: true, values: false, fmt: (v) => '$' + d3.format('.2~s')(v), series: [['Past 12 months', '#1e3a8a', [340, 350, 360, 345, 0, 0, 0, 0].map((v) => v * 1000)], ['Current month', '#0ea5e9', [0, 0, 0, 0, 420000, 0, 0, 0]], ['Next months', '#f97316', [0, 0, 0, 0, 0, 380, 300, 210].map((v) => v * 1000)]] }), read: "Navy bars are delivered, the light blue bar is this month, orange bars are booked ahead.", kind: 'Stacked bars', legend: [['Past 12 months', '#1e3a8a'], ['Current month', '#0ea5e9'], ['Next months', '#f97316']],
            what: 'NRR delivered in each of the past 12 months, what is due this month, and what is due over the next 6 months.', how: 'Past months use completion date. Future months use each open project\'s current end date.', watch: 'A thin orange run ahead means the pipeline is drying up.' },
        ] },
      { group: 'NRR backlog', id: 'backlog', title: 'NRR backlog', lede: 'Revenue sold but not delivered yet.',
        blocks: [
          { t: 'kpi', label: 'Backlog NRR (active)', value: '$3.4M', what: 'All NRR on open projects.' },
          { t: 'kpi', label: 'Due this month', value: '$420K', sub: '22 projects', what: 'NRR on open projects planned to end this month.' },
          { t: 'kpi', label: 'Completed this month', value: '$180K', sub: '9 projects', tone: 'good', what: 'NRR on projects already completed this month.' },
          { t: 'kpi', label: 'Past end date', value: '37', sub: 'still open after planned end', tone: 'bad', what: 'Open projects whose planned end month has already passed.' },
          { t: 'visual', name: 'Backlog burndown by planned end month', h: 220, chart: (el) => GX.waterfall(el, { color: '#0ea5e9', fmt: (v) => '$' + d3.format('.2~s')(v), items: [['Nov 26', 900000], ['Dec 26', 800000], ['Jan 27', 650000], ['Feb 27', 500000], ['Mar 27', 330000], ['Apr 27', 220000]] }), watch: "A very tall first step: lots of overdue projects rolled into this month.", kind: 'Waterfall', what: 'Backlog NRR stepping down by the month each project is due to finish.', how: 'Projects already past their end date are counted in the current month.', read: 'Each step is the revenue that should be delivered that month.' },
          { t: 'visual', name: 'Backlog NRR by account level', h: 210, chart: (el) => GX.donut(el, { center: 'backlog NRR', fmt: (v) => '$' + d3.format('.2~s')(v), items: [['Level 1', 1100000, '#2f6fed'], ['Level 2', 900000, '#18a999'], ['Level 3', 700000, '#f2a541'], ['Level 4', 450000, '#8b5cf6'], ['Level 5', 250000, '#e5484d']] }), read: "Bigger slices hold more undelivered revenue.", watch: "Most of the backlog sitting with one level of client.", how: "Active project NRR added up by client level.", kind: 'Donut', what: 'Backlog NRR split by client level. The middle shows the total.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'Active portfolio by % complete', h: 200, chart: (el) => GX.bars(el, { cats: ['0%', '1–25%', '26–50%', '51–75%', '76–99%', '100%'], series: [['Projects', '#1e3a8a', [28, 46, 52, 44, 32, 12]]] }), read: "A healthy portfolio has projects spread across the stages.", how: "Active projects counted by their % complete.", kind: 'Column chart', what: 'Open projects grouped by % complete: 0%, 1-25%, 26-50%, 51-75%, 76-99% and 100%.', watch: 'Projects at 100% that are still open. They just need closing out.' },
        ] },
      { group: 'Budget & margin', id: 'budget', title: 'Budget & margin', lede: 'Whether projects are using the hours that were sold, and what that does to margin.',
        blocks: [
          { t: 'kpi', label: 'Above Rate / Under Value / Over Budget / Zero Budget', name: 'Budget status cards', value: '120', sub: 'active projects', what: 'Four cards, one per budget status, counting active projects.', colors: 'Above Rate is green, Under Value amber, Over Budget red.', click: 'Click a card to filter to that status.' },
          { t: 'kpi', label: 'Avg margin (active)', value: '24%', what: 'Average margin across active projects.', how: 'Average of (1 − worked ÷ contracted hours). Projects with 5 contracted hours or less are left out.', ex: 'Hilltop: 1 − 10.5 ÷ 18 = 42%.' },
          { t: 'visual', name: 'Active project health', h: 200, chart: (el) => GX.donut(el, { center: 'active', items: [['Above Rate', 120, '#22a06b'], ['Under Value', 38, '#f97316'], ['Over Budget', 26, '#e5484d'], ['Zero Budget', 30, '#94a3b8']] }), read: "You want most of the donut green.", watch: "A growing red Over Budget slice.", how: "Active projects counted by budget status.", kind: 'Donut', legend: BUD, what: 'Active projects split by budget status.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'Completed projects by budget status', h: 160, chart: (el) => GX.hbars(el, { items: [['Above Rate', 410], ['Under Value', 160], ['Over Budget', 120], ['Zero Budget', 85]], color: '#1e3a8a', hi: (v, l) => l === 'Over Budget' }), watch: "A long red Over Budget bar.", how: "Completed projects counted by budget status.", kind: 'Horizontal bars', what: 'All completed projects by budget status. Over Budget is shown in red.', read: 'This is the track record: how often projects finish over budget.', click: 'Click a bar to filter.' },
          { t: 'visual', name: 'Active NRR projects: contracted vs realized margin', h: 110, chart: (el) => GX.table(el, ['Project', 'Account', 'NRR', 'Contracted hrs', 'Worked hrs', 'Margin %', 'Budget status'], [['P20260302.0114', 'Coastal Ortho Group', '$16,275', '93', '112', GX.dot('var(--color-bad)', '−21%'), GX.dot('#e5484d', 'Over Budget')], ['P20251125.0001', 'Hilltop Family Medicine', '$3,150', '18', '10.5', GX.dot('var(--color-ok)', '42%'), GX.dot('#22a06b', 'Above Rate')]]), watch: "Negative margins at the top of the table.", kind: 'Table', what: 'Each active NRR project with age, NRR, contracted hours, worked hours, margin % and budget status.', read: 'Lowest margin first, so the projects losing money are at the top.', how: 'Margin = 1 − worked ÷ contracted hours.' },
        ] },
      { group: 'Impact', id: 'impact', title: 'The Impact page', lede: 'What changed after the dashboard went live in February 2026. The slicers do not apply here.',
        blocks: [
          { t: 'table', head: ['Section', 'What it shows'], rows: [
            ['Effort saved (big card)', 'Project status, backlog and margin packs used to take about 80 hours a month across PMs and finance.'],
            ['Before vs after', 'Projects closed in the first 3 months of data against projects closed in the latest 3 months, including margin and over-budget share.'],
            ['Chart', 'Share of closed projects over budget each month (worked hours above 110% of contracted).'],
            ['How the work changed', 'Each part of the process before and after. These are effort estimates, not system data.'],
          ] },
        ] },
    ],
    glossary: [
      ['RYG', 'Red, Yellow, Green (and Blue for on hold): a project health flag based on age.'], ['NRR', 'Non-recurring (one-time) project revenue.'], ['MRR', 'Monthly recurring revenue a project starts.'],
      ['Backlog', 'NRR on projects that are not finished.'], ['Contracted hours', 'Hours sold to the client.'], ['Worked hours', 'Hours the team logged on the project.'],
      ['Margin', '1 − worked ÷ contracted hours.'], ['Fix-Bid', 'Fixed price project.'], ['Billable Service Request', 'Smaller paid work billed by the hour.'],
    ],
  };
})();
