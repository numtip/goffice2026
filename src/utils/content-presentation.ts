/**
 * Shared presentation helpers for activities and news content hubs.
 */

export type ContentKind = 'activity' | 'news';
export type ContentStatus = 'published' | 'draft' | 'archived';

export interface LocalizedLabel {
  id: string;
  labelTh: string;
  labelEn: string;
}

export interface ContentMedia {
  type: 'image' | 'video';
  src: string;
  altTh?: string;
  altEn?: string;
}

export interface ContentMergedSource {
  joomlaArticleId: number;
  joomlaUrl: string;
}

export interface ContentSource {
  system: 'manual' | 'joomla' | 'onedrive';
  joomlaArticleId?: number | null;
  joomlaUrl?: string | null;
  joomlaCategory?: string | null;
  onedrivePath?: string | null;
  migratedAt?: string | null;
  mergedSources?: ContentMergedSource[];
}

export interface ContentRecord {
  id: string;
  slug: string;
  kind: ContentKind;
  status: ContentStatus;
  translationPending?: boolean;
  titleTh: string;
  titleEn: string;
  summaryTh: string;
  summaryEn: string;
  bodyTh?: string;
  bodyEn?: string;
  publishDate: string;
  fiscalYear: number;
  category?: LocalizedLabel;
  activityType?: LocalizedLabel;
  media?: ContentMedia[];
  relatedIndicators?: string[];
  relatedLinks?: { route: string; labelTh: string; labelEn: string }[];
  source: ContentSource;
  contentOwner?: string;
  updatedAt: string;
}

export interface ContentCollection {
  version: string;
  updated: string;
  note?: string;
  items: ContentRecord[];
}

export function isPublished(item: ContentRecord): boolean {
  return item.status === 'published';
}

/** Sort published items latest-first by publishDate DESC. */
export function sortByPublishDateDesc(items: ContentRecord[]): ContentRecord[] {
  return [...items].sort((a, b) => {
    const da = a.publishDate ?? '';
    const db = b.publishDate ?? '';
    if (da !== db) return db.localeCompare(da);
    return b.id.localeCompare(a.id);
  });
}

export function getPublishedItems(collection: ContentCollection): ContentRecord[] {
  return sortByPublishDateDesc(collection.items.filter(isPublished));
}

export function getLatestPublished(
  activities: ContentCollection,
  limit = 3,
): ContentRecord[] {
  return getPublishedItems(activities).slice(0, limit);
}

export function getAvailableYears(items: ContentRecord[]): number[] {
  const years = new Set<number>();
  for (const item of items) {
    if (item.fiscalYear) years.add(item.fiscalYear);
  }
  return [...years].sort((a, b) => b - a);
}

export interface ContentFilters {
  year?: number | null;
  category?: string | null;
  type?: string | null;
}

export function applyContentFilters(
  items: ContentRecord[],
  filters: ContentFilters,
): ContentRecord[] {
  return items.filter((item) => {
    if (filters.year && item.fiscalYear !== filters.year) return false;
    if (filters.category && item.category?.id !== filters.category) return false;
    if (filters.type && item.activityType?.id !== filters.type) return false;
    return true;
  });
}

export function parseContentFilters(searchParams: URLSearchParams): ContentFilters {
  const yearRaw = searchParams.get('year');
  const year = yearRaw ? Number(yearRaw) : null;
  return {
    year: year && !Number.isNaN(year) ? year : null,
    category: searchParams.get('category'),
    type: searchParams.get('type'),
  };
}

export function pickLocalized(
  locale: 'th' | 'en',
  th: string,
  en: string,
): string {
  return locale === 'en' ? en || th : th || en;
}

export function pickLocalizedContent(
  locale: 'th' | 'en',
  th: string,
  en: string,
  translationPending?: boolean,
): string {
  if (locale === 'en' && translationPending && !en) return th;
  return pickLocalized(locale, th, en);
}

export function formatPublishDate(isoDate: string, locale: 'th' | 'en'): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  if (locale === 'en') {
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  return `${d}/${m}/${y + 543}`;
}
