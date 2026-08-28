/**
 * test-fy2569-indicator-edge.mjs
 * ===============================
 * FY2569 status panel + collapsed FY2568 baseline — EDGE-CASE review suite.
 *
 * Complements scripts/test-fy2569-truthfulness.mjs (which covers registry
 * completeness, VM truthfulness on a few codes, and first-baseline ordering).
 * This suite targets the edge cases the truthfulness suite does not cover:
 *
 *   1. TH/EN parity SWEEP — every indicator code × both locales:
 *      non-empty badge/headline, localized title/disclaimer, expected
 *      `data-fy2569-kind` from the registry, expected badge text, and
 *      "no stray Thai in EN" across the whole rendered panel.
 *   2. 2.2.3 / 2.2.4 gap honesty — the panel must NOT claim an
 *      understanding-% or improvement-loop result, and the Cat2 gap notes
 *      (Big Cleaning survey unmapped; 2.2.4 guideline byte-identical to
 *      FY2568 → held) must be visible via the registry notes.
 *   3. Cat7 quarantine — no FY2568-era evidence promoted to FY2569:
 *      registry stays unavailable, quarantine text still exists in
 *      Cat7ContractContext.astro and on the built 7.1/7.2 pages.
 *   4. IndicatorLinkedEvidence.astro split rule — `year === 2569` is the
 *      ONLY FY2569 discriminator; all 19 year-2569 items land in the FY2569
 *      bucket while every 2568/2025/2024 item lands in the baseline bucket
 *      (data-level split + per-page built-bucket count cross-check).
 *   5. Built pages — the panel appears BEFORE *every* baseline <details>
 *      and every baseline details is collapsed (no `open`), for all 65
 *      codes × {th, en}.
 *   6. No in_progress page claims an annual-completion result (partial
 *      headline copy contains the explicit "not an annual completion"
 *      negation and no positive completion language).
 *
 * Why no `.ts` import here: `fy2569-status-vm.ts` imports a JSON registry
 * without `with { type: 'json' }`, which plain `node --test` rejects
 * (ERR_IMPORT_ATTRIBUTE_MISSING — the existing truthfulness suite fails the
 * same way). Every JSON registry is therefore read via readFileSync, and the
 * VM's rendered output is verified end-to-end against the built HTML instead.
 * The expected badge/headline strings are asserted to exist verbatim in the
 * VM source so the mirror used here is grounded in the real implementation.
 *
 * Built-HTML checks run only when dist/ exists (`npm run build` first).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

const INDICATORS_JSON = join(ROOT, 'src/data/criteria/indicators.json');
const PROGRESS_JSON = join(ROOT, 'src/data/progress/indicator-progress-2569.json');
const EVIDENCE_JSON = join(ROOT, 'src/data/evidence-index.json');
const VM_TS = join(ROOT, 'src/utils/fy2569-status-vm.ts');
const LINKED_EVIDENCE_ASTRO = join(ROOT, 'src/components/indicators/IndicatorLinkedEvidence.astro');
const CAT7_CONTEXT_ASTRO = join(ROOT, 'src/components/indicators/Cat7ContractContext.astro');

const THAI = /[\u0E00-\u0E7F]/;

function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

const indicators = readJson('src/data/criteria/indicators.json');
const progress = readJson('src/data/progress/indicator-progress-2569.json');
const evidence = readJson('src/data/evidence-index.json');

function indicatorCodes() {
  return indicators.indicators.map((i) => i.code);
}

const progressByCode = new Map(progress.items.map((i) => [i.indicator, i]));

// ── Mirror of fy2569-status-vm.ts decision tree (cross-checked against the
//    real VM source strings and the built pages below). ───────────────────────
const KIND_ORDER = ['ready_verified', 'ready_unverified', 'partial', 'not_started', 'unavailable'];

function expectedKind(item) {
  if (!item) return 'unavailable';
  const progressStatus = item.progressStatus ?? 'unavailable';
  const evidenceStatus = item.evidenceStatus ?? 'unavailable';
  if (progressStatus === 'ready') {
    return evidenceStatus === 'verified' ? 'ready_verified' : 'ready_unverified';
  }
  if (progressStatus === 'in_progress') return 'partial';
  if (progressStatus === 'not_started') return 'not_started';
  return 'unavailable';
}

const EXPECTED_BADGE = {
  unavailable: { th: 'ข้อมูลปี 2569 ยังไม่พร้อม', en: 'FY2569 data not yet available' },
  partial: { th: 'กำลังดำเนินการ (บางส่วน)', en: 'In progress (partial)' },
  not_started: { th: 'ยังไม่เริ่มดำเนินการปี 2569', en: 'FY2569 not started' },
  ready_unverified: { th: 'พร้อมตรวจสอบ', en: 'Ready for review' },
  ready_verified: { th: 'พร้อม · ตรวจสอบแล้ว', en: 'Ready · Verified' },
};

const EXPECTED_HEADLINE = {
  unavailable: {
    th: 'ยังไม่มีข้อมูล/หลักฐานปี 2569 ที่ตรวจสอบแล้วสำหรับตัวชี้วัดนี้',
    en: 'No verified FY2569 data or evidence is available for this indicator yet',
  },
  partial: {
    th: 'มีการดำเนินงาน/หลักฐานบางส่วนของปี 2569 — ยังไม่ครบถ้วนตามข้อกำหนด และไม่ใช่ผลสำเร็จประจำปี',
    en: 'Partial FY2569 activity/evidence — scope not yet complete; this is not an annual completion',
  },
  not_started: {
    th: 'ยังไม่พบหลักฐานการดำเนินงานปี 2569 สำหรับตัวชี้วัดนี้',
    en: 'No FY2569 implementation evidence found for this indicator yet',
  },
  ready_unverified: {
    th: 'หลักฐานปี 2569 มีแล้วแต่ยังไม่ผ่านการตรวจสอบยืนยัน — พร้อมให้เจ้าหน้าที่ตรวจสอบ',
    en: 'FY2569 evidence is available but not yet human-verified — ready for review',
  },
  ready_verified: {
    th: 'หลักฐานปี 2569 ตรวจสอบแล้ว — พร้อมใช้เป็นข้อมูลประกอบการประเมิน',
    en: 'FY2569 evidence is verified — ready for assessment reference',
  },
};

// ── Built-HTML helpers ───────────────────────────────────────────────────────

function panelRegion(html) {
  // Exact panel div: starts at data-fy2569-status-panel and ends at the closing
  // </div> of the disclaimer paragraph. Slicing past this can bleed into the
  // next section (e.g. the Cat1 presentation blocks that follow the panel).
  const start = html.indexOf('data-fy2569-status-panel');
  assert.ok(start !== -1, 'page has no FY2569 panel');
  const disclaimer = html.indexOf('data-fy2569-disclaimer', start);
  assert.ok(disclaimer !== -1, 'page has no FY2569 panel disclaimer');
  const pEnd = html.indexOf('</p>', disclaimer);
  const divEnd = html.indexOf('</div>', pEnd);
  return html.slice(start, divEnd === -1 ? pEnd + 300 : divEnd + 6);
}

function badgeText(panel) {
  const m = panel.match(/<span class="inline-flex items-center rounded-full[^>]*>([\s\S]*?)<\/span>/);
  return m ? m[1].trim() : null;
}

function headlineText(panel) {
  const m = panel.match(/<p class="text-sm leading-relaxed text-gray-800">([\s\S]*?)<\/p>/);
  return m ? m[1].trim() : null;
}

function notesText(panel) {
  const m = panel.match(
    /<p class="mt-2 rounded-lg border border-gray-100 bg-white\/70 p-3 text-xs leading-relaxed text-gray-700">([\s\S]*?)<\/p>/,
  );
  return m ? m[1].trim() : null;
}

function disclaimerText(panel) {
  const m = panel.match(
    /<p class="mt-3 border-t border-gray-100 pt-2 text-\[11px\] text-gray-400" data-fy2569-disclaimer>([\s\S]*?)<\/p>/,
  );
  return m ? m[1].trim() : null;
}

function panelKind(html) {
  const m = html.match(/data-fy2569-kind="([^"]+)"/);
  return m ? m[1] : null;
}

// ── 1. Registry data invariants (edge sweep over all 65 indicators) ──────────

describe('FY2569 registry data invariants (all 65 indicators)', () => {
  const codes = indicatorCodes();

  it('has exactly 65 unique codes', () => {
    assert.equal(codes.length, 65);
    assert.equal(new Set(codes).size, 65);
  });

  it('every code has exactly one registry entry with valid statuses', () => {
    for (const code of codes) {
      const item = progressByCode.get(code);
      assert.ok(item, `missing registry entry for ${code}`);
      const statuses = ['ready', 'in_progress', 'not_started', 'unavailable'];
      assert.ok(statuses.includes(item.progressStatus), `${code} bad progressStatus ${item.progressStatus}`);
      assert.ok(
        ['verified', 'available_unverified', 'unavailable'].includes(item.evidenceStatus),
        `${code} bad evidenceStatus ${item.evidenceStatus}`,
      );
    }
    assert.equal(progress.items.length, 65, 'registry must not contain extra/duplicate items');
  });

  it('in_progress ⇒ available_unverified (never verified, so no completion claim is possible)', () => {
    const partial = progress.items.filter((i) => i.progressStatus === 'in_progress');
    assert.ok(partial.length > 0, 'expected at least one in_progress indicator');
    for (const item of partial) {
      assert.equal(item.evidenceStatus, 'available_unverified', `${item.indicator} in_progress must be unverified`);
    }
  });

  it('verified evidenceStatus only accompanies ready progress (only 1.1.4 / 1.6.1)', () => {
    const verified = progress.items.filter((i) => i.evidenceStatus === 'verified');
    assert.deepEqual(verified.map((i) => i.indicator).sort(), ['1.1.4', '1.6.1']);
    for (const item of verified) {
      assert.equal(item.progressStatus, 'ready', `${item.indicator} verified ⇒ ready`);
    }
  });

  it('unavailable indicators carry no source ref (no fake FY2569 source)', () => {
    for (const item of progress.items.filter((i) => i.progressStatus === 'unavailable')) {
      assert.ok(item.source && (item.source.type === 'unavailable' || item.source.ref === null),
        `${item.indicator} unavailable must have no source ref`);
    }
  });

  it('the expected-kind mirror covers every code (registry decision tree is complete)', () => {
    for (const code of codes) {
      const kind = expectedKind(progressByCode.get(code));
      assert.ok(KIND_ORDER.includes(kind), `${code} unexpected kind ${kind}`);
    }
  });
});

// ── 2. 2.2.3 / 2.2.4 gap honesty ─────────────────────────────────────────────

describe('2.2.3 / 2.2.4 — shared panel claims no understanding-% or improvement-loop result', () => {
  it('registry keeps both unavailable with no source ref', () => {
    for (const code of ['2.2.3', '2.2.4']) {
      const item = progressByCode.get(code);
      assert.ok(item, `missing registry entry for ${code}`);
      assert.equal(item.progressStatus, 'unavailable', `${code} progressStatus`);
      assert.equal(item.evidenceStatus, 'unavailable', `${code} evidenceStatus`);
      assert.equal(item.source?.ref, null, `${code} must have no source ref`);
    }
  });

  it('2.2.3 note discloses the Big Cleaning survey is NOT mapped as understanding', () => {
    const note = progressByCode.get('2.2.3').notes;
    assert.ok(note, '2.2.3 note must exist');
    assert.match(note, /Big Cleaning/);
    assert.match(note, /not mapped as understanding/i);
    assert.match(note, /Keep unavailable/i);
  });

  it('2.2.4 note discloses the FY2568-identical guideline and no improvement-loop log', () => {
    const note = progressByCode.get('2.2.4').notes;
    assert.ok(note, '2.2.4 note must exist');
    assert.match(note, /byte-identical to FY2568/i);
    assert.match(note, /improvement-loop/i);
    assert.match(note, /Keep unavailable/i);
  });

  it('built panels show unavailable badge and no percentage/understanding/improvement result', (t) => {
    const hasDist = existsSync(join(DIST, 'indicators'));
    if (!hasDist) return t.skip('dist not built');
    for (const code of ['2.2.3', '2.2.4']) {
      for (const prefix of ['', 'en/']) {
        const html = readFileSync(join(DIST, prefix, 'indicators', code, 'index.html'), 'utf8');
        const panel = panelRegion(html);
        assert.equal(panelKind(html), 'unavailable', `${prefix}${code} kind`);
        assert.match(panel, prefix === '' ? /ข้อมูลปี 2569 ยังไม่พร้อม/ : /FY2569 data not yet available/);
        // No numeric percentage result anywhere in the panel.
        assert.doesNotMatch(panel, /\d+\s*%/, `${prefix}${code} must not show a % result`);
        // No understanding / improvement-loop completion claim.
        assert.doesNotMatch(panel, /เข้าใจ(แล้ว)?|ปรับปรุง(แก้ไข)?แล้ว|understanding[^<]{0,40}(achieved|completed)|improvement[^<]{0,40}(implemented|completed|achieved)/i,
          `${prefix}${code} must not claim an understanding-% or improvement-loop result`);
      }
    }
  });
});

// ── 3. Cat7 quarantine ───────────────────────────────────────────────────────

describe('Cat7 (7.1 / 7.2) — no quarantined FY2568 evidence promoted to FY2569', () => {
  it('registry stays unavailable for both Cat7 indicators', () => {
    for (const code of ['7.1', '7.2']) {
      const item = progressByCode.get(code);
      assert.ok(item, `missing registry entry for ${code}`);
      assert.equal(item.progressStatus, 'unavailable', `${code} must stay unavailable`);
      assert.equal(item.evidenceStatus, 'unavailable', `${code} evidence must stay unavailable`);
      assert.equal(item.source?.ref, null, `${code} must have no FY2569 source ref`);
    }
  });

  it('Cat7ContractContext.astro still carries the QUARANTINE disclosure machinery', () => {
    const src = readFileSync(CAT7_CONTEXT_ASTRO, 'utf8');
    assert.match(src, /QUARANTINE/); // status style + kind style
    assert.match(src, /statusLabel\(claim\.status\)/); // claim statuses (incl. QUARANTINE) are rendered
    assert.match(src, /quarantine/); // quarantine fact kind styling
  });

  it('evidence index: no year-2569 item links to 7.1/7.2; the only linked item is FY2568 baseline', () => {
    for (const code of ['7.1', '7.2']) {
      const linked = evidence.items.filter(
        (i) => i.traceabilityLevel === 'indicator' && Array.isArray(i.indicatorCodes) && i.indicatorCodes.includes(code),
      );
      for (const item of linked) {
        assert.notEqual(item.year, 2569, `${code}: evidence ${item.id} must not be FY2569`);
      }
    }
    // The single indicator-level Cat7 item is the FY2568 internal-audit request (baseline-eligible).
    const baselineItem = evidence.items.find((i) => i.id === 'ev-cat7-internal-audit-request-fy2568');
    assert.ok(baselineItem, 'ev-cat7-internal-audit-request-fy2568 must exist');
    assert.equal(baselineItem.year, 2568);
    assert.equal(baselineItem.traceabilityLevel, 'indicator');
  });

  it('built 7.1/7.2 pages show unavailable panel and QUARANTINE text inside the baseline', (t) => {
    const hasDist = existsSync(join(DIST, 'indicators'));
    if (!hasDist) return t.skip('dist not built');
    for (const code of ['7.1', '7.2']) {
      const html = readFileSync(join(DIST, 'indicators', code, 'index.html'), 'utf8');
      assert.equal(panelKind(html), 'unavailable', `${code} built kind`);
      assert.match(panelRegion(html), /ข้อมูลปี 2569 ยังไม่พร้อม/, `${code} TH unavailable badge`);
      const baselineStart = html.indexOf('data-fy2568-baseline');
      assert.ok(baselineStart !== -1, `${code} baseline section present`);
      assert.ok(html.indexOf('QUARANTINE', baselineStart) !== -1, `${code} quarantine text inside baseline`);
    }
  });
});

// ── 4. IndicatorLinkedEvidence split rule ────────────────────────────────────

describe('Linked evidence split — year === 2569 is the ONLY FY2569 discriminator', () => {
  it('component uses exactly `item.year === 2569` (no other year comparison)', () => {
    const src = readFileSync(LINKED_EVIDENCE_ASTRO, 'utf8');
    assert.match(src, /item\.year === 2569/);
    // The ONLY year comparison in the split logic may be `=== 2569`; a different
    // literal (2024/2025/2568) or a range/comparison operator would mis-bucket.
    assert.doesNotMatch(src, /item\.year\s*(===|==|>=|<=|>|<)\s*(?!2569)\d{4}/);
    // The two buckets must be derived purely from isFy2569 — no other filter.
    assert.match(src, /items\.filter\(isFy2569\)/);
    assert.match(src, /items\.filter\(\(i\) => !isFy2569\(i\)\)/);
  });

  it('data split: all 19 year-2569 items to FY2569; every other year to baseline', () => {
    const fy2569 = evidence.items.filter((i) => i.year === 2569);
    const baseline = evidence.items.filter((i) => i.year !== 2569);
    assert.equal(fy2569.length, 19, 'exactly 19 FY2569 evidence items');
    assert.equal(baseline.length, evidence.items.length - 19);
    for (const item of fy2569) {
      assert.equal(typeof item.year, 'number', `${item.id}: year must be a number, not a string`);
      assert.equal(item.year, 2569);
    }
    // Known distribution of the baseline years (guards against accidental carry-forward).
    const byYear = {};
    for (const item of baseline) byYear[item.year] = (byYear[item.year] || 0) + 1;
    assert.deepEqual(byYear, { 2024: 2, 2025: 22, 2568: 91 });
  });

  it('built pages bucket counts match the data-derived split for every indicator', (t) => {
    const hasDist = existsSync(join(DIST, 'indicators'));
    if (!hasDist) return t.skip('dist not built');
    for (const code of indicatorCodes()) {
      const linked = evidence.items.filter(
        (i) => i.traceabilityLevel === 'indicator' && Array.isArray(i.indicatorCodes) && i.indicatorCodes.includes(code),
      );
      const fyCount = linked.filter((i) => i.year === 2569).length;
      const baseCount = linked.length - fyCount;

      for (const [prefix, pat] of [
        ['', { fy: /หลักฐานปี 2569 \((\d+)\)/, base: /เอกสารอ้างอิงปีฐาน 2568 \((\d+)\)/ }],
        ['en/', { fy: /FY2569 Evidence \((\d+)\)/, base: /FY2568 Baseline Reference \((\d+)\)/ }],
      ]) {
        const html = readFileSync(join(DIST, prefix, 'indicators', code, 'index.html'), 'utf8');
        const fyMatch = html.match(pat.fy);
        const baseMatch = html.match(pat.base);
        if (fyCount > 0) {
          assert.ok(fyMatch, `${prefix}${code}: expected FY2569 bucket heading (count ${fyCount})`);
          assert.equal(Number(fyMatch[1]), fyCount, `${prefix}${code} FY2569 bucket count`);
        } else {
          assert.ok(!fyMatch, `${prefix}${code}: no FY2569 bucket expected`);
        }
        if (baseCount > 0) {
          assert.ok(baseMatch, `${prefix}${code}: expected FY2568 baseline bucket heading (count ${baseCount})`);
          assert.equal(Number(baseMatch[1]), baseCount, `${prefix}${code} FY2568 bucket count`);
        } else {
          assert.ok(!baseMatch, `${prefix}${code}: no FY2568 bucket expected`);
        }
      }
    }
  });
});

// ── 5 + 6. Built HTML — panel before collapsed baseline, TH+EN ───────────────

const hasDistIndicators = existsSync(join(DIST, 'indicators'));
const builtDescribe = hasDistIndicators ? describe : describe.skip;

builtDescribe('Built HTML — panel before EVERY collapsed baseline (TH + EN, all 65)', () => {
  const codes = indicatorCodes();

  it('all 65 TH and EN pages exist', () => {
    for (const prefix of ['', 'en/']) {
      for (const code of codes) {
        assert.ok(existsSync(join(DIST, prefix, 'indicators', code, 'index.html')), `missing ${prefix}${code}`);
      }
    }
  });

  it('panel appears before every baseline <details>, and every baseline is collapsed', () => {
    for (const prefix of ['', 'en/']) {
      for (const code of codes) {
        const html = readFileSync(join(DIST, prefix, 'indicators', code, 'index.html'), 'utf8');
        const panelStart = html.indexOf('data-fy2569-status-panel');
        assert.ok(panelStart !== -1, `${prefix}${code}: FY2569 panel present`);
        assert.match(html.slice(panelStart, panelStart + 120), new RegExp(`data-indicator-code="${code}"`),
          `${prefix}${code}: panel indicator code attribute`);

        const baselineTags = [...html.matchAll(/<details[^>]*data-fy2568-baseline[^>]*>/g)];
        assert.ok(baselineTags.length >= 1, `${prefix}${code}: at least one baseline details`);
        for (const tag of baselineTags) {
          assert.ok(tag.index > panelStart, `${prefix}${code}: panel must precede EVERY baseline details`);
          assert.doesNotMatch(tag[0], /\sopen\b/, `${prefix}${code}: baseline details must be collapsed`);
        }

        const title = prefix === '' ? 'ฐานเปรียบเทียบปี 2568' : 'FY2568 Baseline';
        assert.ok(html.indexOf(title, panelStart) !== -1, `${prefix}${code}: baseline title "${title}"`);
      }
    }
  });

  it('no in_progress page claims an annual-completion result', () => {
    const partialCodes = progress.items.filter((i) => i.progressStatus === 'in_progress').map((i) => i.indicator);
    assert.ok(partialCodes.length > 0);
    for (const prefix of ['', 'en/']) {
      for (const code of partialCodes) {
        const html = readFileSync(join(DIST, prefix, 'indicators', code, 'index.html'), 'utf8');
        const panel = panelRegion(html);
        const loc = prefix === '' ? 'th' : 'en';
        assert.equal(panelKind(html), 'partial', `${prefix}${code} must be partial`);
        // The badge and headline are exactly the partial copy — which states
        // "not an annual completion" and never a positive completion/verification
        // claim. (Notes are free-form honesty text, so we assert badge+headline.)
        assert.equal(badgeText(panel), EXPECTED_BADGE.partial[loc], `${prefix}${code} partial badge`);
        assert.equal(headlineText(panel), EXPECTED_HEADLINE.partial[loc], `${prefix}${code} partial headline`);
        if (loc === 'th') {
          assert.match(headlineText(panel), /ไม่ใช่ผลสำเร็จประจำปี/, `${code} TH negation`);
          assert.doesNotMatch(headlineText(panel), /บรรลุผลสำเร็จประจำปี|ครบถ้วนตามข้อกำหนดแล้ว/,
            `${code} TH must not claim completion`);
        } else {
          assert.match(headlineText(panel), /not an annual completion/i, `${code} EN negation`);
          assert.doesNotMatch(headlineText(panel), /completed the (scope|criterion)|achieved the (scope|criterion)|\bVerified\b|\bReady\b/i,
            `${code} EN must not claim completion/verification`);
        }
      }
    }
  });
});

// ── TH/EN parity sweep of the rendered panel ─────────────────────────────────

builtDescribe('TH/EN parity — rendered panel for every indicator code', () => {
  const codes = indicatorCodes();

  it('VM source contains every expected localized badge/headline string (no missing strings)', () => {
    const vm = readFileSync(VM_TS, 'utf8');
    for (const kind of KIND_ORDER) {
      for (const loc of ['th', 'en']) {
        assert.ok(vm.includes(EXPECTED_BADGE[kind][loc]), `VM must contain badge for ${kind}/${loc}`);
        assert.ok(vm.includes(EXPECTED_HEADLINE[kind][loc]), `VM must contain headline for ${kind}/${loc}`);
      }
    }
  });

  it('registry-derived kind and badge match the built panel for all 65 codes × 2 locales', () => {
    for (const prefix of ['', 'en/']) {
      for (const code of codes) {
        const html = readFileSync(join(DIST, prefix, 'indicators', code, 'index.html'), 'utf8');
        const kind = expectedKind(progressByCode.get(code));
        assert.equal(panelKind(html), kind, `${prefix}${code} built kind must equal registry-derived kind`);
        const panel = panelRegion(html);
        const badge = badgeText(panel);
        assert.ok(badge, `${prefix}${code} badge text present`);
        assert.equal(badge, EXPECTED_BADGE[kind][prefix === '' ? 'th' : 'en'], `${prefix}${code} badge copy`);
        const headline = headlineText(panel);
        assert.ok(headline, `${prefix}${code} headline present`);
        assert.equal(headline, EXPECTED_HEADLINE[kind][prefix === '' ? 'th' : 'en'], `${prefix}${code} headline copy`);
      }
    }
  });

  it('panel title and disclaimer are localized (TH Thai / EN English)', () => {
    for (const code of codes) {
      const th = panelRegion(readFileSync(join(DIST, 'indicators', code, 'index.html'), 'utf8'));
      const en = panelRegion(readFileSync(join(DIST, 'en', 'indicators', code, 'index.html'), 'utf8'));
      assert.match(th, /สถานะข้อมูล ปี 2569/);
      assert.match(en, /FY2569 Status/);
      assert.ok(THAI.test(disclaimerText(th)), `${code} TH disclaimer is Thai`);
      assert.ok(!THAI.test(disclaimerText(en)), `${code} EN disclaimer has no Thai`);
    }
  });

  it('badge/headline: TH has Thai script, EN has none, and they differ', () => {
    for (const code of codes) {
      const th = panelRegion(readFileSync(join(DIST, 'indicators', code, 'index.html'), 'utf8'));
      const en = panelRegion(readFileSync(join(DIST, 'en', 'indicators', code, 'index.html'), 'utf8'));
      const thBadge = badgeText(th);
      const enBadge = badgeText(en);
      const thHeadline = headlineText(th);
      const enHeadline = headlineText(en);
      assert.ok(THAI.test(thBadge), `${code} TH badge must be Thai`);
      assert.ok(THAI.test(thHeadline), `${code} TH headline must be Thai`);
      assert.ok(!THAI.test(enBadge), `${code} EN badge must have no Thai`);
      assert.ok(!THAI.test(enHeadline), `${code} EN headline must have no Thai`);
      assert.notEqual(enBadge, thBadge, `${code} EN/TH badge must differ`);
      assert.notEqual(enHeadline, thHeadline, `${code} EN/TH headline must differ`);
    }
  });

  it('NO stray Thai anywhere in the EN panel (badge + headline + notes + labels)', () => {
    for (const code of codes) {
      const html = readFileSync(join(DIST, 'en', 'indicators', code, 'index.html'), 'utf8');
      const panel = panelRegion(html);
      assert.ok(!THAI.test(panel), `${code}: EN panel must not contain Thai script`);
    }
  });
});
