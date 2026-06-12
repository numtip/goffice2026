import dashboardKpi from './dashboard-kpi.json';

export interface DashboardMeta {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  csvFile: string;
  kpiField: string;
  kpiLabel: string;
  kpiScore: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface KpiEntry {
  id: string;
  label: string;
  value: number;
  unit: string;
  categoryId: string;
  trend: 'up' | 'down' | 'stable';
}

const kpiMap = new Map<string, KpiEntry>(dashboardKpi.kpis.map((k) => [k.id, k as KpiEntry]));

const dashboards: DashboardMeta[] = [
  {
    id: 'energy',
    title: 'Energy Dashboard',
    description: 'Monitor electricity consumption, peak demand, and cost trends across facilities.',
    categoryId: 'cat1',
    csvFile: 'energy.csv',
    kpiField: 'kwh',
    kpiLabel: 'Energy Score',
    kpiScore: kpiMap.get('energy')?.value ?? 0,
    trend: kpiMap.get('energy')?.trend ?? 'stable',
    color: '#059669',
  },
  {
    id: 'water',
    title: 'Water Dashboard',
    description: 'Track water usage volume and conservation progress.',
    categoryId: 'cat2',
    csvFile: 'water.csv',
    kpiField: 'cubic_meters',
    kpiLabel: 'Water Score',
    kpiScore: kpiMap.get('water')?.value ?? 0,
    trend: kpiMap.get('water')?.trend ?? 'stable',
    color: '#0284c7',
  },
  {
    id: 'waste',
    title: 'Waste Dashboard',
    description: 'Review waste segregation, recycling rates, and landfill diversion.',
    categoryId: 'cat3',
    csvFile: 'waste.csv',
    kpiField: 'total_kg',
    kpiLabel: 'Waste Score',
    kpiScore: kpiMap.get('waste')?.value ?? 0,
    trend: kpiMap.get('waste')?.trend ?? 'stable',
    color: '#7c3aed',
  },
  {
    id: 'ghg',
    title: 'GHG Emissions Dashboard',
    description: 'Track Scope 1 and Scope 2 greenhouse gas emissions and reduction progress.',
    categoryId: 'cat4',
    csvFile: 'ghg.csv',
    kpiField: 'total_tco2e',
    kpiLabel: 'Emissions Score',
    kpiScore: kpiMap.get('emissions')?.value ?? 0,
    trend: kpiMap.get('emissions')?.trend ?? 'stable',
    color: '#dc2626',
  },
];

export { dashboards };
