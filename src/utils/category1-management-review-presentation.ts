/**
 * category1-management-review-presentation.ts
 * Read-only FY2568 CAT1-1.7 management review view-model from canonical management-review.json.
 */
import mrContract from '../data/category1/management-review.json';
import { CAT1_YEAR } from './category1-presentation';

export { CAT1_YEAR };

type MrRecord = Record<string, unknown> & { id: string; kind: string };

export type ReviewStatus = 'content-verified' | 'occurrence_supported' | 'not_locally_verified';
export type CoverageStatus = 'explicitly_reviewed' | 'referenced_only' | 'not_locally_verified';

export interface MeetingView {
  id: string;
  meetingNumber: string;
  dateBE: string;
  dateISO: string;
  startTime: string;
  endTime: string;
  room: string;
  building: string;
  reviewStatus: ReviewStatus;
  agendaStatus?: ReviewStatus;
  decisionsStatus?: ReviewStatus;
  quorumStatus?: ReviewStatus;
  participantsCount: number | null;
  evidenceTypes: string[];
}

export interface QuorumView {
  meetingId: string;
  orderRef: string;
  thresholdPct: number;
  thresholdOperator: string;
  invitedCount: number;
  attendedCount: number;
  attendancePct: number;
  quorumMet: boolean;
  basis: string;
  signatureEvidenceNote: string;
}

export interface ParticipantSummaryView {
  meetingId: string;
  roleGroup: string;
  attendedCount: number;
  categoryRange?: string;
  positionsVacant?: string[];
  absentNotes?: string;
  absentReportSentDateBE?: string;
}

export interface DecisionView {
  id: string;
  meetingId: string;
  decisionType: string;
  text: string;
  textEn: string;
  owner?: string;
  pdcaTarget?: string;
  pdcaNote?: string;
}

export interface FrequencyPlanView {
  plannedPerYear: number;
  plannedMonths: string[];
  executedPerPlan: boolean;
}

export interface AgendaTopicView {
  id: string;
  labelTh: string;
  labelEn: string;
}

export interface UpstreamCoverageRow {
  domain: string;
  labelTh: string;
  labelEn: string;
  status: CoverageStatus;
  noteTh?: string;
  noteEn?: string;
}

export interface PdcaLinkView {
  from: string;
  to: string;
  labelTh: string;
  labelEn: string;
  noteTh: string;
  noteEn: string;
}

export interface GapView {
  indicator: string;
  status: string;
  noteTh: string;
  noteEn: string;
}

export const MR_EVIDENCE = {
  quorumDocx:
    '/documents/fy2568/cat1/1.7%20%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%97%E0%B8%9A%E0%B8%97%E0%B8%A7%E0%B8%99%E0%B8%9D%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3/1.7.1%20%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%81%E0%B8%B3%E0%B8%AB%E0%B8%99%E0%B8%94%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%97%E0%B8%9A%E0%B8%97%E0%B8%A7%E0%B8%99%E0%B8%9D%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.docx',
  quorumPdf:
    '/documents/fy2568/cat1/1.7%20%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%97%E0%B8%9A%E0%B8%97%E0%B8%A7%E0%B8%99%E0%B8%9D%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3/1.7.1%20%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%81%E0%B8%B3%E0%B8%AB%E0%B8%99%E0%B8%94%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B9%8C%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%97%E0%B8%9A%E0%B8%97%E0%B8%A7%E0%B8%99%E0%B8%9D%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.pdf',
  minutesDocx:
    '/documents/fy2568/cat1/1.7%20%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%97%E0%B8%9A%E0%B8%97%E0%B8%A7%E0%B8%99%E0%B8%9D%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3/1.7.2%20%E0%B8%A1%E0%B8%B5%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%81%E0%B8%B3%E0%B8%AB%E0%B8%99%E0%B8%94%E0%B8%A7%E0%B8%B2%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%97%E0%B8%B3%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%97%E0%B8%9A%E0%B8%97%E0%B8%A7%E0%B8%99%E0%B8%9D%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.docx',
  minutesPdf:
    '/documents/fy2568/cat1/1.7%20%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%97%E0%B8%9A%E0%B8%97%E0%B8%A7%E0%B8%99%E0%B8%9D%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3/1.7.2%20%E0%B8%A1%E0%B8%B5%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%81%E0%B8%B3%E0%B8%AB%E0%B8%99%E0%B8%94%E0%B8%A7%E0%B8%B2%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%97%E0%B8%B3%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%8A%E0%B8%B8%E0%B8%A1%E0%B8%97%E0%B8%9A%E0%B8%97%E0%B8%A7%E0%B8%99%E0%B8%9D%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%9A%E0%B8%A3%E0%B8%B4%E0%B8%AB%E0%B8%B2%E0%B8%A3.pdf',
} as const;

