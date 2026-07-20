import dashboardKpi from './dashboard-kpi.json';

export interface DashboardMeta {
  id: string;
  title: string;
  titleTh?: string;
  description: string;
  descriptionTh?: string;
  categoryId?: string;
  csvFile: string;
  kpiField: string;
  kpiLabel: string;
  kpiLabelTh?: string;
  kpiScore?: number;
  kpiUnit?: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  sourceLabel: string;
  sourceLabelTh?: string;
}

interface KpiEntry {
  id: string;
  label: string;
  value?: number;
  unit?: string;
  categoryId?: string;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

const kpiMap = new Map<string, KpiEntry>(dashboardKpi.kpis.map((k) => [k.id, k as KpiEntry]));

const dashboards: DashboardMeta[] = [
  {
    id: 'energy',
    title: 'Electricity Consumption Dashboard',
    titleTh: 'แดชบอร์ดการใช้ไฟฟ้า',
    description: 'Monitor electricity consumption (kWh), peak demand, and cost trends — aligned to Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน.',
    descriptionTh: 'ติดตามการใช้ไฟฟ้า (kWh) ความต้องการไฟฟ้าสูงสุด และแนวโน้มค่าใช้จ่าย ตามเกณฑ์ Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน',
    categoryId: 'cat3',
    csvFile: 'energy.csv',
    kpiField: 'kwh',
    kpiLabel: 'Energy Score',
    kpiLabelTh: 'คะแนนพลังงาน',
    kpiScore: kpiMap.get('energy')?.value ?? 0,
    trend: kpiMap.get('energy')?.trend ?? 'stable',
    color: '#059669',
    sourceLabel: 'Energy monitoring records — goffice.mju.ac.th',
    sourceLabelTh: 'บันทึกการติดตามพลังงาน — goffice.mju.ac.th',
  },
  {
    id: 'water',
    title: 'Water Consumption Dashboard',
    titleTh: 'แดชบอร์ดการใช้น้ำ',
    description: 'Track water usage volume (cubic meters) and conservation progress — aligned to Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน.',
    descriptionTh: 'ติดตามปริมาณการใช้น้ำ (ลูกบาศก์เมตร) และความคืบหน้าการอนุรักษ์น้ำ ตามเกณฑ์ Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน',
    categoryId: 'cat3',
    csvFile: 'water.csv',
    kpiField: 'cubic_meters',
    kpiLabel: 'Water Score',
    kpiLabelTh: 'คะแนนน้ำ',
    kpiScore: kpiMap.get('water')?.value ?? 0,
    trend: kpiMap.get('water')?.trend ?? 'stable',
    color: '#0284c7',
    sourceLabel: 'Water meter records — goffice.mju.ac.th',
    sourceLabelTh: 'บันทึกมิเตอร์น้ำ — goffice.mju.ac.th',
  },
  {
    id: 'fuel',
    title: 'Fuel Consumption Dashboard',
    titleTh: 'แดชบอร์ดการใช้เชื้อเพลิง',
    description: 'Monitor fuel consumption (liters) for fleet vehicles — aligned to Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน.',
    descriptionTh: 'ติดตามการใช้เชื้อเพลิง (ลิตร) ของยานพาหนะของหน่วยงาน ตามเกณฑ์ Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน',
    categoryId: 'cat3',
    csvFile: 'fuel.csv',
    kpiField: 'liters',
    kpiLabel: 'Fuel Consumption',
    kpiLabelTh: 'การใช้เชื้อเพลิง',
    kpiScore: kpiMap.get('fuel')?.value ?? 22928,
    kpiUnit: 'L',
    trend: kpiMap.get('fuel')?.trend ?? 'down',
    color: '#d97706',
    sourceLabel: 'Fuel consumption records — 1.3_Gassolene.xlsx',
    sourceLabelTh: 'บันทึกการใช้เชื้อเพลิง — 1.3_Gassolene.xlsx',
  },
  {
    id: 'paper',
    title: 'Paper Consumption Dashboard',
    titleTh: 'แดชบอร์ดการใช้กระดาษ',
    description: 'Track paper usage (kg, reams) and reduction initiatives — aligned to Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน.',
    descriptionTh: 'ติดตามการใช้กระดาษ (กิโลกรัม, รีม) และมาตรการลดการใช้กระดาษ ตามเกณฑ์ Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน',
    categoryId: 'cat3',
    csvFile: 'paper.csv',
    kpiField: 'kg_estimated',
    kpiLabel: 'Paper Consumption',
    kpiLabelTh: 'การใช้กระดาษ',
    kpiScore: kpiMap.get('paper')?.value ?? 2198,
    kpiUnit: 'kg',
    trend: kpiMap.get('paper')?.trend ?? 'up',
    color: '#6366f1',
    sourceLabel: 'Paper consumption records — 1.4_Paper.xlsx',
    sourceLabelTh: 'บันทึกการใช้กระดาษ — 1.4_Paper.xlsx',
  },
  {
    id: 'waste',
    title: 'Waste Management Dashboard',
    titleTh: 'แดชบอร์ดการจัดการของเสีย',
    description: 'Review waste segregation, recycling rates, and landfill diversion — aligned to Green Office หมวดที่ 4 การจัดการของเสีย.',
    descriptionTh: 'ติดตามการคัดแยกของเสีย อัตราการรีไซเคิล และการลดปริมาณของเสียที่นำไปฝังกลบ ตามเกณฑ์ Green Office หมวดที่ 4 การจัดการของเสีย',
    categoryId: 'cat4',
    csvFile: 'waste.csv',
    kpiField: 'recycle_pct',
    kpiLabel: 'Waste Score',
    kpiLabelTh: 'คะแนนของเสีย',
    kpiScore: kpiMap.get('waste')?.value ?? 0,
    trend: kpiMap.get('waste')?.trend ?? 'stable',
    color: '#7c3aed',
    sourceLabel: 'Waste management records — goffice.mju.ac.th',
    sourceLabelTh: 'บันทึกการจัดการของเสีย — goffice.mju.ac.th',
  },
  {
    id: 'ghg',
    title: 'GHG Emissions Dashboard',
    titleTh: 'แดชบอร์ดการปล่อยก๊าซเรือนกระจก',
    description: 'Track Scope 1 and Scope 2 greenhouse gas emissions (tCO₂e) and reduction progress — aligned to Green Office หมวดที่ 5 สภาพแวดล้อมและความปลอดภัย.',
    descriptionTh: 'ติดตามการปล่อยก๊าซเรือนกระจกขอบเขตที่ 1 และ 2 (tCO₂e) และความคืบหน้าการลดการปล่อยก๊าซ ตามเกณฑ์ Green Office หมวดที่ 5 สภาพแวดล้อมและความปลอดภัย',
    categoryId: 'cat1',
    csvFile: 'ghg.csv',
    kpiField: 'total_tco2e',
    kpiLabel: 'Emissions Score',
    kpiLabelTh: 'คะแนนการปล่อยก๊าซเรือนกระจก',
    kpiScore: kpiMap.get('emissions')?.value ?? 0,
    trend: kpiMap.get('emissions')?.trend ?? 'stable',
    color: '#dc2626',
    sourceLabel: 'GHG inventory records — goffice.mju.ac.th',
    sourceLabelTh: 'บันทึกบัญชีก๊าซเรือนกระจก — goffice.mju.ac.th',
  },
];

export function dashTitle(d: DashboardMeta, locale: 'th' | 'en'): string {
  return locale === 'th' ? (d.titleTh || d.title) : d.title;
}

export function dashDescription(d: DashboardMeta, locale: 'th' | 'en'): string {
  return locale === 'th' ? (d.descriptionTh || d.description) : d.description;
}

export function dashSourceLabel(d: DashboardMeta, locale: 'th' | 'en'): string {
  return locale === 'th' ? (d.sourceLabelTh || d.sourceLabel) : d.sourceLabel;
}

export { dashboards };
