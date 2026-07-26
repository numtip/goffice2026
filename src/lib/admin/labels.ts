/** Bilingual admin UI strings (TH primary, EN secondary). */
export const adminLabels = {
  appTitle: { th: 'ระบบจัดการข้อมูล', en: 'Data Admin' },
  login: { th: 'เข้าสู่ระบบ', en: 'Sign in' },
  logout: { th: 'ออกจากระบบ', en: 'Sign out' },
  email: { th: 'อีเมล', en: 'Email' },
  password: { th: 'รหัสผ่าน', en: 'Password' },
  loading: { th: 'กำลังโหลด…', en: 'Loading…' },
  error: { th: 'เกิดข้อผิดพลาด', en: 'Something went wrong' },
  empty: { th: 'ไม่มีข้อมูล', en: 'No data' },
  home: { th: 'ภาพรวม', en: 'Overview' },
  entries: { th: 'บันทึกข้อมูล', en: 'Entries' },
  review: { th: 'ตรวจสอบ', en: 'Review' },
  createDraft: { th: 'สร้างร่าง', en: 'Create draft' },
  saveDraft: { th: 'บันทึกร่าง', en: 'Save draft' },
  submit: { th: 'ส่งตรวจ', en: 'Submit' },
  approve: { th: 'อนุมัติ', en: 'Approve' },
  reject: { th: 'ส่งกลับแก้ไข', en: 'Request revision' },
  comment: { th: 'ความคิดเห็น', en: 'Comment' },
  metric: { th: 'ตัวชี้วัด', en: 'Metric' },
  year: { th: 'ปี', en: 'Year' },
  month: { th: 'เดือน', en: 'Month' },
  value: { th: 'ค่า', en: 'Value' },
  note: { th: 'หมายเหตุ', en: 'Note' },
  status: { th: 'สถานะ', en: 'Status' },
  actions: { th: 'การดำเนินการ', en: 'Actions' },
  notConfigured: {
    th: 'ยังไม่ได้ตั้งค่า Supabase — ตรวจสอบไฟล์ .env',
    en: 'Supabase is not configured — check your .env file',
  },
  accessDenied: { th: 'ไม่มีสิทธิ์เข้าถึง', en: 'Access denied' },
  approvedLocked: {
    th: 'รายการที่อนุมัติแล้วไม่สามารถแก้ไขได้',
    en: 'Approved entries cannot be edited',
  },
} as const;

export type AdminLabelKey = keyof typeof adminLabels;

export function label(key: AdminLabelKey, locale: 'th' | 'en' = 'th'): string {
  const entry = adminLabels[key];
  if (typeof entry === 'object' && 'th' in entry && 'en' in entry) {
    return entry[locale];
  }
  return String(entry);
}

export function bilingual(key: AdminLabelKey): string {
  const entry = adminLabels[key];
  if (typeof entry === 'object' && 'th' in entry && 'en' in entry) {
    return `${entry.th} / ${entry.en}`;
  }
  return String(entry);
}
