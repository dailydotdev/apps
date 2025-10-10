import type { ReactElement } from 'react';
import React from 'react';
import type { UserStreak, MostReadTag } from '../../../graphql/users';
import { largeNumberFormat, getTagPageLink } from '../../../lib';
import Link from '../../utilities/Link';
import { Tooltip } from '../../tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { SummaryCard } from './BadgesAndAwardsComponents';
import { capitalize } from '../../../lib/strings';
import { ActivityContainer } from '../ActivitySection';
import { ClickableText } from '../../buttons/ClickableText';

// ReadingTagProgress component
interface ReadingTagProgressProps {
  tag: MostReadTag;
}

export const ReadingTagProgress = ({
  tag: { value: tag, count, percentage, total },
}: ReadingTagProgressProps): ReactElement => {
  const value = `+${(percentage * 100).toFixed(0)}%`;

  return (
    <Tooltip content={`${count}/${total} reading days`} side="top">
      <div className="relative flex flex-row justify-between overflow-hidden rounded-6 border border-border-subtlest-tertiary px-2">
        <Link href={getTagPageLink(tag)} passHref prefetch={false}>
          <Typography
            tag={TypographyTag.Link}
            className="z-1 my-auto"
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            truncate
          >
            {capitalize(tag)}
          </Typography>
        </Link>
        <Typography
          tag={TypographyTag.Span}
          className="z-1 my-auto"
          type={TypographyType.Footnote}
          color={TypographyColor.Primary}
        >
          {value}
        </Typography>
        <div
          className="absolute bottom-0 left-0 top-0 h-auto overflow-hidden bg-accent-onion-default"
          style={{ width: value }}
          data-testid="tagProgress"
        />
      </div>
    </Tooltip>
  );
};

// ReadingStreaksSection component
interface ReadingStreaksSectionProps {
  streak: UserStreak;
}

export const ReadingStreaksSection = ({
  streak,
}: ReadingStreaksSectionProps): ReactElement => (
  <div className="my-3 flex gap-2">
    <SummaryCard
      count={largeNumberFormat(streak?.max)}
      label="Longest streak 🏆"
    />
    <SummaryCard
      count={largeNumberFormat(streak?.total)}
      label="Total reading days"
    />
  </div>
);

// ReadingTagsSection component
interface ReadingTagsSectionProps {
  mostReadTags: MostReadTag[];
}

export const ReadingTagsSection = ({
  mostReadTags,
}: ReadingTagsSectionProps): ReactElement => (
  <>
    <Typography
      tag={TypographyTag.H3}
      type={TypographyType.Subhead}
      color={TypographyColor.Tertiary}
      className="my-1"
    >
      Top tags by reading days
    </Typography>
    <div className="my-3 grid max-w-full grid-cols-2 gap-2">
      {mostReadTags?.map((tag) => (
        <ReadingTagProgress key={tag.value} tag={tag} />
      ))}
    </div>
  </>
);

// HeatmapLegend component
export const HeatmapLegend = (): ReactElement => (
  <div className="mt-4 flex items-center justify-end typo-footnote">
    <div className="flex items-center">
      <div className="mr-2">Less</div>
      <div
        className="mr-0.5 h-2 w-2 border border-border-subtlest-quaternary"
        style={{ borderRadius: '0.1875rem' }}
      />
      <div
        className="mr-0.5 h-2 w-2 bg-text-disabled"
        style={{ borderRadius: '0.1875rem' }}
      />
      <div
        className="mr-0.5 h-2 w-2 bg-text-quaternary"
        style={{ borderRadius: '0.1875rem' }}
      />
      <div
        className="mr-0.5 h-2 w-2 bg-text-primary"
        style={{ borderRadius: '0.1875rem' }}
      />
      <div className="ml-2">More</div>
    </div>
  </div>
);

// ReadingOverviewSkeleton component
export const ReadingOverviewSkeleton = (): ReactElement => {
  return (
    <ActivityContainer>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
        className="flex items-center"
      >
        Reading Overview
      </Typography>
      <ClickableText tag="a" target="_blank" href="">
        Learn more
      </ClickableText>

      {/* Streaks section skeleton */}
      <div className="my-3 flex gap-2">
        <div className="flex-1 rounded-10 border border-border-subtlest-tertiary p-2 text-center">
          <div className="h-6 w-8 animate-pulse rounded-4 bg-text-quaternary" />
          <div className="mt-1 h-4 w-16 animate-pulse rounded-4 bg-text-quaternary" />
        </div>
        <div className="flex-1 rounded-10 border border-border-subtlest-tertiary p-2 text-center">
          <div className="h-6 w-8 animate-pulse rounded-4 bg-text-quaternary" />
          <div className="mt-1 h-4 w-16 animate-pulse rounded-4 bg-text-quaternary" />
        </div>
      </div>

      {/* Tags section skeleton */}
      <div className="my-1">
        <div className="h-5 w-32 animate-pulse rounded-4 bg-text-quaternary" />
      </div>
      <div className="my-3 grid max-w-full grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="relative flex flex-row justify-between overflow-hidden rounded-6 border border-border-subtlest-tertiary px-2 py-1">
            <div className="h-4 w-16 animate-pulse rounded-4 bg-text-quaternary" />
            <div className="h-4 w-8 animate-pulse rounded-4 bg-text-quaternary" />
          </div>
        ))}
      </div>

      {/* Heatmap section skeleton */}
      <div className="mb-3">
        <div className="h-5 w-48 animate-pulse rounded-4 bg-text-quaternary" />
      </div>
      
      {/* Calendar heatmap skeleton */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className={`h-3 w-3 animate-pulse rounded ${
                index % 7 === 0 ? 'bg-text-quaternary' : 
                index % 7 === 1 ? 'bg-text-disabled' : 
                index % 7 === 2 ? 'bg-text-quaternary' : 
                index % 7 === 3 ? 'bg-text-primary' : 
                'bg-text-quaternary'
              }`}
              style={{ borderRadius: '0.1875rem' }}
            />
          ))}
        </div>
      </div>

      {/* Heatmap legend skeleton */}
      <HeatmapLegend />
    </ActivityContainer>
  );
};
