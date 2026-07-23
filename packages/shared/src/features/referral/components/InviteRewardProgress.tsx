import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import { AddUserIcon, DevPlusIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import type { UserShortProfile } from '../../../lib/user';

export const INVITE_GOAL = 3;

interface InviteRewardProgressProps {
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
  const isCompleted = joinedCount >= INVITE_GOAL;
  const caption = isCompleted
    ? `${INVITE_GOAL} of ${INVITE_GOAL} friends joined — Plus unlocked`
    : `${Math.max(0, joinedCount)} of ${INVITE_GOAL} friends joined`;

  return (
    <div className={classNames('flex flex-col items-start gap-2', className)}>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {caption}
      </Typography>
      <div className="flex items-center gap-2" aria-label={caption}>
        {Array.from({ length: INVITE_GOAL }, (_, index) => {
          const isFilled = index < joinedCount;
          const referredUser = referredUsers[index];

          if (isFilled && referredUser) {
            return (
              <ProfilePicture
                key={referredUser.id}
                user={referredUser}
                size={ProfileImageSize.Medium}
              />
            );
          }

          return (
            <span
              aria-hidden
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
        <span aria-hidden className="h-px w-3 bg-border-subtlest-tertiary" />
        <span
          className={classNames(
            'flex h-8 items-center gap-1 rounded-10 bg-action-plus-float px-3 font-bold text-action-plus-default typo-footnote',
            isCompleted && 'border border-action-plus-default',
          )}
        >
          <DevPlusIcon secondary size={IconSize.Size16} />1 month of Plus
        </span>
      </div>
    </div>
  );
};