const DECISION_EN: Record<string, string> = {
  'mr-decision-m1-01':
    'Acknowledged FY2567 Green Office assessment (G Gold) and FY2568 criteria shift (6→7 categories)',
  'mr-decision-m1-02':
    'Approved committee order changes: add Executive category member; Category 3 chair rotation',
  'mr-decision-m1-03': 'Retained FY2567 environmental policy for FY2568 operations',
  'mr-decision-m1-04':
    'Approved certification scope 9,873 m² (4 units; reduced from 9,881 m² / 5 units in FY2567)',
  'mr-decision-m1-05':
    'Assigned Ms. Channaphat Keerati-amnuaysri as Green Office legal responsible person (7 topics)',
  'mr-decision-m1-06':
    'Reviewed FY2567 DCC assessment improvement directions for FY2568 (multi-category table)',
  'mr-decision-m1-07':
    'Approved FY2568 annual plan: monthly Big Cleaning; pest-trace and light-intensity checks added',
  'mr-decision-m1-08': 'Amended paper target from −1% to −3%',
  'mr-decision-m1-09':
    'Approved E-meeting, Line OA (+ AI Q&A), Line group, and website reporting channels',
};

function records(): MrRecord[] {
  return mrContract.records as MrRecord[];
}

function byId(id: string): MrRecord {
  const rec = records().find((r) => r.id === id);
  if (!rec) throw new Error(`management-review record missing: ${id}`);
  return rec;
}

export function buildFrequencyPlan(): FrequencyPlanView {
  const fp = byId('mr-frequency-plan-1');
  return {
    plannedPerYear: fp.plannedPerYear as number,
    plannedMonths: fp.plannedMonths as string[],
    executedPerPlan: fp.executedPerPlan as boolean,
  };
}

export function buildMeeting(meetingId: string): MeetingView {
  const m = byId(meetingId);
  return {
    id: m.id,
    meetingNumber: m.meetingNumber as string,
    dateBE: m.dateBE as string,
    dateISO: m.dateISO as string,
    startTime: m.startTime as string,
    endTime: m.endTime as string,
    room: m.room as string,
    building: m.building as string,
    reviewStatus: m.reviewStatus as ReviewStatus,
    agendaStatus: m.agendaStatus as ReviewStatus | undefined,
    decisionsStatus: m.decisionsStatus as ReviewStatus | undefined,
    quorumStatus: m.quorumStatus as ReviewStatus | undefined,
    participantsCount: (m.participantsCount as number | null) ?? null,
    evidenceTypes: m.evidenceTypes as string[],
  };
}

export function buildQuorum(): QuorumView {
  const q = byId('mr-quorum-1');
  return {
    meetingId: q.meetingId as string,
    orderRef: q.orderRef as string,
    thresholdPct: q.thresholdPct as number,
    thresholdOperator: q.thresholdOperator as string,
    invitedCount: q.invitedCount as number,
    attendedCount: q.attendedCount as number,
    attendancePct: q.attendancePct as number,
    quorumMet: q.quorumMet as boolean,
    basis: q.basis as string,
    signatureEvidenceNote: q.signatureEvidenceNote as string,
  };
}

