/**
 * category1-presentation.ts
 * =========================
 * Read-only view-model for the Category 1 management presentation
 * (GOFFICE2026 Phase E/F). Builds presentation facts exclusively from the
 * canonical static contracts in src/data/category1/*.json plus canonical
 * criteria metadata. Never invents values, never reports the septic-tank
 * anomaly as a value, never fabricates FY2569, never scores.
 *
 * The contracts are the single source of truth for FY2568 facts; this module
 * only reshapes them for the Astro views (cycle, domain snapshot, indicator
 * context, cross-links).
 */

import activitiesAspectsData from '../data/category1/activities-aspects.json';
import lawsData from '../data/category1/laws.json';
import complianceData from '../data/category1/compliance.json';
import targetsData from '../data/category1/targets.json';
import ghgData from '../data/category1/ghg.json';
import projectsData from '../data/category1/projects.json';
import managementReviewData from '../data/category1/management-review.json';
import environmentalCommitteeData from '../data/category1/environmental-committee.json';
import environmentalAspectsData from '../data/category1/environmental-aspects-2568.json';
import indicatorsData from '../data/criteria/indicators.json';

export const CAT1_YEAR = 2568 as const;

export type Cat1Domain =
  | 'activities-aspects'
  | 'laws'
  | 'compliance'
  | 'targets'
  | 'ghg'
  | 'projects'
  | 'management-review'
  | 'environmental-committee'
  | 'environmental-aspects-2568';

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
  domain: Cat1Domain;
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

const CONTRACTS: Record<Cat1Domain, { records: ContractRecord[] }> = {
  'activities-aspects': activitiesAspectsData as { records: ContractRecord[] },
  laws: lawsData as { records: ContractRecord[] },
  compliance: complianceData as { records: ContractRecord[] },
  targets: targetsData as { records: ContractRecord[] },
  ghg: ghgData as { records: ContractRecord[] },
  projects: projectsData as { records: ContractRecord[] },
  'management-review': managementReviewData as { records: ContractRecord[] },
  'environmental-committee': environmentalCommitteeData as { records: ContractRecord[] },
  'environmental-aspects-2568': environmentalAspectsData as unknown as { records: ContractRecord[] },
};

/** Indicator code → contract domain that holds its FY2568 facts. */
export const INDICATOR_DOMAIN: Record<string, Cat1Domain> = {
  '1.1.1': 'activities-aspects',
  '1.1.2': 'activities-aspects',
  '1.1.3': 'targets',
  '1.1.4': 'projects',
  '1.2.1': 'environmental-committee',
  '1.3.1': 'environmental-aspects-2568',
  '1.3.2': 'environmental-aspects-2568',
  '1.3.3': 'environmental-aspects-2568',
  '1.4.1': 'laws',
  '1.4.2': 'compliance',
  '1.5.1': 'ghg',
  '1.5.2': 'ghg',
  '1.6.1': 'projects',
  '1.6.2': 'projects',
  '1.7.1': 'management-review',
  '1.7.2': 'management-review',
};

/** Indicators declared MISSING in the contracts — always shown as unavailable. */
export const MISSING_CAT1_INDICATORS = ['1.2.2', '1.5.3'] as const;

export function contractForDomain(domain: Cat1Domain): { records: ContractRecord[] } {
  return CONTRACTS[domain];
}

export function domainForIndicator(code: string): Cat1Domain | null {
  return INDICATOR_DOMAIN[code] || null;
}

/**
 * Build the presentation snapshot for a contract domain. Every fact derives
 * from the contract records; no value is invented.
 */
