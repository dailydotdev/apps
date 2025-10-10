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
