/**
 * test-fy2569-truthfulness.mjs
 * ============================
 * FY2569-primary presentation + evidence truthfulness regression suite.
 *
 * Covers (TH + EN + built HTML):
 *   1. FY2569 status panel appears BEFORE the FY2568 baseline on all 65 pages.
 *   2. FY2568 baseline is COLLAPSED (closed <details>) and can never appear as
 *      a current-year result.
 *   3. Unavailable current data has no fake zero/result.
 *   4. Current metric values reconcile to the audited FY2569 source
 *      (sourceSha256, sheet, extraction date, coverage, verification state).
 *   5. Waste dashboard unit/value is kg mass; recycling rate is distinct.
 *   6. No false "ready"/official-score language.
 *
 * Built-HTML checks run only when dist/ exists (run `npm run build` first).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fy2569StatusView, findFy2569Progress } from '../src/utils/fy2569-status-vm.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const INDICATORS_JSON = join(ROOT, 'src/data/criteria/indicators.json');
const PROGRESS_JSON = join(ROOT, 'src/data/progress/indicator-progress-2569.json');
const TRACE_COMPONENT = join(ROOT, 'src/components/indicators/IndicatorTraceabilityExperience.astro');
const PANEL_COMPONENT = join(ROOT, 'src/components/indicators/Fy2569StatusPanel.astro');
const BASELINE_COMPONENT = join(ROOT, 'src/components/indicators/Fy2568BaselineSection.astro');
const LINKED_EVIDENCE = join(ROOT, 'src/components/indicators/IndicatorLinkedEvidence.astro');
const GENERATED_DIR = join(ROOT, 'src/data/generated');

const indicators = JSON.parse(readFileSync(INDICATORS_JSON, 'utf8')).indicators;
const progress = JSON.parse(readFileSync(PROGRESS_JSON, 'utf8'));

function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

function indicatorCodeList() {
  return indicators.map((i) => i.code);
}

// ── Registry completeness ────────────────────────────────────────────────────

describe('FY2569 progress registry covers all 65 indicators (TH+EN source of truth)', () => {
  it('has exactly 65 unique indicators', () => {
    const codes = indicatorCodeList();
    assert.equal(codes.length, 65);
    assert.equal(new Set(codes).size, 65);
  });

  it('registry has one item per canonical indicator code', () => {
    const registered = new Set(progress.items.map((i) => i.indicator));
    for (const code of indicatorCodeList()) {
      assert.ok(registered.has(code), `missing progress registry entry for ${code}`);
    }
    assert.equal(progress.items.length, 65);
  });
});

// ── Status view model truthfulness ───────────────────────────────────────────

describe('FY2569 status view model (TH + EN)', () => {
  it('unavailable ⇒ "ข้อมูลปี 2569 ยังไม่พร้อม" with no fake result', () => {
    const th = fy2569StatusView('4.1.1', 'th');
    const en = fy2569StatusView('4.1.1', 'en');
    assert.equal(th.kind, 'unavailable');
    assert.equal(th.badge, 'ข้อมูลปี 2569 ยังไม่พร้อม');
    assert.equal(en.badge, 'FY2569 data not yet available');
    assert.doesNotMatch(th.headline, /0|คะแนน|สำเร็จ|ผ่าน/);
    assert.doesNotMatch(en.headline, /\b0\b|score|passed|achieved/i);
  });

  it('Cat4–7 lead with FY2569 unavailable (every indicator)', () => {
    for (const code of ['4.1.1', '4.1.2', '4.1.3', '4.2.1', '4.2.2',
      '5.1.1', '5.2.1', '5.4.4', '6.1.1', '6.2.3', '7.1', '7.2']) {
      const v = fy2569StatusView(code, 'th');
      assert.equal(v.kind, 'unavailable', `${code} must be unavailable in FY2569`);
    }
  });

  it('partial (in_progress) ⇒ exact status without an annual-completion claim', () => {
    const v = fy2569StatusView('3.1.1', 'th');
    assert.equal(v.kind, 'partial');
    assert.equal(v.progressStatus, 'in_progress');
    assert.equal(v.evidenceStatus, 'available_unverified');
    // Explicit negation of annual completion must be present; no positive
    // completion claim may appear.
    assert.match(v.headline, /ไม่ใช่ผลสำเร็จประจำปี/);
    assert.doesNotMatch(v.headline, /บรรลุผลสำเร็จประจำปี|ครบถ้วนตามข้อกำหนดแล้ว/);
    const en = fy2569StatusView('3.1.1', 'en');
    assert.match(en.headline, /not an annual completion/i);
    assert.doesNotMatch(en.headline, /completed the (scope|criterion)|achieved the (scope|criterion)/i);
  });

  it('ready + available_unverified ⇒ "พร้อมตรวจสอบ" (never bare Ready/Verified)', () => {
    const v = fy2569StatusView('1.1.1', 'th');
    assert.equal(v.kind, 'ready_unverified');
    assert.equal(v.badge, 'พร้อมตรวจสอบ');
    assert.doesNotMatch(v.badge, /^พร้อม$/);
    assert.doesNotMatch(v.badge, /ตรวจสอบแล้ว/);
    const en = fy2569StatusView('1.1.1', 'en');
    assert.equal(en.badge, 'Ready for review');
  });

  it('owner-approved Cat2 indicators (2.1.1, 2.1.2, 2.2.1) render "พร้อม · ตรวจสอบแล้ว"', () => {
    for (const code of ['2.1.1', '2.1.2', '2.2.1']) {
      const v = fy2569StatusView(code, 'th');
      assert.equal(v.kind, 'ready_verified', `${code} should be ready_verified (owner-approved)`);
      assert.equal(v.badge, 'พร้อม · ตรวจสอบแล้ว', `${code} TH badge`);
      const en = fy2569StatusView(code, 'en');
      assert.equal(en.badge, 'Ready · Verified', `${code} EN badge`);
      assert.ok(v.owner, `${code} has owner`);
    }
  });

  it('only the four ready+verified indicators (1.6.1 was demoted; remaining: 2.1.1, 2.1.2, 2.2.1) may carry "ตรวจสอบแล้ว"', () => {
    // Owner decision 2026-08-31: 1.1.4 → in_progress/partial, 1.6.1 → unavailable.
    // Only Cat2 owner-approved indicators remain ready_verified.
    const verifiedCodes = ['2.1.1', '2.1.2', '2.2.1'];
    for (const code of verifiedCodes) {
      const v = fy2569StatusView(code, 'th');
      assert.equal(v.kind, 'ready_verified', `${code} should be ready_verified`);
    }
    // 1.1.4 is now partial, NOT verified
    const i114 = fy2569StatusView('1.1.4', 'th');
    assert.equal(i114.kind, 'partial', '1.1.4 must be partial (not verified)');
    // 1.6.1 is now unavailable
    const i161 = fy2569StatusView('1.6.1', 'th');
    assert.equal(i161.kind, 'unavailable', '1.6.1 must be unavailable');
    const anyOther = indicatorCodeList()
      .filter((c) => !verifiedCodes.includes(c))
      .map((c) => fy2569StatusView(c, 'th'))
      .filter((v) => v.kind === 'ready_verified');
    assert.deepEqual(anyOther, [], 'no other indicator may claim verified');
  });

  it('all other Cat2 indicators remain FY2569 unavailable (2.2.2 / 2.2.3 / 2.2.4)', () => {
    for (const code of ['2.2.2', '2.2.3', '2.2.4']) {
      const v = fy2569StatusView(code, 'th');
      assert.equal(v.kind, 'unavailable', `${code} must stay unavailable`);
      assert.equal(v.badge, 'ข้อมูลปี 2569 ยังไม่พร้อม', `${code} TH unavailable badge`);
      const en = fy2569StatusView(code, 'en');
      assert.equal(en.badge, 'FY2569 data not yet available', `${code} EN unavailable badge`);
    }
  });

  it('no official-score language in any panel headline/badge', () => {
    for (const locale of ['th', 'en']) {
      for (const code of indicatorCodeList()) {
        const v = fy2569StatusView(code, locale);
        assert.doesNotMatch(v.headline, /คะแนน|score/i);
        assert.doesNotMatch(v.badge, /คะแนน|score/i);
      }
    }
  });

  it('Cat7 quarantine is preserved — no quarantined source promoted as FY2569', () => {
    for (const code of ['7.1', '7.2']) {
      const item = findFy2569Progress(code);
      assert.equal(item.progressStatus, 'unavailable');
      assert.equal(item.evidenceStatus, 'unavailable');
    }
  });
});

// ── Component structure (TH+EN pages share the same experience component) ────

describe('Indicator page composition (source level)', () => {
  it('traceability experience renders FY2569 panel after Requirement and before baseline', () => {
    const src = readFileSync(TRACE_COMPONENT, 'utf8');
    const panelIdx = src.indexOf('<Fy2569StatusPanel');
    const baselineIdx = src.indexOf('<Fy2568BaselineSection');
    assert.ok(panelIdx !== -1, 'FY2569 panel must be rendered');
    assert.ok(baselineIdx !== -1, 'FY2568 baseline section must be rendered');
    assert.ok(panelIdx < baselineIdx, 'FY2569 panel must appear before FY2568 baseline in the page flow');
  });

  it('exactly one closed FY2568 baseline section holds ALL FY2568 content', () => {
    const src = readFileSync(TRACE_COMPONENT, 'utf8');
    // The shared template renders exactly ONE Fy2568BaselineSection (which
    // wraps every category branch); each built page therefore has one section.
    const openDetails = (src.match(/<Fy2568BaselineSection/g) || []).length;
    const closeDetails = (src.match(/<\/Fy2568BaselineSection>/g) || []).length;
    assert.equal(openDetails, 1, 'exactly one baseline section in the shared template');
    assert.equal(closeDetails, 1, 'the baseline section is closed');
    // All FY2568 content renders inside that single section: contract
    // contexts, source documents, and FY2568-centric Cat1 journeys.
    const inside = src.slice(src.indexOf('<Fy2568BaselineSection'), src.lastIndexOf('</Fy2568BaselineSection>'));
    for (const cat of ['Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5', 'Cat6', 'Cat7']) {
      assert.match(inside, new RegExp(`<${cat}ContractContext`));
      assert.match(inside, new RegExp(`<${cat}SourceDocuments`));
    }
    // FY2568-centric Cat1 journeys render inside the baseline section.
    for (const comp of [
      'Cat1EnvironmentalAssessment', 'Cat1LegalPresentation', 'Cat1GhgPresentation',
      'Cat1ProjectsPresentation', 'Cat1ManagementReviewPresentation',
    ]) {
      assert.match(inside, new RegExp(`<${comp}`));
    }
    // FY2569-primary Cat1 journeys render OUTSIDE/above the baseline section.
    const before = src.slice(0, src.indexOf('<Fy2568BaselineSection'));
    assert.match(before, /<Cat1FoundationPresentation/);
    assert.doesNotMatch(before, /<Cat1LegalPresentation/);
    assert.doesNotMatch(before, /<Cat1GhgPresentation/);
  });

  it('FY2568 baseline details are collapsed (no `open` attribute)', () => {
    const src = readFileSync(BASELINE_COMPONENT, 'utf8');
    assert.match(src, /<details/);
    assert.doesNotMatch(src, /<details[^>]*\sopen[\s>]/);
    assert.match(src, /ฐานเปรียบเทียบปี 2568/);
    assert.match(src, /FY2568 Baseline/);
    assert.match(src, /data-fy2568-baseline/);
  });

  it('linked evidence splits FY2569 first and FY2568 baseline collapsed', () => {
    const src = readFileSync(LINKED_EVIDENCE, 'utf8');
    assert.match(src, /หลักฐานปี 2569/);
    assert.match(src, /FY2569 Evidence/);
    assert.match(src, /เอกสารอ้างอิงปีฐาน 2568/);
    assert.match(src, /FY2568 Baseline Reference/);
    assert.match(src, /data-linked-evidence-fy2569/);
    assert.match(src, /data-linked-evidence-fy2568/);
    assert.match(src, /item\.year === 2569/);
  });

  it('status panel renders VM copy and never hardcodes Ready/Verified/score language', () => {
    const src = readFileSync(PANEL_COMPONENT, 'utf8');
    assert.match(src, /data-fy2569-status-panel/);
    assert.match(src, /view\.badge/);
    assert.match(src, /view\.headline/);
    assert.match(src, /ไม่ใช่คะแนนการประเมิน/);
    assert.doesNotMatch(src, /ตรวจสอบแล้ว/);
    assert.doesNotMatch(src, /ข้อมูลยืนยันแล้ว/);
    // The localized labels live in the view-model (single source of truth).
    const vm = readFileSync(join(ROOT, 'src/utils/fy2569-status-vm.ts'), 'utf8');
    assert.match(vm, /พร้อมตรวจสอบ/);
    assert.match(vm, /ข้อมูลปี 2569 ยังไม่พร้อม/);
    assert.match(vm, /badge: th \? 'พร้อมตรวจสอบ' : 'Ready for review'/);
  });
});

// ── Dashboard: waste mass in kg, recycling rate distinct ─────────────────────

describe('Waste dashboard unit/value is kg mass; recycling rate distinct', () => {
  it('generatedMetricMap.waste resolves to generated/waste.json (kg mass)', () => {
    const src = readFileSync(join(ROOT, 'src/utils/dashboard-generated-metrics.ts'), 'utf8');
    assert.match(src, /wasteGen from '\.\.\/data\/generated\/waste\.json'/);
    assert.match(src, /waste: wasteGen/);
    assert.doesNotMatch(src, /waste: recyclingRateGen/);
  });

  it('dashboard-config waste uses total_kg / kg', () => {
    const cfg = readFileSync(join(ROOT, 'src/data/dashboard-config.ts'), 'utf8');
    const wasteBlock = cfg.slice(cfg.indexOf("id: 'waste'"), cfg.indexOf("id: 'ghg'"));
    assert.match(wasteBlock, /kpiField: 'total_kg'/);
    assert.match(wasteBlock, /kpiUnit: 'kg'/);
    assert.doesNotMatch(wasteBlock, /recycle_pct/);
  });

  it('resource-indicator-map waste unit is kg, not recycling-rate percent', () => {
    const map = readJson('src/data/resource-indicator-map.json');
    const waste = map.mappings.find((m) => m.dashboardId === 'waste');
    assert.ok(waste);
    assert.equal(waste.unit, 'kg');
    assert.doesNotMatch(waste.unit, /%/);
  });

  it('waste.json is a mass dataset (unit kg, kpiField total_kg)', () => {
    const waste = readJson('src/data/generated/waste.json');
    assert.equal(waste.unit, 'kg');
    assert.equal(waste.kpiField, 'total_kg');
    assert.ok(waste.years['2569'].months.length >= 7, 'FY2569 partial waste mass is published');
  });

  it('recycling_rate.json remains a separate % metric (never waste mass)', () => {
    const recycling = readJson('src/data/generated/recycling_rate.json');
    assert.equal(recycling.unit, '%');
    assert.equal(recycling.kpiField, 'recycle_pct');
  });

  it('landing + dashboard index also use waste MASS (kg), not recycling rate', () => {
    const landing = readFileSync(join(ROOT, 'src/components/landing/LandingPage.astro'), 'utf8');
    assert.match(landing, /wasteGen from '\.\.\/\.\.\/data\/generated\/waste\.json'/);
    assert.match(landing, /waste: wasteGen/);
    assert.doesNotMatch(landing, /waste: recyclingRateGen/);
    const ecc = readFileSync(join(ROOT, 'src/components/landing/ExecutiveCommandCenter.astro'), 'utf8');
    assert.doesNotMatch(ecc, /waste: recyclingRateGen/);
    assert.match(ecc, /waste: wasteGen/);
    // Waste is MASS: a decrease (down) is the improvement on dashboard index.
    const dash = readFileSync(join(ROOT, 'src/pages/dashboard.astro'), 'utf8');
    assert.doesNotMatch(dash, /recycling: up = good, down = bad/);
    assert.match(dash, /A YoY decrease is an improvement/);
    const dashEn = readFileSync(join(ROOT, 'src/pages/en/dashboard/index.astro'), 'utf8');
    assert.doesNotMatch(dashEn, /recycling: up = good/);
  });
});

// ── Current metric values reconcile to audited source ────────────────────────

describe('Current metric values reconcile to audited FY2569 source', () => {
  const METRICS = ['energy', 'water', 'fuel', 'paper', 'waste', 'ghg'];

  it('each current-year record carries SHA-256, sheet, extraction date, coverage, verification', () => {
    for (const metric of METRICS) {
      const data = readJson(`src/data/generated/${metric}.json`);
      const y = data.years['2569'];
      assert.ok(y, `${metric} 2569 present`);
      assert.ok(y.months.length > 0, `${metric} 2569 has observed months`);
      assert.equal(y.provenance.verification.status, 'available_unverified', `${metric} not human-verified`);
      assert.equal(y.provenance.verification.humanVerificationRequired, true);
      assert.match(y.provenance.sourceSha256, /^[0-9a-f]{64}$/, `${metric} has SHA-256`);
      assert.ok(y.provenance.extractionDate, `${metric} has extraction date`);
      assert.match(y.provenance.coverage, /^[1-9] of 12 months$/, `${metric} coverage`);
      assert.ok(y.provenance.sourceSheet, `${metric} has sheet/range`);
      assert.equal(y.datasetState, 'PUBLISHABLE_PARTIAL', `${metric} partial state`);
      assert.equal(y.dataStatus, 'in_progress');
    }
  });

  it('annual total equals the sum of observed monthly values (no fake totals)', () => {
    for (const metric of METRICS) {
      const data = readJson(`src/data/generated/${metric}.json`);
      const y = data.years['2569'];
      const calc = Math.round(y.months.reduce((s, m) => s + m.value, 0) * 100) / 100;
      assert.equal(y.total, calc, `${metric} total must be the sum of months`);
      // Missing months are absent — never zero-filled
      const months = y.months.map((m) => m.month);
      assert.deepEqual(months, [1, 2, 3, 4, 5, 6, 7], `${metric} Jan–Jul observed`);
    }
  });

  it('fuel FY2569 partial data is now published from the actual workbook', () => {
    const fuel = readJson('src/data/generated/fuel.json');
    const y = fuel.years['2569'];
    assert.equal(y.months.length, 7);
    assert.equal(y.quality.valid, true);
    assert.equal(y.quality.reconciliationDifference, 0);
    assert.equal(y.provenance.sourceWorkbook, '1.3Gassolene.xlsx');
  });

  it('energy/water flag the unusable workbook total instead of hiding it', () => {
    for (const metric of ['energy', 'water']) {
      const data = readJson(`src/data/generated/${metric}.json`);
      const y = data.years['2569'];
      assert.equal(y.quality.valid, true, `${metric} monthly values confirmed`);
      assert.equal(y.quality.reconciliationDifference, null);
      assert.ok(
        y.quality.warnings.some((w) => w.includes('corrupt negative cell')),
        `${metric} must disclose the unusable workbook total`,
      );
    }
  });
});

// ── Built HTML (TH + EN) — run after `npm run build` ─────────────────────────

const hasDist = existsSync(join(DIST, 'indicators'));
const builtDescribe = hasDist ? describe : describe.skip;

builtDescribe('Built HTML — FY2569 panel before collapsed baseline (TH + EN)', () => {
  const codes = indicatorCodeList();

  it(`reads built pages for all ${codes.length} indicators (TH)`, () => {
    for (const code of codes) {
      const file = join(DIST, 'indicators', code, 'index.html');
      assert.ok(existsSync(file), `missing built TH page ${file}`);
    }
  });

  it(`reads built pages for all ${codes.length} indicators (EN)`, () => {
    for (const code of codes) {
      const file = join(DIST, 'en', 'indicators', code, 'index.html');
      assert.ok(existsSync(file), `missing built EN page ${file}`);
    }
  });

  it('FY2569 panel appears first and exactly ONE closed FY2568 baseline section', () => {
    for (const code of codes) {
      for (const prefix of ['', 'en/']) {
        const file = join(DIST, prefix, 'indicators', code, 'index.html');
        if (!existsSync(file)) continue;
        const html = readFileSync(file, 'utf8');
        const panelIdx = html.indexOf('data-fy2569-status-panel');
        const baselineTags = [...html.matchAll(/<details[^>]*data-fy2568-baseline[^>]*>/g)];
        assert.ok(panelIdx !== -1, `${prefix}${code} has FY2569 panel`);
        assert.equal(baselineTags.length, 1, `${prefix}${code} must have exactly ONE FY2568 baseline section`);
        const baselineIdx = html.indexOf('data-fy2568-baseline');
        assert.ok(panelIdx < baselineIdx, `${prefix}${code}: panel must precede baseline`);
        assert.doesNotMatch(baselineTags[0][0], /\sopen\b/, `${prefix}${code} baseline must be collapsed`);
      }
    }
  });

  it('unavailable pages show ยังไม่พร้อม and no fake zero/result in the panel', () => {
    for (const code of ['4.1.1', '5.1.1', '6.1.1', '7.1']) {
      for (const prefix of ['', 'en/']) {
        const file = join(DIST, prefix, 'indicators', code, 'index.html');
        if (!existsSync(file)) continue;
        const html = readFileSync(file, 'utf8');
        const panelStart = html.indexOf('data-fy2569-status-panel');
        const disclaimerEnd = html.indexOf('data-fy2569-disclaimer', panelStart);
        const panel = html.slice(panelStart, disclaimerEnd === -1 ? panelStart + 3000 : disclaimerEnd + 400);
        if (prefix === '') {
          assert.match(panel, /ข้อมูลปี 2569 ยังไม่พร้อม/, `${code} TH unavailable text`);
        } else {
          assert.match(panel, /FY2569 data not yet available/, `${code} EN unavailable text`);
        }
        assert.doesNotMatch(panel, /ข้อมูลปี 2569 ยังไม่พร้อม[^<]{0,80}\d[.,]?\d/, 'no fake number next to unavailable text');
      }
    }
  });

  it('no false "พร้อม"/Ready/official-score on available_unverified built pages', () => {
    const html = readFileSync(join(DIST, 'indicators', '1.1.1', 'index.html'), 'utf8');
    const panelStart = html.indexOf('data-fy2569-status-panel');
    const disclaimerEnd = html.indexOf('data-fy2569-disclaimer', panelStart);
    const panel = html.slice(panelStart, disclaimerEnd === -1 ? panelStart + 3000 : disclaimerEnd + 400);
    assert.match(panel, /พร้อมตรวจสอบ/);
    // ready_unverified must NOT be shown as "ตรวจสอบแล้ว" (verified).
    assert.doesNotMatch(panel, /ตรวจสอบแล้ว/);
    // The disclaimer mentions "คะแนน" only to deny it — no score value may appear.
    assert.doesNotMatch(panel, /\d+\s*คะแนน|คะแนน\s*[:：]/);
  });

  it('waste dashboard built page shows kg mass and the separate-rate note', () => {
    const file = join(DIST, 'dashboard', 'waste', 'index.html');
    assert.ok(existsSync(file), 'waste dashboard built');
    const html = readFileSync(file, 'utf8');
    assert.match(html, /data-waste-unit-note/);
    assert.match(html, /ปริมาณขยะ|Waste MASS|kg/);
    assert.doesNotMatch(html, /recycle_pct|recycling rate.*unit|% \(recycling rate\)/);
  });
});
