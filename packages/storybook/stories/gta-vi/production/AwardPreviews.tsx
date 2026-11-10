import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ActivityContainer } from '@dailydotdev/shared/src/components/profile/ActivitySection';
import {
  Award,
  BadgesAndAwardsSkeleton,
  SummaryCard,
} from '@dailydotdev/shared/src/features/profile/components/ProfileWidgets/BadgesAndAwardsComponents';
import {
  DiscussIcon,
  DownvoteIcon,
  ShareIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { fallbackImages } from '@dailydotdev/shared/src/lib/config';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { Product } from '@dailydotdev/shared/src/graphql/njord';
import { gtaViAward, productionAwards } from '../data';

/*
 * Where a received Vice City award shows, as production draws any award:
 * the comment's award count (CommentAwardActions) with the featured award at
 * size-6, and the profile's Badges & Awards widget at size-8. Nothing here
 * changes for the event award; it's the same image at the same sizes.
 */

const ActionIcon = ({
  icon,
  label,
  count,
}: {
  icon: ReactElement;
  label: string;
  count?: number;
}): ReactElement => (
  <button
    type="button"
    aria-label={label}
    className="mr-3 flex items-center gap-1 rounded-10 text-text-tertiary hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-primary"
  >
    <span className="flex size-8 items-center justify-center">{icon}</span>
    {count !== undefined && (
      <span className="font-bold typo-callout">{count}</span>
    )}
  </button>
);

/** A comment that received awards, with one of them featured. */
export const CommentWithAward = ({
  numAwards = 3,
  featured = gtaViAward,
  text = "Day-one patch notes are already 4GB. I'll read the changelog here while it downloads.",
  className,
}: {
  numAwards?: number;
  featured?: Product;
  text?: string;
  className?: string;
}): ReactElement => (
  <article
    className={classNames(
      'flex w-full max-w-[40rem] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4',
      className,
    )}
  >
    <header className="flex items-center gap-3">
      <img src={fallbackImages.avatar} alt="" className="size-10 rounded-12" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-bold text-text-primary typo-callout">
          nerdalytics
        </span>
        <span className="truncate text-text-tertiary typo-footnote">
          @nerdalytics · 2h
        </span>
      </div>
    </header>
    <Typography
      type={TypographyType.Body}
      color={TypographyColor.Primary}
      className="break-words"
    >
      {text}
    </Typography>
    <div className="flex flex-wrap items-center">
      <ActionIcon icon={<UpvoteIcon />} label="Upvote" count={42} />
      <ActionIcon icon={<DownvoteIcon />} label="Downvote" />
      <ActionIcon icon={<DiscussIcon />} label="Reply" />
      <button
        type="button"
        aria-label={`${numAwards} Award${
          numAwards === 1 ? '' : 's'
        }, featured: ${featured.name}`}
        className="flex items-center rounded-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-primary"
      >
        <img src={featured.image} alt="" className="size-6" />
        <Typography
          className="ml-1 mr-3 flex items-center gap-1"
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          tag={TypographyTag.Span}
          bold
        >
          {largeNumberFormat(numAwards)}
          {/* Production hides the word below tablet. */}
          <span className="hidden tablet:block">
            Award{numAwards > 1 ? 's' : ''}
          </span>
        </Typography>
      </button>
      <ActionIcon icon={<ShareIcon size={IconSize.Small} />} label="Share" />
    </div>
  </article>
);

export type ProfileAwardsState =
  | 'loading'
  | 'empty'
  | 'single'
  | 'some'
  | 'many';

const counts = [6, 3, 12, 1, 2, 5, 1, 2, 9, 4, 1, 3, 2, 1, 7];

const awardsFor = (
  state: ProfileAwardsState,
): { id: string; image: string; count: number }[] => {
  const viceCity = { id: gtaViAward.id, image: gtaViAward.image, count: 4 };
  const others = productionAwards.map((award, index) => ({
    id: award.id,
    image: award.image,
    count: counts[index],
  }));
  if (state === 'empty' || state === 'loading') {
    return [];
  }
  if (state === 'single') {
    return [{ ...viceCity, count: 1 }];
  }
  if (state === 'some') {
    return [viceCity, ...others.slice(0, 8)];
  }
  return [{ ...viceCity, count: 1284 }, ...others];
};

/** The profile's Badges & Awards widget, the Vice City award first. */
export const ProfileAwards = ({
  state = 'some',
}: {
  state?: ProfileAwardsState;
}): ReactElement => {
  if (state === 'loading') {
    return <BadgesAndAwardsSkeleton />;
  }
  const awards = awardsFor(state);
  const total = awards.reduce((sum, award) => sum + award.count, 0);
  return (
    <ActivityContainer className="bg-background-default">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
      >
        Badges &amp; Awards
      </Typography>
      <span className="text-text-link typo-callout">Learn more</span>
      <div className="my-3 flex gap-3">
        <SummaryCard count="x7" label="Top reader badge" />
        <SummaryCard
          count={`x${largeNumberFormat(total)}`}
          label="Total Awards"
        />
      </div>
      {awards.length > 0 && (
        <div
          className="mt-4 grid grid-cols-5 gap-4 laptop:grid-cols-6"
          role="list"
          aria-label="User awards"
        >
          {awards.map((award) => (
            <Award key={award.id} image={award.image} amount={award.count} />
          ))}
        </div>
      )}
    </ActivityContainer>
  );
};
