/**
 * category1-fy2569-presentation.ts
 * =================================
 * Read-only FY2569 CAT1-1.1/1.2 overlay view-models.
 *
 * FY2569 is the CURRENT assessment year and is presented as the primary source
 * of truth; the frozen FY2568 contracts remain the historical baseline. This
 * module reads ONLY the separate FY2569 overlay contracts
 * (activities-aspects-2569, targets-2569, projects-2569, environmental-committee-2569)
 * — it never mutates the FY2568 baseline files.
 */
import aaContract2569 from '../data/category1/activities-aspects-2569.json';
import targetsContract2569 from '../data/category1/targets-2569.json';
import projectsContract2569 from '../data/category1/projects-2569.json';
import committeeContract2569 from '../data/category1/environmental-committee-2569.json';

export const CAT1_FY2569_YEAR = 2569 as const;
export const CAT1_FY2568_YEAR = 2568 as const;

type ContractRecord = Record<string, unknown> & { id: string; kind: string };

const aaRecords = () => aaContract2569.records as ContractRecord[];
const targetRecords = () => targetsContract2569.records as ContractRecord[];
const planRecords = () => projectsContract2569.records as ContractRecord[];
const committeeRecords = () => committeeContract2569.records as ContractRecord[];

export interface ScopeAreaView2569 {
  id: string;
  labelTh: string;
  labelEn: string;
  areaSqm: number;
  includes?: string[];
  roomCount?: number;
  personnelCount?: number;
}

export interface ScopeOrganizationView2569 {
  id: string;
  nameTh: string;
  nameEn: string;
  personnelCount: number;
  tableAliases: string[];
}

export interface ScopeView2569 {
  totalSqm: number;
  externalSqm: number;
  floor1Sqm: number;
  floor2Sqm: number;
  floor3Sqm: number;
  organizationCount: number;
  personnelCount: number;
  areas: ScopeAreaView2569[];
  organizations: ScopeOrganizationView2569[];
  announcementDateBE: string;
  announcementDateISO: string;
  signedByRoleTh: string;
  signedByRoleEn: string;
  proseNoteTh: string;
  proseNoteEn: string;
  sourceRef: string;
  roomInventoryStatus: 'partial';
  roomInventoryNoteTh: string;
  roomInventoryNoteEn: string;
}

export interface PolicyApprovalView2569 {
  announcementDateBE: string;
  announcementDateISO: string;
  signedByRoleTh: string;
  signedByRoleEn: string;
  signedBy: string;
  policyRetainedFromFY2568: boolean;
  authorityNoteTh: string;
  authorityNoteEn: string;
  reviewCommittee: string | null;
  reviewMeetingNumber: string | null;
}

export interface PolicyCommitmentView2569 {
  id: string;
  statementNumber: number;
  textTh: string;
  textEn: string;
}

export interface TargetDomainView2569 {
  id: string;
  domain: string;
  labelTh: string;
  labelEn: string;
  targetPercent: number;
  unit: string;
  value: number;
  comparisonBasis: string;
  baselineYear: number;
  targetYear: number;
  ocrNote?: string;
}

export interface AnnualPlanView2569 {
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
  activityCount: number;
  indicatorCoverage: number;
  approvalDateBE: string;
  approvalDateISO: string;
  approvedByTh: string;
  approvedByEn: string;
  sourceRef: string;
  coSourceRef?: string;
  activitiesSourceStatus: string;
  planTableStatus: 'workbook';
  planTableNoteTh: string;
  planTableNoteEn: string;
}

export interface CommitteeFoundationView2569 {
  id: string;
  organizationCount: number;
  categoryCoverage: string;
  structureChangeNoteTh: string;
  structureChangeNoteEn: string;
}

export interface AppointmentAuthorityView2569 {
  writtenAppointment: boolean;
  signedByRoleTh: string;
  signedByRoleEn: string;
  signedBy: string;
  dateBE: string;
  dateISO: string;
  orderRef: string | null;
  orderRefNoteTh: string;
  orderRefNoteEn: string;
}

export interface OrganizationCoverageView2569 {
  id: string;
  nameTh: string;
  nameEn: string;
  personnelCount: number;
}

export interface CommitteeGroupView2569 {
  id: string;
  groupLayer: string;
  labelTh: string;
  labelEn: string;
  categoryCodes: string[];
  combinedGroup?: boolean;
  chairRoleTh?: string;
  chairRoleEn?: string;
  memberCount?: number;
}

