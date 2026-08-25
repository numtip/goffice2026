/**
 * category6-presentation.ts
 * ==========================
 * Read-only view-model for the Category 6 procurement presentation
 * (GOFFICE2026 CAT6 Phase B). Builds presentation facts exclusively from the
 * canonical static contracts in src/data/category6/*.json, the evidence index,
 * and canonical criteria metadata. Never invents values, never presents a
 * score or PASS claim, never relabels a FY2568 result as FY2569: every fact is
 * labeled as the frozen FY2568 baseline, and recurring evidence streams are
 * shown as "awaiting FY2569 update". The FY2569-budget cleaning contract is
 * QUARANTINED and never presented; percentages are shown only when the source
 * declares them (with basis), never recomputed.
 */

import productsData from '../data/category6/products.json';
import contractorsData from '../data/category6/contractors.json';
import servicesData from '../data/category6/services.json';
import indicatorsData from '../data/criteria/indicators.json';

export const CAT6_YEAR = 2568 as const;

export type Cat6Domain = 'products' | 'contractors' | 'services';

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
  domain: Cat6Domain;
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
  percentageBasis?: {
    declared?: { volume?: string; value?: string };
    unit?: string;
    target?: string;
    basis?: string;
    sourceDeclaredYears?: Record<string, { volume: string; value: string }>;
  };
  fy2569Recurrence?: { required: boolean; cadence: string };
  [key: string]: unknown;
}

interface IndicatorShape {
  code: string;
  title: { th: string; en: string };
}

const CONTRACTS: Record<Cat6Domain, { records: ContractRecord[] }> = {
  products: productsData as { records: ContractRecord[] },
  contractors: contractorsData as { records: ContractRecord[] },
  services: servicesData as { records: ContractRecord[] },
};

/** Indicator code → contract domain that holds its FY2568 facts. */
export const CAT6_INDICATOR_DOMAIN: Record<string, Cat6Domain> = {
  '6.1.1': 'products',
  '6.1.2': 'products',
  '6.1.3': 'products',
  '6.2.1': 'contractors',
  '6.2.2': 'contractors',
  '6.2.3': 'services',
};

export const CAT6_ALL_INDICATORS = Object.keys(CAT6_INDICATOR_DOMAIN) as string[];

export function contractForDomain(domain: Cat6Domain): { records: ContractRecord[] } {
  return CONTRACTS[domain];
}

export function domainForIndicator(code: string): Cat6Domain | null {
  return CAT6_INDICATOR_DOMAIN[code] ?? null;
}

export function indicatorTitle(code: string, locale: 'th' | 'en'): string {
  const ind = (indicatorsData as { indicators: IndicatorShape[] }).indicators.find(
    (i) => i.code === code,
  );
  if (!ind) return code;
  return ind.title[locale] || ind.title.th;
}

const DOMAIN_LABELS: Record<Cat6Domain, Bilingual> = {
  products: { th: 'การจัดซื้อสินค้า (6.1)', en: 'Product procurement (6.1)' },
  contractors: { th: 'การจัดจ้างและผู้รับจ้าง (6.2.1–6.2.2)', en: 'Contracting (6.2.1–6.2.2)' },
  services: { th: 'บริการนอกสำนักงาน (6.2.3)', en: 'External services (6.2.3)' },
};

export function domainLabel(domain: Cat6Domain): Bilingual {
  return DOMAIN_LABELS[domain];
}

const AWAITING_UPDATE: Bilingual = {
  th: 'รอการเก็บหลักฐานปี 2569 (ข้อมูลฐานปี 2568)',
  en: 'Awaiting FY2569 collection (FY2568 baseline)',
};

/**
 * Build the presentation snapshot for a Cat6 contract domain. Every fact derives
 * from the contract records; no value is invented, no percentage is presented
 * where none is evidenced, no score/PASS claim is produced.
 */
