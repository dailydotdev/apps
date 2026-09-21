import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  AddUserIcon,
  DiscussIcon,
  EyeIcon,
  LinkIcon,
  ReputationIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ElementPlaceholder } from '@dailydotdev/shared/src/components/ElementPlaceholder';
import type {
  CreatorMetric,
  CreatorPerformance,
  CreatorPerformancePeriod,
} from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import { CreatorMetricSemantics } from '@dailydotdev/shared/src/graphql/creatorAnalytics';
import type { UserPostsAnalytics } from '@dailydotdev/shared/src/graphql/users';
import { CreatorMetricTile } from './CreatorMetricTile';
import { formatCoverageDate, getCoverageNote, periodLabel } from './common';

const iconClassName = 'text-text-tertiary';

const gridClassName = 'grid grid-cols-2 gap-4 tablet:grid-cols-3';

/**
 * A running counter dressed as a metric so it renders through the same tile.
 *
 * `previous: null` is what suppresses the comparison chip, and the LIFETIME
 * semantics is what captions it "All time" — both are properties of the
 * number, not of the tile, so they travel with it.
 */
const lifetimeMetric = (value: number | null | undefined): CreatorMetric => ({
  value: value ?? null,
  previous: null,
  semantics: CreatorMetricSemantics.Lifetime,
});

export const CreatorOverviewSkeleton = (): ReactElement => (
  <div className={gridClassName}>
    {Array.from({ length: 6 }, (_, index) => (
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
  /** Lifetime counters, `null` when that query failed. */
  lifetime: UserPostsAnalytics | null | undefined;
}

/**
 * The headline numbers, split by what they are actually scoped to.
 *
 * Impressions, upvotes and comments answer "in the selected window".
 * Outbound visits, followers and reputation are running totals with no daily
 * grain to scope them, so they sit in their own group rather than under a
 * period heading that would not be true of them.
 */
export const CreatorOverviewSection = ({
  performance,
  period,
  lifetime,
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
      </div>
      {/* Lifetime counters are grouped apart from the period ones rather than
          mixed into the same grid, so the split is visible before anyone
          reads a caption. */}
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        bold
      >
        All time
      </Typography>
      <div className={gridClassName}>
        <CreatorMetricTile
          label="Outbound visits"
          info="Readers who clicked through to your article. There is no daily breakdown for clicks, so this counts every visit since your first post."
          icon={<LinkIcon size={IconSize.Small} className={iconClassName} />}
          metric={performance.outboundVisits}
          period={period}
          unknownReason="No click data has been recorded for your posts yet."
        />
        <CreatorMetricTile
          label="Followers"
          info="Developers who followed you after discovering your content."
          icon={<AddUserIcon size={IconSize.Small} className={iconClassName} />}
          metric={lifetimeMetric(lifetime?.followers)}
          period={period}
          unknownReason="Your follower count could not be loaded."
        />
        <CreatorMetricTile
          label="Reputation"
          info="Reputation points earned across all of your posts."
          icon={
            <ReputationIcon
              size={IconSize.Small}
              secondary
              className={iconClassName}
            />
          }
          metric={lifetimeMetric(lifetime?.reputation)}
          period={period}
          unknownReason="Your reputation could not be loaded."
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
