#!/usr/bin/env node
/**
 * build-cat1-legal-2568.mjs
 * Normalizes FY2568 CAT1-1.4 legal register + compliance from extracted DOCX data.
 * Source: .tmp_legal_final.json (read-only extraction artifact)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EXTRACT = JSON.parse(readFileSync(resolve(ROOT, '.tmp_legal_final.json'), 'utf8'));
const LAWS_PATH = resolve(ROOT, 'src/data/category1/laws.json');
const COMPLIANCE_PATH = resolve(ROOT, 'src/data/category1/compliance.json');

const TOPIC_TO_LAW = {
  '1. น้ำเสีย': 'law-1',
  '2. อาชีวอนามัยและความปลอดภัย': 'law-2',
  '2. อาชีวอนามัย': 'law-2',
  '3. สิ่งปฏิกูล': 'law-3',
  '4. อากาศ': 'law-4',
  '5. พลังงาน': 'law-5',
  '6. มาตรการควบคุมการแพร่ระบาดของโรคติดเชื้อไวรัสโคโรน่า 2019 (COVID-19)': 'law-6',
  '7. พระราชบัญญัติ คุมครองแรงงาน': 'law-7',
  '7. พระราชบัญญัติ คุ้มครองแรงงาน': 'law-7',
  '8. วัตถุอันตราย': 'law-8',
  '9. พระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุ': 'law-9',
};

const NEEDS_REVIEW_ROWS = new Set(['1.3']);

function topicId(topic) {
  const id = TOPIC_TO_LAW[topic];
  if (!id) throw new Error(`Unknown topic: ${topic}`);
  return id;
}

function commonFields(sourceRef) {
  return {
    year: 2568,
    indicatorCodes: ['1.4.1'],
    issueCodes: ['1.4'],
    categoryCode: 'cat1',
    evidenceIds: [],
    sourceRef,
    verification: {
      status: 'reviewed',
      basis: 'FY2568 register extracted from 1.4. ทะเบียนกฎหมาย ปี 2568.docx; reviews 9 Jul and 18 Sep 2568 per register header.',
    },
    availability: 'content-verified',
  };
}

function buildLegalRequirements(rows) {
  return rows.map((row) => ({
    id: `lr-${row.id}`,
    ...commonFields('1.4/1.4. ทะเบียนกฎหมาย ปี 2568.docx'),
    kind: 'legal-requirement',
    registerId: row.id,
    topicId: topicId(row.topic),
    topic: row.topic.replace(/^\d+\.\s*/, ''),
    title: row.title,
    sourceLaw: row.source_law,
    requirementSummary: row.requirement_summary || '',
    reviewDates: ['2025-07-09', '2025-09-18'],
    registerMark: row.compliance_marks?.compliant === '√' ? 'compliant' : 'unmarked',
    hasEvidence: Boolean(row.evidence_refs?.trim()),
    evidenceNote: row.evidence_refs?.trim() || null,
    baseline: 'historical-baseline',
  }));
}

function buildComplianceAssessments(rows) {
  return rows.map((row) => {
    const registerStatus = row.compliance_status === 'compliant' ? 'compliant' : 'unmarked';
    const status = NEEDS_REVIEW_ROWS.has(row.id) ? 'needs_review' : registerStatus;
    return {
      id: `lca-${row.id}`,
      year: 2568,
      indicatorCodes: ['1.4.2'],
      issueCodes: ['1.4'],
      categoryCode: 'cat1',
      evidenceIds: [],
      sourceRef: '1.4/1.4. ทะเบียนกฎหมาย ปี 2568.docx',
      verification: {
        status: status === 'needs_review' ? 'pending' : 'reviewed',
        basis:
          row.id === '1.3'
            ? 'Register marks √ but TDS measurement 702 mg/l vs standard ≤500 mg/l (28 Aug 2568); unresolved in source.'
            : 'Derived from 1.4 register √ marks; 1.4.2 DOCX has no row-level table.',
      },
      availability: 'content-verified',
      kind: 'legal-compliance-assessment',
      legalRequirementId: `lr-${row.id}`,
      registerStatus,
      status,
      evidenceNote: row.evidence_refs?.trim() || null,
      reviewDates: ['2025-07-09', '2025-09-18'],
      responsibleCompiler: 'นางสาวชณันภัสร์ กีรติอำนวยศรี',
      responsibleReviewer: 'ผศ.ภานุวัฒน์ เมฆะ',
      baseline: 'historical-baseline',
    };
  });
}

const registerRows = EXTRACT.register_14_rows;
const legalRequirements = buildLegalRequirements(registerRows);
const complianceAssessments = buildComplianceAssessments(registerRows);

