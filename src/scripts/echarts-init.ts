/**
 * echarts-init.ts
 * ===============
 * Shared client-side ECharts bootstrap for GOFFICE2026 dashboards.
 *
 * Bundle strategy (smallest practical):
 *   - Modular imports: echarts/core + only the chart types, components and
 *     renderer actually used by the dashboard (tree-shakeable).
 *   - Canvas renderer (no SVG DOM overhead on mobile).
 *
 * Rendering contract — charts are data-driven via HTML attributes:
 *   <div data-echart
 *        data-option='{"..."}'          // serialized ECharts option (JSON only)
 *        data-tooltip='{"unit":"kWh",…}'>// tooltip metadata (JSON only)
 *   </div>
 *
 * Function formatters (tooltip, compact axis) are NOT serializable, so they are
 * applied here from `data-tooltip` metadata. Option objects stay pure JSON and
 * remain testable server-side (see src/utils/chart-option.ts).
 *
 * Motion policy (performance + a11y):
 *   - One short initial render animation (400ms, cubicOut).
 *   - Disabled entirely under `prefers-reduced-motion`.
 *   - No persistent/decorative animation.
 */
import { init, use } from 'echarts/core';
import { BarChart, LineChart } from 'echarts/charts';
import {
  AriaComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  AriaComponent,
  CanvasRenderer,
]);

/** Tooltip / axis metadata passed from the server via data-tooltip. */
export interface ChartTooltipMeta {
  unit?: string;
  locale?: 'th' | 'en';
  /** Text shown for a missing (null) value — never "0". */
  emptyLabel?: string;
  /** Per dataIndex extra context (e.g. category status text). */
  statusTexts?: string[];
  /** Compact notation for the value axis (e.g. 400K instead of 400000). */
  compactAxis?: boolean;
}

const reducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const numFmtCache = new Map<string, Intl.NumberFormat>();

function numFmt(locale: 'th' | 'en', compact: boolean): Intl.NumberFormat {
  const key = `${locale}:${compact}`;
  let f = numFmtCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
      notation: compact ? 'compact' : 'standard',
      maximumFractionDigits: 2,
    });
    numFmtCache.set(key, f);
  }
  return f;
}

function formatAxisTooltip(params: unknown, meta: ChartTooltipMeta): string {
  if (!Array.isArray(params) || params.length === 0) return '';
  const first = params[0] as { axisValueLabel?: string; name?: string; dataIndex?: number };
  const locale = meta.locale === 'th' ? 'th' : 'en';
  const fmt = numFmt(locale, false);
  const header = first.axisValueLabel ?? first.name ?? '';
  const unitPart = meta.unit ? ` (${meta.unit})` : '';
  const lines = params.map((p) => {
    const item = p as { seriesName?: string; value?: unknown; marker?: string; dataIndex?: number };
    const v = item.value as number | null | undefined;
    const display =
      v == null || Number.isNaN(v)
        ? (meta.emptyLabel ?? '—')
        : fmt.format(typeof v === 'number' ? v : Number(v));
    const marker = item.marker ?? '';
    return `${marker}${item.seriesName ?? ''}: <b>${display}</b>`;
  });
  let status = '';
  const idx = first.dataIndex ?? 0;
  if (meta.statusTexts && meta.statusTexts[idx]) {
    status = `<br/><span style="opacity:0.75;font-style:italic;">${meta.statusTexts[idx]}</span>`;
  }
  return `${header}${unitPart}<br/>${lines.join('<br/>')}${status}`;
}

function compactAxisFormatter(locale: 'th' | 'en') {
  const fmt = numFmt(locale, true);
  return (value: number) => fmt.format(value);
}

interface LiveChart {
  chart: ReturnType<typeof init>;
  ro: ResizeObserver | null;
}

const liveCharts: LiveChart[] = [];

/** Initialize one [data-echart] container. */
export function initChart(el: HTMLElement): void {
  const rawOption = el.getAttribute('data-option');
  if (!rawOption) return;

  let option: Record<string, unknown>;
  try {
    option = JSON.parse(rawOption) as Record<string, unknown>;
  } catch {
    // eslint-disable-next-line no-console
    console.warn('[echarts] invalid data-option on', el);
    return;
  }

  let meta: ChartTooltipMeta = {};
  const rawMeta = el.getAttribute('data-tooltip');
  if (rawMeta) {
    try {
      meta = JSON.parse(rawMeta) as ChartTooltipMeta;
    } catch {
      meta = {};
    }
  }

  const chart = init(el, undefined, { renderer: 'canvas' });

  const resolved: Record<string, unknown> = { ...option, animation: !reducedMotion };
  if (meta.unit !== undefined || meta.locale !== undefined || meta.statusTexts) {
    const baseTooltip = (option.tooltip ?? {}) as Record<string, unknown>;
    resolved.tooltip = {
      trigger: 'axis',
      ...baseTooltip,
      formatter: (params: unknown) => formatAxisTooltip(params, meta),
    };
  }
  if (meta.compactAxis && typeof resolved.yAxis === 'object' && resolved.yAxis !== null) {
    const axis = resolved.yAxis as Record<string, unknown>;
    axis.axisLabel = { ...((axis.axisLabel ?? {}) as Record<string, unknown>), formatter: compactAxisFormatter(meta.locale === 'th' ? 'th' : 'en') };
  }

  chart.setOption(resolved as never);

  let ro: ResizeObserver | null = null;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(() => {
      chart.resize();
    });
    ro.observe(el);
  }
  liveCharts.push({ chart, ro });
}

/** Initialize all [data-echart] containers in the document. */
export function initAllCharts(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-echart]').forEach(initChart);
}

if (typeof document !== 'undefined') {
  // MPA: release chart instances + observers when the page is left.
  window.addEventListener('pagehide', () => {
    for (const { chart, ro } of liveCharts.splice(0)) {
      ro?.disconnect();
      chart.dispose();
    }
  });
}
