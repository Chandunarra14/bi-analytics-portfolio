// Renders a dashboard user guide from window.GUIDE: sidebar of chapters, one chapter at a time, prev/next.
(function () {
  const G = window.GUIDE;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  document.title = G.title + ' · User guide';

  const chapters = G.chapters.slice();
  if (G.glossary) chapters.push({ group: 'Glossary', id: 'glossary', title: 'Glossary', lede: 'Words used on the dashboard, in plain terms.',
    blocks: [{ t: 'table', head: ['Term', 'What it means'], rows: G.glossary }] });

  const top = h('header', 'g-top', `<b>${G.title} · User guide</b><span>${G.tagline || ''}</span><a href="./">← Back to the dashboard</a>`);
  const wrap = h('div', 'g-wrap');
  const nav = h('nav', 'g-nav'); const main = h('main');
  wrap.append(nav, main);
  document.body.append(top, wrap);

  let grp = null;
  const links = {};
  const cnt = {}; chapters.forEach((c) => { cnt[c.group] = (cnt[c.group] || 0) + 1; });
  chapters.forEach((c) => {
    const head = c.id === 'glossary' ? 'Reference' : cnt[c.group] > 1 ? c.group : 'Pages';
    if (head !== grp) { grp = head; nav.append(h('h4', '', grp)); }
    const a = h('a', '', c.nav || c.title); a.href = '#' + c.id; links[c.id] = a; nav.append(a);
  });

  const legend = (items) => { const d = h('div', 'g-legend'); (items || []).forEach(([l, c, o]) => d.append(h('span', '', `<i class="${o ? 'o' : ''}" style="background:${c}"></i>${l}`))); return d; };
  const bar = (parts) => { const total = parts.reduce((a, p) => a + p.v, 0); const d = h('div', 'g-bar');
    parts.forEach((p) => { const s = h('span', p.out ? 'out' : '', p.label); s.style.width = (p.v / total) * 100 + '%'; s.style.background = p.color; d.append(s); }); return d; };
  const rows = (pairs) => { const dl = h('dl', 'g-rows'); pairs.filter(([, v]) => v).forEach(([k, v]) => { dl.append(h('dt', '', k)); dl.append(h('dd', k === 'Example' ? 'ex' : '', v)); }); return dl; };
  const table = (b) => { const t = h('table', 'g-t'); if (b.head) t.append(h('thead', '', '<tr>' + b.head.map((x) => `<th>${x}</th>`).join('') + '</tr>'));
    const tb = h('tbody'); b.rows.forEach((r) => tb.append(h('tr', '', r.map((x) => `<td>${x}</td>`).join('')))); t.append(tb); return t; };

  function block(b) {
    if (b.t === 'quick') { const g = h('div', 'g-grid3'); b.items.forEach((it, i) => g.append(h('div', 'g-box', `<div class="g-num">${i + 1}</div><h3>${it.h}</h3><p>${it.p}</p>`))); return g; }
    if (b.t === 'grid2') { const g = h('div', 'g-grid2'); b.boxes.forEach((x) => g.append(block(Object.assign({ t: 'box' }, x)))); return g; }
    if (b.t === 'box' || b.t === 'table') {
      const d = h('div', 'g-box ' + (b.accent || ''));
      if (b.eyebrow) d.append(h('p', 'g-eyebrow', b.eyebrow));
      if (b.big) d.append(h('h2', '', b.big));
      if (b.h) d.append(h('h3', '', b.h));
      if (b.html) d.append(h('div', '', b.html));
      if (b.bar) d.append(bar(b.bar));
      if (b.t === 'table') d.append(table(b));
      if (b.note) d.append(h('p', 'g-small', b.note));
      if (b.callout) d.append(h('div', 'g-callout', b.callout));
      return d;
    }
    if (b.t === 'kpi') {
      const d = h('div', 'g-box g-kpi');
      d.append(h('div', 'g-mock', `<div class="l">${b.label}</div><div class="v ${b.tone || ''}">${b.value}</div><div class="s">${b.sub || ''}</div><div class="g-samp">Sample card</div>`));
      const r = h('div'); r.append(h('h3', '', b.name || (b.label.charAt(0).toUpperCase() + b.label.slice(1))));
      if (b.what) r.append(h('p', '', b.what));
      r.append(rows([['How', b.how], ['Colors', b.colors], ['Click', b.click], ['Example', b.ex]]));
      d.append(r); return d;
    }
    if (b.t === 'visual') {
      const d = h('div', 'g-box g-visual');
      d.append(h('h3', '', b.name + (b.kind ? `<span class="g-tag">${b.kind}</span>` : '')));
      if (b.sub) d.append(h('p', 'g-sub', b.sub));
      if (b.legend) d.append(legend(b.legend));
      if (b.bar) d.append(bar(b.bar));
      d.append(rows([['What it shows', b.what], ['How to read it', b.read], ['Look out for', b.watch], ['How it is calculated', b.how], ['Click', b.click], ['Example', b.ex]]));
      return d;
    }
    if (b.t === 'h') return h('h2', '', b.text);
    return h('div', '', b.html || '');
  }

  function show(id) {
    const i = Math.max(0, chapters.findIndex((c) => c.id === id)); const c = chapters[i];
    main.replaceChildren();
    if (c.group) main.append(h('p', 'g-chapter-tag', c.group));
    main.append(h('h1', '', c.title));
    if (c.lede) main.append(h('p', 'g-lede', c.lede));
    c.blocks.forEach((b) => main.append(block(b)));
    const pg = h('div', 'g-pager');
    const prev = h('button', '', '← ' + (chapters[i - 1] || {}).title); prev.hidden = i === 0; prev.onclick = () => { location.hash = chapters[i - 1].id; };
    const next = h('button', '', (chapters[i + 1] || {}).title + ' →'); next.hidden = i === chapters.length - 1; next.onclick = () => { location.hash = chapters[i + 1].id; };
    pg.append(prev, next); main.append(pg);
    Object.values(links).forEach((a) => a.classList.remove('on')); links[c.id].classList.add('on');
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1) || chapters[0].id);
})();
