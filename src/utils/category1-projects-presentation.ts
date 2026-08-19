/**
 * category1-projects-presentation.ts
 * Read-only FY2568 CAT1-1.6 plan & project view-model from canonical projects.json.
 */
import projectsContract from '../data/category1/projects.json';
import { buildGhgPerformance } from './category1-ghg-presentation';
import { CAT1_YEAR } from './category1-presentation';

export { CAT1_YEAR };

export type GhgImpactStatus = 'ghg_measured' | 'ghg_supporting_action' | 'environmental_improvement';

type ProjectRecord = Record<string, unknown> & { id: string; kind: string };

export interface ProjectKpiView {
  id: string;
  labelTh: string;
  labelEn: string;
  target: string;
  actual: string;
  targetMet: boolean;
}

export interface ProjectView {
  id: string;
  title: string;
  period: string;
  objectives: string[];
  owners: string[];
  ghgImpactStatus: GhgImpactStatus;
  targetStatus: string;
  measuredReduction: null;
  kpis: ProjectKpiView[];
  results: string[];
  continuityAction: string;
  budgetTHB?: number;
  actualSpendTHB?: number;
  linkedAspectIds: string[];
  linkedIndicators: string[];
  sourceRef: string;
  anomalies: { type: string; note: string }[];
}

export interface PlanElementView {
  id: string;
  labelTh: string;
  labelEn: string;
  status: 'supported' | 'partial' | 'unavailable';
  detailTh: string;
  detailEn: string;
}

export interface ReductionPlanView {
  id: string;
  title: string;
  period: string;
  planStatus: 'PARTIAL';
  writtenPlan: boolean;
  executiveApproved: boolean;
  durationYears: number;
  carbonNeutralityDocumented: boolean;
  netZeroDocumented: boolean;
  linksToIndicators: string[];
  activitiesSourceStatus: string;
  activitiesSourceRef: string;
  verificationBasis: string;
  elements: PlanElementView[];
}

export interface PerformanceGapDisclaimer {
  th: string;
  en: string;
  actualChangePct: number;
}

function records(): ProjectRecord[] {
  return projectsContract.records as ProjectRecord[];
}

function mapKpis(rec: ProjectRecord): ProjectKpiView[] {
  const kpis = rec.kpis as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(kpis)) return [];
  return kpis.map((k) => {
    const label = k.label as { th: string; en: string };
    return {
      id: String(k.id),
      labelTh: label?.th ?? String(k.id),
      labelEn: label?.en ?? String(k.id),
      target: String(k.target),
      actual: String(k.actual),
      targetMet: k.targetMet === true,
    };
  });
}

export function buildReductionPlan(): ReductionPlanView {
  const plan = records().find((r) => r.kind === 'plan' && r.id === 'proj-plan-1');
  if (!plan) throw new Error('proj-plan-1 missing');

  const elements: PlanElementView[] = [
    {
      id: 'written-plan',
      labelTh: 'แผนลายลักษณ์อักษร',
      labelEn: 'Written plan',
      status: plan.writtenPlan === true ? 'supported' : 'unavailable',
      detailTh: 'มีแผนประจำปี FY2568 ตามหลักฐาน 1.6.1',
      detailEn: 'FY2568 annual plan documented per 1.6.1 evidence',
    },
    {
      id: 'duration',
      labelTh: 'ระยะเวลา ≥ 1 ปี',
      labelEn: 'Duration ≥ 1 year',
      status: (plan.durationYears as number) >= 1 ? 'supported' : 'unavailable',
      detailTh: `การดำเนินงาน ${plan.durationYears} ปี (ปี ${CAT1_YEAR})`,
      detailEn: `${plan.durationYears}-year scope (FY${CAT1_YEAR})`,
    },
    {
      id: 'approval',
      labelTh: 'อนุมัติจากผู้บริหาร',
      labelEn: 'Executive approval',
      status: plan.executiveApproved === true ? 'supported' : 'unavailable',
      detailTh: 'ระบุในแหล่ง 1.6.1 และ 1.1.4 (4 หน่วยงาน)',
      detailEn: 'Stated in 1.6.1 and 1.1.4 sources (4 units)',
    },
    {
      id: 'activities',
      labelTh: 'รายการกิจกรรมในแผน',
      labelEn: 'Plan activity schedule',
      status: 'unavailable',
      detailTh: 'ไม่สามารถตรวจสอบใน repo — ไฟล์แนบ ERP ไม่มีในแหล่งที่เก็บ',
      detailEn: 'Not locally auditable — ERP attachment not stored in repo',
    },
    {
      id: 'targets-link',
      labelTh: 'เชื่อมโยงเป้าหมาย 1.1.3',
      labelEn: 'Link to 1.1.3 targets',
      status: Array.isArray(plan.linksToIndicators) && (plan.linksToIndicators as string[]).includes('1.1.3') ? 'supported' : 'unavailable',
      detailTh: 'อ้างอิงประกาศเป้าหมายสิ่งแวดล้อม 2568 (ฐานปี 2567)',
      detailEn: 'References FY2568 environmental targets announcement (FY2567 base)',
    },
    {
      id: 'cn-nz',
      labelTh: 'Carbon Neutrality / Net Zero',
      labelEn: 'Carbon Neutrality / Net Zero',
      status: 'partial',
      detailTh: 'ข้อความเกณฑ์ใน 1.6.1 §(4) — ไม่มีหลักฐานแยกนอกจากนโยบาย §8 ลด GHG',
      detailEn: 'Criterion text in 1.6.1 §(4) — not separately evidenced beyond policy §8 GHG campaign',
    },
  ];

  return {
    id: String(plan.id),
    title: String(plan.title),
    period: String(plan.period),
    planStatus: 'PARTIAL',
    writtenPlan: plan.writtenPlan === true,
    executiveApproved: plan.executiveApproved === true,
    durationYears: (plan.durationYears as number) ?? 1,
    carbonNeutralityDocumented: plan.carbonNeutralityDocumented === true,
    netZeroDocumented: plan.netZeroDocumented === true,
    linksToIndicators: (plan.linksToIndicators as string[]) ?? [],
    activitiesSourceStatus: String(plan.activitiesSourceStatus ?? 'external-not-in-repo'),
    activitiesSourceRef: String(plan.activitiesSourceRef ?? ''),
    verificationBasis: String((plan.verification as { basis?: string })?.basis ?? ''),
    elements,
  };
}

