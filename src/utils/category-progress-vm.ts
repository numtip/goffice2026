/**
 * category-progress-vm.ts — FY2569 criteria-progress view models (D3).
 *
 * Consumes the generated runtime dataset (src/data/generated/
 * category-progress-2569.json) plus canonical criteria taxonomy and produces
 * localized, render-ready structures for the /categories/ overview and the
 * /categories/cat1/ pilot page.
 *
 * Semantics (blueprint V1): progressStatus (ความคืบหน้าการดำเนินงาน) and
 * evidenceStatus (ความพร้อมหลักฐาน) are separate and never merged; no value
 * here is an official assessment score.
 *
 * Percentages always come from the generated dataset (readyRate) or are
 * derived from counts — never hardcoded.
 */

import categoryProgressData from '../data/generated/category-progress-2569.json';
import categoryData from '../data/criteria/categories.json';
import issueData from '../data/criteria/issues.json';

export type Locale = 'th' | 'en';

export interface ProgressCountsVM {
  total: number;
  applicable: number;
  ready: number;
  inProgress: number;
  notStarted: number;
  unavailable: number;
  notApplicable: number;
  readyRate: number;
}

export interface EvidenceCountsVM {
  verified: number;
  availableUnverified: number;
  pending: number;
  unavailable: number;
  notApplicable: number;
}

export interface CategoryProgressVM extends ProgressCountsVM {
  id: string;
  code: string;
  label: string;
  evidence: EvidenceCountsVM;
}

export interface IssueProgressVM extends ProgressCountsVM {
  id: string;
  title: string;
}

export interface ProgressOverviewVM {
  year: number;
  overall: ProgressCountsVM & { evidence: EvidenceCountsVM };
  categories: CategoryProgressVM[];
  /** Human-readable summary line (counts + %, never a score). */
  overallSummary: string;
  /** Counts-first hero line, e.g. "4 of 65 indicators ready". */
  heroSummary: string;
  /** Executive pulse cards (counts only). */
  pulse: { status: string; label: string; count: number }[];
  /** Data-derived needs-attention rows (no inference beyond counts). */
  needsAttention: { label: string; count: number; detail: string }[];
  fallbackColumns: { label: string; align?: 'left' | 'right' }[];
  fallbackRows: (string | number)[][];
}

export interface Cat1ProgressVM {
  year: number;
  category: { code: string; title: string };
  overall: ProgressCountsVM & { evidence: EvidenceCountsVM };
  issues: IssueProgressVM[];
  evidenceSummary: string;
  heroSummary: string;
  needsAttention: string[];
  fallbackColumns: { label: string; align?: 'left' | 'right' }[];
  fallbackRows: (string | number)[][];
  statusChips: { status: string; label: string; count: number }[];
  evidenceChips: { status: string; label: string; count: number }[];
}

type ProgressCounts = {
  total: number;
  applicable: number;
  ready: number;
  inProgress: number;
  notStarted: number;
  unavailable: number;
  notApplicable: number;
  readyRate: number;
};

type GeneratedCategory = ProgressCounts & {
  id: string;
  code: string;
  evidence: EvidenceCountsVM;
  issues: (ProgressCounts & { id?: string })[];
};

type GeneratedDataset = {
  schemaVersion: string;
  year: number;
  generatedAt: string;
  overall: ProgressCounts & { evidence: EvidenceCountsVM };
  categories: GeneratedCategory[];
};

const generated = categoryProgressData as unknown as GeneratedDataset;
const categories = categoryData.categories;
const issues = issueData.issues;

export const PROGRESS_STATUS_LABELS: Record<string, { th: string; en: string }> = {
  ready: { th: 'พร้อม', en: 'Ready' },
  in_progress: { th: 'กำลังดำเนินการ', en: 'In Progress' },
  not_started: { th: 'ยังไม่เริ่ม', en: 'Not Started' },
  unavailable: { th: 'ไม่มีข้อมูล', en: 'Unavailable' },
  not_applicable: { th: 'ไม่เกี่ยวข้อง', en: 'Not Applicable' },
};

export const EVIDENCE_STATUS_LABELS: Record<string, { th: string; en: string }> = {
  verified: { th: 'ตรวจสอบแล้ว', en: 'Verified' },
  available_unverified: { th: 'มีแต่ยังไม่ยืนยัน', en: 'Available, Unverified' },
  pending: { th: 'รอการตรวจสอบ', en: 'Pending' },
  unavailable: { th: 'ไม่มีหลักฐาน', en: 'Unavailable' },
  not_applicable: { th: 'ไม่เกี่ยวข้อง', en: 'Not Applicable' },
};

export const PROGRESS_STATUS_COLORS: Record<string, string> = {
  ready: '#10b981',
  in_progress: '#f59e0b',
  not_started: '#64748b',
  unavailable: '#e2e8f0',
  not_applicable: '#cbd5e1',
};

export const EVIDENCE_STATUS_COLORS: Record<string, string> = {
  verified: '#10b981',
  available_unverified: '#f59e0b',
  pending: '#94a3b8',
  unavailable: '#e2e8f0',
  not_applicable: '#cbd5e1',
};

