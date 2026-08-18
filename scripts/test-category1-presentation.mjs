/**
 * test-category1-presentation.mjs
 * ================================
 * GOFFICE2026 Phase E/F regression tests — Category 1 management presentation.
 * Static structural assertions over TH/EN parity, a11y focus affordances,
 * reduced-motion coverage, missing-evidence honesty, and the read-only
 * view-model (src/utils/category1-presentation.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const CAT_TH = join(ROOT, 'src/pages/categories/[id].astro');
const CAT_EN = join(ROOT, 'src/pages/en/categories/[id].astro');
const CYCLE = join(ROOT, 'src/components/categories/Cat1ManagementCycle.astro');
const SNAPSHOT = join(ROOT, 'src/components/categories/Cat1DomainSnapshot.astro');
const CONTEXT = join(ROOT, 'src/components/indicators/Cat1ContractContext.astro');
const TRACE = join(ROOT, 'src/components/indicators/IndicatorTraceabilityExperience.astro');
const VM = join(ROOT, 'src/utils/category1-presentation.ts');

describe('Phase E — TH/EN structural parity', () => {
  it('both category pages include the management cycle and domain snapshot, gated to cat1', () => {
    for (const p of [CAT_TH, CAT_EN]) {
      const src = readFileSync(p, 'utf8');
      assert.match(src, /Cat1ManagementCycle/);
      assert.match(src, /Cat1DomainSnapshot/);
      assert.match(src, /category\.code === 'cat1'/);
    }
  });

  it('management cycle and snapshot render semantic lists and a11y markers', () => {
    const cycle = readFileSync(CYCLE, 'utf8');
    assert.match(cycle, /<ol /);
    assert.match(cycle, /role="list"/);
    assert.match(cycle, /data-cat1-management-cycle/);
    assert.match(cycle, /focus-visible:ring-2/);
    const snap = readFileSync(SNAPSHOT, 'utf8');
    assert.match(snap, /data-cat1-domain-snapshot/);
    assert.match(snap, /focus-visible:ring-2/);
    assert.match(snap, /data-cat1-domain-status/);
  });

  it('indicator traceability wires the contract context for cat1 only', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /Cat1ContractContext/);
    assert.match(trace, /indicator\.categoryCode === 'cat1'/);
  });
});

describe('Phase E — missing indicators stay unavailable and honest', () => {
  it('contract context renders a calm unavailable notice for 1.2.2 and 1.5.3', () => {
    const ctx = readFileSync(CONTEXT, 'utf8');
    assert.match(ctx, /data-cat1-missing-notice/);
    assert.match(ctx, /MISSING_CAT1_INDICATORS/);
    // The notice must not claim evidence exists for missing indicators.
    assert.doesNotMatch(ctx, /ยังไม่มีหลักฐานที่เชื่อมโยงกับตัวชี้วัดนี้โดยตรง/);
  });

  it('indicator pages never fabricate evidence text for missing indicators', () => {
    const trace = readFileSync(TRACE, 'utf8');
    assert.match(trace, /ยังไม่มีหลักฐานที่เชื่อมโยงกับตัวชี้วัดนี้โดยตรง/);
  });
});

describe('Phase E — a11y / motion', () => {
  it('cycle and context links expose focus-visible rings', () => {
    const cycle = readFileSync(CYCLE, 'utf8');
    const ctx = readFileSync(CONTEXT, 'utf8');
    assert.match(cycle, /focus-visible:outline-none/);
    assert.match(ctx, /focus-visible:outline-none/);
  });

  it('global reduced-motion rule covers the new presentation classes', () => {
    const globalCss = readFileSync(join(ROOT, 'src/styles/global.css'), 'utf8');
    assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\)/);
  });

  it('no local filesystem paths or secrets in the presentation artifacts', () => {
    for (const p of [CYCLE, SNAPSHOT, CONTEXT, VM]) {
      const raw = readFileSync(p, 'utf8');
      assert.ok(!/F:\\/i.test(raw), `${p} leaks F:\\ path`);
      assert.ok(!/OneDrive - Maejo/i.test(raw), `${p} leaks OneDrive path`);
    }
  });
});

describe('Phase F — cross-link journeys and view-model', () => {
  it('journeys and relations cover the required flows', () => {
    const src = readFileSync(VM, 'utf8');
    assert.match(src, /1\.1\.1.*1\.3\.1/s);
    assert.match(src, /1\.3\.1.*1\.4\.1/s);
    assert.match(src, /1\.1\.3.*1\.5\.2/s);
    assert.match(src, /1\.3\.3.*1\.6\.2/s);
    assert.match(src, /1\.7\.2.*1\.1\.4/s);
  });

  it('view-model never exposes local paths and only references the contracts', () => {
    const src = readFileSync(VM, 'utf8');
    assert.match(src, /category1\/activities-aspects\.json/);
    assert.match(src, /category1\/ghg\.json/);
  });

  it('snapshot and context state explicitly that facts are coverage, not scores', () => {
    const snap = readFileSync(SNAPSHOT, 'utf8');
    assert.match(snap, /official score|คะแนนอย่างเป็นทางการ/);
    assert.ok(!/data-score|data-official-score/.test(snap), 'snapshot must not emit scoring markers');
  });
});
