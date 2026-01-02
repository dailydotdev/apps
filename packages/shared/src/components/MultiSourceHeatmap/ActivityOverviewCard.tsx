import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { subDays } from 'date-fns';
import {
  Typography,
  TypographyType,
  TypographyColor,
  TypographyTag,
} from '../typography/Typography';
import { ArrowIcon, CalendarIcon } from '../icons';
import { IconSize } from '../Icon';
import { MultiSourceHeatmap } from './MultiSourceHeatmap';
import type { DayActivityDetailed, ActivitySource } from './types';
import { SOURCE_CONFIGS, generateMockMultiSourceActivity } from './types';

type TimeRange = '3m' | '6m' | '1y';

interface ActivityOverviewCardProps {
  activities?: DayActivityDetailed[];
  initialTimeRange?: TimeRange;
  initiallyOpen?: boolean;
}

export function ActivityOverviewCard({
  activities: propActivities,
  initialTimeRange = '1y',
  initiallyOpen = false,
}: ActivityOverviewCardProps): ReactElement {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);

  // Memoize dates to prevent unnecessary recalculations
  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    let start: Date;
    switch (timeRange) {
      case '3m':
        start = subDays(end, 90);
        break;
      case '6m':
        start = subDays(end, 180);
        break;
      case '1y':
      default:
        start = subDays(end, 365);
    }
    return { startDate: start, endDate: end };
  }, [timeRange]);

  // Use provided activities or generate mock
  const activities = useMemo(() => {
    if (propActivities) {
      return propActivities.filter((a) => {
        const date = new Date(a.date);
        return date >= startDate && date <= endDate;
      });
    }
    return generateMockMultiSourceActivity(startDate, endDate);
  }, [propActivities, startDate, endDate]);

  // Calculate quick stats for header
  const quickStats = useMemo(() => {
    const total = activities.reduce((sum, a) => sum + a.total, 0);
    const activeDays = activities.filter((a) => a.total > 0).length;

    // Get top sources
    const sourceTotals: Partial<Record<ActivitySource, number>> = {};
    activities.forEach((a) => {
      Object.entries(a.sources).forEach(([source, count]) => {
        sourceTotals[source as ActivitySource] =
          (sourceTotals[source as ActivitySource] || 0) + count;
      });
    });

    const topSources = Object.entries(sourceTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([source]) => source as ActivitySource);

    return { total, activeDays, topSources };
  }, [activities]);

  return (
    <section className="mt-3 flex flex-col rounded-16 border border-border-subtlest-tertiary">
      {/* Header */}
      <button
        type="button"
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-surface-hover"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon size={IconSize.Small} className="text-text-tertiary" />
          <Typography
            tag={TypographyTag.H3}
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
            bold
          >
            Activity Overview
          </Typography>
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            {quickStats.total.toLocaleString()} contributions
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          {!isOpen && (
            <div className="hidden items-center gap-2 tablet:flex">
              {/* Source indicators */}
              <div className="flex items-center -space-x-1">
                {quickStats.topSources.map((source) => (
                  <div
                    key={source}
                    className="flex h-4 w-4 items-center justify-center rounded-full border border-background-default"
                    style={{ backgroundColor: SOURCE_CONFIGS[source].color }}
                    title={SOURCE_CONFIGS[source].label}
                  />
                ))}
              </div>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {quickStats.activeDays} active days
              </Typography>
            </div>
          )}
          <ArrowIcon
            size={IconSize.XSmall}
            className={classNames(
              'text-text-tertiary transition-transform duration-200',
              { 'rotate-180': !isOpen },
            )}
          />
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={classNames(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="flex flex-col gap-4 border-t border-border-subtlest-tertiary p-4">
          {/* Time range selector */}
          <div className="flex items-center gap-2">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              Period
            </Typography>
            <div className="flex gap-1 rounded-10 border border-border-subtlest-tertiary p-1">
              {(['3m', '6m', '1y'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  type="button"
                  className={classNames(
                    'rounded-8 px-3 py-1 transition-all typo-caption1',
                    timeRange === range
                      ? 'bg-surface-active font-bold text-text-primary'
                      : 'text-text-tertiary hover:text-text-secondary',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeRange(range);
                  }}
                >
                  {range === '3m' && '3M'}
                  {range === '6m' && '6M'}
                  {range === '1y' && '1Y'}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <MultiSourceHeatmap
            activities={activities}
            startDate={startDate}
            endDate={endDate}
            showStats
            showLegend
          />
        </div>
      </div>
    </section>
  );
}
