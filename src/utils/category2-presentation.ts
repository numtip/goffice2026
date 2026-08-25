/**
 * category2-presentation.ts
 * ==========================
 * Read-only view-model for the Category 2 communication presentation
 * (GOFFICE2026 CAT2 C5). Builds presentation facts exclusively from the
 * canonical static contracts in src/data/category2/*.json, the C3 evidence
 * index, and canonical criteria metadata. Never invents values, never reports
 * 2.2.3 as covered, never fabricates FY2569, never scores.
 *
 * The contracts are the single source of truth for FY2568 facts; this module
 * only reshapes them for the Astro views (communication loop, domain snapshot,
 * indicator context, source-document grouping).
 */

import trainingData from '../data/category2/training.json';
import communicationData from '../data/category2/communication.json';
import feedbackData from '../data/category2/feedback.json';
import indicatorsData from '../data/criteria/indicators.json';

export const CAT2_YEAR = 2568 as const;

export type Cat2Domain = 'training' | 'communication' | 'feedback';

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
  domain: Cat2Domain;
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

const CONTRACTS: Record<Cat2Domain, { records: ContractRecord[] }> = {
  training: trainingData as { records: ContractRecord[] },
  communication: communicationData as { records: ContractRecord[] },
  feedback: feedbackData as { records: ContractRecord[] },
};

/** Indicator code → contract domain that holds its FY2568 facts. */
export const CAT2_INDICATOR_DOMAIN: Record<string, Cat2Domain | null> = {
  '2.1.1': 'training',
  '2.1.2': 'training',
  '2.2.1': 'communication',
  '2.2.2': 'communication',
  '2.2.3': null, // MISSING_DEDICATED_EVIDENCE — no contract domain
  '2.2.4': 'feedback',
};

/** Indicators declared MISSING/thin in the C1 disposition — always shown honestly. */
export const MISSING_CAT2_INDICATORS = ['2.2.3'] as const;
export const THIN_CAT2_INDICATORS = ['2.2.2'] as const;

export function contractForDomain(domain: Cat2Domain): { records: ContractRecord[] } {
  return CONTRACTS[domain];
}

export function domainForIndicator(code: string): Cat2Domain | null {
  return CAT2_INDICATOR_DOMAIN[code] ?? null;
}

export function indicatorTitle(code: string, locale: 'th' | 'en'): string {
  const ind = (indicatorsData as { indicators: IndicatorShape[] }).indicators.find(
    (i) => i.code === code,
  );
  if (!ind) return code;
  return ind.title[locale] || ind.title.th;
}

/**
 * Build the presentation snapshot for a Cat2 contract domain. Every fact derives
 * from the contract records; no value is invented.
 */
