/**
 * GO-DASH-V2-A — Phase A Shared ViewModel Contract.
 *
 * Single READ-ONLY data contract consumed by Subagent B (Command Hero)
 * and Subagent C (Resource Pulse). Do NOT modify any of the frozen data
 * sources imported below; all numbers are derived, never hardcoded.
 *
 * Frozen sources:
 *   - generatedMetricMap            src/utils/dashboard-generated-metrics.ts
 *   - dashboards                    src/data/dashboard-config.ts
 *   - resolveDisplayStatus / hasDisplayableTotal   src/utils/data-status.ts
 *   - resourceIconMap / resourceAccentMap          src/utils/wow2-images.ts
 *   - evidence-index.json / criteria/*.json
 *   - getLocalizedPath              src/i18n/utils.ts
 */
import { generatedMetricMap } from './dashboard-generated-metrics';
import { dashboards } from '../data/dashboard-config';
import { resolveDisplayStatus, hasDisplayableTotal } from './data-status';
import { resourceIconMap, resourceAccentMap } from './wow2-images';
import evidenceIndex from '../data/evidence-index.json';
import categoriesData from '../data/criteria/categories.json';
import issuesData from '../data/criteria/issues.json';
import indicatorsData from '../data/criteria/indicators.json';
import { getLocalizedPath } from '../i18n/utils';

export type PhaseAResourceStatus = 'in_progress' | 'pending';

export interface PhaseAResourcePulse {
  id: string; // energy|water|fuel|paper|waste|ghg
  name: string; // localized (th: ไฟฟ้า/น้ำ/เชื้อเพลิง/กระดาษ/ของเสีย/ก๊าซเรือนกระจก, en: Energy/Water/Fuel/Paper/Waste/GHG)
  total: number | null; // null when pending → render '—' (never '0')
  totalDisplay: string; // compact formatted (e.g. '264.6K') or '—'
  unit: string; // from metric.unit
  monthsCount: number; // 0..12
  displayStatus: PhaseAResourceStatus;
  statusLabel: string; // localized: In Progress/กำลังบันทึก or Data Pending/รอข้อมูล
  provenance: string; // localized cue
  ctaHref: string; // getLocalizedPath(locale, `/dashboard/${d.id}`)
  ctaLabel: string; // localized 'View dashboard'/'ดูแดชบอร์ด'
  sparkline: number[] | null; // genuine FY2569 monthly values; null when monthsCount < 2
  iconUrl: string; // resourceIconMap[d.id]
  accent: string; // resourceAccentMap[d.id]
  color: string; // d.color
}

export interface PhaseACoverage {
  coveredMonths: number;
  totalSlots: number;
  percent: number;
}

export interface PhaseATaxonomy {
  categories: number;
  issues: number;
  indicators: number;
}

export interface PhaseACopy {
  heroKicker: string;
  coverageTitle: string;
  coverageCaption: string;
  coverageUnit: string;
  evidenceLabel: string;
  evidenceCountLabel: string;
  taxonomyCaption: string;
  updatedLabel: string;
  neverScoreNote: string;
  pulseHeading: string;
  pulseSubheading: string;
  monthsUnit: string;
  of12: string;
  statusInProgress: string;
  statusPending: string;
  provenanceLabel: string;
  ctaLabel: string;
}

export interface PhaseAVM {
  locale: 'th' | 'en';
  coverage: PhaseACoverage;
  taxonomy: PhaseATaxonomy;
  evidenceCount: number;
  evidenceUpdated: string;
  lastUpdated: string;
  copy: PhaseACopy;
  resources: PhaseAResourcePulse[];
}

/** Localized short display names for the six resource dashboards. */
const RESOURCE_NAMES: Record<string, { th: string; en: string }> = {
  energy: { th: 'ไฟฟ้า', en: 'Energy' },
  water: { th: 'น้ำ', en: 'Water' },
  fuel: { th: 'เชื้อเพลิง', en: 'Fuel' },
  paper: { th: 'กระดาษ', en: 'Paper' },
  waste: { th: 'ของเสีย', en: 'Waste' },
  ghg: { th: 'ก๊าซเรือนกระจก', en: 'GHG' },
};

