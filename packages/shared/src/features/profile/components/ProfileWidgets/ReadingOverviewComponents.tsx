import type { ReactElement } from 'react';
import React from 'react';
import type { UserStreak, MostReadTag } from '../../../../graphql/users';
import { largeNumberFormat, getTagPageLink } from '../../../../lib';
import Link from '../../../../components/utilities/Link';
import { Tooltip } from '../../../../components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { SummaryCard } from './BadgesAndAwardsComponents';
import { anchorDefaultRel, capitalize } from '../../../../lib/strings';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import { ClickableText } from '../../../../components/buttons/ClickableText';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';
import { migrateUserToStreaks } from '../../../../lib/constants';

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
      <div className="mr-0.5 h-2 w-2 rounded-6 border border-border-subtlest-quaternary" />
      <div className="mr-0.5 h-2 w-2 rounded-6 bg-text-disabled" />
      <div className="mr-0.5 h-2 w-2 rounded-6 bg-text-quaternary" />
      <div className="mr-0.5 h-2 w-2 rounded-6 bg-text-primary" />
      <div className="ml-2">More</div>
    </div>
  </div>
);

// ReadingOverviewSkeleton component
export const ReadingOverviewSkeleton = (): ReactElement => {
  return (
    <ActivityContainer data-testid="ReadingOverviewSkeleton">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
        className="flex items-center"
      >
        Reading Overview
      </Typography>
      <ClickableText
        tag="a"
        target="_blank"
        href={migrateUserToStreaks}
        rel={anchorDefaultRel}
      >
        Learn more
      </ClickableText>

      {/* Streaks section skeleton */}
      <div className="my-3 flex gap-2">
        <ElementPlaceholder className="flex flex-1 flex-col items-center rounded-10 p-2">
          <ElementPlaceholder className="h-6 w-8 rounded-4" />
          <ElementPlaceholder className="mt-1 h-4 w-26 rounded-4" />
        </ElementPlaceholder>
        <ElementPlaceholder className="flex flex-1 flex-col items-center rounded-10 p-2">
          <ElementPlaceholder className="h-6 w-8 rounded-4" />
          <ElementPlaceholder className="mt-1 h-4 w-26 rounded-4" />
        </ElementPlaceholder>
      </div>

      {/* Tags section skeleton */}
      <div className="my-1">
        <ElementPlaceholder className="h-5 w-32 rounded-4" />
      </div>
      <div className="my-3 grid max-w-full grid-cols-2 gap-2">
        <ElementPlaceholder className="relative flex flex-row justify-between overflow-hidden rounded-6 px-2 py-1">
          <ElementPlaceholder className="h-4 w-16 rounded-4" />
          <ElementPlaceholder className="h-4 w-8 rounded-4" />
        </ElementPlaceholder>
      </div>

      {/* Heatmap section skeleton */}
      <div className="mb-3">
        <ElementPlaceholder className="h-5 w-48 rounded-4" />
      </div>

      {/* Calendar heatmap skeleton */}
      <div className="mb-4">
        <ElementPlaceholder className="h-20 w-full rounded-4" />
      </div>

      {/* Heatmap legend skeleton */}
      <div className="mt-4 flex justify-end">
        <ElementPlaceholder className="h-4 w-24 rounded-4" />
      </div>
    </ActivityContainer>
  );
};
