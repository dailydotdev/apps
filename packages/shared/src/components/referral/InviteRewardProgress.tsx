import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
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

interface InviteRewardProgressProps {
  // The raw number of developers who joined. Values outside 0..INVITE_GOAL are
  // clamped here, so callers can pass the referral count as-is.
  joinedCount: number;
  referredUsers: UserShortProfile[];
  className?: string;
}

// The referral reward tracker: one slot per friend needed, filled with the
// avatars of the developers who actually joined, ending in the Plus reward.
// Slots use the same rounded-rect radius as ProfilePicture so filled and empty
// slots share a silhouette.
export const InviteRewardProgress = ({
  joinedCount,
  referredUsers,
  className,
}: InviteRewardProgressProps): ReactElement => {
  const joined = Math.min(Math.max(0, joinedCount), INVITE_GOAL);
  const isCompleted = joined >= INVITE_GOAL;
  const caption = isCompleted
    ? `${INVITE_GOAL} of ${INVITE_GOAL} friends joined — Plus unlocked`
    : `${joined} of ${INVITE_GOAL} friends joined`;

  return (
    <div className={classNames('flex flex-col items-start gap-2', className)}>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {caption}
      </Typography>
      {/* The caption above already states the progress, and every referred
          developer is named in the list further down the page, so the slot row
          is presentational. */}
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
        {/* The connector is the first thing to go on narrow phones, where the
            slots and the reward chip only just fit on one line. */}
        <span className="hidden h-px w-3 bg-border-subtlest-tertiary mobileL:block" />
        {/* The border is always present so unlocking recolors it instead of
            resizing the chip. */}
        <span
          className={classNames(
            'flex h-8 items-center gap-1 rounded-10 border bg-action-plus-float px-3 font-bold text-action-plus-default typo-footnote',
            isCompleted ? 'border-action-plus-default' : 'border-transparent',
          )}
        >
          <DevPlusIcon secondary size={IconSize.Size16} />1 month of Plus
        </span>
      </div>
    </div>
  );
};
