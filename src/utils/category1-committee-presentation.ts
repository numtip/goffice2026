/**
 * category1-committee-presentation.ts
 * Read-only FY2568 CAT1-1.2 committee/governance view-model from environmental-committee.json.
 */
import committeeContract from '../data/category1/environmental-committee.json';
import activitiesAspects from '../data/category1/activities-aspects.json';
import { CAT1_YEAR } from './category1-presentation';

export { CAT1_YEAR };

type CommitteeRecord = Record<string, unknown> & { id: string; kind: string };

const records = () => committeeContract.records as CommitteeRecord[];
const orgRecords = () =>
  (activitiesAspects.records as CommitteeRecord[]).filter((r) => r.kind === 'scopeOrganization');

export interface AppointmentAuthorityView {
  writtenAppointment: boolean;
  signedByRoleTh: string;
  signedByRoleEn: string;
  dateBE: string;
  dateISO: string;
  orderRef: string | null;
  orderRefNoteTh: string;
  orderRefNoteEn: string;
  operationalOrderDocumentId: string;
}

export interface OrganizationCoverageView {
  id: string;
  nameTh: string;
  nameEn: string;
  personnelCount: number;
}

export interface CommitteeGroupView {
  id: string;
  groupLayer: string;
  labelTh: string;
  labelEn: string;
  categoryCodes: string[];
  combinedGroup?: boolean;
  chairRoleTh?: string;
  chairRoleEn?: string;
}

export interface CommitteeFoundationView {
  id: string;
  buildingTh: string;
  buildingEn: string;
  organizationCount: number;
  personnelCoverageTotal: number;
  personnelCoverageSemantics: string;
  personnelCoverageNoteTh: string;
  personnelCoverageNoteEn: string;
  categoryCoverage: string;
}

export interface RoleUnderstandingGapView {
  status: 'MISSING';
  sampleSize: null;
  understandingPercent: null;
  sourceStub: string;
  noteTh: string;
  noteEn: string;
}

export const COMMITTEE_EVIDENCE = {
  fy2568Pdf: '/documents/fy2568/cat1/1.2/1.2.1-%E0%B8%84%E0%B8%93%E0%B8%B0%E0%B8%97%E0%B8%B3%E0%B8%87%E0%B8%B2%E0%B8%99%E0%B8%94%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AA%E0%B8%B4%E0%B9%88%E0%B8%87%E0%B9%81%E0%B8%A7%E0%B8%94%E0%B8%A5%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B8%9B%E0%B8%B52568.pdf',
  orderPdf: '/documents/about/committee/Order_appointing_the_committee.pdf',
} as const;

export function buildCommitteeFoundation(): CommitteeFoundationView {
  const ec = records().find((r) => r.kind === 'environmentalCommittee');
  if (!ec) throw new Error('environmentalCommittee record missing');
  return {
    id: String(ec.id),
    buildingTh: String(ec.buildingTh),
    buildingEn: String(ec.buildingEn),
    organizationCount: ec.organizationCount as number,
    personnelCoverageTotal: ec.personnelCoverageTotal as number,
    personnelCoverageSemantics: String(ec.personnelCoverageSemantics),
    personnelCoverageNoteTh: String(ec.personnelCoverageNoteTh),
    personnelCoverageNoteEn: String(ec.personnelCoverageNoteEn),
    categoryCoverage: String(ec.categoryCoverage),
  };
}

export function buildAppointmentAuthority(): AppointmentAuthorityView {
  const rec = records().find((r) => r.kind === 'appointmentAuthority');
  if (!rec) throw new Error('appointmentAuthority missing');
  return {
    writtenAppointment: rec.writtenAppointment === true,
    signedByRoleTh: String(rec.signedByRoleTh),
    signedByRoleEn: String(rec.signedByRoleEn),
    dateBE: String(rec.dateBE),
    dateISO: String(rec.dateISO),
    orderRef: (rec.orderRef as string | null) ?? null,
    orderRefNoteTh: String(rec.orderRefNoteTh),
    orderRefNoteEn: String(rec.orderRefNoteEn),
    operationalOrderDocumentId: String(rec.operationalOrderDocumentId),
  };
}

export function buildOrganizationCoverage(): OrganizationCoverageView[] {
  const cov = records().filter((r) => r.kind === 'organizationCoverage');
  return cov.map((c) => {
    const org = orgRecords().find((o) => o.id === c.organizationId);
    return {
      id: String(c.organizationId),
      nameTh: String(org?.nameTh ?? c.organizationId),
      nameEn: String(org?.nameEn ?? c.organizationId),
      personnelCount: c.personnelCount as number,
    };
  });
}

export function buildCommitteeGroups(): CommitteeGroupView[] {
  const layerOrder = [
    'executive_steering',
    'operational',
    'category_working_group',
    'advisors',
  ];
  return records()
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
    }))
    .sort(
      (a, b) =>
        layerOrder.indexOf(a.groupLayer) - layerOrder.indexOf(b.groupLayer) ||
        a.labelEn.localeCompare(b.labelEn),
    );
}

export function buildRoleUnderstandingGap(): RoleUnderstandingGapView {
  const gap = (committeeContract.gaps as Array<{
    indicator: string;
    status: string;
    note: string;
    sourceStub?: string;
    sampleSize?: null;
    understandingPercent?: null;
  }>).find((g) => g.indicator === '1.2.2' && g.status === 'MISSING');
  return {
    status: 'MISSING',
    sampleSize: gap?.sampleSize ?? null,
    understandingPercent: gap?.understandingPercent ?? null,
    sourceStub: gap?.sourceStub ?? '-สัมภาษณ์-',
    noteTh:
      gap?.note ??
      'ไม่พบหลักฐานสัมภาษณ์สุ่ม FY2568 — มีเพียง placeholder ใน PDF 1.2.1 หน้า 8',
    noteEn:
      gap?.note ??
      'No FY2568 random-interview evidence — only a placeholder in 1.2.1 PDF p.8',
  };
}