export function buildCat1DomainSnapshot(domain: Cat1Domain): DomainSnapshot {
  const records = CONTRACTS[domain].records;

  switch (domain) {
    case 'activities-aspects': {
      const scope = records.find((r) => r.kind === 'scope');
      const orgs = records.filter((r) => r.kind === 'scopeOrganization');
      const policies = records.filter((r) => r.kind === 'policyCommitment');
      const approval = records.find((r) => r.kind === 'policyApproval');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          scope && typeof scope.officeAreaSqm === 'number'
            ? { label: { th: 'พื้นที่ในขอบเขต', en: 'Scope area' }, value: `${scope.officeAreaSqm} ตร.ม.`, kind: 'number' }
            : { label: { th: 'พื้นที่ในขอบเขต', en: 'Scope area' }, value: '—', kind: 'unavailable' },
          orgs.length
            ? { label: { th: 'หน่วยงานในขอบเขต', en: 'Organizations in scope' }, value: String(orgs.length), kind: 'number' }
            : { label: { th: 'หน่วยงานในขอบเขต', en: 'Organizations in scope' }, value: '—', kind: 'unavailable' },
          policies.length
            ? { label: { th: 'ข้อนโยบาย', en: 'Policy statements' }, value: String(policies.length), kind: 'number' }
            : { label: { th: 'ข้อนโยบาย', en: 'Policy statements' }, value: '—', kind: 'unavailable' },
          approval?.announcementDateISO
            ? { label: { th: 'ประกาศใช้นโยบาย', en: 'Policy announcement' }, value: String(approval.announcementDateISO), kind: 'text' }
            : { label: { th: 'ประกาศใช้นโยบาย', en: 'Policy announcement' }, value: '—', kind: 'unavailable' },
        ],
      };
    }
    case 'laws': {
      const topics = records.filter((r) => r.kind === 'legal-item');
      const requirements = records.filter((r) => r.kind === 'legal-requirement');
      const mappings = records.filter((r) => r.kind === 'aspect-legal-mapping');
      const latestReview = topics
        .flatMap((r) => (Array.isArray(r.reviewDates) ? r.reviewDates : [r.reviewDate]))
        .map(String)
        .filter(Boolean)
        .sort()
        .at(-1);
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'หัวข้อกฎหมาย', en: 'Legal topics' }, value: String(topics.length), kind: 'number' },
          { label: { th: 'ข้อกำหนด (ทะเบียน)', en: 'Register requirements' }, value: String(requirements.length), kind: 'number' },
          mappings.length
            ? { label: { th: 'การเชื่อมประเด็น (1.3↔1.4)', en: 'Aspect↔law links' }, value: String(mappings.length), kind: 'number' }
            : { label: { th: 'การเชื่อมประเด็น (1.3↔1.4)', en: 'Aspect↔law links' }, value: '—', kind: 'unavailable' },
          latestReview
            ? { label: { th: 'ทบทวนล่าสุด', en: 'Latest review' }, value: latestReview, kind: 'text' }
            : { label: { th: 'ทบทวนล่าสุด', en: 'Latest review' }, value: '—', kind: 'unavailable' },
        ],
      };
    }
    case 'compliance': {
      const evalRec = records.find((r) => r.kind === 'evaluation');
      const assessments = records.filter((r) => r.kind === 'legal-compliance-assessment');
      const needsReview = assessments.filter((r) => r.status === 'needs_review').length;
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          {
            label: { th: 'ผลการประเมิน', en: 'Evaluation result' },
            value: evalRec?.result === 'partial' ? 'บางส่วน (ข้อมูลสัมภาษณ์ยังไม่พร้อม)' : String(evalRec?.result || '—'),
            kind: evalRec?.result ? 'status' : 'unavailable',
          },
          assessments.length
            ? { label: { th: 'การประเมินรายข้อ', en: 'Row assessments' }, value: String(assessments.length), kind: 'number' }
            : { label: { th: 'การประเมินรายข้อ', en: 'Row assessments' }, value: '—', kind: 'unavailable' },
          needsReview
            ? { label: { th: 'ต้องทบทวน', en: 'Needs review' }, value: String(needsReview), kind: 'status' }
            : { label: { th: 'ต้องทบทวน', en: 'Needs review' }, value: '0', kind: 'number' },
          evalRec?.reviewer
            ? { label: { th: 'ผู้ตรวจสอบ', en: 'Reviewer' }, value: String(evalRec.reviewer), kind: 'text' }
            : { label: { th: 'ผู้ตรวจสอบ', en: 'Reviewer' }, value: '—', kind: 'unavailable' },
        ],
      };
    }
    case 'targets': {
      const targets = records.filter((r) => r.kind === 'target');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          { label: { th: 'เป้าหมาย', en: 'Targets' }, value: String(targets.length), kind: 'number' },
          {
            label: { th: 'อ้างอิงปีฐาน', en: 'Comparison basis' },
            value: targets[0]?.comparisonBasis ? String(targets[0].comparisonBasis) : '—',
            kind: 'text',
          },
        ],
      };
    }
    case 'ghg': {
      const inv = records.find((r) => r.kind === 'inventory');
      const perf = records.find((r) => r.kind === 'performance');
      const exclusions = records.filter((r) => r.kind === 'exclusion');
      const facts: DomainFact[] = [];
      if (inv && typeof inv.totalTCO2e === 'number') {
        facts.push({ label: { th: 'ปริมาณ GHG รวม (ปี 2568)', en: 'Total GHG (FY2568)' }, value: `${inv.totalTCO2e} tCO₂e`, kind: 'number' });
      }
      if (perf && typeof perf.met === 'boolean') {
        facts.push({
          label: { th: 'บรรลุเป้าหมาย', en: 'Target met' },
          value: perf.met ? { th: 'บรรลุ', en: 'Met' } : { th: 'ยังไม่บรรลุ', en: 'Not met' },
          kind: 'status',
        });
      }
      facts.push({
        label: { th: 'รายการยกเว้น (ข้อมูลที่ยังไม่ถูกต้อง)', en: 'Excluded records' },
        value: String(exclusions.length),
        kind: 'number',
      });
      return { domain, status: 'normalized-verified', facts };
    }
    case 'projects': {
      const projects = records.filter((r) => r.kind === 'project');
      const plans = records.filter((r) => r.kind === 'plan');
      return {
        domain,
        status: 'normalized-partial',
        facts: [
          { label: { th: 'โครงการ', en: 'Projects' }, value: String(projects.length), kind: 'number' },
          { label: { th: 'แผนลดก๊าซเรือนกระจก', en: 'Reduction plans' }, value: String(plans.length), kind: 'number' },
        ],
      };
    }
    case 'management-review': {
      const quorum = records.find((r) => r.kind === 'quorum');
      const meetings = records.filter((r) => r.kind === 'meeting');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          quorum && typeof quorum.attendancePct === 'number'
            ? { label: { th: 'องค์ประชุมเข้าร่วม', en: 'Quorum attendance' }, value: `${quorum.attendancePct}%`, kind: 'number' }
            : { label: { th: 'องค์ประชุมเข้าร่วม', en: 'Quorum attendance' }, value: '—', kind: 'unavailable' },
          { label: { th: 'การประชุมทบทวน', en: 'Review meetings' }, value: String(meetings.length), kind: 'number' },
        ],
      };
    }
    case 'environmental-committee': {
      const ec = records.find((r) => r.kind === 'environmentalCommittee');
      const auth = records.find((r) => r.kind === 'appointmentAuthority');
      const groups = records.filter((r) => r.kind === 'committeeGroup');
      return {
        domain,
        status: 'historical-baseline',
        facts: [
          ec
            ? {
                label: { th: 'หน่วยงานในขอบเขต', en: 'Organizations' },
                value: String(ec.organizationCount),
                kind: 'number',
              }
            : { label: { th: 'หน่วยงานในขอบเขต', en: 'Organizations' }, value: '—', kind: 'unavailable' },
          ec
            ? {
                label: { th: 'ครอบคลุมบุคลากร (รวม)', en: 'Personnel coverage (sum)' },
                value: {
                  th: `${ec.personnelCoverageTotal} (ไม่ใช่กรรมการไม่ซ้ำ)`,
                  en: `${ec.personnelCoverageTotal} (not deduplicated members)`,
                },
                kind: 'text',
              }
            : { label: { th: 'ครอบคลุมบุคลากร', en: 'Personnel coverage' }, value: '—', kind: 'unavailable' },
          auth?.dateBE
            ? { label: { th: 'ลงนามแต่งตั้ง', en: 'Appointment signed' }, value: String(auth.dateBE), kind: 'text' }
            : { label: { th: 'ลงนามแต่งตั้ง', en: 'Appointment signed' }, value: '—', kind: 'unavailable' },
          { label: { th: 'กลุ่มคณะกรรมการ', en: 'Committee groups' }, value: String(groups.length), kind: 'number' },
        ],
      };
    }
    case 'environmental-aspects-2568': {
      const aspects = records.filter((r) => r.kind === 'aspect');
      const significant = (environmentalAspectsData as EnvAspectsDataset).significantIssues?.length ?? 0;
      const projectLinks = (environmentalAspectsData as EnvAspectsDataset).projectLinks?.length ?? 0;
      return {
        domain,
        status: 'normalized-verified',
        facts: [
          { label: { th: 'กิจกรรมในขอบเขต', en: 'Activities' }, value: String(aspects.length ? (environmentalAspectsData as EnvAspectsDataset).activities?.length ?? 0 : 0), kind: 'number' },
          { label: { th: 'ประเด็นปัญหาสิ่งแวดล้อม', en: 'Environmental aspects' }, value: String(aspects.length), kind: 'number' },
          { label: { th: 'ประเด็นนัยสำคัญ (M/H)', en: 'Significant (M/H)' }, value: String(significant), kind: 'number' },
          { label: { th: 'โครงการที่เชื่อมโยง', en: 'Linked projects' }, value: String(projectLinks), kind: 'number' },
        ],
      };
    }
  }
}

