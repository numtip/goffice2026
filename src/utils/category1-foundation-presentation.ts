/**
 * category1-foundation-presentation.ts
 * Read-only FY2568 CAT1-1.1 scope, policy, targets, and annual plan view-models.
 */
import aaContract from '../data/category1/activities-aspects.json';
import targetsContract from '../data/category1/targets.json';
import projectsContract from '../data/category1/projects.json';
import { buildGhgInventory } from './category1-ghg-presentation';
import { CAT1_YEAR } from './category1-presentation';

export { CAT1_YEAR };

type AaRecord = Record<string, unknown> & { id: string; kind: string };
type TargetRecord = Record<string, unknown> & { id: string; kind: string };

export interface ScopeAreaView {
  id: string;
  labelTh: string;
  labelEn: string;
  areaSqm: number;
  includes?: string[];
}

export interface ScopeOrganizationView {
  id: string;
  nameTh: string;
  nameEn: string;
  tableAliases: string[];
}

export interface ScopeView {
  totalSqm: number;
  externalSqm: number;
  floor1Sqm: number;
  floor2Sqm: number;
  floor3Sqm: number;
  organizationCount: number;
  fy2567FeedbackAddressed: boolean;
  areas: ScopeAreaView[];
  organizations: ScopeOrganizationView[];
  contextNoteTh: string;
  contextNoteEn: string;
  sourceRef: string;
  roomInventoryStatus: 'partial';
  roomInventoryNoteTh: string;
  roomInventoryNoteEn: string;
}

export type PolicyPrinciple =
  | 'continual_improvement'
  | 'resource_energy_waste'
  | 'legal_compliance'
  | 'awareness_participation';

export interface PolicyCommitmentView {
  id: string;
  statementNumber: number;
  textTh: string;
  textEn: string;
  principle: PolicyPrinciple;
}

export interface PolicyApprovalView {
  reviewCommittee: string;
  reviewMeetingNumber: string;
  reviewDateBE: string;
  reviewDateISO: string;
  announcementDateBE: string;
  announcementDateISO: string;
  signedByRoleTh: string;
  signedByRoleEn: string;
  policyRetainedFromFY2567: boolean;
}

export interface PolicyInterviewGap {
  documentaryParticipation: 'supported';
  interviewStatus: 'NOT_COMPLETED';
  noteTh: string;
  noteEn: string;
}

export interface TargetDomainView {
  id: string;
  domain: string;
  labelTh: string;
  labelEn: string;
  targetPercent: number;
  unit: string;
  value: number;
  comparisonBasis: string;
  verificationStatus: string;
  amendmentNoteTh?: string;
  amendmentNoteEn?: string;
  metricFamilyNoteTh?: string;
  metricFamilyNoteEn?: string;
}

export interface AnnualPlanView {
  id: string;
  title: string;
  period: string;
  writtenPlan: boolean;
  executiveApproved: boolean;
  approvingOrganizationCount: number;
  categoryCoverage: number;
  plannedVsActualSeparate: boolean;
  durationYears: number;
  linksToIndicators: string[];
  sharedWith161: boolean;
  sourceRef: string;
  coSourceRef?: string;
  activitiesSourceStatus: string;
  activitiesSourceRef: string;
  planTableStatus: 'image_only';
  planTableNoteTh: string;
  planTableNoteEn: string;
}

/** Map policy statement numbers to four Green Office policy principles. */
const PRINCIPLE_BY_STATEMENT: Record<number, PolicyPrinciple> = {
  1: 'awareness_participation',
  2: 'awareness_participation',
  3: 'resource_energy_waste',
  4: 'continual_improvement',
  5: 'resource_energy_waste',
  6: 'resource_energy_waste',
  7: 'resource_energy_waste',
  8: 'resource_energy_waste',
  9: 'awareness_participation',
  10: 'legal_compliance',
};

export const POLICY_PRINCIPLE_LABELS: Record<
  PolicyPrinciple,
  { th: string; en: string }
> = {
  continual_improvement: {
    th: 'การปรับปรุงอย่างต่อเนื่อง',
    en: 'Continual improvement',
  },
  resource_energy_waste: {
    th: 'ทรัพยากร / พลังงาน / ของเสีย / จัดซื้อ / GHG',
    en: 'Resources / energy / waste / procurement / GHG',
  },
  legal_compliance: {
    th: 'การปฏิบัติตามกฎหมายและเกณฑ์',
    en: 'Legal & criteria compliance',
  },
  awareness_participation: {
    th: 'การรับรู้และการมีส่วนร่วม',
    en: 'Awareness & participation',
  },
};

