import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ActivityContainer } from '@dailydotdev/shared/src/components/profile/ActivitySection';
import {
  Award,
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
import { gtaViAward, productionAwards } from '../data';

/*
 * Where a received Vice City award shows, as production draws any award:
 * the comment's award count (CommentAwardActions) with the featured award at
 * size-6, and the profile's Badges & Awards widget at size-8. Nothing here
 * changes for the event award; it's the same image at the same sizes.
 */

const ActionIcon = ({
  icon,
  count,
}: {
  icon: ReactElement;
  count?: number;
}): ReactElement => (
  <span className="mr-3 flex items-center gap-1 text-text-tertiary">
    <span className="flex size-8 items-center justify-center rounded-10">
      {icon}
    </span>
    {count !== undefined && (
      <span className="font-bold typo-callout">{count}</span>
    )}
  </span>
);

/** A comment that received awards, with the Vice City award featured. */
export const CommentWithAward = ({
  numAwards = 3,
}: {
  numAwards?: number;
}): ReactElement => (
  <article className="flex w-[40rem] flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
    <header className="flex items-center gap-3">
      <img src={fallbackImages.avatar} alt="" className="size-10 rounded-12" />
      <div className="flex flex-col">
        <span className="font-bold text-text-primary typo-callout">
          nerdalytics
        </span>
        <span className="text-text-tertiary typo-footnote">
          @nerdalytics · 2h
        </span>
      </div>
    </header>
    <Typography type={TypographyType.Body} color={TypographyColor.Primary}>
      Day-one patch notes are already 4GB. I'll read the changelog here while it
      downloads.
    </Typography>
    <div className="flex items-center">
      <ActionIcon icon={<UpvoteIcon />} count={42} />
      <ActionIcon icon={<DownvoteIcon />} />
      <ActionIcon icon={<DiscussIcon />} />
      <span className="flex items-center">
        <img src={gtaViAward.image} alt={gtaViAward.name} className="size-6" />
        <Typography
          className="ml-1 mr-3 flex items-center gap-1"
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          tag={TypographyTag.Span}
          bold
        >
          {numAwards}
          <span>Award{numAwards > 1 ? 's' : ''}</span>
        </Typography>
      </span>
      <ActionIcon icon={<ShareIcon size={IconSize.Small} />} />
    </div>
  </article>
);

const profileAwards = [
  { id: gtaViAward.id, image: gtaViAward.image, count: 4 },
  ...productionAwards.slice(0, 8).map((award, index) => ({
    id: award.id,
    image: award.image,
    count: [6, 3, 12, 1, 2, 5, 1, 2][index],
  })),
];

/** The profile's Badges & Awards widget, the Vice City award first. */
export const ProfileAwards = (): ReactElement => {
  const total = profileAwards.reduce((sum, award) => sum + award.count, 0);
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
        <SummaryCard count={`x${total}`} label="Total Awards" />
      </div>
      <div
        className="mt-4 grid grid-cols-5 gap-4"
        role="list"
        aria-label="User awards"
      >
        {profileAwards.map((award) => (
          <Award key={award.id} image={award.image} amount={award.count} />
        ))}
      </div>
    </ActivityContainer>
  );
};
