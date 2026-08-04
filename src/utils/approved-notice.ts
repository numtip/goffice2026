/**
 * GO-UX-5 — Presentation-layer filter for About page notices.
 *
 * Product Owner has approved all source documents, so OCR / pending-review /
 * human-verification messages must no longer be shown. The notice strings
 * themselves live in frozen metadata (src/data/about/content.json), so we
 * suppress them here at render time instead of editing metadata.
 */

const SUPPRESSED_MARKERS: RegExp[] = [
  /\bocr\b/i,
  /\bverif/i,
  /\bpending/i,
  /\bawait/i,
  /\bconfirm/i,
  /ตรวจสอบ/,
  /ยืนยัน/,
  /รอการ/,
  /ต้องตรวจ/,
];

export function isApprovedNotice(text?: string): boolean {
  if (!text) return true;
  return !SUPPRESSED_MARKERS.some((re) => re.test(text));
}

/** Returns the notice pair only when neither locale mentions OCR/pending/verification. */
export function approvedNotice(noticeTh?: string, noticeEn?: string): { th: string; en: string } | null {
  if (!noticeTh && !noticeEn) return null;
  if (!isApprovedNotice(noticeTh) || !isApprovedNotice(noticeEn)) return null;
  return { th: noticeTh ?? '', en: noticeEn ?? '' };
}
