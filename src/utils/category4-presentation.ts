/**
 * category4-presentation.ts
 * ==========================
 * Read-only view-model for the Category 4 waste/wastewater presentation
 * (GOFFICE2026 CAT4 C5). Builds presentation facts exclusively from the
 * canonical static contracts in src/data/category4/*.json, the C3 evidence
 * index, and canonical criteria metadata. Never invents values, never reports
 * the >50% reuse threshold as met (31.93% — innovation/compost branch), never
 * conflates the monthly-form scope (5,625.7 kg) with the annual scope
 * (6,434.70 kg), never fabricates FY2569 data, never scores.
 *
 * The contracts are the single source of truth for FY2568 facts; this module
 * only reshapes them for the Astro views (management cycle, domain snapshot,
 * indicator context, source-document grouping).
 */

import targetsData from '../data/category4/targets.json';
import measuresData from '../data/category4/measures.json';
import sortingData from '../data/category4/sorting.json';
import dataData from '../data/category4/data.json';
import wastewaterData from '../data/category4/wastewater.json';
import treatmentCareData from '../data/category4/treatment-care.json';
import indicatorsData from '../data/criteria/indicators.json';

export const CAT4_YEAR = 2568 as const;

export type Cat4Domain = 'targets' | 'measures' | 'sorting' | 'data' | 'wastewater' | 'treatment-care';

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
  domain: Cat4Domain;
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
  [key: string]: unknown;
}

interface IndicatorShape {
  code: string;
  title: { th: string; en: string };
}

const CONTRACTS: Record<Cat4Domain, { records: ContractRecord[] }> = {
  targets: targetsData as { records: ContractRecord[] },
  measures: measuresData as { records: ContractRecord[] },
  sorting: sortingData as { records: ContractRecord[] },
  data: dataData as { records: ContractRecord[] },
  wastewater: wastewaterData as { records: ContractRecord[] },
  'treatment-care': treatmentCareData as { records: ContractRecord[] },
};

/** Indicator code → contract domain that holds its FY2568 facts. */
export const CAT4_INDICATOR_DOMAIN: Record<string, Cat4Domain | null> = {
  '4.1.1': 'measures',
  '4.1.2': 'sorting',
  '4.1.3': 'data',
  '4.2.1': 'wastewater',
  '4.2.2': 'treatment-care',
};

export const CAT4_ALL_INDICATORS = Object.keys(CAT4_INDICATOR_DOMAIN) as string[];

export function contractForDomain(domain: Cat4Domain): { records: ContractRecord[] } {
  return CONTRACTS[domain];
}

export function domainForIndicator(code: string): Cat4Domain | null {
  return CAT4_INDICATOR_DOMAIN[code] ?? null;
}

export function indicatorTitle(code: string, locale: 'th' | 'en'): string {
  const ind = (indicatorsData as { indicators: IndicatorShape[] }).indicators.find(
    (i) => i.code === code,
  );
  if (!ind) return code;
  return ind.title[locale] || ind.title.th;
}

const DOMAIN_LABELS: Record<Cat4Domain, Bilingual> = {
  targets: { th: 'เป้าหมาย (ทุกโดเมน)', en: 'Targets (all domains)' },
  measures: { th: 'มาตรการ (4.1.1)', en: 'Measures (4.1.1)' },
  sorting: { th: 'คัดแยก/รวบรวม/กำจัด (4.1.2)', en: 'Sorting / collection / disposal (4.1.2)' },
  data: { th: 'ข้อมูลขยะ (4.1.3)', en: 'Waste data (4.1.3)' },
  wastewater: { th: 'การจัดการน้ำเสีย (4.2.1)', en: 'Wastewater control (4.2.1)' },
  'treatment-care': { th: 'การดูแลบำบัดน้ำเสีย (4.2.2)', en: 'Treatment care (4.2.2)' },
};

export function domainLabel(domain: Cat4Domain): Bilingual {
  return DOMAIN_LABELS[domain];
}

/**
 * Build the presentation snapshot for a Cat4 contract domain. Every fact derives
 * from the contract records; no value is invented. The >50% reuse threshold is
 * never presented as met (31.93% — innovation/compost branch); target outcomes
 * are met/not-met context, never a score.
 */
