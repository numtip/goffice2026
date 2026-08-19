export interface DashboardMeta {
  id: string;
  title: string;
  titleTh?: string;
  description: string;
  descriptionTh?: string;
  categoryId?: string;
  csvFile: string;
  kpiField: string;
  kpiUnit?: string;
  color: string;
  sourceLabel: string;
  sourceLabelTh?: string;
}

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
    kpiUnit: 'kWh',
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
    kpiUnit: 'm³',
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
    kpiUnit: 'L',
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
    kpiUnit: 'kg',
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
    kpiUnit: '%',
    color: '#7c3aed',
    sourceLabel: 'Waste management records — goffice.mju.ac.th',
    sourceLabelTh: 'บันทึกการจัดการของเสีย — goffice.mju.ac.th',
  },
  {
    id: 'ghg',
    title: 'GHG Emissions Dashboard',
    titleTh: 'แดชบอร์ดการปล่อยก๊าซเรือนกระจก',
    description: 'Track Scope 1 and Scope 2 greenhouse gas emissions (tCO₂e) and reduction progress — aligned to Green Office Category 1 (Environmental Policy and Planning): 1.1.3 target → 1.5.1 GHG inventory → 1.5.2 analysis → 1.6 improvement → 1.7 review.',
    descriptionTh: 'ติดตามการปล่อยก๊าซเรือนกระจกขอบเขตที่ 1 และ 2 (tCO₂e) และความคืบหน้าการลดการปล่อยก๊าซ ตามเกณฑ์ Green Office หมวดที่ 1 การกำหนดนโยบาย การวางแผนการดำเนินงาน: 1.1.3 เป้าหมาย → 1.5.1 เก็บข้อมูล GHG → 1.5.2 วิเคราะห์ → 1.6 ปรับปรุง → 1.7 ทบทวน',
    categoryId: 'cat1',
    csvFile: 'ghg.csv',
    kpiField: 'total_tco2e',
    kpiUnit: 'tCO₂e',
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
