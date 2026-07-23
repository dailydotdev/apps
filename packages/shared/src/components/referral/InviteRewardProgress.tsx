import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { AddUserIcon, DevPlusIcon, VIcon } from '../icons';
import { IconSize } from '../Icon';
import type { UserShortProfile } from '../../lib/user';

export const INVITE_GOAL = 3;

export interface InviteRewardPeriod {
  startsAt: Date;
  endsAt: Date;
}

interface InviteRewardProgressProps {
  // The raw number of developers who joined. Values outside 0..INVITE_GOAL are
  // clamped here, so callers can pass the referral count as-is.
  joinedCount: number;
  referredUsers: UserShortProfile[];
  // When the free month runs. Optional: the referral list can still be loading
  // when the count already says the goal is met, and the unlocked state reads
  // fine without it.
  rewardPeriod?: InviteRewardPeriod;
  className?: string;
}

const formatRewardDate = (date: Date): string => format(date, 'd MMM yyyy');

// The row of avatars/slots, one per friend needed. Filled slots use the same
// rounded-rect radius as ProfilePicture so filled and empty share a silhouette.
const InviteSlots = ({
  joined,
  referredUsers,
}: {
  joined: number;
  referredUsers: UserShortProfile[];
}): ReactElement => (
  // The caption states the progress and every referred developer is named in
  // the list further down the page, so the slot row is presentational.
  <div aria-hidden className="flex flex-wrap items-center gap-2">
    {Array.from({ length: INVITE_GOAL }, (_, index) => {
      const isFilled = index < joined;
      const referredUser = referredUsers[index];

      if (isFilled && referredUser) {
        return (
          <ProfilePicture
            key={`invite-slot-${index}`}
            user={referredUser}
            size={ProfileImageSize.Medium}
          />
        );
      }

      return (
        <span
          key={`invite-slot-${index}`}
          className={classNames(
            'flex size-8 items-center justify-center rounded-10',
            isFilled
              ? 'bg-surface-float text-text-secondary'
              : 'border border-dashed border-border-subtlest-primary text-text-quaternary',
          )}
        >
          {isFilled ? <VIcon /> : <AddUserIcon secondary />}
        </span>
      );
    })}
  </div>
);

// The referral reward tracker. While the goal is open it stays a quiet one-line
// row; once it's met the reward is the point of the section, so it becomes a
// full-width Plus-accented card that names the reward and when it runs.
export const InviteRewardProgress = ({
  joinedCount,
  referredUsers,
  rewardPeriod,
  className,
}: InviteRewardProgressProps): ReactElement => {
  const joined = Math.min(Math.max(0, joinedCount), INVITE_GOAL);
  const isCompleted = joined >= INVITE_GOAL;

  if (isCompleted) {
    return (
      <div
        className={classNames(
          'w-full rounded-16 border border-action-plus-default bg-action-plus-float p-4',
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <span className="relative shrink-0 motion-safe:animate-reward-pop">
            <span className="grid size-10 place-items-center rounded-12 bg-action-plus-default text-white">
              <DevPlusIcon secondary size={IconSize.Medium} />
            </span>
            {/* The "earned it" mark, notched into the corner the way a badge
                sits on an avatar. */}
            <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-background-default bg-status-success text-white">
              <VIcon size={IconSize.XXSmall} />
            </span>
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Typography type={TypographyType.Title3} bold>
              1 month of Plus unlocked
            </Typography>
            {rewardPeriod && (
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
              >
                <time dateTime={rewardPeriod.startsAt.toISOString()}>
                  {formatRewardDate(rewardPeriod.startsAt)}
                </time>
                {' – '}
                <time dateTime={rewardPeriod.endsAt.toISOString()}>
                  {formatRewardDate(rewardPeriod.endsAt)}
                </time>
              </Typography>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-border-subtlest-tertiary pt-3">
          <InviteSlots joined={joined} referredUsers={referredUsers} />
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            All {INVITE_GOAL} friends joined
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col items-start gap-2', className)}>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {joined} of {INVITE_GOAL} friends joined
      </Typography>
      <div className="flex flex-wrap items-center gap-2">
        <InviteSlots joined={joined} referredUsers={referredUsers} />
        {/* The connector is the first thing to go on narrow phones, where the
            slots and the reward chip only just fit on one line. */}
        <span className="hidden h-px w-3 bg-border-subtlest-tertiary mobileL:block" />
        <span className="flex h-8 items-center gap-1 rounded-10 border border-transparent bg-action-plus-float px-3 font-bold text-action-plus-default typo-footnote">
          <DevPlusIcon secondary size={IconSize.Size16} />1 month of Plus
        </span>
      </div>
    </div>
  );
};
