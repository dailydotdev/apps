import type { ReactElement } from 'react';
import React from 'react';
import type { ArenaComparisonSeries } from './types';
import { ARENA_COMPARISON_LINE_COLORS } from './arenaComparisonChartConstants';
import Link from '../../../components/utilities/Link';
import { getAgentEntityPath } from './links';

interface ArenaComparisonChartLegendProps {
  series: ArenaComparisonSeries[];
  tab?: 'coding-agents' | 'llms';
}

export const ArenaComparisonChartLegend = ({
  series,
  tab,
}: ArenaComparisonChartLegendProps): ReactElement => (
  <div className="mt-4 grid grid-cols-1 gap-2 tablet:grid-cols-2">
    {series.map((line, index) => {
      const color =
        ARENA_COMPARISON_LINE_COLORS[
          index % ARENA_COMPARISON_LINE_COLORS.length
        ];
      return (
        <Link
          key={line.entity.entity}
          href={
            tab
              ? getAgentEntityPath(line.entity.entity, tab)
              : getAgentEntityPath(line.entity.entity)
          }
        >
          <a className="flex items-center gap-2 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2 py-1.5 hover:bg-surface-hover">
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
          </a>
        </Link>
      );
    })}
  </div>
);
