// Small sample-chart helpers for the user guides. Wrap the shared SD chart builders with compact specs.
(function () {
  const S = window.SD;
  const ser = (list) => list.map(([label, color, vals, outline], i) => ({ key: 's' + i, label, color, outline, vals }));
  const rows = (cats, series) => cats.map((c, j) => Object.assign({ c }, Object.fromEntries(series.map((s) => [s.key, s.vals[j]]))));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const GX = {
    months: (n, endMonth = 10, endYear = 26) => Array.from({ length: n }, (_, i) => { const k = endMonth - (n - 1 - i); const m = ((k % 12) + 12) % 12; const y = endYear + Math.floor(k / 12); return MON[m] + ' ' + y; }),
    // bars(el, {cats, series:[[label,color,vals]], stacked, fmt, rotate, ref:[[value,label,color]], h, hi:[idx], hiColor})
    bars(el, o) {
      const sr = ser(o.series);
      S.bars(el, { data: rows(o.cats, sr), cat: 'c', series: sr, stacked: o.stacked, values: o.values !== false, yFmt: o.fmt || S.fmtK, rotate: o.rotate, height: o.h || 210,
        refLines: (o.ref || []).map(([value, label, color]) => ({ value, label, color: color || 'var(--color-fg)' })), label: 'Sample chart' });
      if (o.colors) el.querySelectorAll('svg rect').forEach((r, i) => { if (o.colors[i]) r.style.fill = o.colors[i]; });
    },
    // line(el, {cats, series:[[label,color,vals]], fmt, zero, anno:[idx,text]})
    line(el, o) {
      const sr = ser(o.series);
      const data = o.cats.map((c, j) => Object.assign({ d: new Date(Date.UTC(2020, j, 1)), c }, Object.fromEntries(sr.map((s) => [s.key, s.vals[j]]))));
      const lab = (d) => (data.find((x) => +x.d === +d) || {}).c || '';
      S.line(el, { data, x: (r) => r.d, xFmt: lab, tipFmt: lab, series: sr, yFmt: o.fmt || S.fmtK, yZero: o.zero, points: o.points !== false && o.cats.length <= 13, height: o.h || 210, legend: true,
        annotate: o.anno ? { date: data[o.anno[0]].d, text: o.anno[1] } : null, label: 'Sample chart' });
    },
    // hbars(el, {items:[[label,value]], color, fmt, hi(v,label), h})
    hbars(el, o) {
      S.hbars(el, { data: o.items.map(([l, v]) => ({ l, v })), labelKey: 'l', value: 'v', fmt: o.fmt || S.fmtK, color: o.color || '#1e3a8a', highlight: o.hi ? (d) => o.hi(d.v, d.l) : null, label: 'Sample chart' });
      if (o.colors) el.querySelectorAll('svg rect').forEach((r, i) => { if (o.colors[i]) r.style.fill = o.colors[i]; });
    },
    // donut(el, {items:[[label,value,color]], center, fmt})
    donut(el, o) {
      S.donut(el, { data: o.items.map(([l, v]) => ({ l, v })), labelKey: 'l', value: 'v', colors: o.items.map((x) => x[2]), centerLabel: o.center || 'total', label: 'Sample chart' });
      if (o.fmt) { const t = d3.sum(o.items, (x) => x[1]); el.querySelector('.sd-donut-v').textContent = o.fmt(t);
        el.querySelectorAll('.sd-dlegend b').forEach((b, i) => { b.textContent = `${o.fmt(o.items[i][1])} · ${d3.format('.0%')(o.items[i][1] / t)}`; }); }
    },
    // hstack(el, {rows:[[label, ...vals]], series:[[label,color,outline]], pct, fmt})
    hstack(el, o) {
      const sr = o.series.map(([label, color, outline], i) => ({ key: 's' + i, label, color, outline }));
      S.hstack(el, { rows: o.rows.map(([label, ...v]) => Object.assign({ label }, Object.fromEntries(v.map((x, i) => ['s' + i, x])))), series: sr, pct: o.pct, fmt: o.fmt || S.fmtK, rowH: o.rowH || 40, label: 'Sample chart' });
    },
    waterfall(el, o) { S.waterfall(el, { data: o.items.map(([label, value]) => ({ label, value })), total: o.total, fmt: o.fmt || S.fmtK, color: o.color || '#22a06b', totalColor: '#1e3a8a', height: o.h || 210, label: 'Sample chart' }); },
    // table(el, head, rows, {red:[[rowIdx,colIdx]], green:[[r,c]]})
    table(el, head, body, o = {}) {
      const t = document.createElement('table'); t.className = 'sd-table';
      t.innerHTML = '<thead><tr>' + head.map((x) => `<th class="${/^[−$\d]/.test(String(body[0][head.indexOf(x)])) ? 'r' : ''}">${x}</th>`).join('') + '</tr></thead>';
      const tb = document.createElement('tbody');
      body.forEach((r, i) => { const tr = document.createElement('tr'); r.forEach((c, j) => { const td = document.createElement('td'); td.innerHTML = c; if (/^[−$\d]/.test(String(c))) td.className = 'r';
        const key = i + ',' + j; if ((o.red || []).some(([a, b]) => a + ',' + b === key)) { td.style.color = 'var(--color-bad)'; td.style.fontWeight = 600; }
        if ((o.green || []).some(([a, b]) => a + ',' + b === key)) td.style.color = 'var(--color-ok)'; tr.append(td); }); tb.append(tr); });
      t.append(tb); const w = document.createElement('div'); w.className = 'sd-tw'; w.append(t); el.append(w);
    },
    dot: (color, txt) => `<span class="sd-dot" style="background:${color}"></span>${txt}`,
    // cards(el, [[label, value, sub, tone]])
    cards(el, items) { const g = document.createElement('div'); g.className = 'g-cards';
      items.forEach(([l, v, s, t]) => { const d = document.createElement('div'); d.innerHTML = `<div class="l">${l}</div><div class="v" style="color:${t === 'bad' ? 'var(--color-bad)' : t === 'good' ? 'var(--color-ok)' : t === 'warn' ? 'var(--color-warn)' : 'inherit'}">${v}</div><div class="s">${s || ''}</div>`; g.append(d); });
      el.append(g); },
    // heat(el, {cols, rows:[[label, ...vals]], color})
    heat(el, o) { const g = document.createElement('div'); g.className = 'g-heat'; g.style.gridTemplateColumns = `90px repeat(${o.cols.length}, 1fr)`;
      const mx = d3.max(o.rows, (r) => d3.max(r.slice(1))); g.append(Object.assign(document.createElement('div'), { className: 'hd' }));
      o.cols.forEach((c) => g.append(Object.assign(document.createElement('div'), { className: 'hd', textContent: c })));
      o.rows.forEach(([l, ...v]) => { g.append(Object.assign(document.createElement('div'), { className: 'rl', textContent: l }));
        v.forEach((x) => { const d = document.createElement('div'); d.textContent = x; const a = x / mx; d.style.background = `rgba(47,111,237,${0.1 + a * 0.85})`; d.style.color = a > 0.5 ? '#fff' : 'inherit'; g.append(d); }); });
      el.append(g); },
    // rings(el, [[label, value, target, sub]])
    rings(el, items) { const g = document.createElement('div'); g.className = 'sd-rings';
      items.forEach(([l, v, t, sub]) => { const c = document.createElement('div'); c.className = 'sd-ringcard'; const r = document.createElement('div'); S.ring(r, v, t, l);
        const tx = document.createElement('div'); tx.innerHTML = `<div class="sd-kpi-l">${l}</div><div class="sd-kpi-v" style="font-size:1.5rem">${v}</div><div class="sd-kpi-d">${sub || ''}</div>`; c.append(r, tx); g.append(c); });
      el.append(g); },
  };
  window.GX = GX;
})();
(function () {
  // gauge(el, value): half-circle churn gauge in four risk bands
  window.GX.gauge = function (el, value) {
    const W = 240, H = 150, R = 100;
    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H).attr('role', 'img').attr('aria-label', 'Sample gauge');
    const g = svg.append('g').attr('transform', `translate(${W / 2},${H - 30})`);
    const a = (v) => -Math.PI / 2 + (Math.PI * v) / 100;
    [[0, 25, '#22a06b'], [25, 50, '#f2c230'], [50, 75, '#f97316'], [75, 100, '#e5484d']].forEach(([s, e, c]) => g.append('path').attr('d', d3.arc().innerRadius(R - 20).outerRadius(R).startAngle(a(s)).endAngle(a(e)).padAngle(0.01)()).style('fill', c));
    const ang = a(value);
    g.append('line').attr('x2', Math.sin(ang) * (R - 28)).attr('y2', -Math.cos(ang) * (R - 28)).style('stroke', 'var(--color-fg)').attr('stroke-width', 4).attr('stroke-linecap', 'round');
    g.append('circle').attr('r', 7).style('fill', 'var(--color-fg)');
    g.append('text').attr('y', 26).attr('text-anchor', 'middle').attr('class', 'sd-donut-v').text(value + '%');
  };
})();
