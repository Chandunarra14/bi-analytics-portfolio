// User guide content for the Accounts Receivable dashboard. Rendered by ../shared/guide.js.
(function () {
  const BK = [['Current', '#22a06b'], ['1-30', '#84cc16'], ['31-60', '#f2c230'], ['61-90', '#f97316'], ['91-120', '#e5484d'], ['121-180', '#be123c'], ['181-365', '#7f1d1d'], ['366+', '#450a0a']];
  const ok = (t) => `<span class="g-pill ok">${t}</span>`, warn = (t) => `<span class="g-pill warn">${t}</span>`, bad = (t) => `<span class="g-pill bad">${t}</span>`;
  window.GUIDE = {
    title: 'Accounts Receivable',
    tagline: 'How to read the Past due overview, Aging analysis, Collections, Customer aging and Impact pages',
    chapters: [
      { group: 'Basics', id: 'start', nav: 'Start here', title: 'Read this guide in 60 seconds',
        lede: 'The dashboard shows what clients owe, how late it is, and how well each month\'s billing gets collected, down to the customer and CSM.',
        blocks: [
          { t: 'quick', items: [
            { h: 'Open means unpaid', p: 'The open amount is what is still owed on an invoice after any payments.' },
            { h: 'Age is from the due date', p: 'Days past due count from the invoice due date to today. Not yet due is called Current.' },
            { h: 'Buckets group the age', p: 'Current, 1-30, 31-60, 61-90, 91-120, 121-180, 181-365 and 366+ days past due.' },
          ] },
          { t: 'box', accent: 'accent', eyebrow: 'One example used throughout this guide', h: 'An invoice to Fieldstone Foods',
            html: '<p>Invoice INV-24995 for <b>$2,780.27</b> was due <b>Jul 2, 2024</b>. Nothing has been paid, so the full amount is open. It is <b>861 days past due</b> and sits in the <b>366+</b> bucket.</p>' },
          { t: 'table', eyebrow: 'Slicers', head: ['Slicer', 'What it does'], rows: [
            ['Aging bucket', 'Only items in one bucket. On the overview page.'], ['CSM', 'Customers owned by one CSM.'], ['Classification', 'The customer\'s account level.'], ['Customer', 'One customer.'],
          ], note: 'Click bars, slices and rows to filter. Click again to clear.' },
        ] },
      { group: 'Basics', id: 'colors', title: 'What the colors mean',
        blocks: [
          { t: 'box', eyebrow: 'Aging buckets', html: '<p>Buckets go from green (current) through yellow and orange to dark red (over a year).</p>' + BK.map(([b, c]) => `<span style="display:inline-block;margin:0 14px 6px 0"><i style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${c};margin-right:6px"></i>${b}</span>`).join('') },
          { t: 'table', head: ['Where', 'Rule'], rows: [
            ['Past due card', warn('Amber') + ' always.'], ['Over 90 days card', bad('Red') + ' always.'],
            ['Collected % (Monthly collections)', ok('Green') + ' at 95%+, ' + warn('amber') + ' from 80%, ' + bad('red') + ' below 80%.'],
            ['Customer aging detail', bad('Red') + ' amounts are 91+ days past due.'],
          ] },
        ] },
      { group: 'Past due overview', id: 'overview', title: 'Past due overview',
        blocks: [
          { t: 'kpi', label: 'Total open', value: '$1.2M', sub: '210 open items', what: 'Everything still owed, current or late.', how: 'Open amount added up across open items. Credit memos count as negative.', ex: 'Fieldstone adds $2,780.27.' },
          { t: 'kpi', label: 'Past due', value: '$640K', sub: '142 invoices', tone: 'warn', what: 'Open amounts past their due date.', how: 'Open items with 1 or more days past due.' },
          { t: 'kpi', label: 'Over 90 days', value: '$310K', sub: '38 customers', tone: 'bad', what: 'Open amounts more than 90 days late, and how many customers owe them.', ex: 'Fieldstone, 861 days, counts here.' },
          { t: 'kpi', label: 'Avg days to pay', value: '34', sub: 'invoices since July', what: 'How long customers take to pay recent invoices.', how: 'Average of (paid date − invoice date) for paid invoices issued since July 1.' },
          { t: 'kpi', label: 'Credit memos open', value: '$18K', sub: '9 items', what: 'Credits and reversals not yet applied.', how: 'Open amount on items that are not invoices.' },
          { t: 'visual', name: 'Open amounts by aging bucket', kind: 'Column chart', what: 'How much is open in each bucket.', read: 'You want the money on the left.', watch: 'Tall bars on the right: old debt that gets harder to collect.', click: 'Click a bar to filter to that bucket.' },
          { t: 'visual', name: 'Top 10 customers over 90 days', kind: 'Donut', what: 'The 10 customers with the most money over 90 days late, and their share.', read: 'Start collection calls at the biggest slice.', click: 'Click a slice to filter to that customer.' },
          { t: 'visual', name: 'Open items by status', kind: 'Horizontal bars', what: 'Open items by status: Posted, Partially Paid and so on.' },
          { t: 'visual', name: 'Open items by type', kind: 'Horizontal bars', what: 'Open items by type: Invoice, Credit Memo or Reversal.' },
        ] },
      { group: 'Aging analysis', id: 'aging', title: 'Aging analysis',
        blocks: [
          { t: 'visual', name: 'Share of open balance by bucket', kind: 'Donut', legend: BK, what: 'The open balance split by bucket, with amounts and shares in the legend.', click: 'Click a slice to filter the overview to that bucket.' },
          { t: 'visual', name: 'Aging buckets', kind: 'Table', what: 'Open amount, % of open, item count and average item size for each bucket.', read: 'The bottom row has totals.', how: 'Avg item = open amount ÷ items.' },
        ] },
      { group: 'Collections', id: 'collections', title: 'Collections', lede: 'How much of each month\'s billing has been collected.',
        blocks: [
          { t: 'visual', name: 'Billed vs still outstanding, by due month', kind: 'Grouped bars', legend: [['Billed', '#cbd5e1'], ['Still outstanding', '#e5484d']], what: 'For each due month, total billed and how much of it is still unpaid.', read: 'Small red bars are good. Recent months will have more red because they are still within payment terms.' },
          { t: 'visual', name: 'Collection performance', kind: 'Line chart', what: 'Share of each due month\'s billing collected so far.', how: 'Paid amount ÷ billed amount, invoices only.', watch: 'Older months below 95%. That money may be getting stuck.' },
          { t: 'visual', name: 'Monthly collections', kind: 'Table', what: 'Invoices, billed, collected, outstanding and collected % for each due month, newest first.' },
        ] },
      { group: 'Customer aging', id: 'customers', title: 'Customer aging',
        blocks: [
          { t: 'visual', name: 'Customer aging detail', kind: 'Table', what: 'Each customer\'s open balance split across all eight buckets, with a total. Largest balance first.', read: 'Red amounts are over 90 days. The bottom row has totals for each bucket.', click: 'Click a row to open the overview filtered to that customer.', ex: 'Fieldstone Foods shows $2,780.27 in the 366+ column.' },
        ] },
      { group: 'Impact', id: 'impact', title: 'The Impact page', lede: 'What changed after the dashboard went live in February 2026. The slicers do not apply here.',
        blocks: [
          { t: 'table', head: ['Section', 'What it shows'], rows: [
            ['Effort saved (big card)', 'The weekly aging report used to come from accounting exports and a spreadsheet: about 10 hours a week for finance.'],
            ['Before vs after', 'Invoices issued in the first 3 months of the data against the latest 3 complete months, including days to pay.'],
            ['Cash freed up', 'Drop in days to pay × average monthly billing ÷ 30.'],
            ['Chart', 'Average days to pay by invoice month, paid invoices only, with go-live marked.'],
            ['How the work changed', 'Each part of the process before and after. These are effort estimates, not system data.'],
          ] },
        ] },
    ],
    glossary: [
      ['Open amount', 'What is still owed on an item.'], ['Past due', 'Open after the due date.'], ['Current', 'Not due yet.'], ['Aging bucket', 'A range of days past due.'],
      ['Days to pay', 'Days from invoice date to the date it was paid.'], ['Credit memo', 'A credit owed back to the customer.'], ['Reversal', 'An entry that cancels an earlier one.'],
      ['Collected %', 'Paid ÷ billed for invoices due in a month.'],
    ],
  };
})();
