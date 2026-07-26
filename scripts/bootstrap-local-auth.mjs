#!/usr/bin/env node
/**
 * GO-BE-3: Bootstrap local auth users, profiles, and reviewer map.
 * Requires: supabase start, SUPABASE_SERVICE_ROLE_KEY + PUBLIC_SUPABASE_URL in env.
 * Password: set LOCAL_DEV_TEST_PASSWORD (never commit). Not stored in repo.
 */
import { createClient } from '@supabase/supabase-js';

const METRIC_CODES = [
  'energy',
  'water',
  'fuel',
  'paper',
  'waste',
  'recycling_rate',
  'ghg',
];

const TEST_USERS = [
  {
    email: 'local-staff@example.test',
    role: 'staff',
    full_name: '[LOCAL] Staff SAMNG',
    department_code: 'SAMNG',
  },
  {
    email: 'local-admin@example.test',
    role: 'admin',
    full_name: '[LOCAL] Admin',
    department_code: 'DEV-HQ',
  },
  {
    email: 'local-reviewer-energy@example.test',
    role: 'reviewer',
    full_name: '[LOCAL] Reviewer Energy',
    department_code: 'DEV-QA',
    metric: 'energy',
  },
  {
    email: 'local-reviewer-water@example.test',
    role: 'reviewer',
    full_name: '[LOCAL] Reviewer Water',
    department_code: 'DEV-QA',
    metric: 'water',
  },
  {
    email: 'local-reviewer-shared@example.test',
    role: 'reviewer',
    full_name: '[LOCAL] Reviewer Shared',
    department_code: 'DEV-QA',
    metrics: ['fuel', 'paper', 'waste', 'recycling_rate', 'ghg'],
  },
];

function requireEnv(name, aliases = []) {
  const keys = [name, ...aliases];
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }
  throw new Error(`Missing ${name}. Run: supabase status -o env`);
}

async function ensureAuthUser(admin, email, password) {
  const { data: listed, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    throw listError;
  }

  const existing = listed.users.find((u) => u.email === email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    return existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    throw error;
  }
  return data.user.id;
}

async function main() {
  const url = requireEnv('PUBLIC_SUPABASE_URL', ['API_URL']);
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY', ['SERVICE_ROLE_KEY']);
  const password = requireEnv('LOCAL_DEV_TEST_PASSWORD');

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: departments, error: deptError } = await admin
    .from('departments')
    .select('id, code');
  if (deptError) {
    throw deptError;
  }

  const deptByCode = new Map(departments.map((d) => [d.code, d.id]));
  const userIds = new Map();

  for (const spec of TEST_USERS) {
    const userId = await ensureAuthUser(admin, spec.email, password);
    userIds.set(spec.email, userId);

    const departmentId = deptByCode.get(spec.department_code);
    if (!departmentId) {
      throw new Error(`Department not found: ${spec.department_code}`);
    }

    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: userId,
        email: spec.email,
        full_name: spec.full_name,
        role: spec.role,
        department_id: departmentId,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
    if (profileError) {
      throw profileError;
    }

    console.log(`✓ ${spec.role.padEnd(8)} ${spec.email}`);
  }

  const reviewerMap = Object.fromEntries(METRIC_CODES.map((code) => [code, null]));

  reviewerMap.energy = userIds.get('local-reviewer-energy@example.test');
  reviewerMap.water = userIds.get('local-reviewer-water@example.test');
  const sharedId = userIds.get('local-reviewer-shared@example.test');
  for (const code of ['fuel', 'paper', 'waste', 'recycling_rate', 'ghg']) {
    reviewerMap[code] = sharedId;
  }

  const { data: workflowRow, error: workflowReadError } = await admin
    .from('organization_settings')
    .select('value')
    .eq('setting_key', 'workflow')
    .maybeSingle();
  if (workflowReadError) {
    throw workflowReadError;
  }

  const nextValue = {
    ...(workflowRow?.value ?? {}),
    metric_reviewer_map: reviewerMap,
  };

  const { error: workflowError } = await admin
    .from('organization_settings')
    .update({
      value: nextValue,
      description: '[LOCAL] Test reviewer map — bootstrap-local-auth.mjs',
      updated_at: new Date().toISOString(),
    })
    .eq('setting_key', 'workflow');
  if (workflowError) {
    throw workflowError;
  }

  console.log('\n✓ Reviewer map updated for all 7 metrics (local test only)');
  console.log('  Staff:    local-staff@example.test');
  console.log('  Admin:    local-admin@example.test');
  console.log('  Reviewer: local-reviewer-energy@example.test (energy only)');
  console.log('  Reviewer: local-reviewer-water@example.test (water only)');
  console.log('\nPassword source: LOCAL_DEV_TEST_PASSWORD env var (not stored in git).');
}

main().catch((err) => {
  console.error('Bootstrap failed:', err.message ?? err);
  process.exit(1);
});
