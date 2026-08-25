/**
 * category7-presentation.ts
 * ==========================
 * Read-only view-model for the Category 7 continuity presentation
 * (GOFFICE2026 CAT7 Phase B). Builds presentation facts exclusively from the
 * canonical static contracts in src/data/category7/*.json, the evidence index,
 * and canonical criteria metadata. Never invents values, never presents a
 * score or PASS claim, never relabels a FY2568 result as FY2569.
 *
 * HARD TRUTH honored here:
 *   - 7.1: only the FY2568 internal-audit REQUEST (7.1 p2) is baseline-eligible.
 *     Appointment, auditor competence, audit completion, result report, score and
 *     PASS are NOT presented.
 *   - 7.2: no verified FY2568 execution evidence — rendered as an explicit
 *     EVIDENCE_GAP; no fake evidence is created for coverage.
 *   - FY2569-dated claims are QUARANTINE: no evidence, no public result.
 *   - YEAR_UNVERIFIED and scan-only pages stay pending/unpromoted.
 */

import auditData from '../data/category7/audit.json';
import advancementData from '../data/category7/advancement.json';
import indicatorsData from '../data/criteria/indicators.json';

export const CAT7_YEAR = 2568 as const;

export type Cat7Domain = 'audit' | 'advancement';

export interface Bilingual {
  th: string;
  en: string;
}

export type ClaimStatus = 'baseline-eligible' | 'QUARANTINE' | 'YEAR_UNVERIFIED';
export type ClaimClassification = 'verified-execution' | 'declared-only' | 'candidate' | 'gap';

export interface Cat7Claim {
  id: string;
  indicator: string;
  page: string;
  sourceRef: string;
  summary: Bilingual;
  year: number | null;
  status: ClaimStatus;
  classification: ClaimClassification;
  note?: string;
}

export interface ContractRecord {
  id: string;
  year: number;
  indicatorCodes: string[];
  issueCodes: string[];
  categoryCode: string;
  evidenceIds?: string[];
  sourceRef?: string;
  manifestSha256?: string;
  relatedSources?: string[];
  verification?: { status?: string; basis?: string };
  availability?: string;
  kind?: string;
  promoted?: boolean;
  pageAnchor?: string;
  limitation?: { code?: string; note?: string };
  baselineYearLabel?: Bilingual;
  labelTh?: string;
  labelEn?: string;
  fy2569Status?: string;
  [key: string]: unknown;
}

export interface EvidenceGap {
  indicator: string;
  status: string;
  noteTh: string;
  noteEn: string;
  mandatory?: boolean;
}

export interface DomainContract {
  claims: Cat7Claim[];
  records: ContractRecord[];
  evidenceGap?: EvidenceGap;
  gaps?: { indicator?: string; status?: string; note?: string }[];
}

const CONTRACTS: Record<Cat7Domain, DomainContract> = {
  audit: auditData as unknown as DomainContract,
  advancement: advancementData as unknown as DomainContract,
};

/** Indicator code → contract domain that holds its FY2568 facts. */
export const CAT7_INDICATOR_DOMAIN: Record<string, Cat7Domain> = {
  '7.1': 'audit',
  '7.2': 'advancement',
};

export const CAT7_ALL_INDICATORS = Object.keys(CAT7_INDICATOR_DOMAIN) as string[];

interface IndicatorShape {
  code: string;
  title: { th: string; en: string };
}

export function indicatorTitle(code: string, locale: 'th' | 'en'): string {
  const ind = (indicatorsData as { indicators: IndicatorShape[] }).indicators.find(
    (i) => i.code === code,
  );
  if (!ind) return code;
  return ind.title[locale] || ind.title.th;
}

export function domainForIndicator(code: string): Cat7Domain | null {
  return CAT7_INDICATOR_DOMAIN[code] ?? null;
}

export function contractForDomain(domain: Cat7Domain): DomainContract {
  return CONTRACTS[domain];
}

