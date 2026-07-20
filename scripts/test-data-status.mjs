/**
 * Unit tests for data-status resolver (must match src/utils/data-status.ts).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function resolveDisplayStatus(year) {
  if (!year) return 'missing';
  const monthCount = year.months?.length ?? 0;
  const { dataStatus } = year;
  if (dataStatus === 'VERIFIED_BASELINE') return 'verified_baseline';
  if (dataStatus === 'complete' || monthCount >= 12) return 'complete';
  if (dataStatus === 'CURRENT_DATA_PENDING') {
    return monthCount > 0 ? 'in_progress' : 'pending';
  }
  if (dataStatus === 'in_progress' || monthCount > 0) return 'in_progress';
  if (dataStatus === 'missing') return 'missing';
  return monthCount > 0 ? 'in_progress' : 'pending';
}

function shouldShowYoy(current) {
  if (!current) return false;
  const status = resolveDisplayStatus(current);
  if (status === 'pending' || status === 'missing') return false;
  return (current.months?.length ?? 0) >= 12;
}

function hasDisplayableTotal(current) {
  if (!current) return false;
  const status = resolveDisplayStatus(current);
  return status === 'complete' || status === 'in_progress' || status === 'verified_baseline';
}

describe('resolveDisplayStatus', () => {
  it('maps CURRENT_DATA_PENDING with months to in_progress', () => {
    const year = { dataStatus: 'CURRENT_DATA_PENDING', months: [{ month: 1, value: 100 }] };
    assert.equal(resolveDisplayStatus(year), 'in_progress');
  });

  it('maps CURRENT_DATA_PENDING without months to pending', () => {
    const year = { dataStatus: 'CURRENT_DATA_PENDING', months: [] };
    assert.equal(resolveDisplayStatus(year), 'pending');
  });

  it('maps VERIFIED_BASELINE correctly', () => {
    const year = { dataStatus: 'VERIFIED_BASELINE', months: Array(12).fill({ month: 1, value: 1 }) };
    assert.equal(resolveDisplayStatus(year), 'verified_baseline');
  });
});

describe('shouldShowYoy', () => {
  it('suppresses YoY for partial year', () => {
    const year = { dataStatus: 'CURRENT_DATA_PENDING', months: [{ month: 1 }, { month: 2 }] };
    assert.equal(shouldShowYoy(year), false);
  });

  it('allows YoY for full year', () => {
    const year = { dataStatus: 'complete', months: Array.from({ length: 12 }, (_, i) => ({ month: i + 1 })) };
    assert.equal(shouldShowYoy(year), true);
  });
});

describe('hasDisplayableTotal', () => {
  it('returns true for partial pending data', () => {
    const year = { dataStatus: 'CURRENT_DATA_PENDING', months: [{ month: 1, value: 50 }] };
    assert.equal(hasDisplayableTotal(year), true);
  });

  it('returns false for empty pending', () => {
    const year = { dataStatus: 'CURRENT_DATA_PENDING', months: [] };
    assert.equal(hasDisplayableTotal(year), false);
  });
});
