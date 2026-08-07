#!/usr/bin/env node
/**
 * publish-gate.mjs — GO-DATA-5 Publish Gate
 * =========================================
 * Validated data changes must be reviewable BEFORE production publish.
 *
 * Flow (reuses the existing sync/build/validation pipeline):
 *   1. Sync:        node scripts/sync-all.mjs  (--skip-sync to evaluate existing state)
 *   2. Detect:      git diff of generated data (src/data/generated, data/import,
 *                   data/staging/manifest.json, extract-sources.json) vs HEAD
 *   3. Summarize:   per-metric state transition / months added-removed / totals
 *   4. Preview:     astro build (dist is the preview candidate)
 *   5. Validate:    node scripts/validate-platform.mjs (post-build dist checks)
 *   6. Status:      PASS | NO_CHANGE | BLOCKED  → report at data/publish-gate/latest.json
 *
 * Exit codes: 0 = PASS or NO_CHANGE (publishable / nothing to publish)
 *             1 = BLOCKED (sync/build/validation failure — publish NOT permitted)
 *
 * No automatic production deploy — publishing remains a manual, reviewed step.
 *
 * Usage:
 *   node scripts/publish-gate.mjs
 *   node scripts/publish-gate.mjs --skip-sync
 *   node scripts/publish-gate.mjs --json
 *   node scripts/publish-gate.mjs --source=<dir> --out=<dir> --manifest=<path>   (rehearsal)
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const GENERATED_DIR = 'src/data/generated';
const IMPORT_DIR = 'data/import';
const WATCH_PATHS = [GENERATED_DIR, IMPORT_DIR, 'data/staging/manifest.json', 'data/staging/extract-sources.json'];
const REPORT_DIR = join(ROOT, 'data', 'publish-gate');
const REPORT_PATH = join(REPORT_DIR, 'latest.json');
const METRIC_FILES = ['energy.json', 'water.json', 'fuel.json', 'paper.json', 'waste.json', 'recycling_rate.json', 'ghg.json'];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: opts.capture ? 'pipe' : 'inherit' });
  return {
    ok: r.status === 0,
    status: r.status,
    stdout: opts.capture ? (r.stdout ?? '') : '',
    stderr: opts.capture ? (r.stderr ?? '') : '',
  };
}
const git = (args) => run('git', args, { capture: true });
const nodeRun = (script, args = []) => run(process.execPath, [join(__dirname, script), ...args]);

/** Changed generated-data files vs HEAD (tracked paths only). */
function changedFiles() {
  const r = git(['status', '--porcelain', '--', ...WATCH_PATHS]);
  return (r.stdout || '')
    .split('\n').filter(Boolean)
    .map((line) => ({ state: line.slice(0, 2).trim(), path: line.slice(3) }))
    .filter((f) => WATCH_PATHS.some((w) => f.path === w || f.path.startsWith(w + '/')));
}

