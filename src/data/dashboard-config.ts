import dashboardKpi from './dashboard-kpi.json';

export interface DashboardMeta {
  id: string;
  title: string;
  description: string;
  categoryId?: string;
  csvFile: string;
  kpiField: string;
  kpiLabel: string;
  kpiScore?: number;
  kpiUnit?: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  sourceLabel: string;
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
    description: 'Monitor electricity consumption (kWh), peak demand, and cost trends — aligned to Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน.',
    categoryId: 'cat1',
    csvFile: 'energy.csv',
    kpiField: 'kwh',
    kpiLabel: 'Energy Score',
    kpiScore: kpiMap.get('energy')?.value ?? 0,
    trend: kpiMap.get('energy')?.trend ?? 'stable',
    color: '#059669',
    sourceLabel: 'Energy monitoring records — goffice.mju.ac.th',
  },
  {
    id: 'water',
    title: 'Water Consumption Dashboard',
    description: 'Track water usage volume (cubic meters) and conservation progress — aligned to Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน.',
    categoryId: 'cat2',
    csvFile: 'water.csv',
    kpiField: 'cubic_meters',
    kpiLabel: 'Water Score',
    kpiScore: kpiMap.get('water')?.value ?? 0,
    trend: kpiMap.get('water')?.trend ?? 'stable',
    color: '#0284c7',
    sourceLabel: 'Water meter records — goffice.mju.ac.th',
  },
  {
    id: 'fuel',
    title: 'Fuel Consumption Dashboard',
    description: 'Monitor fuel consumption (liters) for fleet vehicles — aligned to Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน.',
    csvFile: 'fuel.csv',
    kpiField: 'liters',
    kpiLabel: 'Fuel Consumption',
    kpiScore: kpiMap.get('fuel')?.value ?? 22928,
    kpiUnit: 'L',
    trend: kpiMap.get('fuel')?.trend ?? 'down',
    color: '#d97706',
    sourceLabel: 'Fuel purchase records — goffice.mju.ac.th',
  },
  {
    id: 'paper',
    title: 'Paper Consumption Dashboard',
    description: 'Track paper usage (kg, reams) and reduction initiatives — aligned to Green Office หมวดที่ 3 การใช้ทรัพยากรและพลังงาน.',
    csvFile: 'paper.csv',
    kpiField: 'kg_estimated',
    kpiLabel: 'Paper Consumption',
    kpiScore: kpiMap.get('paper')?.value ?? 2198,
    kpiUnit: 'kg',
    trend: kpiMap.get('paper')?.trend ?? 'up',
    color: '#6366f1',
    sourceLabel: 'Paper ordering records — goffice.mju.ac.th',
  },
  {
    id: 'waste',
    title: 'Waste Management Dashboard',
    description: 'Review waste segregation, recycling rates, and landfill diversion — aligned to Green Office หมวดที่ 4 การจัดการของเสีย.',
    categoryId: 'cat3',
    csvFile: 'waste.csv',
    kpiField: 'recycle_pct',
    kpiLabel: 'Waste Score',
    kpiScore: kpiMap.get('waste')?.value ?? 0,
    trend: kpiMap.get('waste')?.trend ?? 'stable',
    color: '#7c3aed',
    sourceLabel: 'Waste management records — goffice.mju.ac.th',
  },
  {
    id: 'ghg',
    title: 'GHG Emissions Dashboard',
    description: 'Track Scope 1 and Scope 2 greenhouse gas emissions (tCO₂e) and reduction progress — aligned to Green Office หมวดที่ 5 สภาพแวดล้อมและความปลอดภัย.',
    categoryId: 'cat4',
    csvFile: 'ghg.csv',
    kpiField: 'total_tco2e',
    kpiLabel: 'Emissions Score',
    kpiScore: kpiMap.get('emissions')?.value ?? 0,
    trend: kpiMap.get('emissions')?.trend ?? 'stable',
    color: '#dc2626',
    sourceLabel: 'GHG inventory records — goffice.mju.ac.th',
  },
];

export { dashboards };
