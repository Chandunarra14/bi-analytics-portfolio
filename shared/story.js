// "Context" page: the problem, what was built, and what changed. Used by every dashboard.
// SDStory(el, story, impactRows, go)
//   story: { headline, sub, problem: [[title, text]], built: [[title, text]], who, pages: [[pageId, label, text]], results?: {hero, stats, ba} }
//   impactRows: rows of impact.csv (hero/stat/ba kinds) or null when story.results is given
//   go(pageId): open a page
(function () {
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const num = (v, unit) => {
    const x = +v; if (!isFinite(x)) return v;
    const dec = String(v).includes('.') ? String(v).split('.')[1].length : 0;
    if (unit === '$') return '$' + (x >= 10000 ? d3.format(',.0f')(x) : d3.format(',.0f')(x));
    const f = Math.abs(x) >= 1000 ? d3.format(',.0f')(x) : dec ? x.toFixed(Math.min(dec, 1)) : d3.format(',')(x);
    return unit === '%' ? f + '%' : unit === 'days' ? f + ' days' : unit === 'hrs' ? f + (x === 1 ? ' hr' : ' hrs') : f + (unit ? ' ' + unit : '');
  };
  window.SDStory = function (el, s, rows, go) {
    el.replaceChildren();
    const R = s.results || {
      hero: (rows || []).find((r) => r.kind === 'hero'),
      stats: (rows || []).filter((r) => r.kind === 'stat'),
      ba: (rows || []).filter((r) => r.kind === 'ba').slice(0, 4),
    };
    const wrap = h('div', 'st');
    // hero
    const hero = h('div', 'st-hero');
    hero.append(h('div', 'st-eyebrow', 'Why this dashboard exists'), h('h2', 'st-head', s.headline), h('p', 'st-sub', s.sub));
    if (s.who) hero.append(h('div', 'st-who', '<b>Built for</b> ' + s.who));
    wrap.append(hero);
    // problem vs built
    const two = h('div', 'st-two');
    const col = (cls, title, icon, items) => { const c = h('div', 'st-col ' + cls); c.append(h('h3', '', `<span class="st-ic">${icon}</span>${title}`));
      const ul = h('ul'); items.forEach(([t, x]) => ul.append(h('li', '', `<b>${t}</b><span>${x}</span>`))); c.append(ul); return c; };
    two.append(col('st-prob', 'The problem', '!', s.problem), col('st-built', 'What the dashboard does', '✓', s.built));
    wrap.append(two);
    // results
    const res = h('div', 'st-res');
    res.append(h('h3', 'st-h3', s.resultsTitle || 'What changed after go-live'));
    const strip = h('div', 'st-strip');
    if (R.hero) strip.append(h('div', 'st-big', `<div class="v">${R.hero.value}</div><div class="u">${R.hero.unit || ''}</div><div class="l">${R.hero.label}</div>`));
    R.stats.forEach((r) => strip.append(h('div', 'st-stat', `<div class="v">${r.value}</div><div class="l">${r.label}</div><div class="n">${r.unit || ''}</div>`)));
    res.append(strip);
    if (R.ba.length) {
      const g = h('div', 'st-ba');
      R.ba.forEach((r) => {
        const b = +r.before, a = +r.after; const good = r.better === 'higher' ? a > b : a < b;
        const ch = b ? Math.abs((a - b) / b) * 100 : 0;
        g.append(h('div', 'st-bac', `<div class="l">${r.label}</div><div class="row"><span class="b">${num(r.before, r.unit)}</span><span class="ar">→</span><span class="a ${good ? 'ok' : 'bad'}">${num(r.after, r.unit)}</span></div>` +
          `<div class="c ${good ? 'ok' : 'bad'}">${r.better === 'higher' ? '▲' : '▼'} ${d3.format('.0f')(ch)}% ${good ? 'better' : 'worse'}</div>`));
      });
      res.append(g);
    }
    res.append(h('p', 'st-foot', s.foot || 'Before = the months before the February 2026 go-live, after = the latest months. Full detail is on the ★ Impact page. All figures are sample data built for this prototype.'));
    wrap.append(res);
    // where to look
    if (s.pages && s.pages.length) {
      const nav = h('div', 'st-nav'); nav.append(h('h3', 'st-h3', 'Where to look'));
      const g = h('div', 'st-pages');
      s.pages.forEach(([id, label, text]) => { const b = h('button', 'st-page', `<b>${label} →</b><span>${text}</span>`); b.type = 'button'; b.onclick = () => go(id); g.append(b); });
      nav.append(g); wrap.append(nav);
    }
    el.append(wrap);
  };
  if (!document.getElementById('st-css')) {
    const st = document.createElement('style'); st.id = 'st-css';
    st.textContent = `
.st { display: flex; flex-direction: column; gap: 18px; }
.st-hero { background: linear-gradient(120deg, #0b3b63, #12507f 60%, #1a6aa3); color: #fff; border-radius: 14px; padding: 28px 30px; }
.st-eyebrow { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #9cc8ec; font-weight: 600; }
.st-head { font-size: 26px; line-height: 1.25; margin: 8px 0 8px; max-width: 900px; font-weight: 600; color: #fff; }
.st-sub { margin: 0; color: #d6e6f4; font-size: 15px; max-width: 880px; line-height: 1.55; }
.st-who { margin-top: 14px; font-size: 13px; color: #d6e6f4; } .st-who b { color: #fff; margin-right: 6px; }
.st-two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 900px) { .st-two { grid-template-columns: 1fr; } }
.st-col { background: var(--color-panel, #fff); border: 1px solid var(--color-border-line, #e3e7ec); border-radius: 12px; padding: 18px 20px; }
.st-col h3 { margin: 0 0 10px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.st-ic { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; }
.st-prob { border-top: 4px solid #e5484d; } .st-prob .st-ic { background: #e5484d; }
.st-built { border-top: 4px solid #22a06b; } .st-built .st-ic { background: #22a06b; }
.st-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.st-col li { display: flex; flex-direction: column; gap: 2px; font-size: 14px; line-height: 1.45; padding-left: 12px; border-left: 2px solid var(--color-border-line, #e3e7ec); }
.st-col li span { color: var(--color-fg-muted, #5b6573); }
.st-res, .st-nav { background: var(--color-panel, #fff); border: 1px solid var(--color-border-line, #e3e7ec); border-radius: 12px; padding: 18px 20px; }
.st-h3 { margin: 0 0 12px; font-size: 16px; }
.st-strip { display: grid; grid-template-columns: 1.3fr repeat(4, 1fr); gap: 12px; }
@media (max-width: 1000px) { .st-strip { grid-template-columns: 1fr 1fr; } }
.st-big { background: #0b3b63; color: #fff; border-radius: 10px; padding: 14px 16px; }
.st-big .v { font-size: 34px; font-weight: 700; line-height: 1; } .st-big .u { font-size: 13px; color: #9cc8ec; margin: 4px 0 6px; } .st-big .l { font-size: 13px; color: #d6e6f4; }
.st-stat { border: 1px solid var(--color-border-line, #e3e7ec); border-radius: 10px; padding: 14px 16px; }
.st-stat .v { font-size: 24px; font-weight: 700; color: #0b3b63; } .st-stat .l { font-size: 13px; font-weight: 600; margin-top: 4px; } .st-stat .n { font-size: 12px; color: var(--color-fg-muted, #5b6573); }
.st-ba { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; }
@media (max-width: 1000px) { .st-ba { grid-template-columns: 1fr 1fr; } }
.st-bac { background: var(--color-bg, #f4f6f9); border-radius: 10px; padding: 12px 14px; }
.st-bac .l { font-size: 12.5px; color: var(--color-fg-muted, #5b6573); min-height: 32px; }
.st-bac .row { display: flex; align-items: baseline; gap: 8px; margin: 4px 0; } .st-bac .b { color: var(--color-fg-muted, #5b6573); text-decoration: line-through; font-size: 14px; }
.st-bac .a { font-size: 20px; font-weight: 700; } .st-bac .ar { color: var(--color-fg-muted, #5b6573); }
.st-bac .ok { color: #138a5b; } .st-bac .bad { color: #d14343; } .st-bac .c { font-size: 12px; font-weight: 600; }
.st-foot { margin: 12px 0 0; font-size: 12px; color: var(--color-fg-muted, #5b6573); }
.st-pages { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.st-page { font: inherit; text-align: left; background: var(--color-bg, #f4f6f9); border: 1px solid transparent; border-radius: 10px; padding: 12px 14px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; color: inherit; }
.st-page:hover { border-color: #2f6fed; background: #eef4fe; } .st-page b { color: #0b3b63; font-size: 14px; } .st-page span { font-size: 13px; color: var(--color-fg-muted, #5b6573); line-height: 1.4; }
`;
    document.head.append(st);
  }
})();