function buildCopy(
  locale: 'th' | 'en',
  coverage: PhaseACoverage,
  evidenceCount: number,
  taxonomy: PhaseATaxonomy,
): PhaseACopy {
  const th = locale === 'th';
  return {
    heroKicker: 'GREEN COMMAND CENTER',
    coverageTitle: th ? 'ความครอบคลุมข้อมูลรายเดือน ปี 2569' : 'Monthly Data Coverage 2569',
    coverageCaption: th
      ? `${coverage.coveredMonths}/${coverage.totalSlots} เดือน · ${coverage.percent}%`
      : `${coverage.coveredMonths}/${coverage.totalSlots} months · ${coverage.percent}%`,
    coverageUnit: '%',
    evidenceLabel: th ? 'ความครอบคลุมหลักฐาน' : 'Evidence Coverage',
    evidenceCountLabel: th ? `${evidenceCount} รายการ` : `${evidenceCount} items`,
    taxonomyCaption: th
      ? `${taxonomy.categories} หมวด · ${taxonomy.issues} ประเด็น · ${taxonomy.indicators} ตัวชี้วัด`
      : `${taxonomy.categories} categories · ${taxonomy.issues} issues · ${taxonomy.indicators} indicators`,
    updatedLabel: th ? 'อัปเดตล่าสุด' : 'Last updated',
    neverScoreNote: th
      ? 'ความครอบคลุมของข้อมูล ไม่ใช่คะแนนประเมิน ตัวเลขปี 2569 อยู่ระหว่างบันทึกและจะปรับตามข้อมูลที่เพิ่มขึ้น'
      : 'Data coverage — not an assessment score. 2569 figures are partial-year and adjust as data entry continues.',
    pulseHeading: th ? 'สถานะทรัพยากร 6 ด้าน' : 'Resource Pulse',
    pulseSubheading: th
      ? 'สถานะการบันทึกข้อมูลปี 2569 ของทรัพยากร 6 ด้าน'
      : 'FY2569 data entry status across six resources',
    monthsUnit: th ? 'เดือน' : 'months',
    of12: th ? 'จาก 12' : 'of 12',
    statusInProgress: th ? 'กำลังบันทึก' : 'In Progress',
    statusPending: th ? 'รอข้อมูล' : 'Data Pending',
    provenanceLabel: th ? 'ที่มา' : 'Source',
    ctaLabel: th ? 'ดูแดชบอร์ด' : 'View dashboard',
  };
}

/** Latest ISO date string across every year entry in every generated metric. */
function computeLastUpdated(): string {
  let latest = '';
  for (const metric of Object.values(generatedMetricMap)) {
    for (const year of Object.values(metric.years)) {
      if (year.updated > latest) latest = year.updated;
    }
  }
  return latest;
}

export function buildPhaseAVM(locale: 'th' | 'en'): PhaseAVM {
  const th = locale === 'th';

  // ── Coverage ──────────────────────────────────────────────────────────
  let coveredMonths = 0;
  for (const d of dashboards) {
    const metric = generatedMetricMap[d.id];
    const current = metric.years[metric.currentYear.toString()];
    coveredMonths += current?.months.length ?? 0;
  }
  const totalSlots = dashboards.length * 12;
  const coverage: PhaseACoverage = {
    coveredMonths,
    totalSlots,
    percent: Math.round((coveredMonths / totalSlots) * 100),
  };

  // ── Taxonomy ──────────────────────────────────────────────────────────
  const taxonomy: PhaseATaxonomy = {
    categories: categoriesData.categories.length,
    issues: issuesData.issues.length,
    indicators: indicatorsData.indicators.length,
  };

  // ── Evidence + freshness ──────────────────────────────────────────────
  const evidenceCount = evidenceIndex.items.length;
  const evidenceUpdated = evidenceIndex.updated;
  const lastUpdated = computeLastUpdated();

  const copy = buildCopy(locale, coverage, evidenceCount, taxonomy);

  // ── Resource Pulse (one entry per dashboard, in dashboard order) ──────
  const resources: PhaseAResourcePulse[] = dashboards.map((d) => {
    const metric = generatedMetricMap[d.id];
    const current = metric.years[metric.currentYear.toString()];
    const monthsCount = current?.months.length ?? 0;

    const resolved = resolveDisplayStatus(current);
    const displayStatus: PhaseAResourceStatus =
      resolved === 'pending' ? 'pending' : 'in_progress';

    const total = hasDisplayableTotal(current) && current ? current.total : null;
    const sparkline = monthsCount >= 2 ? current.months.map((mo) => mo.value) : null;

    // Source strings carry an English status suffix (e.g. "— partial, 7 of 12
    // months") from the frozen data. Translate only that suffix for TH so the
    // provenance cue is fully localized; filenames stay as-is.
    const sourceNote = (current?.source ?? '').replace(
      / — partial, (\d+) of (\d+) months$/,
      th ? ' — บันทึกบางส่วน ($1/$2 เดือน)' : ' — partial, $1 of $2 months',
    );
    const provenance =
      displayStatus === 'in_progress'
        ? th
          ? `ที่มา: ${sourceNote}`
          : `Source: ${sourceNote}`
        : th
          ? 'รอข้อมูลอย่างเป็นทางการ ปีงบประมาณ 2569'
          : 'Waiting for official FY2569 data';

    const totalDisplay =
      total == null
        ? '—'
        : new Intl.NumberFormat(th ? 'th-TH' : 'en-US', {
            notation: 'compact',
            maximumFractionDigits: 1,
          }).format(total);

    return {
      id: d.id,
      name: th ? RESOURCE_NAMES[d.id].th : RESOURCE_NAMES[d.id].en,
      total,
      totalDisplay,
      unit: metric.unit,
      monthsCount,
      displayStatus,
      statusLabel:
        displayStatus === 'in_progress' ? copy.statusInProgress : copy.statusPending,
      provenance,
      ctaHref: getLocalizedPath(locale, `/dashboard/${d.id}`),
      ctaLabel: copy.ctaLabel,
      sparkline,
      iconUrl: resourceIconMap[d.id],
      accent: resourceAccentMap[d.id],
      color: d.color,
    };
  });

  return {
    locale,
    coverage,
    taxonomy,
    evidenceCount,
    evidenceUpdated,
    lastUpdated,
    copy,
    resources,
  };
}