const aspectLegalMapping = {
  id: 'alm-ea79-lr32',
  year: 2568,
  indicatorCodes: ['1.4.1'],
  issueCodes: ['1.4'],
  categoryCode: 'cat1',
  evidenceIds: [],
  sourceRef: '1.4/1.4. ทะเบียนกฎหมาย ปี 2568.docx',
  verification: {
    status: 'reviewed',
    basis: 'Explicit evidence cite: ea-79 (ของเสียจากห้องปฏิบัติการ) under register row 3.2 พ.ร.บ.รักษาความสะอาดฯ 2560.',
  },
  availability: 'content-verified',
  kind: 'aspect-legal-mapping',
  aspectId: 'ea-79',
  legalRequirementId: 'lr-3.2',
  mappingBasis: 'source-explicit',
  evidenceRef: 'หนังสือ อว 69.2.6/ว 69 (13 มิ.ย. 2568)',
  baseline: 'historical-baseline',
};

const laws = JSON.parse(readFileSync(LAWS_PATH, 'utf8'));
const topicRecords = laws.records.filter((r) => r.kind === 'legal-item');

for (const rec of topicRecords) {
  rec.baseline = 'historical-baseline';
  rec.reviewDates = ['2025-07-09', '2025-09-18'];
  if (rec.id === 'law-7') {
    rec.counts = { compliant: 0, nonCompliant: 5, forInformation: 0 };
    rec.summarySource = '1.4.1 topic summary (contradicts register √ marks — see anomalies)';
  }
  if (rec.id === 'law-8') {
    rec.counts = { compliant: 0, nonCompliant: 3, forInformation: 0 };
    rec.summarySource = '1.4.1 topic summary (contradicts register √ marks — see anomalies)';
  }
}

laws.status = 'historical-baseline';
laws.updated = '2026-08-19';
laws.sources = [
  { ref: '1.4/1.4. ทะเบียนกฎหมาย ปี 2568.docx', role: 'primary', inspection: 'content-verified' },
  { ref: '1.4/1.4.1 กฎหมายและข้อกำหนดอื่นๆ68 รวม (06.03.2569).docx', role: 'supporting', inspection: 'content-verified' },
];
laws.records = [...topicRecords, ...legalRequirements, aspectLegalMapping];
laws.summary = {
  totalTopics: 9,
  totalRequirements: legalRequirements.length,
  requirementsWithEvidence: legalRequirements.filter((r) => r.hasEvidence).length,
  explicitAspectMappings: 1,
};
laws.anomalies = [
  {
    id: 'ANOM-TDS-702',
    legalRequirementId: 'lr-1.3',
    detail: 'TDS 702 mg/l vs standard ≤500; register marks √; lca-1.3 status needs_review.',
  },
  {
    id: 'ANOM-REVIEW-DATES',
    detail: '1.4.2 §(4) lists 9 Jul 2568 only; register header cites 9 Jul and 18 Sep 2568.',
  },
  {
    id: 'ANOM-SUMMARY-vs-ROWS',
    detail: '1.4.1 topic summary: law-7/law-8 nonCompliant counts; all register rows marked √.',
  },
  {
    id: 'STRUCT-142-NO-TABLE',
    detail: '1.4.2 DOCX has no row-level compliance table; assessments derived from 1.4 register.',
  },
];

const compliance = JSON.parse(readFileSync(COMPLIANCE_PATH, 'utf8'));
const evalRecord = compliance.records.find((r) => r.kind === 'evaluation');
evalRecord.baseline = 'historical-baseline';
evalRecord.reviewDates = ['2025-07-09'];
evalRecord.reviewDatesNote = '1.4.2 §(4) cites 9 Jul 2568 only; register header also cites 18 Sep 2568.';
evalRecord.orderRef = 'มจ. 344/2568 (25 มี.ค. 2568)';
evalRecord.compiler = 'นางสาวชณันภัสร์ กีรติอำนวยศรี';
evalRecord.signatureDate = '2025-09-18';

compliance.status = 'historical-baseline';
compliance.updated = '2026-08-19';
compliance.sources = [
  { ref: '1.4/1.4.2 ประเมินความสอดคล้องของกฎหมายกับการดำเ.docx', role: 'primary', inspection: 'content-verified' },
  { ref: '1.4/1.4. ทะเบียนกฎหมาย ปี 2568.docx', role: 'supporting', inspection: 'content-verified' },
];
compliance.records = [evalRecord, ...complianceAssessments];
compliance.summary = {
  registerAssessments: complianceAssessments.length,
  statusCounts: {
    needs_review: complianceAssessments.filter((a) => a.status === 'needs_review').length,
    compliant: complianceAssessments.filter((a) => a.status === 'compliant').length,
  },
  narrativeOnly: true,
};

writeFileSync(LAWS_PATH, `${JSON.stringify(laws, null, 2)}\n`, 'utf8');
writeFileSync(COMPLIANCE_PATH, `${JSON.stringify(compliance, null, 2)}\n`, 'utf8');

console.log(`Built ${legalRequirements.length} legal-requirement records`);
console.log(`Built ${complianceAssessments.length} legal-compliance-assessment records`);
console.log(`Built 1 aspect-legal-mapping record (ea-79 → lr-3.2)`);
