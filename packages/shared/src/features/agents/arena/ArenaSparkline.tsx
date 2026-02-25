import type { ReactElement } from 'react';
import React from 'react';

interface ArenaSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const ArenaSparkline = ({
  data,
  width = 80,
  height = 24,
  className,
  color,
}: ArenaSparklineProps): ReactElement => {
  const max = Math.max(...data, 1);
  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const step = chartWidth / Math.max(data.length - 1, 1);
  const strokeColor = color || 'var(--theme-accent-cabbage-default)';
  const gradientId = `sparkGrad-${data.join('-').slice(0, 20)}`;

  const points = data.map((value, i) => ({
    x: padding + i * step,
    y: padding + chartHeight - (value / max) * chartHeight,
  }));

  const pathD = points.reduce(
    (acc, point, i) => `${acc}${i === 0 ? 'M' : 'L'}${point.x},${point.y}`,
    '',
  );

  const lastPoint = points[points.length - 1];
  const areaD = `${pathD}L${lastPoint.x},${padding + chartHeight}L${padding},${
    padding + chartHeight
  }Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Breathing cursor dot at the end */}
      <circle cx={lastPoint.x} cy={lastPoint.y} r={2.5} fill={strokeColor}>
        <animate
          attributeName="r"
          values="2;3.5;2"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="1;0.5;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};
