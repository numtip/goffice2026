/**
 * category1-legal-presentation.ts
 * Read-only FY2568 CAT1-1.4 view-model — legal register + compliance assessments.
 * No invented mappings, scores, or FY2569 claims.
 */
import lawsData from '../data/category1/laws.json';
import complianceData from '../data/category1/compliance.json';
import { environmentalAspectsDataset, CAT1_YEAR } from './category1-presentation';

export { CAT1_YEAR };

type LawsRecord = Record<string, unknown> & { kind: string; id: string };
type ComplianceRecord = Record<string, unknown> & { kind: string; id: string };

export interface LegalSummary {
  topicCount: number;
  requirementCount: number;
  requirementsWithEvidence: number;
  explicitAspectMappings: number;
  aspectCount: number;
  unmappedAspectCount: number;
  assessmentCount: number;
  needsReviewCount: number;
  registerMarkedCompliant: number;
}

export interface LegalTopicView {
  id: string;
  topic: string;
  title: string;
  counts: { compliant: number; nonCompliant: number; forInformation: number };
  requirementCount: number;
  hasSummaryConflict: boolean;
}

export interface LegalRequirementRow {
  id: string;
  registerId: string;
  topicId: string;
  topic: string;
  topicTitle: string;
  sourceLaw: string;
  requirementSummary: string;
  hasEvidence: boolean;
  evidenceNote: string | null;
  registerMark: string;
  assessmentStatus: string | null;
  assessmentId: string | null;
  isNeedsReview: boolean;
  isLocalLaw: boolean;
  linkedAspectIds: string[];
}

export interface AspectLegalMappingView {
  id: string;
  aspectId: string;
  aspectLabel: string;
  activity: string;
  legalRequirementId: string;
  registerId: string;
  sourceLaw: string;
  evidenceRef: string;
}

export interface LegalAnomalyView {
  id: string;
  detail: string;
  legalRequirementId?: string;
}

export interface ReviewTimelineEntry {
  date: string;
  labelTh: string;
  labelEn: string;
  source: string;
}

export interface ComplianceEvaluationView {
  id: string;
  result: string;
  reviewer: string;
  compiler: string;
  orderRef: string;
  reviewDatesNote: string;
  basis: string;
  signatureDate: string;
}

export interface ComplianceTopicBreakdown {
  topicId: string;
  topicTitle: string;
  total: number;
  compliant: number;
  needsReview: number;
  withoutEvidenceNote: number;
  hasSummaryConflict: boolean;
}

function lawsRecords(): LawsRecord[] {
  return (lawsData as { records: LawsRecord[] }).records;
}

function complianceRecords(): ComplianceRecord[] {
  return (complianceData as { records: ComplianceRecord[] }).records;
}

function assessmentByRequirementId(): Map<string, ComplianceRecord> {
  const map = new Map<string, ComplianceRecord>();
  for (const rec of complianceRecords()) {
    if (rec.kind === 'legal-compliance-assessment' && rec.legalRequirementId) {
      map.set(String(rec.legalRequirementId), rec);
    }
  }
  return map;
}

function aspectsById(): Map<string, { aspect: string; activity: string }> {
  const map = new Map<string, { aspect: string; activity: string }>();
  for (const a of environmentalAspectsDataset().records) {
    map.set(a.id, { aspect: a.aspect, activity: a.activity });
  }
  return map;
}

function mappingByRequirementId(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const rec of lawsRecords()) {
    if (rec.kind === 'aspect-legal-mapping' && rec.legalRequirementId && rec.aspectId) {
      const reqId = String(rec.legalRequirementId);
      const list = map.get(reqId) || [];
      list.push(String(rec.aspectId));
      map.set(reqId, list);
    }
  }
  return map;
}

export function buildLegalSummary(): LegalSummary {
  const laws = lawsData as {
    summary?: {
      totalTopics?: number;
      totalRequirements?: number;
      requirementsWithEvidence?: number;
      explicitAspectMappings?: number;
    };
  };
  const comp = complianceData as {
    summary?: { registerAssessments?: number; statusCounts?: { needs_review?: number; compliant?: number } };
  };
  const aspectCount = environmentalAspectsDataset().summary.aspectCount;
  const explicit = laws.summary?.explicitAspectMappings ?? 0;
  return {
    topicCount: laws.summary?.totalTopics ?? 9,
    requirementCount: laws.summary?.totalRequirements ?? 47,
    requirementsWithEvidence: laws.summary?.requirementsWithEvidence ?? 0,
    explicitAspectMappings: explicit,
    aspectCount,
    unmappedAspectCount: aspectCount - explicit,
    assessmentCount: comp.summary?.registerAssessments ?? 47,
    needsReviewCount: comp.summary?.statusCounts?.needs_review ?? 0,
    registerMarkedCompliant: comp.summary?.statusCounts?.compliant ?? 46,
  };
}

export function buildLegalTopics(): LegalTopicView[] {
  const requirements = lawsRecords().filter((r) => r.kind === 'legal-requirement');
  return lawsRecords()
    .filter((r) => r.kind === 'legal-item')
    .map((topic) => {
      const counts = (topic.counts as LegalTopicView['counts']) || {
        compliant: 0,
        nonCompliant: 0,
        forInformation: 0,
      };
      const topicReqs = requirements.filter((r) => r.topicId === topic.id);
      const allRegisterCompliant =
        topicReqs.length > 0 && topicReqs.every((r) => r.registerMark === 'compliant');
      const hasSummaryConflict = Boolean(
        topic.summarySource || (counts.nonCompliant > 0 && allRegisterCompliant),
      );
      return {
        id: String(topic.id),
        topic: String(topic.topic || ''),
        title: String(topic.title || ''),
        counts,
        requirementCount: topicReqs.length,
        hasSummaryConflict,
      };
    });
}

