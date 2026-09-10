/**
 * Resource XLSX source-file publication contract.
 *
 * Covers all six resource domains (water, electricity, fuel, paper, waste, GHG):
 *   - public-static hrefs exist under public/
 *   - stale alias XLSX paths are never rendered
 *   - internal-metadata-only never yields a local download
 *   - TH/EN evidence pages pass publicationMode
 *   - SHA/provenance remains traceable
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const EVIDENCE = join(ROOT, 'src/data/evidence-index.json');
const MAP = join(ROOT, 'src/data/resource-source-files.json');
const REGISTRY = join(ROOT, 'src/data/document-registry.json');
const PANEL = join(ROOT, 'src/components/evidence/EvidenceSourcePanel.astro');
const TRACE = join(ROOT, 'src/utils/evidence-traceability.ts');
const TH_PAGE = join(ROOT, 'src/pages/evidence/[id].astro');
const EN_PAGE = join(ROOT, 'src/pages/en/evidence/[id].astro');
const TH_INDEX = join(ROOT, 'src/pages/evidence.astro');
const EN_INDEX = join(ROOT, 'src/pages/en/evidence/index.astro');

function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function publicFileFromSitePath(sitePath) {
  if (!sitePath) return null;
  const cleaned = sitePath.split('?')[0].split('#')[0];
  if (!cleaned.startsWith('/documents/')) return null;
  const rel = cleaned.replace(/^\//, '');
  const candidates = [join(ROOT, 'public', rel)];
  try {
    const decoded = decodeURIComponent(rel);
    if (decoded !== rel) candidates.push(join(ROOT, 'public', decoded));
  } catch {
    /* ignore */
  }
  for (const abs of candidates) {
    if (existsSync(abs)) return abs;
  }
  return null;
}

function resolvePublicDocumentHref(item) {
  if (item.status === 'placeholder') return null;
  if (item.publicationMode === 'internal-metadata-only') return null;
  if (item.publicationMode === 'authenticated-link') return null;
  if (item.publicationMode === 'public-metadata-pending-copy') return null;
  if (item.publicationMode !== 'public-static') return null;
  if (!item.path) return null;
  if (!publicFileFromSitePath(item.path)) return null;
  return item.path;
}

const map = JSON.parse(readFileSync(MAP, 'utf8'));
const items = JSON.parse(readFileSync(EVIDENCE, 'utf8')).items;
const byId = new Map(items.map((i) => [i.id, i]));
const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'));

function flattenDomainFiles(domain) {
  const rows = [
    {
      metric: domain.metric,
      workbook: domain.canonicalWorkbook,
      sha256: domain.sha256,
      evidenceId: domain.evidenceId,
      publicPath: domain.publicPath,
      stagingPath: domain.stagingPath,
      years: domain.yearsCovered,
    },
  ];
  if (domain.currentYearWorkbook) {
    const cur = domain.currentYearWorkbook;
    rows.push({
      metric: domain.metric,
      workbook: cur.canonicalWorkbook,
      sha256: cur.sha256,
      evidenceId: cur.evidenceId,
      publicPath: cur.publicPath,
      stagingPath: cur.stagingPath,
      years: cur.yearsCovered,
    });
  }
  return rows;
}

const publishedRows = map.domains.flatMap(flattenDomainFiles);

describe('six-resource source workbook map', () => {
  it('covers water, electricity, fuel, paper, waste, ghg', () => {
    const metrics = map.domains.map((d) => d.metric).sort();
    assert.deepEqual(metrics, ['electricity', 'fuel', 'ghg', 'paper', 'waste', 'water']);
  });

  it('every mapped workbook exists, matches SHA-256, and has an evidence record', () => {
    for (const row of publishedRows) {
      const staging = join(ROOT, row.stagingPath);
      assert.ok(existsSync(staging), `${row.workbook} missing at ${row.stagingPath}`);
      assert.equal(sha256File(staging), row.sha256, `${row.workbook} staging SHA mismatch`);
      const published = publicFileFromSitePath(row.publicPath);
      assert.ok(published, `${row.workbook} public path missing: ${row.publicPath}`);
      assert.equal(sha256File(published), row.sha256, `${row.workbook} public SHA mismatch`);
      const ev = byId.get(row.evidenceId);
      assert.ok(ev, `missing evidence ${row.evidenceId}`);
      assert.equal(ev.publicationMode, 'public-static', `${row.evidenceId} must be public-static`);
      assert.equal(ev.path, row.publicPath, `${row.evidenceId} path must be the publishable file`);
      assert.equal(resolvePublicDocumentHref(ev), row.publicPath);
      assert.equal(ev.manifestSha256, row.sha256);
    }
  });

  it('privacy review withholds nothing for these workbooks', () => {
    assert.deepEqual(map.privacyReview.withheld, []);
  });
});

describe('public-static evidence paths exist on disk', () => {
  it('every rendered public-static evidence path exists under public/', () => {
    const missing = [];
    for (const item of items) {
      if (item.publicationMode !== 'public-static') continue;
      if (item.status === 'placeholder') continue;
      if (!item.path) {
        missing.push(`${item.id} public-static without path`);
        continue;
      }
      if (!publicFileFromSitePath(item.path)) {
        missing.push(`${item.id} -> ${item.path}`);
      }
    }
    assert.deepEqual(missing, []);
  });
});