export interface EnvAspectAssessment {
  likelihoodFactors: number[];
  likelihoodTotal: number | null;
  severityFactors: number[];
  severityTotal: number | null;
  riskScore: number | null;
  registerSignificance: 'L' | 'M' | 'H' | null;
  prioritySignificance: 'L' | 'M' | 'H' | null;
  priorityScore: number | null;
  significance: 'L' | 'M' | 'H';
  significanceSource: 'register' | 'priority';
  reclassified: boolean;
}

export interface EnvironmentalAspect2568 {
  id: string;
  year: number;
  kind: string;
  activityId: string;
  activity: string;
  inputOutput: 'input' | 'output';
  aspect: string;
  impact: string | null;
  impactMeaning: string | null;
  directIndirect: 'direct' | 'indirect';
  condition: 'normal' | 'abnormal' | 'emergency';
  applicableLaw: 'Y' | 'N';
  assessment: EnvAspectAssessment;
  controlMeasure: { text: string; source: 'register' | 'priority' } | null;
  projectReference: { projectId: string; projectTitle: string } | null;
  sourceTrace: {
    sourceFile: string;
    sheet: string;
    sourceRow: number;
    prioritySheet: string | null;
    priorityRow: number | null;
    priorityRank: number | null;
  };
}

export interface SignificantIssueView {
  id: string;
  aspectId: string;
  activity: string;
  aspect: string;
  significance: 'L' | 'M' | 'H';
  riskScore: number | null;
  priorityRank: number | null;
  control: string | null;
  project: { projectId: string; projectTitle: string } | null;
}

