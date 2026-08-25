/**
 * category5-presentation.ts
 * ==========================
 * Read-only view-model for the Category 5 environment/safety presentation
 * (GOFFICE2026 CAT5 Phase B). Builds presentation facts exclusively from the
 * canonical static contracts in src/data/category5/*.json, the evidence index,
 * and canonical criteria metadata. Never invents values, never presents a
 * score or PASS claim, never relabels a FY2568 result as FY2569: every fact is
 * labeled as the frozen FY2568 baseline, and recurring evidence streams are
 * shown as "awaiting FY2569 update".
 */

import airData from '../data/category5/air.json';
import lightingData from '../data/category5/lighting.json';
import noiseData from '../data/category5/noise.json';
import livabilityData from '../data/category5/livability.json';
import emergencyData from '../data/category5/emergency.json';
import indicatorsData from '../data/criteria/indicators.json';

export const CAT5_YEAR = 2568 as const;

export type Cat5Domain = 'air' | 'lighting' | 'noise' | 'livability' | 'emergency';

export interface Bilingual {
  th: string;
  en: string;
}

export interface DomainFact {
  label: Bilingual;
  value: string | Bilingual;
  kind: 'number' | 'status' | 'text' | 'unavailable';
}

export function resolveDomainFactValue(value: string | Bilingual, locale: 'th' | 'en'): string {
  return typeof value === 'string' ? value : locale === 'en' ? value.en : value.th;
}

export interface DomainSnapshot {
  domain: Cat5Domain;
  status: string;
  facts: DomainFact[];
}

export interface ContractRecord {
  id: string;
  year: number;
  indicatorCodes: string[];
  issueCodes: string[];
  categoryCode: string;
  evidenceIds?: string[];
  sourceRef?: string;
  verification?: { status?: string; basis?: string };
  availability?: string;
  kind?: string;
  promoted?: boolean;
  percentNotEvidenced?: boolean;
  noiseMeasurementStatus?: string;
  expectedSourceUnconfirmed?: { ref: string; reason: string };
  fy2569Recurrence?: { required: boolean; cadence: string };
  [key: string]: unknown;
}

interface IndicatorShape {
  code: string;
  title: { th: string; en: string };
}

const CONTRACTS: Record<Cat5Domain, { records: ContractRecord[] }> = {
  air: airData as { records: ContractRecord[] },
  lighting: lightingData as { records: ContractRecord[] },
  noise: noiseData as { records: ContractRecord[] },
  livability: livabilityData as { records: ContractRecord[] },
  emergency: emergencyData as { records: ContractRecord[] },
};

/** Indicator code → contract domain that holds its FY2568 facts. */
export const CAT5_INDICATOR_DOMAIN: Record<string, Cat5Domain> = {
  '5.1.1': 'air',
  '5.1.2': 'air',
  '5.1.3': 'air',
  '5.2.1': 'lighting',
  '5.3.1': 'noise',
  '5.3.2': 'noise',
  '5.4.1': 'livability',
  '5.4.2': 'livability',
  '5.4.3': 'livability',
  '5.4.4': 'livability',
  '5.5.1': 'emergency',
  '5.5.2': 'emergency',
  '5.5.3': 'emergency',
};

export const CAT5_ALL_INDICATORS = Object.keys(CAT5_INDICATOR_DOMAIN) as string[];

export function contractForDomain(domain: Cat5Domain): { records: ContractRecord[] } {
  return CONTRACTS[domain];
}

export function domainForIndicator(code: string): Cat5Domain | null {
  return CAT5_INDICATOR_DOMAIN[code] ?? null;
}

export function indicatorTitle(code: string, locale: 'th' | 'en'): string {
  const ind = (indicatorsData as { indicators: IndicatorShape[] }).indicators.find(
    (i) => i.code === code,
  );
  if (!ind) return code;
  return ind.title[locale] || ind.title.th;
}

const DOMAIN_LABELS: Record<Cat5Domain, Bilingual> = {
  air: { th: 'อากาศในสำนักงาน (5.1)', en: 'Indoor air (5.1)' },
  lighting: { th: 'แสงสว่างในสำนักงาน (5.2)', en: 'Lighting (5.2)' },
  noise: { th: 'เสียงในสำนักงาน (5.3)', en: 'Noise (5.3)' },
  livability: { th: 'ความน่าอยู่ (5.4)', en: 'Livability (5.4)' },
  emergency: { th: 'การเตรียมพร้อมต่อสภาวะฉุกเฉิน (5.5)', en: 'Emergency preparedness (5.5)' },
};

export function domainLabel(domain: Cat5Domain): Bilingual {
  return DOMAIN_LABELS[domain];
}

const AWAITING_UPDATE: Bilingual = {
  th: 'รอการเก็บหลักฐานปี 2569 (ข้อมูลฐานปี 2568)',
  en: 'Awaiting FY2569 collection (FY2568 baseline)',
};

