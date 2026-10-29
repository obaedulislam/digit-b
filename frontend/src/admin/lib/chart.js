/** Pure helpers for the dashboard bar chart. */

const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000];

/**
 * Axis scale for integer counts: 4 equal divisions, round step.
 * niceScale(0) -> { max: 4, step: 1, ticks: [0,1,2,3,4] }
 */
export function niceScale(peak) {
  const value = Math.max(0, Number(peak) || 0);
  const step = STEPS.find((candidate) => candidate * 4 >= value) ?? Math.ceil(value / 4);
  return { max: step * 4, step, ticks: [0, 1, 2, 3, 4].map((i) => i * step) };
}

/** Summary used for the chart's accessible description. */
export function summarizeSeries(series, formatLabel = (value) => value) {
  const total = series.reduce((sum, point) => sum + point.count, 0);
  const peak = series.reduce((best, point) => (point.count > (best?.count ?? -1) ? point : best), null);
  return {
    total,
    peak,
    text:
      total === 0
        ? 'No applications were received in this period.'
        : `${total} applications in ${series.length} days. Busiest day: ${formatLabel(peak.date)} with ${peak.count}.`,
  };
}
