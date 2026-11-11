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
          { t: 'visual', name: 'Open amounts by aging bucket', h: 210, chart: (el) => GX.bars(el, { cats: ['Current', '1-30', '31-60', '61-90', '91-120', '121-180', '181-365', '366+'], fmt: (v) => '$' + d3.format('.2~s')(v), series: [['Open amount', '#1e3a8a', [560, 210, 90, 30, 40, 60, 90, 120].map((v) => v * 1000)]] }), how: "Open amount added up by aging bucket.", kind: 'Column chart', what: 'How much is open in each bucket.', read: 'You want the money on the left.', watch: 'Tall bars on the right: old debt that gets harder to collect.', click: 'Click a bar to filter to that bucket.' },
          { t: 'visual', name: 'Top 10 customers over 90 days', h: 210, chart: (el) => GX.donut(el, { center: 'over 90 days', fmt: (v) => '$' + d3.format('.2~s')(v), items: [['Fieldstone Foods', 62000, '#2f6fed'], ['Foxridge Engineering', 48000, '#18a999'], ['Bayline Logistics', 36000, '#f2a541'], ['Eastgate Realty', 22000, '#8b5cf6'], ['Others', 30000, '#64748b']] }), watch: "One customer holding most of the late balance.", how: "Open amounts more than 90 days past due, added up per customer, top 10.", kind: 'Donut', what: 'The 10 customers with the most money over 90 days late, and their share.', read: 'Start collection calls at the biggest slice.', click: 'Click a slice to filter to that customer.' },
          { t: 'visual', name: 'Open items by status', h: 150, chart: (el) => GX.hbars(el, { items: [['Posted', 119], ['Partially Paid', 23], ['Applied', 68]], color: '#1e3a8a' }), read: "Most open items should be Posted (sent, not yet paid).", watch: "A lot of Partially Paid items: customers short-paying.", how: "Open items counted by status.", kind: 'Horizontal bars', what: 'Open items by status: Posted, Partially Paid and so on.' },
          { t: 'visual', name: 'Open items by type', h: 150, chart: (el) => GX.hbars(el, { items: [['Invoice', 142], ['Credit Memo', 54], ['Reversal', 14]], color: '#0ea5e9' }), read: "Invoices are what customers owe. Credit memos and reversals reduce it.", watch: "Lots of open credit memos: credits not applied yet.", how: "Open items counted by type.", kind: 'Horizontal bars', what: 'Open items by type: Invoice, Credit Memo or Reversal.' },
        ] },
      { group: 'Aging analysis', id: 'aging', title: 'Aging analysis',
        blocks: [
          { t: 'visual', name: 'Share of open balance by bucket', h: 220, chart: (el) => GX.donut(el, { center: 'open', fmt: (v) => '$' + d3.format('.2~s')(v), items: [['Current', 560000, '#22a06b'], ['1-30', 210000, '#84cc16'], ['31-60', 90000, '#f2c230'], ['61-90', 30000, '#f97316'], ['91-120', 40000, '#e5484d'], ['121-180', 60000, '#be123c'], ['181-365', 90000, '#7f1d1d'], ['366+', 120000, '#450a0a']] }), read: "Greens should be the biggest slices.", watch: "Dark red slices growing.", how: "Open amount by bucket \u00f7 total open amount.", kind: 'Donut', legend: BK, what: 'The open balance split by bucket, with amounts and shares in the legend.', click: 'Click a slice to filter the overview to that bucket.' },
          { t: 'visual', name: 'Aging buckets', h: 110, chart: (el) => GX.table(el, ['Bucket', 'Open amount', '% of open', 'Items', 'Avg item'], [[GX.dot('#22a06b', 'Current'), '$560,000', '46.7%', '82', '$6,829'], [GX.dot('#450a0a', '366+ days'), '$120,000', '10.0%', '31', '$3,871']]), watch: "A big % of open in the oldest buckets.", kind: 'Table', what: 'Open amount, % of open, item count and average item size for each bucket.', read: 'The bottom row has totals.', how: 'Avg item = open amount ÷ items.' },
        ] },
      { group: 'Collections', id: 'collections', title: 'Collections', lede: 'How much of each month\'s billing has been collected.',
        blocks: [
          { t: 'visual', name: 'Billed vs still outstanding, by due month', h: 220, chart: (el) => GX.bars(el, { cats: GX.months(12).map((m) => m.slice(0, 3)), values: false, fmt: (v) => '$' + d3.format('.2~s')(v), series: [['Billed', '#cbd5e1', [610, 620, 600, 640, 630, 650, 660, 640, 670, 680, 690, 700].map((v) => v * 1000)], ['Still outstanding', '#e5484d', [18, 12, 10, 9, 8, 10, 12, 18, 30, 80, 260, 640].map((v) => v * 1000)]] }), watch: "Red bars on older months that should be paid by now.", how: "Invoices grouped by due month: amount billed and open amount still owed.", kind: 'Grouped bars', legend: [['Billed', '#cbd5e1'], ['Still outstanding', '#e5484d']], what: 'For each due month, total billed and how much of it is still unpaid.', read: 'Small red bars are good. Recent months will have more red because they are still within payment terms.' },
          { t: 'visual', name: 'Collection performance', h: 210, chart: (el) => GX.line(el, { cats: GX.months(12), zero: true, fmt: (v) => Math.round(v) + '%', series: [['Collected', '#22a06b', [97, 98, 98, 99, 99, 98, 98, 97, 96, 88, 62, 9]]] }), read: "Older months should sit near 100%. The last months drop because they aren't due yet.", kind: 'Line chart', what: 'Share of each due month\'s billing collected so far.', how: 'Paid amount ÷ billed amount, invoices only.', watch: 'Older months below 95%. That money may be getting stuck.' },
          { t: 'visual', name: 'Monthly collections', h: 110, chart: (el) => GX.table(el, ['Due month', 'Invoices', 'Billed', 'Collected', 'Outstanding', 'Collected %'], [['Oct 2026', '78', '$680,000', '$600,000', '$80,000', GX.dot('var(--color-warn)', '88.2%')], ['Sep 2026', '76', '$670,000', '$643,000', '$27,000', GX.dot('var(--color-ok)', '96.0%')]]), read: "Newest month first. The dot shows how well each month was collected.", watch: "Red dots on months older than 60 days.", how: "Collected % = paid \u00f7 billed for invoices due that month.", kind: 'Table', what: 'Invoices, billed, collected, outstanding and collected % for each due month, newest first.' },
        ] },
      { group: 'Customer aging', id: 'customers', title: 'Customer aging',
        blocks: [
          { t: 'visual', name: 'Send payment reminders', kind: 'Action panel', h: 110,
            chart: (el) => GX.table(el, ['', 'Customer', 'Send to', 'Items', 'Oldest', 'Past due', 'Last reminder'], [['☑', 'Fieldstone Foods', 'ap@fieldstonefoods.example.com', '4', '861 days', '$9,133', '—'], ['☐', 'Ironwood Machining', 'ap@ironwoodmachining.example.com', '3', '689 days', '$10,257', 'Sent Nov 10']], { red: [[0, 4], [1, 4]] }),
            what: 'A three-step panel for emailing payment reminders: pick how long past due, check which customers get one, then send.',
            read: 'Click the duration buttons (or a quick pick like Over 90) to choose who is included. The list shows each customer\'s past-due amount in those durations. Untick anyone you want to leave out. The message preview fills in each customer\'s own amounts.',
            watch: 'The Last reminder column, so the same customer isn\'t reminded twice in a few days.',
            how: 'Past due = open invoice amounts with at least 1 day past due, in the selected aging buckets, per customer. The CSM and Classification slicers narrow the list.',
            click: 'Send asks you to confirm, then stamps Last reminder. In this prototype no emails actually go out.' },
          { t: 'visual', name: 'Customer aging detail', h: 110, chart: (el) => GX.table(el, ['Customer', 'CSM', 'Current', '1-30', '91-120', '366+', 'Total'], [['Fieldstone Foods', 'Drew Patel', '$4,200', '$1,100', '$0', '$2,780', '<b>$8,080</b>'], ['Foxridge Engineering', 'Drew Patel', '$2,000', '$0', '$1,500', '$1,178', '<b>$4,678</b>']], { red: [[0, 5], [1, 4], [1, 5]] }), watch: "Customers with red amounts and no recent payments.", how: "Open amount per customer split by aging bucket, largest total first.", kind: 'Table', what: 'Each customer\'s open balance split across all eight buckets, with a total. Largest balance first.', read: 'Red amounts are over 90 days. The bottom row has totals for each bucket.', click: 'Click a row to open the overview filtered to that customer.', ex: 'Fieldstone Foods shows $2,780.27 in the 366+ column.' },
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
