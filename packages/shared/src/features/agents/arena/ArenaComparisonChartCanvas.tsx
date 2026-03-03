import type { ReactElement } from 'react';
import React from 'react';
import {
  formatComparisonMetricValue,
  getComparisonMetricLabel,
} from './arenaMetrics';
import type { ArenaComparisonMetric, ArenaComparisonSeries } from './types';
import {
  getChartLayout,
  getLinePath,
  getTooltipPosition,
  getXAxisTickLabel,
} from './arenaComparisonChartUtils';
import { ARENA_COMPARISON_LINE_COLORS } from './arenaComparisonChartConstants';

interface ArenaComparisonChartCanvasProps {
  series: ArenaComparisonSeries[];
  metric: ArenaComparisonMetric;
  isTablet: boolean;
  tall?: boolean;
  hoveredIndex: number | null;
  onHover: (payload: {
    index: number;
    position: { x: number; y: number };
  }) => void;
  onLeave: () => void;
}

export const ArenaComparisonChartCanvas = ({
  series,
  metric,
  isTablet,
  tall,
  hoveredIndex,
  onHover,
  onLeave,
}: ArenaComparisonChartCanvasProps): ReactElement => {
  const { width, height, yAxisLabelX, yTickCount, xTickStep, padding } =
    getChartLayout(isTablet, tall);
  const pointCount = Math.max(...series.map((line) => line.values.length), 1);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const flatValues = series.flatMap((line) => line.values);
  const minValue = metric === 'momentum' ? Math.min(...flatValues, 0) : 0;
  const rawMaxValue = Math.max(...flatValues, 0);
  const maxValue = rawMaxValue === minValue ? minValue + 1 : rawMaxValue;
  const metricLabel = getComparisonMetricLabel(metric);

  const getX = (index: number): number =>
    padding.left + (index / Math.max(pointCount - 1, 1)) * chartWidth;
  const getY = (value: number): number =>
    padding.top + ((maxValue - value) / (maxValue - minValue)) * chartHeight;
  const yTicks = Array.from(
    { length: yTickCount },
    (_, index) =>
      maxValue - (index / Math.max(yTickCount - 1, 1)) * (maxValue - minValue),
  );
  const baselineY =
    minValue <= 0 && maxValue >= 0 ? getY(0) : padding.top + chartHeight;

  return (
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
        const color =
          ARENA_COMPARISON_LINE_COLORS[
            index % ARENA_COMPARISON_LINE_COLORS.length
          ];
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
            const color =
              ARENA_COMPARISON_LINE_COLORS[
                index % ARENA_COMPARISON_LINE_COLORS.length
              ];
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

          const position = getTooltipPosition({
            cursorX: event.clientX - svgBounds.left,
            cursorY: event.clientY - svgBounds.top,
            chartWidth: svgBounds.width,
            chartHeight: svgBounds.height,
          });

          onHover({ index: boundedIndex, position });
        }}
        onMouseLeave={onLeave}
      />
    </svg>
  );
};
