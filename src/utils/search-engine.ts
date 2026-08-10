// ── Green Office 2026 — Client-side Search Engine ─────────────────────────
// Pure, dependency-free search over the generated static index
// (src/data/search-index.json). No DOM, no network, no Astro imports.
// Thai-safe: matching uses indexOf/includes — regex \b breaks on Thai.

// ── Types ─────────────────────────────────────────────────────────────────
export type SectionId =
  | 'about'
  | 'dashboard'
  | 'assessment'
  | 'evidence'
  | 'documents'
  | 'news'
  | 'activities'
  | 'knowledge';

export type Locale = 'th' | 'en';

export interface SearchIndexItem {
  id: string;
  section: SectionId;
  type: string;
  title: [string, string]; // [th, en]
  context: [string, string];
  keywords: [string, string];
  route: string;
  routeKind?: 'page' | 'file';
  category?: [string, string] | null;
  year?: number | null;
  fileType?: string | null;
}

export interface SearchHit {
  item: SearchIndexItem;
  score: number;
}

export interface SearchGroup {
  section: SectionId;
  label: [string, string];
  hits: SearchHit[];
}

// ── Section registry — fixed display order ────────────────────────────────
export const SECTIONS: ReadonlyArray<{ id: SectionId; label: [string, string] }> = [
  { id: 'about', label: ['เกี่ยวกับเรา', 'About'] },
  { id: 'dashboard', label: ['แดชบอร์ด', 'Dashboard'] },
  { id: 'assessment', label: ['เกณฑ์การประเมิน', 'Assessment'] },
  { id: 'evidence', label: ['หลักฐาน', 'Evidence'] },
  { id: 'documents', label: ['เอกสาร', 'Documents'] },
  { id: 'news', label: ['ข่าวสาร', 'News'] },
  { id: 'activities', label: ['กิจกรรม', 'Activities'] },
  { id: 'knowledge', label: ['ความรู้', 'Knowledge'] },
];

// ── Locale helpers ────────────────────────────────────────────────────────
export function pick(locale: Locale, pair: [string, string] | null | undefined): string {
  if (!pair) return '';
  return locale === 'en' ? pair[1] : pair[0];
}

// ── Normalization ─────────────────────────────────────────────────────────
// NFKC folds common Thai vowel/tonemark variants; lowercase for matching.
const fold = (s: string): string => s.normalize('NFKC').toLowerCase();
const cleanTerm = (t: string): string => fold(t).trim();

/** Lowercase, trim, NFKC-normalize, split on whitespace, drop empties. */
export function normalizeQuery(query: string): string[] {
  return fold(query).trim().split(/\s+/).filter(Boolean);
}

// ── Indexed text & scoring ────────────────────────────────────────────────
/** All searchable fields for one item in the given locale (NFKC-folded). */
export function itemSearchText(item: SearchIndexItem, locale: Locale): string {
  const parts: string[] = [
    pick(locale, item.title),
    pick(locale, item.context),
    pick(locale, item.keywords),
    item.category ? pick(locale, item.category) : '',
    item.id,
    item.type,
  ];
  return fold(parts.filter(Boolean).join(' '));
}

/**
 * AND-match items (every term must appear in itemSearchText), then rank:
 * +10 per term in title, +6 keywords, +3 context, +1 id, +2 title-prefix.
 * Sorted by score desc, then localized title asc. [] when terms empty.
 */
export function searchItems(
  items: SearchIndexItem[],
  terms: string[],
  locale: Locale,
): SearchHit[] {
  const active = terms.map(cleanTerm).filter(Boolean);
  if (active.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const item of items) {
    const haystack = itemSearchText(item, locale);
    if (!active.every((term) => haystack.includes(term))) continue;

    const title = fold(pick(locale, item.title));
    const keywords = fold(pick(locale, item.keywords));
    const context = fold(pick(locale, item.context));
    let score = 0;
    for (const term of active) {
      if (title.includes(term)) score += 10;
      if (keywords.includes(term)) score += 6;
      if (context.includes(term)) score += 3;
      if (item.id.toLowerCase().includes(term)) score += 1;
      if (title.startsWith(term) || title.split(/\s+/).some((t) => t.startsWith(term))) score += 2;
      if (item.section === 'assessment' && item.type === 'indicator') {
        const code = fold(item.id);
        if (code === term || code.startsWith(term)) score += 25;
      }
    }
    hits.push({ item, score });
  }

  const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
  hits.sort(
    (a, b) =>
      b.score - a.score || cmp(fold(pick(locale, a.item.title)), fold(pick(locale, b.item.title))),
  );
  return hits;
}

// ── Grouping ──────────────────────────────────────────────────────────────
/** Group hits by section in SECTIONS order; omit empty groups. */
export function groupBySection(
  hits: SearchHit[],
  activeSections?: Set<SectionId>,
): SearchGroup[] {
  const filtered =
    activeSections && activeSections.size > 0
      ? hits.filter((h) => activeSections.has(h.item.section))
      : hits;
  const groups: SearchGroup[] = [];
  for (const section of SECTIONS) {
    const sectionHits = filtered.filter((h) => h.item.section === section.id);
    if (sectionHits.length === 0) continue;
    groups.push({ section: section.id, label: section.label, hits: sectionHits });
  }
  return groups;
}

// ── HTML safety ───────────────────────────────────────────────────────────
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape HTML-sensitive characters (& < > " '). */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch]);
}

/**
 * Escape first, then wrap each term occurrence in <mark> (case-insensitive).
 * Matching runs on a lowercased copy; marks are spliced into the escaped
 * string, with overlapping ranges merged so marks never nest.
 */
export function highlightText(text: string, terms: string[]): string {
  const escaped = escapeHtml(text);
  const active = terms.map(cleanTerm).filter(Boolean);
  if (active.length === 0) return escaped;

  const lower = escaped.toLowerCase();
  const ranges: Array<[number, number]> = [];
  for (const term of active) {
    let from = 0;
    let idx = lower.indexOf(term, from);
    while (idx !== -1) {
      ranges.push([idx, idx + term.length]);
      from = idx + term.length;
      idx = lower.indexOf(term, from);
    }
  }
  if (ranges.length === 0) return escaped;

  // Merge overlapping/adjacent ranges so marks never nest.
  ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }

  // Splice from the end backwards so earlier indices stay valid.
  let out = escaped;
  for (let i = merged.length - 1; i >= 0; i--) {
    const [start, end] = merged[i];
    out = out.slice(0, start) + '<mark>' + out.slice(start, end) + '</mark>' + out.slice(end);
  }
  return out;
}
