-- GO-BE-2B: Development seed data (Decision Baseline v1)
-- Safe for local/dev only. No users, credentials, or production values.

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
    '{"publication_scope":"office_wide","owner_department_code":"DEV-HQ","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'water',
    'น้ำประปา',
    'Water',
    'm³',
    2,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"DEV-HQ","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'fuel',
    'เชื้อเพลิง',
    'Fuel',
    'L',
    3,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"DEV-HQ","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'paper',
    'กระดาษ',
    'Paper',
    'kg',
    4,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"DEV-HQ","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'waste',
    'ปริมาณขยะ',
    'Waste Mass',
    'kg',
    5,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"DEV-HQ","entry_mode":"manual","aggregation_rule":"sum"}'::jsonb
  ),
  (
    'recycling_rate',
    'อัตราการรีไซcle',
    'Recycling Rate',
    '%',
    6,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"DEV-HQ","entry_mode":"manual","aggregation_rule":"average"}'::jsonb
  ),
  (
    'ghg',
    'ก๊าซเรือนกระจก',
    'GHG Emissions',
    'tCO2e',
    7,
    true,
    '{"publication_scope":"office_wide","owner_department_code":"DEV-HQ","entry_mode":"derived","aggregation_rule":"sum"}'::jsonb
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
-- departments (development placeholders — not production org units)
-- ---------------------------------------------------------------------------
INSERT INTO public.departments (code, name_th, name_en, is_active)
VALUES
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
        'energy', 'DEV-HQ',
        'water', 'DEV-HQ',
        'fuel', 'DEV-HQ',
        'paper', 'DEV-HQ',
        'waste', 'DEV-HQ',
        'recycling_rate', 'DEV-HQ',
        'ghg', 'DEV-HQ'
      )
    ),
    '[DEV] Metric owner department map — replace DEV-HQ with production codes when PO assigns.',
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
    'status', 'PLACEHOLDER',
    'note', 'Emission factors and activity metric inputs assigned by PO in GO-BE-2C',
    'source_metrics', jsonb_build_array('energy', 'fuel', 'paper', 'waste')
  ),
  'tCO2e',
  false
FROM public.metric_types AS mt
WHERE mt.code = 'ghg'
ON CONFLICT (metric_type_id, formula_code, effective_from) DO NOTHING;
