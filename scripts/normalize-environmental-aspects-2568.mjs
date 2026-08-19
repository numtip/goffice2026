#!/usr/bin/env node

/**
 * normalize-environmental-aspects-2568.mjs
 * =========================================
 * Phase C normalizer for the CAT1-1.3 canonical data pipeline.
 *
 * Source (READ-ONLY): docs/ผลประเมินปัญหา2568.xlsx
 * Output:            src/data/category1/environmental-aspects-2568.json
 *
 * Pipeline per the task GOAL:
 *   workbook → source/version disposition → normalize → validate →
 *   environmental-aspects-2568.json → 1.3.1 / 1.3.2 / 1.3.3 views
 *
 * Guardrails enforced here:
 *   - Source workbook is never written.
 *   - Canonical Output priority version is `จัดลำดับ(Output) (29 สค68)`
 *     (evidence-based disposition, see docs/data/GO-CAT1-ENV-ASPECTS-2568-DISPOSITION.md);
 *     the superseded `จัดลำดับ(Output)` sheet is excluded from record creation.
 *   - The FY2567 label leak (Output!A2) is recorded as an anomaly, never as data.
 *   - Significance = priority-sheet classification when the aspect appears in the
 *     canonical priority sheet; otherwise the register classification. No formula
 *     is invented; source classifications are preserved and flagged.
 *   - projectReference is only emitted when the control text names a project that
 *     exists in the canonical projects.json contract (documentary link).
 *   - No FY2569 claims; every record carries year 2568.
 *
 * Usage: node scripts/normalize-environmental-aspects-2568.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const WORKBOOK_PATH = resolve(ROOT, 'docs', 'ผลประเมินปัญหา2568.xlsx');
const OUTPUT_PATH = resolve(ROOT, 'src', 'data', 'category1', 'environmental-aspects-2568.json');
const PROJECTS_PATH = resolve(ROOT, 'src', 'data', 'category1', 'projects.json');

const SOURCE_FILE_REL = 'docs/ผลประเมินปัญหา2568.xlsx';

const SHEETS = {
  PROCESS: 'ตารางวิเคราะห์กระบวนการ',
  INPUT_REG: 'Input',
  OUTPUT_REG: 'Output',
  PRIORITY_INPUT: 'จัดลำดับ (Input)',
  PRIORITY_OUTPUT: 'จัดลำดับ(Output) (29 สค68)',
  SUPERSEDED_OUTPUT: 'จัดลำดับ(Output)',
};

const IMPACT_LEGEND = {
  input: {
    C: { code: 'EL', meaning: 'Electric ไฟฟ้า' },
    D: { code: 'W', meaning: 'Water น้ำ' },
    E: { code: 'FG', meaning: 'Fuel/Gas เชื้อเพลิง' },
    F: { code: 'RM', meaning: 'Raw material วัตถุดิบ' },
  },
  output: {
    C: { code: 'AP', meaning: 'Air Pollution มลพิษอากาศ' },
    D: { code: 'WP', meaning: 'Water Pollution มลพิษทางน้ำ' },
    E: { code: 'NP', meaning: 'Noise Pollution มลพิษเสียง' },
    F: { code: 'WA', meaning: 'Waste ขยะ/ของเสีย' },
  },
};

const CONDITION_MAP = { N: 'normal', A: 'abnormal', E: 'emergency' };
const PRIORITY_CONDITION_MAP = {
  ปกติ: 'normal',
  สภาวะปกติ: 'normal',
  ผิดปกติ: 'abnormal',
  'สภาวะผิดปกติ': 'abnormal',
  ฉุกเฉิน: 'emergency',
  'สภาวะฉุกเฉิน': 'emergency',
};
const PRIORITY_DIRECT_MAP = { ทางตรง: 'direct', ทางอ้อม: 'indirect' };

const LEGEND_MARKERS = [
  'ประเมินปัญหาสิ่งแวดล้อมด้านมลพิษ',
  'ปัญหาตามประเภทกิจกรรม',
  'จัดทำโดย',
  'ตรวจสอบโดย',
  'อนุมัติโดย',
  'D = ปัญหาสิ่งแวดล้อมทางตรง',
  'I = ปัญหาสิ่งแวดล้อมทางอ้อม',
  'N = สภาวะปกติ',
  'A = สภาวะผิดปกติ',
  'E = สภาวะฉุกเฉิน',
  'กฎหมาย Y =',
  'EL = Electric',
  'W = Water',
  'RM = Raw material',
  'AP = Air Pollution',
  'WP = Water Pollution',
  'NP = Noise Pollution',
  'WA- Waste',
  'WA = Waste',
  'F/G = Fuel',
  'C/F = Fuel',
];

// ── Normalization helpers ────────────────────────────────────────

/** Collapse all whitespace (incl. Thai space), full-width → half-width, lower-case. */
function norm(s) {
  return String(s ?? '')
    .replace(/\s+/g, '')
    .replace(/[\uFF01-\uFF5E]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .toLowerCase();
}

/** norm() plus removal of parenthetical groups (handles activity-name variants). */
function normBase(s) {
  let out = String(s ?? '');
  for (let i = 0; i < 5; i += 1) {
    const next = out.replace(/\([^()]*\)/g, '').replace(/（[^（）]*）/g, '');
    if (next === out) break;
    out = next;
  }
  return norm(out);
}

function isMark(v) {
  return v !== null && v !== undefined && String(v).trim() !== '';
}

function num(v) {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isLegendRow(row) {
  const joined = (row || [])
    .map((c) => String(c ?? ''))
    .join('|');
  return LEGEND_MARKERS.some((m) => joined.includes(m));
}

// ── Sheet readers ────────────────────────────────────────────────

function rowsOf(sheet) {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });
}