export function buildCat4DomainSnapshot(domain: Cat4Domain): DomainSnapshot {
  const records = CONTRACTS[domain].records;

  switch (domain) {
    case 'targets': {
      const facts = records.map((r) => {
        const rec = r as ContractRecord & {
          domain?: string;
          labelTh?: string;
          labelEn?: string;
          targetPercent?: number;
          comparisonBasis?: string;
        };
        return {
          label: { th: rec.labelTh ?? rec.domain ?? rec.id, en: rec.labelEn ?? rec.domain ?? rec.id },
          value: {
            th: `ลด ${Math.abs(rec.targetPercent ?? 0)}% เทียบปี ${rec.comparisonBasis ?? ''}`,
            en: `Reduce ${Math.abs(rec.targetPercent ?? 0)}% vs ${rec.comparisonBasis ?? ''}`,
          },
          kind: 'status' as const,
        };
      });
      return { domain, status: 'historical-baseline', facts };
    }
    case 'measures': {
      const measures = records.filter((r) => r.kind !== 'disclosedGap' && r.promoted !== false && r.availability === 'content-verified');
      const scans = records.filter((r) => r.availability === 'filename_folder_only' && r.promoted !== true);
      const hasFoamGap = records.some((r) => r.kind === 'disclosedGap');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'มาตรการจัดการขยะ (ตรวจเนื้อหา)', en: 'Waste measures (content-verified)' }, value: String(measures.length), kind: 'number' },
          {
            label: { th: 'สแกน/ข้อความเพี้ยนรอตรวจ', en: 'Scans/garbled pending verification' },
            value: scans.length ? { th: `${scans.length} (ไม่ยืนยันเนื้อหา)`, en: `${scans.length} (content unverified)` } : '0',
            kind: scans.length ? 'status' : 'number',
          },
          {
            label: { th: 'ปลอดโฟม 4.1.1(3)', en: 'Foam-free 4.1.1(3)' },
            value: hasFoamGap
              ? { th: 'ยังไม่ได้ดำเนินการในปี 2568 (เปิดเผย)', en: 'Not implemented in FY2568 (disclosed)' }
              : '—',
            kind: 'status',
          },
        ],
      };
    }
    case 'sorting': {
      const implemented = records.filter((r) => r.kind === 'sortingImplementation');
      const scans = records.filter((r) => r.availability === 'filename_folder_only' && r.promoted !== true);
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'รายการดำเนินการ (ตรวจเนื้อหา)', en: 'Implemented items (content-verified)' }, value: String(implemented.length), kind: 'number' },
          {
            label: { th: 'สแกนรอตรวจ', en: 'Scans pending verification' },
            value: scans.length ? { th: `${scans.length} (ไม่ยืนยันเนื้อหา)`, en: `${scans.length} (content unverified)` } : '0',
            kind: scans.length ? 'status' : 'number',
          },
        ],
      };
    }
    case 'data': {
      const annual = records.find((r) => r.id === 'data-waste-annual-fy2568') as ContractRecord & {
        totalAllWaste?: number;
        generalWasteTotal?: number;
        reuseTotal?: number;
        reusePercent?: number;
        reuseNumericThresholdMet?: boolean;
        reuseClaimBasis?: string;
        changeVsPrevYearAbs?: number;
        changeVsPrevYearPercent?: number;
        targetPercent?: number;
        targetOutcome?: string;
        monthlyFormScopeTotal?: number;
      };
      if (!annual) return { domain, status: 'historical-baseline', facts: [] };
      const reuseValue: Bilingual = {
        th: `นำกลับมาใช้ใหม่ ${annual.reusePercent ?? '—'}% (เกณฑ์ >50% ไม่บรรลุ — ยืนยันผ่านสาขานวัตกรรม/ปุ๋ยหมัก)`,
        en: `Reuse ${annual.reusePercent ?? '—'}% (numeric >50% not met — claimed via innovation/composting branch)`,
      };
      const generalValue: Bilingual = {
        th: `ขยะทั่วไปส่งกำจัด ${annual.generalWasteTotal?.toLocaleString('en-US')} กก. (${annual.changeVsPrevYearAbs! > 0 ? '+' : ''}${annual.changeVsPrevYearAbs} กก., ${annual.changeVsPrevYearPercent! > 0 ? '+' : ''}${annual.changeVsPrevYearPercent}% เทียบปี 2567) · ไม่บรรลุเป้าหมาย (ลด ${Math.abs(annual.targetPercent ?? 0)}%)`,
        en: `General waste sent for disposal ${annual.generalWasteTotal?.toLocaleString('en-US')} kg (${annual.changeVsPrevYearAbs! > 0 ? '+' : ''}${annual.changeVsPrevYearAbs} kg, ${annual.changeVsPrevYearPercent! > 0 ? '+' : ''}${annual.changeVsPrevYearPercent}% vs 2567) · target not met (reduce ${Math.abs(annual.targetPercent ?? 0)}%)`,
      };
      const totalValue: Bilingual = {
        th: `รวมของเสียทั้งหมด ${annual.totalAllWaste?.toLocaleString('en-US')} กก. (ขอบเขตรายปี)`,
        en: `Total all waste ${annual.totalAllWaste?.toLocaleString('en-US')} kg (annual scope)`,
      };
      const scopeValue: Bilingual = {
        th: `ขอบเขตแบบฟอร์มรายเดือน ${annual.monthlyFormScopeTotal?.toLocaleString('en-US')} กก. — บันทึกแยกต่างหาก`,
        en: `Monthly-form scope ${annual.monthlyFormScopeTotal?.toLocaleString('en-US')} kg — recorded separately`,
      };
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'ขยะทั่วไปส่งกำจัด', en: 'General waste for disposal' }, value: generalValue, kind: 'status' },
          { label: { th: 'รวมของเสียทั้งหมด', en: 'Total all waste' }, value: totalValue, kind: 'status' },
          { label: { th: 'นำกลับมาใช้ใหม่', en: 'Waste reused' }, value: reuseValue, kind: 'status' },
          { label: { th: 'ขอบเขตแบบฟอร์มรายเดือน', en: 'Monthly-form scope' }, value: scopeValue, kind: 'text' },
        ],
      };
    }
    case 'wastewater': {
      const stats = records.find((r) => r.kind === 'effluentStats');
      const compliance = records.find((r) => r.kind === 'effluentCompliance');
      const scans = records.filter((r) => r.availability === 'filename_folder_only' && r.promoted !== true);
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'คุณภาพน้ำทิ้ง ปี 2568', en: 'FY2568 effluent quality' },
            value: stats
              ? { th: 'ตรวจเนื้อหาแล้ว (BOD/COD/SS/TDS/pH/Temp/Cl₂ อยู่ในเกณฑ์)', en: 'Content-verified (BOD/COD/SS/TDS/pH/Temp/Cl₂ within standard)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'มาตรฐานกฎหมาย', en: 'Legal standard' },
            value: compliance
              ? { th: 'อยู่ในเกณฑ์ตามประกาศ 2548 (ห้องปฏิบัติการที่ได้รับการรับรอง)', en: 'Within the 2548 standard (accredited lab)' }
              : '—',
            kind: 'status',
          },
          {
            label: { th: 'สแกนรอตรวจ', en: 'Scans pending verification' },
            value: scans.length ? { th: `${scans.length} (ไม่ยืนยันเนื้อหา)`, en: `${scans.length} (content unverified)` } : '0',
            kind: scans.length ? 'status' : 'number',
          },
        ],
      };
    }
    case 'treatment-care': {
      const cared = records.filter((r) => r.kind === 'treatmentCare');
      const scans = records.filter((r) => r.availability === 'filename_folder_only' && r.promoted !== true);
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'รายการดูแล/บำรุงรักษา', en: 'Care/maintenance items' }, value: String(cared.length), kind: 'number' },
          {
            label: { th: 'สแกนรอตรวจ (รวมบันทึกซ้ำ G2)', en: 'Scans pending (incl. G2 duplicate)' },
            value: scans.length ? { th: `${scans.length} (ไม่ยืนยันเนื้อหา)`, en: `${scans.length} (content unverified)` } : '0',
            kind: scans.length ? 'status' : 'number',
          },
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
 * Category 4 waste-management cycle (Blueprint §2 domain model, C5):
 * Plan → Sort/Collect/Dispose → Reuse/Recycle → Wastewater Control → Care/Maintain.
 * Compact operational loop, not a marketing surface.
 */
