import type { ReactElement, ReactNode } from 'react';
import React, { useMemo, useState } from 'react';
import { addDays, differenceInDays, endOfWeek, subDays } from 'date-fns';
import classNames from 'classnames';
import { Tooltip } from '../tooltip/Tooltip';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { GitHubIcon, GitLabIcon } from '../icons';
import { IconSize } from '../Icon';
import type { ActivitySource, DayActivityDetailed } from './types';
import { SOURCE_CONFIGS } from './types';

const DAYS_IN_WEEK = 7;
const SQUARE_SIZE = 10;
const GUTTER_SIZE = 3;
const SQUARE_SIZE_WITH_GUTTER = SQUARE_SIZE + GUTTER_SIZE;
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Intensity levels for the heatmap
const INTENSITY_COLORS = [
  'var(--theme-float)', // 0 - no activity
  'var(--theme-overlay-quaternary-cabbage)', // 1 - low
  'var(--theme-accent-cabbage-subtler)', // 2 - medium-low
  'var(--theme-accent-cabbage-default)', // 3 - medium
  'var(--theme-accent-onion-default)', // 4 - high
];

// Multi-source gradient colors for pie segments
const getSourceColor = (source: ActivitySource): string => {
  return SOURCE_CONFIGS[source]?.color || '#666';
};

interface SourceIconProps {
  source: ActivitySource;
  size?: IconSize;
  className?: string;
}

function SourceIcon({
  source,
  size = IconSize.XSmall,
  className,
}: SourceIconProps): ReactElement | null {
  switch (source) {
    case 'github':
      return <GitHubIcon size={size} className={className} />;
    case 'gitlab':
      return <GitLabIcon size={size} className={className} />;
    default:
      return (
        <div
          className={classNames('rounded-full', className)}
          style={{
            width: size === IconSize.XSmall ? 12 : 16,
            height: size === IconSize.XSmall ? 12 : 16,
            backgroundColor: getSourceColor(source),
          }}
        />
      );
  }
}

interface DayTooltipProps {
  activity: DayActivityDetailed | undefined;
  date: Date;
}

function DayTooltip({ activity, date }: DayTooltipProps): ReactElement {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (!activity || activity.total === 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-bold text-text-primary">{dateStr}</span>
        <span className="text-text-tertiary">No activity</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-bold text-text-primary">{dateStr}</span>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-text-primary">
          {activity.total}
        </span>
        <span className="text-text-secondary">contributions</span>
      </div>
      <div className="flex flex-col gap-1 border-t border-border-subtlest-tertiary pt-2">
        {Object.entries(activity.sources).map(([source, count]) => (
          <div key={source} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SourceIcon source={source as ActivitySource} />
              <span className="text-text-secondary">
                {SOURCE_CONFIGS[source as ActivitySource]?.label}
              </span>
            </div>
            <span className="font-medium text-text-primary">{count}</span>
          </div>
        ))}
      </div>
      {activity.breakdown && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-border-subtlest-tertiary pt-2 text-text-tertiary typo-caption2">
          {activity.breakdown.commits > 0 && (
            <span>{activity.breakdown.commits} commits</span>
          )}
          {activity.breakdown.pullRequests > 0 && (
            <span>{activity.breakdown.pullRequests} PRs</span>
          )}
          {activity.breakdown.reads > 0 && (
            <span>{activity.breakdown.reads} reads</span>
          )}
          {activity.breakdown.answers > 0 && (
            <span>{activity.breakdown.answers} answers</span>
          )}
        </div>
      )}
    </div>
  );
}

interface MultiSourceHeatmapProps {
  activities: DayActivityDetailed[];
  startDate?: Date;
  endDate?: Date;
  enabledSources?: ActivitySource[];
  showLegend?: boolean;
  showStats?: boolean;
}

