import type {
  CreatorMetric,
  CreatorPerformance,
  CreatorPerformanceCoverage,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import {
  CreatorMetricSemantics,
  CreatorPerformancePeriod,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';

export const periodLabel: Record<CreatorPerformancePeriod, string> = {
  [CreatorPerformancePeriod.Last30Days]: 'Last 30 days',
  [CreatorPerformancePeriod.Last90Days]: 'Last 90 days',
};

export const periodOptions = [
  CreatorPerformancePeriod.Last30Days,
  CreatorPerformancePeriod.Last90Days,
];

/**
 * What a tile's number is scoped to.
 *
 * Driven by the metric's own `semantics` rather than by the selected period,
 * because outbound visits come back as a lifetime total and captioning it
 * "Last 30 days" would be a straightforward lie.
 */
export const metricScopeLabel = (
  metric: CreatorMetric,
  period: CreatorPerformancePeriod,
): string =>
  metric.semantics === CreatorMetricSemantics.Period
    ? periodLabel[period]
    : 'All time';

export type MetricDelta =
  /** Nothing honest to say: unknown value, or no comparable prior window. */
  | { kind: 'none' }
  /** Prior window was zero, so a percentage would divide by nothing. */
  | { kind: 'new' }
  | { kind: 'change'; percentage: number };

/**
 * A comparison is only drawn when every part of it is real.
 *
 * The server already withholds `previous` when the prior window is not fully
 * covered by retained history, so a null here is a deliberate "do not compare"
 * rather than missing data to paper over.
 */
export const getMetricDelta = (metric: CreatorMetric): MetricDelta => {
  const { value, previous } = metric;

  if (value === null || previous === null) {
    return { kind: 'none' };
  }

  if (previous === 0) {
    // "+100%" from a base of zero reads as growth that never happened.
    return value > 0 ? { kind: 'new' } : { kind: 'none' };
  }

  return {
    kind: 'change',
    percentage: Math.round(((value - previous) / previous) * 100),
  };
};

const utcDate = (date: string): Date => new Date(`${date}T00:00:00.000Z`);

const millisecondsInDay = 24 * 60 * 60 * 1000;

/**
 * Coverage dates are UTC calendar days, so they are formatted in UTC.
 *
 * Passing them through the creator's local timezone would shift the label by a
 * day for anyone far enough from UTC, and the footer would then disagree with
 * the numbers above it.
 */
export const formatCoverageDate = (date: string): string =>
  utcDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

const formatAxisDate = (date: string): string =>
  utcDate(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

export type ImpressionsChartPoint = {
  name: string;
  value: number;
  isBoosted: boolean;
};

/**
 * The chart's axis, built from coverage rather than from the returned points.
 *
 * A measured day with no row saw zero impressions and is padded; a day before
 * `coveredStartDate` was never measured at all and is left off entirely. Both
 * would otherwise render as the same zero bar, which is the difference between
 * "nobody saw it" and "we were not counting yet".
 */
export const buildImpressionsChartData = (
  performance: Pick<CreatorPerformance, 'coverage' | 'impressionsSeries'>,
): ImpressionsChartPoint[] => {
  const { coverage, impressionsSeries } = performance;

  if (!coverage.coveredStartDate) {
    return [];
  }

  const byDate = new Map(
    impressionsSeries.map((point) => [point.date, point] as const),
  );
  const end = utcDate(coverage.endDate).getTime();
  const points: ImpressionsChartPoint[] = [];

  for (
    let cursor = utcDate(coverage.coveredStartDate).getTime();
    cursor <= end;
    // Plain millisecond arithmetic keeps this on UTC days; adding calendar
    // days would drift for a viewer whose local clock crosses a DST boundary.
    cursor += millisecondsInDay
  ) {
    const date = new Date(cursor).toISOString().slice(0, 10);
    const point = byDate.get(date);
    const impressionsAds = point?.impressionsAds ?? 0;

    points.push({
      name: formatAxisDate(date),
      value: (point?.impressions ?? 0) + impressionsAds,
      isBoosted: impressionsAds > 0,
    });
  }

  return points;
};

/**
 * The sentence under the overview explaining how much of the window the
 * numbers reach, or `null` when they reach all of it and there is nothing to
 * explain.
 */
export const getCoverageNote = (
  coverage: CreatorPerformanceCoverage,
): string | null => {
  if (coverage.isComplete) {
    return null;
  }

  if (!coverage.coveredStartDate) {
    return 'Daily impressions history does not reach this period yet, so impressions are not available for it.';
  }

  return `Daily impressions history starts ${formatCoverageDate(
    coverage.coveredStartDate,
  )}, so impressions cover ${coverage.coveredDays} of the ${
    coverage.requestedDays
  } days.`;
};

export const unknownValueLabel = '—';
