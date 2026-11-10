// User guide content for the Contracts & Renewals dashboard. Rendered by ../shared/guide.js.
(function () {
  const CH = [['Churn', '#e5484d'], ['Renewal', '#1e3a8a']];
  const ok = (t) => `<span class="g-pill ok">${t}</span>`, warn = (t) => `<span class="g-pill warn">${t}</span>`, bad = (t) => `<span class="g-pill bad">${t}</span>`;
  window.GUIDE = {
    title: 'Contracts & Renewals',
    tagline: 'How to read the Home, Recurring, One-time, New & closing, Top accounts and Impact pages',
    chapters: [
      { group: 'Basics', id: 'start', nav: 'Start here', title: 'Read this guide in 60 seconds',
        lede: 'The dashboard shows every client contract: what type it is, when it ends, and whether it is expected to renew or churn, with the money at stake.',
        blocks: [
          { t: 'quick', items: [
            { h: 'Four contract types', p: 'Recurring Service bills every month (MRR). Fixed Price, Block Hours and Time & Materials are one-time work.' },
            { h: 'Every contract ends', p: 'The end date decides when it shows up as expiring. Days left are counted from today, Nov 10, 2026.' },
            { h: 'Renewal or churn', p: 'Each ending contract is flagged as Renewal or Churn. Churn means the client is not expected to sign again.' },
          ] },
          { t: 'box', accent: 'accent', eyebrow: 'One example used throughout this guide', h: 'Aldergrove Credit Union, Hosting',
            html: '<p>A <b>Recurring Service</b> contract worth <b>$432 MRR</b> ($5,184 a year). It started Dec 1, 2025 and ends <b>Nov 30, 2026</b>, so it has <b>20 days left</b> and is flagged <b>Renewal</b>.</p><p>It counts in Active contracts, Expiring this month, Expiring next 90 days and Still to close this year.</p>' },
          { t: 'table', eyebrow: 'Slicers', head: ['Slicer', 'What it does'], rows: [
            ['Contract type', 'One of the four types.'], ['CSM', 'The client success manager.'], ['Account manager', 'The account owner on the sales side.'],
            ['Closure type', 'Renewal or Churn.'], ['Account', 'One client. Set it by clicking a bar or row.'],
          ], note: 'Each page shows only the slicers that apply to it. Click bars, slices, cards and rows to filter.' },
        ] },
      { group: 'Basics', id: 'colors', title: 'What the colors mean',
        blocks: [
          { t: 'table', head: ['Where', 'Rule'], rows: [
            ['Churn vs renewal', bad('Red') + ' is churn, navy is renewal, everywhere.'],
            ['Started contracts', ok('Green') + ' on the New & closing page.'],
            ['Churn rate / Still to close', warn('Amber') + ' cards are worth watching.'],
            ['Days left', bad('Red') + ' when the end date has already passed.'],
            ['Next expiry (Account detail)', bad('Red') + ' when under 90 days.'],
            ['Top 10 share of MRR', warn('Amber') + ' when the top 10 hold more than 40% of MRR.'],
          ] },
        ] },
      { group: 'Home', id: 'home', title: 'Home',
        blocks: [
          { t: 'kpi', label: 'Active contracts', value: '486', sub: '$612K MRR', what: 'Contracts that are active today, and their MRR.', ex: 'Aldergrove Hosting adds 1 contract and $432.' },
          { t: 'kpi', label: 'Recurring Service (and the other types)', name: 'Contract type cards', value: '298', sub: '$7.3M est. revenue', what: 'One card per type: active contracts and estimated revenue over the contract term.', click: 'Click a card to filter the page to that type.' },
          { t: 'visual', name: 'Upcoming expirations, next 12 months', kind: 'Stacked bars', legend: CH, what: 'Active contracts by the month they end, split into churn and renewal.', watch: 'Months with a lot of red.', click: 'Click a legend item to filter to churn or renewal.' },
          { t: 'visual', name: 'This month: renewal vs churn', kind: 'Donut', what: 'Contracts ending this month by expected outcome.', click: 'Click a slice to filter.' },
          { t: 'visual', name: 'Days until expiry', kind: 'Column chart', what: 'Active contracts by time left: Overdue, 0-30, 31-60, 61-90, 91-180, 181-360 and 360+ days.', watch: 'Overdue contracts: the end date passed but the contract is still active.', ex: 'Aldergrove Hosting, 20 days left, sits in 0-30.' },
          { t: 'visual', name: 'Expiring soonest', kind: 'Table', what: 'Active contracts ending in the next 90 days with ID, account, type, end date, outcome and MRR.', read: 'Soonest first. This is the renewal to-do list.' },
        ] },
      { group: 'Recurring', id: 'recurring', title: 'Recurring', lede: 'Recurring Service contracts only.',
        blocks: [
          { t: 'kpi', label: 'Expiring this month', value: '18', what: 'Recurring contracts ending this month.' },
          { t: 'kpi', label: 'Expiring next 90 days', value: '52', what: 'Active recurring contracts ending in the next 90 days.' },
          { t: 'kpi', label: 'Expiring in 2026', value: '240', what: 'Recurring contracts ending at any point this year.' },
          { t: 'kpi', label: 'Churn rate, 2026', value: '14%', tone: 'warn', what: 'Of the recurring contracts ending this year, the share flagged to churn.', how: 'Churn ÷ (churn + renewal), for recurring contracts ending in 2026.', ex: '34 churn out of 240 = 14%.' },
          { t: 'kpi', label: 'Churned MRR, 2026', value: '$38K', tone: 'bad', what: 'MRR on recurring contracts that churned this year.' },
          { t: 'visual', name: 'Renewal vs churn, 2026', kind: 'Donut', legend: CH, what: 'Recurring contracts ending this year by outcome.' },
          { t: 'visual', name: 'Contract retention by month', kind: 'Grouped bars', legend: CH, what: 'Recurring contracts ending each month of 2026, churn against renewal.' },
          { t: 'visual', name: 'MRR impact: churn vs renewal', kind: 'Grouped bars', legend: CH, what: 'The MRR on those same contracts, so you see the money, not just the count.', watch: 'A month where one big churn outweighs many renewals.' },
        ] },
      { group: 'One-time', id: 'onetime', title: 'One-time', lede: 'Fixed Price, Block Hours and Time & Materials contracts.',
        blocks: [
          { t: 'kpi', label: 'Fixed Price / Block Hours / Time & Materials', name: 'Type cards', value: '74', sub: '$1.1M est. revenue', what: 'Active contracts and estimated revenue for each one-time type.' },
          { t: 'visual', name: 'Share of one-time contracts by type', kind: 'Donut', what: 'How the active one-time contracts split by type, by count.' },
          { t: 'visual', name: 'Share of one-time revenue by type', kind: 'Donut', what: 'The same split by estimated revenue. The middle shows the total.', read: 'Compare with the count donut: a type with few contracts but lots of revenue holds bigger deals.' },
          { t: 'visual', name: 'One-time contract expiry: churn vs renewal', kind: 'Grouped bars', legend: CH, what: 'One-time contracts ending each month of 2026 by outcome.' },
        ] },
      { group: 'New & closing', id: 'trend', title: 'New & closing', lede: 'Contracts coming in this year against contracts ending, and what is left to close.',
        blocks: [
          { t: 'kpi', label: 'New contracts, 2026', value: '182', sub: '$2.4M est. revenue', what: 'Contracts that started this year.' },
          { t: 'kpi', label: 'New recurring MRR', value: '$64K', tone: 'good', what: 'MRR added by recurring contracts that started this year.' },
          { t: 'kpi', label: 'Churned MRR, 2026', value: '$38K', tone: 'bad', what: 'MRR lost on recurring contracts that churned this year.' },
          { t: 'kpi', label: 'Still to close this year', value: '64', sub: '$41K MRR in Nov–Dec', tone: 'warn', what: 'Contracts ending in November or December.', ex: 'Aldergrove Hosting is one of them.' },
          { t: 'kpi', label: 'Flagged to churn (Nov–Dec)', value: '9', sub: '$6K MRR at risk', tone: 'bad', what: 'Of those, the ones flagged to churn.' },
          { t: 'visual', name: 'Contracts started vs ending, 2026', kind: 'Grouped bars', legend: [['Started', '#22a06b'], ['Ended · renewed', '#1e3a8a'], ['Ended · churned', '#e5484d']], what: 'Contracts that started each month against contracts that ended, renewed or churned.' },
          { t: 'visual', name: 'Net recurring MRR movement, 2026', kind: 'Waterfall', what: 'New recurring MRR minus churned MRR, month by month. The last bar is the net for the year.', read: 'Steps up are good months, steps down are bad ones.', how: 'For each month: MRR of recurring contracts that started − MRR of recurring contracts that churned.' },
          { t: 'visual', name: 'New contracts by type, 2026', kind: 'Horizontal bars', what: 'Contracts started this year by type. Hover for estimated revenue.', click: 'Click a bar to filter by type.' },
          { t: 'visual', name: 'Still to close this year, by type', kind: 'Stacked bars', legend: [['November', '#e5484d'], ['December', '#f97316']], what: 'Contracts ending in November and December by type.', click: 'Click a bar to filter by type.' },
          { t: 'visual', name: 'Closing this year: contract detail', kind: 'Table', what: 'Every contract ending in November or December with CSM, end date, days left, outcome, MRR and estimated revenue.', read: 'Churn risks first, then by MRR.', click: 'Click a row to focus on that account.' },
        ] },
      { group: 'Top accounts', id: 'top', title: 'Top accounts', lede: 'Which clients hold the most revenue, and how concentrated it is.',
        blocks: [
          { t: 'kpi', label: 'Active accounts', value: '150', what: 'Clients with at least one active contract.' },
          { t: 'kpi', label: 'Active recurring MRR', value: '$612K', what: 'MRR across all active recurring contracts.' },
          { t: 'kpi', label: 'Avg MRR per account', value: '$4.1K', how: 'Active recurring MRR ÷ active accounts.' },
          { t: 'kpi', label: 'Top 10 share of MRR', value: '38%', sub: 'concentration risk', what: 'How much of the MRR sits with the 10 biggest clients.', colors: 'Amber when above 40%. Losing one big client would hurt.' },
          { t: 'kpi', label: 'Accounts with churn flags', value: '21', tone: 'bad', what: 'Clients with at least one contract flagged to churn.' },
          { t: 'visual', name: 'Top 10 by recurring MRR', kind: 'Horizontal bars', what: 'The 10 biggest clients by MRR.', watch: 'Red bars: a big client with a contract flagged to churn.', click: 'Click a bar to focus on that account.' },
          { t: 'visual', name: 'Top 10 by fixed-price revenue', kind: 'Horizontal bars', what: 'The 10 clients with the most active fixed-price revenue.' },
          { t: 'visual', name: 'Top 10 by active contracts', kind: 'Horizontal bars', what: 'The 10 clients with the most active contracts of any type.' },
          { t: 'visual', name: 'MRR concentration', kind: 'Donut', what: 'MRR held by the top 5, the next 5, the next 15 and everyone else.', read: 'A smaller dark slice means revenue is spread more evenly.' },
          { t: 'visual', name: 'Top 10 accounts: MRR by contract type', kind: 'Stacked bars', legend: [['Recurring MRR', '#1e3a8a'], ['Fixed price (monthly equiv.)', '#0ea5e9'], ['Block hours (monthly equiv.)', '#f97316']], what: 'How each top client\'s revenue splits across contract types.', how: 'Fixed price and block hours revenue are divided by 12 so they compare with monthly MRR.' },
          { t: 'visual', name: 'Account detail', kind: 'Table', what: 'Every active client with CSM, manager, active contracts, recurring MRR, fixed price, block hours, next expiry and churn flags.', click: 'Click a row to open that client\'s contracts on the New & closing page.' },
        ] },
      { group: 'Impact', id: 'impact', title: 'The Impact page', lede: 'What changed after the dashboard went live in February 2026. The slicers do not apply here.',
        blocks: [
          { t: 'table', head: ['Section', 'What it shows'], rows: [
            ['Effort saved (big card)', 'Renewal lists used to be pulled from the PSA and tracked in spreadsheets by each CSM: about 15 hours a week combined.'],
            ['Before vs after', 'Recurring contracts ending Jan to Mar 2026 against those ending in the latest 3 months, including churn rate and churned MRR.'],
            ['Chart', 'Recurring churn rate by end month, with go-live marked.'],
            ['How the work changed', 'Each part of the process before and after. These are effort estimates, not system data.'],
          ] },
        ] },
    ],
    glossary: [
      ['MRR', 'Monthly recurring revenue from Recurring Service contracts.'], ['Est. revenue', 'Expected revenue over the full contract term.'],
      ['Recurring Service', 'A monthly managed services agreement.'], ['Fixed Price', 'One-time work at an agreed price.'], ['Block Hours', 'A prepaid bundle of hours.'],
      ['Time & Materials', 'Work billed by the hour as it happens.'], ['Churn', 'The client is not expected to renew.'], ['Renewal', 'The client is expected to sign again.'],
      ['Concentration', 'How much revenue depends on a few big clients.'],
    ],
  };
})();