export function MultiSourceHeatmap({
  activities,
  startDate: propStartDate,
  endDate: propEndDate,
  enabledSources,
  showLegend = true,
  showStats = true,
}: MultiSourceHeatmapProps): ReactElement {
  const endDate = propEndDate || new Date();
  const startDate = propStartDate || subDays(endDate, 365);

  const [hoveredSource, setHoveredSource] = useState<ActivitySource | null>(
    null,
  );

  // Build activity map by date
  const activityMap = useMemo(() => {
    const map: Record<string, DayActivityDetailed> = {};
    activities.forEach((activity) => {
      map[activity.date] = activity;
    });
    return map;
  }, [activities]);

  // Calculate totals and stats
  const stats = useMemo(() => {
    const sourceTotals: Partial<Record<ActivitySource, number>> = {};
    let totalContributions = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort activities by date for streak calculation
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    sortedActivities.forEach((activity) => {
      if (activity.total > 0) {
        totalContributions += activity.total;
        activeDays += 1;
        tempStreak += 1;
        longestStreak = Math.max(longestStreak, tempStreak);

        Object.entries(activity.sources).forEach(([source, count]) => {
          sourceTotals[source as ActivitySource] =
            (sourceTotals[source as ActivitySource] || 0) + count;
        });
      } else {
        tempStreak = 0;
      }
    });

    // Calculate current streak (from most recent day)
    for (let i = sortedActivities.length - 1; i >= 0; i -= 1) {
      if (sortedActivities[i].total > 0) {
        currentStreak += 1;
      } else {
        break;
      }
    }

    return {
      totalContributions,
      activeDays,
      currentStreak,
      longestStreak,
      sourceTotals,
    };
  }, [activities]);

  // Get active sources
  const activeSources = useMemo(() => {
    const sources = Object.keys(stats.sourceTotals) as ActivitySource[];
    if (enabledSources) {
      return sources.filter((s) => enabledSources.includes(s));
    }
    return sources;
  }, [stats.sourceTotals, enabledSources]);

  // Calculate week data
  const numEmptyDaysAtEnd = DAYS_IN_WEEK - 1 - endDate.getDay();
  const numEmptyDaysAtStart = startDate.getDay();
  const startDateWithEmptyDays = addDays(startDate, -numEmptyDaysAtStart);
  const dateDifferenceInDays = differenceInDays(endDate, startDate);
  const numDaysRoundedToWeek =
    dateDifferenceInDays + numEmptyDaysAtStart + numEmptyDaysAtEnd;
  const weekCount = Math.ceil(numDaysRoundedToWeek / DAYS_IN_WEEK);

  // Get intensity level (0-4) based on activity
  const getIntensityLevel = (total: number): number => {
    if (total === 0) {
      return 0;
    }
    if (total <= 3) {
      return 1;
    }
    if (total <= 8) {
      return 2;
    }
    if (total <= 15) {
      return 3;
    }
    return 4;
  };

  // Render a single day square
  const renderDay = (weekIndex: number, dayIndex: number): ReactNode => {
    const index = weekIndex * DAYS_IN_WEEK + dayIndex;
    const isOutOfRange =
      index < numEmptyDaysAtStart ||
      index >= numEmptyDaysAtStart + dateDifferenceInDays + 1;

    if (isOutOfRange) {
      return null;
    }

    const date = addDays(startDateWithEmptyDays, index);
    const dateStr = date.toISOString().split('T')[0];
    const activity = activityMap[dateStr];
    const total = activity?.total || 0;
    const intensity = getIntensityLevel(total);

    // Check if any source is hovered and this day has that source
    const isHighlighted =
      !hoveredSource ||
      (activity?.sources && hoveredSource in activity.sources);
    const opacity = hoveredSource && !isHighlighted ? 0.2 : 1;

    // For multi-source days, create a gradient or show dominant source
    const sources = activity?.sources
      ? (Object.keys(activity.sources) as ActivitySource[])
      : [];
    const hasMultipleSources = sources.length > 1;

    return (
      <Tooltip
        key={`${weekIndex}-${dayIndex}`}
        content={<DayTooltip activity={activity} date={date} />}
        delayDuration={100}
      >
        <g
          transform={`translate(0, ${dayIndex * SQUARE_SIZE_WITH_GUTTER})`}
          style={{ opacity, transition: 'opacity 0.2s' }}
        >
          {/* Base square */}
          <rect
            width={SQUARE_SIZE}
            height={SQUARE_SIZE}
            rx={2}
            fill={INTENSITY_COLORS[intensity]}
            className="transition-all duration-200 hover:brightness-110"
          />
          {/* Multi-source indicator - small colored dots */}
          {hasMultipleSources && total > 0 && (
            <g>
              {sources.slice(0, 3).map((source, i) => (
                <circle
                  key={source}
                  cx={3 + i * 2.5}
                  cy={SQUARE_SIZE - 2}
                  r={1}
                  fill={getSourceColor(source)}
                />
              ))}
            </g>
          )}
          {/* Single source color accent */}
          {sources.length === 1 && total > 0 && (
            <rect
              width={SQUARE_SIZE}
              height={2}
              y={SQUARE_SIZE - 2}
              rx={1}
              fill={getSourceColor(sources[0])}
              opacity={0.8}
            />
          )}
        </g>
      </Tooltip>
    );
  };

  // Render a week column
  const renderWeek = (weekIndex: number): ReactNode => {
    return (
      <g
        key={weekIndex}
        transform={`translate(${weekIndex * SQUARE_SIZE_WITH_GUTTER}, 0)`}
      >
        {Array.from({ length: DAYS_IN_WEEK }, (_, dayIndex) =>
          renderDay(weekIndex, dayIndex),
        )}
      </g>
    );
  };

  // Render month labels
  const renderMonthLabels = (): ReactNode => {
    const labels: ReactNode[] = [];

    for (let weekIndex = 0; weekIndex < weekCount; weekIndex += 1) {
      const date = endOfWeek(
        addDays(startDateWithEmptyDays, weekIndex * DAYS_IN_WEEK),
      );
      if (date.getDate() >= 7 && date.getDate() <= 14) {
        labels.push(
          <text
            key={weekIndex}
            x={weekIndex * SQUARE_SIZE_WITH_GUTTER}
            y={10}
            className="fill-text-tertiary typo-caption2"
          >
            {MONTH_LABELS[date.getMonth()]}
          </text>,
        );
      }
    }

    return labels;
  };

  const svgWidth = weekCount * SQUARE_SIZE_WITH_GUTTER;
  const svgHeight = DAYS_IN_WEEK * SQUARE_SIZE_WITH_GUTTER + 20;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      {showStats && (
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <Typography type={TypographyType.Title2} bold>
              {stats.totalContributions.toLocaleString()}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              contributions
            </Typography>
          </div>
          <div className="flex flex-col">
            <Typography type={TypographyType.Title2} bold>
              {stats.activeDays}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              active days
            </Typography>
          </div>
          <div className="flex flex-col">
            <Typography type={TypographyType.Title2} bold>
              {stats.currentStreak}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              day streak
            </Typography>
          </div>
          <div className="flex flex-col">
            <Typography type={TypographyType.Title2} bold>
              {stats.longestStreak}
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              longest streak
            </Typography>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="w-full overflow-x-auto">
        <svg
          className="h-auto w-full min-w-[300px]"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMinYMin meet"
        >
          {/* Month labels */}
          <g>{renderMonthLabels()}</g>
          {/* Weeks grid */}
          <g transform="translate(0, 20)">
            {Array.from({ length: weekCount }, (_, weekIndex) =>
              renderWeek(weekIndex),
            )}
          </g>
        </svg>
      </div>

      {/* Legend and source filters */}
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Intensity legend */}
          <div className="flex items-center gap-2">
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Less
            </Typography>
            {INTENSITY_COLORS.map((color) => (
              <div
                key={color}
                className="rounded-sm h-2.5 w-2.5"
                style={{ backgroundColor: color }}
              />
            ))}
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              More
            </Typography>
          </div>

          {/* Source breakdown */}
          <div className="flex flex-wrap items-center gap-3">
            {activeSources.map((source) => (
              <button
                key={source}
                type="button"
                className={classNames(
                  'flex items-center gap-1.5 rounded-8 px-2 py-1 transition-all',
                  hoveredSource === source
                    ? 'bg-surface-active'
                    : 'hover:bg-surface-hover',
                )}
                onMouseEnter={() => setHoveredSource(source)}
                onMouseLeave={() => setHoveredSource(null)}
              >
                <SourceIcon source={source} />
                <Typography
                  type={TypographyType.Caption1}
                  color={
                    hoveredSource === source
                      ? TypographyColor.Primary
                      : TypographyColor.Tertiary
                  }
                >
                  {SOURCE_CONFIGS[source].label}
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {stats.sourceTotals[source]?.toLocaleString()}
                </Typography>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