function aaRecords(): AaRecord[] {
  return aaContract.records as AaRecord[];
}

function formatBEDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const be = y + 543;
  const monthsTh = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
  ];
  const monthsEn = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${d} ${monthsTh[m - 1]} ${be} / ${monthsEn[m - 1]} ${y}`;
}

export function buildScopeView(): ScopeView {
  const scope = aaRecords().find((r) => r.id === 'scope-1');
  if (!scope) throw new Error('scope-1 missing');
  const floors = scope.floorAreasSqm as Record<string, number>;
  const areas = aaRecords()
    .filter((r) => r.kind === 'scopeArea')
    .map((r) => ({
      id: String(r.id),
      labelTh: String(r.labelTh),
      labelEn: String(r.labelEn),
      areaSqm: r.areaSqm as number,
      includes: r.includes as string[] | undefined,
    }));
  const organizations = aaRecords()
    .filter((r) => r.kind === 'scopeOrganization')
    .map((r) => ({
      id: String(r.id),
      nameTh: String(r.nameTh),
      nameEn: String(r.nameEn),
      tableAliases: (r.tableAliases as string[]) ?? [],
    }));
  const ctx = aaRecords().find((r) => r.kind === 'organizationContext');
  return {
    totalSqm: scope.officeAreaSqm as number,
    externalSqm: scope.externalAreaSqm as number,
    floor1Sqm: floors.floor1,
    floor2Sqm: floors.floor2,
    floor3Sqm: floors.floor3,
    organizationCount: scope.organizationCount as number,
    fy2567FeedbackAddressed: scope.fy2567FeedbackAddressed === true,
    areas,
    organizations,
    contextNoteTh: String(ctx?.noteTh ?? ''),
    contextNoteEn: String(ctx?.noteEn ?? ''),
    sourceRef: String(scope.sourceRef),
    roomInventoryStatus: 'partial',
    roomInventoryNoteTh:
      'ตารางห้อง/พื้นที่บางชั้น (ชั้น 1 และ 3) เป็นภาพใน PDF — ไม่มีทะเบียนห้องครบทุกชั้นแบบ machine-readable',
    roomInventoryNoteEn:
      'Some floor room registers (floors 1 and 3) are image-only in the PDF — no complete machine-readable room inventory',
  };
}

export function buildPolicyApproval(): PolicyApprovalView {
  const rec = aaRecords().find((r) => r.id === 'policy-approval-1');
  if (!rec) throw new Error('policy-approval-1 missing');
  const reviewISO = String(rec.reviewDateISO);
  const announceISO = String(rec.announcementDateISO);
  return {
    reviewCommittee: String(rec.reviewCommittee),
    reviewMeetingNumber: String(rec.reviewMeetingNumber),
    reviewDateBE: formatBEDate(reviewISO),
    reviewDateISO: reviewISO,
    announcementDateBE: formatBEDate(announceISO),
    announcementDateISO: announceISO,
    signedByRoleTh: String(rec.signedByRoleTh),
    signedByRoleEn: String(rec.signedByRoleEn),
    policyRetainedFromFY2567: rec.policyRetainedFromFY2567 === true,
  };
}

export function buildPolicyCommitments(): PolicyCommitmentView[] {
  return aaRecords()
    .filter((r) => r.kind === 'policyCommitment')
    .map((r) => {
      const n = r.statementNumber as number;
      return {
        id: String(r.id),
        statementNumber: n,
        textTh: String(r.textTh),
        textEn: String(r.textEn),
        principle: PRINCIPLE_BY_STATEMENT[n] ?? 'continual_improvement',
      };
    })
    .sort((a, b) => a.statementNumber - b.statementNumber);
}

export function buildPolicyInterviewGap(): PolicyInterviewGap {
  const gap = (aaContract.gaps as Array<{ indicator: string; status: string; note: string }>).find(
    (g) => g.indicator === '1.1.2' && g.status === 'PARTIAL',
  );
  return {
    documentaryParticipation: 'supported',
    interviewStatus: 'NOT_COMPLETED',
    noteTh: gap?.note ?? 'ไม่พบหลักฐานสัมภาษณ์ผู้บริหารในแหล่ง FY2568',
    noteEn: gap?.note ?? 'No executive interview record in FY2568 sources',
  };
}

export function buildTargetBoard(): TargetDomainView[] {
  const inventory = buildGhgInventory();
  return (targetsContract.records as TargetRecord[])
    .filter((r) => r.kind === 'target')
    .map((r) => {
      const view: TargetDomainView = {
        id: String(r.id),
        domain: String(r.domain),
        labelTh: String(r.labelTh),
        labelEn: String(r.labelEn),
        targetPercent: r.targetPercent as number,
        unit: String(r.unit),
        value: r.value as number,
        comparisonBasis: String(r.comparisonBasis),
        verificationStatus: String((r.verification as { status?: string })?.status ?? 'pending'),
      };
      const sup = r.supersedes as { priorTargetPercent?: number } | undefined;
      if (r.domain === 'paper' && sup?.priorTargetPercent != null) {
        view.amendmentNoteTh = `แก้ไขที่ทบทวนฝ่ายบริหาร #1 (7 มี.ค. 2568): ${sup.priorTargetPercent}% → ${r.targetPercent}%`;
        view.amendmentNoteEn = `Management review #1 (7 Mar 2568) amendment: ${sup.priorTargetPercent}% → ${r.targetPercent}%`;
      }
      if (r.domain === 'ghg') {
        view.metricFamilyNoteTh = `เป้าหมายประกาศ ${r.value} kgCO₂e/คน — แยกจากบัญชี 1.5 (${inventory.perCapitaKgCO2e} kgCO₂e/คน จริง) · ครอบครัวตัวชี้วัดต่างกัน ยังไม่รวมเป็นค่าเดียว`;
        view.metricFamilyNoteEn = `Announcement target ${r.value} kgCO₂e/person — separate from 1.5 inventory (${inventory.perCapitaKgCO2e} kgCO₂e/person actual) · unresolved metric families, not merged`;
      }
      return view;
    });
}

