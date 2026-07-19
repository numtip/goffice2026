import resourceIndicatorMapData from '../data/resource-indicator-map.json';
import evidenceIndexData from '../data/evidence-index.json';

export interface EvidenceProvenance {
  sourceType?: string;
  sourceLabel?: string;
  mappingReviewId?: string;
  mappingConfidence?: string;
  humanVerificationRequired?: boolean;
}

export interface EvidenceItem {
  id: string;
  title: string;
  year?: number;
  fileType?: string;
  traceabilityLevel?: string;
  indicatorCodes?: string[];
  issueCodes?: string[];
  categoryCodes?: string[];
  status?: string;
  provenance?: EvidenceProvenance;
  verification?: { status?: string; basis?: string };
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

export function publicSourceLabel(item: EvidenceItem): string | null {
  if (item.provenance?.sourceLabel) return item.provenance.sourceLabel;
  if (item.fileType === 'XLSX') return 'Operational monitoring workbook';
  return null;
}
