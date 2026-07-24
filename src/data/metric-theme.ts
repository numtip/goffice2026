/**
 * Metric-specific visual theme configuration.
 *
 * Each metric gets a semantic accent color family used consistently across
 * hero badges, KPI cards, chart bars, progress indicators, and navigation.
 * Colors are chosen for WCAG AA contrast on white backgrounds.
 *
 * Accent mapping (per sprint spec):
 *   Energy → amber/electric
 *   Water  → blue
 *   Fuel   → orange
 *   Paper  → warm neutral (amber-brown)
 *   Waste  → green
 *   GHG    → teal/dark green
 */

export interface MetricTheme {
  /** Primary accent color (hex) — used for icons, active states, chart bars */
  accent: string;
  /** Light tint background (hex) — used for subtle badge/card backgrounds */
  accentLight: string;
  /** Dark text variant (hex) — used for text on light tint backgrounds */
  accentDark: string;
  /** Border tint (hex) — used for subtle borders */
  accentBorder: string;
  /** Icon identifier — mapped in MetricIcon.astro */
  icon: 'energy' | 'water' | 'fuel' | 'paper' | 'waste' | 'ghg';
}

export const metricThemes: Record<string, MetricTheme> = {
  energy: {
    accent: '#b45309',       // amber-700 (contrast-safe on white)
    accentLight: '#fef3c7',  // amber-100
    accentDark: '#78350f',   // amber-900
    accentBorder: '#fde68a', // amber-200
    icon: 'energy',
  },
  water: {
    accent: '#0369a1',       // sky-700
    accentLight: '#e0f2fe',  // sky-100
    accentDark: '#0c4a6e',   // sky-900
    accentBorder: '#bae6fd', // sky-200
    icon: 'water',
  },
  fuel: {
    accent: '#c2410c',       // orange-700
    accentLight: '#ffedd5',  // orange-100
    accentDark: '#7c2d12',   // orange-900
    accentBorder: '#fed7aa', // orange-200
    icon: 'fuel',
  },
  paper: {
    accent: '#a16207',       // yellow-700 (warm neutral)
    accentLight: '#fefce8',  // yellow-50
    accentDark: '#713f12',   // yellow-900
    accentBorder: '#fef08a', // yellow-200
    icon: 'paper',
  },
  waste: {
    accent: '#15803d',       // green-700
    accentLight: '#dcfce7',  // green-100
    accentDark: '#14532d',   // green-900
    accentBorder: '#bbf7d0', // green-200
    icon: 'waste',
  },
  ghg: {
    accent: '#0f766e',       // teal-700
    accentLight: '#ccfbf1',  // teal-100
    accentDark: '#134e4a',   // teal-900
    accentBorder: '#99f6e4', // teal-200
    icon: 'ghg',
  },
};

/** Tailwind-compatible class strings derived from accent for common patterns */
export function metricAccentClasses(metricId: string): {
  badge: string;
  cardBorder: string;
  iconBg: string;
  iconText: string;
  activeNav: string;
} {
  const theme = metricThemes[metricId];
  if (!theme) {
    return {
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      cardBorder: 'border-outline-variant/20',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600',
      activeNav: 'bg-primary text-white border-primary',
    };
  }

  // Map to inline-style-based classes since Tailwind can't dynamically generate
  // arbitrary colors at build time from variables. We use style attributes in
  // components for accent colors, but provide neutral utility classes here.
  return {
    badge: 'border',
    cardBorder: 'border-outline-variant/20',
    iconBg: '',
    iconText: '',
    activeNav: 'text-white',
  };
}