export function buildProjectPortfolio(): ProjectView[] {
  return records()
    .filter((r) => r.kind === 'project')
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
    .map((rec) => ({
      id: String(rec.id),
      title: String(rec.title),
      period: String(rec.period),
      objectives: (rec.objectives as string[]) ?? [],
      owners: (rec.owners as string[]) ?? [],
      ghgImpactStatus: rec.ghgImpactStatus as GhgImpactStatus,
      targetStatus: String(rec.targetStatus ?? ''),
      measuredReduction: null,
      kpis: mapKpis(rec),
      results: (rec.results as string[]) ?? [],
      continuityAction: String(rec.continuityAction ?? ''),
      budgetTHB: typeof rec.budgetTHB === 'number' ? rec.budgetTHB : undefined,
      actualSpendTHB: typeof rec.actualSpendTHB === 'number' ? rec.actualSpendTHB : undefined,
      linkedAspectIds: (rec.linkedAspectIds as string[]) ?? [],
      linkedIndicators: (rec.indicatorCodes as string[]) ?? [],
      sourceRef: String(rec.sourceRef),
      anomalies: (rec.anomalies as { type: string; note: string }[]) ?? [],
    }));
}

export function buildPerformanceGapDisclaimer(): PerformanceGapDisclaimer {
  const perf = buildGhgPerformance();
  return {
    actualChangePct: perf.actualChangePct,
    th: `แหล่งข้อมูล FY2568 ไม่ได้เชื่อมโยงโครงการเหล่านี้กับการปิดช่องว่างผล GHG +${perf.actualChangePct.toFixed(2)}% อย่างชัดเจน — ความสำเร็จของโครงการไม่เท่ากับการลด tCO₂e ที่วัดได้`,
    en: `FY2568 sources do not explicitly link these projects to closure of the +${perf.actualChangePct.toFixed(2)}% GHG performance gap — project success is not measured GHG reduction`,
  };
}

export function ghgImpactPresentation(status: GhgImpactStatus, locale: 'th' | 'en'): { label: string; description: string; badgeClass: string } {
  const isEn = locale === 'en';
  switch (status) {
    case 'ghg_supporting_action':
      return {
        label: isEn ? 'Supporting GHG action' : 'สนับสนุนลด GHG',
        description: isEn ? 'Objective cites energy/GHG — no measured tCO₂e' : 'วัตถุประสงค์กล่าวถึงพลังงาน/GHG — ไม่มี tCO₂e ที่วัดได้',
        badgeClass: 'bg-sky-100 text-sky-950 ring-sky-300',
      };
    case 'environmental_improvement':
      return {
        label: isEn ? 'Environmental improvement' : 'ปรับปรุงสิ่งแวดล้อม',
        description: isEn ? 'Sanitation/IPM focus — no quantified GHG' : 'เน้นสุขาภิบาล/IPM — ไม่มี GHG เชิงปริมาณ',
        badgeClass: 'bg-teal-100 text-teal-950 ring-teal-300',
      };
    default:
      return {
        label: isEn ? 'Measured GHG reduction' : 'ลด GHG ที่วัดได้',
        description: isEn ? 'Source-reported tCO₂e reduction' : 'การลด tCO₂e จากแหล่ง',
        badgeClass: 'bg-emerald-100 text-emerald-950 ring-emerald-300',
      };
  }
}

export function planElementStatusLabel(status: PlanElementView['status'], locale: 'th' | 'en'): string {
  const isEn = locale === 'en';
  if (status === 'supported') return isEn ? 'Supported' : 'รองรับโดยแหล่ง';
  if (status === 'partial') return isEn ? 'Partial / weak' : 'บางส่วน / อ่อน';
  return isEn ? 'Not locally available' : 'ไม่พร้อมใน repo';
}

export function projectsContractSources(): string[] {
  return [...new Set(projectsContract.sources.map((s) => s.ref))];
}

/** Published FY2568 document paths (same pattern as 1.5 journeys). */
export const CAT16_DOC_BASE =
  '/documents/fy2568/cat1/1.6 แผนการดำเนินงานและโครงการเพื่อมุ่งสู่การลดก๊าซเรือนกระจกของหน่วยงาน';

export const CAT16_DOCS = {
  plan161: `${CAT16_DOC_BASE}/1.6.1 (9-3-69).pdf`,
  plan162: `${CAT16_DOC_BASE}/1.6.2 (9-3-69).pdf`,
  master: `${CAT16_DOC_BASE}/ประกอบข้อ 1.6.docx`,
  report5s: `${CAT16_DOC_BASE}/รายงานโครงการ 5ส Green Office 2568.pdf`,
  reportRat: `${CAT16_DOC_BASE}/รายงานโครงการลดปัญหาหนูในพื้นที่ทำงาน เพื่อสิ่งแวดล้อมปลอดภัยตามแนวทาง Green Office.pdf`,
} as const;
