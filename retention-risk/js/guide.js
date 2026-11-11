// User guide content for the Retention Risk dashboard. Rendered by ../shared/guide.js.
(function () {
  const RISK = [['1-25', '#22a06b'], ['26-50', '#f2c230'], ['51-75', '#f97316'], ['76-100', '#e5484d']];
  const ok = (t) => `<span class="g-pill ok">${t}</span>`, warn = (t) => `<span class="g-pill warn">${t}</span>`, bad = (t) => `<span class="g-pill bad">${t}</span>`;
  window.GUIDE = {
    title: 'Retention Risk',
    tagline: 'How to read the Churn risk overview, Revenue retention, Expiry trends, Client portfolio and Impact pages',
    chapters: [
      { group: 'Basics', id: 'start', nav: 'Start here', title: 'Read this guide in 60 seconds',
        lede: 'The dashboard shows how likely each client is to leave, why, how much monthly revenue is at stake, and which contracts end next.',
        blocks: [
          { t: 'quick', items: [
            { h: 'Every contract has a risk %', p: 'The CSM sets a churn probability from 0 to 100 for each active contract, with a reason.' },
            { h: 'Bigger contracts count more', p: 'Churn probability for a group is weighted by MRR, so a $5K contract at 60% matters more than a $200 one.' },
            { h: 'At risk means above zero', p: 'Any contract with a risk above 0% counts as at risk. Above 50% is high risk.' },
          ] },
          { t: 'box', accent: 'accent', eyebrow: 'One example used throughout this guide', h: 'Two contracts, one client',
            html: '<p>A client has contract A at <b>$1,000 MRR, 60% risk</b> (reason: Competitor price) and contract B at <b>$250 MRR, 20% risk</b>.</p><p>Churn probability = (1,000 × 60 + 250 × 20) ÷ 1,250 = <b>52%</b>. Expected MRR loss = 600 + 50 = <b>$650</b>.</p>' },
          { t: 'table', eyebrow: 'Slicers', head: ['Slicer', 'What it does'], rows: [
            ['Account owner / CSM', 'Contracts owned by one person.'], ['Classification', 'The account group, including at-risk and departing groups.'], ['Account', 'One client.'],
            ['Contract type', 'Recurring Service, Block Hours and so on.'], ['Reason', 'Why the contract is at risk.'], ['Risk category', '1-25, 26-50, 51-75 or 76-100.'], ['End date period', 'How soon the contract ends.'],
          ], note: 'Each page shows only the slicers that apply. Click bars, slices and rows to filter.' },
        ] },
      { group: 'Basics', id: 'colors', title: 'What the colors mean',
        blocks: [
          { t: 'table', head: ['Where', 'Rule'], rows: [
            ['Risk levels and the gauge', ok('1-25') + ' ' + warn('26-50') + ' <span class="g-pill" style="background:#fde3cc;color:#9a4a0b">51-75</span> ' + bad('76-100')],
            ['Classification bars', bad('Red') + ' for at-risk, departing and revenue-loss groups.'],
            ['Churn probability column', 'Dot is red over 50%, orange over 25%, yellow above 0, green at 0.'],
            ['Risk % column', bad('Red') + ' over 50%.'],
          ] },
        ] },
      { group: 'Churn risk overview', id: 'overview', title: 'Churn risk overview',
        blocks: [
          { t: 'visual', name: 'Churn probability', h: 170, chart: (el) => GX.gauge(el, 52), watch: "The needle moving into the orange or red band.", kind: 'Gauge', legend: RISK, what: 'One needle showing MRR-weighted churn probability for everything selected, with active MRR and contract count below. When one account is selected it also shows the CSM and owner.',
            read: 'The further right, the more likely the selected revenue is to leave.', how: 'Σ(MRR × risk %) ÷ Σ MRR.', ex: 'Two-contract client: 52%, in the orange band.' },
          { t: 'visual', name: 'MRR by classification', h: 230, chart: (el) => GX.hbars(el, { items: [['Level 3', 182000], ['Level 4', 150000], ['Level 1', 128000], ['Level 2', 96000], ['Upcoming Revenue Loss', 42000], ['Level 2 Others At Risk', 26000], ['Departed', 12000]], fmt: (v) => '$' + d3.format('.2~s')(v), hi: (v, l) => /Risk|Loss|Departed/.test(l) }), read: "Longest bars hold the most MRR. Red bars are risky groups.", how: "Active MRR added up by classification.", kind: 'Horizontal bars', what: 'Active MRR in each account group.', watch: 'Red bars are groups flagged as at risk, departing or losing revenue.', click: 'Click a bar to filter.' },
          { t: 'visual', name: 'Active contracts by classification', h: 230, chart: (el) => GX.hbars(el, { items: [['Level 3', 176], ['Level 4', 173], ['Level 1', 121], ['Level 2', 111], ['Upcoming Revenue Loss', 70], ['Level 2 Others At Risk', 26], ['Departed', 45]], color: '#0ea5e9', hi: (v, l) => /Risk|Loss|Departed/.test(l) }), read: "Compare with the MRR chart: many contracts but little MRR means small contracts.", watch: "Red groups growing.", how: "Active contracts counted by classification.", kind: 'Horizontal bars', what: 'The same groups, counted by contracts.' },
          { t: 'visual', name: 'Client portfolio: latest billing', h: 110, chart: (el) => GX.table(el, ['Account', 'Contracts', 'MRR', 'Churn probability'], [['Example client', '2', '$1,250', GX.dot('#e5484d', '52%')], ['Aldergrove Credit Union', '3', '$571', GX.dot('#f2c230', '18%')]]), read: "Largest MRR first. The dot color shows risk.", watch: "Big clients with a red or orange dot.", how: "Contracts grouped by account. Churn probability is MRR-weighted.", kind: 'Table', what: 'Each client with contracts, MRR and churn probability. Largest MRR first.', click: 'Click a row to select that client. The gauge then shows its CSM and owner.' },
        ] },
      { group: 'Revenue retention', id: 'retention', title: 'Revenue retention',
        blocks: [
          { t: 'kpi', label: 'At-risk MRR', value: '$84K', sub: '312 contracts', tone: 'warn', what: 'MRR on contracts with any risk above 0%.', ex: 'Both example contracts: $1,250.' },
          { t: 'kpi', label: 'High risk (51–100)', value: '$22K', sub: '64 contracts', tone: 'bad', what: 'MRR on contracts above 50% risk.', ex: 'Contract A only: $1,000.' },
          { t: 'kpi', label: 'Expected MRR loss', value: '$31K', sub: 'MRR × churn probability', what: 'The MRR you would expect to lose if every risk % played out.', how: 'Σ(MRR × risk % ÷ 100).', ex: '$600 + $50 = $650.' },
          { t: 'kpi', label: 'Accounts at risk', value: '140', what: 'Clients with at least one at-risk contract.' },
          { t: 'visual', name: 'Retention opportunity by CSM', h: 210, chart: (el) => GX.bars(el, { cats: ['Sam', 'Jordan', 'Casey', 'Riley', 'Morgan'], fmt: (v) => '$' + d3.format('.2~s')(v), series: [['At-risk MRR', '#1e3a8a', [24000, 19000, 16000, 14000, 11000]]] }), watch: "One CSM holding much more at-risk MRR than the rest.", how: "MRR on at-risk contracts (risk above 0%) per CSM.", kind: 'Column chart', what: 'At-risk MRR in each CSM\'s book.', read: 'The tallest bars are where saving clients pays off most.', click: 'Click a bar to filter to that CSM.' },
          { t: 'visual', name: 'Active contracts by risk level', h: 200, chart: (el) => GX.donut(el, { center: 'contracts', items: [['1-25', 180, '#22a06b'], ['26-50', 68, '#f2c230'], ['51-75', 40, '#f97316'], ['76-100', 24, '#e5484d']] }), read: "Each slice is a risk band.", watch: "Orange and red slices growing.", how: "Contracts with a risk score, counted by band.", kind: 'Donut', legend: RISK, what: 'Contracts split by risk band.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'Active MRR by risk level', h: 200, chart: (el) => GX.donut(el, { center: 'at-risk MRR', fmt: (v) => '$' + d3.format('.2~s')(v), items: [['1-25', 42000, '#22a06b'], ['26-50', 20000, '#f2c230'], ['51-75', 13000, '#f97316'], ['76-100', 9000, '#e5484d']] }), watch: "A big red slice: high-risk contracts that are also big.", how: "MRR added up by risk band.", kind: 'Donut', legend: RISK, what: 'The same split by MRR. The middle shows the total.', read: 'Compare with the contract donut. A bigger red slice here means the riskiest contracts are also the biggest.' },
          { t: 'visual', name: 'Risk reasons', h: 200, chart: (el) => GX.hbars(el, { items: [['Competitor: Price', 21000], ['Client: Budget Cuts', 17000], ['Support: Service Delivery Issues', 15000], ['Client: Moving In-House', 12000], ['Project: Delivery', 10000]], fmt: (v) => '$' + d3.format('.2~s')(v), color: '#f97316' }), watch: "Service delivery reasons near the top: those are in our control.", how: "At-risk MRR added up by risk reason.", kind: 'Horizontal bars', what: 'At-risk MRR by reason, such as budget cuts, competitor price or service issues.', read: 'Fix the top reason first.', click: 'Click a bar to filter to that reason.' },
          { t: 'visual', name: 'Revenue retention trend', h: 200, chart: (el) => GX.line(el, { cats: ['Nov 26', 'Dec 26', 'Jan 27', 'Feb 27'], zero: true, fmt: (v) => '$' + d3.format('.2~s')(v), series: [['Expiring at-risk MRR', '#1e3a8a', [8000, 14000, 6000, 9000]]] }), read: "Each point is at-risk MRR on contracts ending that month.", how: "At-risk contracts grouped by end month, MRR added up.", kind: 'Line chart', what: 'At-risk MRR on contracts ending in each of the next 4 months.', watch: 'A spike: lots of risky revenue up for renewal at once.' },
        ] },
      { group: 'Expiry trends', id: 'expiry', title: 'Expiry trends',
        blocks: [
          { t: 'visual', name: 'Monthly contract expiry trend', h: 200, chart: (el) => GX.bars(el, { cats: ['November', 'December', 'January', 'February'], series: [['Contracts', '#1e3a8a', [22, 31, 18, 20]]] }), read: "Taller bars are busier renewal months.", watch: "A month with far more expiries than usual.", how: "Active contracts counted by end month, next 4 months.", kind: 'Column chart', what: 'Contracts ending in each of the next 4 months.' },
          { t: 'visual', name: 'MRR expiration by month', h: 200, chart: (el) => GX.bars(el, { cats: ['November', 'December', 'January', 'February'], fmt: (v) => '$' + d3.format('.2~s')(v), series: [['MRR', '#0ea5e9', [21000, 34000, 15000, 19000]]] }), read: "How much monthly revenue comes up for renewal each month.", watch: "A month where a lot of MRR ends at once.", how: "MRR on contracts ending each month, next 4 months.", kind: 'Column chart', what: 'MRR on those contracts.' },
          { t: 'visual', name: 'Contracts expiring in the next 90 days, by classification', h: 110, chart: (el) => GX.table(el, ['Classification', 'Active #', 'MRR', '% of contracts', '% of MRR'], [['Level 3', '24', '$18,200', '32%', '30%'], ['Upcoming Revenue Loss', '9', '$7,400', '12%', '<span style="color:var(--color-bad)">12%</span>']]), watch: "At-risk groups holding a big % of the expiring MRR.", how: "Contracts ending in the next 90 days grouped by classification, with each group's share of the total.", kind: 'Table', what: 'Count, MRR and share of each, by account group.', read: 'The small bar in % of MRR is red for at-risk groups.', click: 'Click a row to filter.' },
        ] },
      { group: 'Client portfolio', id: 'portfolio', title: 'Client portfolio',
        blocks: [
          { t: 'visual', name: 'Account-level contract and billing details', h: 110, chart: (el) => GX.table(el, ['Account', 'Contract', 'Type', 'Risk %', 'Reason', 'MRR', 'End date'], [['Example client', 'A', 'Recurring Service', '60', 'Competitor: Price', '$1,000', '03/31/2027'], ['Example client', 'B', 'Block Hours', '20', 'Client: Budget Cuts', '$250', '06/30/2027']], { red: [[0, 3]] }), read: "Largest MRR first. Use it to look up any contract.", how: "Every active contract, sorted by MRR.", kind: 'Table', what: 'Every active contract with aging, type, classification, risk %, reason, MRR, owner, CSM and end date. Largest MRR first.', watch: 'Red risk % is above 50%.' },
        ] },
      { group: 'Impact', id: 'impact', title: 'The Impact page', lede: 'What changed after the dashboard went live in February 2026. The slicers do not apply here.',
        blocks: [
          { t: 'table', head: ['Section', 'What it shows'], rows: [
            ['Effort saved (big card)', 'Account risk used to live in CSM notes and a shared spreadsheet that took about 15 hours a week to update.'],
            ['Before vs after', 'The first 3 months of the data against the latest 3, including churn probability and how much flagged MRR was saved.'],
            ['Chart', 'MRR saved against MRR lost each month.'],
            ['How the work changed', 'Each part of the process before and after. These are effort estimates, not system data.'],
          ], note: 'Flagged accounts saved = MRR kept ÷ at-risk MRR.' },
        ] },
    ],
    glossary: [
      ['Churn probability', 'How likely the contract is to end without renewing, 0 to 100%.'], ['MRR-weighted', 'Bigger contracts count more in the average.'],
      ['At-risk MRR', 'MRR on contracts with risk above 0%.'], ['Expected MRR loss', 'MRR × risk %, added up.'], ['Risk reason', 'Why the CSM thinks the client may leave.'],
      ['Aging / end date period', 'How many days until the contract ends.'], ['Classification', 'Account group, including at-risk and departing groups.'],
    ],
  };
})();