/**
 * Read a register sheet (Input/Output) into raw aspect rows with
 * forward-filled activity names.
 * @param {Array} data   sheet rows (0-based)
 * @param {number} firstDataRowIndex  first 0-based data row
 */
function readRegisterRows(data, firstDataRowIndex, kind) {
  const impactCols = Object.keys(IMPACT_LEGEND[kind]); // ['C','D','E','F'] → indices 2..5
  const impactIndexes = impactCols.map((c) => c.charCodeAt(0) - 65);
  let currentActivity = null;
  const rows = [];
  const warnings = [];

  for (let r = firstDataRowIndex; r < data.length; r += 1) {
    const row = data[r] || [];
    if (isLegendRow(row)) continue;
    const aRaw = row[0];
    const bRaw = row[1];
    if (aRaw && !LEGEND_MARKERS.some((m) => String(aRaw).includes(m))) {
      currentActivity = String(aRaw).replace(/\s+/g, ' ').trim();
    }
    if (!bRaw || String(bRaw).trim() === '') continue;
    if (LEGEND_MARKERS.some((m) => String(bRaw).includes(m))) continue;

    const aspect = String(bRaw).replace(/\s+/g, ' ').trim();
    const impactIdx = impactIndexes.findIndex((i) => isMark(row[i]));
    const impact = impactIdx !== -1 ? impactCols[impactIdx] : null;

    const dirMark = isMark(row[6]);
    const indirMark = isMark(row[7]);
    let directIndirect = null;
    if (dirMark && !indirMark) directIndirect = 'direct';
    else if (indirMark && !dirMark) directIndirect = 'indirect';
    else {
      warnings.push(`${SHEETS[kind === 'input' ? 'INPUT_REG' : 'OUTPUT_REG']} R${r + 1} D/I marks: D=${dirMark}, I=${indirMark}`);
      directIndirect = dirMark ? 'direct' : indirMark ? 'indirect' : null;
    }

    const condRaw = row[8];
    const condition = CONDITION_MAP[String(condRaw ?? '').trim()] ?? null;

    const lawY = isMark(row[9]);
    const lawN = isMark(row[10]);
    let applicableLaw = null;
    if (lawY && !lawN) applicableLaw = 'Y';
    else if (lawN && !lawY) applicableLaw = 'N';
    else if (lawY && lawN) {
      warnings.push(`${kind} R${r + 1} both law Y and N marked`);
      applicableLaw = 'Y';
    }

    // likelihood / severity / risk / significance columns differ per kind
    const cfg =
      kind === 'input'
        ? { likelihoodStart: 11, likelihoodEnd: 16, likelihoodTotal: 16, severityStart: 17, severityEnd: 20, severityTotal: 20, risk: 21, sigCols: [22, 23, 24], control: 25 }
        : { likelihoodStart: 11, likelihoodEnd: 18, likelihoodTotal: 18, severityStart: 19, severityEnd: 23, severityTotal: 23, risk: 24, sigCols: [25, 26, 27], control: 28 };

    const likelihood = [];
    for (let i = cfg.likelihoodStart; i < cfg.likelihoodEnd; i += 1) {
      const n = num(row[i]);
      if (n !== null) likelihood.push(n);
    }
    const severity = [];
    for (let i = cfg.severityStart; i < cfg.severityEnd; i += 1) {
      const n = num(row[i]);
      if (n !== null) severity.push(n);
    }
    const likelihoodTotal = num(row[cfg.likelihoodTotal]);
    const severityTotal = num(row[cfg.severityTotal]);
    const riskScore = num(row[cfg.risk]);

    const sigMarks = cfg.sigCols.map((i) => isMark(row[i]));
    let registerSignificance = null;
    const sigCodes = ['L', 'M', 'H'];
    if (sigMarks.filter(Boolean).length === 1) {
      registerSignificance = sigCodes[sigMarks.findIndex(Boolean)];
    } else {
      warnings.push(`${SHEETS[kind === 'input' ? 'INPUT_REG' : 'OUTPUT_REG']} R${r + 1} significance marks: ${sigMarks.join(',')}`);
      registerSignificance = sigCodes[sigMarks.findIndex(Boolean)] ?? null;
    }

    const control = row[cfg.control] ? String(row[cfg.control]).replace(/\s+/g, ' ').trim() : null;

    rows.push({
      activity: currentActivity ?? null,
      aspect,
      impact,
      directIndirect,
      condition,
      applicableLaw,
      likelihood,
      likelihoodTotal,
      severity,
      severityTotal,
      riskScore,
      registerSignificance,
      control,
      sourceRow: r + 1,
    });
  }
  return { rows, warnings };
}