export interface ProjectLinkageView {
  id: string;
  aspectId: string;
  activity: string;
  aspect: string;
  projectId: string;
  projectTitle: string;
  controlText: string | null;
}

interface EnvAspectsDataset {
  activities: { id: string; name: string }[];
  records: EnvironmentalAspect2568[];
  significantIssues: {
    id: string;
    aspectId: string;
    activity: string;
    aspect: string;
    significance: 'L' | 'M' | 'H';
    riskScore: number | null;
    priorityRank: number | null;
    controlMeasure: { text: string; source: string } | null;
    projectReference: { projectId: string; projectTitle: string } | null;
  }[];
  projectLinks: {
    id: string;
    aspectId: string;
    activity: string;
    aspect: string;
    projectId: string;
    projectTitle: string;
    controlText: string | null;
  }[];
  summary: {
    activityCount: number;
    aspectCount: number;
    significantCount: number;
    projectLinkCount: number;
    byInputOutput: Record<string, number>;
    byDirectIndirect: Record<string, number>;
    byCondition: Record<string, number>;
    bySignificance: Record<string, number>;
  };
}

/** Raw canonical FY2568 environmental aspect dataset (read-only). */
export function environmentalAspectsDataset(): EnvAspectsDataset {
  return environmentalAspectsData as unknown as EnvAspectsDataset;
}

/**
 * 1.3.1 — Environmental Assessment Explorer: activities grouped with their
 * aspects, preserving register order. Read-only reshaping of the canonical
 * dataset; no values are invented.
 */
