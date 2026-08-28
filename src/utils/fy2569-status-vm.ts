/**
 * fy2569-status-vm.ts — FY2569 status panel view-model (truthfulness core).
 *
 * Consumes src/data/progress/indicator-progress-2569.json and produces a
 * localized, render-ready structure for the shared panel rendered on every
 * /indicators/ page immediately after the Requirement.
 *
 * Truthfulness rules enforced here:
 *   - unavailable ⇒ "ข้อมูลปี 2569 ยังไม่พร้อม" — never a zero or a result.
 *   - partial (in_progress / not_started) ⇒ exact status/evidence/notes;
 *     never an annual-completion claim.
 *   - ready + available_unverified ⇒ "พร้อมตรวจสอบ" (ready for review),
 *     NOT "พร้อม/Verified".
 *   - ready + verified ⇒ the only state that may carry "ตรวจสอบแล้ว".
 *   - Nothing here is an official assessment score.
 */

import progressRegistry from '../data/progress/indicator-progress-2569.json';

export type Locale = 'th' | 'en';

export interface Fy2569ProgressItem {
  indicator: string;
  year?: number;
  progressStatus?: string;
  evidenceStatus?: string;
  source?: { type?: string; ref?: string | null };
  updatedAt?: string;
  owner?: string;
  notes?: string;
}

export type Fy2569PanelKind =
  | 'unavailable'
  | 'partial'
  | 'not_started'
  | 'ready_unverified'
  | 'ready_verified';

export interface Fy2569StatusView {
  indicatorCode: string;
  year: number;
  kind: Fy2569PanelKind;
  progressStatus: string | null;
  evidenceStatus: string | null;
  /** Short badge text, e.g. "ข้อมูลปี 2569 ยังไม่พร้อม" / "พร้อมตรวจสอบ". */
  badge: string;
  /** Main panel copy — status/coverage/gap, never a completion claim. */
  headline: string;
  notes: string | null;
  sourceRef: string | null;
  updatedAt: string | null;
  owner: string | null;
}

const registryItems = (progressRegistry as { items: Fy2569ProgressItem[] }).items ?? [];

export function findFy2569Progress(
  indicatorCode: string,
): Fy2569ProgressItem | undefined {
  return registryItems.find((i) => i.indicator === indicatorCode);
}

export function progressStatusOf(item: Fy2569ProgressItem | undefined): string | null {
  return item?.progressStatus ?? null;
}

export function evidenceStatusOf(item: Fy2569ProgressItem | undefined): string | null {
  return item?.evidenceStatus ?? null;
}

export function fy2569StatusView(
  indicatorCode: string,
  locale: Locale,
): Fy2569StatusView {
  const th = locale === 'th';
  const item = findFy2569Progress(indicatorCode);

  if (!item) {
    return {
      indicatorCode,
      year: 2569,
      kind: 'unavailable',
      progressStatus: null,
      evidenceStatus: null,
      badge: th ? 'ข้อมูลปี 2569 ยังไม่พร้อม' : 'FY2569 data not yet available',
      headline: th
        ? 'ยังไม่มีข้อมูล/หลักฐานปี 2569 ที่ตรวจสอบแล้วสำหรับตัวชี้วัดนี้'
        : 'No verified FY2569 data or evidence is available for this indicator yet',
      notes: null,
      sourceRef: null,
      updatedAt: null,
      owner: null,
    };
  }

  const progress = item.progressStatus ?? 'unavailable';
  const evidence = item.evidenceStatus ?? 'unavailable';

  const common = {
    indicatorCode,
    year: 2569,
    progressStatus: progress,
    evidenceStatus: evidence,
    notes: item.notes ?? null,
    sourceRef: item.source?.ref ?? null,
    updatedAt: item.updatedAt ?? null,
    owner: item.owner ?? null,
  };

  if (progress === 'ready') {
    if (evidence === 'verified') {
      return {
        ...common,
        kind: 'ready_verified',
        badge: th ? 'พร้อม · ตรวจสอบแล้ว' : 'Ready · Verified',
        headline: th
          ? 'หลักฐานปี 2569 ตรวจสอบแล้ว — พร้อมใช้เป็นข้อมูลประกอบการประเมิน'
          : 'FY2569 evidence is verified — ready for assessment reference',
      };
    }
    // ready + available_unverified (or anything not verified) ⇒ ready for review.
    return {
      ...common,
      kind: 'ready_unverified',
      badge: th ? 'พร้อมตรวจสอบ' : 'Ready for review',
      headline: th
        ? 'หลักฐานปี 2569 มีแล้วแต่ยังไม่ผ่านการตรวจสอบยืนยัน — พร้อมให้เจ้าหน้าที่ตรวจสอบ'
        : 'FY2569 evidence is available but not yet human-verified — ready for review',
    };
  }

  if (progress === 'in_progress') {
    return {
      ...common,
      kind: 'partial',
      badge: th ? 'กำลังดำเนินการ (บางส่วน)' : 'In progress (partial)',
      headline: th
        ? 'มีการดำเนินงาน/หลักฐานบางส่วนของปี 2569 — ยังไม่ครบถ้วนตามข้อกำหนด และไม่ใช่ผลสำเร็จประจำปี'
        : 'Partial FY2569 activity/evidence — scope not yet complete; this is not an annual completion',
    };
  }

  if (progress === 'not_started') {
    return {
      ...common,
      kind: 'not_started',
      badge: th ? 'ยังไม่เริ่มดำเนินการปี 2569' : 'FY2569 not started',
      headline: th
        ? 'ยังไม่พบหลักฐานการดำเนินงานปี 2569 สำหรับตัวชี้วัดนี้'
        : 'No FY2569 implementation evidence found for this indicator yet',
    };
  }

  // unavailable
  return {
    ...common,
    kind: 'unavailable',
    badge: th ? 'ข้อมูลปี 2569 ยังไม่พร้อม' : 'FY2569 data not yet available',
    headline: th
      ? 'ยังไม่มีข้อมูล/หลักฐานปี 2569 ที่ตรวจสอบแล้วสำหรับตัวชี้วัดนี้'
      : 'No verified FY2569 data or evidence is available for this indicator yet',
  };
}