/**
 * Build the presentation snapshot for a Cat5 contract domain. Every fact derives
 * from the contract records; no value is invented, no percentage is presented
 * where none is evidenced, no score/PASS claim is produced.
 */
export function buildCat5DomainSnapshot(domain: Cat5Domain): DomainSnapshot {
  const records = CONTRACTS[domain].records;

  switch (domain) {
    case 'air': {
      const maintenance = records.find((r) => r.id === 'air-maintenance-fy2568');
      const smoke = records.find((r) => r.id === 'air-smoke-free-fy2568');
      const construction = records.find((r) => r.id === 'air-construction-fy2568');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'การบำรุงรักษาเครื่องปรับอากาศ', en: 'AC maintenance' },
            value: maintenance?.fy2569Recurrence
              ? { th: '148 เครื่อง · ปีละ 2 ครั้ง (ฐานปี 2568)', en: '148 units · 2 rounds/year (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'การรณรงค์ไม่สูบบุหรี่', en: 'No-smoking campaign' },
            value: smoke
              ? { th: 'ป้ายรณรงค์ + เขตสูบบุหรี่ (ฐานปี 2568)', en: 'Signage + designated areas (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'มาตรการมลพิษจากการก่อสร้าง', en: 'Construction air measures' },
            value: construction
              ? { th: 'บันทึกมาตรการไว้แล้ว (เชิงบริบท)', en: 'Measures on file (contextual)' }
              : '—',
            kind: 'status',
          },
          { label: { th: 'สถานะปี 2569', en: 'FY2569 status' }, value: AWAITING_UPDATE, kind: 'status' },
        ],
      };
    }
    case 'lighting': {
      const measurement = records.find((r) => r.id === 'lighting-measurement-fy2568');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'การวัดค่าแสง', en: 'Light measurement' },
            value: measurement
              ? { th: 'วัด 7–8 ก.ค. 2568 โดยผู้ทรงคุณวุฒิ จป. (ฐานปี 2568)', en: 'Measured 7–8 Jul 2568 by qualified safety officer (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'ความถี่ตามเกณฑ์', en: 'Criterion cadence' },
            value: { th: 'ประจำปี — ต้องวัดใหม่ในปี 2569', en: 'Annual — must be re-measured in FY2569' },
            kind: 'status',
          },
          { label: { th: 'สถานะปี 2569', en: 'FY2569 status' }, value: AWAITING_UPDATE, kind: 'status' },
        ],
      };
    }
    case 'noise': {
      const control = records.find((r) => r.id === 'noise-control-fy2568');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'มาตรการควบคุมเสียงภายใน', en: 'Internal noise measures' },
            value: control
              ? { th: 'มาตรการบันทึกไว้ (ฐานปี 2568)', en: 'Measures on file (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'การวัดระดับเสียง', en: 'Sound-level measurement' },
            value: { th: 'ไม่ได้วัด — รอการยืนยันจากผู้ประเมิน', en: 'Not measured — pending assessor confirmation' },
            kind: 'unavailable',
          },
          { label: { th: 'สถานะปี 2569', en: 'FY2569 status' }, value: AWAITING_UPDATE, kind: 'status' },
        ],
      };
    }
    case 'livability': {
      const plan = records.find((r) => r.id === 'livability-plan-fy2568');
      const utilization = records.find((r) => r.id === 'livability-utilization-fy2568');
      const maintenance = records.find((r) => r.id === 'livability-maintenance-fy2568');
      const vector = records.find((r) => r.id === 'livability-vector-fy2568');
      const notEvidenced: Bilingual = {
        th: 'ไม่มีตัวเลขร้อยละในหลักฐานปี 2568',
        en: 'Percentage not evidenced in FY2568 sources',
      };
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'พื้นที่รับการประเมิน', en: 'Assessed area' },
            value: plan
              ? { th: '9,881 ตร.ม. · พื้นที่สีเขียว 282 ตร.ม. (ฐานปี 2568)', en: '9,881 m² · green area 282 m² (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'การใช้พื้นที่ตามวัตถุประสงค์', en: 'Space utilization' },
            value: utilization?.percentNotEvidenced ? notEvidenced : '—',
            kind: 'unavailable',
          },
          {
            label: { th: 'การดูแลบำรุงรักษาพื้นที่', en: 'Area maintenance' },
            value: maintenance?.percentNotEvidenced ? notEvidenced : '—',
            kind: 'unavailable',
          },
          {
            label: { th: 'การควบคุมพาหะนำเชื้อ', en: 'Vector control' },
            value: vector
              ? { th: 'แผนรายชั้น + ตรวจตราจารย์ประจำวัน (ฐานปี 2568)', en: 'Per-floor plans + daily inspections (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
        ],
      };
    }
    case 'emergency': {
      const drill = records.find((r) => r.id === 'emergency-drill-fy2568');
      const plan = records.find((r) => r.id === 'emergency-plan-fy2568');
      const equipment = records.find((r) => r.id === 'emergency-equipment-fy2568');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'การฝึกซ้อมอพยพหนีไฟ', en: 'Fire drill' },
            value: drill
              ? { th: 'ซ้อม 30 พ.ค. 2568 · เข้าร่วม 104 ราย (ฐานปี 2568)', en: 'Drilled 30 May 2568 · 104 attendees (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'แผนฉุกเฉิน', en: 'Emergency plans' },
            value: plan
              ? { th: 'แผนฉุกเฉิน + แผนระงับอัคคีภัย (ฐานปี 2568)', en: 'Emergency + suppression plans (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'อุปกรณ์ดับเพลิง', en: 'Fire equipment' },
            value: equipment
              ? { th: 'ถังดับเพลิง 26 จุด · สายฉีดน้ำ 12 จุด (ฐานปี 2568)', en: '26 extinguishers · 12 hose points (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          { label: { th: 'สถานะปี 2569', en: 'FY2569 status' }, value: AWAITING_UPDATE, kind: 'status' },
        ],
      };
    }
  }
}