describe('stale XLSX aliases never render', () => {
  it('no public-static evidence uses a stale/nonexistent alias', () => {
    for (const alias of map.staleAliasPaths) {
      const rendered = items.filter(
        (i) => i.publicationMode === 'public-static' && i.path === alias,
      );
      assert.equal(rendered.length, 0, `stale alias still public-static: ${alias}`);
      assert.equal(publicFileFromSitePath(alias), null, `stale alias unexpectedly exists: ${alias}`);
    }
  });

  it('GHG inventory and EF share the canonical FY2568 workbook path', () => {
    const inv = byId.get('ev-ghg-inventory-2025');
    const ef = byId.get('ev-ghg-emission-factors');
    assert.equal(inv.path, map.domains.find((d) => d.metric === 'ghg').publicPath);
    assert.equal(ef.path, inv.path);
    assert.equal(inv.publicationMode, 'public-static');
    assert.equal(ef.publicationMode, 'public-static');
    assert.doesNotMatch(inv.path, /ghg-inventory-2025/);
    assert.doesNotMatch(inv.realSourcePath, /1\.6_GreenhouseGas/);
  });
});

describe('internal-metadata-only never renders a local download', () => {
  it('resolver returns null for every internal-metadata-only row', () => {
    const internals = items.filter((i) => i.publicationMode === 'internal-metadata-only');
    assert.ok(internals.length > 0);
    for (const item of internals) {
      assert.equal(resolvePublicDocumentHref(item), null, item.id);
    }
  });

  it('realSourceAvailable true is not treated as a publishable path', () => {
    const panel = readFileSync(PANEL, 'utf8');
    const util = readFileSync(TRACE, 'utf8');
    assert.match(util, /isInternalMetadataOnly/);
    assert.match(util, /isPublicStaticMode/);
    assert.match(util, /realSourceAvailable is not proof/);
    assert.match(panel, /publicationMode/);
    assert.match(panel, /describeEvidencePublication/);
    assert.match(panel, /data-source-link="internal-metadata-only"/);
    assert.doesNotMatch(panel, /hasStaticLink = !isPlaceholder && !sourceOffline && Boolean\(path\)/);
  });
});

describe('TH/EN parity', () => {
  it('detail pages pass publicationMode into EvidenceSourcePanel', () => {
    const th = readFileSync(TH_PAGE, 'utf8');
    const en = readFileSync(EN_PAGE, 'utf8');
    for (const src of [th, en]) {
      assert.match(src, /publicationMode=\{raw\.publicationMode\}/);
      assert.match(src, /EvidenceSourcePanel/);
    }
  });

  it('evidence index pages exist in both locales', () => {
    assert.ok(existsSync(TH_INDEX));
    assert.ok(existsSync(EN_INDEX));
  });
});

describe('paper mapping', () => {
  it('paper resource evidence maps to 3.3.2 only, never 1.4.1', () => {
    const paper = byId.get('ev-resource-xlsx-paper');
    assert.ok(paper);
    assert.deepEqual(paper.indicatorCodes, ['3.3.2']);
    assert.ok(!paper.indicatorCodes.includes('1.4.1'));
    const paperDocs = registry.documents.filter((d) => d.evidenceId === 'ev-resource-xlsx-paper');
    assert.ok(paperDocs.length >= 1);
    assert.equal(paperDocs[0].registryLinkStatus, 'linked');
  });
});

describe('all six resource source-file links are covered', () => {
  it('each dashboard domain has at least one public-static XLSX evidence row', () => {
    const required = {
      water: 'ev-resource-xlsx-water',
      electricity: 'ev-resource-xlsx-electricity',
      fuel: 'ev-resource-xlsx-fuel',
      paper: 'ev-resource-xlsx-paper',
      waste: 'ev-resource-xlsx-waste-fy2568',
      ghg: 'ev-ghg-inventory-2025',
    };
    for (const [metric, id] of Object.entries(required)) {
      const ev = byId.get(id);
      assert.ok(ev, `${metric} missing ${id}`);
      assert.equal(ev.fileType, 'XLSX');
      assert.equal(ev.publicationMode, 'public-static');
      assert.ok(publicFileFromSitePath(ev.path), `${id} file missing`);
    }
  });

  it('operational resource-xlsx IDs stay outside frozen assessment contracts', () => {
    const helper = readFileSync(join(ROOT, 'scripts/lib/resource-source-publication.mjs'), 'utf8');
    assert.match(helper, /isResourceSourcePublicationEvidence/);
    const cat3 = readFileSync(join(ROOT, 'scripts/validate-category3-fy2569.mjs'), 'utf8');
    const cat4 = readFileSync(join(ROOT, 'scripts/validate-category4-contracts.mjs'), 'utf8');
    assert.match(cat3, /isResourceSourcePublicationEvidence/);
    assert.match(cat4, /isResourceSourcePublicationEvidence/);
  });
});