/**
 * Read a priority sheet into a normalized index plus ordered rows.
 * @param {Array} data
 */
function readPrioritySheet(data) {
  const rows = [];
  for (let r = 4; r < data.length; r += 1) {
    const row = data[r] || [];
    if (!row[4] || String(row[4]).trim() === '') continue;
    if (isLegendRow(row)) continue;
    const rankRaw = num(row[0]);
    rows.push({
      rank: rankRaw,
      activity: row[1] ? String(row[1]).replace(/\s+/g, ' ').trim() : null,
      directIndirectRaw: row[2] ? String(row[2]).trim() : null,
      conditionRaw: row[3] ? String(row[3]).trim() : null,
      problem: String(row[4]).replace(/\s+/g, ' ').trim(),
      score: num(row[5]),
      significance: row[6] ? String(row[6]).trim() : null,
      control: row[7] ? String(row[7]).replace(/\s+/g, ' ').trim() : null,
      sourceRow: r + 1,
    });
  }
  return rows;
}

/**
 * Grade-matched lookup of a register row in a priority sheet.
 * 1. exact normalized (activity|problem) key — unique in priority sheets
 * 2. base-activity + problem key — only when unique
 * 3. problem-only — only when unique
 */
function buildPriorityMatcher(priorityRows) {
  const byExactKey = new Map();
  const byBaseKey = new Map();
  const byProblem = new Map();
  const byProblemDirCond = new Map();
  for (const p of priorityRows) {
    const pn = norm(p.problem);
    const exactKey = norm(p.activity) + '\u0001' + pn;
    const baseKey = normBase(p.activity) + '\u0001' + pn;
    const pCond = p.conditionRaw ? PRIORITY_CONDITION_MAP[p.conditionRaw] : null;
    const pDir = p.directIndirectRaw ? PRIORITY_DIRECT_MAP[p.directIndirectRaw] : null;
    const dirCondKey = `${pn}\u0001${pDir ?? ''}\u0001${pCond ?? ''}`;
    for (const [map, key] of [
      [byExactKey, exactKey],
      [byBaseKey, baseKey],
      [byProblem, pn],
      [byProblemDirCond, dirCondKey],
    ]) {
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    }
  }
  return (registerRow) => {
    const pn = norm(registerRow.aspect);
    const exactKey = norm(registerRow.activity) + '\u0001' + pn;
    if (byExactKey.has(exactKey) && byExactKey.get(exactKey).length === 1) {
      return byExactKey.get(exactKey)[0];
    }
    const baseKey = normBase(registerRow.activity) + '\u0001' + pn;
    if (byBaseKey.has(baseKey) && byBaseKey.get(baseKey).length === 1) {
      return byBaseKey.get(baseKey)[0];
    }
    if (byProblem.has(pn) && byProblem.get(pn).length === 1) {
      return byProblem.get(pn)[0];
    }
    const dirCondKey = `${pn}\u0001${registerRow.directIndirect ?? ''}\u0001${registerRow.condition ?? ''}`;
    if (byProblemDirCond.has(dirCondKey) && byProblemDirCond.get(dirCondKey).length === 1) {
      return byProblemDirCond.get(dirCondKey)[0];
    }
    return null;
  };
}