export function buildAspectExplorer(): { activityId: string; activity: string; aspects: EnvironmentalAspect2568[] }[] {
  const data = environmentalAspectsDataset();
  const groups = new Map<string, { activityId: string; activity: string; aspects: EnvironmentalAspect2568[] }>();
  for (const a of data.records) {
    if (!groups.has(a.activityId)) {
      groups.set(a.activityId, { activityId: a.activityId, activity: a.activity, aspects: [] });
    }
    groups.get(a.activityId)!.aspects.push(a);
  }
  const order = new Map(data.activities.map((act, i) => [act.id, i]));
  return [...groups.values()].sort(
    (x, y) => (order.get(x.activityId) ?? 0) - (order.get(y.activityId) ?? 0),
  );
}

/**
 * 1.3.2 — Significant issues DERIVED from the canonical aspect dataset
 * (source-defined M/H classification). Never a second manual issue registry.
 */
export function buildSignificantIssueView(): SignificantIssueView[] {
  return environmentalAspectsDataset().significantIssues.map((si) => ({
    id: si.id,
    aspectId: si.aspectId,
    activity: si.activity,
    aspect: si.aspect,
    significance: si.significance,
    riskScore: si.riskScore,
    priorityRank: si.priorityRank,
    control: si.controlMeasure ? si.controlMeasure.text : null,
    project: si.projectReference,
  }));
}

/**
 * 1.3.3 — Project linkage: only documentary links (control text → canonical
 * projects.json). No project is auto-created from M/H records or control text.
 */
export function buildProjectLinkageView(): ProjectLinkageView[] {
  return environmentalAspectsDataset().projectLinks.map((pl) => ({
    id: pl.id,
    aspectId: pl.aspectId,
    activity: pl.activity,
    aspect: pl.aspect,
    projectId: pl.projectId,
    projectTitle: pl.projectTitle,
    controlText: pl.controlText,
  }));
}

export interface RelationLink {
  to: string;
  label: Bilingual;
  reason: Bilingual;
}

/**
 * Cross-indicator journey map (Phase F). Explicit, curated relationships
 * grounded in the Blueprint §5 canonical relationship model and the contract
 * coverage; no invented relations.
 */
