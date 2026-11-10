// Tabs, segmented control, sorting and search. Listens only; sets hidden/class/aria and asks drawings to rerun.
window.SDState = { oldestCls: 'Incidents', acctSort: { key: 'tickets_per_mrr_ratio', dir: -1 }, acctQuery: '' };

(function () {
  const tabs = Array.from(document.querySelectorAll('.sd-tab'));
  const pages = Array.from(document.querySelectorAll('[data-page]'));
  function open(id, link) {
    if (!pages.some((p) => p.id === id)) return;
    pages.forEach((p) => { p.hidden = p.id !== id; });
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (link) dash.setLink(id);
  }
  tabs.forEach((t) => t.addEventListener('click', () => open(t.dataset.tab, true)));
  const h = (location.hash || '').replace('#', '');
  if (h) open(h, false);

  document.querySelectorAll('#op-seg button').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('#op-seg button').forEach((x) => x.classList.toggle('is-on', x === b));
      SDState.oldestCls = b.dataset.cls;
      dash.draw('op-oldest');
    });
  });

  document.querySelectorAll('#ac-tbl th[data-sort]').forEach((th) => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const k = th.dataset.sort;
      const s = SDState.acctSort;
      if (s.key === k) s.dir = -s.dir; else { s.key = k; s.dir = k === 'account' || k === 'service_level' ? 1 : -1; }
      document.querySelectorAll('#ac-tbl th[data-sort]').forEach((x) => x.setAttribute('aria-sort', x === th ? (s.dir > 0 ? 'ascending' : 'descending') : 'none'));
      dash.draw('ac-table');
    });
  });
  document.querySelectorAll('#ac-search').forEach((inp) => {
    inp.addEventListener('input', () => { SDState.acctQuery = inp.value.trim().toLowerCase(); dash.draw('ac-table'); });
  });
})();
