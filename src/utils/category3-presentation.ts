/**
 * category3-presentation.ts
 * ==========================
 * Read-only view-model for the Category 3 resource/energy presentation
 * (GOFFICE2026 CAT3 C5). Builds presentation facts exclusively from the
 * canonical static contracts in src/data/category3/*.json, the C3 evidence
 * index, and canonical criteria metadata. Never invents values, never reports
 * 3.2.2 per-unit numbers, never fabricates FY2569 data, never scores.
 *
 * The contracts are the single source of truth for FY2568 facts; this module
 * only reshapes them for the Astro views (management cycle, domain snapshot,
 * indicator context, source-document grouping).
 */

import targetsData from '../data/category3/targets.json';
import measuresData from '../data/category3/measures.json';
import dataData from '../data/category3/data.json';
import complianceData from '../data/category3/compliance.json';
import meetingsData from '../data/category3/meetings.json';
import indicatorsData from '../data/criteria/indicators.json';

export const CAT3_YEAR = 2568 as const;

export type Cat3Domain = 'targets' | 'measures' | 'data' | 'compliance' | 'meetings';

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
  domain: Cat3Domain;
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

const CONTRACTS: Record<Cat3Domain, { records: ContractRecord[] }> = {
  targets: targetsData as { records: ContractRecord[] },
  measures: measuresData as { records: ContractRecord[] },
  data: dataData as { records: ContractRecord[] },
  compliance: complianceData as { records: ContractRecord[] },
  meetings: meetingsData as { records: ContractRecord[] },
};

/** Indicator code → contract domain that holds its FY2568 facts. */
export const CAT3_INDICATOR_DOMAIN: Record<string, Cat3Domain | null> = {
  '3.1.1': 'measures',
  '3.1.2': 'data',
  '3.1.3': 'compliance',
  '3.2.1': 'measures',
  '3.2.2': 'data',
  '3.2.3': 'compliance',
  '3.2.4': 'measures',
  '3.2.5': 'data',
  '3.3.1': 'measures',
  '3.3.2': 'data',
  '3.3.3': 'compliance',
  '3.3.4': 'measures',
  '3.3.5': 'compliance',
  '3.4.1': 'meetings',
  '3.4.2': 'meetings',
};

export const CAT3_ALL_INDICATORS = Object.keys(CAT3_INDICATOR_DOMAIN) as string[];

/** Indicators with image-only per-unit tables — always shown honestly (3.2.2 MEDIUM). */
export const CAT3_MEDIUM_INDICATORS = ['3.2.2'] as const;

export function contractForDomain(domain: Cat3Domain): { records: ContractRecord[] } {
  return CONTRACTS[domain];
}

export function domainForIndicator(code: string): Cat3Domain | null {
  return CAT3_INDICATOR_DOMAIN[code] ?? null;
}

export function indicatorTitle(code: string, locale: 'th' | 'en'): string {
  const ind = (indicatorsData as { indicators: IndicatorShape[] }).indicators.find(
    (i) => i.code === code,
  );
  if (!ind) return code;
  return ind.title[locale] || ind.title.th;
}

const DOMAIN_LABELS: Record<Cat3Domain, Bilingual> = {
  targets: { th: 'เป้าหมาย (ทุกโดเมน)', en: 'Targets (all domains)' },
  measures: { th: 'มาตรการ', en: 'Measures' },
  data: { th: 'ข้อมูลต่อหน่วย', en: 'Per-unit data' },
  compliance: { th: 'การปฏิบัติตาม', en: 'Compliance' },
  meetings: { th: 'ประชุม/นิทรรศการ', en: 'Meetings / exhibitions' },
};

export function domainLabel(domain: Cat3Domain): Bilingual {
  return DOMAIN_LABELS[domain];
}

/**
 * Build the presentation snapshot for a Cat3 contract domain. Every fact derives
 * from the contract records; no value is invented. 3.2.2 per-unit values stay
 * unavailable; target outcomes are shown as met/not-met context, never a score.
 */
