// Dashboard framework: loads CSVs, builds header, tabs, slicers and pages from a config,
// and re-renders the open page whenever a slicer or a click-to-filter changes.
(function () {
  window.dash = { colors: ['#2f6fed', '#18a999', '#f2a541', '#8b5cf6', '#e5484d', '#64748b', '#0ea5e9', '#a3a948'] };
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; };
  const uniq = (rows, f) => Array.from(new Set(rows.map((r) => r[f]).filter((v) => v !== '' && v != null))).sort();

  window.App = function (cfg) {
    const F = { state: {} };
    (cfg.slicers || []).forEach((s) => { F.state[s.key] = s.default || ''; });
    // Row passes all active slicers. map = {slicerKey: 'rowField'}
    F.ok = (row, map) => Object.entries(map).every(([k, f]) => !F.state[k] || String(row[f]) === F.state[k]);
    F.toggle = (key, val) => { F.state[key] = F.state[key] === String(val) ? '' : String(val); sync(); render(); };
    F.set = (key, val) => { F.state[key] = String(val || ''); sync(); render(); };
    F.is = (key, val) => F.state[key] === String(val);
    F.go = (id) => { sync(); open(id, true); window.scrollTo(0, 0); };
    let D = null;
    let active = cfg.pages[0].id;
    const rendered = new Set();

    const root = document.getElementById('app');
    root.className = 'sd';
    // header
    const head = el('header', 'sd-head');
    const hl = el('div');
    hl.append(el('p', 'sd-eyebrow', cfg.eyebrow || 'Managed services'), el('h1', 'sd-title', cfg.title), el('p', 'sd-sub', cfg.sub || ''));
    const hr = el('div'); hr.style.display = 'flex'; hr.style.flexDirection = 'column'; hr.style.alignItems = 'flex-end'; hr.style.gap = '8px';
    const back = el('a', 'sd-portfolio-link', '← All dashboards'); back.href = '../';
    const badge = el('span', 'sd-badge'); badge.append(el('i'), document.createTextNode('Prototype · sample data'));
    hr.append(back, badge);
    head.append(hl, hr);
    // tabs
    const nav = el('nav', 'sd-tabs'); nav.setAttribute('role', 'tablist');
    const tabs = cfg.pages.map((p) => {
      const b = el('button', 'sd-tab' + (p.impact ? ' sd-tab-impact' : ''), p.impact ? '★ ' + p.label : p.label);
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => open(p.id, true));
      nav.append(b);
      return b;
    });
    // slicer bar
    const bar = el('div', 'sd-slicers');
    const selects = {};
    (cfg.slicers || []).forEach((s) => {
      if (s.seg) {
        const lab = el('div', 'sd-sl', s.label);
        const g = el('div', 'sd-seg'); g.setAttribute('role', 'group');
        s.options.forEach((o) => { const b = el('button', '', o.label); b.type = 'button'; b.dataset.v = o.value;
          b.addEventListener('click', () => { F.state[s.key] = o.value; sync(); render(); }); g.append(b); });
        lab.append(g); bar.append(lab); selects[s.key] = { sel: g, lab, s };
        return;
      }
      const lab = el('label', 'sd-sl', s.label);
      const sel = el('select'); sel.setAttribute('aria-label', s.label);
      sel.addEventListener('change', () => { F.state[s.key] = sel.value; render(); });
      lab.append(sel); bar.append(lab);
      selects[s.key] = { sel, lab, s };
    });
    const reset = el('button', 'sd-reset', 'Reset filters'); reset.type = 'button';
    reset.addEventListener('click', () => { (cfg.slicers || []).forEach((s) => { F.state[s.key] = s.default || ''; }); sync(); render(); });
    bar.append(reset, el('p', 'sd-hint', 'Tip: click any bar, slice or legend item to filter the page. Click it again to clear.'));
    const note = el('p', 'sd-slicer-note', 'The Impact page compares fixed before and after windows, so filters don\'t apply here.');
    const body = el('div');
    root.append(head, nav, bar, note, body);

    function sync() { Object.values(selects).forEach(({ sel, s }) => {
      if (s.seg) sel.querySelectorAll('button').forEach((b) => b.classList.toggle('is-on', b.dataset.v === F.state[s.key]));
      else sel.value = F.state[s.key] || ''; }); }
    function fillOptions() {
      Object.values(selects).forEach(({ sel, s }) => {
        if (s.seg) return;
        sel.replaceChildren(new Option(s.all || 'All', ''));
        const opts = typeof s.options === 'function' ? s.options(D) : s.options;
        opts.forEach((o) => { const v = typeof o === 'object' ? o.value : o; const t = typeof o === 'object' ? o.label : o; sel.append(new Option(t, v)); });
        if (s.default) sel.querySelector('option').textContent = s.all || 'All';
        sel.value = F.state[s.key] || '';
      });
    }
    function open(id, link) {
      if (!cfg.pages.some((p) => p.id === id)) return;
      active = id;
      cfg.pages.forEach((p, i) => { tabs[i].classList.toggle('is-on', p.id === id); tabs[i].setAttribute('aria-selected', p.id === id); });
      if (link) history.replaceState(null, '', '#' + id);
      render();
    }

    // ---- block renderers ----
    function kpis(b) {
      const g = el('div', 'sd-kpis');
      b.items.forEach((k) => {
        const c = el('div', 'sd-card sd-kpi');
        c.append(el('span', 'sd-kpi-l', typeof k.label === 'function' ? k.label(D, F) : k.label));
        const v = el('span', 'sd-kpi-v', k.value(D, F));
        const tone = k.tone ? k.tone(D, F) : null; if (tone) v.classList.add(tone);
        c.append(v);
        if (k.sub) { const s = el('span', 'sd-kpi-d'); s.textContent = k.sub(D, F); c.append(s); }
        if (k.pick) { c.classList.add('sd-pickable'); if (k.picked && k.picked(F)) c.classList.add('is-picked'); c.addEventListener('click', () => k.pick(F)); }
        g.append(c);
      });
      return g;
    }
    function card(b) {
      const c = el('div', 'sd-card sd-c' + (b.span || 12));
      if (b.title) c.append(el('h3', '', typeof b.title === 'function' ? b.title(D, F) : b.title));
      if (b.note) c.append(el('p', 'sd-note', typeof b.note === 'function' ? b.note(D, F) : b.note));
      const area = el('div', 'sd-chart'); area.style.minHeight = (b.h || 240) + 'px'; area.style.position = 'relative';
      c.append(area);
      requestAnimationFrame(() => { try { b.draw(area, D, F); } catch (e) { console.error(b.title, e); area.textContent = 'Failed to draw'; } });
      return c;
    }
    function table(b) {
      const c = el('div', 'sd-card sd-c' + (b.span || 12));
      if (b.title) c.append(el('h3', '', typeof b.title === 'function' ? b.title(D, F) : b.title));
      if (b.note) c.append(el('p', 'sd-note', typeof b.note === 'function' ? b.note(D, F) : b.note));
      const wrap = el('div', 'sd-tw' + (b.maxH ? ' sd-scroll' : ''));
      if (b.maxH) wrap.style.maxHeight = b.maxH + 'px';
      const t = el('table', 'sd-table');
      const thead = el('thead'); const tr = el('tr');
      b.cols.forEach((col) => tr.append(el('th', col.cls || '', col.label)));
      thead.append(tr); t.append(thead);
      if (b.cols.some((col) => col.label === undefined)) tr.remove();
      const tb = el('tbody');
      let rows = b.rows(D, F);
      if (b.limit) rows = rows.slice(0, b.limit);
      if (!rows.length) { const r = el('tr'); const td = el('td', '', 'No rows for this selection'); td.colSpan = b.cols.length; r.append(td); tb.append(r); }
      rows.forEach((r) => {
        const row = el('tr');
        if (b.onRow) { row.classList.add('sd-rowpick'); row.addEventListener('click', () => b.onRow(r, F)); }
        b.cols.forEach((col) => {
          const td = el('td', col.cls || '');
          if (col.render) col.render(td, r); else td.textContent = col.fmt ? col.fmt(r[col.key], r) : (r[col.key] ?? '');
          row.append(td);
        });
        tb.append(row);
      });
      if (b.total) {
        const tf = el('tr'); tf.style.fontWeight = '600';
        b.cols.forEach((col, i) => { const td = el('td', col.cls || ''); td.textContent = i === 0 ? 'Total' : (b.total[col.key] !== undefined ? b.total[col.key](rows) : ''); tf.append(td); });
        tb.append(tf);
      }
      t.append(tb); wrap.append(t); c.append(wrap);
      return c;
    }
    function text(b) { const p = el('p', 'sd-takeaway'); p.innerHTML = b.html(D, F); return p; }
    function row(b) { const g = el('div', 'sd-grid'); b.blocks.forEach((x) => g.append(block(x))); return g; }
    function heading(b) { return el('h2', 'sd-section-h', typeof b.text === 'function' ? b.text(D, F) : b.text); }
    function impact() {
      const I = D.impact; const by = (k) => I.filter((r) => r.kind === k);
      const frag = document.createDocumentFragment();
      const hero = by('hero')[0];
      const wrap = el('div', 'sd-hero');
      const main = el('div', 'sd-card sd-hero-main');
      main.append(el('span', 'sd-kpi-l', hero.label));
      const big = el('div', 'sd-hero-big', hero.value); big.append(el('small', '', hero.unit)); main.append(big);
      main.append(el('p', 'sd-hero-sub', hero.note));
      const side = el('div', 'sd-hero-side');
      by('stat').forEach((s) => { const c = el('div', 'sd-card sd-kpi sd-stat'); c.append(el('span', 'sd-kpi-l', s.label), el('span', 'sd-kpi-v', s.value), el('span', 'sd-kpi-d', s.unit)); side.append(c); });
      wrap.append(main, side); frag.append(wrap);
      frag.append(el('h2', 'sd-section-h', cfg.impactTitle || 'Productivity: before vs after go-live'));
      frag.append(el('p', 'sd-note', cfg.impactNote || 'Average of the 3 months before go-live vs the latest 3 months.'));
      const ba = el('div', 'sd-ba');
      by('ba').forEach((r) => {
        const b = +r.before, a = +r.after, higher = r.better === 'higher';
        const improved = higher ? a > b : a < b;
        const pct = b ? Math.abs((a - b) / b) * 100 : 0;
        const c = el('div', 'sd-card');
        c.append(el('div', 'sd-kpi-l', r.label));
        const rw = el('div', 'sd-ba-row');
        const f = (v) => (r.unit === '%' ? d3.format('.1f')(v) + '%' : r.unit === '$' ? SD.fmtUsd(v) : d3.format(',~g')(+d3.format('.1f')(v)) + (r.unit ? ' ' + r.unit : ''));
        rw.append(el('span', 'sd-ba-before', f(b)), el('span', 'sd-ba-arrow', '→'), el('span', 'sd-ba-after', f(a)));
        const track = el('div', 'sd-ba-track'); const fill = el('span');
        fill.style.width = (improved ? (higher ? 100 : (Math.min(a, b) / Math.max(a, b)) * 100) : 50) + '%';
        fill.style.background = improved ? 'var(--color-ok)' : 'var(--color-bad)'; track.append(fill);
        const foot = el('div', 'sd-kpi-d'); foot.style.marginTop = '8px';
        foot.append(el('span', 'sd-chip ' + (improved ? 'sd-up' : 'sd-down'), `${a > b ? '▲' : '▼'} ${d3.format('.0f')(pct)}% ${improved ? 'better' : 'worse'}`));
        c.append(rw, track, foot); ba.append(c);
      });
      frag.append(ba);
      const g = el('div', 'sd-grid');
      if (cfg.impactChart) g.append(card(Object.assign({ span: 7 }, cfg.impactChart)));
      const cl = el('div', 'sd-card sd-c' + (cfg.impactChart ? 5 : 12));
      cl.append(el('h3', '', cfg.impactClientsTitle || 'What it meant for clients and the business'));
      const ul = el('ul', 'sd-list');
      by('client').forEach((r) => {
        const li = el('li'); li.append(el('span', 'ico', r.unit || '✓'));
        const p = el('p'); const [pre, post] = r.label.split('{value}');
        p.append(document.createTextNode(pre || '')); p.append(el('b', '', r.value)); p.append(document.createTextNode(post || ''));
        li.append(p); ul.append(li);
      });
      cl.append(ul); g.append(cl); frag.append(g);
      const procRows = by('process');
      if (procRows.length) {
        const g2 = el('div', 'sd-grid');
        g2.append(table({ span: 12, title: 'How the work changed', note: 'Before vs after for each part of the process. These are effort estimates, not system data.',
          cols: [{ label: 'What', key: 'label' }, { label: 'Before', key: 'before', cls: 'r' }, { label: 'After', key: 'after', cls: 'r', render: (td, r) => td.append(el('b', '', r.after)) }, { label: 'Unit', key: 'unit' }, { label: 'Why', key: 'note', cls: 'sd-wrap' }],
          rows: () => procRows }));
        frag.append(g2);
      }
      const det = el('details'); det.append(el('summary', '', 'How these numbers are worked out'), el('p', '', cfg.impactMethod || 'Every figure on this page is sample data built for this prototype.'));
      frag.append(det);
      return frag;
    }
    function block(b) {
      if (b.when && !b.when(D, F)) return document.createComment('');
      if (b.type === 'kpis') return kpis(b);
      if (b.type === 'card') return card(b);
      if (b.type === 'table') return table(b);
      if (b.type === 'text') return text(b);
      if (b.type === 'row') return row(b);
      if (b.type === 'impact') return impact();
      if (b.type === 'heading') return heading(b);
      return el('div');
    }
    function render() {
      if (!D) return;
      const page = cfg.pages.find((p) => p.id === active);
      const keys = page.slicers || [];
      Object.values(selects).forEach(({ lab, s }) => { lab.hidden = !keys.includes(s.key); });
      bar.hidden = !keys.length; note.hidden = !page.impact;
      window.SD_NOANIM = rendered.has(active);
      const sec = el('section', 'sd-sec'); sec.id = page.id;
      page.blocks.forEach((b) => sec.append(block(b)));
      body.replaceChildren(sec);
      rendered.add(active);
    }
    let t;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { window.SD_NOANIM = true; render(); }, 200); });

    const files = cfg.files;
    Promise.all(Object.entries(files).map(([id, path]) => d3.csv(path + '?v=' + Date.now()).then((rows) => [id, rows])))
      .then((pairs) => {
        D = Object.fromEntries(pairs);
        if (cfg.prep) cfg.prep(D);
        fillOptions(); sync();
        const h = (location.hash || '').replace('#', '');
        open(cfg.pages.some((p) => p.id === h) ? h : active, false);
      })
      .catch((e) => { body.textContent = 'Failed to load data'; console.error(e); });
    return F;
  };
  window.SDu = { uniq };
})();
