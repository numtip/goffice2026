#!/usr/bin/env node
/**
 * GO-BE-3: E2E verification for local auth + approval MVP.
 * Requires bootstrap-local-auth.mjs to have run first.
 */
import { createClient } from '@supabase/supabase-js';

const STAFF_EMAIL = 'local-staff@example.test';
const REVIEWER_ENERGY_EMAIL = 'local-reviewer-energy@example.test';
const REVIEWER_WATER_EMAIL = 'local-reviewer-water@example.test';

function requireEnv(name, aliases = []) {
  const keys = [name, ...aliases];
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }
  throw new Error(`Missing ${name}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function signIn(url, anonKey, email, password) {
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return client;
}

async function main() {
  const url = requireEnv('PUBLIC_SUPABASE_URL', ['API_URL']);
  const anonKey = requireEnv('PUBLIC_SUPABASE_ANON_KEY', ['ANON_KEY']);
  const password = requireEnv('LOCAL_DEV_TEST_PASSWORD');

  const steps = [];

  // 1. Staff login + create draft + submit
  const staff = await signIn(url, anonKey, STAFF_EMAIL, password);
  const { data: staffProfile } = await staff.from('profiles').select('*').single();
  assert(staffProfile?.role === 'staff', 'Staff profile missing');

  const { data: energyMetric } = await staff
    .from('metric_types')
    .select('id, code')
    .eq('code', 'energy')
    .single();
  assert(energyMetric?.id, 'Energy metric not found');

  const { data: samngDept } = await staff
    .from('departments')
    .select('id')
    .eq('code', 'SAMNG')
    .single();
  assert(samngDept?.id, 'SAMNG department not found');

  const testYear = 2569;
  const testMonth = 7;
  const testValue = 12345.67;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
    ?? process.env.SERVICE_ROLE_KEY?.trim();
  if (serviceKey) {
    const svc = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await svc
      .from('monthly_metric_entries')
      .delete()
      .eq('metric_type_id', energyMetric.id)
      .eq('department_id', samngDept.id)
      .eq('year', testYear)
      .eq('month', testMonth);
  }

  const { data: draft, error: createError } = await staff
    .from('monthly_metric_entries')
    .insert({
      metric_type_id: energyMetric.id,
      department_id: samngDept.id,
      year: testYear,
      month: testMonth,
      value: testValue,
      status: 'draft',
      created_by: staffProfile.id,
    })
    .select('*')
    .single();
  if (createError) {
    throw createError;
  }
  steps.push('1. Staff created draft');

  const { error: submitError } = await staff
    .from('monthly_metric_entries')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      submitted_by: staffProfile.id,
      updated_by: staffProfile.id,
    })
    .eq('id', draft.id);
  if (submitError) {
    throw submitError;
  }
  steps.push('2. Staff submitted entry');

  await staff.auth.signOut();

  // 3. Energy reviewer sees assigned entry
  const reviewerEnergy = await signIn(url, anonKey, REVIEWER_ENERGY_EMAIL, password);
  const { data: energyQueue, error: energyQueueError } = await reviewerEnergy
    .from('monthly_metric_entries')
    .select('id, status')
    .eq('status', 'submitted');
  if (energyQueueError) {
    throw energyQueueError;
  }
  assert(
    energyQueue?.some((row) => row.id === draft.id),
    'Energy reviewer should see submitted energy entry',
  );
  steps.push('3. Energy reviewer sees assigned entry');

  // 4. Water reviewer cannot see energy entry (cross-metric denied)
  await reviewerEnergy.auth.signOut();
  const reviewerWater = await signIn(url, anonKey, REVIEWER_WATER_EMAIL, password);
  const { data: waterQueue, error: waterQueueError } = await reviewerWater
    .from('monthly_metric_entries')
    .select('id')
    .eq('status', 'submitted');
  if (waterQueueError) {
    throw waterQueueError;
  }
  assert(
    !waterQueue?.some((row) => row.id === draft.id),
    'Water reviewer must not see energy submitted entry',
  );
  steps.push('4. Cross-metric reviewer access denied');

  await reviewerWater.auth.signOut();

  // 5. Energy reviewer approves
  const reviewerEnergy2 = await signIn(url, anonKey, REVIEWER_ENERGY_EMAIL, password);
  const { data: reviewerProfile } = await reviewerEnergy2.from('profiles').select('id').single();
  const { error: approveError } = await reviewerEnergy2
    .from('monthly_metric_entries')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: reviewerProfile.id,
      updated_by: reviewerProfile.id,
    })
    .eq('id', draft.id);
  if (approveError) {
    throw approveError;
  }
  steps.push('5. Energy reviewer approved entry');
  await reviewerEnergy2.auth.signOut();

  // 6. Staff cannot edit approved entry
  const staff2 = await signIn(url, anonKey, STAFF_EMAIL, password);
  const { data: editRows, error: editError } = await staff2
    .from('monthly_metric_entries')
    .update({ value: 99999 })
    .eq('id', draft.id)
    .select('value');
  const blocked = Boolean(editError) || !editRows?.length;
  assert(blocked, 'Staff update on approved entry must fail (RLS or trigger)');

  const { data: afterRow } = await staff2
    .from('monthly_metric_entries')
    .select('value')
    .eq('id', draft.id)
    .single();
  assert(Number(afterRow?.value) === testValue, 'Approved value must remain unchanged');
  steps.push('6. Approved entry immutable for staff');

  await staff2.auth.signOut();

  // 7. Public view returns approved row only (anon)
  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: publicRows, error: publicError } = await anon
    .from('public_dashboard_monthly_metrics')
    .select('*')
    .eq('metric_code', 'energy')
    .eq('year', testYear)
    .eq('month', testMonth);
  if (publicError) {
    throw publicError;
  }
  assert(publicRows?.length === 1, 'Public view should return exactly one approved row');
  assert(Number(publicRows[0].value) === testValue, 'Public view value must match approved entry');
  steps.push('7. Public approved view returns approved row only');

  console.log('E2E PASS — local auth + approval MVP\n');
  for (const step of steps) {
    console.log(`  ✓ ${step}`);
  }
}

main().catch((err) => {
  console.error('E2E FAIL:', err.message ?? err);
  process.exit(1);
});
