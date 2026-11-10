// Shared helpers + chart builders. Everything here is called from inside drawings.
(function () {
  const SD = {};
  SD.n = (v) => (v === null || v === undefined || v === '' ? NaN : +v);
  SD.parseDate = d3.utcParse('%Y-%m-%d');
  SD.fmtMonth = d3.utcFormat('%b %y');
  SD.fmtMonthLong = d3.utcFormat('%B %Y');
  SD.fmtDay = d3.utcFormat('%b %d');
  SD.fmtInt = d3.format(',.0f');
  SD.fmt1 = d3.format(',.1f');
  SD.fmtK = (v) => (Math.abs(v) >= 1000 ? d3.format('.3~s')(v).replace('G', 'B') : d3.format(',.0f')(v));
  SD.fmtPct = (v) => d3.format('.1f')(v) + '%';
  SD.fmtUsd = (v) => '$' + d3.format(',.0f')(v);
  SD.col = (i) => dash.colors[i % dash.colors.length];

  // Returns rows for every id when all are ok; otherwise paints a state into el and returns null.
  SD.get = function (el, ids, opts) {
    const list = Array.isArray(ids) ? ids : [ids];
    const res = list.map((id) => dash.data(id));
    const bad = res.find((r) => r.status !== 'ok');
    if (bad) {
      el.replaceChildren();
      if (bad.status === 'error' || bad.status === 'missing') {
        const p = document.createElement('p');
        p.className = 'sd-fail';
        p.textContent = 'Failed to load';
        el.append(p);
      } else if (opts && opts.text) {
        el.textContent = '—';
      }
      return null;
    }
    return res.map((r) => r.data);
  };

  // single text value into el
  SD.text = function (el, ids, fn) {
    const d = SD.get(el, ids, { text: true });
    if (!d) return;
    el.classList.remove('dash-skeleton');
    el.textContent = fn(...d);
  };

  SD.tip = function (el) {
    const t = document.createElement('div');
    t.className = 'sd-tip';
    t.hidden = true;
    el.append(t);
    return {
      show(ev, lines) {
        t.replaceChildren();
        lines.forEach((ln, i) => {
          const r = document.createElement('div');
          if (i === 0) r.className = 'sd-tip-h';
          if (Array.isArray(ln)) {
            const sw = document.createElement('span');
            sw.className = 'sd-sw';
            sw.style.background = ln[0];
            r.append(sw, document.createTextNode(ln[1]));
          } else r.textContent = ln;
          t.append(r);
        });
        t.hidden = false;
        const box = el.getBoundingClientRect();
        const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - box.left;
        const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - box.top;
        const tw = t.offsetWidth, th = t.offsetHeight;
        let left = x + 14;
        if (left + tw > box.width) left = Math.max(0, x - tw - 14);
        let top = y - th - 10;
        if (top < 0) top = y + 14;
        t.style.left = left + 'px';
        t.style.top = top + 'px';
      },
      hide() { t.hidden = true; },
    };
  };

  function svgFor(el, h, label) {
    el.replaceChildren();
    el.classList.remove('dash-skeleton');
    const W = Math.max(260, el.clientWidth || 600);
    const svg = d3.select(el).append('svg')
      .attr('width', '100%').attr('viewBox', `0 0 ${W} ${h}`).attr('height', h)
      .attr('role', 'img').attr('aria-label', label || '');
    return { svg, W };
  }
  function measure(svg, texts) {
    const g = svg.append('g').attr('class', 'sd-axis');
    let w = 0;
    texts.forEach((s) => {
      const t = g.append('text').text(s);
      w = Math.max(w, t.node().getComputedTextLength() || s.length * 7);
    });
    g.remove();
    return w;
  }
  SD.legend = function (el, items, onPick) {
    const L = document.createElement('div');
    L.className = 'sd-legend';
    items.forEach((it) => {
      const s = document.createElement('span');
      if (onPick) { s.className = 'sd-pick'; s.title = 'Click to filter'; s.addEventListener('click', () => onPick(it)); }
      const sw = document.createElement('i');
      sw.style.background = it.color;
      s.append(sw, document.createTextNode(it.label));
      L.append(s);
    });
    el.prepend(L);
  };
  const reduce = () => window.SD_NOANIM || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  // Multi-series line chart. cfg: {data, x (fn->Date), series:[{key,label,color}], yFmt, height, label, points, yZero, xFmt, annotate:{date,text}}
  SD.line = function (el, cfg) {
    const H = cfg.height || 240;
    const { svg, W } = svgFor(el, H, cfg.label);
    const data = cfg.data;
    const all = [];
    cfg.series.forEach((s) => data.forEach((d) => { const v = SD.n(d[s.key]); if (!isNaN(v)) all.push(v); }));
    let [lo, hi] = d3.extent(all);
    if (cfg.yZero) lo = 0; else { const pad = (hi - lo) * 0.15 || 1; lo = lo - pad; hi = hi + pad; }
    const y = d3.scaleLinear().domain([lo, hi]).nice(4);
    const yFmt = cfg.yFmt || SD.fmtK;
    const ml = measure(svg, y.ticks(4).map(yFmt)) + 12;
    const m = { t: cfg.points ? 22 : 12, r: 28, b: 26, l: Math.max(ml, 26) };
    y.range([H - m.b, m.t]);
    const x = d3.scaleUtc().domain(d3.extent(data, cfg.x)).range([m.l, W - m.r]);
    svg.append('g').attr('class', 'sd-grid').attr('transform', `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(4).tickSize(-(W - m.l - m.r)).tickFormat(''));
    svg.append('g').attr('class', 'sd-axis').attr('transform', `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat(yFmt).tickSize(0).tickPadding(8)).call((g) => g.select('.domain').remove());
    const nT = Math.max(2, Math.min(data.length, Math.floor((W - m.l) / 70)));
    const xsAll = data.map(cfg.x);
    const kStep = Math.max(1, Math.ceil(xsAll.length / nT));
    const tv = xsAll.filter((d, i) => (xsAll.length - 1 - i) % kStep === 0);
    svg.append('g').attr('class', 'sd-axis').attr('transform', `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x).tickValues(tv).tickFormat(cfg.xFmt || SD.fmtMonth).tickSize(0).tickPadding(10)).call((g) => g.select('.domain').remove());
    if (cfg.annotate) {
      const ax = x(cfg.annotate.date);
      svg.append('line').attr('x1', ax).attr('x2', ax).attr('y1', m.t - 6).attr('y2', H - m.b)
        .style('stroke', 'var(--cds-chart-reference)').attr('stroke-dasharray', '4 4');
      svg.append('text').attr('class', 'sd-anno').attr('x', ax + 6).attr('y', m.t + 4).text(cfg.annotate.text);
    }
    const first = !el.dataset.drawn;
    cfg.series.forEach((s) => {
      const pts = data.filter((d) => !isNaN(SD.n(d[s.key])));
      const path = svg.append('path').datum(pts).attr('fill', 'none').style('stroke', s.color).attr('stroke-width', 2.25)
        .attr('d', d3.line().x((d) => x(cfg.x(d))).y((d) => y(SD.n(d[s.key]))));
      if (first && !reduce()) {
        const L = path.node().getTotalLength();
        path.attr('stroke-dasharray', `${L} ${L}`).attr('stroke-dashoffset', L)
          .transition().duration(900).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);
      }
      svg.append('g').selectAll('circle').data(pts).join('circle')
        .attr('cx', (d) => x(cfg.x(d))).attr('cy', (d) => y(SD.n(d[s.key]))).attr('r', 3)
        .style('fill', 'var(--color-panel)').style('stroke', s.color).attr('stroke-width', 2);
      if (cfg.points && cfg.series.length === 1 && W > 480) {
        svg.append('g').selectAll('text').data(pts).join('text').attr('class', 'sd-pt')
          .attr('x', (d) => x(cfg.x(d))).attr('y', (d) => y(SD.n(d[s.key])) - 9).attr('text-anchor', 'middle')
          .text((d) => yFmt(SD.n(d[s.key])));
      }
    });
    if (cfg.series.length > 1 || cfg.legend) SD.legend(el, cfg.series, cfg.onLegend);
    el.dataset.drawn = '1';
    // hover
    const tip = SD.tip(el);
    const guide = svg.append('line').style('stroke', 'var(--cds-chart-axis)').attr('y1', m.t).attr('y2', H - m.b).attr('opacity', 0);
    const xs = data.map(cfg.x);
    svg.append('rect').attr('x', m.l).attr('y', 0).attr('width', W - m.l - m.r).attr('height', H).attr('fill', 'transparent')
      .on('pointermove', (ev) => {
        const [px] = d3.pointer(ev);
        const i = d3.leastIndex(xs, (d) => Math.abs(x(d) - px));
        const d = data[i];
        guide.attr('x1', x(xs[i])).attr('x2', x(xs[i])).attr('opacity', 1);
        tip.show(ev, [(cfg.tipFmt || SD.fmtMonthLong)(xs[i]), ...cfg.series.map((s) => [s.color, `${s.label}: ${yFmt(SD.n(d[s.key]))}`])]);
      })
      .on('pointerleave', () => { tip.hide(); guide.attr('opacity', 0); });
  };

  // Vertical bars, grouped or stacked. cfg: {data, cat, series:[{key,label,color}], stacked, yFmt, height, label, values, catFmt}
  SD.bars = function (el, cfg) {
    const H = cfg.height || 240;
    const { svg, W } = svgFor(el, H, cfg.label);
    const data = cfg.data;
    const keys = cfg.series.map((s) => s.key);
    const yFmt = cfg.yFmt || SD.fmtK;
    const max = cfg.stacked ? d3.max(data, (d) => d3.sum(keys, (k) => SD.n(d[k]))) : d3.max(data, (d) => d3.max(keys, (k) => SD.n(d[k])));
    const y = d3.scaleLinear().domain([0, cfg.yMax || max * (cfg.values ? 1.14 : 1.02)]).nice(4);
    const ml = measure(svg, y.ticks(4).map(yFmt)) + 12;
    const catFmt = cfg.catFmt || ((c) => c);
    const cats = data.map((d) => d[cfg.cat]);
    const m = { t: 10, r: 8, b: 30, l: ml };
    y.range([H - m.b, m.t]);
    const x0 = d3.scaleBand().domain(cats).range([m.l, W - m.r]).paddingInner(0.28).paddingOuter(0.12);
    const x1 = d3.scaleBand().domain(keys).range([0, x0.bandwidth()]).padding(0.08);
    svg.append('g').attr('class', 'sd-grid').attr('transform', `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(4).tickSize(-(W - m.l - m.r)).tickFormat(''));
    svg.append('g').attr('class', 'sd-axis').attr('transform', `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(4).tickFormat(yFmt).tickSize(0).tickPadding(8)).call((g) => g.select('.domain').remove());
    const xa = svg.append('g').attr('class', 'sd-axis').attr('transform', `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x0).tickFormat(catFmt).tickSize(0).tickPadding(10)).call((g) => g.select('.domain').remove());
    // thin long labels
    const maxLab = x0.step();
    xa.selectAll('text').each(function () {
      const t = d3.select(this); let s = t.text();
      while (this.getComputedTextLength() > maxLab - 4 && s.length > 3) { s = s.slice(0, -2); t.text(s + '…'); }
    });
    const tip = SD.tip(el);
    const first = !el.dataset.drawn && !reduce();
    const g = svg.append('g');
    data.forEach((d) => {
      let acc = 0;
      cfg.series.forEach((s) => {
        const v = SD.n(d[s.key]) || 0;
        const bx = cfg.stacked ? x0(d[cfg.cat]) : x0(d[cfg.cat]) + x1(s.key);
        const bw = cfg.stacked ? x0.bandwidth() : x1.bandwidth();
        const y0 = cfg.stacked ? y(acc) : y(0), y1 = cfg.stacked ? y(acc + v) : y(v);
        acc += v;
        const r = g.append('rect').attr('x', bx).attr('width', bw).attr('rx', 3)
          .style('fill', s.color)
          .on('pointermove', (ev) => tip.show(ev, [catFmt(d[cfg.cat]), ...cfg.series.map((ss) => [ss.color, `${ss.label}: ${yFmt(SD.n(d[ss.key]))}`])]))
          .on('pointerleave', () => tip.hide())
          .on('click', () => { if (cfg.onPick) { tip.hide(); cfg.onPick(d, s); } })
          .style('cursor', cfg.onPick ? 'pointer' : null);
        if (first) r.attr('y', y(0)).attr('height', 0).transition().duration(700).ease(d3.easeCubicOut).attr('y', y1).attr('height', Math.max(0, y0 - y1));
        else r.attr('y', y1).attr('height', Math.max(0, y0 - y1));
        if (cfg.values && !cfg.stacked && bw > 22) {
          g.append('text').attr('class', 'sd-val').attr('x', bx + bw / 2).attr('y', y1 - 5).attr('text-anchor', 'middle').text(yFmt(v));
        }
      });
      if (cfg.values && cfg.stacked && x0.bandwidth() > 26) {
        g.append('text').attr('class', 'sd-val').attr('x', x0(d[cfg.cat]) + x0.bandwidth() / 2).attr('y', y(acc) - 5).attr('text-anchor', 'middle').text(yFmt(acc));
      }
    });
    if (cfg.series.length > 1 || cfg.onLegend) SD.legend(el, cfg.series, cfg.onLegend);
    el.dataset.drawn = '1';
  };

  // Horizontal ranked bars. cfg: {data, label, value, fmt, color, height?, highlight(d)}
  SD.hbars = function (el, cfg) {
    const data = cfg.data;
    const rowH = 26;
    const top = cfg.rightHead ? 16 : 0;
    const H = data.length * rowH + 8 + top;
    const { svg, W } = svgFor(el, H, cfg.label);
    const fmt = cfg.fmt || SD.fmtK;
    const rightW = cfg.right ? measure(svg, data.map(cfg.right).concat([cfg.rightHead || ''])) + 14 : 0;
    if (cfg.rightHead) svg.append('text').attr('class', 'sd-axis-t').attr('x', W).attr('y', 11).attr('text-anchor', 'end').style('font-weight', 600).text(cfg.rightHead);
    const labW = Math.min(W * 0.42, measure(svg, data.map((d) => d[cfg.labelKey])) + 10);
    const valW = measure(svg, data.map((d) => fmt(SD.n(d[cfg.value])))) + 10;
    const x = d3.scaleLinear().domain([0, d3.max(data, (d) => SD.n(d[cfg.value]))]).range([0, Math.max(10, W - labW - valW - 4 - rightW)]);
    const tip = SD.tip(el);
    const first = !el.dataset.drawn && !reduce();
    data.forEach((d, i) => {
      const yy = i * rowH + 4 + top;
      const lab = svg.append('text').attr('class', 'sd-axis-t').attr('x', labW - 8).attr('y', yy + rowH / 2).attr('dy', '0.35em').attr('text-anchor', 'end').text(d[cfg.labelKey]);
      let s = d[cfg.labelKey];
      while (lab.node().getComputedTextLength() > labW - 10 && s.length > 4) { s = s.slice(0, -2); lab.text(s + '…'); }
      const v = SD.n(d[cfg.value]);
      const r = svg.append('rect').attr('x', labW).attr('y', yy + 4).attr('height', rowH - 10).attr('rx', 3)
        .style('fill', cfg.highlight && cfg.highlight(d) ? 'var(--cds-chart-status-critical)' : cfg.color)
        .style('opacity', cfg.muteOthers && !(cfg.highlight && cfg.highlight(d)) ? 0.45 : null)
        .on('pointermove', (ev) => tip.show(ev, [d[cfg.labelKey], `${cfg.valueLabel || ''}${fmt(v)}`, ...(cfg.tipExtra ? cfg.tipExtra(d) : [])]))
        .on('pointerleave', () => tip.hide())
        .on('click', () => { if (cfg.onPick) { tip.hide(); cfg.onPick(d); } })
        .style('cursor', cfg.onPick ? 'pointer' : null);
      if (first) r.attr('width', 0).transition().duration(700).delay(i * 25).attr('width', x(v)); else r.attr('width', x(v));
      svg.append('text').attr('class', 'sd-val').attr('x', labW + x(v) + 6).attr('y', yy + rowH / 2).attr('dy', '0.35em').text(fmt(v));
      if (cfg.right) svg.append('text').attr('class', 'sd-axis-t').attr('x', W).attr('y', yy + rowH / 2).attr('dy', '0.35em').attr('text-anchor', 'end').text(cfg.right(d));
    });
    el.dataset.drawn = '1';
  };

  // Donut. cfg: {data, labelKey, value, colors, center:{value,label}}
  SD.donut = function (el, cfg) {
    el.replaceChildren();
    el.classList.remove('dash-skeleton');
    const W = Math.max(220, el.clientWidth || 300);
    const H = 220, R = Math.min(H / 2 - 6, W / 2 - 6);
    const wrap = document.createElement('div');
    wrap.className = 'sd-donut';
    el.append(wrap);
    const svg = d3.select(wrap).append('svg').attr('width', H).attr('height', H).attr('viewBox', `0 0 ${H} ${H}`)
      .attr('role', 'img').attr('aria-label', cfg.label || '');
    const g = svg.append('g').attr('transform', `translate(${H / 2},${H / 2})`);
    const total = d3.sum(cfg.data, (d) => SD.n(d[cfg.value]));
    const arcs = d3.pie().sort(null).value((d) => SD.n(d[cfg.value]))(cfg.data);
    const arc = d3.arc().innerRadius(R * 0.62).outerRadius(R).cornerRadius(3).padAngle(0.015);
    const tip = SD.tip(el);
    g.selectAll('path').data(arcs).join('path').attr('d', arc).style('fill', (d, i) => cfg.colors[i])
      .on('pointermove', (ev, d) => tip.show(ev, [d.data[cfg.labelKey], `${SD.fmtInt(d.value)} (${d3.format('.0%')(d.value / total)})`]))
      .on('pointerleave', () => tip.hide())
      .on('click', (ev, d) => { if (cfg.onPick) { tip.hide(); cfg.onPick(d.data); } })
      .style('cursor', cfg.onPick ? 'pointer' : null);
    g.append('text').attr('class', 'sd-donut-v').attr('text-anchor', 'middle').attr('dy', '0.1em').text(SD.fmtInt(total));
    g.append('text').attr('class', 'sd-donut-l').attr('text-anchor', 'middle').attr('dy', '1.6em').text(cfg.centerLabel || 'total');
    const L = document.createElement('ul');
    L.className = 'sd-dlegend';
    cfg.data.forEach((d, i) => {
      const li = document.createElement('li');
      const sw = document.createElement('i'); sw.style.background = cfg.colors[i];
      const a = document.createElement('span'); a.textContent = d[cfg.labelKey];
      const b = document.createElement('b'); b.textContent = `${SD.fmtInt(SD.n(d[cfg.value]))} · ${d3.format('.0%')(SD.n(d[cfg.value]) / total)}`;
      li.append(sw, a, b); L.append(li);
    });
    wrap.append(L);
  };

  // Table body builder. cols:[{key, fmt?, cls?, bar?:max, render?(td,row)}]
  SD.tbody = function (tb, rows, cols, keyFn) {
    tb.replaceChildren();
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      if (keyFn) tr.dataset.key = keyFn(r);
      cols.forEach((c) => {
        const td = document.createElement('td');
        if (c.cls) td.className = c.cls;
        if (c.render) c.render(td, r);
        else td.textContent = c.fmt ? c.fmt(r[c.key], r) : r[c.key];
        tr.append(td);
      });
      tb.append(tr);
    });
  };

  // Score ring (gauge replacement). value 0..100, target
  SD.ring = function (el, value, target, label) {
    el.replaceChildren();
    el.classList.remove('dash-skeleton');
    const S = 92, R = 38;
    const svg = d3.select(el).append('svg').attr('width', S).attr('height', S).attr('viewBox', `0 0 ${S} ${S}`)
      .attr('role', 'img').attr('aria-label', label);
    const g = svg.append('g').attr('transform', `translate(${S / 2},${S / 2})`);
    const a = d3.arc().innerRadius(R - 8).outerRadius(R).startAngle(0).cornerRadius(4);
    g.append('path').attr('d', a({ endAngle: 2 * Math.PI })).style('fill', 'var(--cds-chart-grid)');
    const ok = value >= target;
    g.append('path').attr('d', a({ endAngle: 2 * Math.PI * Math.min(1, value / 100) }))
      .style('fill', ok ? 'var(--color-ok)' : 'var(--color-warn)');
    const ta = 2 * Math.PI * target / 100;
    g.append('line').attr('x1', Math.sin(ta) * (R - 11)).attr('y1', -Math.cos(ta) * (R - 11)).attr('x2', Math.sin(ta) * (R + 3)).attr('y2', -Math.cos(ta) * (R + 3))
      .style('stroke', 'var(--color-fg)').attr('stroke-width', 2);
  };


  // Horizontal stacked bars. cfg: {rows:[{label, ...values}], series:[{key,label,color,outline}], fmt, pct, onPick, onLegend}
  SD.hstack = function (el, cfg) {
    const rows = cfg.rows, rowH = cfg.rowH || 46;
    const H = rows.length * rowH + 30;
    el.replaceChildren(); el.classList.remove('dash-skeleton');
    SD.legend(el, cfg.series, cfg.onLegend);
    const W = Math.max(260, el.clientWidth || 600);
    const svg = d3.select(el).append('svg').attr('width', '100%').attr('viewBox', `0 0 ${W} ${H}`).attr('height', H).attr('role', 'img').attr('aria-label', cfg.label || '');
    const fmt = cfg.fmt || SD.fmtK;
    const labW = measure(svg, rows.map((r) => r.label)) + 14;
    const totals = rows.map((r) => d3.sum(cfg.series, (s) => SD.n(r[s.key]) || 0));
    const totW = cfg.pct ? 0 : measure(svg, totals.map(fmt)) + 12;
    const x = d3.scaleLinear().domain([0, cfg.pct ? 100 : d3.max(totals) || 1]).range([labW, W - totW - 6]);
    svg.append('g').attr('class', 'sd-grid').attr('transform', `translate(0,${H - 22})`).call(d3.axisBottom(x).ticks(5).tickSize(-(H - 26)).tickFormat(''));
    svg.append('g').attr('class', 'sd-axis').attr('transform', `translate(0,${H - 22})`).call(d3.axisBottom(x).ticks(5).tickFormat(cfg.pct ? (v) => v + '%' : fmt).tickSize(0).tickPadding(8)).call((g) => g.select('.domain').remove());
    const tip = SD.tip(el);
    rows.forEach((r, i) => {
      const y = i * rowH + 6, h = rowH - 14;
      svg.append('text').attr('class', 'sd-axis-t').attr('x', labW - 10).attr('y', y + h / 2).attr('dy', '0.35em').attr('text-anchor', 'end').text(r.label);
      let acc = 0;
      const tot = totals[i] || 1;
      cfg.series.forEach((s) => {
        const raw = SD.n(r[s.key]) || 0, v = cfg.pct ? (raw / tot) * 100 : raw;
        const x0 = x(acc), w = x(acc + v) - x0;
        acc += v;
        if (w <= 0) return;
        const rect = svg.append('rect').attr('x', x0).attr('y', y).attr('width', w).attr('height', h)
          .style('fill', s.outline ? 'var(--color-panel)' : s.color).style('stroke', s.outline ? s.color : 'var(--color-panel)').attr('stroke-width', s.outline ? 1.5 : 1)
          .style('cursor', cfg.onPick ? 'pointer' : null)
          .on('pointermove', (ev) => tip.show(ev, [r.label, [s.color, `${s.label}: ${fmt(raw)}${cfg.pct ? ` (${d3.format('.0f')(v)}%)` : ''}`]]))
          .on('pointerleave', () => tip.hide())
          .on('click', () => { if (cfg.onPick) { tip.hide(); cfg.onPick(r, s); } });
        if (w > 26) svg.append('text').attr('class', 'sd-seg').attr('x', x0 + w / 2).attr('y', y + h / 2).attr('dy', '0.35em').attr('text-anchor', 'middle')
          .style('fill', s.outline ? 'var(--color-fg)' : '#fff').text(cfg.pct ? d3.format('.0f')(v) + '%' : fmt(raw)).style('pointer-events', 'none');
      });
      if (!cfg.pct) svg.append('text').attr('class', 'sd-val').attr('x', x(acc) + 6).attr('y', y + h / 2).attr('dy', '0.35em').text(fmt(acc));
    });
  };

  // Waterfall. cfg: {data:[{label,value}], total:'Total', color, totalColor, fmt, height}
  SD.waterfall = function (el, cfg) {
    const H = cfg.height || 240;
    const { svg, W } = svgFor(el, H, cfg.label);
    const fmt = cfg.fmt || SD.fmtK;
    let acc = 0;
    const steps = cfg.data.map((d) => { const s = { label: d.label, v: SD.n(d.value), y0: acc, y1: acc + SD.n(d.value) }; acc += SD.n(d.value); return s; });
    if (cfg.total !== false) steps.push({ label: cfg.total || 'Total', v: acc, y0: 0, y1: acc, total: true });
    const y = d3.scaleLinear().domain([0, d3.max(steps, (s) => Math.max(s.y0, s.y1)) * 1.12 || 1]).nice(4);
    const ml = measure(svg, y.ticks(4).map(fmt)) + 12;
    const m = { t: 10, r: 8, b: 30, l: ml };
    y.range([H - m.b, m.t]);
    const x = d3.scaleBand().domain(steps.map((s) => s.label)).range([m.l, W - m.r]).padding(0.25);
    svg.append('g').attr('class', 'sd-grid').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickSize(-(W - m.l - m.r)).tickFormat(''));
    svg.append('g').attr('class', 'sd-axis').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(fmt).tickSize(0).tickPadding(8)).call((g) => g.select('.domain').remove());
    const xa = svg.append('g').attr('class', 'sd-axis').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).tickSize(0).tickPadding(10)).call((g) => g.select('.domain').remove());
    xa.selectAll('text').each(function () { const t = d3.select(this); let s = t.text(); while (this.getComputedTextLength() > x.step() - 4 && s.length > 3) { s = s.slice(0, -2); t.text(s + '…'); } });
    const tip = SD.tip(el);
    steps.forEach((s, i) => {
      const top = y(Math.max(s.y0, s.y1)), bot = y(Math.min(s.y0, s.y1));
      svg.append('rect').attr('x', x(s.label)).attr('width', x.bandwidth()).attr('y', top).attr('height', Math.max(1, bot - top)).attr('rx', 2)
        .style('fill', s.total ? (cfg.totalColor || 'var(--color-fg)') : (s.v < 0 ? 'var(--color-bad)' : cfg.color || SD.col(0)))
        .on('pointermove', (ev) => tip.show(ev, [s.label, s.total ? `Total: ${fmt(s.v)}` : `${s.v >= 0 ? '+' : ''}${fmt(s.v)} (running ${fmt(s.y1)})`]))
        .on('pointerleave', () => tip.hide());
      svg.append('text').attr('class', 'sd-val').attr('x', x(s.label) + x.bandwidth() / 2).attr('y', top - 5).attr('text-anchor', 'middle').text(fmt(s.v));
      if (!s.total && i < steps.length - 1) {
        const nx = x(steps[i + 1].label);
        svg.append('line').attr('x1', x(s.label) + x.bandwidth()).attr('x2', nx).attr('y1', y(s.y1)).attr('y2', y(s.y1)).style('stroke', 'var(--cds-chart-axis)').attr('stroke-dasharray', '2 2');
      }
    });
  };

  window.SD = SD;
})();
