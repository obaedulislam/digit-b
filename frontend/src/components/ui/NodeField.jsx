import { useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import { hashString, mulberry32 } from '@/lib/seed';
import { cx } from '@/lib/cx';

const W = 600;
const H = 400;

/**
 * Generative "supply-chain network" artwork — nodes joined by routes with
 * data packets travelling along a few of them. Deterministic per `seed`, so it
 * doubles as the fallback cover image for posts/services without a photo.
 * Purely decorative (aria-hidden).
 */
export function NodeField({ seed = 'digit-b', nodes = 22, packets = 4, className }) {
  const reduceMotion = useReducedMotion();

  const { points, edges, routes } = useMemo(() => {
    const rand = mulberry32(hashString(seed));
    const pts = Array.from({ length: nodes }, (_, i) => ({
      id: i,
      x: 30 + rand() * (W - 60),
      y: 30 + rand() * (H - 60),
      r: 2.5 + rand() * 4,
      hot: rand() > 0.82,
      delay: rand() * 4,
    }));
    const links = [];
    pts.forEach((a, i) => {
      pts
        .map((b, j) => ({ j, d: (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }))
        .filter(({ j }) => j !== i)
        .sort((m, n) => m.d - n.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!links.some((l) => l.key === key)) links.push({ key, a: pts[i], b: pts[j] });
        });
    });
    const chosen = links.filter((_, i) => i % Math.max(1, Math.floor(links.length / packets)) === 0).slice(0, packets);
    return { points: pts, edges: links, routes: chosen };
  }, [seed, nodes, packets]);

  return (
    <svg className={cx('node-field', className)} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g className="node-field__edges">
        {edges.map(({ key, a, b }) => (
          <line key={key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))}
      </g>
      <g className="node-field__nodes">
        {points.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.r}
            className={cx('node-field__node', p.hot && 'node-field__node--hot')}
            style={{ animationDelay: `${p.delay}s` }}
          />
        ))}
      </g>
      {!reduceMotion && (
        <g className="node-field__packets">
          {routes.map(({ key, a, b }, i) => (
            <circle key={key} r="3.2" className="node-field__packet">
              <animateMotion dur={`${4 + (i % 3)}s`} begin={`${i * 0.9}s`} repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
            </circle>
          ))}
        </g>
      )}
    </svg>
  );
}
