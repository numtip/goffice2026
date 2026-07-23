#!/usr/bin/env node

/**
 * generate-canonical-data.mjs
 * ============================
 * One-time regeneration of canonical generated JSON with the enhanced schema.
 *
 * Reads existing src/data/generated/*.json files, enriches them with:
 *   - relatedIndicators (criteria mapping)
 *   - targetStatus (derived from target data)
 *   - quality fields on year data
 *   - Deterministic output (no runtime timestamps in data)
 *
 * Run: node scripts/generate-canonical-data.mjs
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const GENERATED_DIR = join(PROJECT_ROOT, 'src', 'data', 'generated');

const CRITERIA_MAP = {
  water:   [{ indicatorId: '3.1.2', label: 'Water consumption', labelTh: 'การใช้น้ำ', relevance: 'primary' }],
  energy:  [{ indicatorId: '3.2.2', label: 'Electricity consumption', labelTh: 'การใช้พลังงานไฟฟ้า', relevance: 'primary' }],
  fuel:    [{ indicatorId: '3.2.5', label: 'Fuel consumption', labelTh: 'การใช้เชื้อเพลิง', relevance: 'primary' }],
  paper:   [{ indicatorId: '3.3.2', label: 'Paper consumption', labelTh: 'การใช้กระดาษ', relevance: 'primary' }],
  waste:   [
    { indicatorId: '4.1.x', label: 'Waste management', labelTh: 'การจัดการของเสีย', relevance: 'primary' },
  ],
  ghg:     [
    { indicatorId: '1.5.1', label: 'GHG emissions (Scope 1,2,3)', labelTh: 'ก๊าซเรือนกระจก', relevance: 'primary' },
    { indicatorId: '1.5.2', label: 'GHG reduction target', labelTh: 'เป้าหมายลดก๊าซเรือนกระจก', relevance: 'supporting' },
  ],
};

const RECONCILIATION_TOLERANCE = {
  'kWh': 5,
  'm³': 0.5,
  'L': 0.5,
  'kg': 0.5,
  '%': 0.5,
  'tCO₂e': 0.5,
};

function readJSON(filePath) {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function resolveTargetStatus(target) {
  if (!target || target.targetValue === null || target.targetValue === undefined) return 'no-target';
  return 'insufficient-data';
}

function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Canonical Data Regeneration                 ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  const files = readdirSync(GENERATED_DIR).filter(f => f.endsWith('.json') && !f.includes('kpi-summary') && !f.includes('data-quality'));

  for (const file of files) {
    const filePath = join(GENERATED_DIR, file);
    const data = readJSON(filePath);
    if (!data) {
      console.error(`❌ Could not read ${file}`);
      continue;
    }

    const metric = data.metric;
    const unit = data.unit;

    console.log(`📄 ${file} (${metric})`);

    // 1. Add relatedIndicators if missing
    if (!data.relatedIndicators || data.relatedIndicators.length === 0) {
      data.relatedIndicators = CRITERIA_MAP[metric] || [];
      console.log(`   ➕ Added relatedIndicators: ${data.relatedIndicators.map(i => i.indicatorId).join(', ')}`);
    }

    // 2. Add sourceEvidence if missing
    if (!data.sourceEvidence) {
      data.sourceEvidence = [];
    }

    // 3. Add targetStatus if missing
    if (!data.targetStatus) {
      data.targetStatus = resolveTargetStatus(data.target);
      console.log(`   ➕ Added targetStatus: ${data.targetStatus}`);
    }

    // 4. Add quality to each year entry
    if (data.years) {
      for (const [yearStr, yearData] of Object.entries(data.years)) {
        if (!yearData.quality) {
          // Reconcile: check if total matches months sum
          if (yearData.months && yearData.months.length > 0) {
            const calcTotal = Math.round(yearData.months.reduce((s, m) => s + m.value, 0) * 100) / 100;
            const storedTotal = Math.round(yearData.total * 100) / 100;
            const diff = Math.abs(calcTotal - storedTotal);
            const warnings = [];
            const tolerance = RECONCILIATION_TOLERANCE[unit] || 0.5;
            if (diff > tolerance) {
              warnings.push(`Calculated total (${calcTotal}) differs from stored total (${storedTotal}) by ${(calcTotal - storedTotal).toFixed(2)}`);
            }
            // Check for placeholder data indicators
            if (yearData.source && yearData.source.includes('placeholder')) {
              warnings.push('Data may contain placeholder values — verify against source workbook');
            }
            yearData.quality = {
              valid: warnings.length === 0,
              warnings,
              reconciliationDifference: Math.round((calcTotal - storedTotal) * 100) / 100,
            };
          } else {
            yearData.quality = { valid: true, warnings: ['No monthly data to reconcile'], reconciliationDifference: null };
          }
          console.log(`   ➕ Added quality for ${yearStr}: ${yearData.quality.valid ? '✅ valid' : '⚠ warnings'}`);
        }

        // 5. Clean up source paths (remove absolute paths)
        if (yearData.source) {
          yearData.source = yearData.source.replace(/[A-Z]:\\[^,]+\\/gi, '');
        }
      }
    }

    // 6. Add labelTh if missing
    const LABEL_TH = {
      energy: 'การใช้ไฟฟ้า',
      water: 'การใช้น้ำ',
      fuel: 'การใช้เชื้อเพลิง',
      paper: 'การใช้กระดาษ',
      waste: 'การจัดการของเสีย',
      ghg: 'ก๊าซเรือนกระจก',
    };
    if (!data.labelTh) {
      data.labelTh = LABEL_TH[metric] || data.label;
      console.log(`   ➕ Added labelTh: ${data.labelTh}`);
    }

    // 7. Ensure yoyChange is present
    if (!data.yoyChange) {
      const bYear = data.years?.[String(data.baselineYear)];
      const cYear = data.years?.[String(data.currentYear)];
      if (bYear && cYear) {
        const absolute = cYear.total - bYear.total;
        const percent = bYear.total !== 0 ? Math.round((absolute / bYear.total) * 100) : 0;
        const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'stable';
        data.yoyChange = { absolute, percent, direction };
        console.log(`   ➕ Computed yoyChange: ${direction} (${percent}%)`);
      }
    }

    writeJSON(filePath, data);
    console.log(`   ✅ Updated ${file}`);
    console.log();
  }

  // Generate KPI summary
  console.log('📊 Generating KPI Summary...');
  const metrics = files.map(f => readJSON(join(GENERATED_DIR, f))).filter(Boolean);
  const kpiEntries = metrics.map(m => {
    const cYear = m.years?.[String(m.currentYear)];
    const bYear = m.years?.[String(m.baselineYear)];
    return {
      metric: m.metric,
      label: m.label,
      labelTh: m.labelTh || m.label,
      unit: m.unit,
      yearBE: m.currentYear,
      value: cYear?.total ?? null,
      target: m.target?.targetValue ?? null,
      targetStatus: m.targetStatus || 'no-target',
      baselineValue: bYear?.total ?? null,
      yoyChange: m.yoyChange || null,
      dataQuality: cYear?.quality || null,
      sourceFile: cYear?.source?.split('(')[0]?.trim() || '',
    };
  });

  writeJSON(join(GENERATED_DIR, 'kpi-summary.json'), {
    generatedFrom: 'canonical-metrics',
    metrics: kpiEntries,
  });
  console.log('   ✅ kpi-summary.json generated');

  // Generate data quality summary
  const qualityEntries = [];
  for (const m of metrics) {
    if (m.years) {
      for (const [yearStr, yearData] of Object.entries(m.years)) {
        qualityEntries.push({
          metric: m.metric,
          yearBE: Number(yearStr),
          valid: yearData.quality?.valid !== false,
          warnings: yearData.quality?.warnings || [],
          reconciliationDifference: yearData.quality?.reconciliationDifference ?? null,
          monthCount: yearData.months?.length || 0,
          dataStatus: yearData.dataStatus,
        });
      }
    }
  }

  writeJSON(join(GENERATED_DIR, 'data-quality.json'), {
    generatedFrom: 'canonical-metrics',
    totalMetrics: metrics.length,
    metricsWithWarnings: qualityEntries.filter(e => e.warnings.length > 0).length,
    metricsWithErrors: qualityEntries.filter(e => !e.valid).length,
    entries: qualityEntries,
  });
  console.log('   ✅ data-quality.json generated');

  console.log('\n✅ All canonical data regenerated successfully.');
}

main();