export function buildAnnualPlanView(): AnnualPlanView {
  const plan = (projectsContract.records as AaRecord[]).find(
    (r) => r.kind === 'plan' && r.id === 'proj-plan-1',
  );
  if (!plan) throw new Error('proj-plan-1 missing');
  const coRefs = plan.coSourceRefs as string[] | undefined;
  return {
    id: String(plan.id),
    title: String(plan.title),
    period: String(plan.period),
    writtenPlan: plan.writtenPlan === true,
    executiveApproved: plan.executiveApproved === true,
    approvingOrganizationCount: (plan.approvingOrganizationCount as number) ?? 4,
    categoryCoverage: (plan.categoryCoverage as number) ?? 7,
    plannedVsActualSeparate: plan.plannedVsActualSeparate === true,
    durationYears: (plan.durationYears as number) ?? 1,
    linksToIndicators: (plan.linksToIndicators as string[]) ?? [],
    sharedWith161: (plan.indicatorCodes as string[])?.includes('1.6.1') ?? false,
    sourceRef: String(plan.sourceRef),
    coSourceRef: coRefs?.[0],
    activitiesSourceStatus: String(plan.activitiesSourceStatus ?? 'external-not-in-repo'),
    activitiesSourceRef: String(plan.activitiesSourceRef ?? ''),
    planTableStatus: 'image_only',
    planTableNoteTh:
      'ตารางแผน/ผล (หน้า 3–8 ใน PDF) เป็นภาพ — ไม่แสดงรายการกิจกรรมที่สร้างขึ้นเอง; แผน ≠ ผลจริงจนกว่ามีหลักฐาน actual',
    planTableNoteEn:
      'Plan/actual table (PDF pp.3–8) is image-only — activity rows are not invented; planned ≠ actual until actual evidence exists',
  };
}

export const CAT11_DOCS = {
  scopePdf: '/documents/fy2568/cat1/1.1/1.1.1%20(9-3-69).pdf',
  policyPdf: '/documents/fy2568/cat1/1.1/1.1.2%20(9-3-69).pdf',
  targetsPdf: '/documents/fy2568/cat1/1.1/1.1.3%20(9-3-69).pdf',
  planPdf: '/documents/fy2568/cat1/1.1/1.1.4%20(9-3-69).pdf',
} as const;