export function progressStatusLabel(status: string, locale: Locale): string {
  return PROGRESS_STATUS_LABELS[status]?.[locale] ?? status;
}

export function evidenceStatusLabel(status: string, locale: Locale): string {
  return EVIDENCE_STATUS_LABELS[status]?.[locale] ?? status;
}

function categoryLabel(id: string, locale: Locale): string {
  const cat = categories.find((c) => String(c.id) === String(id));
  return (locale === 'th' ? cat?.title?.th : cat?.title?.en) ?? `หมวด ${id}`;
}

function issueTitle(id: string, locale: Locale): string {
  const iss = issues.find((i) => String(i.id) === String(id));
  return (locale === 'th' ? iss?.title?.th : iss?.title?.en) ?? id;
}

/** Format a ready rate for display (e.g. 22.2 → '22.2%'). */
export function formatRate(rate: number): string {
  return `${rate}%`;
}

/**
 * Overview for /categories/: overall counts + evidence + per-category rows.
 * All numbers derive from the generated dataset; no hardcoded percentages.
 */
export function buildProgressOverview(locale: Locale): ProgressOverviewVM {
  const overall = generated.overall;
  const cats = generated.categories.map((cat) => ({
    ...cat,
    id: cat.id,
    code: cat.code,
    label: categoryLabel(cat.id, locale),
  }));

  const summary =
    locale === 'th'
      ? `ภาพรวมปี ${generated.year}: พร้อม ${overall.ready} · กำลังดำเนินการ ${overall.inProgress} · ยังไม่เริ่ม ${overall.notStarted} · ไม่มีข้อมูล ${overall.unavailable} จากทั้งหมด ${overall.total} ตัวชี้วัด (${formatRate(overall.readyRate)})`
      : `FY${generated.year} overview: ${overall.ready} ready · ${overall.inProgress} in progress · ${overall.notStarted} not started · ${overall.unavailable} unavailable of ${overall.total} indicators (${formatRate(overall.readyRate)})`;

  // Counts-first hero line — percentage stays secondary.
  const heroSummary =
    locale === 'th'
      ? `พร้อม ${overall.ready} จาก ${overall.total} ตัวชี้วัด (${formatRate(overall.readyRate)})`
      : `${overall.ready} of ${overall.total} indicators ready (${formatRate(overall.readyRate)})`;

  const pulse = [
    { status: 'ready', label: progressStatusLabel('ready', locale), count: overall.ready },
    { status: 'in_progress', label: progressStatusLabel('in_progress', locale), count: overall.inProgress },
    { status: 'not_started', label: progressStatusLabel('not_started', locale), count: overall.notStarted },
    { status: 'unavailable', label: progressStatusLabel('unavailable', locale), count: overall.unavailable },
  ];

  // Needs-attention rows derived strictly from counts: categories with open
  // work (in_progress + not_started) first, then unavailable coverage.
  const openWork = cats
    .map((c) => ({ cat: c, open: c.inProgress + c.notStarted }))
    .filter((x) => x.open > 0)
    .sort((a, b) => b.open - a.open)
    .slice(0, 3);
  const needsAttention = openWork.map(({ cat, open }) => ({
    label: `${cat.id} ${cat.label}`,
    count: open,
    detail:
      locale === 'th'
        ? `${open} ตัวชี้วัดค้างดำเนินการ (กำลังดำเนินการ ${cat.inProgress} · ยังไม่เริ่ม ${cat.notStarted})`
        : `${open} indicators with open work (${cat.inProgress} in progress · ${cat.notStarted} not started)`,
  }));
  if (overall.unavailable > 0) {
    needsAttention.push({
      label: locale === 'th' ? 'ไม่มีข้อมูลปี 2569' : 'FY2569 data unavailable',
      count: overall.unavailable,
      detail:
        locale === 'th'
          ? `${overall.unavailable} ตัวชี้วัดยังไม่มีข้อมูลที่ verified — รอเอกสาร/หลักฐานปี 2569`
          : `${overall.unavailable} indicators still lack verified FY2569 data — awaiting sources`,
    });
  }

  const fallbackColumns = [
    { label: locale === 'th' ? 'หมวด' : 'Category' },
    { label: locale === 'th' ? 'ตัวชี้วัด' : 'Indicators', align: 'right' as const },
    { label: locale === 'th' ? 'พร้อม' : 'Ready', align: 'right' as const },
    { label: locale === 'th' ? 'กำลังดำเนินการ' : 'In Progress', align: 'right' as const },
    { label: locale === 'th' ? 'ยังไม่เริ่ม' : 'Not Started', align: 'right' as const },
    { label: locale === 'th' ? 'ไม่มีข้อมูล' : 'Unavailable', align: 'right' as const },
    { label: 'Ready %', align: 'right' as const },
  ];

  const fallbackRows = cats.map((c) => [
    `${c.id} ${c.label}`,
    c.total,
    c.ready,
    c.inProgress,
    c.notStarted,
    c.unavailable,
    formatRate(c.readyRate),
  ]);

  return {
    year: generated.year,
    overall,
    categories: cats,
    overallSummary: summary,
    heroSummary,
    pulse,
    needsAttention,
    fallbackColumns,
    fallbackRows,
  };
}