export function buildParticipants(meetingId: string): ParticipantSummaryView[] {
  return records()
    .filter((r) => r.kind === 'participant-summary' && r.meetingId === meetingId)
    .map((p) => ({
      meetingId: p.meetingId as string,
      roleGroup: p.roleGroup as string,
      attendedCount: p.attendedCount as number,
      categoryRange: p.categoryRange as string | undefined,
      positionsVacant: p.positionsVacant as string[] | undefined,
      absentNotes: p.absentNotes as string | undefined,
      absentReportSentDateBE: p.absentReportSentDateBE as string | undefined,
    }));
}

export function buildDecisions(meetingId: string): DecisionView[] {
  return records()
    .filter((r) => r.kind === 'decision' && r.meetingId === meetingId)
    .map((d) => {
      const pdca = d.pdcaLink as { target?: string; note?: string } | null | undefined;
      return {
        id: d.id,
        meetingId: d.meetingId as string,
        decisionType: d.decisionType as string,
        text: d.text as string,
        textEn: DECISION_EN[d.id] || (d.text as string),
        owner: d.owner as string | undefined,
        pdcaTarget: pdca?.target,
        pdcaNote: pdca?.note,
      };
    });
}

export function buildMeetingOneAgendaTopics(): AgendaTopicView[] {
  return [
    {
      id: 'ag-1',
      labelTh: 'ผลการประเมินสำนักงานสีเขียว ปี 2567 (G ทอง)',
      labelEn: 'FY2567 Green Office assessment result (G Gold)',
    },
    {
      id: 'ag-2',
      labelTh: 'เกณฑ์การประเมิน ปี 2568 (6→7 หมวด)',
      labelEn: 'FY2568 criteria update (6→7 categories)',
    },
    {
      id: 'ag-3',
      labelTh: 'คำสั่งแต่งตั้ง / ปรับบทบาทคณะกรรมการ',
      labelEn: 'Committee appointment and role revision',
    },
    {
      id: 'ag-4',
      labelTh: 'ทบทวนนโยบายสิ่งแวดล้อม',
      labelEn: 'Environmental policy review',
    },
    {
      id: 'ag-5',
      labelTh: 'บริบทและขอบเขตพื้นที่ (9,873 m²)',
      labelEn: 'Context and certification scope (9,873 m²)',
    },
    {
      id: 'ag-6',
      labelTh: 'ผู้รับผิดชอบด้านกฎหมาย Green Office',
      labelEn: 'Legal responsibility assignment',
    },
    {
      id: 'ag-7',
      labelTh: 'ข้อเสนอปรับปรุงจากผลประเมิน 2567',
      labelEn: 'Improvement actions from FY2567 assessment feedback',
    },
    {
      id: 'ag-8',
      labelTh: 'แผนการดำเนินงาน ปี 2568',
      labelEn: 'FY2568 annual plan',
    },
    {
      id: 'ag-9',
      labelTh: 'เป้าหมายสิ่งแวดล้อม ปี 2568 (รวมเป้ากระดาษ −3%)',
      labelEn: 'FY2568 environmental targets (incl. paper −3%)',
    },
    {
      id: 'ag-10',
      labelTh: 'วิสัยทัศน์ผู้บริหาร / E-meeting, Line OA, AI, website',
      labelEn: 'Executive continuity ideas / digital channels (E-meeting, Line OA, AI, website)',
    },
  ];
}

