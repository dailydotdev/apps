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
      <div className="rounded-6 border-border-subtlest-tertiary relative flex flex-row justify-between overflow-hidden border px-2">
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
          className="bg-accent-onion-default absolute bottom-0 left-0 top-0 h-auto overflow-hidden"
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
  <div className="typo-footnote mt-4 flex items-center justify-end">
    <div className="flex items-center">
      <div className="mr-2">Less</div>
      <div
        className="border-border-subtlest-quaternary mr-0.5 h-2 w-2 border"
        style={{ borderRadius: '0.1875rem' }}
      />
      <div
        className="bg-text-disabled mr-0.5 h-2 w-2"
        style={{ borderRadius: '0.1875rem' }}
      />
      <div
        className="bg-text-quaternary mr-0.5 h-2 w-2"
        style={{ borderRadius: '0.1875rem' }}
      />
      <div
        className="bg-text-primary mr-0.5 h-2 w-2"
        style={{ borderRadius: '0.1875rem' }}
      />
      <div className="ml-2">More</div>
    </div>
  </div>
);
