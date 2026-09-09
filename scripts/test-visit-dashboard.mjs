/**
 * test-visit-dashboard.mjs — Executive Visit Dashboard contracts.
 *
 * - VM reconciles KPI/progress to canonical generated data
 * - Month coverage derived per resource (never hardcoded)
 * - Presentation mode parsed client-side from ?present=1
 * - TH/EN route source parity
 * - No visit-specific JSON datasets
 * - Semantic separation markers in shell
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  isPresentationMode,
  syncPresentationToolbar,
  setPresentationMode,
  VISIT_PRESENT_CLASS,
  VISIT_PRESENT_PARAM,
  VISIT_PRESENT_VALUE,
} from '../src/scripts/visit-presentation.ts';
import { generatedMetricMap } from '../src/utils/dashboard-generated-metrics.ts';
import { dashboards } from '../src/data/dashboard-config.ts';
import { buildProgressOverview } from '../src/utils/category-progress-vm.ts';
import { getEvidenceForDashboard, getIndicatorCodesForDashboard } from '../src/utils/evidence-traceability.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const categoryProgress = JSON.parse(read('src/data/generated/category-progress-2569.json'));

const thPage = read('src/pages/dashboard/visit/index.astro');
const enPage = read('src/pages/en/dashboard/visit/index.astro');
const shell = read('src/components/dashboard/visit/VisitDashboardShell.astro');
const traceability = read('src/components/dashboard/visit/VisitTraceabilityStrip.astro');

describe('Visit dashboard VM — canonical reconciliation', () => {
  it('progress overall.ready matches category-progress-2569.json', () => {
    const progress = buildProgressOverview('th');
    assert.equal(progress.overall.ready, categoryProgress.overall.ready);
    assert.equal(progress.overall.total, categoryProgress.overall.total);
    assert.equal(progress.overall.total, 65);
  });

  it('resource monthsCount derived from generated JSON per dashboard', () => {
    const vmSource = read('src/utils/visit-dashboard-vm.ts');
    assert.doesNotMatch(vmSource, /monthsCount\s*=\s*\d+/);
    for (const d of dashboards) {
      const metric = generatedMetricMap[d.id];
      const expected = metric.years[metric.currentYear.toString()]?.months.length ?? 0;
      assert.ok(expected >= 0 && expected <= 12, `${d.id} months in range`);
      const monthMap = new Map(
        (metric.years[metric.currentYear.toString()]?.months ?? []).map((mo) => [mo.month, mo.value]),
      );
      const months = Array.from({ length: 12 }, (_, i) =>
        monthMap.has(i + 1) ? (monthMap.get(i + 1) ?? null) : null,
      );
      const filled = months.filter((v) => v != null).length;
      assert.equal(filled, expected, `${d.id} explorer month slots`);
    }
  });

  it('traceability covers six resources with indicator codes and evidence', () => {
    assert.equal(dashboards.length, 6);
    for (const d of dashboards) {
      const codes = getIndicatorCodesForDashboard(d.id);
      assert.ok(codes.length >= 1, `${d.id} indicator codes`);
      getEvidenceForDashboard(d.id);
    }
  });

  it('visit VM selects published activities only (source contract)', () => {
    const activities = JSON.parse(read('src/data/content/activities.json'));
    const vmSource = read('src/utils/visit-dashboard-vm.ts');
    assert.match(vmSource, /getPublishedItems/);
    assert.match(vmSource, /status === 'published'|getPublishedItems/);
    const published = activities.items.filter((i) => i.status === 'published');
    assert.ok(published.length > 0);
  });
});

describe('Visit dashboard — no duplicate datasets or score fields', () => {
  it('has no visit*.json under src/data', () => {
    const hits = [];
    function walk(dir) {
      for (const name of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, name.name);
        if (name.isDirectory()) walk(p);
        else if (/visit.*\.json$/i.test(name.name)) hits.push(p);
      }
    }
    walk(join(ROOT, 'src/data'));
    assert.deepEqual(hits, []);
  });

  it('shell does not import kpi-summary yoyChange', () => {
    assert.doesNotMatch(shell, /kpi-summary/);
    assert.doesNotMatch(read('src/utils/visit-dashboard-vm.ts'), /kpi-summary/);
  });
});

describe('Visit dashboard — presentation mode (client URL)', () => {
  it('isPresentationMode reads ?present=1 from search string', () => {
    assert.equal(isPresentationMode('?present=1'), true);
    assert.equal(isPresentationMode('?present=1&foo=bar'), true);
    assert.equal(isPresentationMode(''), false);
    assert.equal(isPresentationMode('?present=0'), false);
    assert.equal(isPresentationMode(new URLSearchParams(`${VISIT_PRESENT_PARAM}=${VISIT_PRESENT_VALUE}`)), true);
  });

  it('visit-presentation exports stable class and param names', () => {
    assert.equal(VISIT_PRESENT_CLASS, 'visit-present');
    assert.equal(VISIT_PRESENT_PARAM, 'present');
    assert.equal(VISIT_PRESENT_VALUE, '1');
  });

  it('presentation script reads window location (not static HTML)', () => {
    const src = read('src/scripts/visit-presentation.ts');
    assert.match(src, /window\.location\.search|URLSearchParams/);
    assert.doesNotMatch(src, /present=1.*built|dist/);
  });

  it('CSS hides site chrome only — not global header/footer selectors', () => {
    const css = read('src/styles/global.css');
    assert.match(css, /\.site-chrome-header/);
    assert.match(css, /\.site-chrome-footer/);
    assert.doesNotMatch(css, /html\.visit-present\s+header,/);
    assert.doesNotMatch(css, /html\.visit-present\s+footer,/);
    assert.match(css, /\.visit-page-header/);
    assert.match(css, /\.visit-presentation-toolbar/);
  });

  it('toolbar keeps exit controls and is not hidden in presentation mode', () => {
    assert.match(shell, /visit-presentation-toolbar/);
    assert.match(shell, /visit-presentation-enter/);
    assert.match(shell, /visit-presentation-exit/);
    assert.match(shell, /visit-fullscreen-exit/);
    assert.doesNotMatch(shell, /visit-hide-in-present/);
    assert.doesNotMatch(read('src/styles/global.css'), /\.visit-presentation-toolbar[\s\S]*display:\s*none/);
  });

  it('syncPresentationToolbar exposes enter/exit controls by state', () => {
    const nodes = {
      'visit-presentation-toolbar': { setAttribute() {} },
      'visit-presentation-enter': { hidden: false },
      'visit-presentation-exit': { hidden: true },
      'visit-fullscreen-enter': { hidden: false },
      'visit-fullscreen-exit': { hidden: true },
    };
    const root = {
      getElementById(id) {
        return nodes[id] ?? null;
      },
    };
    syncPresentationToolbar(true, false, root);
    assert.equal(nodes['visit-presentation-enter'].hidden, true);
    assert.equal(nodes['visit-presentation-exit'].hidden, false);
    syncPresentationToolbar(false, true, root);
    assert.equal(nodes['visit-fullscreen-enter'].hidden, true);
    assert.equal(nodes['visit-fullscreen-exit'].hidden, false);
  });

  it('setPresentationMode is exported for exit/toggle flows', () => {
    assert.equal(typeof setPresentationMode, 'function');
    const src = read('src/scripts/visit-presentation.ts');
    assert.match(src, /visit-presentation-exit/);
    assert.match(src, /searchParams\.delete\(VISIT_PRESENT_PARAM\)/);
  });
});

describe('Visit dashboard — traceability evidence drill-down', () => {
  it('evidence hub href scopes by primary indicator code', () => {
    const traceSrc = read('src/utils/evidence-traceability.ts');
    assert.match(traceSrc, /getEvidenceHubHrefForIndicator/);
    assert.match(traceSrc, /\?indicator=\$\{encodeURIComponent\(indicatorCode\)\}/);
    const vmSource = read('src/utils/visit-dashboard-vm.ts');
    assert.match(vmSource, /getEvidenceHubHrefForIndicator/);
  });

  it('traceability strip links evidence count to scoped href', () => {
    assert.match(traceability, /row\.evidenceHref/);
    assert.match(traceability, /evidenceFilterIndicator/);
    assert.doesNotMatch(traceability, /href=\{links\.evidence\}.*รายการ/s);
  });

  it('scoped href count unchanged — still uses getEvidenceForDashboard length', () => {
    const vmSource = read('src/utils/visit-dashboard-vm.ts');
    assert.match(vmSource, /evidenceCount: evidence\.length/);
    for (const d of dashboards) {
      const codes = getIndicatorCodesForDashboard(d.id);
      const items = getEvidenceForDashboard(d.id);
      assert.ok(codes.length >= 1, `${d.id} mapped indicators`);
      assert.ok(items.length >= 0);
    }
  });
});

describe('Visit dashboard — TH/EN routes and semantic separation', () => {
  it('TH and EN pages delegate to shared shell + VM', () => {
    for (const page of [thPage, enPage]) {
      assert.match(page, /VisitDashboardShell/);
      assert.match(page, /buildVisitDashboardVM/);
    }
  });

  const shellMarkers = [
    'PerformanceExplorer',
    'CategoryProgressOverview',
    'VisitTraceabilityStrip',
    'data-semantic-track="performance"',
    'data-semantic-track="progress"',
    'data-semantic-track="evidence"',
    'visit-presentation',
  ];

  for (const marker of shellMarkers) {
    it(`visit components include ${marker}`, () => {
      const haystack =
        marker.includes('evidence') ? `${shell}\n${traceability}` : shell;
      assert.match(haystack, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    });
  }

  it('shell includes official-score disclaimer (TH and EN)', () => {
    assert.match(shell, /Not an official assessment score/);
    assert.match(shell, /ไม่ใช่คะแนนประเมินอย่างเป็นทางการ/);
  });

  it('shell uses PerformanceExplorer only — not PartialYoy or Normalized inline', () => {
    assert.match(shell, /PerformanceExplorer/);
    assert.doesNotMatch(shell, /PartialYoyExplorer/);
    assert.doesNotMatch(shell, /NormalizedTrendChart/);
    assert.match(shell, /fullDashboard|full executive dashboard|แดชบอร์ดภาพรวมเต็มรูปแบบ/);
  });

  it('locale JSON defines visitDashboard for TH and EN', () => {
    const th = JSON.parse(read('src/data/locales/th.json'));
    const en = JSON.parse(read('src/data/locales/en.json'));
    assert.ok(th.visitDashboard?.title);
    assert.ok(en.visitDashboard?.title);
    assert.match(th.visitDashboard.subtitle, /ไม่ใช่คะแนนประเมิน/);
    assert.match(en.visitDashboard.subtitle, /not an official assessment score/i);
  });
});

describe('Visit dashboard — built routes (when dist exists)', () => {
  it('dist contains TH and EN visit index HTML after build', () => {
    const thDist = join(ROOT, 'dist/dashboard/visit/index.html');
    const enDist = join(ROOT, 'dist/en/dashboard/visit/index.html');
    if (!existsSync(thDist)) {
      console.warn('skip: run npm run build for dist route checks');
      return;
    }
    assert.ok(existsSync(thDist), 'TH visit route');
    assert.ok(existsSync(enDist), 'EN visit route');
    const thHtml = readFileSync(thDist, 'utf8');
    assert.match(thHtml, /visit-dashboard|Visit Dashboard|แดชบอร์ดการเยี่ยมชม/i);
    assert.doesNotMatch(thHtml, /class="visit-present"/);
  });
});
