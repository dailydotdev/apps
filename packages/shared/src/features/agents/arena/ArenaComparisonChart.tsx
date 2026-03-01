import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import type { ArenaComparisonMetric, ArenaComparisonSeries } from './types';
import {
  formatComparisonMetricValue,
  getComparisonMetricLabel,
} from './arenaMetrics';
import {
  getChartLayout,
  getLinePath,
  getTooltipPosition,
  getXAxisTickLabel,
} from './arenaComparisonChartUtils';

interface ArenaComparisonChartProps {
  series: ArenaComparisonSeries[];
  metric: ArenaComparisonMetric;
  loading?: boolean;
  metricControl?: ReactElement;
}

const LINE_COLORS = [
  'var(--theme-accent-avocado-default)',
  'var(--theme-accent-water-default)',
  'var(--theme-accent-cheese-default)',
  'var(--theme-accent-onion-default)',
  'var(--theme-accent-ketchup-default)',
];

const Placeholder = ({ className }: { className?: string }): ReactElement => (
  <div
    className={classNames(
      'animate-pulse rounded-8 bg-surface-float',
      className,
    )}
  />
);

export const ArenaComparisonChart = ({
  series,
  metric,
  loading,
  metricControl,
}: ArenaComparisonChartProps): ReactElement => {
  const isTablet = useViewSize(ViewSize.Tablet);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (loading && series.length === 0) {
    return (
      <div className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Placeholder className="h-5 w-36" />
          <Placeholder className="h-4 w-24" />
        </div>
        <Placeholder className="h-56 w-full" />
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
        <p className="text-text-tertiary typo-footnote">
          No comparison data available yet.
        </p>
      </div>
    );
  }

  const { width, height, yAxisLabelX, yTickCount, xTickStep, padding } =
    getChartLayout(isTablet);

  const pointCount = Math.max(...series.map((line) => line.values.length), 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const flatValues = series.flatMap((line) => line.values);
  const minValue = metric === 'momentum' ? Math.min(...flatValues, 0) : 0;
  const rawMaxValue = Math.max(...flatValues, 0);
  const maxValue = rawMaxValue === minValue ? minValue + 1 : rawMaxValue;

  const getX = (index: number): number =>
    padding.left + (index / Math.max(pointCount - 1, 1)) * chartWidth;
  const getY = (value: number): number =>
    padding.top + ((maxValue - value) / (maxValue - minValue)) * chartHeight;

  const baselineY =
    minValue <= 0 && maxValue >= 0 ? getY(0) : padding.top + chartHeight;
  const metricLabel = getComparisonMetricLabel(metric);
  const yTicks = Array.from(
    { length: yTickCount },
    (_, index) =>
      maxValue - (index / Math.max(yTickCount - 1, 1)) * (maxValue - minValue),
  );

  return (
    <div className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2 tablet:items-center">
        <div>
          <h3 className="font-bold text-text-primary typo-callout">
            Last 7 days, ranked by {metricLabel}
          </h3>
        </div>
        <div className="w-full tablet:w-auto">
          {metricControl ?? (
            <span className="text-text-disabled typo-caption2">
              {metricLabel}
            </span>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden">
        {hoveredIndex !== null && tooltipPosition && (
          <div
            className="bg-background-default/95 pointer-events-none absolute z-1 min-w-[11rem] rounded-8 border border-border-subtlest-tertiary p-2 backdrop-blur-[0.125rem]"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
          >
            <div className="mb-1 text-text-disabled typo-caption2">
              {getXAxisTickLabel(hoveredIndex, pointCount, !isTablet)}
            </div>
            <div className="flex flex-col gap-1">
              {series.map((line, index) => {
                const color = LINE_COLORS[index % LINE_COLORS.length];
                const value = line.values[hoveredIndex] ?? 0;
                return (
                  <div
                    key={`tooltip-${line.entity.entity}`}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-text-tertiary typo-caption2">
                      {line.entity.name}
                    </span>
                    <span className="font-bold text-text-primary typo-caption2">
                      {formatComparisonMetricValue(metric, value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
        >
          <text
            x={width / 2}
            y={height - 10}
            textAnchor="middle"
            fill="var(--theme-text-disabled)"
            className={isTablet ? 'typo-caption1' : 'typo-callout'}
          >
            Time
          </text>
          <text
            x={yAxisLabelX}
            y={padding.top + chartHeight / 2}
            textAnchor="middle"
            fill="var(--theme-text-disabled)"
            transform={`rotate(-90 ${yAxisLabelX} ${
              padding.top + chartHeight / 2
            })`}
            className={isTablet ? 'typo-caption1' : 'typo-callout'}
          >
            {metricLabel}
          </text>

          {Array.from({ length: yTickCount }, (_, index) => {
            const y =
              padding.top + (index / Math.max(yTickCount - 1, 1)) * chartHeight;
            return (
              <g
                // eslint-disable-next-line react/no-array-index-key
                key={`grid-${index}`}
              >
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + chartWidth}
                  y2={y}
                  stroke="var(--theme-border-subtlest-tertiary)"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--theme-text-disabled)"
                  className={isTablet ? 'typo-caption1' : 'typo-callout'}
                >
                  {formatComparisonMetricValue(metric, yTicks[index])}
                </text>
              </g>
            );
          })}

          {Array.from({ length: pointCount }, (_, index) => {
            const isLast = index === pointCount - 1;
            if (!isLast && index % xTickStep !== 0) {
              return null;
            }

            return (
              <text
                key={`x-tick-${index}`}
                x={getX(index)}
                y={padding.top + chartHeight + 18}
                textAnchor="middle"
                fill="var(--theme-text-disabled)"
                className={isTablet ? 'typo-caption1' : 'typo-callout'}
              >
                {getXAxisTickLabel(index, pointCount, !isTablet)}
              </text>
            );
          })}

          {metric === 'momentum' && (
            <line
              x1={padding.left}
              y1={baselineY}
              x2={padding.left + chartWidth}
              y2={baselineY}
              stroke="var(--theme-text-quaternary)"
              strokeWidth={1}
            />
          )}

          {series.map((line, index) => {
            const color = LINE_COLORS[index % LINE_COLORS.length];
            const path = getLinePath(line.values, getX, getY);
            const lastIndex = line.values.length - 1;
            const lastPointValue = line.values[lastIndex] ?? 0;

            return (
              <g key={line.entity.entity}>
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={getX(lastIndex)}
                  cy={getY(lastPointValue)}
                  r={4}
                  fill={color}
                />
              </g>
            );
          })}

          {hoveredIndex !== null && (
            <>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={padding.top + chartHeight}
                stroke="var(--theme-text-quaternary)"
                strokeDasharray="2 2"
              />
              {series.map((line, index) => {
                const color = LINE_COLORS[index % LINE_COLORS.length];
                const value = line.values[hoveredIndex] ?? 0;
                return (
                  <circle
                    key={`hover-point-${line.entity.entity}`}
                    cx={getX(hoveredIndex)}
                    cy={getY(value)}
                    r={4}
                    fill={color}
                  />
                );
              })}
            </>
          )}

          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
            fill="transparent"
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              const relativeX =
                (event.clientX - bounds.left) / Math.max(bounds.width, 1);
              const index = Math.round(relativeX * (pointCount - 1));
              const boundedIndex = Math.max(0, Math.min(pointCount - 1, index));
              const svgBounds =
                event.currentTarget.ownerSVGElement?.getBoundingClientRect();

              if (!svgBounds) {
                return;
              }

              const clampedPosition = getTooltipPosition({
                cursorX: event.clientX - svgBounds.left,
                cursorY: event.clientY - svgBounds.top,
                chartWidth: svgBounds.width,
                chartHeight: svgBounds.height,
              });

              setHoveredIndex(boundedIndex);
              setTooltipPosition(clampedPosition);
            }}
            onMouseLeave={() => {
              setHoveredIndex(null);
              setTooltipPosition(null);
            }}
          />
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 tablet:grid-cols-2">
        {series.map((line, index) => {
          const color = LINE_COLORS[index % LINE_COLORS.length];
          return (
            <div
              key={line.entity.entity}
              className="flex items-center gap-2 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1.5"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <img
                src={line.entity.logo}
                alt={line.entity.name}
                className="h-5 w-5 shrink-0 rounded-6 bg-surface-float object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-text-primary typo-caption1">
                {line.entity.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
