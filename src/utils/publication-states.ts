/** User-facing publication and data-availability copy — no internal schema terms. */

export const WAITING_FY2569 = {
  th: 'รอข้อมูลอย่างเป็นทางการ ปีงบประมาณ 2569',
  en: 'Waiting for Official FY2569 Data',
} as const;

/** Alias — sheet mapping not yet available for pending FY2569 rows. */
export const PENDING_SOURCE_SHEET = WAITING_FY2569;

/** True when current-year provenance has no sheet yet (CURRENT_DATA_PENDING). */
export function isPendingSourceSheet(
  dataStatus?: string,
  sourceSheet?: string,
): boolean {
  return dataStatus === 'CURRENT_DATA_PENDING' && !sourceSheet;
}

export const NO_PUBLISHED_EVIDENCE = {
  th: 'ยังไม่มีหลักฐานที่เผยแพร่',
  en: 'No published evidence',
} as const;

export const PENDING_OFFICIAL_PUBLICATION = {
  th: 'รอการเผยแพร่อย่างเป็นทางการ',
  en: 'Pending official publication',
} as const;

export const HISTORICAL_INFORMATION = {
  th: 'ข้อมูลอ้างอิงในอดีต',
  en: 'Historical information',
} as const;

export function pubLabel(
  state: { th: string; en: string },
  locale: 'th' | 'en',
): string {
  return locale === 'th' ? state.th : state.en;
}
