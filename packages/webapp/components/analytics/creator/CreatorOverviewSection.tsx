import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  DiscussIcon,
  EyeIcon,
  LinkIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import type {
  CreatorPerformance,
  CreatorPerformancePeriod,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { CreatorMetricTile } from './CreatorMetricTile';
import { formatCoverageDate, getCoverageNote, periodLabel } from './common';

const iconClassName = 'text-text-tertiary';

const gridClassName = 'grid grid-cols-2 gap-4 tablet:grid-cols-4';

export const CreatorOverviewSkeleton = (): ReactElement => (
  <div className={gridClassName}>
    {Array.from({ length: 4 }, (_, index) => (
      <ElementPlaceholder
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className="h-[6.75rem] rounded-14"
      />
    ))}
  </div>
);

interface CreatorOverviewSectionProps {
  performance: CreatorPerformance;
  period: CreatorPerformancePeriod;
}

/**
 * The four headline numbers, each captioned with what it actually measures.
 *
 * Outbound visits sit alongside the other three but carry an "All time"
 * caption of their own, because no daily breakdown exists to scope clicks to
 * the selected window.
 */
export const CreatorOverviewSection = ({
  performance,
  period,
}: CreatorOverviewSectionProps): ReactElement => {
  const { coverage, updatedAt } = performance;
  const coverageNote = getCoverageNote(coverage);

  return (
    <div className="flex flex-col gap-3">
      <div className={gridClassName}>
        <CreatorMetricTile
          label="Impressions"
          info="How many times your posts appeared in front of a developer, including while boosted."
          icon={<EyeIcon size={IconSize.Small} className={iconClassName} />}
          metric={performance.impressions}
          period={period}
          unknownReason="Daily impressions history does not reach this period, so this cannot be measured."
        />
        <CreatorMetricTile
          label="Upvotes"
          info="Upvotes cast on your posts during this period that still stand."
          icon={<UpvoteIcon size={IconSize.Small} className={iconClassName} />}
          metric={performance.upvotes}
          period={period}
          unknownReason="This cannot be measured for the selected period."
        />
        <CreatorMetricTile
          label="Comments"
          info="Comments left on your posts during this period."
          icon={<DiscussIcon size={IconSize.Small} className={iconClassName} />}
          metric={performance.comments}
          period={period}
          unknownReason="This cannot be measured for the selected period."
        />
        <CreatorMetricTile
          label="Outbound visits"
          info="Readers who clicked through to your article, counted since your first post. There is no daily breakdown for clicks, so this one number is not limited to the selected period."
          icon={<LinkIcon size={IconSize.Small} className={iconClassName} />}
          metric={performance.outboundVisits}
          period={period}
          unknownReason="No click data has been recorded for your posts yet."
        />
      </div>
      <div className="flex flex-col gap-1">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {periodLabel[period]}, through {formatCoverageDate(coverage.endDate)}{' '}
          (UTC). Today is still being counted and is not included.
          {updatedAt &&
            ` Last refreshed ${new Date(updatedAt).toLocaleString()}.`}
        </Typography>
        {coverageNote && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {coverageNote}
          </Typography>
        )}
      </div>
    </div>
  );
};