// ── Main ─────────────────────────────────────────────────────────

function main() {
          const wb = XLSX.read(readFileSync(WORKBOOK_PATH), { type: 'buffer' });

          const inputRows = readRegisterRows(rowsOf(wb.Sheets[SHEETS.INPUT_REG]), 5, 'input');
  const outputRows = readRegisterRows(rowsOf(wb.Sheets[SHEETS.OUTPUT_REG]), 8, 'output');
  const priorityInputRows = readPrioritySheet(rowsOf(wb.Sheets[SHEETS.PRIORITY_INPUT]));
  const priorityOutputRows = readPrioritySheet(rowsOf(wb.Sheets[SHEETS.PRIORITY_OUTPUT]));
  const supersededOutputRows = readPrioritySheet(rowsOf(wb.Sheets[SHEETS.SUPERSEDED_OUTPUT]));

  const registerByKind = { input: inputRows, output: outputRows };
  const priorityByKind = { input: priorityInputRows, output: priorityOutputRows };
  const supersededCount = supersededOutputRows.length;

  // Activities = union of register activity names in first-appearance order.
  const activityOrder = [];
  const activitySeen = new Set();
  const activityRows = [];
  for (const kind of ['input', 'output']) {
    for (const r of registerByKind[kind].rows) {
      const key = norm(r.activity);
      if (!activitySeen.has(key) && r.activity) {
        activitySeen.add(key);
        activityOrder.push(r.activity);
        activityRows.push({ name: r.activity, firstSheet: kind, firstRow: r.sourceRow });
      }
    }
  }
  const activities = activityRows.map((a, i) => ({
    id: `act-${i + 1}`,
    year: 2568,
    indicatorCodes: ['1.3.1'],
    issueCodes: ['1.3'],
    categoryCode: 'cat1',
    evidenceIds: [],
    sourceRef: SOURCE_FILE_REL,
    verification: { status: 'reviewed', basis: `Activity name from ${a.firstSheet === 'input' ? 'Input' : 'Output'} register (row ${a.firstRow}).` },
    availability: 'content-verified',
    kind: 'activity',
    name: a.name,
    sourceTrace: {
      sourceFile: SOURCE_FILE_REL,
      sheet: a.firstSheet === 'input' ? 'Input' : 'Output',
      sourceRow: a.firstRow,
      sourceVersion: 'register',
      sourceDisposition: 'supporting',
    },
  }));
  const activityIdByKey = new Map(activities.map((a) => [norm(a.name), a.id]));

  // Project linkage: only when control text names a canonical project.
  const projectsData = JSON.parse(readFileSync(PROJECTS_PATH, 'utf8'));
  const canonicalProjects = projectsData.records.filter((r) => r.kind === 'project' && r.indicatorCodes.includes('1.3.3'));
  function linkProject(controlText) {
    if (!controlText) return null;
    for (const p of canonicalProjects) {
      const titleKey = norm(p.title);
      if (titleKey.includes('หนู') && norm(controlText).includes('หนู') && norm(controlText).includes('โครงการ')) {
        return { projectId: p.id, projectTitle: p.title };
      }
      // General fallback: exact title phrase appears in the control text.
      if (norm(controlText).includes(titleKey) && norm(controlText).includes('โครงการ')) {
        return { projectId: p.id, projectTitle: p.title };
      }
    }
    return null;
  }

  // Canonical aspects.
  const aspects = [];
  const aspectIndexes = { input: [], output: [] };
  let unmatched = [];
  let registerPriorityDiffs = { input: 0, output: 0 };
  const anomalies = [];

  let idCounter = 0;
  for (const kind of ['input', 'output']) {
    const matcher = buildPriorityMatcher(priorityByKind[kind]);
    // Input priority preserves register order (ranks follow the register);
    // output priority is score-descending, so positional fallback is input-only.
    const positionalFallback =
      kind === 'input' && priorityByKind[kind].length === registerByKind[kind].rows.length;
    registerByKind[kind].rows.forEach((r, pos) => {
      idCounter += 1;
      let priority = matcher(r);
      if (!priority && positionalFallback) {
        const candidate = priorityByKind[kind][pos];
        if (candidate && norm(candidate.problem) === norm(r.aspect)) {
          priority = candidate;
          anomalies.push({
            type: 'priority-match-positional-fallback',
            sheet: 'Input',
            sourceRow: r.sourceRow,
            aspect: r.aspect,
            priorityRow: candidate.sourceRow,
            note: 'Register activity label diverges from the priority sheet; matched by register position (input priority preserves register order).',
          });
        }
      }
      if (!priority) unmatched.push(`${kind} R${r.sourceRow} ${r.activity} / ${r.aspect}`);

      let significance = r.registerSignificance;
      let significanceSource = 'register';
      let priorityScore = null;
      let priorityRank = null;
      let control = r.control;
      let controlSource = 'register';
      let prioritySignificance = null;
      let reclassified = false;

      if (priority) {
        priorityRank = priority.rank;
        priorityScore = priority.score;
        prioritySignificance = priority.significance;
        if (priority.significance) {
          significance = priority.significance;
          significanceSource = 'priority';
        }
        if (priority.control) {
          control = priority.control;
          controlSource = 'priority';
        }
        const pCond = priority.conditionRaw ? PRIORITY_CONDITION_MAP[priority.conditionRaw] : null;
        const pDir = priority.directIndirectRaw ? PRIORITY_DIRECT_MAP[priority.directIndirectRaw] : null;
        reclassified = (pCond && pCond !== r.condition) || (pDir && pDir !== r.directIndirect);
        if (reclassified) registerPriorityDiffs[kind] += 1;
      } else {
        registerPriorityDiffs[kind] += 1; // unmatched is itself a divergence
      }

      if (r.registerSignificance && prioritySignificance && r.registerSignificance !== prioritySignificance) {
        anomalies.push({
          type: 'register-priority-significance-diff',
          sheet: kind === 'input' ? 'Input' : 'Output',
          sourceRow: r.sourceRow,
          aspect: r.aspect,
          register: r.registerSignificance,
          priority: prioritySignificance,
        });
      }

      if (priority && normBase(priority.activity) !== normBase(r.activity)) {
        anomalies.push({
          type: 'register-priority-activity-label-divergence',
          sheet: kind === 'input' ? 'Input' : 'Output',
          sourceRow: r.sourceRow,
          aspect: r.aspect,
          registerActivity: r.activity,
          priorityActivity: priority.activity,
          note: 'Register activity label preserved as recorded; priority sheet groups this aspect under a different activity label.',
        });
      }

      const impactInfo = r.impact ? IMPACT_LEGEND[kind][r.impact] : null;

      const projectRef = linkProject(control);

      const aspectRecord = {
        id: `ea-${idCounter}`,
        year: 2568,
        indicatorCodes: ['1.3.1'],
        issueCodes: ['1.3'],
        categoryCode: 'cat1',
        evidenceIds: [],
        sourceRef: SOURCE_FILE_REL,
        verification: {
          status: 'reviewed',
          basis: `Normalized from ${kind === 'input' ? 'Input' : 'Output'} register row ${r.sourceRow}${
            priority ? ` + priority row ${priority.sourceRow} of ${SHEETS[kind === 'input' ? 'PRIORITY_INPUT' : 'PRIORITY_OUTPUT']}` : ''
          }.`,
        },
        availability: 'content-verified',
        kind: 'aspect',
        activityId: activityIdByKey.get(norm(r.activity)) ?? null,
        activity: r.activity,
        inputOutput: kind,
        aspect: r.aspect,
        impact: impactInfo ? impactInfo.code : null,
        impactMeaning: impactInfo ? impactInfo.meaning : null,
        directIndirect: r.directIndirect,
        condition: r.condition,
        applicableLaw: r.applicableLaw,
        assessment: {
          likelihoodFactors: r.likelihood,
          likelihoodTotal: r.likelihoodTotal,
          severityFactors: r.severity,
          severityTotal: r.severityTotal,
          riskScore: r.riskScore,
          registerSignificance: r.registerSignificance,
          prioritySignificance,
          priorityScore,
          significance,
          significanceSource,
          reclassified,
        },
        controlMeasure: control ? { text: control, source: controlSource } : null,
        projectReference: projectRef,
        sourceTrace: {
          sourceFile: SOURCE_FILE_REL,
          sheet: kind === 'input' ? 'Input' : 'Output',
          sourceRow: r.sourceRow,
          sourceVersion: 'register',
          sourceDisposition: 'supporting',
          prioritySheet: priority ? SHEETS[kind === 'input' ? 'PRIORITY_INPUT' : 'PRIORITY_OUTPUT'] : null,
          priorityRow: priority ? priority.sourceRow : null,
          priorityRank,
        },
      };
      aspects.push(aspectRecord);
      aspectIndexes[kind].push(aspectRecord);
    });
  }

  // Derived significant issues (1.3.2) — from the canonical aspects, never a
  // second manual registry.
  const significantIssues = aspects
    .filter((a) => a.assessment.significance === 'M' || a.assessment.significance === 'H')
    .sort((a, b) => {
      const ra = a.sourceTrace.priorityRank ?? Number.MAX_SAFE_INTEGER;
      const rb = b.sourceTrace.priorityRank ?? Number.MAX_SAFE_INTEGER;
      if (ra !== rb) return ra - rb;
      return a.inputOutput === b.inputOutput ? 0 : a.inputOutput === 'input' ? -1 : 1;
    })
    .map((a, i) => ({
      id: `si-${i + 1}`,
      year: 2568,
      indicatorCodes: ['1.3.2'],
      issueCodes: ['1.3'],
      categoryCode: 'cat1',
      evidenceIds: [],
      sourceRef: SOURCE_FILE_REL,
      verification: { status: 'reviewed', basis: `Derived from canonical aspect ${a.id} (significance ${a.assessment.significance}).` },
      availability: 'content-verified',
      kind: 'significant-issue',
      aspectId: a.id,
      activity: a.activity,
      aspect: a.aspect,
      significance: a.assessment.significance,
      riskScore: a.assessment.riskScore,
      priorityRank: a.sourceTrace.priorityRank,
      controlMeasure: a.controlMeasure,
      projectReference: a.projectReference,
      sourceTrace: {
        sourceFile: SOURCE_FILE_REL,
        sheet: a.sourceTrace.sheet,
        sourceRow: a.sourceTrace.sourceRow,
        sourceVersion: 'derived',
        sourceDisposition: 'derived-from-canonical-aspect',
        sourceAspectId: a.id,
        prioritySheet: a.sourceTrace.prioritySheet,
        priorityRow: a.sourceTrace.priorityRow,
      },
    }));

  // Project linkage records (1.3.3) — only documentary-supported links.
  const projectLinks = aspects
    .filter((a) => a.projectReference)
    .map((a, i) => ({
      id: `pl-${i + 1}`,
      year: 2568,
      indicatorCodes: ['1.3.3'],
      issueCodes: ['1.3'],
      categoryCode: 'cat1',
      evidenceIds: [],
      sourceRef: SOURCE_FILE_REL,
      verification: {
        status: 'reviewed',
        basis: `Control text for ${a.id} names the canonical project; the link only exists because projects.json (1.3.3) documents it.`,
      },
      availability: 'content-verified',
      kind: 'project-link',
      aspectId: a.id,
      activity: a.activity,
      aspect: a.aspect,
      projectId: a.projectReference.projectId,
      projectTitle: a.projectReference.projectTitle,
      controlText: a.controlMeasure ? a.controlMeasure.text : null,
      sourceTrace: {
        sourceFile: SOURCE_FILE_REL,
        sheet: a.sourceTrace.sheet,
        sourceRow: a.sourceTrace.sourceRow,
        sourceVersion: 'derived',
        sourceDisposition: 'derived-from-canonical-aspect',
        sourceAspectId: a.id,
        prioritySheet: a.sourceTrace.prioritySheet,
        priorityRow: a.sourceTrace.priorityRow,
      },
    }));

  // ── Summary counts ─────────────────────────────────────────────
  const byInputOutput = { input: 0, output: 0 };
  const byDirectIndirect = { direct: 0, indirect: 0 };
  const byCondition = { normal: 0, abnormal: 0, emergency: 0 };
  const bySignificance = { L: 0, M: 0, H: 0 };
  for (const a of aspects) {
    byInputOutput[a.inputOutput] += 1;
    if (a.directIndirect) byDirectIndirect[a.directIndirect] += 1;
    if (a.condition) byCondition[a.condition] += 1;
    if (a.assessment.significance) bySignificance[a.assessment.significance] += 1;
  }

  const output = {
    schemaVersion: '1.0.0',
    domain: 'environmental-aspects-2568',
    updated: new Date().toISOString().slice(0, 10),
    year: 2568,
    status: 'normalized-verified',
    governance: 'GOFFICE2026_CATEGORY1_MANAGEMENT_BLUEPRINT_V1',
    note: 'Canonical FY2568 environmental aspect register normalized from docs/ผลประเมินปัญหา2568.xlsx (forms 1.3(2)/1.3(3) registers + 1.3(4) priority sheets). Significance is the canonical priority-sheet classification when the aspect appears there, otherwise the register classification. No official scoring, no FY2569 claims.',
    sources: [
      { ref: SOURCE_FILE_REL, role: 'primary', inspection: 'content-verified' },
      { ref: 'docs/เกณฑ์การประเมินสำนักงานสีเขียว ปี 2568_1-3.pdf', role: 'primary', inspection: 'content-verified' },
    ],
    versionDisposition: [
      { sheet: SHEETS.PROCESS, form: '1.3(1)', disposition: 'supporting', role: 'activity/process identification' },
      { sheet: SHEETS.INPUT_REG, form: '1.3(2)', disposition: 'supporting', role: 'input (resource) register' },
      { sheet: SHEETS.OUTPUT_REG, form: '1.3(3)', disposition: 'supporting', role: 'output (pollution) register' },
      { sheet: SHEETS.PRIORITY_INPUT, form: '1.3(4)', disposition: 'canonical', role: 'input prioritization' },
      { sheet: SHEETS.PRIORITY_OUTPUT, form: '1.3(4)', disposition: 'canonical', role: 'output prioritization (final, dated 29 สค68)' },
      { sheet: SHEETS.SUPERSEDED_OUTPUT, form: '1.3(4)', disposition: 'superseded', role: 'draft output prioritization — excluded from record creation' },
    ],
    anomalies: [
      {
        type: 'year-label-leak',
        location: 'Output!A2',
        detail: "Title cell reads 'ปี 2567' but every data row, the 9 กรกฎาคม 2568 date stamps and the 29 สค68 sheet are FY2568; recorded as an anomaly, never propagated as data (records carry year 2568).",
      },
      ...anomalies,
      ...inputRows.warnings.map((w) => ({ type: 'register-parse-warning', sheet: 'Input', detail: w })),
      ...outputRows.warnings.map((w) => ({ type: 'register-parse-warning', sheet: 'Output', detail: w })),
      ...unmatched.map((u) => ({ type: 'priority-match-failure', detail: u })),
    ],
    activities,
    records: aspects,
    significantIssues,
    projectLinks,
    summary: {
      activityCount: activities.length,
      aspectCount: aspects.length,
      byInputOutput,
      byDirectIndirect,
      byCondition,
      bySignificance,
      significantCount: significantIssues.length,
      projectLinkCount: projectLinks.length,
      registerPriorityDiffs,
      supersededExcluded: {
        sheet: SHEETS.SUPERSEDED_OUTPUT,
        recordCount: supersededCount,
        reason: 'superseded — records only from the canonical priority sheets',
      },
    },
    gaps: [
      { indicator: '1.2.2', status: 'MISSING', note: 'No FY2568 role-understanding interview evidence.' },
      { indicator: '1.5.3', status: 'MISSING', note: 'No FY2568 GHG-knowledge training evidence.' },
      { indicator: '1.3.2', status: 'DERIVED', note: 'Significant issues are derived from the canonical aspect records (M/H); no second manual registry.' },
      { indicator: '1.3.3', status: 'PARTIAL', note: `Only ${projectLinks.length} documentary project link(s) (control text → canonical projects.json); no projects are auto-created from M/H records.` },
    ],
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n');

  // ── Report ─────────────────────────────────────────────────────
  console.log('=== ENVIRONMENTAL ASPECTS 2568 NORMALIZER ===');
  console.log(`Activities            : ${output.summary.activityCount}`);
  console.log(`Aspects               : ${output.summary.aspectCount}  (input ${byInputOutput.input} / output ${byInputOutput.output})`);
  console.log(`Direct/Indirect       : ${JSON.stringify(byDirectIndirect)}`);
  console.log(`Normal/Abnormal/Emerg : ${JSON.stringify(byCondition)}`);
  console.log(`Significance L/M/H    : ${JSON.stringify(bySignificance)}`);
  console.log(`Significant (M/H)     : ${output.summary.significantCount}`);
  console.log(`Project links         : ${output.summary.projectLinkCount}`);
  console.log(`Register/priority diffs: ${JSON.stringify(registerPriorityDiffs)}`);
  console.log(`Superseded sheet rows : ${supersededCount} (excluded from records)`);
  console.log(`Unmatched priority rows: ${unmatched.length}${unmatched.length ? ' -> ' + unmatched.join(' | ') : ''}`);
  console.log(`Anomalies recorded    : ${output.anomalies.length}`);
  console.log(`Wrote ${OUTPUT_PATH.replace(ROOT, '.')}`);
}

main();