export function claimsForIndicator(code: string): Cat7Claim[] {
  const domain = domainForIndicator(code);
  return domain ? CONTRACTS[domain].claims : [];
}

export function recordsForIndicator(code: string): ContractRecord[] {
  const domain = domainForIndicator(code);
  return domain ? CONTRACTS[domain].records : [];
}

const DOMAIN_LABELS: Record<Cat7Domain, Bilingual> = {
  audit: { th: '7.1 การตรวจประเมินภายใน', en: '7.1 Internal audit' },
  advancement: { th: '7.2 การพัฒนา/ต่อยอด', en: '7.2 Advancement' },
};

export function domainLabel(domain: Cat7Domain): Bilingual {
  return DOMAIN_LABELS[domain];
}

const STATUS_LABEL: Record<ClaimStatus, Bilingual> = {
  'baseline-eligible': { th: 'ผ่านเกณฑ์ปีฐาน 2568', en: 'FY2568 baseline-eligible' },
  QUARANTINE: { th: 'QUARANTINE (ปี 2569)', en: 'QUARANTINE (FY2569)' },
  YEAR_UNVERIFIED: { th: 'ไม่ระบุปี (YEAR_UNVERIFIED)', en: 'Year unverified' },
};

export function statusLabel(status: ClaimStatus): Bilingual {
  return STATUS_LABEL[status];
}

const CLASSIFICATION_LABEL: Record<ClaimClassification, Bilingual> = {
  'verified-execution': { th: 'หลักฐานการดำเนินการที่ตรวจสอบแล้ว', en: 'Verified execution' },
  'declared-only': { th: 'ระบุไว้เท่านั้น (ไม่ใช่หลักฐานการดำเนินการ)', en: 'Declared only' },
  candidate: { th: 'ตัวเลือก (รอการยืนยัน)', en: 'Candidate' },
  gap: { th: 'ช่องว่าง (รอ OCR)', en: 'Gap (pending OCR)' },
};

export function classificationLabel(c: ClaimClassification): Bilingual {
  return CLASSIFICATION_LABEL[c];
}

export interface ContinuityFact {
  code: string;
  label: Bilingual;
  value: Bilingual;
  kind: 'status' | 'unavailable' | 'gap' | 'quarantine';
}

export interface ContinuitySnapshot {
  status: string;
  facts: ContinuityFact[];
}

/**
 * Category-level continuity evidence-control view. Renders the honest state:
 * 7.1 limited FY2568 request evidence + limitation; 7.2 explicit evidence gap;
 * FY2569-dated claims quarantined; scan pages pending OCR. Never a score/PASS.
 */
