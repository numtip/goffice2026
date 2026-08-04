/**
 * Action Plan V2 — filter, search, result count, print expand details
 */

function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKC');
}

function initActionPlanV2(root) {
  if (!root || root.dataset.apInit === '1') return;
  root.dataset.apInit = '1';

  const searchInput = root.querySelector('#ap-search');
  const filterSelect = root.querySelector('#ap-category-filter');
  const countEl = root.querySelector('#ap-result-count');
  const emptyEl = root.querySelector('#ap-empty');
  const printBtn = root.querySelector('#ap-print');
  const countTemplate = countEl?.dataset.template ?? '';

  const activities = () => Array.from(root.querySelectorAll('[data-ap-activity]'));
  const sections = () => Array.from(root.querySelectorAll('[data-ap-category-section]'));

  function applyFilters() {
    const cat = filterSelect?.value ?? 'all';
    const q = normalize(searchInput?.value.trim());
    let visible = 0;

    for (const el of activities()) {
      const matchCat = cat === 'all' || el.dataset.apCategory === cat;
      const matchSearch = !q || normalize(el.dataset.apSearch).includes(q);
      const show = matchCat && matchSearch;
      el.hidden = !show;
      if (show) visible += 1;
    }

    for (const section of sections()) {
      const sectionCat = section.dataset.apCategorySection;
      const matchFilter = cat === 'all' || sectionCat === cat;
      const anyVisible = activities().some(
        (a) => a.closest('[data-ap-category-section]') === section && !a.hidden,
      );
      section.hidden = !matchFilter || !anyVisible;
    }

    if (countEl) {
      countEl.textContent = countTemplate.replace('{n}', String(visible));
    }
    if (emptyEl) {
      emptyEl.hidden = visible > 0;
    }
  }

  searchInput?.addEventListener('input', applyFilters);
  filterSelect?.addEventListener('change', applyFilters);
  printBtn?.addEventListener('click', () => window.print());

  window.addEventListener('beforeprint', () => {
    for (const d of sections()) {
      if (d instanceof HTMLDetailsElement) {
        d.dataset.apWasOpen = d.open ? '1' : '0';
        d.open = true;
      }
    }
  });
  window.addEventListener('afterprint', () => {
    for (const d of sections()) {
      if (d instanceof HTMLDetailsElement) {
        d.open = d.dataset.apWasOpen === '1';
      }
    }
  });

  applyFilters();
}

document.querySelectorAll('[data-action-plan-root]').forEach((root) => initActionPlanV2(root));
