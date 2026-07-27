import type { MultiYearMetric } from './multi-year-schema';

import energyGen from '../data/generated/energy.json';
import waterGen from '../data/generated/water.json';
import fuelGen from '../data/generated/fuel.json';
import paperGen from '../data/generated/paper.json';
import recyclingRateGen from '../data/generated/recycling_rate.json';
import ghgGen from '../data/generated/ghg.json';

/** Canonical generated metric JSON keyed by dashboard resource id. */
export const generatedMetricMap: Record<string, MultiYearMetric> = {
  energy: energyGen as MultiYearMetric,
  water: waterGen as MultiYearMetric,
  fuel: fuelGen as MultiYearMetric,
  paper: paperGen as MultiYearMetric,
  waste: recyclingRateGen as MultiYearMetric,
  ghg: ghgGen as MultiYearMetric,
};