function headVersion(rel) {
  const r = git(['show', `HEAD:${rel}`]);
  if (!r.ok) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

function metricSummary(rel, file) {
  const cur = JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
  const head = headVersion(rel);
  const year = String(cur.currentYear);
  const snap = (d) => {
    if (!d || !d.years || !d.years[year]) return null;
    const y = d.years[year];
    return {
      datasetState: y.datasetState ?? null,
      latestDataMonth: y.latestDataMonth ?? null,
      months: (y.months ?? []).map((m) => m.month).sort((a, b) => a - b),
      total: y.total ?? null,
      dataClassification: y.dataClassification ?? null,
    };
  };
  const before = snap(head);
  const after = snap(cur);
  const mb = before?.months ?? [];
  const ma = after?.months ?? [];
  return {
    metric: file.replace('.json', ''),
    year: Number(year),
    stateBefore: before?.datasetState ?? 'n/a',
    stateAfter: after?.datasetState ?? 'n/a',
    latestBefore: before?.latestDataMonth ?? null,
    latestAfter: after?.latestDataMonth ?? null,
    monthsBefore: mb,
    monthsAfter: ma,
    addedMonths: ma.filter((m) => !mb.includes(m)),
    removedMonths: mb.filter((m) => !ma.includes(m)),
    totalAfter: after?.total ?? null,
  };
}

function printSummary(metrics) {
  console.log('\n── Change summary (generated data vs HEAD) ──────────────');
  for (const m of metrics) {
    const add = m.addedMonths.length ? ` +${m.addedMonths.join(',')}` : '';
    const rem = m.removedMonths.length ? ` -${m.removedMonths.join(',')}` : '';
    console.log(
      `  ${m.metric.padEnd(14)} ${String(m.stateBefore).padEnd(18)} → ${String(m.stateAfter).padEnd(18)}` +
      ` | latest ${m.latestBefore ?? '-'}→${m.latestAfter ?? '-'} | months[${m.monthsAfter.join(',')}]${add}${rem}` +
      ` | total ${m.totalAfter ?? '-'}`
    );
  }
}

function main() {
  const argv = process.argv.slice(2);
  const skipSync = argv.includes('--skip-sync');
  const jsonOut = argv.includes('--json');
  const passthrough = argv.filter((a) => /^--(source|out|manifest)=/.test(a));

  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  Publish Gate — GO-DATA-5 (review before publish)    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  const baseline = git(['rev-parse', '--short', 'HEAD']).stdout || 'unknown';
  console.log(`Baseline: ${baseline}`);

  const report = { schema: 'GO-DATA-5-PUBLISH-GATE/1', generatedAt: new Date().toISOString(), baseline };
  const steps = { sync: 'SKIPPED', diffDetected: false, previewBuild: 'SKIPPED', validation: 'SKIPPED' };
  const failures = [];
  let status;

  // ── 1. Sync (reuse sync-all.mjs) ────────────────────────────────────────
  if (!skipSync) {
    console.log('\n[1/5] Sync — OneDrive → staging → extract → build…');
    const ok = nodeRun('sync-all.mjs', passthrough).ok;
    steps.sync = ok ? 'OK' : 'FAILED';
    if (!ok) {
      failures.push('sync-all.mjs failed — source data not staged/validated');
      status = 'BLOCKED';
    }
  } else {
    console.log('\n[1/5] Sync — SKIPPED (--skip-sync).');
  }

  // ── 2. Detect generated-data diff ───────────────────────────────────────
  if (!status) {
    console.log('\n[2/5] Detecting generated-data diff vs HEAD…');
    const changed = changedFiles();
    steps.diffDetected = changed.length > 0;
    report.changedFiles = changed;

    if (changed.length === 0) {
      status = 'NO_CHANGE';
      console.log('  No generated-data changes vs HEAD — nothing to publish.');
    } else {
      console.log(`  ${changed.length} changed file(s):`);
      for (const c of changed) console.log(`    ${c.state}  ${c.path}`);
      report.metrics = METRIC_FILES
        .map((f) => metricSummary(`${GENERATED_DIR}/${f}`, f))
        .filter((m) => m && changed.some((c) => c.path === `${GENERATED_DIR}/${m.metric}.json`));
      printSummary(report.metrics);
    }
  }

  // ── 3. Build preview candidate + 4. validate (only when a change exists) ──
  if (status === undefined) {
    console.log('\n[3/5] Building preview candidate (astro build → dist)…');
    const buildOk = run(process.execPath, [join(ROOT, 'node_modules', 'astro', 'astro.js'), 'build']).ok;
    steps.previewBuild = buildOk ? 'OK' : 'FAILED';
    if (!buildOk) {
      failures.push('astro build failed — preview candidate not produced');
      status = 'BLOCKED';
    }

    if (!status) {
      console.log('\n[4/5] Validating (validate-platform.mjs on dist)…');
      const valOk = nodeRun('validate-platform.mjs').ok;
      steps.validation = valOk ? 'OK' : 'FAILED';
      if (!valOk) {
        failures.push('validate-platform.mjs failed — dist did not pass platform validation');
        status = 'BLOCKED';
      } else {
        status = 'PASS';
      }
    }
  }

  // ── 5. Status + report ───────────────────────────────────────────────────
  report.status = status;
  report.steps = steps;
  report.failures = failures;
  if (!report.metrics) report.metrics = [];
  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf-8');

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  PUBLISH STATUS: ${status}${status === 'BLOCKED' ? '  (publish NOT permitted)' : ''}`);
  console.log(`  Steps: sync=${steps.sync} diff=${steps.diffDetected} build=${steps.previewBuild} validate=${steps.validation}`);
  if (failures.length) console.log(`  Failures:\n    ${failures.join('\n    ')}`);
  console.log(`  Report: ${REPORT_PATH}`);
  console.log('══════════════════════════════════════════════════════');
  if (status === 'PASS') {
    console.log('\n✅ Gate PASS — changes are validated and reviewable. Publish manually after review (no auto deploy).');
  } else if (status === 'NO_CHANGE') {
    console.log('\nℹ No changes to publish.');
  } else {
    console.error('\n❌ Gate BLOCKED — publish is not permitted until the issues above are resolved.');
  }

  if (jsonOut) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  process.exit(status === 'BLOCKED' ? 1 : 0);
}

main();