export function buildCat3DomainSnapshot(domain: Cat3Domain): DomainSnapshot {
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
          value: { th: `ลด ${Math.abs(rec.targetPercent ?? 0)}% เทียบปี ${rec.comparisonBasis ?? ''}`, en: `Reduce ${Math.abs(rec.targetPercent ?? 0)}% vs ${rec.comparisonBasis ?? ''}` },
          kind: 'status' as const,
        };
      });
      return { domain, status: 'historical-baseline', facts };
    }
    case 'measures': {
      const measures = records.filter((r) => r.kind === 'conservationMeasure');
      const scans = records.filter((r) => r.availability === 'filename_folder_only' && r.promoted !== true);
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'มาตรการประหยัดทรัพยากร', en: 'Resource conservation measures' }, value: String(measures.length), kind: 'number' },
          {
            label: { th: 'สแกนรอการตรวจสอบ', en: 'Scans pending verification' },
            value: scans.length ? { th: `${scans.length} (ไม่ยืนยันเนื้อหา)`, en: `${scans.length} (content unverified)` } : '0',
            kind: scans.length ? 'status' : 'number',
          },
        ],
      };
    }
    case 'data': {
      const facts = records.map((r) => {
        const rec = r as ContractRecord & {
          domain?: string;
          labelTh?: string;
          labelEn?: string;
          unit?: string;
          total?: number;
          changePercentVs2024?: number;
          perUnit?: number | null;
          targetOutcome?: string;
          evidenceStrength?: string;
        };
        const outcomeLabel: Bilingual =
          rec.targetOutcome === 'MET'
            ? { th: 'บรรลุเป้าหมาย', en: 'Target met' }
            : { th: 'ไม่บรรลุเป้าหมาย', en: 'Target not met' };
        const change =
          rec.changePercentVs2024 === undefined || rec.changePercentVs2024 === null
            ? '—'
            : `${rec.changePercentVs2024 > 0 ? '+' : ''}${rec.changePercentVs2024}%`;
        const value =
          rec.total === undefined || rec.total === null
            ? { th: 'รอการยืนยันข้อมูล', en: 'Awaiting verified data' }
            : {
                th: `${rec.total.toLocaleString('en-US')} ${rec.unit ?? ''} (${change}) · ${outcomeLabel.th}`,
                en: `${rec.total.toLocaleString('en-US')} ${rec.unit ?? ''} (${change}) · ${outcomeLabel.en}`,
              };
        return {
          label: { th: rec.labelTh ?? rec.domain ?? rec.id, en: rec.labelEn ?? rec.domain ?? rec.id },
          value,
          kind: rec.total === null || rec.total === undefined ? ('unavailable' as const) : ('status' as const),
        };
      });
      return { domain, status: 'historical-baseline', facts };
    }
    case 'compliance': {
      const surveys = records.filter((r) => r.kind === 'complianceSurvey');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'แบบสำรวจการปฏิบัติตาม', en: 'Behavioral compliance surveys' }, value: String(surveys.length), kind: 'number' },
          { label: { th: 'สถานะ', en: 'Status' }, value: { th: 'ตรวจเนื้อหาแล้ว (ไม่มีคะแนน)', en: 'Content-verified (no score)' }, kind: 'status' },
        ],
      };
    }
    case 'meetings': {
      const measures = records.filter((r) => r.kind === 'greenMeetingMeasures');
      const implementations = records.filter((r) => r.kind === 'ecoMaterialImplementation');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'มาตรการประชุมสีเขียว (3.4.1)', en: 'Green meeting measures (3.4.1)' }, value: String(measures.length), kind: 'number' },
          { label: { th: 'การจัดประชุมด้วยวัสดุสีเขียว (3.4.2)', en: 'Eco-material implementation (3.4.2)' }, value: String(implementations.length), kind: 'number' },
          {
            label: { th: 'ความครบถ้วน 3.4.2', en: '3.4.2 completeness' },
            value: { th: 'บางส่วน (ข้อ 3 ขึ้นไปในไฟล์เดี่ยว)', en: 'Partial (item 3 onward in standalone file)' },
            kind: 'status',
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
 * Category 3 resource management cycle (Blueprint §2 domain model, C5):
 * Measure → Monitor → Compare target → Analyze → Improve.
 * Compact operational loop, not a marketing surface.
 */
export const CAT3_MANAGEMENT_CYCLE: LoopStep[] = [
  {
    stage: '1',
    code: 'measure',
    label: { th: 'วัด', en: 'Measure' },
    summary: {
      th: 'จัดทำข้อมูลการใช้ทรัพยากรต่อหน่วย (น้ำ ไฟฟ้า น้ำมัน กระดาษ)',
      en: 'Record resource consumption per unit (water, electricity, fuel, paper)',
    },
    targetCode: '3.1.2',
  },
  {
    stage: '2',
    code: 'monitor',
    label: { th: 'ติดตาม', en: 'Monitor' },
    summary: {
      th: 'สำรวจการปฏิบัติตามมาตรการในพื้นที่ทำงาน',
      en: 'Survey compliance with conservation measures in work areas',
    },
    targetCode: '3.1.3',
  },
  {
    stage: '3',
    code: 'compare',
    label: { th: 'เทียบเป้าหมาย', en: 'Compare target' },
    summary: {
      th: 'เปรียบเทียบผลกับเป้าหมายลด 1% เทียบปี 2567',
      en: 'Compare results with the reduce-1%-vs-2024 target',
    },
    targetCode: '3.2.2',
  },
  {
    stage: '4',
    code: 'analyze',
    label: { th: 'วิเคราะห์', en: 'Analyze' },
    summary: {
      th: 'วิเคราะห์ผลและสรุปว่าบรรลุ/ไม่บรรลุเป้าหมาย',
      en: 'Analyze results and summarize met/not-met',
    },
    targetCode: '3.3.2',
  },
  {
    stage: '5',
    code: 'improve',
    label: { th: 'ปรับปรุง', en: 'Improve' },
    summary: {
      th: 'ทบทวนมาตรการ และจัดประชุม/นิทรรศการสีเขียวเพื่อลดผลกระทบ',
      en: 'Review measures and run green meetings/exhibitions to reduce impact',
    },
    targetCode: '3.4.1',
  },
];

/** Cycle stage(s) that a Cat3 indicator directly anchors (targetCode match). */
export function cycleStagesForIndicator(code: string): LoopStep[] {
  return CAT3_MANAGEMENT_CYCLE.filter((s) => s.targetCode === code);
}

export interface JourneyLink {
  from: string;
  to: string;
  label: Bilingual;
}

/** Explicit C5 journeys shown on the category page. */
export const CAT3_JOURNEYS: JourneyLink[] = [
  { from: '3.1.1', to: '3.1.2', label: { th: 'มาตรการน้ำ → ข้อมูลการใช้น้ำ', en: 'Water measures → Water data' } },
  { from: '3.2.1', to: '3.2.2', label: { th: 'มาตรการไฟฟ้า → ข้อมูลการใช้ไฟฟ้า', en: 'Electricity measures → Electricity data' } },
  { from: '3.2.4', to: '3.2.5', label: { th: 'มาตรการเดินทาง → ข้อมูลน้ำมัน', en: 'Travel measures → Fuel data' } },
  { from: '3.3.1', to: '3.3.2', label: { th: 'มาตรการกระดาษ → ข้อมูลการใช้กระดาษ', en: 'Paper measures → Paper data' } },
  { from: '3.4.1', to: '3.4.2', label: { th: 'มาตรการประชุมสีเขียว → การจัดประชุมด้วยวัสดุสีเขียว', en: 'Green-meeting measures → Eco-material meetings' } },
];
