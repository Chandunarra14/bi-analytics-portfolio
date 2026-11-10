(function () {
  const S = SD, n = S.n;
  const f0 = d3.format(',.0f'), usd = S.fmtUsd, usdK = (v) => (v < 0 ? '−' : '') + '$' + d3.format('.3~s')(Math.abs(v)).replace('G', 'B'), pct = (v) => d3.format('.0f')(v) + '%';
  const BK = ['Current', '1-30', '31-60', '61-90', '91-120', '121-180', '181-365', '366+'];
  const BCOL = ['#22a06b', '#84cc16', '#f2c230', '#f97316', '#e5484d', '#be123c', '#7f1d1d', '#450a0a'];
  const map = { csm: 'csm', cls: 'classification', cust: 'customer', bucket: 'bucket' };
  const base = (D, F, skip) => D.invoices.filter((r) => F.ok(r, Object.fromEntries(Object.entries(map).filter(([k]) => k !== skip))));
  const openRows = (rs) => rs.filter((r) => n(r.open_amount) !== 0);
  const sum = (rs, k) => d3.sum(rs, (r) => n(r[k]));
  const over = (rs, d) => rs.filter((r) => n(r.days_past_due) > d);
  const months = Array.from({ length: 12 }, (_, i) => d3.utcFormat('%Y-%m-%d')(d3.utcMonth.offset(new Date(Date.UTC(2026, 10, 1)), i - 11)));
  const recentPay = (rs) => { const v = rs.filter((r) => r.days_to_pay !== '' && r.invoice_date >= '2026-07-01').map((r) => n(r.days_to_pay)); return v.length ? d3.mean(v) : 0; };

  App({
    title: 'Accounts Receivable',
    eyebrow: 'Managed services · Finance',
    sub: 'What clients owe, how old it is, and how well each month\'s billing is being collected, down to the customer and CSM.',
    files: { invoices: 'data/invoices.csv', impact: 'data/impact.csv' },
    slicers: [
      { key: 'bucket', label: 'Aging bucket', all: 'All buckets', options: BK },
      { key: 'csm', label: 'CSM', all: 'All CSMs', options: (D) => SDu.uniq(D.invoices, 'csm') },
      { key: 'cls', label: 'Classification', all: 'All levels', options: (D) => SDu.uniq(D.invoices, 'classification') },
      { key: 'cust', label: 'Customer', all: 'All customers', options: (D) => SDu.uniq(D.invoices, 'customer') },
    ],
    pages: [
      { id: 'overview', label: 'Past due overview', slicers: ['bucket', 'csm', 'cls', 'cust'], blocks: [
        { type: 'text', html: (D, F) => { const o = openRows(base(D, F)); return `Clients owe <b>${usdK(sum(o, 'open_amount'))}</b> across <b>${f0(o.length)}</b> open items. <b>${usdK(sum(over(o, 90), 'open_amount'))}</b> of that is more than 90 days past due, spread over <b>${new Set(over(o, 90).map((r) => r.customer)).size}</b> customers.`; } },
        { type: 'kpis', items: [
          { label: 'Total open', value: (D, F) => usdK(sum(openRows(base(D, F)), 'open_amount')), sub: (D, F) => `${f0(openRows(base(D, F)).length)} open items` },
          { label: 'Past due', value: (D, F) => usdK(sum(over(openRows(base(D, F)), 0), 'open_amount')), tone: () => 'warn', sub: (D, F) => `${f0(over(openRows(base(D, F)), 0).length)} invoices` },
          { label: 'Over 90 days', value: (D, F) => usdK(sum(over(openRows(base(D, F)), 90), 'open_amount')), tone: () => 'bad', sub: (D, F) => `${new Set(over(openRows(base(D, F)), 90).map((r) => r.customer)).size} customers` },
          { label: 'Avg days to pay', value: (D, F) => f0(recentPay(base(D, F))), sub: () => 'invoices since July' },
          { label: 'Credit memos open', value: (D, F) => usdK(sum(openRows(base(D, F)).filter((r) => r.type !== 'Invoice'), 'open_amount')), sub: (D, F) => `${openRows(base(D, F)).filter((r) => r.type !== 'Invoice').length} items` },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 7, title: 'Open amounts by aging bucket', note: 'Days past due. Click a bar to filter.', h: 250, draw: (el, D, F) => {
            const o = openRows(base(D, F, 'bucket'));
            S.bars(el, { data: BK.map((b) => ({ b, v: sum(o.filter((r) => r.bucket === b), 'open_amount') })), cat: 'b', values: true, yFmt: usdK, onPick: (d) => F.toggle('bucket', d.b), series: [{ key: 'v', label: 'Open amount', color: '#1e3a8a' }], label: 'Open amount by bucket' });
          } },
          { type: 'card', span: 5, title: 'Top 10 customers over 90 days', note: 'Share of the 90+ day balance. Click a slice to filter.', h: 250, draw: (el, D, F) => {
            const o = over(openRows(base(D, F, 'cust')), 90);
            const data = Array.from(d3.rollup(o, (v) => d3.sum(v, (r) => n(r.open_amount)), (r) => r.customer), ([c, v]) => ({ c, v })).sort((a, b) => b.v - a.v).slice(0, 10);
            if (!data.length) { el.textContent = 'No balances over 90 days for this selection'; return; }
            S.donut(el, { data, labelKey: 'c', value: 'v', colors: data.map((d, i) => S.col(i)), centerLabel: 'over 90 days', onPick: (d) => F.toggle('cust', d.c), label: 'Top customers over 90 days' });
            el.querySelector('.sd-donut-v').textContent = usdK(d3.sum(data, (d) => d.v));
            el.querySelectorAll('.sd-dlegend b').forEach((b, i) => { b.textContent = `${usdK(data[i].v)} · ${d3.format('.0%')(data[i].v / d3.sum(data, (d) => d.v))}`; });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'card', span: 6, title: 'Open items by status', h: 200, draw: (el, D, F) => {
            const o = openRows(base(D, F)); const data = Array.from(d3.rollup(o, (v) => v.length, (r) => r.status), ([s, v]) => ({ s, v })).sort((a, b) => b.v - a.v);
            S.hbars(el, { data, labelKey: 's', value: 'v', fmt: f0, color: '#1e3a8a', label: 'Open items by status' });
          } },
          { type: 'card', span: 6, title: 'Open items by type', h: 200, draw: (el, D, F) => {
            const o = openRows(base(D, F)); const data = Array.from(d3.rollup(o, (v) => v.length, (r) => r.type), ([s, v]) => ({ s, v })).sort((a, b) => b.v - a.v);
            S.hbars(el, { data, labelKey: 's', value: 'v', fmt: f0, color: '#0ea5e9', label: 'Open items by type' });
          } },
        ] },
      ] },
      { id: 'aging', label: 'Aging analysis', slicers: ['csm', 'cls', 'cust'], blocks: [
        { type: 'row', blocks: [
          { type: 'card', span: 5, title: 'Share of open balance by bucket', note: 'Click a slice to filter the overview.', h: 280, draw: (el, D, F) => {
            const o = openRows(base(D, F, 'bucket')); const data = BK.map((b, i) => ({ b, i, v: Math.max(0, sum(o.filter((r) => r.bucket === b), 'open_amount')) })).filter((d) => d.v > 0);
            S.donut(el, { data, labelKey: 'b', value: 'v', colors: data.map((d) => BCOL[d.i]), centerLabel: 'open', onPick: (d) => F.toggle('bucket', d.b), label: 'Open balance by bucket' });
            el.querySelector('.sd-donut-v').textContent = usdK(d3.sum(data, (d) => d.v));
            el.querySelectorAll('.sd-dlegend b').forEach((b, i) => { b.textContent = `${usdK(data[i].v)} · ${d3.format('.0%')(data[i].v / d3.sum(data, (d) => d.v))}`; });
          } },
          { type: 'table', span: 7, title: 'Aging buckets', note: 'Open amount, share of total billed, invoice count and average open item.',
            cols: [{ label: 'Bucket', key: 'b', render: (td, r) => { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = BCOL[BK.indexOf(r.b)]; td.append(d, document.createTextNode(r.b === 'Current' ? 'Current' : r.b + ' days')); } },
              { label: 'Open amount', key: 'v', cls: 'r', fmt: usd }, { label: '% of open', key: 'p', cls: 'r', fmt: (v) => d3.format('.1f')(v) + '%' }, { label: 'Items', key: 'c', cls: 'r' }, { label: 'Avg item', key: 'a', cls: 'r', fmt: usd }],
            rows: (D, F) => { const o = openRows(base(D, F, 'bucket')); const tot = sum(o, 'open_amount') || 1; return BK.map((b) => { const x = o.filter((r) => r.bucket === b); const v = sum(x, 'open_amount'); return { b, v, p: (v / tot) * 100, c: x.length, a: x.length ? v / x.length : 0 }; }); },
            total: { v: (rs) => usd(d3.sum(rs, (r) => r.v)), p: () => '100%', c: (rs) => f0(d3.sum(rs, (r) => r.c)), a: (rs) => usd(d3.sum(rs, (r) => r.v) / Math.max(1, d3.sum(rs, (r) => r.c))) } },
        ] },
      ] },
      { id: 'collections', label: 'Collections', slicers: ['csm', 'cls', 'cust'], blocks: [
        { type: 'row', blocks: [
          { type: 'card', span: 7, title: 'Billed vs still outstanding, by due month', note: 'Invoices due each month and how much of each month is still unpaid.', h: 250, draw: (el, D, F) => {
            const r = base(D, F, 'bucket').filter((x) => x.type === 'Invoice');
            S.bars(el, { data: months.map((m) => ({ m, billed: sum(r.filter((x) => x.due_month === m), 'amount'), open: sum(r.filter((x) => x.due_month === m), 'open_amount') })), cat: 'm', yFmt: usdK, catFmt: (m) => d3.utcFormat('%b')(S.parseDate(m)),
              series: [{ key: 'billed', label: 'Billed', color: '#cbd5e1' }, { key: 'open', label: 'Still outstanding', color: '#e5484d' }], label: 'Billed and outstanding by due month' });
          } },
          { type: 'card', span: 5, title: 'Collection performance', note: 'Share of each due month\'s billing collected so far. Recent months are still in their payment window.', h: 250, draw: (el, D, F) => {
            const r = base(D, F, 'bucket').filter((x) => x.type === 'Invoice');
            S.line(el, { data: months.map((m) => { const x = r.filter((y) => y.due_month === m); const b = sum(x, 'amount'); return { m, v: b ? (sum(x, 'paid_amount') / b) * 100 : 0 }; }), x: (d) => S.parseDate(d.m), yZero: true, points: true, yFmt: (v) => d3.format('.0f')(v) + '%',
              series: [{ key: 'v', label: 'Collected', color: '#22a06b' }], label: 'Collection performance by month' });
          } },
        ] },
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Monthly collections', note: 'By due month.',
            cols: [{ label: 'Due month', key: 'm', fmt: (v) => d3.utcFormat('%b %Y')(S.parseDate(v)) }, { label: 'Invoices', key: 'c', cls: 'r' }, { label: 'Billed', key: 'b', cls: 'r', fmt: usd }, { label: 'Collected', key: 'p', cls: 'r', fmt: usd },
              { label: 'Outstanding', key: 'o', cls: 'r', fmt: usd }, { label: 'Collected %', key: 'cp', cls: 'r', render: (td, r) => { const d = document.createElement('span'); d.className = 'sd-dot'; d.style.background = r.cp >= 95 ? 'var(--color-ok)' : r.cp >= 80 ? 'var(--color-warn)' : 'var(--color-bad)'; td.append(d, document.createTextNode(d3.format('.1f')(r.cp) + '%')); } }],
            rows: (D, F) => { const r = base(D, F, 'bucket').filter((x) => x.type === 'Invoice'); return months.slice().reverse().map((m) => { const x = r.filter((y) => y.due_month === m); const b = sum(x, 'amount'); return { m, c: x.length, b, p: sum(x, 'paid_amount'), o: sum(x, 'open_amount'), cp: b ? (sum(x, 'paid_amount') / b) * 100 : 0 }; }); } },
        ] },
      ] },
      { id: 'customers', label: 'Customer aging', slicers: ['csm', 'cls'], blocks: [
        { type: 'row', blocks: [
          { type: 'table', span: 12, title: 'Customer aging detail', note: 'Open balance per customer by bucket, largest first. Click a row to filter the overview to that customer.', maxH: 560,
            onRow: (r, F) => { F.state.cust = r.customer; F.go('overview'); },
            cols: [{ label: 'Customer', key: 'customer' }, { label: 'CSM', key: 'csm' }].concat(BK.map((b) => ({ label: b, key: b, cls: 'r', render: (td, r) => { if (r[b]) { td.textContent = usd(r[b]); if (BK.indexOf(b) >= 4) td.style.color = 'var(--color-bad)'; } } })))
              .concat([{ label: 'Total', key: 'tot', cls: 'r', render: (td, r) => { const x = document.createElement('b'); x.textContent = usd(r.tot); td.append(x); } }]),
            rows: (D, F) => Array.from(d3.group(openRows(base(D, F, 'bucket')), (r) => r.customer), ([customer, xs]) => Object.assign({ customer, csm: xs[0].csm, tot: sum(xs, 'open_amount') }, Object.fromEntries(BK.map((b) => [b, sum(xs.filter((r) => r.bucket === b), 'open_amount')])))).sort((a, b) => b.tot - a.tot),
            total: Object.assign({ tot: (rs) => usd(d3.sum(rs, (r) => r.tot)) }, Object.fromEntries(BK.map((b) => [b, (rs) => usd(d3.sum(rs, (r) => r[b]))]))) },
        ] },
      ] },
      { id: 'impact', label: 'Impact', impact: true, blocks: [{ type: 'impact' }] },
    ],
    impactNote: 'Invoices issued in the first 3 months of the data vs the latest 3 complete months.',
    impactChart: { title: 'Average days to pay, by invoice month', note: 'Paid invoices only.', h: 240, draw: (el, D) => {
      const data = months.slice(0, 10).map((m) => { const v = D.invoices.filter((r) => r.days_to_pay !== '' && r.invoice_date.slice(0, 7) === m.slice(0, 7)).map((r) => n(r.days_to_pay)); return { m, v: v.length ? d3.mean(v) : 0 }; });
      S.line(el, { data, x: (d) => S.parseDate(d.m), yZero: true, points: true, yFmt: f0, annotate: { date: new Date(Date.UTC(2026, 1, 1)), text: 'Go-live' }, series: [{ key: 'v', label: 'Days to pay', color: '#2f6fed' }], label: 'Days to pay by month' });
    } },
    impactMethod: 'Before = invoices issued in the first 3 months of the data, after = the latest 3 complete months. Cash freed up = drop in days to pay × average monthly billing ÷ 30. Reporting effort figures are estimates. Every figure here is sample data built for this prototype.',
  });
})();