export function buildCat2DomainSnapshot(domain: Cat2Domain): DomainSnapshot {
  const records = CONTRACTS[domain].records;

  switch (domain) {
    case 'training': {
      const plans = records.filter((r) => r.kind === 'trainingPlan');
      const deliveries = records.filter((r) => r.kind === 'trainingDelivery');
      const evaluations = records.filter((r) => r.kind === 'trainingEvaluation');
      const histories = records.filter((r) => r.kind === 'trainingHistory');
      const responsibilities = records.filter((r) => r.kind === 'courseResponsibility');
      const trainers = records.filter((r) => r.kind === 'trainerQualification');
      const scans = records.filter((r) => r.availability === 'filename_folder_only');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'แผนการฝึกอบรม (2.1.1)', en: 'Training plans (2.1.1)' }, value: String(plans.length), kind: 'number' },
          { label: { th: 'การดำเนินการอบรม', en: 'Training delivery' }, value: String(deliveries.length), kind: 'number' },
          { label: { th: 'การประเมินผล + ประวัติอบรม', en: 'Evaluation + training records' }, value: String(evaluations.length + histories.length), kind: 'number' },
          { label: { th: 'ผู้รับผิดชอบ/วิทยากร (2.1.2)', en: 'Course responsibility / trainers (2.1.2)' }, value: String(responsibilities.length + trainers.length), kind: 'number' },
          scans.length
            ? { label: { th: 'ใบลงทะเบียนที่รอตรวจ (สแกน)', en: 'Sign-in scans pending verification' }, value: String(scans.length), kind: 'status' }
            : { label: { th: 'ใบลงทะเบียนที่รอตรวจ', en: 'Sign-in scans pending' }, value: '0', kind: 'number' },
        ],
      };
    }
    case 'communication': {
      const responsibilities = records.filter((r) => r.kind === 'communicationResponsibility' || r.kind === 'communicationResponsibilityScan');
      const plans = records.filter((r) => r.kind === 'communicationPlan');
      const targetGroups = records.filter((r) => r.kind === 'communicationTargetGroups');
      const campaigns = records.filter((r) => r.kind === 'campaignNarrative');
      const candidates = records.filter((r) => r.kind === 'campaignCandidate' && r.promoted !== true);
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'ผู้รับผิดชอบ/แนวทางสื่อสาร (2.2.1)', en: 'Communication responsibility/guidelines (2.2.1)' }, value: String(responsibilities.length), kind: 'number' },
          { label: { th: 'แผนสื่อสาร + กลุ่มเป้าหมาย', en: 'Communication plan + target groups' }, value: String(plans.length + targetGroups.length), kind: 'number' },
          {
            label: { th: 'หลักฐานการรณรงค์ (2.2.2)', en: 'Campaign evidence (2.2.2)' },
            value: { th: `${campaigns.length} (ระดับ THIN)`, en: `${campaigns.length} (THIN)` },
            kind: 'status',
          },
          candidates.length
            ? { label: { th: 'สแกนผู้สมัครรอตรวจ', en: 'Candidate scans pending' }, value: String(candidates.length), kind: 'status' }
            : { label: { th: 'สแกนผู้สมัครรอตรวจ', en: 'Candidate scans pending' }, value: '0', kind: 'number' },
        ],
      };
    }
    case 'feedback': {
      const channels = records.filter((r) => r.kind === 'feedbackChannels');
      const guidelines = records.filter((r) => r.kind === 'feedbackGuideline');
      const recordsUsed = records.filter((r) => r.kind === 'feedbackImprovementRecord');
      const reports = records.filter((r) => r.kind === 'feedbackAggregateReport');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'ช่องทางรับข้อเสนอแนะ (2.2.4)', en: 'Feedback channels (2.2.4)' }, value: String(channels.length), kind: 'number' },
          { label: { th: 'แนวทาง/ขั้นตอนการปรับปรุง', en: 'Guideline / improvement procedure' }, value: String(guidelines.length), kind: 'number' },
          { label: { th: 'บันทึกข้อร้องเรียนที่ปรับปรุง', en: 'Complaint improvement records' }, value: String(recordsUsed.length), kind: 'number' },
          { label: { th: 'รายงานสรุปประจำปี', en: 'Annual summary report' }, value: String(reports.length), kind: 'number' },
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
 * Category 2 operational communication loop (Blueprint §2 domain model, C5):
 * Plan → Assign → Communicate → Capture feedback → Management review.
 * Compact operational loop, not a marketing surface.
 */
export const CAT2_COMMUNICATION_LOOP: LoopStep[] = [
  {
    stage: '1',
    code: 'plan',
    label: { th: 'วางแผน', en: 'Plan' },
    summary: {
      th: 'แผนการฝึกอบรม แผนการสื่อสาร และกลุ่มเป้าหมาย',
      en: 'Training plan, communication plan and target groups',
    },
    targetCode: '2.1.1',
  },
  {
    stage: '2',
    code: 'assign',
    label: { th: 'มอบหมาย', en: 'Assign' },
    summary: {
      th: 'ผู้รับผิดชอบการสื่อสารและวิทยากรแต่ละหลักสูตร',
      en: 'Communication responsibility and per-course trainers',
    },
    targetCode: '2.2.1',
  },
  {
    stage: '3',
    code: 'communicate',
    label: { th: 'สื่อสาร', en: 'Communicate' },
    summary: {
      th: 'อบรมให้ความรู้และรณรงค์ตามแผน 2.2.1',
      en: 'Training and campaigns delivered per the 2.2.1 plan',
    },
    targetCode: '2.2.2',
  },
  {
    stage: '4',
    code: 'capture',
    label: { th: 'รับฟัง', en: 'Capture feedback' },
    summary: {
      th: 'ช่องทางรับข้อเสนอแนะ/ข้อร้องเรียนอย่างเป็นระบบ',
      en: 'Systematic feedback and complaint channels',
    },
    targetCode: '2.2.4',
  },
  {
    stage: '5',
    code: 'review',
    label: { th: 'ทบทวน', en: 'Management review' },
    summary: {
      th: 'สรุปผล รายงานผู้บริหาร และนำไปปรับปรุงรอบถัดไป',
      en: 'Summarize, report to management and feed the next cycle',
    },
    targetCode: '2.2.4',
  },
];

export interface JourneyLink {
  from: string;
  to: string;
  label: Bilingual;
}

/** Explicit C5 journeys shown on the category page. */
export const CAT2_JOURNEYS: JourneyLink[] = [
  { from: '2.1.1', to: '2.1.2', label: { th: 'แผนการอบรม → ผู้รับผิดชอบ/วิทยากร', en: 'Training plan → Course responsibility' } },
  { from: '2.2.1', to: '2.2.2', label: { th: 'แนวทางสื่อสาร → การรณรงค์', en: 'Communication plan → Campaigns' } },
  { from: '2.2.4', to: '2.2.1', label: { th: 'ข้อเสนอแนะ → ผู้รับผิดชอบการสื่อสาร', en: 'Feedback → Communication responsibility' } },
];
