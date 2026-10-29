import { useId, useState } from 'react';
import { useElementSize } from '@mantine/hooks';
import { IconChartBar, IconTable } from '@tabler/icons-react';
import { niceScale, summarizeSeries } from '../lib/chart';
import { shortDay } from '../lib/helpers';

const HEIGHT = 240;
const MARGIN = { top: 22, right: 8, bottom: 30, left: 34 };

/**
 * Small dependency-free SVG bar chart (daily counts).
 *  - the SVG is described by a text summary; the same numbers are available as a real table
 *  - a visible toggle swaps the chart for the table
 *  - direct value labels on bars, no legend needed (single series)
 */
export function BarChart({ data, title, unit = 'applications' }) {
  const id = useId();
  const { ref, width } = useElementSize();
  const [asTable, setAsTable] = useState(false);

  const W = Math.max(width || 640, 280);
  const plotW = W - MARGIN.left - MARGIN.right;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const peak = Math.max(0, ...data.map((point) => point.count));
  const scale = niceScale(peak);
  const band = plotW / Math.max(data.length, 1);
  const barW = Math.max(6, Math.min(band * 0.64, 36));
  const labelEvery = W < 460 ? 3 : 2;
  const summary = summarizeSeries(data, shortDay);

  return (
    <figure className="admin-chart">
      <figcaption className="admin-chart__caption">
        <span>
          <span className="admin-chart__title">{title}</span>
          <span className="admin-chart__summary" id={`${id}-summary`}>
            {summary.text}
          </span>
        </span>
        <button type="button" className="admin-chart__toggle" aria-pressed={asTable} onClick={() => setAsTable((value) => !value)}>
          {asTable ? <IconChartBar size={14} stroke={1.75} aria-hidden="true" /> : <IconTable size={14} stroke={1.75} aria-hidden="true" />}
          {asTable ? 'Show chart' : 'Show as table'}
        </button>
      </figcaption>

      <div ref={ref} className="admin-chart__frame" hidden={asTable}>
        <svg className="admin-chart__svg" width={W} height={HEIGHT} viewBox={`0 0 ${W} ${HEIGHT}`} role="img" aria-labelledby={`${id}-summary`}>
          {scale.ticks.map((tick) => {
            const y = MARGIN.top + plotH - (tick / scale.max) * plotH;
            return (
              <g key={tick}>
                <line className="admin-chart__grid" x1={MARGIN.left} x2={W - MARGIN.right} y1={y} y2={y} />
                <text className="admin-chart__tick" x={MARGIN.left - 8} y={y + 4} textAnchor="end">
                  {tick}
                </text>
              </g>
            );
          })}
          {data.map((point, index) => {
            const x = MARGIN.left + index * band + (band - barW) / 2;
            const h = point.count === 0 ? 2 : Math.max(3, (point.count / scale.max) * plotH);
            const y = MARGIN.top + plotH - h;
            const last = index === data.length - 1;
            const showLabel = (data.length - 1 - index) % labelEvery === 0;
            return (
              <g key={point.date}>
                <rect className={`admin-chart__bar${last ? ' is-latest' : ''}${point.count === 0 ? ' is-zero' : ''}`} x={x} y={y} width={barW} height={h} rx="2">
                  <title>{`${shortDay(point.date)}: ${point.count} ${unit}`}</title>
                </rect>
                {point.count > 0 && (
                  <text className="admin-chart__value" x={x + barW / 2} y={y - 6} textAnchor="middle">
                    {point.count}
                  </text>
                )}
                {showLabel && (
                  <text className="admin-chart__tick" x={x + barW / 2} y={HEIGHT - 10} textAnchor="middle">
                    {shortDay(point.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <table className={asTable ? 'admin-chart__table' : 'sr-only'}>
        <caption className="sr-only">{title}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">New {unit}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.date}>
              <th scope="row">{shortDay(point.date)}</th>
              <td>{point.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
