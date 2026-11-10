// User guide content for the Service Desk Performance dashboard. Rendered by ../shared/guide.js.
(function () {
  const CH = [['Email', '#2f6fed'], ['Chat', '#18a999'], ['Phone', '#f2a541'], ['Client Portal', '#8b5cf6']];
  const CLS = [['Alerts', '#2f6fed'], ['Incidents', '#18a999'], ['Service Requests', '#f2a541']];
  const ok = (t) => `<span class="g-pill ok">${t}</span>`, warn = (t) => `<span class="g-pill warn">${t}</span>`, bad = (t) => `<span class="g-pill bad">${t}</span>`;
  window.GUIDE = {
    title: 'Service Desk Performance',
    tagline: 'How to read every page, from Overview to Account health and Impact',
    chapters: [
      { group: 'Basics', id: 'start', nav: 'Start here', title: 'Read this guide in 60 seconds',
        lede: 'The dashboard covers ticket volume, resolution, customer satisfaction (CSAT), first contact resolution (FCR) and time to resolve (MTTR) across every channel and client, plus the impact of moving off manual reports.',
        blocks: [
          { t: 'quick', items: [
            { h: 'Three kinds of tickets', p: 'Alerts come from monitoring. Incidents are things that broke. Service requests are clients asking for something.' },
            { h: 'Four channels', p: 'Clients reach the desk by email, chat, phone or the client portal. Alerts have no channel because a system raises them.' },
            { h: 'Monthly numbers', p: 'Most charts are monthly. The From and To slicers set the date range. The dashboard went live in February 2026.' },
          ] },
          { t: 'box', accent: 'accent', eyebrow: 'One example used throughout this guide', h: 'Aldergrove Credit Union',
            html: '<p>A Level-1 client paying <b>$42,082 MRR</b>. Over 12 months it raised <b>4,539 alerts</b>, <b>901 incidents</b> and <b>271 service requests</b>. Its average time to resolve is <b>41.5 hours</b> and its CSAT rating is <b>4.72 out of 5</b>.</p>' },
          { t: 'table', eyebrow: 'Slicers', head: ['Slicer', 'Pages'], rows: [
            ['From / To', 'Overview, CSAT, First contact resolution, MTTR'], ['Channel', 'Overview, Trends & forecast, CSAT, First contact resolution, MTTR'],
            ['Classification', 'Overview, Trends & forecast, Open tickets'], ['Department', 'Open tickets'], ['Account level', 'CSAT, MTTR, Account health'],
          ], note: 'Only the slicers that apply show on each page. Click bars, slices, legend items and rows to filter. Click again to clear.' },
        ] },
      { group: 'Basics', id: 'colors', title: 'What the colors mean',
        blocks: [
          { t: 'table', head: ['Where', 'Rule'], rows: [
            ['Change under a KPI', ok('Green') + ' when it moved the good way, ' + bad('red') + ' when it moved the bad way.'],
            ['CSAT rings', ok('Green') + ' at or above the 95 target.'],
            ['Oldest open tickets', 'A ' + bad('red dot') + ' marks tickets over a year old.'],
            ['Clients with the highest MTTR', bad('Red') + ' over 100 hours.'],
            ['MRR ratio charts', bad('Red') + ' when the ratio is over 2.'],
            ['All clients, Ratio', ok('Green') + ' under 0.5, ' + warn('amber') + ' 0.5 to 1.0, ' + bad('red') + ' over 1.0.'],
          ] },
          { t: 'box', eyebrow: 'Channel colors', html: CH.map(([s, c]) => `<span style="display:inline-block;margin:0 14px 6px 0"><i style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${c};margin-right:6px"></i>${s}</span>`).join('') },
        ] },
      { group: 'Overview', id: 'overview', title: 'Overview',
        blocks: [
          { t: 'kpi', label: 'Tickets created · 12 mo', value: '73,538', sub: '65,647 completed', what: 'All tickets raised in the last 12 months, and how many were completed.', how: 'Alerts + incidents + service requests, added up by month.' },
          { t: 'kpi', label: 'Resolution rate · latest month', value: '90.2%', sub: '−0.2 pts vs prior month', what: 'How many tickets were closed compared with how many came in.', how: 'Completed ÷ created, for the latest month.', ex: '5,000 created and 4,510 completed = 90.2%.' },
          { t: 'kpi', label: 'First contact resolution · latest', value: '42.2%', sub: '+0.8 pts vs prior month', what: 'Tickets fixed on the first contact, with no hand-off or callback.', how: 'Tickets resolved on first contact ÷ tickets, latest month.' },
          { t: 'kpi', label: 'CSAT score · latest', value: '97.2', sub: '+0.3 pts vs prior month', what: 'Customer satisfaction score out of 100 from ticket surveys.', how: 'Average survey score for the latest month, scaled to 100.' },
          { t: 'visual', name: 'Created vs completed', kind: 'Line chart', legend: [['Created', '#2f6fed'], ['Completed', '#18a999']], what: 'Tickets created and completed each month.', watch: 'Created well above completed for months in a row: the backlog is growing.' },
          { t: 'visual', name: 'Resolution rate by month', kind: 'Line chart', what: 'Completed ÷ created for each month. The dashed line marks go-live.', read: 'Higher is better.' },
          { t: 'visual', name: 'Tickets by classification', kind: 'Stacked bars', legend: CLS, what: 'Alerts, incidents and service requests each month.', watch: 'Alert spikes, such as the March alert storm.', click: 'Click a legend item to filter by classification.' },
          { t: 'visual', name: 'Inbound channel mix', kind: 'Stacked bars', legend: CH, what: 'Share of human-raised tickets by channel each month. Each bar adds up to 100%.', read: 'Shows how clients prefer to reach the desk over time.' },
          { t: 'visual', name: 'New tickets this month, by day and channel', kind: 'Heatmap', what: 'One cell per day and channel. Darker means more tickets.', read: 'Weekends drop off. A dark column is a busy day.' },
        ] },
      { group: 'Trends & forecast', id: 'forecast', title: 'Trends & forecast',
        blocks: [
          { t: 'visual', name: 'By severity / By channel / By classification', kind: 'Grouped bars', legend: [['Month to date', '#2f6fed'], ['Forecast', '#18a999']], what: 'Three charts comparing tickets so far this month with the full-month forecast.', read: 'The gap between the bars is what is still expected this month.', how: 'Forecast = the full-month estimate based on the pace so far and past months.' },
          { t: 'visual', name: 'Average tickets by weekday', kind: 'Column chart', what: 'Average tickets on each weekday over the past 90 days.', read: 'Use it for shift planning: staff up on the busiest days.' },
          { t: 'visual', name: 'Last 15 days', kind: 'Line chart', legend: CLS, what: 'Daily alerts, incidents and service requests for the last 15 days.' },
        ] },
      { group: 'Open tickets', id: 'open', title: 'Open tickets',
        blocks: [
          { t: 'kpi', label: 'Open tickets', value: '1,052', what: 'Tickets not closed yet. Three more cards split it into open incidents, alerts and service requests.' },
          { t: 'visual', name: 'Open by department', kind: 'Stacked bars', what: 'Open tickets in each department, split by classification.', click: 'Click a bar to filter by department.' },
          { t: 'visual', name: 'Open by priority', kind: 'Stacked bars', what: 'Open tickets by priority. P1 is the most urgent.', watch: 'Any growth in P1 or P2.' },
          { t: 'visual', name: 'Open mix', kind: 'Donut', what: 'Open tickets split by classification.' },
          { t: 'visual', name: 'Oldest open tickets', kind: 'Table', what: 'The 10 oldest open tickets for the chosen classification, with department, created date and age.', watch: 'Red dots are over a year old. Close or clean them up.' },
        ] },
      { group: 'CSAT', id: 'csat', title: 'CSAT',
        blocks: [
          { t: 'visual', name: 'CSAT score by channel', kind: 'Rings', what: 'One ring per channel with its score for the last 12 months. The tick marks the 95 target.', read: 'A green ring is at or above target.', click: 'Click a ring to filter to that channel.' },
          { t: 'visual', name: 'CSAT trend by channel', kind: 'Line chart', legend: CH, what: 'Monthly CSAT score for each channel.' },
          { t: 'visual', name: 'Survey response rate', kind: 'Horizontal bars', what: 'Share of tickets that got a CSAT response, by channel.', how: 'Surveys returned ÷ tickets.', read: 'A low rate means the score rests on few answers.' },
          { t: 'visual', name: 'CSAT by client', kind: 'Table', what: 'Each client\'s tickets, surveys returned and average rating out of 5.', ex: 'Aldergrove: 4.72.' },
        ] },
      { group: 'First contact resolution', id: 'fcr', title: 'First contact resolution',
        blocks: [
          { t: 'visual', name: 'FCR by channel', kind: 'Horizontal bars', what: 'Share of tickets fixed on first contact for each channel, last 12 months.', click: 'Click a bar to filter to that channel.', read: 'Chat and phone usually fix the most on first touch.' },
          { t: 'visual', name: 'Overall FCR trend', kind: 'Line chart', what: 'Monthly FCR for all channels. The dashed line marks go-live.' },
          { t: 'visual', name: 'FCR by channel over time', kind: 'Line chart', legend: CH, what: 'Monthly FCR for each channel.' },
          { t: 'visual', name: 'Issue types: FCR and hours worked', kind: 'Table', what: 'Each issue type with tickets, average hours, total hours worked, FCR tickets and FCR %.', read: 'Low FCR and high hours together are where a runbook or automation pays off most.' },
        ] },
      { group: 'MTTR', id: 'mttr', title: 'MTTR', lede: 'Mean time to resolve: the average hours from ticket created to resolved.',
        blocks: [
          { t: 'visual', name: 'MTTR by severity', kind: 'Column chart', what: 'Average hours to resolve for each severity.' },
          { t: 'visual', name: 'Average resolution hours by channel', kind: 'Horizontal bars', what: 'Average hours to resolve by channel, last 12 months.' },
          { t: 'visual', name: 'MTTR trend', kind: 'Line chart', legend: [['Incidents', '#2f6fed'], ['Service requests', '#18a999']], what: 'Monthly MTTR for incidents and service requests.', read: 'Lower is better. Both dropped after go-live.' },
          { t: 'visual', name: 'Clients with the highest MTTR', kind: 'Horizontal bars', what: 'Top 10 clients by average hours to resolve.', watch: 'Red bars are over 100 hours.', click: 'Click a bar to filter to that client\'s account level.' },
        ] },
      { group: 'Account health', id: 'accounts', title: 'Account health', lede: 'Which clients raise a lot of tickets for what they pay.',
        blocks: [
          { t: 'box', accent: 'accent', eyebrow: 'The MRR ratio', html: '<p>Ratio = tickets ÷ (MRR ÷ 4). Dividing MRR by 4 gives a rough weekly revenue, so the ratio is tickets per week of revenue. <b>Lower is better.</b></p><p>Aldergrove, service requests: 271 ÷ (42,082 ÷ 4) = <b>0.03</b>. All tickets: 5,711 ÷ 10,520 = <b>0.54</b>.</p>' },
          { t: 'visual', name: 'MRR ratio by service requests / incidents / alerts', kind: 'Horizontal bars', what: 'Three charts, one per ticket type, showing the 10 clients with the highest ratio.', read: 'Only the ratio is shown, not MRR.', watch: 'Red bars are over 2: very heavy for what the client pays.', click: 'Click a bar to focus on that client.' },
          { t: 'visual', name: 'Watch list: negative clients', kind: 'Table', what: 'Clients below the median MRR that are also above the median ticket count for at least one type.', read: 'Worst first: most flags, then lowest MRR. Red numbers mark the flagged types.', how: 'Medians are worked out across all clients.' },
          { t: 'visual', name: 'All clients', kind: 'Table', what: 'Every client with level, MRR, alerts, incidents, requests, MTTR and the all-tickets ratio.', read: 'Click a column header to sort.', how: 'Ratio dot: green under 0.5, amber 0.5 to 1.0, red over 1.0.', ex: 'Aldergrove at 0.54 shows amber.' },
        ] },
      { group: 'Impact', id: 'impact', title: 'The Impact page', lede: 'What changed after the dashboard went live in February 2026. The slicers do not apply here.',
        blocks: [
          { t: 'kpi', label: 'Hours saved per year', value: '1,212', sub: 'Reporting + client review prep', what: 'Manual reporting and review prep time that the dashboard replaced.' },
          { t: 'kpi', label: 'Cost of time saved / yr', value: '$66,660', sub: 'At $55/hr blended cost', how: 'Hours saved × blended hourly cost.' },
          { t: 'kpi', label: 'Capacity freed up', value: '58%', sub: 'of a full-time analyst', how: 'Hours saved ÷ 2,080 hours in a working year.' },
          { t: 'kpi', label: 'Reports replaced', value: '7', sub: 'manual exports → 1 live dashboard', what: 'Separate spreadsheets and exports now covered here.' },
          { t: 'table', head: ['Section', 'What it shows'], rows: [
            ['Before vs after', 'Service desk KPIs: average of Nov 2025 to Jan 2026 (before go-live) against the latest 3 months.'],
            ['The turn after go-live', 'FCR (up is good) and incident MTTR (down is good) by month.'],
            ['What it meant for clients', 'Extra tickets fixed first time, faster fixes and downtime avoided each month.'],
            ['How work changed', 'Each part of the reporting process before and after. These are effort estimates, not system data.'],
          ] },
        ] },
    ],
    glossary: [
      ['Alert', 'A ticket raised automatically by monitoring.'], ['Incident', 'Something broke and needs fixing.'], ['Service request', 'A client asking for something, like a new user.'],
      ['Resolution rate', 'Completed ÷ created.'], ['FCR', 'First contact resolution: fixed without a hand-off or callback.'], ['CSAT', 'Customer satisfaction score from ticket surveys.'],
      ['MTTR', 'Mean time to resolve, in hours.'], ['MRR', 'Monthly recurring revenue from the client.'], ['MRR ratio', 'Tickets ÷ (MRR ÷ 4). Lower is better.'], ['Severity / priority', 'How serious and how urgent a ticket is.'],
    ],
  };
})();