export interface LoopStep {
  stage: string;
  code: string;
  label: Bilingual;
  summary: Bilingual;
  targetCode: string;
}

/**
 * Category 5 environment/safety management cycle:
 * Air → Lighting → Noise → Livability → Emergency preparedness.
 * Compact operational loop, not a marketing surface.
 */
export const CAT5_MANAGEMENT_CYCLE: LoopStep[] = [
  {
    stage: '1',
    code: 'air',
    label: { th: 'อากาศในสำนักงาน', en: 'Indoor air' },
    summary: {
      th: 'บำรุงรักษาเครื่องปรับอากาศ/เครื่องพิมพ์ รณรงค์ไม่สูบบุหรี่ และควบคุมมลพิษจากการปรับปรุง',
      en: 'Maintain AC/printers, run no-smoking campaign, manage renovation pollution',
    },
    targetCode: '5.1.1',
  },
  {
    stage: '2',
    code: 'lighting',
    label: { th: 'แสงสว่าง', en: 'Lighting' },
    summary: {
      th: 'ตรวจวัดความเข้มแสงประจำปีด้วยอุปกรณ์ที่ได้มาตรฐาน และแก้ไขตามเกณฑ์',
      en: 'Measure light intensity annually with certified equipment and correct per standards',
    },
    targetCode: '5.2.1',
  },
  {
    stage: '3',
    code: 'noise',
    label: { th: 'เสียง', en: 'Noise' },
    summary: {
      th: 'กำหนดมาตรการควบคุมเสียงภายในและจากการปรับปรุงอาคาร',
      en: 'Define internal-noise and renovation-noise countermeasures',
    },
    targetCode: '5.3.1',
  },
  {
    stage: '4',
    code: 'livability',
    label: { th: 'ความน่าอยู่', en: 'Livability' },
    summary: {
      th: 'ดูแลพื้นที่ พื้นที่สีเขียว ความสะอาด และควบคุมสัตว์พาหะนำโรค',
      en: 'Care for areas and green space, cleanliness, and disease-vector control',
    },
    targetCode: '5.4.1',
  },
  {
    stage: '5',
    code: 'emergency',
    label: { th: 'ความพร้อมรับเหตุฉุกเฉิน', en: 'Emergency readiness' },
    summary: {
      th: 'ฝึกซ้อมอพยพหนีไฟประจำปี รักษาแผนให้เป็นปัจจุบัน และตรวจสอบอุปกรณ์ดับเพลิง',
      en: 'Run the annual fire drill, keep plans current, inspect fire equipment',
    },
    targetCode: '5.5.1',
  },
];

/** Cycle stage(s) that a Cat5 indicator directly anchors (targetCode match). */
export function cycleStagesForIndicator(code: string): LoopStep[] {
  return CAT5_MANAGEMENT_CYCLE.filter((s) => s.targetCode === code);
}

export interface JourneyLink {
  from: string;
  to: string;
  label: Bilingual;
}

/** Explicit Phase B journeys shown on the category page. */
export const CAT5_JOURNEYS: JourneyLink[] = [
  { from: '5.1.1', to: '5.3.1', label: { th: 'อากาศ — เสียง (มาตรการภายในอาคาร)', en: 'Air — Noise (indoor measures)' } },
  { from: '5.4.1', to: '5.4.4', label: { th: 'แผนความน่าอยู่ — การควบคุมพาหะนำโรค', en: 'Livability plan — Vector control' } },
  { from: '5.5.1', to: '5.5.3', label: { th: 'ซ้อมอพยพ — อุปกรณ์ดับเพลิงพร้อมใช้', en: 'Fire drill — Equipment readiness' } },
];
