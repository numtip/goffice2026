-- GO-BE-1 Worker B: Development seed data
-- Safe for local/dev only. No users, credentials, or production values.

-- ---------------------------------------------------------------------------
-- metric_types (6 canonical environmental metrics)
-- ---------------------------------------------------------------------------
INSERT INTO public.metric_types (code, label_th, label_en, unit, sort_order, is_active)
VALUES
  ('energy', 'พลังงานไฟฟ้า', 'Electricity', 'kWh', 1, true),
  ('water', 'น้ำประปา', 'Water', 'm³', 2, true),
  ('fuel', 'เชื้อเพลิง', 'Fuel', 'L', 3, true),
  ('paper', 'กระดาษ', 'Paper', 'kg', 4, true),
  -- REVIEW_REQUIRED: waste unit confirmed as % for recycle_pct KPI; verify with PO
  ('waste', 'การจัดการขยะ', 'Waste Management', '%', 5, true),
  -- REVIEW_REQUIRED: ghg unit confirmed as tCO2e; verify emission factor workflow
  ('ghg', 'ก๊าซเรือนกระจก', 'GHG Emissions', 'tCO2e', 6, true)
ON CONFLICT (code) DO NOTHING;

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