export function buildLegalRegisterExplorer(): LegalRequirementRow[] {
  const assessments = assessmentByRequirementId();
  const aspectLinks = mappingByRequirementId();
  const topics = new Map(buildLegalTopics().map((t) => [t.id, t.title]));

  return lawsRecords()
    .filter((r) => r.kind === 'legal-requirement')
    .map((req) => {
      const assessment = assessments.get(String(req.id));
      const topicId = String(req.topicId);
      const registerId = String(req.registerId || '');
      return {
        id: String(req.id),
        registerId,
        topicId,
        topic: String(req.topic || ''),
        topicTitle: topics.get(topicId) || String(req.topic || ''),
        sourceLaw: String(req.sourceLaw || '').replace(/\s+/g, ' ').trim(),
        requirementSummary: String(req.requirementSummary || ''),
        hasEvidence: Boolean(req.hasEvidence),
        evidenceNote: req.evidenceNote ? String(req.evidenceNote) : null,
        registerMark: String(req.registerMark || 'unmarked'),
        assessmentStatus: assessment ? String(assessment.status || '') : null,
        assessmentId: assessment ? String(assessment.id) : null,
        isNeedsReview: assessment?.status === 'needs_review',
        isLocalLaw: registerId === '3.7' || registerId === '3.8',
        linkedAspectIds: aspectLinks.get(String(req.id)) || [],
      };
    });
}

export function buildAspectLegalMappings(): AspectLegalMappingView[] {
  const aspects = aspectsById();
  const requirements = new Map(
    buildLegalRegisterExplorer().map((r) => [r.id, r]),
  );

  return lawsRecords()
    .filter((r) => r.kind === 'aspect-legal-mapping')
    .map((m) => {
      const aspect = aspects.get(String(m.aspectId));
      const req = requirements.get(String(m.legalRequirementId));
      return {
        id: String(m.id),
        aspectId: String(m.aspectId),
        aspectLabel: aspect?.aspect || String(m.aspectId),
        activity: aspect?.activity || '—',
        legalRequirementId: String(m.legalRequirementId),
        registerId: req?.registerId || String(m.legalRequirementId).replace('lr-', ''),
        sourceLaw: req?.sourceLaw || '—',
        evidenceRef: String(m.evidenceRef || ''),
      };
    });
}

export function buildLegalAnomalies(): LegalAnomalyView[] {
  const anomalies = (lawsData as { anomalies?: LegalAnomalyView[] }).anomalies || [];
  return anomalies.map((a) => ({
    id: a.id,
    detail: a.detail,
    legalRequirementId: a.legalRequirementId,
  }));
}

export function buildReviewTimeline(): ReviewTimelineEntry[] {
  return [
    {
      date: '2025-03-25',
      labelTh: 'คำสั่งมจ. 344/2568 — กำหนดผู้รับผิดชอบ',
      labelEn: 'Order 344/2568 — responsible person appointed',
      source: '1.4 register / 1.4.1',
    },
    {
      date: '2025-07-09',
      labelTh: 'ทบทวนและประเมินความสอดคล้อง (ครั้งที่ 1)',
      labelEn: 'Legal compliance review round 1',
      source: '1.4 register header · 1.4.2 §(4)',
    },
    {
      date: '2025-08-28',
      labelTh: 'ตรวจวัดคุณภาพน้ำทิ้ง (อาคารประเภท ข)',
      labelEn: 'Wastewater quality measurement (building type ข)',
      source: 'Register row 1.3 evidence',
    },
    {
      date: '2025-09-18',
      labelTh: 'ทบทวนและประเมินความสอดคล้อง (ครั้งที่ 2) · ลงนาม',
      labelEn: 'Legal compliance review round 2 · signatures',
      source: '1.4 register header · signatures',
    },
  ];
}

export function buildComplianceEvaluation(): ComplianceEvaluationView | null {
  const rec = complianceRecords().find((r) => r.kind === 'evaluation');
  if (!rec) return null;
  return {
    id: String(rec.id),
    result: String(rec.result || 'partial'),
    reviewer: String(rec.reviewer || ''),
    compiler: String(rec.compiler || ''),
    orderRef: String(rec.orderRef || ''),
    reviewDatesNote: String(rec.reviewDatesNote || ''),
    basis: String(rec.basis || ''),
    signatureDate: String(rec.signatureDate || ''),
  };
}

export function buildComplianceTopicBreakdown(): ComplianceTopicBreakdown[] {
  const topics = buildLegalTopics();
  const rows = buildLegalRegisterExplorer();
  return topics.map((topic) => {
    const topicRows = rows.filter((r) => r.topicId === topic.id);
    return {
      topicId: topic.id,
      topicTitle: topic.title,
      total: topicRows.length,
      compliant: topicRows.filter((r) => r.assessmentStatus === 'compliant').length,
      needsReview: topicRows.filter((r) => r.isNeedsReview).length,
      withoutEvidenceNote: topicRows.filter((r) => !r.hasEvidence).length,
      hasSummaryConflict: topic.hasSummaryConflict,
    };
  });
}

export function truncateLegalText(text: string, max = 240): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trim()}…`;
}

export function formatBeDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const be = y + 543;
  const monthsTh = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return `${d} ${monthsTh[m]} ${be}`;
}
