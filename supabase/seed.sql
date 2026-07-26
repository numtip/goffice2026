-- GO-BE-2C: Development + production-ready reference data
-- Safe for local/dev. Production department codes sourced from workbooks (see docs/backend/PRODUCTION_CONFIG_READINESS.md).

-- ---------------------------------------------------------------------------
-- metric_types (7 canonical environmental metrics)
-- ---------------------------------------------------------------------------
INSERT INTO public.metric_types (
  code,
  label_th,
  label_en,
  unit,
  sort_order,
  is_active,
  config_metadata
)
VALUES
  (
    'energy',
    'พลังงานไฟฟ้า',
    'Electricity',
    'kWh',
    1,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"SAMNG","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'water',
    'น้ำประปา',
    'Water',
    'm³',
    2,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"SAMNG","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'fuel',
    'เชื้อเพลิง',
    'Fuel',
    'L',
    3,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"IQS","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'paper',
    'กระดาษ',
    'Paper',
    'kg',
    4,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"SAMNG","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'waste',
    'ปริมาณขยะ',
    'Waste Mass',
    'kg',
    5,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"SAMNG","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'recycling_rate',
    'อัตราการรีไซcle',
    'Recycling Rate',
    '%',
    6,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"SAMNG","entry_mode":"manual","aggregation_rule":"average"}'::jsonb
  ),
  (
    'ghg',
    'ก๊าซเรือนกระจก',
    'GHG Emissions',
    'tCO2e',
    7,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"SAMNG","entry_mode":"derived","aggregation_rule":"sum"}'::jsonb
  )
ON CONFLICT (code) DO UPDATE
SET
  label_th = EXCLUDED.label_th,
  label_en = EXCLUDED.label_en,
  unit = EXCLUDED.unit,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  config_metadata = EXCLUDED.config_metadata,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- departments (workbook-evidenced units + dev placeholders)
-- ---------------------------------------------------------------------------
INSERT INTO public.departments (code, name_th, name_en, is_active)
VALUES
  (
    'IQS',
    'IQS',
    'IQS (evidenced in fuel/paper workbooks)',
    true
  ),
  (
    'SRCH',
    'สำนักวิจัย',
    'Research Unit (evidenced in fuel workbook)',
    true
  ),
  (
    'SAMNG',
    'สำนักงาน',
    'Office / Headquarters (evidenced in paper workbook)',
    true
  ),
  (
    'DEV-HQ',
    '[DEV] สำนักงานใหญ่ (Development Only)',
    '[DEV] Headquarters (Development Only)',
    true
  ),
  (
    'DEV-OPS',
    '[DEV] หน่วยปฏิบัติการ (Development Only)',
    '[DEV] Operations Unit (Development Only)',
    true
  ),
  (
    'DEV-QA',
    '[DEV] ทีมตรวจสอบ (Development Only)',
    '[DEV] Review / QA Team (Development Only)',
    true
  )
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------------
-- organization_settings (placeholder owner + reviewer maps — PO assigns UUIDs)
-- ---------------------------------------------------------------------------
INSERT INTO public.organization_settings (setting_key, value, description, is_public)
VALUES
  (
    'metrics',
    jsonb_build_object(
      'office_canonical_department_code', 'OFFICE',
      'owner_department_map', jsonb_build_object(
        'energy', 'SAMNG',
        'water', 'SAMNG',
        'fuel', 'IQS',
        'paper', 'SAMNG',
        'waste', 'SAMNG',
        'recycling_rate', 'SAMNG',
        'ghg', 'SAMNG'
      )
    ),
    'Metric owner map from workbook evidence (GO-BE-2C). PO may override SAMNG office-wide assignments.',
    false
  ),
  (
    'workflow',
    jsonb_build_object(
      'metric_reviewer_map', jsonb_build_object(
        'energy', null,
        'water', null,
        'fuel', null,
        'paper', null,
        'waste', null,
        'recycling_rate', null,
        'ghg', null
      )
    ),
    '[DEV] One reviewer UUID per metric — PO assigns profile UUIDs before live review.',
    false
  )
ON CONFLICT (setting_key) DO UPDATE
SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- metric_formulas (GHG derivation placeholder — factors assigned by PO)
-- ---------------------------------------------------------------------------
INSERT INTO public.metric_formulas (
  metric_type_id,
  formula_code,
  config,
  result_unit,
  is_active
)
SELECT
  mt.id,
  'tgo_baseline_v1',
  jsonb_build_object(
    'status', 'DOCUMENTED_INACTIVE',
    'sourceWorkbook', 'docs/1.6_GreenhouseGas.xlsx',
    'sourceSheet', 'สรุปการคำนวณ ปี 2568',
    'methodology', 'TGO AR5 Carbon Footprint Calculator',
    'emissionFactorsSheet', 'EF TGO AR5',
    'outputRow', 'GHG ปี 2568 (kgCO2e)',
    'resultUnit', 'tCO2e',
    'conversion', 'divide_kg_by_1000',
    'annualTotalKg2568', 231620.303712,
    'activityComponents', jsonb_build_array(
      jsonb_build_object('category', 'electricity', 'metric_code', 'energy', 'sheetRow', 'การใช้พลังงานไฟฟ้า'),
      jsonb_build_object('category', 'paper', 'metric_code', 'paper', 'sheetRow', 'การใช้กระดาษ A4 และ A3 (สีขาว)'),
      jsonb_build_object('category', 'waste_landfill', 'metric_code', 'waste', 'ef_kgCO2e_per_kg', 2.32, 'sheetRow', 'ขยะของเสีย (ฝังกลบ)'),
      jsonb_build_object('category', 'ch4_septic', 'sheet', 'CH4จาก Septic tank 2568'),
      jsonb_build_object('category', 'ch4_wastewater', 'sheet', 'CH4จากบ่อบำบัดไม่เติมอากาศ 2568')
    ),
    'blockers', jsonb_build_array(
      'No runtime formula engine in MVP',
      'Live activity rows not auto-linked',
      'PO sign-off required before activation',
      'PUBLIC_DASHBOARD_DATA_MODE remains static'
    )
  ),
  'tCO2e',
  false
FROM public.metric_types AS mt
WHERE mt.code = 'ghg'
ON CONFLICT (metric_type_id, formula_code, effective_from) DO UPDATE
SET
  config = EXCLUDED.config,
  result_unit = EXCLUDED.result_unit,
  is_active = EXCLUDED.is_active,
  updated_at = now();