export function buildCat7ContinuitySnapshot(): ContinuitySnapshot {
  const audit = CONTRACTS.audit;
  const advancement = CONTRACTS.advancement;
  const auditRecord = audit.records.find((r) => r.id === 'audit-internal-request-fy2568');
  const gap = advancement.evidenceGap;
  const quarantineCount = [...audit.claims, ...advancement.claims].filter(
    (c) => c.status === 'QUARANTINE',
  ).length;
  const scanGaps = [...audit.claims, ...advancement.claims].filter(
    (c) => c.classification === 'gap',
  ).length;

  return {
    status: 'evidence-control',
    facts: [
      {
        code: 'seven-one',
        label: { th: '7.1 การตรวจประเมินภายใน', en: '7.1 Internal audit' },
        value: auditRecord
          ? {
              th: 'หลักฐานปีฐาน 2568 จำกัดเฉพาะคำขอตรวจประเมินภายใน (หน้า 2) — ไม่รวมการแต่งตั้ง/ความเชี่ยวชาญ/ผลการตรวจ/รายงาน',
              en: 'Limited FY2568 baseline evidence — the internal-audit request (page 2) only; no appointment/competence/audit result/report',
            }
          : { th: 'ไม่มีหลักฐานปีฐาน 2568', en: 'No FY2568 baseline evidence' },
        kind: 'status',
      },
      {
        code: 'seven-two',
        label: { th: '7.2 การพัฒนา/ต่อยอด', en: '7.2 Advancement' },
        value: {
          th: 'ไม่พบหลักฐานการดำเนินงานปี 2568 ที่ตรวจสอบได้ในชุดแหล่งข้อมูลที่ผ่านการกระทบยอด (EVIDENCE_GAP)',
          en: 'No verified FY2568 execution evidence in the reconciled source set (EVIDENCE_GAP)',
        },
        kind: 'gap',
      },
      {
        code: 'quarantine',
        label: { th: 'ข้อเท็จจริงปี 2569 (QUARANTINE)', en: 'FY2569-dated claims (QUARANTINE)' },
        value: {
          th: `${quarantineCount} รายการที่ลงปี 2569 ถูกแยกออก — ไม่มีหลักฐาน/ผลต่อสาธารณะ`,
          en: `${quarantineCount} FY2569-dated claims quarantined — no evidence or public result`,
        },
        kind: 'quarantine',
      },
      {
        code: 'scan',
        label: { th: 'หน้าสแกนรอ OCR', en: 'Scan pages pending OCR' },
        value: {
          th: `${scanGaps} กลุ่มหน้าสแกนยังไม่ผ่าน OCR (7.1 หน้า 3–4, 7.2 หน้า 2)`,
          en: `${scanGaps} scan-page group(s) pending OCR (7.1 p3–4, 7.2 p2)`,
        },
        kind: 'unavailable',
      },
      {
        code: 'fy2569',
        label: { th: 'สถานะปี 2569', en: 'FY2569 status' },
        value: {
          th: 'รอการเก็บหลักฐานปี 2569 (ข้อมูลฐานปี 2568 เป็นเพียงชั้นฐาน)',
          en: 'Awaiting FY2569 collection (FY2568 is the baseline layer only)',
        },
        kind: 'status',
      },
    ],
  };
}

export interface IndicatorContextView {
  code: string;
  domain: Cat7Domain;
  domainTitle: Bilingual;
  status: string;
  facts: ContinuityFact[];
  limitation?: Bilingual;
  sourceCount: number;
  pendingScanCount: number;
  record?: ContractRecord;
  evidenceGap?: EvidenceGap;
}

/**
 * Per-indicator context for 7.1 / 7.2. For 7.1 the single baseline-eligible
 * request record is surfaced with its limitation; for 7.2 the mandatory
 * evidence gap is surfaced. No score, no PASS, no FY2569 result.
 */
