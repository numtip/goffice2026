import type { DataStatus, YearData } from './multi-year-schema';

/** UI-facing status derived from pipeline enum + month coverage */
export type DisplayStatus =
  | 'verified_baseline'
  | 'complete'
  | 'in_progress'
  | 'pending'
  | 'missing';

/**
 * Resolve a year record to a single display status for badges and copy.
 * CURRENT_DATA_PENDING with partial months → in_progress (not "no data").
 */
export function resolveDisplayStatus(year: YearData | undefined): DisplayStatus {
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

/** YoY is meaningful only when the current year has a full 12 months. */
export function shouldShowYoy(current: YearData | undefined): boolean {
  if (!current) return false;
  const status = resolveDisplayStatus(current);
  if (status === 'pending' || status === 'missing') return false;
  return (current.months?.length ?? 0) >= 12;
}

export function hasDisplayableTotal(current: YearData | undefined): boolean {
  if (!current) return false;
  const status = resolveDisplayStatus(current);
  return status === 'complete' || status === 'in_progress' || status === 'verified_baseline';
}

export function statusBadgeClass(status: DisplayStatus | DataStatus): string {
  const resolved =
    status === 'VERIFIED_BASELINE' || status === 'verified_baseline'
      ? 'verified_baseline'
      : status === 'CURRENT_DATA_PENDING' || status === 'pending'
        ? 'pending'
        : status === 'TARGET_PENDING_APPROVAL'
          ? 'in_progress'
          : status;

  if (resolved === 'verified_baseline') return 'bg-blue-100 text-blue-800';
  if (resolved === 'complete') return 'bg-green-100 text-green-800';
  if (resolved === 'in_progress') return 'bg-yellow-100 text-yellow-800';
  if (resolved === 'pending' || resolved === 'missing') return 'bg-gray-100 text-gray-500';
  return 'bg-gray-100 text-gray-500';
}

export function displayStatusLabel(
  status: DisplayStatus,
  locale: 'th' | 'en',
): string {
  const th = locale === 'th';
  switch (status) {
    case 'verified_baseline':
      return th ? 'ข้อมูลฐาน' : 'Baseline';
    case 'complete':
      return th ? 'ครบถ้วน' : 'Complete';
    case 'in_progress':
      return th ? 'กำลังบันทึก' : 'In Progress';
    case 'pending':
      return th ? 'รอข้อมูล' : 'Data Pending';
    default:
      return th ? 'ไม่มีข้อมูล' : 'No data';
  }
}
