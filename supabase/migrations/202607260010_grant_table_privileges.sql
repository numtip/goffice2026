-- GO-BE-3: Table privileges for authenticated (RLS) and service_role (local bootstrap)
-- Migration 005 revoked anon access but did not grant authenticated/service_role on operational tables.

GRANT USAGE ON SCHEMA public TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

COMMENT ON SCHEMA public IS
  'Operational tables: authenticated access filtered by RLS; service_role for local bootstrap only.';
