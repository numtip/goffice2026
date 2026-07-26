/** Map Supabase/PostgREST errors to bilingual user-safe messages (no secrets). */
export function formatAdminError(err: unknown): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message: unknown }).message)
        : '';

  const msg = raw.toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง / Invalid email or password.';
  }

  if (
    msg.includes('duplicate key')
    || msg.includes('monthly_metric_entries_monthly_unique')
    || msg.includes('already exists')
  ) {
    return 'มีข้อมูลตัวชี้วัด/ปี/เดือนนี้แล้ว / An entry for this metric, year, and month already exists.';
  }

  if (
    msg.includes('jwt')
    || msg.includes('session')
    || msg.includes('not authenticated')
    || msg.includes('refresh_token')
  ) {
    return 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ / Session expired. Please sign in again.';
  }

  if (msg.includes('approved entries cannot')) {
    return 'รายการที่อนุมัติแล้วไม่สามารถแก้ไขได้ / Approved entries cannot be edited.';
  }

  if (msg.includes('row-level security') || msg.includes('permission denied')) {
    return 'ไม่มีสิทธิ์ดำเนินการ / You do not have permission for this action.';
  }

  if (
    raw.length > 140
    || msg.includes('pgrst')
    || msg.includes('sqlstate')
    || msg.includes('42703')
    || msg.includes('23505')
  ) {
    return 'เกิดข้อผิดพลาด กรุณาลองใหม่ / Something went wrong. Please try again.';
  }

  if (raw.trim().length > 0) {
    return raw;
  }

  return 'เกิดข้อผิดพลาด กรุณาลองใหม่ / Something went wrong. Please try again.';
}
