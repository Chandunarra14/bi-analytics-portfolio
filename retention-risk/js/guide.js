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
          { t: 'visual', name: 'Churn probability', kind: 'Gauge', legend: RISK, what: 'One needle showing MRR-weighted churn probability for everything selected, with active MRR and contract count below. When one account is selected it also shows the CSM and owner.',
            read: 'The further right, the more likely the selected revenue is to leave.', how: 'Σ(MRR × risk %) ÷ Σ MRR.', ex: 'Two-contract client: 52%, in the orange band.' },
          { t: 'visual', name: 'MRR by classification', kind: 'Horizontal bars', what: 'Active MRR in each account group.', watch: 'Red bars are groups flagged as at risk, departing or losing revenue.', click: 'Click a bar to filter.' },
          { t: 'visual', name: 'Active contracts by classification', kind: 'Horizontal bars', what: 'The same groups, counted by contracts.' },
          { t: 'visual', name: 'Client portfolio: latest billing', kind: 'Table', what: 'Each client with contracts, MRR and churn probability. Largest MRR first.', click: 'Click a row to select that client. The gauge then shows its CSM and owner.' },
        ] },
      { group: 'Revenue retention', id: 'retention', title: 'Revenue retention',
        blocks: [
          { t: 'kpi', label: 'At-risk MRR', value: '$84K', sub: '312 contracts', tone: 'warn', what: 'MRR on contracts with any risk above 0%.', ex: 'Both example contracts: $1,250.' },
          { t: 'kpi', label: 'High risk (51–100)', value: '$22K', sub: '64 contracts', tone: 'bad', what: 'MRR on contracts above 50% risk.', ex: 'Contract A only: $1,000.' },
          { t: 'kpi', label: 'Expected MRR loss', value: '$31K', sub: 'MRR × churn probability', what: 'The MRR you would expect to lose if every risk % played out.', how: 'Σ(MRR × risk % ÷ 100).', ex: '$600 + $50 = $650.' },
          { t: 'kpi', label: 'Accounts at risk', value: '140', what: 'Clients with at least one at-risk contract.' },
          { t: 'visual', name: 'Retention opportunity by CSM', kind: 'Column chart', what: 'At-risk MRR in each CSM\'s book.', read: 'The tallest bars are where saving clients pays off most.', click: 'Click a bar to filter to that CSM.' },
          { t: 'visual', name: 'Active contracts by risk level', kind: 'Donut', legend: RISK, what: 'Contracts split by risk band.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'Active MRR by risk level', kind: 'Donut', legend: RISK, what: 'The same split by MRR. The middle shows the total.', read: 'Compare with the contract donut. A bigger red slice here means the riskiest contracts are also the biggest.' },
          { t: 'visual', name: 'Risk reasons', kind: 'Horizontal bars', what: 'At-risk MRR by reason, such as budget cuts, competitor price or service issues.', read: 'Fix the top reason first.', click: 'Click a bar to filter to that reason.' },
          { t: 'visual', name: 'Revenue retention trend', kind: 'Line chart', what: 'At-risk MRR on contracts ending in each of the next 4 months.', watch: 'A spike: lots of risky revenue up for renewal at once.' },
        ] },
      { group: 'Expiry trends', id: 'expiry', title: 'Expiry trends',
        blocks: [
          { t: 'visual', name: 'Monthly contract expiry trend', kind: 'Column chart', what: 'Contracts ending in each of the next 4 months.' },
          { t: 'visual', name: 'MRR expiration by month', kind: 'Column chart', what: 'MRR on those contracts.' },
          { t: 'visual', name: 'Contracts expiring in the next 90 days, by classification', kind: 'Table', what: 'Count, MRR and share of each, by account group.', read: 'The small bar in % of MRR is red for at-risk groups.', click: 'Click a row to filter.' },
        ] },
      { group: 'Client portfolio', id: 'portfolio', title: 'Client portfolio',
        blocks: [
          { t: 'visual', name: 'Account-level contract and billing details', kind: 'Table', what: 'Every active contract with aging, type, classification, risk %, reason, MRR, owner, CSM and end date. Largest MRR first.', watch: 'Red risk % is above 50%.' },
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
