/**
 * Canonical Bilingual Terminology Glossary — Green Office 2026
 *
 * This is the authoritative source for TH↔EN term mapping across the platform.
 *
 * Usage:
 *   import { glossary } from '../data/i18n/glossary';
 *   glossary.find(g => g.id === 'green-office')?.en;
 *
 * Term tiers:
 *   authoritative — from official Green Office 2569 criteria / source documents
 *   working       — project-created translation; approved for platform use
 *   review        — ambiguous; requires human reviewer decision
 */

export interface GlossaryEntry {
  id: string;
  tier: 'authoritative' | 'working' | 'review';
  th: string;
  en: string;
  note?: string;
}

export const glossary: GlossaryEntry[] = [
  // ═══════════════════════════════════════════════════════════
  // Platform & Identity
  // ═══════════════════════════════════════════════════════════
  {
    id: 'green-office',
    tier: 'authoritative',
    th: 'สำนักงานสีเขียว',
    en: 'Green Office',
    note: 'Official program name',
  },
  {
    id: 'green-office-2026',
    tier: 'authoritative',
    th: 'Green Office 2026',
    en: 'Green Office 2026',
    note: 'English name used in both locales as proper noun',
  },
  {
    id: 'green-office-2569',
    tier: 'authoritative',
    th: 'สำนักงานสีเขียว ปี 2569',
    en: 'Green Office 2569',
  },
  {
    id: 'maejo-university',
    tier: 'authoritative',
    th: 'มหาวิทยาลัยแม่โจ้',
    en: 'Maejo University',
  },
  {
    id: 'green-office-platform',
    tier: 'working',
    th: 'แพลตฟอร์มสำนักงานสีเขียว',
    en: 'Green Office Platform',
  },

  // ═══════════════════════════════════════════════════════════
  // Certification & Assessment
  // ═══════════════════════════════════════════════════════════
  {
    id: 'certification',
    tier: 'authoritative',
    th: 'การรับรอง',
    en: 'Certification',
  },
  {
    id: 'renewal',
    tier: 'authoritative',
    th: 'การต่ออายุการรับรอง',
    en: 'Renewal',
    note: 'For organizations reapplying after certification expiry',
  },
  {
    id: 'level-upgrade',
    tier: 'authoritative',
    th: 'การยกระดับการรับรอง',
    en: 'Certification Level Upgrade',
  },
  {
    id: 'assessment-criteria',
    tier: 'authoritative',
    th: 'เกณฑ์การประเมิน',
    en: 'Assessment Criteria',
  },
  {
    id: 'assessment-scoring',
    tier: 'working',
    th: 'การให้คะแนนประเมิน',
    en: 'Scoring',
  },
  {
    id: 'new-certification',
    tier: 'authoritative',
    th: 'การขอรับรองใหม่',
    en: 'New Certification',
    note: '6 categories, 22 issues, 63 indicators',
  },
  {
    id: 'renewal-upgrade-scope',
    tier: 'authoritative',
    th: 'การต่ออายุ/ยกระดับ',
    en: 'Renewal / Level Upgrade',
    note: '7 categories, 24 issues, 65 indicators',
  },

  // ═══════════════════════════════════════════════════════════
  // Taxonomy: Category / Issue / Indicator
  // ═══════════════════════════════════════════════════════════
  {
    id: 'category',
    tier: 'authoritative',
    th: 'หมวด',
    en: 'Category',
  },
  {
    id: 'issue',
    tier: 'authoritative',
    th: 'ประเด็น',
    en: 'Issue',
    note: 'Also referred to as "section" in some contexts',
  },
  {
    id: 'indicator',
    tier: 'authoritative',
    th: 'ตัวชี้วัด',
    en: 'Indicator',
  },
  {
    id: 'taxonomy',
    tier: 'working',
    th: 'โครงสร้างเกณฑ์',
    en: 'Taxonomy',
  },
  {
    id: 'scoring-subcriteria',
    tier: 'working',
    th: 'เกณฑ์การให้คะแนนย่อย',
    en: 'Scoring Sub-criteria',
    note: 'Sub-items within an indicator used for scoring, not separate indicators',
  },

  // ═══════════════════════════════════════════════════════════
  // Category Names (Authoritative — from official PDF)
  // ═══════════════════════════════════════════════════════════
  {
    id: 'cat-1',
    tier: 'authoritative',
    th: 'การกำหนดนโยบาย การวางแผนการดำเนินงานสำนักงานสีเขียว',
    en: 'Environmental Policy and Green Office Planning',
  },
  {
    id: 'cat-2',
    tier: 'authoritative',
    th: 'การสื่อสารและสร้างจิตสำนึก',
    en: 'Communication and Awareness Cultivation',
  },
  {
    id: 'cat-3',
    tier: 'authoritative',
    th: 'การใช้ทรัพยากรและพลังงาน',
    en: 'Resource and Energy Utilization',
  },
  {
    id: 'cat-4',
    tier: 'authoritative',
    th: 'การจัดการของเสีย',
    en: 'Waste Management',
  },
  {
    id: 'cat-5',
    tier: 'authoritative',
    th: 'สภาพแวดล้อมและความปลอดภัย',
    en: 'Environment and Safety',
  },
  {
    id: 'cat-6',
    tier: 'authoritative',
    th: 'การจัดซื้อและจัดจ้าง',
    en: 'Procurement and Hiring',
  },
  {
    id: 'cat-7',
    tier: 'authoritative',
    th: 'การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง',
    en: 'Green Office Operations for Continuity',
    note: 'Renewal/upgrade only — separate assessment structure',
  },

  // ═══════════════════════════════════════════════════════════
  // Environment & Resources
  // ═══════════════════════════════════════════════════════════
  {
    id: 'environmental-policy',
    tier: 'authoritative',
    th: 'นโยบายสิ่งแวดล้อม',
    en: 'Environmental Policy',
  },
  {
    id: 'environmental-management',
    tier: 'authoritative',
    th: 'การจัดการสิ่งแวดล้อม',
    en: 'Environmental Management',
  },
  {
    id: 'resources-and-energy',
    tier: 'authoritative',
    th: 'การใช้ทรัพยากรและพลังงาน',
    en: 'Resource and Energy Utilization',
  },
  {
    id: 'waste-management',
    tier: 'authoritative',
    th: 'การจัดการของเสีย',
    en: 'Waste Management',
  },
  {
    id: 'environment-and-safety',
    tier: 'authoritative',
    th: 'สภาพแวดล้อมและความปลอดภัย',
    en: 'Environment and Safety',
  },
  {
    id: 'green-procurement',
    tier: 'working',
    th: 'การจัดซื้อจัดจ้างที่เป็นมิตรกับสิ่งแวดล้อม',
    en: 'Green Procurement',
    note: 'Official title is "การจัดซื้อและจัดจ้าง"; this is the conceptual term for the practice',
  },
  {
    id: 'procurement-and-hiring',
    tier: 'authoritative',
    th: 'การจัดซื้อและจัดจ้าง',
    en: 'Procurement and Hiring',
  },
  {
    id: 'communication-and-awareness',
    tier: 'authoritative',
    th: 'การสื่อสารและสร้างจิตสำนึก',
    en: 'Communication and Awareness Cultivation',
  },
  {
    id: 'continuity-and-development',
    tier: 'authoritative',
    th: 'การดำเนินงานสำนักงานสีเขียวเพื่อความต่อเนื่อง',
    en: 'Green Office Operations for Continuity',
  },

  // ═══════════════════════════════════════════════════════════
  // Greenhouse Gas & Climate
  // ═══════════════════════════════════════════════════════════
  {
    id: 'greenhouse-gas',
    tier: 'authoritative',
    th: 'ก๊าซเรือนกระจก',
    en: 'Greenhouse Gas',
    note: 'Abbreviated as GHG',
  },
  {
    id: 'ghg-emissions',
    tier: 'authoritative',
    th: 'การปล่อยก๊าซเรือนกระจก',
    en: 'GHG Emissions',
  },
  {
    id: 'emission-factor',
    tier: 'authoritative',
    th: 'ค่าสัมประสิทธิ์การปล่อยก๊าซเรือนกระจก',
    en: 'Emission Factor',
  },
  {
    id: 'carbon-neutrality',
    tier: 'review',
    th: 'ความเป็นกลางทางคาร์บอน',
    en: 'Carbon Neutrality',
    note: 'Verify official Thai term used by 2569 criteria',
  },
  {
    id: 'net-zero',
    tier: 'review',
    th: 'การปล่อยก๊าซเรือนกระจกสุทธิเป็นศูนย์',
    en: 'Net Zero',
    note: 'Verify official Thai term used by 2569 criteria',
  },
  {
    id: 'carbon-footprint',
    tier: 'working',
    th: 'รอยเท้าคาร์บอน',
    en: 'Carbon Footprint',
  },

  // ═══════════════════════════════════════════════════════════
  // Resources & Consumption
  // ═══════════════════════════════════════════════════════════
  {
    id: 'electricity-consumption',
    tier: 'authoritative',
    th: 'การใช้ไฟฟ้า',
    en: 'Electricity Consumption',
  },
  {
    id: 'water-consumption',
    tier: 'authoritative',
    th: 'การใช้น้ำ',
    en: 'Water Consumption',
  },
  {
    id: 'fuel-consumption',
    tier: 'authoritative',
    th: 'การใช้น้ำมันเชื้อเพลิง',
    en: 'Fuel Consumption',
  },
  {
    id: 'paper-consumption',
    tier: 'authoritative',
    th: 'การใช้กระดาษ',
    en: 'Paper Consumption',
  },
  {
    id: 'baseline-year',
    tier: 'working',
    th: 'ปีฐาน',
    en: 'Baseline Year',
  },
  {
    id: 'target',
    tier: 'authoritative',
    th: 'เป้าหมาย',
    en: 'Target',
  },

  // ═══════════════════════════════════════════════════════════
  // Evidence & Documents
  // ═══════════════════════════════════════════════════════════
  {
    id: 'evidence',
    tier: 'authoritative',
    th: 'หลักฐาน',
    en: 'Evidence',
  },
  {
    id: 'assessment-evidence',
    tier: 'working',
    th: 'หลักฐานการประเมิน',
    en: 'Assessment Evidence',
  },
  {
    id: 'evidence-library',
    tier: 'working',
    th: 'คลังหลักฐาน',
    en: 'Evidence Library',
  },
  {
    id: 'evidence-record',
    tier: 'working',
    th: 'รายการหลักฐาน',
    en: 'Evidence Record',
  },
  {
    id: 'document',
    tier: 'authoritative',
    th: 'เอกสาร',
    en: 'Document',
  },
  {
    id: 'document-center',
    tier: 'working',
    th: 'ศูนย์เอกสาร',
    en: 'Document Center',
  },
  {
    id: 'placeholder',
    tier: 'working',
    th: 'ตัวอย่าง',
    en: 'Placeholder',
    note: 'Content not yet approved/published; shown as preview only',
  },

  // ═══════════════════════════════════════════════════════════
  // Dashboard & Performance
  // ═══════════════════════════════════════════════════════════
  {
    id: 'dashboard',
    tier: 'working',
    th: 'แดชบอร์ด',
    en: 'Dashboard',
    note: 'English loanword used in both locales',
  },
  {
    id: 'performance',
    tier: 'working',
    th: 'ผลการดำเนินงาน',
    en: 'Performance',
  },
  {
    id: 'executive-dashboard',
    tier: 'working',
    th: 'แดชบอร์ดผู้บริหาร',
    en: 'Executive Dashboard',
  },
  {
    id: 'kpi',
    tier: 'working',
    th: 'ตัวชี้วัดผลงาน',
    en: 'KPI',
    note: 'Abbreviation used in both locales',
  },
  {
    id: 'metric',
    tier: 'working',
    th: 'มาตรวัด',
    en: 'Metric',
  },
  {
    id: 'trend',
    tier: 'working',
    th: 'แนวโน้ม',
    en: 'Trend',
  },

  // ═══════════════════════════════════════════════════════════
  // Platform UI / Navigation
  // ═══════════════════════════════════════════════════════════
  {
    id: 'home',
    tier: 'working',
    th: 'หน้าแรก',
    en: 'Home',
  },
  {
    id: 'search',
    tier: 'working',
    th: 'ค้นหา',
    en: 'Search',
  },
  {
    id: 'language',
    tier: 'working',
    th: 'ภาษา',
    en: 'Language',
  },
  {
    id: 'skip-to-content',
    tier: 'working',
    th: 'ข้ามไปยังเนื้อหาหลัก',
    en: 'Skip to main content',
  },
  {
    id: 'preview-badge',
    tier: 'working',
    th: 'ตัวอย่างเท่านั้น',
    en: 'Preview only',
  },
  {
    id: 'explore',
    tier: 'working',
    th: 'สำรวจ',
    en: 'Explore',
  },
  {
    id: 'view-details',
    tier: 'working',
    th: 'ดูรายละเอียด',
    en: 'View Details',
  },
  {
    id: 'learn-more',
    tier: 'working',
    th: 'เรียนรู้เพิ่มเติม',
    en: 'Learn More',
  },
  {
    id: 'download',
    tier: 'working',
    th: 'ดาวน์โหลด',
    en: 'Download',
  },
  {
    id: 'open',
    tier: 'working',
    th: 'เปิด',
    en: 'Open',
  },
  {
    id: 'browse',
    tier: 'working',
    th: 'เรียกดู',
    en: 'Browse',
  },

  // ═══════════════════════════════════════════════════════════
  // Footer / Organization
  // ═══════════════════════════════════════════════════════════
  {
    id: 'copyright',
    tier: 'working',
    th: 'สงวนลิขสิทธิ์',
    en: 'All rights reserved',
  },
  {
    id: 'organization-name',
    tier: 'authoritative',
    th: 'สำนักวิจัยและส่งเสริมวิชาการการเกษตร มหาวิทยาลัยแม่โจ้',
    en: 'Office of Agricultural Research and Academic Extension, Maejo University',
    note: 'Full official name of the responsible unit',
  },
  {
    id: 'contact',
    tier: 'working',
    th: 'ติดต่อ',
    en: 'Contact',
  },
  {
    id: 'feedback',
    tier: 'working',
    th: 'ข้อเสนอแนะ',
    en: 'Feedback',
  },
];

/**
 * Look up a glossary entry by ID.
 */
export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return glossary.find(g => g.id === id);
}

/**
 * Get the localized term for a glossary entry.
 */
export function getLocalizedTerm(id: string, locale: 'th' | 'en'): string | undefined {
  const entry = getGlossaryEntry(id);
  if (!entry) return undefined;
  return locale === 'th' ? entry.th : entry.en;
}
