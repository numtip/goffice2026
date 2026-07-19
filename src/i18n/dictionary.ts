/**
 * Locale dictionary module.
 *
 * Provides typed access to locale string definitions and lazy-loads the
 * appropriate JSON file based on the requested locale.
 */

// ── Locale shape types ────────────────────────────────────────────────

export interface SiteStrings {
  name: string;
  university: string;
  tagline: string;
  title_suffix: string;
  platform_version?: string;
  skip_to_content: string;
  language: string;
}

export interface HomeHeroStrings {
  badge: string;
  title_line1: string;
  title_line2: string;
  description: string;
  cta_dashboard: string;
  cta_categories: string;
  executive_preview: string;
  preview_only: string;
  metric_energy: string;
  metric_water: string;
  metric_fuel: string;
  metric_paper: string;
  metric_waste: string;
  metric_ghg: string;
}

export interface HomeMissionStrings {
  heading: string;
  description1: string;
  description2: string;
  cta: string;
  placeholder_label: string;
  placeholder_instruction: string;
}

export interface HomeExecutiveStrings {
  heading: string;
  description: string;
  label: string;
  overview: string;
  snapshot: string;
  cta: string;
  data_pending: string;
  months_format: string;
}

export interface HomeAssessmentStrings {
  heading: string;
  description: string;
  hub_label: string;
  hub_title: string;
  cta: string;
}

export interface HomeEvidenceStrings {
  badge: string;
  heading: string;
  description: string;
  total_records: string;
  available: string;
  capability_1: string;
  capability_2: string;
  capability_3: string;
  cta_documents: string;
  cta_evidence: string;
}

export interface HomeActivitiesStrings {
  heading: string;
  description: string;
  status: string;
  preview_label: string;
  placeholder_image: string;
  placeholder_category: string;
  activity_1_title: string;
  activity_1_excerpt: string;
  activity_2_title: string;
  activity_2_excerpt: string;
  activity_3_title: string;
  activity_3_excerpt: string;
}

export interface HomeImprovementStrings {
  label: string;
  heading: string;
  description: string;
  stage_1_title: string;
  stage_1_subtitle: string;
  stage_1_description: string;
  stage_2_title: string;
  stage_2_subtitle: string;
  stage_2_description: string;
  stage_3_title: string;
  stage_3_subtitle: string;
  stage_3_description: string;
  stage_4_title: string;
  stage_4_subtitle: string;
  stage_4_description: string;
  stage_5_title: string;
  stage_5_subtitle: string;
  stage_5_description: string;
  stage_6_title: string;
  stage_6_subtitle: string;
  stage_6_description: string;
  stage_7_title: string;
  stage_7_subtitle: string;
  stage_7_description: string;
}

export interface HomeCtaStrings {
  label: string;
  heading: string;
  description: string;
  btn_dashboard: string;
  btn_categories: string;
  btn_evidence: string;
  btn_documents: string;
  btn_search: string;
}

export interface HomeNavStrings {
  home: string;
  dashboard: string;
  categories: string;
  evidence: string;
  documents: string;
  search: string;
  menu: string;
}

export interface HomeFooterStrings {
  title: string;
  description: string;
  copyright: string;
}

export interface HomeStrings {
  hero: HomeHeroStrings;
  mission: HomeMissionStrings;
  executive: HomeExecutiveStrings;
  assessment: HomeAssessmentStrings;
  evidence: HomeEvidenceStrings;
  activities: HomeActivitiesStrings;
  improvement: HomeImprovementStrings;
  cta: HomeCtaStrings;
  nav: HomeNavStrings;
  footer: HomeFooterStrings;
}

export interface DashboardPageStrings {
  title: string;
  subtitle: string;
  reference_label: string;
  updated_label: string;
  overall_score_label: string;
  taxonomy_summary: string;
  view_reference: string;
  yoy_heading: string;
  yoy_caption: string;
  baseline_label: string;
  current_label: string;
  months_unit: string;
  yoy_prefix: string;
  partial_year_tag: string;
  data_pending: string;
  partial_year_title: string;
  partial_year_body: string;
  category_scores_heading: string;
  category_prefix: string;
  dashboard_link: string;
  completeness_heading: string;
  legend_present: string;
  legend_pending: string;
  completeness_note: string;
  table_metric: string;
  table_month: string;
  table_total: string;
  source_heading: string;
  source_baseline_label: string;
  source_current_label: string;
  source_departmental: string;
  source_staff_excel: string;
  source_same_files: string;
  pipeline_heading: string;
  last_updated_label: string;
  generated_data_label: string;
  reference_note: string;
}

export interface DocumentsPageStrings {
  title: string;
  description: string;
  files_unit: string;
  total_label: string;
  categories_unit: string;
  evidence_items_unit: string;
  breadcrumb_label: string;
  available_suffix: string;
  pending_suffix: string;
  evidence_items_heading: string;
  empty_title: string;
  empty_body: string;
  back_to_prefix: string;
  back_to_suffix: string;
}

export interface LocaleStrings {
  site: SiteStrings;
  home: HomeStrings;
  dashboardPage: DashboardPageStrings;
  documentsPage: DocumentsPageStrings;
}

// ── Dictionary loading ────────────────────────────────────────────────

const localeCache = new Map<'th' | 'en', LocaleStrings>();

export async function getDictionary(locale: 'th' | 'en'): Promise<LocaleStrings> {
  const cached = localeCache.get(locale);
  if (cached) return cached;

  const mod: { default: LocaleStrings } = await import(
    `../data/locales/${locale}.json`
  );
  localeCache.set(locale, mod.default);
  return mod.default;
}