export function buildUpstreamCoverage(): UpstreamCoverageRow[] {
  const cov = byId('mr-upstream-coverage-1');
  const coverage = cov.coverage as Record<string, CoverageStatus>;
  const notes = (cov.coverageNotes || {}) as Record<string, string>;
  const rows: Omit<UpstreamCoverageRow, 'status'>[] = [
    { domain: '1.1', labelTh: 'นโยบาย / บริบท / เป้าหมาย / แผน', labelEn: 'Policy / context / targets / plan' },
    { domain: '1.2', labelTh: 'บทบาท / คณะกรรมการ', labelEn: 'Roles / committee' },
    { domain: '1.3', labelTh: 'ประเด็นสิ่งแวดล้อม / โครงการ', labelEn: 'Environmental aspects / projects' },
    { domain: '1.4', labelTh: 'กฎหมาย / การปฏิบัติตาม', labelEn: 'Legal register / compliance' },
    { domain: '1.5', labelTh: 'ผล GHG / เป้าหมายก๊าซเรือนกระจก', labelEn: 'GHG performance / targets' },
    { domain: '1.6', labelTh: 'แผนลด GHG / โครงการปรับปรุง', labelEn: 'Reduction plan / improvement projects' },
  ];
  const noteEnMap: Record<string, string> = {
    '1.3': 'Improvement table references aspects; canonical proj-1/proj-2 not named in minutes.',
    '1.5': 'Target row cites −1% GHG; FY2568 +4.81% performance not explicitly reviewed at MR #1.',
    '1.6': 'Annual plan approved; project names absent from minutes.',
  };
  return rows.map((row) => ({
    ...row,
    status: coverage[row.domain] || 'not_locally_verified',
    noteTh: notes[row.domain],
    noteEn: noteEnMap[row.domain],
  }));
}

export function buildPdcaLinks(): PdcaLinkView[] {
  const decisions = buildDecisions('mr-meeting-1');
  const links: PdcaLinkView[] = [];
  for (const d of decisions) {
    if (!d.pdcaTarget) continue;
    links.push({
      from: '1.7.2',
      to: d.pdcaTarget,
      labelTh: `ทบทวน → ${d.pdcaTarget}`,
      labelEn: `Review → ${d.pdcaTarget}`,
      noteTh: d.text,
      noteEn: d.textEn,
    });
  }
  return links;
}

export function buildPresentationGaps(): GapView[] {
  return (mrContract.gaps as { indicator: string; status: string; note: string }[]).map((g) => {
    const noteEn: Record<string, string> = {
      'No FY2568 role-understanding interview evidence; MR #1 assigns training follow-up only.':
        'No FY2568 role-understanding interview evidence; MR #1 assigns training follow-up only.',
      'No FY2568 GHG-knowledge training evidence; comm plan references GHG results only.':
        'No FY2568 GHG-knowledge training evidence; comm plan references GHG results only.',
      'Meeting #2 (18 ก.ย. 2568): occurrence supported by photo caption; agenda/minutes/decisions/quorum not_locally_verified.':
        'Meeting #2 (18 Sep 2568): occurrence supported by photo caption; agenda/minutes/decisions/quorum not locally verified.',
      'FY2568 GHG performance (+4.81% vs −1% target, ghg-perf-1) not explicitly discussed at MR #1.':
        'FY2568 GHG performance (+4.81% vs −1% target) not explicitly discussed at MR #1.',
    };
    return {
      indicator: g.indicator,
      status: g.status,
      noteTh: g.note,
      noteEn: noteEn[g.note] || g.note,
    };
  });
}

export function buildAdditionalGaps(): GapView[] {
  return [
    {
      indicator: '1.7.2',
      status: 'NOT_FOUND',
      noteTh: 'proj-1 / proj-2 ไม่ถูกอ้างชื่อในรายงานการประชุม',
      noteEn: 'Canonical proj-1 / proj-2 not named in meeting minutes',
    },
    {
      indicator: '1.7.2',
      status: 'NOT_FOUND',
      noteTh: 'ไม่พบวาระ audit feedback หรือ complaints ในแหล่ง FY2568',
      noteEn: 'No audit feedback or complaints agenda found in FY2568 sources',
    },
  ];
}
