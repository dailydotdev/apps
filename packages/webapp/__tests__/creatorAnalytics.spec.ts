import {
  CreatorMetricSemantics,
  CreatorPerformancePeriod,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import type {
  CreatorMetric,
  CreatorPerformanceCoverage,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import {
  buildImpressionsChartData,
  getCoverageNote,
  getMetricDelta,
  metricScopeLabel,
} from '../components/analytics/creator/common';

const metric = (partial: Partial<CreatorMetric> = {}): CreatorMetric => ({
  value: 100,
  previous: 50,
  semantics: CreatorMetricSemantics.Period,
  ...partial,
});

const coverage = (
  partial: Partial<CreatorPerformanceCoverage> = {},
): CreatorPerformanceCoverage => ({
  requestedStartDate: '2026-08-23',
  endDate: '2026-09-21',
  coveredStartDate: '2026-08-23',
  firstAvailableDate: '2026-08-23',
  lastAvailableDate: '2026-09-21',
  requestedDays: 30,
  coveredDays: 30,
  isComplete: true,
  isPreviousPeriodComplete: true,
  ...partial,
});

describe('getMetricDelta', () => {
  it('should report a signed percentage change', () => {
    expect(getMetricDelta(metric({ value: 150, previous: 100 }))).toEqual({
      kind: 'change',
      percentage: 50,
    });
    expect(getMetricDelta(metric({ value: 50, previous: 100 }))).toEqual({
      kind: 'change',
      percentage: -50,
    });
  });

  it('should not compare when the prior window is withheld', () => {
    // The server nulls `previous` when history does not cover the prior
    // window; drawing any comparison from that would be invented.
    expect(getMetricDelta(metric({ previous: null }))).toEqual({
      kind: 'none',
    });
  });

  it('should not compare an unknown value', () => {
    expect(getMetricDelta(metric({ value: null }))).toEqual({ kind: 'none' });
  });

  it('should say New instead of a percentage off a zero baseline', () => {
    expect(getMetricDelta(metric({ value: 10, previous: 0 }))).toEqual({
      kind: 'new',
    });
  });

  it('should say nothing when both windows are zero', () => {
    expect(getMetricDelta(metric({ value: 0, previous: 0 }))).toEqual({
      kind: 'none',
    });
  });
});

describe('metricScopeLabel', () => {
  it('should caption a lifetime metric as all time even under a period', () => {
    expect(
      metricScopeLabel(
        metric({ semantics: CreatorMetricSemantics.Lifetime }),
        CreatorPerformancePeriod.Last30Days,
      ),
    ).toEqual('All time');
  });

  it('should caption a period metric with the selected window', () => {
    expect(
      metricScopeLabel(metric(), CreatorPerformancePeriod.Last90Days),
    ).toEqual('Last 90 days');
  });
});

describe('buildImpressionsChartData', () => {
  it('should pad a measured day that has no row with a zero', () => {
    const data = buildImpressionsChartData({
      coverage: coverage({
        coveredStartDate: '2026-09-19',
        endDate: '2026-09-21',
      }),
      impressionsSeries: [
        { date: '2026-09-19', impressions: 10, impressionsAds: 0 },
        { date: '2026-09-21', impressions: 5, impressionsAds: 2 },
      ],
    });

    expect(data.map(({ value }) => value)).toEqual([10, 0, 7]);
  });

  it('should start the axis at coverage, not at the requested window', () => {
    // The unmeasured days before `coveredStartDate` are left off entirely
    // rather than drawn as zeros that look like a collapse in reach.
    const data = buildImpressionsChartData({
      coverage: coverage({
        requestedStartDate: '2026-09-01',
        coveredStartDate: '2026-09-20',
        endDate: '2026-09-21',
        isComplete: false,
        coveredDays: 2,
      }),
      impressionsSeries: [
        { date: '2026-09-20', impressions: 1, impressionsAds: 0 },
      ],
    });

    expect(data).toHaveLength(2);
    expect(data[0].name).toEqual('Sep 20');
  });

  it('should mark a day as boosted only when it carries ad impressions', () => {
    const data = buildImpressionsChartData({
      coverage: coverage({
        coveredStartDate: '2026-09-20',
        endDate: '2026-09-21',
      }),
      impressionsSeries: [
        { date: '2026-09-20', impressions: 10, impressionsAds: 0 },
        { date: '2026-09-21', impressions: 10, impressionsAds: 3 },
      ],
    });

    expect(data.map(({ isBoosted }) => isBoosted)).toEqual([false, true]);
  });

  it('should render nothing when no day of the window was measured', () => {
    expect(
      buildImpressionsChartData({
        coverage: coverage({ coveredStartDate: null, isComplete: false }),
        impressionsSeries: [],
      }),
    ).toEqual([]);
  });

  it('should label days in UTC regardless of the viewer timezone', () => {
    // A UTC-dated row must not shift a day for a viewer behind UTC.
    const data = buildImpressionsChartData({
      coverage: coverage({
        coveredStartDate: '2026-09-21',
        endDate: '2026-09-21',
      }),
      impressionsSeries: [
        { date: '2026-09-21', impressions: 1, impressionsAds: 0 },
      ],
    });

    expect(data[0].name).toEqual('Sep 21');
  });
});

describe('getCoverageNote', () => {
  it('should say nothing when the window is fully covered', () => {
    expect(getCoverageNote(coverage())).toBeNull();
  });

  it('should explain a window history only partly reaches', () => {
    expect(
      getCoverageNote(
        coverage({
          isComplete: false,
          coveredStartDate: '2026-09-01',
          coveredDays: 21,
          requestedDays: 30,
        }),
      ),
    ).toEqual(
      'Daily impressions history starts Sep 1, 2026, so impressions cover 21 of the 30 days.',
    );
  });

  it('should explain a window history does not reach at all', () => {
    expect(
      getCoverageNote(
        coverage({ isComplete: false, coveredStartDate: null, coveredDays: 0 }),
      ),
    ).toContain('does not reach this period yet');
  });
});
