import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import type {
  CreatorPerformance,
  CreatorPerformancePeriod,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { buildImpressionsChartData, periodLabel } from './common';

const CombinedImpressionsChart = dynamic(
  () =>
    import(
      '@dailydotdev/shared/src/components/analytics/CombinedImpressionsChart'
    ).then((mod) => mod.CombinedImpressionsChart),
  {
    loading: () => <ElementPlaceholder className="h-40 w-full rounded-12" />,
  },
);

const EmptyChart = ({ children }: { children: string }): ReactElement => (
  <div className="flex h-40 items-center justify-center rounded-12 border border-border-subtlest-tertiary px-4 text-center">
    <Typography type={TypographyType.Callout} color={TypographyColor.Tertiary}>
      {children}
    </Typography>
  </div>
);

export const CreatorImpressionsSkeleton = (): ReactElement => (
  <ElementPlaceholder className="h-40 w-full rounded-12" />
);

interface CreatorImpressionsSectionProps {
  performance: CreatorPerformance;
  period: CreatorPerformancePeriod;
}

/**
 * Daily impressions for the selected window.
 *
 * The axis stops where measurement stops rather than running the full window
 * and flattening the unmeasured part to zero, so a creator whose history does
 * not reach back 90 days sees a shorter chart and a sentence saying why —
 * never a cliff that looks like their reach collapsed.
 */
export const CreatorImpressionsSection = ({
  performance,
  period,
}: CreatorImpressionsSectionProps): ReactElement => {
  const data = useMemo(
    () => buildImpressionsChartData(performance),
    [performance],
  );
  const hasImpressions = data.some((point) => point.value > 0);
  const { coverage } = performance;
  const isTruncated = !coverage.isComplete && !!coverage.coveredStartDate;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Typography type={TypographyType.Footnote} bold>
          Daily impressions · {periodLabel[period].toLowerCase()}
        </Typography>
        {hasImpressions && (
          <div className="ml-auto flex gap-2">
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-brand-default" />
              <Typography type={TypographyType.Footnote}>Organic</Typography>
            </div>
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-accent-blueCheese-default" />
              <Typography type={TypographyType.Footnote}>Promoted</Typography>
            </div>
          </div>
        )}
      </div>
      {data.length === 0 && (
        <EmptyChart>
          Daily impressions have not been recorded for this period yet.
        </EmptyChart>
      )}
      {data.length > 0 && !hasImpressions && (
        <EmptyChart>
          No impressions in this period. Check back once your posts start
          getting views.
        </EmptyChart>
      )}
      {data.length > 0 && hasImpressions && (
        <CombinedImpressionsChart data={data} />
      )}
      {isTruncated && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          The chart starts where daily history does, covering{' '}
          {coverage.coveredDays} of the {coverage.requestedDays} days. Earlier
          days were not measured rather than being days without impressions.
        </Typography>
      )}
    </div>
  );
};
