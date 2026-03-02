import type { ReactElement } from 'react';
import React from 'react';
import type { ArenaComparisonMetric, ArenaComparisonSeries } from './types';
import { formatComparisonMetricValue } from './arenaMetrics';
import { getXAxisTickLabel } from './arenaComparisonChartUtils';
import { ARENA_COMPARISON_LINE_COLORS } from './arenaComparisonChartConstants';

interface ArenaComparisonChartTooltipProps {
  hoveredIndex: number | null;
  pointCount: number;
  compactXAxis: boolean;
  metric: ArenaComparisonMetric;
  series: ArenaComparisonSeries[];
  tooltipPosition: { x: number; y: number } | null;
}

export const ArenaComparisonChartTooltip = ({
  hoveredIndex,
  pointCount,
  compactXAxis,
  metric,
  series,
  tooltipPosition,
}: ArenaComparisonChartTooltipProps): ReactElement | null => {
  if (hoveredIndex === null || !tooltipPosition) {
    return null;
  }

  return (
    <div
      className="bg-background-default/95 pointer-events-none absolute z-1 min-w-[11rem] rounded-8 border border-border-subtlest-tertiary p-2 backdrop-blur-[0.125rem]"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
      }}
    >
      <div className="mb-1 text-text-disabled typo-caption2">
        {getXAxisTickLabel(hoveredIndex, pointCount, compactXAxis)}
      </div>
      <div className="flex flex-col gap-1">
        {series.map((line, index) => {
          const color =
            ARENA_COMPARISON_LINE_COLORS[
              index % ARENA_COMPARISON_LINE_COLORS.length
            ];
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
  );
};
