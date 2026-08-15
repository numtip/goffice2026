/**
 * Focused tests for the FY2568 baseline evidence layer (GO-DATA-4).
 * Verifies the canonical data contract and the category-count mapping used by
 * the category pages. Run via `npx tsx`.
 */
import {
  BASELINE_2568_CATEGORY_COUNTS,
  BASELINE_2568_TOTAL,
  FY2568_BASELINE_YEAR,
  getBaselineCategoryCoverage,
  getSourceTypeCounts,
} from '../src/data/criteria/baseline-2568.ts';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

// TH/EN category routes that must import + render the baseline layer.
const CATEGORY_ROUTES = [
  'src/pages/categories/index.astro',
  'src/pages/categories/[id].astro',
  'src/pages/en/categories/index.astro',
  'src/pages/en/categories/[id].astro',
];

// Detail-page routes only — these render the enhanced comparison-baseline panel.
const DETAIL_ROUTES = [
  'src/pages/categories/[id].astro',
  'src/pages/en/categories/[id].astro',
];

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    failed++;
  }
}

console.log('Testing baseline-2568.ts...\n');

test('covers all 7 categories in canonical order', () => {
  assert.strictEqual(BASELINE_2568_CATEGORY_COUNTS.length, 7);
  assert.deepStrictEqual(
    BASELINE_2568_CATEGORY_COUNTS.map((c) => c.categoryCode),
    ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7'],
  );
});

test('PO-approved category counts match', () => {
  const expected = { cat1: 38, cat2: 29, cat3: 32, cat4: 28, cat5: 47, cat6: 32, cat7: 3 };
  for (const entry of BASELINE_2568_CATEGORY_COUNTS) {
    assert.strictEqual(
      entry.recordedBaselineCount,
      expected[entry.categoryCode],
      `${entry.categoryCode} count mismatch`,
    );
  }
});

test('total baseline count is 209', () => {
  assert.strictEqual(BASELINE_2568_TOTAL, 209);
});

test('coverage state is category-level only — no indicator verification claim', () => {
  for (const entry of BASELINE_2568_CATEGORY_COUNTS) {
    assert.strictEqual(entry.coverageState, 'CATEGORY_LEVEL_RECORDED');
  }
});

test('categoryId aligns with canonical category id', () => {
  const ids = BASELINE_2568_CATEGORY_COUNTS.map((c) => c.categoryId);
  assert.deepStrictEqual(ids, ['1', '2', '3', '4', '5', '6', '7']);
});

test('lookup returns matching entry and undefined for unknown code', () => {
  assert.strictEqual(getBaselineCategoryCoverage('cat3')?.recordedBaselineCount, 32);
  assert.strictEqual(getBaselineCategoryCoverage('cat7')?.recordedBaselineCount, 3);
  assert.strictEqual(getBaselineCategoryCoverage('unknown'), undefined);
});

test('frozen baseline year is 2568', () => {
  assert.strictEqual(FY2568_BASELINE_YEAR, 2568);
});

test('module exposes no path/filename/URL-bearing fields', () => {
  for (const entry of BASELINE_2568_CATEGORY_COUNTS) {
    const values = Object.values(entry);
    for (const value of values) {
      if (typeof value === 'string') {
        assert.ok(!/[\\/]|\.xlsx|https?:/i.test(value), `suspicious string: ${value}`);
      }
    }
  }
});

test('TH and EN category routes import the baseline layer', () => {
  for (const route of CATEGORY_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    assert.ok(
      src.includes('getBaselineCategoryCoverage'),
      `${route} must import getBaselineCategoryCoverage`,
    );
    assert.ok(
      src.includes('FY2568_BASELINE_YEAR'),
      `${route} must import FY2568_BASELINE_YEAR`,
    );
  }
});

test('TH and EN category routes render the baseline count', () => {
  for (const route of CATEGORY_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    assert.ok(
      src.includes('recordedBaselineCount'),
      `${route} must render recordedBaselineCount`,
    );
  }
});

test('category routes state indicator mapping is not verified (TH/EN parity)', () => {
  for (const route of CATEGORY_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    if (route.includes('/en/')) {
      assert.ok(
        /not\s+(yet\s+)?verified|no verified indicator mapping/i.test(src),
        `${route} must state indicator mapping is not verified (EN)`,
      );
    } else {
      assert.ok(
        src.includes('ระดับตัวชี้วัด') && src.includes('ยังไม่'),
        `${route} must state indicator mapping is not verified (TH)`,
      );
    }
  }
});

const AUDITED_SOURCE_TYPES = {
  cat1: { pdf: 28, xlsx: 3, docx: 7 },
  cat2: { pdf: 24, xlsx: 2, docx: 2, xls: 1 },
  cat3: { pdf: 26, docx: 6 },
  cat4: { xlsx: 1, pdf: 10, txt: 15, docx: 2 },
  cat5: { pdf: 46, docx: 1 },
  cat6: { pdf: 31, docx: 1 },
  cat7: { pdf: 3 },
};

