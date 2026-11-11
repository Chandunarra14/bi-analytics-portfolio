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

  // ---------- payment reminders (prototype: nothing is actually emailed) ----------
  const REM = { buckets: new Set(['91-120', '121-180', '181-365', '366+']), skip: new Set(), sent: new Map(), preview: false };
  const slug = (c) => c.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const stamp = () => d3.timeFormat('%b %d, %I:%M %p')(new Date());
  function reminders(el, D, F) {
    el.replaceChildren();
    const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    const past = openRows(base(D, F, 'bucket')).filter((r) => r.type === 'Invoice' && n(r.days_past_due) > 0 && REM.buckets.has(r.bucket));
    const list = Array.from(d3.group(past, (r) => r.customer), ([customer, xs]) => ({ customer, csm: xs[0].csm, amt: sum(xs, 'open_amount'), items: xs.length, oldest: d3.max(xs, (r) => n(r.days_past_due)), email: `ap@${slug(customer)}.example.com` }))
      .sort((a, b) => b.amt - a.amt);
    const chosen = list.filter((r) => !REM.skip.has(r.customer));
    // 1. duration
    const step1 = mk('div', 'ar-rem-step'); step1.append(mk('div', 'ar-rem-h', '1. Who to remind, by how long past due'));
    const chips = mk('div', 'ar-rem-chips');
    BK.slice(1).forEach((b) => { const c = mk('button', 'ar-chip' + (REM.buckets.has(b) ? ' is-on' : ''), b + ' days'); c.type = 'button';
      c.onclick = () => { REM.buckets.has(b) ? REM.buckets.delete(b) : REM.buckets.add(b); reminders(el, D, F); }; chips.append(c); });
    const quick = mk('div', 'ar-rem-quick'); quick.append(mk('span', 'sd-note', 'Quick pick:'));
    [['All past due', 1], ['Over 30', 2], ['Over 60', 3], ['Over 90', 4], ['Over 180', 6]].forEach(([l, i]) => { const q = mk('button', 'ar-link', l); q.type = 'button';
      q.onclick = () => { REM.buckets = new Set(BK.slice(i)); reminders(el, D, F); }; quick.append(q); });
    step1.append(chips, quick);
    // 2. customers
    const step2 = mk('div', 'ar-rem-step');
    const h2 = mk('div', 'ar-rem-h', `2. Customers (${chosen.length} of ${list.length} selected · ${usd(d3.sum(chosen, (r) => r.amt))} past due)`);
    step2.append(h2);
    if (!list.length) step2.append(mk('p', 'sd-note', 'No past-due balances in the selected durations.'));
    else {
      const wrap = mk('div', 'sd-tw ar-rem-list'); const t = mk('table', 'sd-table');
      const all = mk('input'); all.type = 'checkbox'; all.checked = chosen.length === list.length; all.title = 'Select all';
      all.onchange = () => { if (all.checked) REM.skip.clear(); else list.forEach((r) => REM.skip.add(r.customer)); reminders(el, D, F); };
      const thr = mk('tr'); const th0 = mk('th'); th0.append(all); thr.append(th0);
      ['Customer', 'CSM', 'Send to', 'Items', 'Oldest', 'Past due', 'Last reminder'].forEach((x, i) => thr.append(mk('th', i >= 3 && i <= 5 ? 'r' : '', x)));
      const th = mk('thead'); th.append(thr); t.append(th);
      const tb = mk('tbody');
      list.forEach((r) => { const tr = mk('tr'); const td = mk('td'); const cb = mk('input'); cb.type = 'checkbox'; cb.checked = !REM.skip.has(r.customer);
        cb.onchange = () => { cb.checked ? REM.skip.delete(r.customer) : REM.skip.add(r.customer); reminders(el, D, F); }; td.append(cb); tr.append(td);
        tr.append(mk('td', '', r.customer), mk('td', '', r.csm), mk('td', 'ar-mail', r.email), mk('td', 'r', r.items));
        const od = mk('td', 'r', r.oldest + ' days'); if (r.oldest > 90) od.style.color = 'var(--color-bad)'; tr.append(od);
        tr.append(mk('td', 'r', usd(r.amt)));
        const ls = mk('td', '', REM.sent.get(r.customer) || '—'); if (REM.sent.has(r.customer)) ls.style.color = 'var(--color-ok)'; tr.append(ls);
        tb.append(tr); });
      t.append(tb); wrap.append(t); step2.append(wrap);
    }
    // 3. message + send
    const step3 = mk('div', 'ar-rem-step'); step3.append(mk('div', 'ar-rem-h', '3. Message'));
    const ex = chosen[0] || { customer: '[Customer]', amt: 0, items: 0, oldest: 0 };
    const msg = mk('div', 'ar-rem-msg');
    msg.innerHTML = `<div class="sd-note">Subject: Payment reminder: ${usd(ex.amt)} past due</div><p>Hi ${ex.customer} team,</p><p>This is a friendly reminder that <b>${ex.items}</b> invoice${ex.items === 1 ? '' : 's'} totaling <b>${usd(ex.amt)}</b> ${ex.items === 1 ? 'is' : 'are'} past due, the oldest by <b>${ex.oldest} days</b>. A statement is attached.</p><p>If you've already sent payment, thank you and please ignore this note. Otherwise, reply here or call us to set up payment.</p><p>Thanks,<br>Accounts Receivable</p>`;
    step3.append(mk('div', 'sd-note', 'Each customer gets their own amounts. Preview for the first customer selected:'), msg);
    const bar = mk('div', 'ar-rem-bar');
    const send = mk('button', 'ar-send', `Send ${chosen.length} reminder${chosen.length === 1 ? '' : 's'}`); send.type = 'button'; send.disabled = !chosen.length;
    const status = mk('span', 'sd-note');
    send.onclick = () => {
      if (!window.confirm(`Send payment reminders to ${chosen.length} customer${chosen.length === 1 ? '' : 's'} (${usd(d3.sum(chosen, (r) => r.amt))} past due)?`)) return;
      const t = stamp(); chosen.forEach((r) => REM.sent.set(r.customer, 'Sent ' + t));
      reminders(el, D, F);
      const ok = el.querySelector('.ar-rem-bar .sd-note'); ok.textContent = `✓ ${chosen.length} reminder${chosen.length === 1 ? '' : 's'} sent. Prototype only: no emails actually go out.`; ok.style.color = 'var(--color-ok)';
    };
    bar.append(send, status); step3.append(bar);
    el.append(step1, step2, step3);
  }
  if (!document.getElementById('ar-rem-css')) { const st = document.createElement('style'); st.id = 'ar-rem-css'; st.textContent = `
    .ar-rem-step { margin-bottom: 16px; } .ar-rem-h { font-weight: 600; font-size: 13px; margin-bottom: 8px; }
    .ar-rem-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .ar-chip { font: inherit; font-size: 12px; border: 1px solid var(--color-border-line); background: var(--color-panel); color: var(--color-fg-muted); border-radius: 999px; padding: 5px 12px; cursor: pointer; }
    .ar-chip.is-on { background: #1e3a8a; border-color: #1e3a8a; color: #fff; }
    .ar-rem-quick { display: flex; gap: 10px; align-items: center; margin-top: 8px; } .ar-rem-quick .sd-note { margin: 0; }
    .ar-link { font: inherit; font-size: 12px; background: none; border: 0; color: #2f6fed; cursor: pointer; padding: 0; text-decoration: underline; }
    .ar-rem-list { max-height: 300px; overflow: auto; border: 1px solid var(--color-border-line); border-radius: 8px; } .ar-mail { color: var(--color-fg-muted); }
    .ar-rem-msg { border: 1px solid var(--color-border-line); border-radius: 8px; padding: 12px 16px; background: var(--color-bg); font-size: 13px; max-width: 760px; } .ar-rem-msg p { margin: 8px 0; }
    .ar-rem-bar { display: flex; gap: 14px; align-items: center; margin-top: 12px; } .ar-rem-bar .sd-note { margin: 0; }
    .ar-send { font: inherit; font-weight: 600; font-size: 14px; background: #1e3a8a; color: #fff; border: 0; border-radius: 8px; padding: 10px 18px; cursor: pointer; }
    .ar-send:hover { background: #172e6e; } .ar-send:disabled { background: #a7b0bd; cursor: not-allowed; }`; document.head.append(st); }

  App({
    story: {"headline": "Clients were paying late, and finance couldn't see who owed what until the weekly spreadsheet was built.", "sub": "The aging report came from accounting exports and took about 10 hours a week. CSMs never saw their own clients' balances, and customers took an average of 70 days to pay.", "who": "Finance, collections, CSMs and leadership", "problem": [["A slow weekly report", "Building the aging report from accounting exports took about 10 hours each week."], ["Slow payment", "Customers took about 70 days on average to pay, tying up cash."], ["CSMs out of the loop", "The people with the client relationship didn't know which of their clients were behind."], ["Old debt piling up", "17 accounts had balances more than a year old, with no clear follow-up list."]], "built": [["Live aging", "What is owed by bucket, from current to over a year late."], ["Collections by month", "How much of each month's billing has been collected."], ["Customer-level detail", "Every customer's balance by bucket, with the CSM on it."], ["Reminders in one click", "Pick how long past due, choose customers and send payment reminders from the Customer aging page."]], "pages": [["overview", "Past due overview", "Total open, past due and over 90 days, and who owes it."], ["aging", "Aging analysis", "How the open balance splits by age."], ["collections", "Collections", "Billed vs collected for each month."], ["customers", "Customer aging", "Each customer's balance, plus send payment reminders."], ["impact", "★ Impact", "Faster payment and cash freed up since go-live."]]},
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
      { id: 'context', label: 'Context', slicers: [], blocks: [{ type: 'story' }] },
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
          { type: 'card', span: 12, title: 'Send payment reminders', note: 'Pick how long past due, check who should get one, then send. Follows the CSM and Classification slicers.', h: 120, draw: (el, D, F) => reminders(el, D, F) },
        ] },
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
