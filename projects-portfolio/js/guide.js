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
          { t: 'visual', name: 'Projects by RYG status', kind: 'Donut', legend: RYG, what: 'Active projects split by RYG.', read: 'You want most of the donut green.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'RYG status by implementation type', kind: 'Stacked bars', legend: RYG, what: 'RYG split for each implementation type.', watch: 'A type with a lot of red, for example onboardings that drag on.', click: 'Click a bar to filter by type, or a legend item to filter by status.' },
          { t: 'visual', name: 'Projects by lead and RYG status', kind: 'Stacked bars', legend: RYG, what: 'Each lead\'s open projects, split by RYG. Busiest lead on the left.', read: 'Compare load and health. A tall bar with lots of red is a lead who needs help.', click: 'Click a bar to filter to that lead.' },
          { t: 'visual', name: 'Project details', kind: 'Table', what: 'Every active project with RYG, account, level, type, status, lead, start date, age, % done, NRR and MRR.', read: 'Oldest first, so the stuck projects are at the top.' },
        ] },
      { group: 'Revenue movement', id: 'revenue', title: 'Revenue movement', lede: 'Projects and revenue coming in against projects and revenue being delivered.',
        blocks: [
          { t: 'visual', name: 'New vs closed projects by month', kind: 'Grouped bars', legend: [['New', '#1e3a8a'], ['Closed', '#0ea5e9']], what: 'Projects opened and completed in each of the last 12 months.', read: 'If New is taller than Closed for months in a row, the backlog is growing.' },
          { t: 'visual', name: 'NRR: new bookings vs closed', kind: 'Line chart', legend: [['New', '#1e3a8a'], ['Closed', '#0ea5e9']], what: 'NRR of projects opened each month against NRR of projects completed.', read: 'Closed NRR is revenue delivered. New NRR is revenue booked.' },
          { t: 'visual', name: 'MRR: new vs closed', kind: 'Line chart', what: 'The same view for MRR, mostly from onboarding projects.', read: 'MRR usually starts when the onboarding project closes.' },
          { t: 'visual', name: 'Monthly NRR: delivered, this month and booked ahead', kind: 'Stacked bars', legend: [['Past 12 months', '#1e3a8a'], ['Current month', '#0ea5e9'], ['Next months', '#f97316']],
            what: 'NRR delivered in each of the past 12 months, what is due this month, and what is due over the next 6 months.', how: 'Past months use completion date. Future months use each open project\'s current end date.', watch: 'A thin orange run ahead means the pipeline is drying up.' },
        ] },
      { group: 'NRR backlog', id: 'backlog', title: 'NRR backlog', lede: 'Revenue sold but not delivered yet.',
        blocks: [
          { t: 'kpi', label: 'Backlog NRR (active)', value: '$3.4M', what: 'All NRR on open projects.' },
          { t: 'kpi', label: 'Due this month', value: '$420K', sub: '22 projects', what: 'NRR on open projects planned to end this month.' },
          { t: 'kpi', label: 'Completed this month', value: '$180K', sub: '9 projects', tone: 'good', what: 'NRR on projects already completed this month.' },
          { t: 'kpi', label: 'Past end date', value: '37', sub: 'still open after planned end', tone: 'bad', what: 'Open projects whose planned end month has already passed.' },
          { t: 'visual', name: 'Backlog burndown by planned end month', kind: 'Waterfall', what: 'Backlog NRR stepping down by the month each project is due to finish.', how: 'Projects already past their end date are counted in the current month.', read: 'Each step is the revenue that should be delivered that month.' },
          { t: 'visual', name: 'Backlog NRR by account level', kind: 'Donut', what: 'Backlog NRR split by client level. The middle shows the total.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'Active portfolio by % complete', kind: 'Column chart', what: 'Open projects grouped by % complete: 0%, 1-25%, 26-50%, 51-75%, 76-99% and 100%.', watch: 'Projects at 100% that are still open. They just need closing out.' },
        ] },
      { group: 'Budget & margin', id: 'budget', title: 'Budget & margin', lede: 'Whether projects are using the hours that were sold, and what that does to margin.',
        blocks: [
          { t: 'kpi', label: 'Above Rate / Under Value / Over Budget / Zero Budget', name: 'Budget status cards', value: '120', sub: 'active projects', what: 'Four cards, one per budget status, counting active projects.', colors: 'Above Rate is green, Under Value amber, Over Budget red.', click: 'Click a card to filter to that status.' },
          { t: 'kpi', label: 'Avg margin (active)', value: '24%', what: 'Average margin across active projects.', how: 'Average of (1 − worked ÷ contracted hours). Projects with 5 contracted hours or less are left out.', ex: 'Hilltop: 1 − 10.5 ÷ 18 = 42%.' },
          { t: 'visual', name: 'Active project health', kind: 'Donut', legend: BUD, what: 'Active projects split by budget status.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'Completed projects by budget status', kind: 'Horizontal bars', what: 'All completed projects by budget status. Over Budget is shown in red.', read: 'This is the track record: how often projects finish over budget.', click: 'Click a bar to filter.' },
          { t: 'visual', name: 'Active NRR projects: contracted vs realized margin', kind: 'Table', what: 'Each active NRR project with age, NRR, contracted hours, worked hours, margin % and budget status.', read: 'Lowest margin first, so the projects losing money are at the top.', how: 'Margin = 1 − worked ÷ contracted hours.' },
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