export const INDICATOR_RELATIONS: Record<string, RelationLink[]> = {
  '1.1.4': [
    { to: '1.6.1', label: { th: 'แผน 2568 ↔ แผนลด GHG', en: 'FY2568 plan ↔ GHG reduction plan' }, reason: { th: 'บันทึก proj-plan-1 ใช้ร่วมกัน', en: 'Shared proj-plan-1 record' } },
  ],
  '1.2.1': [
    { to: '1.1.4', label: { th: 'ธรรมาภิบาล → แผนประจำปี', en: 'Governance → Annual plan' }, reason: { th: 'คณะกรรมการรับผิดชอบการดำเนินงานตามแผน', en: 'Committee accountable for plan execution' } },
    { to: '1.7.2', label: { th: 'ธรรมาภิบาล → ทบทวนฝ่ายบริหาร', en: 'Governance → Management review' }, reason: { th: 'การเปลี่ยนแปลงคณะกรรมการทบทวนใน MR #1', en: 'Committee changes reviewed at MR #1' } },
  ],
  '1.1.1': [
    { to: '1.3.1', label: { th: 'ขอบเขต → การประเมินกิจกรรม', en: 'Scope → Activity assessment' }, reason: { th: 'กิจกรรมในขอบเขตถูกระบุและประเมินใน 1.3.1', en: 'In-scope activities are assessed under 1.3.1' } },
  ],
  '1.3.1': [
    { to: '1.4.1', label: { th: 'ประเด็น → กฎหมายที่เกี่ยวข้อง', en: 'Aspects → Applicable laws' }, reason: { th: 'กฎหมายที่เกี่ยวข้องกับประเด็นปัญหาอยู่ใน 1.4.1', en: 'Laws applicable to aspects are registered in 1.4.1' } },
    { to: '1.4.2', label: { th: 'ประเด็น → การประเมินความสอดคล้อง', en: 'Aspects → Compliance evaluation' }, reason: { th: 'ความสอดคล้องของกฎหมายประเมินใน 1.4.2', en: 'Legal compliance is evaluated in 1.4.2' } },
  ],
  '1.4.1': [
    { to: '1.4.2', label: { th: 'ทะเบียน → การประเมินความสอดคล้อง', en: 'Register → Compliance evaluation' }, reason: { th: 'แถว √ ในทะเบียนถูกประเมินใน 1.4.2', en: 'Register √ marks are assessed under 1.4.2' } },
    { to: '1.3.1', label: { th: 'กฎหมาย ↔ ประเด็น 1.3', en: 'Laws ↔ 1.3 aspects' }, reason: { th: 'มีการเชื่อม 1 รายการจากแหล่งเท่านั้น (ea-79)', en: 'Only one source-explicit link (ea-79)' } },
  ],
  '1.4.2': [
    { to: '1.4.1', label: { th: 'การประเมิน → ทะเบียนกฎหมาย', en: 'Evaluation → Legal register' }, reason: { th: 'การประเมินรายข้ออ้างอิงทะเบียน 1.4', en: 'Row assessments reference the 1.4 register' } },
    { to: '1.3.1', label: { th: 'ความสอดคล้อง → ประเด็น', en: 'Compliance → Aspects' }, reason: { th: 'ประเด็นที่เชื่อมชัดในแหล่งอยู่ที่ 1.3.1 / 1.4.1', en: 'Explicitly linked aspects live under 1.3.1 / 1.4.1' } },
  ],
  '1.1.3': [
    { to: '1.5.2', label: { th: 'เป้าหมาย → วิเคราะห์ผล GHG', en: 'Targets → GHG analysis' }, reason: { th: 'ผล GHG เทียบเป้าหมายใน 1.5.2', en: 'GHG performance vs target is analysed in 1.5.2' } },
  ],
  '1.5.1': [
    { to: '1.5.2', label: { th: 'ข้อมูล GHG → สรุป/วิเคราะห์ผล', en: 'GHG data → Summary/analysis' }, reason: { th: 'ข้อมูลจาก 1.5.1 ใช้วิเคราะห์ผลใน 1.5.2', en: '1.5.1 data feeds the 1.5.2 analysis' } },
    { to: '1.6.1', label: { th: 'ข้อมูล GHG → แผนลด', en: 'GHG data → Reduction plan' }, reason: { th: 'แผนขับเคลื่อนลด GHG ใน 1.6.1', en: 'Reduction planning in 1.6.1' } },
  ],
  '1.5.2': [
    { to: '1.6.2', label: { th: 'ผลวิเคราะห์ → โครงการลด GHG', en: 'Analysis → Reduction projects' }, reason: { th: 'โครงการลด GHG ดำเนินการใน 1.6.2', en: 'Reduction projects run under 1.6.2' } },
  ],
  '1.3.3': [
    { to: '1.6.2', label: { th: 'โครงการ 1.3.3 ↔ โครงการ 1.6.2', en: '1.3.3 ↔ 1.6.2 projects' }, reason: { th: 'ไม่สร้างบันทึกโครงการซ้ำ (Blueprint §4.3/§4.6)', en: 'One canonical project record across indicators' } },
  ],
  '1.6.2': [
    { to: '1.3.3', label: { th: 'โครงการ 1.6.2 ↔ โครงการ 1.3.3', en: '1.6.2 ↔ 1.3.3 projects' }, reason: { th: 'โครงการร่วมใช้บันทึกเดียว', en: 'Shared canonical project record' } },
    { to: '1.7.2', label: { th: 'โครงการ → การทบทวนฝ่ายบริหาร', en: 'Projects → Management review' }, reason: { th: 'ผลโครงการนำเข้าสู่การทบทวนใน 1.7.2', en: 'Project results feed the 1.7.2 review' } },
  ],
  '1.7.2': [
    { to: '1.1.2', label: { th: 'ทบทวน → นโยบาย', en: 'Review → Policy' }, reason: { th: 'ผลทบทวนนำไปสู่การปรับนโยบายรอบถัดไป', en: 'Review feeds next-cycle policy' } },
    { to: '1.1.3', label: { th: 'ทบทวน → เป้าหมาย', en: 'Review → Targets' }, reason: { th: 'ผลทบทวนนำไปสู่การปรับเป้าหมาย', en: 'Review feeds target revision' } },
    { to: '1.1.4', label: { th: 'ทบทวน → แผนปีถัดไป', en: 'Review → Next plan' }, reason: { th: 'การตัดสินใจใน 1.7.2 นำไปสู่แผนรอบถัดไป', en: 'Review decisions roll into the next plan' } },
  ],
};

