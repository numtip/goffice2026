import { existsSync } from 'node:fs';
import { join } from 'node:path';
import resourceIndicatorMapData from '../data/resource-indicator-map.json';
import evidenceIndexData from '../data/evidence-index.json';
import resourceSourceFilesData from '../data/resource-source-files.json';
import categoriesData from '../data/criteria/categories.json';
import issuesData from '../data/criteria/issues.json';
import indicatorsData from '../data/criteria/indicators.json';
import {
  NO_PUBLISHED_EVIDENCE,
  PENDING_OFFICIAL_PUBLICATION,
  SOURCE_OFFLINE,
  pubLabel,
} from './publication-states';
import { getLocalizedPath } from '../i18n/utils';

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

export const PUBLIC_STATIC_MODE = 'public-static';
export const INTERNAL_METADATA_MODE = 'internal-metadata-only';

const STALE_ALIAS_PATHS = new Set(
  (resourceSourceFilesData as { staleAliasPaths?: string[] }).staleAliasPaths || [],
);

/** True when metadata forbids a local static download, regardless of realSourceAvailable. */
export function isInternalMetadataOnly(item: Pick<EvidenceItem, 'publicationMode'>): boolean {
  return item.publicationMode === INTERNAL_METADATA_MODE;
}

export function isPublicStaticMode(item: Pick<EvidenceItem, 'publicationMode'>): boolean {
  return item.publicationMode === PUBLIC_STATIC_MODE;
}

/** Resolve a /documents/... site path to a file under public/, or null if missing. */
export function resolvePublicFileOnDisk(sitePath?: string | null): string | null {
  if (!sitePath) return null;
  const cleaned = sitePath.split('?')[0].split('#')[0];
  if (!cleaned.startsWith('/documents/')) return null;
  const rel = cleaned.replace(/^\//, '');
  const root = process.cwd();
  const candidates = [join(root, 'public', rel)];
  try {
    const decoded = decodeURIComponent(rel);
    if (decoded !== rel) candidates.push(join(root, 'public', decoded));
  } catch {
    /* ignore malformed encoding */
  }
  for (const abs of candidates) {
    if (existsSync(abs)) return abs;
  }
  return null;
}

export function isStaleAliasPath(sitePath?: string | null): boolean {
  if (!sitePath) return false;
  return STALE_ALIAS_PATHS.has(sitePath.split('?')[0].split('#')[0]);
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

/** Evidence library hub filtered to one indicator (client-side filter on /evidence/). */
export function getEvidenceHubHrefForIndicator(
  indicatorCode: string,
  locale: 'th' | 'en' = 'th',
): string {
  const base = getLocalizedPath(locale, '/evidence');
  return `${base}?indicator=${encodeURIComponent(indicatorCode)}`;
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

/**
 * Static site document href.
 * A local XLSX/PDF link may render only for publicationMode=public-static when
 * the file actually exists under public/. realSourceAvailable is not proof that
 * `path` is publishable. internal-metadata-only never returns a local href.
 */
export function resolvePublicDocumentHref(
  item: EvidenceItem,
  hrefFn: (path: string) => string = (p) => p,
): string | null {
  if (item.status === 'placeholder') return null;
  if (isInternalMetadataOnly(item)) return null;
  if (item.publicationMode === 'authenticated-link') return null;
  if (item.publicationMode === 'public-metadata-pending-copy') return null;
  if (!isPublicStaticMode(item)) return null;
  if (!item.path) return null;
  if (isStaleAliasPath(item.path)) return null;
  if (!resolvePublicFileOnDisk(item.path)) return null;
  return hrefFn(item.path);
}

export function describeEvidencePublication(
  item: EvidenceItem,
  locale: 'th' | 'en' = 'th',
  hrefFn: (path: string) => string = (p) => p,
): EvidencePublicationView {
  const isPlaceholder = item.status === 'placeholder';
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
  if (isInternalMetadataOnly(item)) {
    if (sharePointUrl) {
      return {
        kind: 'sharepoint',
        label: locale === 'th' ? 'เข้าถึงผ่าน SharePoint' : 'SharePoint access',
        documentHref: null,
        sharePointUrl,
        sharePointPending: false,
      };
    }
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
  if (item.realSourceAvailable === false) {
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
  return {
    kind: 'metadata-internal',
    label: pubLabel(NO_PUBLISHED_EVIDENCE, locale),
    documentHref: null,
    sharePointUrl: null,
    sharePointPending,
  };
}

export interface ResourceSourcePublication {
  dashboardId: string;
  metric: string;
  baselineWorkbook: string;
  baselineHref: string | null;
  currentWorkbook: string;
  currentHref: string | null;
  evidenceIds: string[];
}

export function getResourceSourcePublication(
  dashboardId: string,
): ResourceSourcePublication | null {
  const domains = (resourceSourceFilesData as { domains?: Array<Record<string, unknown>> }).domains || [];
  const domain = domains.find((entry) => entry.dashboardId === dashboardId);
  if (!domain) return null;
  const current = (domain.currentYearWorkbook as Record<string, unknown> | undefined) || null;
  const baselinePath = String(domain.publicPath || '');
  const currentPath = current ? String(current.publicPath || '') : baselinePath;
  const evidenceIds = [String(domain.evidenceId)];
  if (Array.isArray(domain.secondaryEvidenceIds)) {
    evidenceIds.push(...domain.secondaryEvidenceIds.map(String));
  }
  if (current?.evidenceId) evidenceIds.push(String(current.evidenceId));
  return {
    dashboardId,
    metric: String(domain.metric),
    baselineWorkbook: String(domain.canonicalWorkbook),
    baselineHref: resolvePublicFileOnDisk(baselinePath) ? baselinePath : null,
    currentWorkbook: current ? String(current.canonicalWorkbook) : String(domain.canonicalWorkbook),
    currentHref: resolvePublicFileOnDisk(currentPath) ? currentPath : null,
    evidenceIds,
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