export const CAT4_MANAGEMENT_CYCLE: LoopStep[] = [
  {
    stage: '1',
    code: 'plan',
    label: { th: 'วางแผน', en: 'Plan' },
    summary: {
      th: 'กำหนดมาตรการจัดการขยะ สร้างความตระหนัก และการมีส่วนร่วม (รวมเป้าหมายลดขยะ)',
      en: 'Define waste-management measures, awareness and participation (incl. reduction targets)',
    },
    targetCode: '4.1.1',
  },
  {
    stage: '2',
    code: 'sort',
    label: { th: 'คัดแยก/รวบรวม/กำจัด', en: 'Sort / collect / dispose' },
    summary: {
      th: 'คัดแยก รวบรวม และกำจัดขยะตามแนวทางที่กำหนด (ถัง จุดพัก ผู้รับจ้าง ไม่เผาขยะ)',
      en: 'Sort, collect and dispose waste per defined guidelines (bins, holding point, contractor, no burning)',
    },
    targetCode: '4.1.2',
  },
  {
    stage: '3',
    code: 'reuse',
    label: { th: 'นำกลับมาใช้ใหม่', en: 'Reuse / recycle' },
    summary: {
      th: 'บันทึกข้อมูลปริมาณขยะรายเดือน วิเคราะห์เทียบค่าเป้าหมาย และนำขยะกลับมาใช้ประโยชน์',
      en: 'Record monthly waste data, analyze against target, and reuse/recycle waste',
    },
    targetCode: '4.1.3',
  },
  {
    stage: '4',
    code: 'control',
    label: { th: 'ควบคุมน้ำเสีย', en: 'Control wastewater' },
    summary: {
      th: 'จัดการน้ำเสียและควบคุมคุณภาพน้ำทิ้งให้เป็นไปตามมาตรฐานกฎหมาย',
      en: 'Manage wastewater and keep effluent quality within legal standards',
    },
    targetCode: '4.2.1',
  },
  {
    stage: '5',
    code: 'maintain',
    label: { th: 'ดูแลบำบัด', en: 'Care / maintain' },
    summary: {
      th: 'ดูแลและบำรุงรักษาระบบบำบัดน้ำเสียให้มีประสิทธิภาพ (ตักคราบ ซ่อมแซม ตรวจสอบรั่วไหล)',
      en: 'Maintain the wastewater-treatment system effectively (skimming, repair, leak inspection)',
    },
    targetCode: '4.2.2',
  },
];

/** Cycle stage(s) that a Cat4 indicator directly anchors (targetCode match). */
export function cycleStagesForIndicator(code: string): LoopStep[] {
  return CAT4_MANAGEMENT_CYCLE.filter((s) => s.targetCode === code);
}

export interface JourneyLink {
  from: string;
  to: string;
  label: Bilingual;
}

/** Explicit C5 journeys shown on the category page. */
export const CAT4_JOURNEYS: JourneyLink[] = [
  { from: '4.1.1', to: '4.1.2', label: { th: 'มาตรการขยะ → การคัดแยก/รวบรวม', en: 'Waste measures → Sorting / collection' } },
  { from: '4.1.2', to: '4.1.3', label: { th: 'การคัดแยก → ข้อมูลขยะและการนำกลับมาใช้', en: 'Sorting → Waste data and reuse' } },
  { from: '4.1.3', to: '4.1.1', label: { th: 'ข้อมูล/การวิเคราะห์ → ทบทวนมาตรการ', en: 'Data / analysis → Measures review' } },
  { from: '4.2.1', to: '4.2.2', label: { th: 'การควบคุมน้ำเสีย → การดูแลบำบัด', en: 'Wastewater control → Treatment care' } },
];