export function buildCat6DomainSnapshot(domain: Cat6Domain): DomainSnapshot {
  const records = CONTRACTS[domain].records;

  switch (domain) {
    case 'products': {
      const procurement = records.find((r) => r.id === 'products-eco-procurement-fy2568');
      const report = records.find((r) => r.id === 'products-report-fy2568');
      const survey = records.find((r) => r.id === 'products-survey-fy2568');
      const declared = report?.percentageBasis?.declared;
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'การจัดซื้อสินค้าเป็นมิตรฯ', en: 'Eco product procurement' },
            value: procurement
              ? { th: 'จัดซื้อสินค้าที่เป็นมิตรฯ ตามบัญชี Form 6.1(1) (ฐานปี 2568)', en: 'Eco product procurement per Form 6.1(1) list (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'รายงานการจัดซื้อ (6.1.2)', en: 'Procurement report (6.1.2)' },
            value: declared
              ? {
                  th: `${declared.volume}% ปริมาณ / ${declared.value}% มูลค่า (ตามแหล่งข้อมูลระบุ, เป้าหมาย >40%)`,
                  en: `${declared.volume}% volume / ${declared.value}% value (source-declared, target >40%)`,
                }
              : '—',
            kind: 'number',
          },
          {
            label: { th: 'ร้อยละวัสดุอุปกรณ์เป็นมิตรฯ (6.1.3)', en: 'Eco material % (6.1.3)' },
            value: survey?.percentNotEvidenced
              ? { th: 'ไม่มีตัวเลขร้อยละในหลักฐานปี 2568 (สุ่มตรวจ –)', en: 'Percentage not evidenced in FY2568 sources (random check –)' }
              : '—',
            kind: 'unavailable',
          },
          { label: { th: 'สถานะปี 2569', en: 'FY2569 status' }, value: AWAITING_UPDATE, kind: 'status' },
        ],
      };
    }
    case 'contractors': {
      const engagement = records.find((r) => r.id === 'contractors-engagement-fy2568');
      const inspection = records.find((r) => r.id === 'contractors-inspection-fy2568');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'การจัดจ้างเป็นมิตรฯ (6.2.1)', en: 'Eco contractor engagement (6.2.1)' },
            value: engagement
              ? { th: 'จัดจ้าง 4 รายการ · ระบุ 100% ในแหล่งข้อมูล (ฐานปี 2568)', en: '4 engagements · source-declared 100% (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'การตรวจสอบผู้รับจ้าง (6.2.2)', en: 'Contractor inspection (6.2.2)' },
            value: inspection
              ? { th: 'ประเมินรายเดือน + ทุกครั้งที่เข้าปฏิบัติงาน (ผล ระดับดีมาก 30 ก.ย. 68)', en: 'Monthly + per-visit evaluation (result ระดับดีมาก 30 Sep 2568)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'สัญญางบ 2569', en: 'FY2569-budget contract' },
            value: { th: 'แยกออกจากข้อมูลฐานปี 2568 (QUARANTINE)', en: 'Excluded from FY2568 baseline (QUARANTINE)' },
            kind: 'status',
          },
          { label: { th: 'สถานะปี 2569', en: 'FY2569 status' }, value: AWAITING_UPDATE, kind: 'status' },
        ],
      };
    }
    case 'services': {
      const guideline = records.find((r) => r.id === 'services-guideline-fy2568');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'แนวทางบริการเป็นมิตรฯ (6.2.3)', en: 'Eco service guideline (6.2.3)' },
            value: guideline
              ? { th: 'แหล่งสืบค้น + ตัวอย่าง + แบบฟอร์ม 6.2(3) (ฐานปี 2568)', en: 'Search sources + examples + Form 6.2(3) (FY2568 baseline)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'การใช้บริการนอกสำนักงาน', en: 'External service use' },
            value: { th: 'ปี 2568/2567 ไม่ได้ใช้บริการนอกสำนักงาน (ตามที่รายงาน)', en: 'No external eco service used in FY2568/2567 (as reported)' },
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
 * Category 6 procurement management cycle:
 * Products → Report → Contractors → Inspect → External services.
 * Compact operational loop, not a marketing surface.
 */
export const CAT6_MANAGEMENT_CYCLE: LoopStep[] = [
  {
    stage: '1',
    code: 'products',
    label: { th: 'จัดซื้อสินค้าเป็นมิตรฯ', en: 'Eco product procurement' },
    summary: {
      th: 'กำหนดผู้รับผิดชอบ สืบค้นสินค้าฉลากสิ่งแวดล้อม และจัดทำบัญชีรายการ Form 6.1(1)',
      en: 'Assign responsibility, search eco-labeled products, maintain Form 6.1(1) list',
    },
    targetCode: '6.1.1',
  },
  {
    stage: '2',
    code: 'report',
    label: { th: 'รายงานการจัดซื้อ', en: 'Procurement report' },
    summary: {
      th: 'รายงานการจัดซื้อวัสดุอุปกรณ์สำนักงานที่เป็นมิตรฯ ตามแบบฟอร์ม 6.1(2)',
      en: 'Report eco office-material procurement per Form 6.1(2)',
    },
    targetCode: '6.1.2',
  },
  {
    stage: '3',
    code: 'contractors',
    label: { th: 'จัดจ้างเป็นมิตรฯ', en: 'Eco contractor engagement' },
    summary: {
      th: 'จัดจ้างหน่วยงาน/บุคคลที่ดำเนินงานเป็นมิตรกับสิ่งแวดล้อม พร้อมหลักฐานรับรอง',
      en: 'Engage contractors with eco operations and supporting certifications',
    },
    targetCode: '6.2.1',
  },
  {
    stage: '4',
    code: 'inspect',
    label: { th: 'ตรวจสอบผู้รับจ้าง', en: 'Inspect contractors' },
    summary: {
      th: 'ประเมินการดูแลสิ่งแวดล้อมในพื้นที่ปฏิบัติงานรายเดือน/ทุกครั้งที่เข้าปฏิบัติงาน',
      en: 'Evaluate work-area environmental care monthly / per visit',
    },
    targetCode: '6.2.2',
  },
  {
    stage: '5',
    code: 'services',
    label: { th: 'บริการนอกสำนักงาน', en: 'External services' },
    summary: {
      th: 'กำหนดแนวทางเลือกใช้บริการที่เป็นมิตรฯ โรงแรม/สถานที่จัดงาน (แบบฟอร์ม 6.2(3))',
      en: 'Define eco external-service selection (hotels/venues) per Form 6.2(3)',
    },
    targetCode: '6.2.3',
  },
];

/** Cycle stage(s) that a Cat6 indicator directly anchors (targetCode match). */
export function cycleStagesForIndicator(code: string): LoopStep[] {
  return CAT6_MANAGEMENT_CYCLE.filter((s) => s.targetCode === code);
}

export interface JourneyLink {
  from: string;
  to: string;
  label: Bilingual;
}

/** Explicit Phase B journeys shown on the category page. */
export const CAT6_JOURNEYS: JourneyLink[] = [
  { from: '6.1.1', to: '6.1.2', label: { th: 'จัดซื้อ — รายงานการจัดซื้อ', en: 'Procurement — Procurement report' } },
  { from: '6.2.1', to: '6.2.2', label: { th: 'จัดจ้าง — การตรวจสอบผู้รับจ้าง', en: 'Engagement — Contractor inspection' } },
  { from: '6.1.2', to: '6.2.3', label: { th: 'รายงานสินค้า — บริการนอกสำนักงาน', en: 'Product report — External services' } },
];
