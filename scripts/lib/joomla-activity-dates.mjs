/**
 * Canonical event-date resolution for Joomla project2 activity fetches.
 * Preserves raw header/body values; prefers body narrative when they conflict
 * (GO-ACTIVITIES-MIGRATION-BATCHES.md — Phase 3A authority).
 */

export const THAI_MONTHS = {
  มกราคม: 1,
  กุมภาพันธ์: 2,
  มีนาคม: 3,
  เมษายน: 4,
  พฤษภาคม: 5,
  มิถุนายน: 6,
  กรกฎาคม: 7,
  สิงหาคม: 8,
  กันยายน: 9,
  ตุลาคม: 10,
  พฤศจิกายน: 11,
  ธันวาคม: 12,
};

export function decodeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export function parseThaiDate(text) {
  if (!text) return null;
  const cleaned = decodeHtml(text).replace(/\s+/g, ' ');
  const be = cleaned.match(/(\d{1,2})\s+([^\d\s]+)\s+(25\d{2})/);
  if (be) {
    const day = Number(be[1]);
    const month = THAI_MONTHS[be[2]];
    const yearBe = Number(be[3]);
    if (!month) return { raw: cleaned, iso: null, fiscalYear: yearBe };
    const yearCe = yearBe - 543;
    const iso = `${yearCe}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { raw: cleaned, iso, fiscalYear: yearBe };
  }
  const ce = cleaned.match(/(\d{1,2})\s+([^\d\s]+)\s+(20\d{2})/);
  if (ce) {
    const day = Number(ce[1]);
    const month = THAI_MONTHS[ce[2]];
    const yearCe = Number(ce[3]);
    if (!month) return { raw: cleaned, iso: null, fiscalYear: yearCe + 543 };
    const iso = `${yearCe}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { raw: cleaned, iso, fiscalYear: yearCe + 543 };
  }
  return { raw: cleaned, iso: null, fiscalYear: null };
}

/** Parse `เมื่อวันที่ …` from narrative body text. */
export function parseBodyEventDate(bodyTh) {
  if (!bodyTh) return null;
  const m = bodyTh.match(/เมื่อวันที่\s+(\d{1,2}\s+[^\d\s]+\s+(?:25\d{2}|20\d{2}))/);
  if (!m) return null;
  return parseThaiDate(m[1]);
}

/**
 * Resolve canonical publishDate for migration output.
 * Raw fetch cache fields (eventDateRaw/publishDate = header) stay untouched on disk.
 */
export function resolveCanonicalEventDate(fetch) {
  const header = fetch.eventDateRaw || fetch.publishDate
    ? {
        eventDateRaw: fetch.eventDateRaw ?? null,
        publishDate: fetch.publishDate ?? null,
        fiscalYear: fetch.fiscalYear ?? null,
      }
    : null;

  const body = parseBodyEventDate(fetch.bodyTh);

  if (body?.iso && header?.publishDate && body.iso !== header.publishDate) {
    return {
      publishDate: body.iso,
      eventDateRaw: body.raw,
      fiscalYear: body.fiscalYear ?? header.fiscalYear,
      dateResolution: {
        conflict: true,
        authority: 'body narrative per GO-ACTIVITIES-MIGRATION-BATCHES.md (Phase 3A)',
        headerEventDateRaw: header.eventDateRaw,
        headerPublishDate: header.publishDate,
        bodyEventDateRaw: body.raw,
        bodyPublishDate: body.iso,
      },
    };
  }

  if (body?.iso && !header?.publishDate) {
    return {
      publishDate: body.iso,
      eventDateRaw: body.raw,
      fiscalYear: body.fiscalYear ?? fetch.fiscalYear,
    };
  }

  return {
    publishDate: header?.publishDate ?? body?.iso ?? null,
    eventDateRaw: header?.eventDateRaw ?? body?.raw ?? null,
    fiscalYear: header?.fiscalYear ?? body?.fiscalYear ?? fetch.fiscalYear ?? null,
  };
}
