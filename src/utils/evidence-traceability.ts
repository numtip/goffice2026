import resourceIndicatorMapData from '../data/resource-indicator-map.json';
import evidenceIndexData from '../data/evidence-index.json';
import categoriesData from '../data/criteria/categories.json';
import issuesData from '../data/criteria/issues.json';
import indicatorsData from '../data/criteria/indicators.json';
import {
  NO_PUBLISHED_EVIDENCE,
  PENDING_OFFICIAL_PUBLICATION,
  SOURCE_OFFLINE,
  pubLabel,
} from './publication-states';

export interface EvidenceProvenance {
  sourceType?: string;
  sourceLabel?: string;
  sourceLabelTh?: string;
  mappingReviewId?: string;
  mappingConfidence?: string;
  humanVerificationRequired?: boolean;
}

export interface EvidenceItem {
  id: string;
  title: string;
  titleTh?: string;
  year?: number;
  fileType?: string;
  traceabilityLevel?: string;
  indicatorCodes?: string[];
  issueCodes?: string[];
  categoryCodes?: string[];
  status?: string;
  provenance?: EvidenceProvenance;
  verification?: { status?: string; basis?: string; basisTh?: string };
  path?: string;
  realSourceAvailable?: boolean;
  realSourcePath?: string;
  sharePointUrl?: string | null;
  sharePointUrlPending?: boolean;
  publicationMode?: string;
  description?: string;
  descriptionTh?: string;
}

export type EvidencePublicationKind =
  | 'placeholder'
  | 'source-offline'
  | 'public-static'
  | 'metadata-internal'
  | 'sharepoint';

export interface EvidencePublicationView {
  kind: EvidencePublicationKind;
  label: string;
  documentHref: string | null;
  sharePointUrl: string | null;
  sharePointPending: boolean;
}

export interface CanonicalTaxonomyCounts {
  categories: number;
  issues: number;
  indicators: number;
}

type ResourceIndicatorMap = typeof resourceIndicatorMapData;

const defaultItems = evidenceIndexData.items as EvidenceItem[];

export function getEvidenceForIndicator(
  indicatorCode: string,
  items: EvidenceItem[] = defaultItems,
): EvidenceItem[] {
  return items.filter(
    (item) =>
      item.traceabilityLevel === 'indicator' &&
      Array.isArray(item.indicatorCodes) &&
      item.indicatorCodes.includes(indicatorCode),
  );
}

export function getIndicatorCodesForDashboard(
  dashboardId: string,
  map: ResourceIndicatorMap = resourceIndicatorMapData,
): string[] {
  const domain = map.mappings.find((entry) => entry.dashboardId === dashboardId);
  if (!domain) return [];
  return domain.mappedIndicators.map((indicator) => indicator.code);
}

export function getEvidenceForDashboard(
  dashboardId: string,
  items: EvidenceItem[] = defaultItems,
  map: ResourceIndicatorMap = resourceIndicatorMapData,
): EvidenceItem[] {
  const indicatorCodes = new Set(getIndicatorCodesForDashboard(dashboardId, map));
  if (indicatorCodes.size === 0) return [];

  return items.filter(
    (item) =>
      item.traceabilityLevel === 'indicator' &&
      Array.isArray(item.indicatorCodes) &&
      item.indicatorCodes.some((code) => indicatorCodes.has(code)),
  );
}

export function publicSourceLabel(item: EvidenceItem, locale: 'th' | 'en' = 'en'): string | null {
  if (locale === 'th' && item.provenance?.sourceLabelTh) return item.provenance.sourceLabelTh;
  if (item.provenance?.sourceLabel) return item.provenance.sourceLabel;
  if (item.fileType === 'XLSX') {
    return locale === 'th' ? 'ไฟล์บันทึกข้อมูลการปฏิบัติงาน' : 'Operational monitoring workbook';
  }
  return null;
}

export function countCanonicalTaxonomy(): CanonicalTaxonomyCounts {
  return {
    categories: categoriesData.categories.length,
    issues: issuesData.issues.length,
    indicators: indicatorsData.indicators.length,
  };
}

/** Static site document href — null when placeholder, offline, or missing path (no guessed URLs). */
export function resolvePublicDocumentHref(
  item: EvidenceItem,
  hrefFn: (path: string) => string = (p) => p,
): string | null {
  if (item.status === 'placeholder') return null;
  if (item.realSourceAvailable === false) return null;
  if (!item.path) return null;
  return hrefFn(item.path);
}

export function describeEvidencePublication(
  item: EvidenceItem,
  locale: 'th' | 'en' = 'th',
  hrefFn: (path: string) => string = (p) => p,
): EvidencePublicationView {
  const isPlaceholder = item.status === 'placeholder';
  const sourceOffline = !isPlaceholder && item.realSourceAvailable === false;
  const documentHref = resolvePublicDocumentHref(item, hrefFn);
  const sharePointUrl = item.sharePointUrl || null;
  const sharePointPending = Boolean(item.sharePointUrlPending && !sharePointUrl);

  if (isPlaceholder) {
    return {
      kind: 'placeholder',
      label: pubLabel(PENDING_OFFICIAL_PUBLICATION, locale),
      documentHref: null,
      sharePointUrl: null,
      sharePointPending: false,
    };
  }
  if (sourceOffline) {
    return {
      kind: 'source-offline',
      label: pubLabel(SOURCE_OFFLINE, locale),
      documentHref: null,
      sharePointUrl,
      sharePointPending,
    };
  }
  if (documentHref) {
    return {
      kind: 'public-static',
      label: locale === 'th' ? 'เอกสารเผยแพร่สาธารณะ' : 'Public document',
      documentHref,
      sharePointUrl,
      sharePointPending,
    };
  }
  if (sharePointUrl) {
    return {
      kind: 'sharepoint',
      label: locale === 'th' ? 'เข้าถึงผ่าน SharePoint' : 'SharePoint access',
      documentHref: null,
      sharePointUrl,
      sharePointPending: false,
    };
  }
  if (item.publicationMode === 'internal-metadata-only') {
    return {
      kind: 'metadata-internal',
      label:
        locale === 'th'
          ? 'เผยแพร่เมตาดาตา — ไฟล์ต้นฉบับภายใน'
          : 'Published metadata — internal source',
      documentHref: null,
      sharePointUrl: null,
      sharePointPending,
    };
  }
  return {
    kind: 'metadata-internal',
    label: pubLabel(NO_PUBLISHED_EVIDENCE, locale),
    documentHref: null,
    sharePointUrl: null,
    sharePointPending,
  };
}

/** Registry-backed implementation notes from linked evidence verification text (deduped). */
export function implementationNotesForIndicator(
  indicatorCode: string,
  items: EvidenceItem[] = defaultItems,
  locale: 'th' | 'en' = 'th',
): string[] {
  const linked = getEvidenceForIndicator(indicatorCode, items);
  const seen = new Set<string>();
  const notes: string[] = [];
  for (const item of linked) {
    const text =
      locale === 'th'
        ? (item.verification?.basisTh || item.verification?.basis || '').trim()
        : (item.verification?.basis || item.verification?.basisTh || '').trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    notes.push(text);
  }
  return notes;
}