test('source-type totals match the verified aggregate audit', () => {
  for (const entry of BASELINE_2568_CATEGORY_COUNTS) {
    assert.deepStrictEqual(
      entry.sourceTypeTotals,
      AUDITED_SOURCE_TYPES[entry.categoryCode],
      `${entry.categoryCode} source-type totals mismatch`,
    );
  }
});

test('getSourceTypeCounts returns safe, sorted extension counts', () => {
  assert.deepStrictEqual(getSourceTypeCounts('cat4'), [
    { ext: 'txt', count: 15 },
    { ext: 'pdf', count: 10 },
    { ext: 'docx', count: 2 },
    { ext: 'xlsx', count: 1 },
  ]);
  assert.deepStrictEqual(getSourceTypeCounts('cat7'), [{ ext: 'pdf', count: 3 }]);
  assert.deepStrictEqual(getSourceTypeCounts('unknown'), []);
});

test('baseline layer exposes no source paths, filenames, URLs, or personal data', () => {
  const forbidden = [
    'GreenData_Res', 'Data2568', 'OneDrive', 'Maejo', 'หมวด',
    '.pdf', '.docx', '.xlsx', '.xls', '.txt', '.jpg', '.png',
    'http://', 'https://', '\\\\',
  ];
  for (const entry of BASELINE_2568_CATEGORY_COUNTS) {
    const strings = [
      entry.categoryCode,
      entry.categoryId,
      entry.coverageState,
      ...Object.keys(entry.sourceTypeTotals),
    ];
    for (const value of strings) {
      for (const marker of forbidden) {
        assert.ok(
          !value.includes(marker),
          `${entry.categoryCode} leaks forbidden marker: ${marker}`,
        );
      }
    }
    for (const ext of Object.keys(entry.sourceTypeTotals)) {
      assert.ok(/^[a-z0-9]+$/.test(ext), `unsafe extension key: ${ext}`);
    }
  }
});

test('TH and EN detail routes import the source-type helper and render it', () => {
  for (const route of DETAIL_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    assert.ok(src.includes('getSourceTypeCounts'), `${route} must import getSourceTypeCounts`);
    assert.ok(src.includes('sourceTypeLabel'), `${route} must render sourceTypeLabel`);
  }
});

test('TH and EN detail routes render comparison-baseline title and document types', () => {
  for (const route of DETAIL_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    if (route.includes('/en/')) {
      assert.ok(
        src.includes('baseline for FY2569 comparison'),
        `${route} must render the EN comparison title`,
      );
      assert.ok(
        src.includes('Source document types'),
        `${route} must render the EN document-type label`,
      );
    } else {
      assert.ok(
        src.includes('สำหรับการเปรียบเทียบปี 2569'),
        `${route} must render the TH comparison title`,
      );
      assert.ok(
        src.includes('ประเภทเอกสารต้นทาง'),
        `${route} must render the TH document-type label`,
      );
    }
  }
});

test('TH and EN detail routes state no FY2569 update is added in this release', () => {
  for (const route of DETAIL_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    if (route.includes('/en/')) {
      assert.ok(
        src.includes('No FY2569 update or result is added in this release.'),
        `${route} must state no FY2569 update is added (EN)`,
      );
    } else {
      assert.ok(
        src.includes('ไม่มีการเพิ่มข้อมูลหรือผลลัพธ์ปี 2569'),
        `${route} must state no FY2569 update is added (TH)`,
      );
    }
  }
});

test('TH and EN detail routes state category-level only, no verified indicator mapping', () => {
  for (const route of DETAIL_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    if (route.includes('/en/')) {
      assert.ok(
        src.includes('Category-level baseline only; no verified indicator mapping.'),
        `${route} must state category-level only (EN)`,
      );
    } else {
      assert.ok(
        src.includes('บันทึกระดับหมวดหมู่เท่านั้น'),
        `${route} must state category-level only (TH)`,
      );
    }
  }
});

test('cat2 and cat7 source-structure notes are present in both locales', () => {
  for (const route of DETAIL_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    const cat2Note = route.includes('/en/')
      ? 'an unresolved item exists for category 2.'
      : 'พบรายการที่ยังไม่ได้รับการแก้ไขในหมวด 2';
    const cat7Note = route.includes('/en/')
      ? 'no verified individual-indicator mapping for category 7.'
      : 'ยังไม่มีการยืนยันการเชื่อมโยงรายตัวชี้วัดสำหรับหมวด 7';
    assert.ok(src.includes(cat2Note), `${route} must include the cat2 note`);
    assert.ok(src.includes(cat7Note), `${route} must include the cat7 note`);
  }
});

test('route sources expose no source-root, filename, or URL markers', () => {
  const forbidden = ['GreenData_Res', 'Data2568', 'OneDrive', 'Maejo', '.pdf', '.docx', '.xlsx', '.xls', '.txt', 'http://', 'https://'];
  for (const route of CATEGORY_ROUTES) {
    const src = readFileSync(join(PROJECT_ROOT, route), 'utf8');
    for (const marker of forbidden) {
      assert.ok(!src.includes(marker), `${route} leaks forbidden marker: ${marker}`);
    }
  }
});

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}

console.log('\nAll tests passed! ✓');