/**
 * Cat1 pilot detail: overall counts + evidence + issue-level breakdown.
 * Only Category 1 (no Cat2–7 generalization in D3).
 */
export function buildCat1Progress(locale: Locale): Cat1ProgressVM {
  const cat = generated.categories.find((c) => c.code === 'cat1');
  if (!cat) {
    throw new Error('category-progress-2569.json is missing cat1');
  }

  const issueRows: IssueProgressVM[] = cat.issues.map((iss) => ({
    id: iss.id ?? '',
    title: issueTitle(iss.id ?? '', locale),
    ...iss,
  }));

  const evidenceTotal = cat.evidence.verified + cat.evidence.availableUnverified + cat.evidence.pending + cat.evidence.unavailable + cat.evidence.notApplicable;

  const evidenceSummary =
    locale === 'th'
      ? `หลักฐาน: ตรวจสอบแล้ว ${cat.evidence.verified} · มีแต่ยังไม่ยืนยัน ${cat.evidence.availableUnverified} · ไม่มีหลักฐาน ${cat.evidence.unavailable} (รวม ${evidenceTotal})`
      : `Evidence: ${cat.evidence.verified} verified · ${cat.evidence.availableUnverified} available-unverified · ${cat.evidence.unavailable} unavailable (${evidenceTotal} total)`;

  const statusChips = [
    { status: 'ready', label: progressStatusLabel('ready', locale), count: cat.ready },
    { status: 'in_progress', label: progressStatusLabel('in_progress', locale), count: cat.inProgress },
    { status: 'not_started', label: progressStatusLabel('not_started', locale), count: cat.notStarted },
    { status: 'unavailable', label: progressStatusLabel('unavailable', locale), count: cat.unavailable },
  ];

  const evidenceChips = [
    { status: 'verified', label: evidenceStatusLabel('verified', locale), count: cat.evidence.verified },
    { status: 'available_unverified', label: evidenceStatusLabel('available_unverified', locale), count: cat.evidence.availableUnverified },
    { status: 'unavailable', label: evidenceStatusLabel('unavailable', locale), count: cat.evidence.unavailable },
  ];

  const heroSummary =
    locale === 'th'
      ? `พร้อม ${cat.ready} จาก ${cat.total} ตัวชี้วัด (${formatRate(cat.readyRate)})`
      : `${cat.ready} of ${cat.total} indicators ready (${formatRate(cat.readyRate)})`;

  // Data-derived watch list: issues with open work, then fully-unavailable ones.
  const needsAttention: string[] = [];
  for (const iss of issueRows) {
    const open = iss.inProgress + iss.notStarted;
    if (open > 0) {
      needsAttention.push(
        locale === 'th'
          ? `${iss.id} ${iss.title} — ค้างดำเนินการ ${open} (กำลังดำเนินการ ${iss.inProgress} · ยังไม่เริ่ม ${iss.notStarted})`
          : `${iss.id} ${iss.title} — ${open} open (${iss.inProgress} in progress · ${iss.notStarted} not started)`,
      );
    } else if (iss.unavailable === iss.total && iss.total > 0) {
      needsAttention.push(
        locale === 'th'
          ? `${iss.id} ${iss.title} — ${iss.total} ตัวชี้วัดยังไม่มีข้อมูลปี 2569`
          : `${iss.id} ${iss.title} — ${iss.total} indicators lack FY2569 data`,
      );
    }
  }

  const fallbackColumns = [
    { label: locale === 'th' ? 'ประเด็น' : 'Issue' },
    { label: locale === 'th' ? 'ตัวชี้วัด' : 'Indicators', align: 'right' as const },
    { label: locale === 'th' ? 'พร้อม' : 'Ready', align: 'right' as const },
    { label: locale === 'th' ? 'กำลังดำเนินการ' : 'In Progress', align: 'right' as const },
    { label: locale === 'th' ? 'ยังไม่เริ่ม' : 'Not Started', align: 'right' as const },
    { label: locale === 'th' ? 'ไม่มีข้อมูล' : 'Unavailable', align: 'right' as const },
    { label: 'Ready %', align: 'right' as const },
  ];

  const fallbackRows = issueRows.map((iss) => [
    `${iss.id} ${iss.title}`,
    iss.total,
    iss.ready,
    iss.inProgress,
    iss.notStarted,
    iss.unavailable,
    formatRate(iss.readyRate),
  ]);

  return {
    year: generated.year,
    category: { code: cat.code, title: categoryLabel(cat.id, locale) },
    overall: { ...cat },
    issues: issueRows,
    evidenceSummary,
    heroSummary,
    needsAttention,
    fallbackColumns,
    fallbackRows,
    statusChips,
    evidenceChips,
  };
}
