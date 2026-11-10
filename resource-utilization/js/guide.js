// User guide content for the Resource Utilization dashboard. Rendered by ../shared/guide.js.
(function () {
  const C = { ms: '#0a84d6', rp: '#0b3b63', comp: '#14b8a6', sga: '#65a30d', ip: '#f08a0c', se: '#8b5cf6', ad: '#7c8796', be: '#d14343', pto: '#c9ced6', t: '#0b3b63', nt: '#f08a0c' };
  const CATS = [['Managed Services', C.ms], ['Revenue Project', C.rp], ['COMPed', C.comp], ['SG&A', C.sga], ['Internal Projects', C.ip], ['Sustained Engineering', C.se], ['Admin', C.ad], ['Bench', C.be, 1], ['PTO', C.pto]];
  const FOUR = [['Target work', C.t], ['Non-target work', C.nt], ['Admin', C.ad], ['Bench', C.be]];
  const ok = (t) => `<span class="g-pill ok">${t}</span>`, warn = (t) => `<span class="g-pill warn">${t}</span>`, bad = (t) => `<span class="g-pill bad">${t}</span>`;

  window.GUIDE = {
    title: 'Resource Utilization',
    tagline: 'How to read the Individual, Team and Impact pages',
    chapters: [
      { group: 'Basics', id: 'start', nav: 'Start here', title: 'Read this guide in 60 seconds',
        lede: 'The dashboard shows where people\'s working hours went and whether that time went to the work their role is planned for. There is an Individual view and a Team view, and each one has WTD, MTD, QTD and YTD.',
        blocks: [
          { t: 'quick', items: [
            { h: 'A full week is 40 hours', p: 'That is 8 hours for each weekday. PTO comes off first. What is left is called available hours.' },
            { h: 'The goal is 80%', p: 'About 8 of every 10 available hours should go to target work. The other 2 are the admin allowance.' },
            { h: 'Every role has a plan', p: 'Each role splits its 80% across work areas. A Technician, for example, is planned at 70% Managed Services and 10% Revenue Project.' },
          ] },
          { t: 'box', accent: 'accent', eyebrow: 'One example used throughout this guide', h: 'Maya\'s week',
            html: '<p>Maya is a Technician in Field Operations with no PTO this week, so she has <b>40 available hours</b>. Her goal is 80% of that, <b>32 hours</b> of target work.</p>',
            bar: [{ label: '30 Managed Services', v: 30, color: C.ms }, { label: '1', v: 1, color: C.rp }, { label: '1', v: 1, color: C.comp }, { label: '4 admin', v: 4, color: C.ad }, { label: '4 bench', v: 4, color: C.be, out: true }],
            note: 'She logged 30 hours of Managed Services, 1 of Revenue Project, 1 of COMPed and 4 of admin, and had 4 hours with nothing booked.' },
          { t: 'table', eyebrow: 'The numbers behind the example', head: ['', 'Hours', 'Note'], rows: [
            ['Available', '40', '5 weekdays × 8, no PTO'], ['Goal', '32', '80% of 40'],
            ['Planned Managed Services / Revenue Project', '28 / 4', '70% and 10% of 40 available'],
            ['Target work', '31', '30 Managed Services + 1 Revenue Project, both in her plan'],
            ['Non-target work', '1', 'COMPed is not in any role\'s plan'], ['Admin', '4', 'Allowance is 20%, 8 hours'], ['Bench', '4', 'Hours with nothing booked'],
          ] },
          { t: 'box', eyebrow: 'Who the numbers describe', html: '<p>The Individual cards show the <b>average per person</b> for whoever is selected. Pick one person and you see their numbers. Pick a department, or leave it on All, and you see the average person in that group. The Team view shows the group as a whole: shares, headcounts and totals.</p>' },
        ] },

      { group: 'Basics', id: 'periods', title: 'Periods and filters', lede: 'The WTD, MTD, QTD and YTD buttons change the time window for every card and chart on the page.',
        blocks: [
          { t: 'table', head: ['Button', 'Shows', 'Compared with', 'Trend chart'], rows: [
            ['WTD', 'The latest full week', 'The prior week and the 4-week average', 'Last 13 weeks'],
            ['MTD', 'The current month so far', 'Last month and the 3-month average', 'Last 6 months'],
            ['QTD', 'The current quarter so far', 'Last quarter and the 3-quarter average', 'Last 4 quarters'],
            ['YTD', 'Everything since January 1', 'Nothing. The page switches to its own layout', 'Last 13 months'],
          ], note: 'A month or quarter is built from the weeks that start inside it.' },
          { t: 'grid2', boxes: [
            { accent: 'amber', eyebrow: 'Slicers', h: 'Department and Resource', html: '<p>Department narrows everything to one team. Resource narrows the Individual view to one person. The Team view only has Department.</p>' },
            { accent: 'amber', eyebrow: 'Click to filter', h: 'Bars and rows are clickable', html: '<p>Click a person\'s bar to focus the page on them, and click again to clear it. In the Team roster, clicking a row opens that person in the Individual view. <b>Reset filters</b> clears everything.</p>' },
          ] },
        ] },

      { group: 'Basics', id: 'colors', title: 'What the colors mean', lede: 'Card numbers change color when they need attention. Most cards use three states.',
        blocks: [
          { t: 'table', head: ['Card', 'Green', 'Amber', 'Red'], rows: [
            ['Target share', ok('80% or more'), warn('60% to 79%'), bad('under 60%')],
            ['Target attainment / target work hours', ok('100% of goal or more'), warn('75% to 99%'), bad('under 75%')],
            ['Mix alignment', ok('80% or more'), warn('60% to 79%'), bad('under 60%')],
            ['Admin', ok('20% of available or less'), '–', bad('over 20%')],
            ['Bench (Individual)', '–', warn('15% of available or less'), bad('over 15%')],
          ] },
          { t: 'table', eyebrow: 'In the tables', head: ['Where', 'Rule'], rows: [
            ['Export table, Actual %', 'Red when it is more than 10 points under the target %. Green when it is above target.'],
            ['Bench hrs column', 'Red when bench is more than 15% of that person\'s available hours.'],
            ['Team roster, Status', 'Exceeds target at 110%+, On target at 100%+, Near target at 80%+, otherwise Missed target.'],
            ['YTD attainment column', 'Green at 100% or more, red under 100%.'],
          ] },
        ] },

      { group: 'Individual view', id: 'ind-cards', title: 'Individual view: the cards', lede: 'Seven cards run across the top on WTD, MTD and QTD. The small line under each number gives context.',
        blocks: [
          { t: 'kpi', label: 'Available hours', value: '40', sub: 'per person · week of Nov 02', what: 'The hours the person could have worked in the period.', how: '40 hours for each week in the period, minus PTO.', ex: 'Maya worked all five days: 40. With Friday as PTO it would be 32.' },
          { t: 'kpi', label: 'Target work hours', value: '31', sub: 'of 32 target · 97%', tone: 'warn', what: 'Hours spent in the work areas the person\'s role has a plan for. Admin, bench, PTO and non-target work do not count.', how: 'Add up the hours in every planned work area. The line under it compares that to the goal (80% of available).', colors: 'Uses the attainment rule: green at 100% of goal, amber from 75%, red under 75%.', ex: '30 Managed Services + 1 Revenue Project = 31. Goal is 32, so 97%.' },
          { t: 'kpi', label: 'Target share of week', value: '78%', sub: 'of the 40-hr week · floor 80%', tone: 'warn', what: 'How much of the available time went to target work.', how: 'Target work hours ÷ available hours.', colors: 'Green at 80%+, amber from 60%, red under 60%.', ex: '31 ÷ 40 = 78%. Just under the 80% floor, so amber.' },
          { t: 'kpi', label: 'Admin hours', value: '4', sub: '10% of week · allowance 20%', tone: 'good', what: 'Hours on internal admin.', how: 'Admin hours, with their share of available hours underneath.', colors: 'Green up to 20% of available, red above it.', ex: '4 ÷ 40 = 10%. Well inside the 8-hour allowance.' },
          { t: 'kpi', label: 'Bench hours', value: '4', sub: '10% of week', tone: 'warn', what: 'Available hours with no work booked against them.', how: 'Bench hours, with their share of available hours underneath.', colors: 'Red when bench is over 15% of available, amber otherwise.', ex: '4 ÷ 40 = 10%.' },
          { t: 'kpi', label: 'Overage', value: '0%', sub: 'hours past 40 a week', what: 'How much work went beyond a normal 40-hour week.', how: 'For each person and week, the hours logged over 40. Add them up and divide by available hours.', ex: 'Maya logged exactly 40, so 0%. A 44-hour week would show 4 ÷ 40 = 10%.' },
          { t: 'kpi', label: 'Mix alignment', value: '91%', sub: 'vs planned hours · 80% floor', tone: 'good', what: 'Whether target work went to the right work areas in the right amounts. 100% means every planned hour was covered.', how: 'For each planned area, take the smaller of actual and planned hours. Add those up and divide by total planned hours. Extra hours in one area can\'t make up for a shortfall in another.', colors: 'Green at 80%+, amber from 60%, red under 60%.', ex: 'Plan: 28 Managed Services, 4 Revenue Project. Actual: 30 and 1. Covered: 28 + 1 = 29 of 32 = 91%.' },
          { t: 'box', accent: 'accent', eyebrow: 'Share vs mix', html: '<p>Target share says <b>how much</b> time went to target work. Mix alignment says whether it went to the <b>right kinds</b> of target work. Maya did plenty of Managed Services but almost no Revenue Project, so her mix is lower than her attainment would suggest.</p>' },
        ] },

      { group: 'Individual view', id: 'ind-charts', title: 'Individual view: the charts', lede: 'Three charts and a table sit below the cards. All of them respond to the period, Department and Resource slicers.',
        blocks: [
          { t: 'visual', name: 'Where the week went', kind: 'Stacked bars', sub: 'Named for the period: week, month or quarter.', legend: CATS,
            what: 'Three bars: this period, the prior period and the average. Each color is a work area and its width is hours per person.',
            read: 'Compare the bars. If this period looks like the average, nothing changed. The red outlined block is bench.',
            watch: 'Bench growing period over period. Admin above 8 hours a week. A work area that disappears.',
            how: 'Hours in each area ÷ number of people selected.',
            ex: 'Maya\'s bar: 30 Managed Services, 1 Revenue Project, 1 COMPed, 4 admin, 4 bench = 40.' },
          { t: 'visual', name: '13-week trend', kind: 'Line chart', sub: 'Shows 6 months on MTD and 4 quarters on QTD.', legend: [['Mix alignment', '#65a30d'], ['Target share', '#0a84d6'], ['80% floor', '#9aa3ae']],
            what: 'Target share and mix alignment for each week (or month, or quarter), against the 80% floor.',
            read: 'Lines climbing toward the floor are good. Hover a point to see the exact value.',
            watch: 'A sudden dip. Check available hours for that period first, a PTO-heavy week can move the percentages.',
            how: 'Each point is worked out on its own window, the same way as the cards.', ex: 'Maya\'s latest point: share 78%, mix 91%.' },
          { t: 'visual', name: 'Distribution to target, by resource', kind: 'Stacked bars', sub: 'One bar per person, lowest target work on the left.', legend: FOUR,
            what: 'Each person\'s hours split four ways. The dashed line is the 80% target in hours.',
            read: 'Look at where the dark part reaches the dashed line. People on the far left are the first coaching conversations. Scroll sideways to see everyone.',
            watch: 'Big orange blocks: busy, but not on planned work. Big red blocks: free time that went unused. People on full PTO show an empty bar.',
            how: 'Target work = planned areas. Non-target = areas outside the plan, like COMPed. Admin and bench as logged.',
            click: 'Click a bar to focus the page on that person. Click again to clear.', ex: 'Maya: 31 target, 1 non-target, 4 admin, 4 bench.' },
          { t: 'visual', name: 'Target mix: planned vs actual', kind: 'Grouped bars', legend: [['Planned (role mix)', '#c9ced6'], ['Actual, in target', C.t], ['Actual, out of target', C.be]],
            what: 'For each work area: the planned hours, the hours worked by people who have that area in their plan, and the hours worked by people who don\'t.',
            read: 'Dark blue close to gray means the plan was met. Red means time went somewhere the role has no plan for.',
            watch: 'Admin, bench, PTO and COMPed are never in a role\'s plan, so they always show as red.',
            how: 'Planned = role % × available hours. Everything is per person.', ex: 'Maya planned 28 Managed Services and did 30 (in target). Her 1 COMPed hour shows as red.' },
          { t: 'visual', name: 'Export: resource by category', kind: 'Table',
            what: 'The numbers behind the charts, one row per person and work area.',
            read: 'Target % and Actual % each add up to 100% per person, so you can compare them directly.',
            watch: 'Red Actual % means that area is more than 10 points under plan.',
            how: 'Target hrs = role % × available. Target % is the role\'s plan. Actual % = that area\'s hours ÷ the person\'s total hours.',
            ex: 'Maya, Managed Services: target 28 hrs (70%), actual 30 hrs (75%).' },
        ] },

      { group: 'Individual view', id: 'ind-ytd', title: 'Individual view: year to date', lede: 'YTD covers everything since January 1. It has its own layout.',
        blocks: [
          { t: 'visual', name: 'Where every available hour went', kind: 'Card grid',
            what: 'A total available hours card, then one card for each of the nine work areas, including bench and PTO.',
            read: 'Each card shows hours per person and the share of available hours underneath.',
            watch: 'A large Bench or Admin card.', how: 'Hours in each area for the year ÷ people selected. The total is 40 × weeks so far, minus PTO.' },
          { t: 'visual', name: 'Headline cards', kind: 'Cards', what: 'Target work hours, target share, bench hours and mix alignment for the whole year so far.', how: 'Same formulas as the weekly cards, over a longer window.', colors: '' },
          { t: 'visual', name: 'Where the year went', kind: 'Stacked bar', legend: CATS, what: 'One bar for the year, split by work area. It is the cards above as one picture.', read: 'The wide blue block is Managed Services. The red outlined block is bench.' },
          { t: 'visual', name: 'Distribution to target', kind: 'Column chart', what: 'Counts people by how much of their goal they reached: under 40%, 40 to 60%, 60 to 80%, 80 to 100% and 100%+.',
            read: 'You want people moving to the right.', watch: 'A tall column on the far left.', how: 'Each person\'s target work ÷ their goal (80% of available), then counted into a band.', ex: 'Maya at 97% lands in 80 to 100%.' },
          { t: 'visual', name: 'Hours distribution trend', kind: 'Line chart', legend: FOUR, what: 'One point per month, four lines.', read: 'You want target work high and steady, and bench low.', how: 'Each kind of hours ÷ available hours for that month.', watch: 'The latest month is still in progress.' },
          { t: 'visual', name: 'Target mix: planned vs actual', kind: 'Grouped bars', what: 'Same chart as on the other periods, for the whole year.' },
          { t: 'visual', name: 'Hours by person', kind: 'Table', what: 'One row per person, highest target work first.', how: 'Available = target + non-target + admin + bench. Attainment = target work ÷ goal.', click: 'Click a row to focus the page on that person.', watch: 'Red bench means over 15% of available.' },
        ] },

      { group: 'Team view', id: 'team-cards', title: 'Team view: the cards', lede: 'The Team view looks at a whole department as a group. It only has the Department slicer.',
        blocks: [
          { t: 'box', eyebrow: 'Example team of two', html: '<p>Maya (40 available, 31 target) and Sam, who took Friday off: 32 available, 20 target, 5 admin, 5 bench, 2 COMPed. Together: <b>72 available, 51 target</b>, goal 57.6.</p>' },
          { t: 'kpi', label: 'Team target share', value: '71%', sub: '51 of 72 available hrs · target 80%', tone: 'warn', what: 'The share of the team\'s available time that went to target work.', how: 'Total target hours ÷ total available hours.', ex: '51 ÷ 72 = 71%.' },
          { t: 'kpi', label: 'Target attainment', value: '89%', sub: '51 of 57.6 target hrs', tone: 'warn', what: 'Target work compared with the goal.', how: 'Total target hours ÷ (80% of total available).', ex: '51 ÷ 57.6 = 89%. Same week as 71% share, just measured against the goal.' },
          { t: 'kpi', label: 'Bench', value: '4.5', sub: 'hrs/person · 12.5% of available · 2 of 2 people', tone: 'bad', what: 'Average bench hours per person, and how many people had any bench at all.', how: 'Total bench ÷ people. The share is total bench ÷ total available.', ex: '(4 + 5) ÷ 2 = 4.5 hours each.' },
          { t: 'kpi', label: 'Admin share', value: '12.5%', sub: '9 hrs · allowance 14 (20%)', tone: 'good', what: 'Admin hours as a share of available hours. The allowance is 20%.', how: 'Total admin ÷ total available.', ex: '9 ÷ 72 = 12.5%.' },
          { t: 'kpi', label: 'Mix alignment', value: '84%', sub: 'hours-weighted across the team', tone: 'good', what: 'Same measure as on the Individual view, for the whole team.', how: 'Covered planned hours ÷ planned hours, added up across everyone, so bigger plans count more.' },
          { t: 'kpi', label: 'On or above target', value: '0 of 2', sub: '0 exceed · 2 missed', what: 'How many people reached 100% of their goal.', how: 'Count of people with attainment of 100% or more. Exceed means 110% or more.', ex: 'Maya at 97% and Sam at 78% both missed.' },
          { t: 'box', accent: 'accent', eyebrow: 'On YTD', html: '<p>The cards switch to <b>averages per person</b> for the year: available, target work, non-target, admin, bench and PTO, each with its share of available hours.</p>' },
        ] },

      { group: 'Team view', id: 'team-charts', title: 'Team view: charts and roster', lede: 'Three charts and a roster table sit below the cards.',
        blocks: [
          { t: 'visual', name: 'Cumulative team hours by work area', kind: 'Horizontal bars', legend: CATS,
            what: 'Total hours the team logged in each work area for the period. It grows with team size.', read: 'The longest bars are where the team\'s time goes. Bench is outlined.',
            watch: 'A long Bench bar, or a work area that should be busy but is short.', how: 'Hours in each area, added up across everyone selected.', ex: 'Maya + Sam, Managed Services: 30 + 20 = 50 hours.' },
          { t: 'visual', name: 'Hours distribution', kind: 'Line chart', sub: '13 weeks on WTD, 6 months on MTD, 4 quarters on QTD, 13 months on YTD.', legend: FOUR,
            what: 'The share of the team\'s available hours that went to each of four kinds of work, period by period.', read: 'You want target work high and steady, and bench low.',
            watch: 'Bench rising while target work falls. It usually means work isn\'t being booked, or there is spare capacity.', how: 'Each kind of hours ÷ available hours, with PTO left out.' },
          { t: 'visual', name: 'Hours by resource', kind: 'Stacked bars', legend: FOUR.concat([['PTO', C.pto]]),
            what: 'Each person\'s hours for the period, split five ways, lowest target work on the left.', read: 'Compare the dark part of each bar with the dashed 80% line. Scroll sideways for everyone.',
            watch: 'Grey bars are PTO. A person on PTO all period shows only grey.', click: 'Click a bar to focus that person.' },
          { t: 'visual', name: 'Team roster', kind: 'Table', what: 'One row per person with target, non-target, admin, bench, worked and available hours, mix, attainment and a status.',
            read: 'Sorted lowest attainment first, so the people who need help are at the top. The bottom row has team totals.',
            how: 'Worked = target + non-target. Attainment = target ÷ goal.', click: 'Click a row to open that person in the Individual view.' },
        ] },

      { group: 'Impact', id: 'impact', title: 'The Impact page', lede: 'The Impact page shows what changed after the dashboard went live in February 2026. It compares fixed windows, so the slicers do not apply.',
        blocks: [
          { t: 'table', head: ['Section', 'What it shows'], rows: [
            ['Effort saved (big card)', 'Manual reporting time saved each month. Team leads used to build utilization sheets by hand.'],
            ['Stat cards', 'Hours saved a year, target hours recovered each week, the value of those hours at a blended bill rate, and how often coaching happens.'],
            ['Before vs after', 'Target share, bench hours, admin share and days to spot an under-target engineer. Before is the first 13 weeks of the data, after is the latest 13.'],
            ['Week-by-week chart', 'Target share and bench share for all people across 53 weeks, with the go-live date marked.'],
            ['Clients and the business', 'What the change meant in practice, such as more planned client work and faster staffing calls.'],
            ['How the work changed', 'Each part of the reporting process before and after. These are effort estimates, not system data.'],
          ] },
          { t: 'box', accent: 'amber', eyebrow: 'Good to know', html: '<p>Recovered hours = the rise in target hours per week between the two windows. Every number on this page is sample data built for this prototype.</p>' },
        ] },
    ],
    glossary: [
      ['Available hours', '40 per week, minus PTO.'], ['Goal', '80% of available hours.'], ['Target work', 'Hours in work areas the person\'s role has a plan for.'],
      ['Non-target work', 'Real work in an area outside the role\'s plan, such as COMPed.'], ['Admin', 'Internal admin time. The allowance is 20% of available.'],
      ['Bench', 'Available hours with nothing booked.'], ['PTO', 'Paid time off. Comes off available hours.'], ['Target share', 'Target work ÷ available hours.'],
      ['Attainment', 'Target work ÷ goal.'], ['Mix alignment', 'How much of the planned hours, area by area, were actually covered.'], ['Overage', 'Hours past 40 in a week, as a share of available.'],
      ['Managed Services', 'Work for clients on recurring service contracts.'], ['Revenue Project', 'Paid project work for a client.'], ['COMPed', 'Project work given to a client at no charge.'],
      ['SG&A', 'Sales and scoping time, such as scoping a possible new project.'], ['Internal Projects', 'Projects for the company itself.'], ['Sustained Engineering', 'Internal tickets for the company\'s own systems.'],
    ],
  };
})();