export function relatedIndicatorsFor(code: string): RelationLink[] {
  return INDICATOR_RELATIONS[code] || [];
}

export function indicatorTitle(code: string, locale: 'th' | 'en'): string {
  const ind = (indicatorsData as { indicators: IndicatorShape[] }).indicators.find(
    (i) => i.code === code,
  );
  if (!ind) return code;
  return ind.title[locale] || ind.title.th;
}

export interface CycleStep {
  issue: string;
  code: string;
  label: Bilingual;
  summary: Bilingual;
  targetCode: string;
}

/** Management cycle steps (Blueprint §3) — each links to its first indicator. */
export const CAT1_MANAGEMENT_CYCLE: CycleStep[] = [
  {
    issue: '1.1',
    code: 'define',
    label: { th: 'กำหนด (Define)', en: 'Define' },
    summary: { th: 'บริบท/ขอบเขต นโยบาย เป้าหมาย และแผน', en: 'Context, policy, targets and plan' },
    targetCode: '1.1.1',
  },
  {
    issue: '1.2',
    code: 'govern',
    label: { th: 'ธรรมาภิบาล (Govern)', en: 'Govern' },
    summary: { th: 'คณะกรรมการและความเข้าใจบทบาทหน้าที่', en: 'Committee and role understanding' },
    targetCode: '1.2.1',
  },
  {
    issue: '1.3',
    code: 'identify',
    label: { th: 'ระบุ (Identify)', en: 'Identify' },
    summary: { th: 'กิจกรรม → ประเด็นปัญหา → ความสำคัญ', en: 'Activities → aspects → significance' },
    targetCode: '1.3.1',
  },
  {
    issue: '1.4',
    code: 'comply',
    label: { th: 'ปฏิบัติตาม (Comply)', en: 'Comply' },
    summary: { th: 'ทะเบียนกฎหมายและการประเมินความสอดคล้อง', en: 'Legal register and compliance evaluation' },
    targetCode: '1.4.1',
  },
  {
    issue: '1.5',
    code: 'measure',
    label: { th: 'วัดผล (Measure)', en: 'Measure' },
    summary: { th: 'ข้อมูล GHG และผลเทียบเป้าหมาย', en: 'GHG inventory and target performance' },
    targetCode: '1.5.1',
  },
  {
    issue: '1.6',
    code: 'improve',
    label: { th: 'ปรับปรุง (Improve)', en: 'Improve' },
    summary: { th: 'แผนและโครงการลดก๊าซเรือนกระจก', en: 'Reduction plan and projects' },
    targetCode: '1.6.1',
  },
  {
    issue: '1.7',
    code: 'review',
    label: { th: 'ทบทวน (Review)', en: 'Review' },
    summary: { th: 'การทบทวนฝ่ายบริหารและข้อตัดสินใจ', en: 'Management review and decisions' },
    targetCode: '1.7.1',
  },
];

export interface JourneyLink {
  from: string;
  to: string;
  label: Bilingual;
}

/** Explicit Phase F journeys shown on the category page. */
export const CAT1_JOURNEYS: JourneyLink[] = [
  { from: '1.1.1', to: '1.3.1', label: { th: 'ขอบเขต → การประเมินประเด็น', en: 'Scope → Aspect assessment' } },
  { from: '1.3.1', to: '1.4.1', label: { th: 'ประเด็น ↔ กฎหมาย', en: 'Aspects ↔ Laws' } },
  { from: '1.1.3', to: '1.5.2', label: { th: 'เป้าหมาย → ผล GHG', en: 'Targets → GHG analysis' } },
  { from: '1.3.3', to: '1.6.2', label: { th: 'โครงการ 1.3.3 ↔ 1.6.2', en: 'Projects 1.3.3 ↔ 1.6.2' } },
  { from: '1.5.1', to: '1.6.1', label: { th: 'ข้อมูล GHG → แผนลด', en: 'GHG data → Reduction plan' } },
  { from: '1.7.2', to: '1.1.4', label: { th: 'ทบทวน → แผนรอบถัดไป', en: 'Review → Next-cycle plan' } },
];
