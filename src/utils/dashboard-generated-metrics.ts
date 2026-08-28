import type { MultiYearMetric } from './multi-year-schema';

import energyGen from '../data/generated/energy.json';
import waterGen from '../data/generated/water.json';
import fuelGen from '../data/generated/fuel.json';
import paperGen from '../data/generated/paper.json';
import wasteGen from '../data/generated/waste.json';
import ghgGen from '../data/generated/ghg.json';

/**
 * Canonical generated metric JSON keyed by dashboard resource id.
 * `waste` maps to generated/waste.json (WASTE MASS in kg) — the recycling
 * rate (generated/recycling_rate.json, unit %) is a separate metric and is
 * never presented as waste mass.
 */
export const generatedMetricMap: Record<string, MultiYearMetric> = {
  energy: energyGen as MultiYearMetric,
  water: waterGen as MultiYearMetric,
  fuel: fuelGen as MultiYearMetric,
  paper: paperGen as MultiYearMetric,
  waste: wasteGen as MultiYearMetric,
  ghg: ghgGen as MultiYearMetric,
};