/** Map policy statement numbers to the FY2568 principle buckets for continuity. */
const PRINCIPLE_BY_STATEMENT: Record<number, string> = {
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

export function commitmentPrinciple2569(statementNumber: number): string {
  return PRINCIPLE_BY_STATEMENT[statementNumber] ?? 'continual_improvement';
}

export function buildScopeView2569(): ScopeView2569 {
  const scope = aaRecords().find((r) => r.id === 'scope-2569-1');
  if (!scope) throw new Error('scope-2569-1 missing');
  const floors = scope.floorAreasSqm as Record<string, number>;
  const areas = aaRecords()
    .filter((r) => r.kind === 'scopeArea')
    .map((r) => ({
      id: String(r.id),
      labelTh: String(r.labelTh),
      labelEn: String(r.labelEn),
      areaSqm: r.areaSqm as number,
      includes: r.includes as string[] | undefined,
      roomCount: r.roomCount as number | undefined,
      personnelCount: r.personnelCount as number | undefined,
    }));
  const organizations = aaRecords()
    .filter((r) => r.kind === 'scopeOrganization')
    .map((r) => ({
      id: String(r.id),
      nameTh: String(r.nameTh),
      nameEn: String(r.nameEn),
      personnelCount: r.personnelCount as number,
      tableAliases: (r.tableAliases as string[]) ?? [],
    }));
  return {
    totalSqm: scope.officeAreaSqm as number,
    externalSqm: scope.externalAreaSqm as number,
    floor1Sqm: floors.floor1,
    floor2Sqm: floors.floor2,
    floor3Sqm: floors.floor3,
    organizationCount: scope.organizationCount as number,
    personnelCount: scope.personnelCount as number,
    areas,
    organizations,
    announcementDateBE: String(scope.announcementDateBE),
    announcementDateISO: String(scope.announcementDateISO),
    signedByRoleTh: String(scope.signedByRoleTh),
    signedByRoleEn: String(scope.signedByRoleEn),
    proseNoteTh: String(scope.proseNoteTh ?? ''),
    proseNoteEn: String(scope.proseNoteEn ?? ''),
    sourceRef: String(scope.sourceRef),
    roomInventoryStatus: 'partial',
    roomInventoryNoteTh:
      'ตารางห้อง/พื้นที่รายชั้นใน PDF 2569 บางส่วนเป็นภาพและ OCR ยังไม่ครบ — สรุปพื้นที่/บุคลากร/ห้อง ตรวจสอบจากตารางสรุปแล้ว',
    roomInventoryNoteEn:
      'Some per-room registers in the FY2569 PDF remain image-only / OCR-incomplete — area/personnel/room totals verified from the summary table',
  };
}

export function buildPolicyApproval2569(): PolicyApprovalView2569 {
  const rec = aaRecords().find((r) => r.id === 'policy-2569-approval-1');
  if (!rec) throw new Error('policy-2569-approval-1 missing');
  return {
    announcementDateBE: String(rec.announcementDateBE),
    announcementDateISO: String(rec.announcementDateISO),
    signedByRoleTh: String(rec.signedByRoleTh),
    signedByRoleEn: String(rec.signedByRoleEn),
    signedBy: String(rec.signedBy),
    policyRetainedFromFY2568: rec.policyRetainedFromFY2568 === true,
    authorityNoteTh: String(rec.authorityNoteTh ?? ''),
    authorityNoteEn: String(rec.authorityNoteEn ?? ''),
    reviewCommittee: rec.reviewCommittee ? String(rec.reviewCommittee) : null,
    reviewMeetingNumber: rec.reviewMeetingNumber ? String(rec.reviewMeetingNumber) : null,
  };
}

export function buildPolicyCommitments2569(): PolicyCommitmentView2569[] {
  return aaRecords()
    .filter((r) => r.kind === 'policyCommitment')
    .map((r) => ({
      id: String(r.id),
      statementNumber: r.statementNumber as number,
      textTh: String(r.textTh),
      textEn: String(r.textEn),
    }))
    .sort((a, b) => a.statementNumber - b.statementNumber);
}

export function buildTargetBoard2569(): TargetDomainView2569[] {
  return targetRecords()
    .filter((r) => r.kind === 'target')
    .map((r) => ({
      id: String(r.id),
      domain: String(r.domain),
      labelTh: String(r.labelTh),
      labelEn: String(r.labelEn),
      targetPercent: r.targetPercent as number,
      unit: String(r.unit),
      value: r.value as number,
      comparisonBasis: String(r.comparisonBasis),
      baselineYear: r.baselineYear as number,
      targetYear: r.targetYear as number,
      ocrNote: r.ocrNote ? String(r.ocrNote) : undefined,
    }));
}

export function buildAnnualPlanView2569(): AnnualPlanView2569 {
  const plan = planRecords().find((r) => r.kind === 'plan');
  if (!plan) throw new Error('proj-2569-plan-1 missing');
  const coRefs = plan.coSourceRefs as string[] | undefined;
  return {
    id: String(plan.id),
    title: String(plan.title),
    period: String(plan.period),
    writtenPlan: plan.writtenPlan === true,
    executiveApproved: plan.executiveApproved === true,
    approvingOrganizationCount: (plan.approvingOrganizationCount as number) ?? 1,
    categoryCoverage: (plan.categoryCoverage as number) ?? 7,
    plannedVsActualSeparate: plan.plannedVsActualSeparate === true,
    durationYears: (plan.durationYears as number) ?? 1,
    linksToIndicators: (plan.linksToIndicators as string[]) ?? [],
    sharedWith161: (plan.indicatorCodes as string[])?.includes('1.6.1') ?? false,
    activityCount: (plan.activityCount as number) ?? 0,
    indicatorCoverage: (plan.indicatorCoverage as number) ?? 0,
    approvalDateBE: String(plan.approvalDateBE ?? ''),
    approvalDateISO: String(plan.approvalDateISO ?? ''),
    approvedByTh: String(plan.approvedByTh ?? ''),
    approvedByEn: String(plan.approvedByEn ?? ''),
    sourceRef: String(plan.sourceRef),
    coSourceRef: coRefs?.[0],
    activitiesSourceStatus: String(plan.activitiesSourceStatus ?? 'in-repo-generated'),
    planTableStatus: 'workbook',
    planTableNoteTh:
      'แผน/ผล มาจากไฟล์ Excel 2569 (147 กิจกรรม 7 หมวด 65 ตัวชี้วัด) — เครื่องหมาย / = มีแผนในเดือนนั้น; ช่องผลต้องตรวจสอบหลักฐานประกอบก่อนถือว่าดำเนินการแล้ว',
    planTableNoteEn:
      'Plan/actual from the FY2569 Excel workbook (147 activities, 7 categories, 65 indicators) — "/" = planned that month; result entries require evidence before treated as completed',
  };
}

export function buildCommitteeFoundation2569(): CommitteeFoundationView2569 {
  const ec = committeeRecords().find((r) => r.kind === 'environmentalCommittee');
  if (!ec) throw new Error('ec-2569-foundation missing');
  return {
    id: String(ec.id),
    organizationCount: ec.organizationCount as number,
    categoryCoverage: String(ec.categoryCoverage),
    structureChangeNoteTh: String(ec.structureChangeNoteTh ?? ''),
    structureChangeNoteEn: String(ec.structureChangeNoteEn ?? ''),
  };
}

export function buildAppointmentAuthority2569(): AppointmentAuthorityView2569 {
  const rec = committeeRecords().find((r) => r.kind === 'appointmentAuthority');
  if (!rec) throw new Error('appt-2569-auth-1 missing');
  return {
    writtenAppointment: rec.writtenAppointment === true,
    signedByRoleTh: String(rec.signedByRoleTh),
    signedByRoleEn: String(rec.signedByRoleEn),
    signedBy: String(rec.signedBy),
    dateBE: String(rec.dateBE),
    dateISO: String(rec.dateISO),
    orderRef: (rec.orderRef as string | null) ?? null,
    orderRefNoteTh: String(rec.orderRefNoteTh ?? ''),
    orderRefNoteEn: String(rec.orderRefNoteEn ?? ''),
  };
}

export function buildOrganizationCoverage2569(): OrganizationCoverageView2569[] {
  const cov = committeeRecords().filter((r) => r.kind === 'organizationCoverage');
  return cov.map((c) => {
    const org = aaRecords().find((o) => o.id === c.organizationId);
    return {
      id: String(c.organizationId),
      nameTh: String(org?.nameTh ?? c.organizationId),
      nameEn: String(org?.nameEn ?? c.organizationId),
      personnelCount: c.personnelCount as number,
    };
  });
}

export function buildCommitteeGroups2569(): CommitteeGroupView2569[] {
  const layerOrder = ['advisors', 'executive_steering', 'category_working_group', 'operational'];
  return committeeRecords()
    .filter((r) => r.kind === 'committeeGroup')
    .map((g) => ({
      id: String(g.id),
      groupLayer: String(g.groupLayer),
      labelTh: String(g.labelTh),
      labelEn: String(g.labelEn),
      categoryCodes: (g.categoryCodes as string[]) ?? [],
      combinedGroup: g.combinedGroup === true,
      chairRoleTh: g.chairRoleTh ? String(g.chairRoleTh) : undefined,
      chairRoleEn: g.chairRoleEn ? String(g.chairRoleEn) : undefined,
      memberCount: g.memberCount as number | undefined,
    }))
    .sort(
      (a, b) =>
        layerOrder.indexOf(a.groupLayer) - layerOrder.indexOf(b.groupLayer) ||
        a.labelEn.localeCompare(b.labelEn),
    );
}

/** Public evidence URLs for the FY2569 overlay sources (URL-encoded). */
export const CAT11_DOCS_2569 = {
  scopePdf: '/documents/fy2569/cat1/1.1/1.1.1/1.1.1-%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%9A%E0%B8%97%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%81%E0%B8%A32569.pdf',
  policyPdf: '/documents/fy2569/cat1/1.1/1.1.2/1.1.2-%E0%B8%99%E0%B9%82%E0%B8%A2%E0%B8%9A%E0%B8%B2%E0%B8%A2%E0%B8%AA%E0%B8%B3%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%AA%E0%B8%B5%E0%B9%80%E0%B8%82%E0%B8%B5%E0%B8%A2%E0%B8%A7%202569.pdf',
  targetsPdf: '/documents/fy2569/cat1/1.1/1.1.3/1.1.3-%E0%B9%80%E0%B8%9B%E0%B9%89%E0%B8%B2%E0%B8%AB%E0%B8%A1%E0%B8%B2%E0%B8%A2%E0%B8%AA%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B9%81%E0%B8%A7%E0%B8%94%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%A1%202569.pdf',
  targetsMinutesPdf: '/documents/fy2569/cat1/1.1/1.1.3/1.1.3-%E0%B8%A1%E0%B8%95%E0%B8%B4%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%81%E0%B8%B3%E0%B8%AB%E0%B8%99%E0%B8%94%E0%B9%80%E0%B8%9B%E0%B9%89%E0%B8%B2%E0%B8%AB%E0%B8%A1%E0%B8%B2%E0%B8%A2%E0%B8%AA%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B9%81%E0%B8%A7%E0%B8%94%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%A12569.pdf',
  planXlsx: '/documents/fy2569/cat1/1.1/1.1.4/1.1.4%20%E0%B8%A1%E0%B8%B5%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%81%E0%B8%B3%E0%B8%AB%E0%B8%99%E0%B8%94%E0%B9%81%E0%B8%9C%E0%B8%99%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%94%E0%B8%B3%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%AA%E0%B8%B3%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%AA%E0%B8%B5%E0%B9%80%E0%B8%82%E0%B8%B5%E0%B8%A2%E0%B8%A72569.xlsx',
  planPdf: '/documents/fy2569/cat1/04-%E0%B9%81%E0%B8%9C%E0%B8%99%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%94%E0%B8%B3%E0%B9%80%E0%B8%99%E0%B8%B4%E0%B8%99%E0%B8%87%E0%B8%B2%E0%B8%99Green2569.pdf',
  committeeDoc: '/documents/fy2569/cat1/1.2/1.2.1/1.2.1-%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%81%E0%B8%95%E0%B9%88%E0%B8%87%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%84%E0%B8%93%E0%B8%B0%E0%B8%81%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%81%E0%B8%B2%E0%B8%A3Green2569_.doc',
  committeePdf: '/documents/fy2569/cat1/1.2/1.2.1/05-%E0%B8%84%E0%B8%81%E0%B8%81Green2569_complete.pdf',
} as const;