export function buildCat7IndicatorContext(code: string): IndicatorContextView | null {
  const domain = domainForIndicator(code);
  if (!domain) return null;
  const contract = CONTRACTS[domain];
  const records = contract.records;
  const record = records.find((r) => r.promoted === true) || records[0] || undefined;
  const pendingScanCount = contract.claims.filter((c) => c.classification === 'gap').length;

  let limitation: Bilingual | undefined;
  if (code === '7.1') {
    limitation = {
      th: 'ข้อจำกัดปีฐาน 2568 (7.1): หลักฐานผ่านเกณฑ์เฉพาะคำขอตรวจประเมินภายในปี 2568 (หน้า 2) การแต่งตั้งคณะกรรมการ (หน้า 1) ข้อกำหนด/กำหนดการ (หน้า 5) และการตรวจ/สรุปผล (หน้า 7) เป็นข้อเท็จจริงปี 2569 → QUARANTINE; รายนามผู้ตรวจ (หน้า 6) ไม่ระบุปี; ภาพถ่ายหน้า 3–4 รอ OCR ไม่มีการอ้างคะแนน การผ่านเกณฑ์ หรือผลการตรวจ',
      en: 'FY2568 limitation (7.1): only the FY2568 internal-audit request (page 2) is baseline-eligible. Committee appointment (p1), criteria/schedule (p5) and audit execution/result (p7) are FY2569-dated → QUARANTINE; auditor roster (p6) has no year; p3–4 photos pending OCR. No score, PASS or audit result is claimed.',
    };
  } else if (code === '7.2') {
    limitation = {
      th: 'ข้อจำกัดปีฐาน 2568 (7.2): ไม่พบหลักฐานการดำเนินงานปี 2568 ที่ตรวจสอบได้ ข้อ (1)–(3) เป็นแผนปี 2569 → QUARANTINE ข้อ (4) MAEJO PGS ไม่ระบุปีและไม่มีวันที่/ผลลัพธ์ (candidate) ภาพถ่ายหน้า 2 รอ OCR',
      en: 'FY2568 limitation (7.2): no verified FY2568 execution evidence. Facets (1)–(3) are FY2569-dated plans → QUARANTINE; facet (4) MAEJO PGS has no explicit year or result (candidate); p2 photos pending OCR.',
    };
  }

  const facts: ContinuityFact[] = [];
  if (record) {
    facts.push({
      code: 'record',
      label: record.baselineYearLabel || { th: 'ข้อมูลฐานปี 2568', en: 'FY2568 baseline' },
      value: { th: record.labelTh || '', en: record.labelEn || '' },
      kind: 'status',
    });
    if (record.pageAnchor) {
      facts.push({
        code: 'anchor',
        label: { th: 'ตำแหน่งหน้า', en: 'Page anchor' },
        value: { th: record.pageAnchor, en: record.pageAnchor },
        kind: 'status',
      });
    }
  } else if (contract.evidenceGap) {
    facts.push({
      code: 'gap',
      label: { th: 'ช่องว่างหลักฐาน 7.2', en: '7.2 evidence gap' },
      value: { th: contract.evidenceGap.noteTh, en: contract.evidenceGap.noteEn },
      kind: 'gap',
    });
  }

  return {
    code,
    domain,
    domainTitle: domainLabel(domain),
    status: record ? 'historical-baseline' : 'evidence-gap',
    facts,
    limitation,
    sourceCount: contract.claims.length,
    pendingScanCount,
    record,
    evidenceGap: contract.evidenceGap,
  };
}

export interface LoopStep {
  stage: string;
  code: string;
  label: Bilingual;
  summary: Bilingual;
  targetCode: string;
}

/** Category 7 continuity loop: Internal audit → Evidence control → Advancement. */
export const CAT7_MANAGEMENT_CYCLE: LoopStep[] = [
  {
    stage: '1',
    code: 'audit',
    label: { th: 'ตรวจประเมินภายใน', en: 'Internal audit' },
    summary: {
      th: 'หลักฐานปีฐาน 2568 จำกัดเฉพาะคำขอตรวจประเมินภายใน (หน้า 2) — ผลการตรวจ/รายงานไม่ถูกอ้าง',
      en: 'FY2568 baseline limited to the internal-audit request (p2) — audit result/report not claimed',
    },
    targetCode: '7.1',
  },
  {
    stage: '2',
    code: 'control',
    label: { th: 'ควบคุมหลักฐาน', en: 'Evidence control' },
    summary: {
      th: 'แยกข้อเท็จจริงปี 2569 (QUARANTINE) และหน้าสแกนรอ OCR ออกจากข้อมูลฐานปี 2568',
      en: 'Quarantine FY2569-dated claims and pending-OCR scans from the FY2568 baseline',
    },
    targetCode: '7.1',
  },
  {
    stage: '3',
    code: 'advancement',
    label: { th: 'พัฒนา/ต่อยอด', en: 'Advancement' },
    summary: {
      th: 'ยังไม่มีหลักฐานการดำเนินงานปี 2568 ที่ตรวจสอบได้ (EVIDENCE_GAP) — รอเก็บหลักฐานปี 2569',
      en: 'No verified FY2568 execution evidence yet (EVIDENCE_GAP) — collect for FY2569',
    },
    targetCode: '7.2',
  },
];
