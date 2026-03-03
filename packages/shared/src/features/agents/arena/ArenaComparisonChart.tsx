import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import type { ArenaComparisonMetric, ArenaComparisonSeries } from './types';
import { getComparisonMetricLabel } from './arenaMetrics';
import { ArenaComparisonChartTooltip } from './ArenaComparisonChartTooltip';
import { ArenaComparisonChartCanvas } from './ArenaComparisonChartCanvas';
import { ArenaComparisonChartLegend } from './ArenaComparisonChartLegend';

interface ArenaComparisonChartProps {
  series: ArenaComparisonSeries[];
  metric: ArenaComparisonMetric;
  loading?: boolean;
  metricControl?: ReactElement;
  title?: string;
  tab?: 'coding-agents' | 'llms';
  tall?: boolean;
  fixedTabletLayout?: boolean;
}

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
  title,
  tab,
  tall,
  fixedTabletLayout,
}: ArenaComparisonChartProps): ReactElement => {
  const responsiveIsTablet = useViewSizeClient(ViewSize.Tablet);
  const isTablet = fixedTabletLayout ? true : responsiveIsTablet;
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

  const pointCount = Math.max(...series.map((line) => line.values.length), 1);
  const metricLabel = getComparisonMetricLabel(metric);

  return (
    <div className="rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2 tablet:items-center">
        <div>
          <h3 className="font-bold text-text-primary typo-callout">
            {title ?? `Last 7 days, ranked by ${metricLabel}`}
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
        <ArenaComparisonChartTooltip
          hoveredIndex={hoveredIndex}
          pointCount={pointCount}
          compactXAxis={!isTablet}
          metric={metric}
          series={series}
          tooltipPosition={tooltipPosition}
        />
        <ArenaComparisonChartCanvas
          series={series}
          metric={metric}
          isTablet={isTablet}
          tall={tall}
          hoveredIndex={hoveredIndex}
          onHover={({ index, position }) => {
            setHoveredIndex(index);
            setTooltipPosition(position);
          }}
          onLeave={() => {
            setHoveredIndex(null);
            setTooltipPosition(null);
          }}
        />
      </div>

      {series.length > 1 && (
        <ArenaComparisonChartLegend series={series} tab={tab} />
      )}
    </div>
  );
};
