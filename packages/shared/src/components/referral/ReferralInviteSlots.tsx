import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { UserIcon } from '../icons/User';
import { IconSize } from '../Icon';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import type { WithClassNameProps } from '../utilities';
import type {
  ReferralLadderFriend,
  ReferralLadderStep,
} from '../../graphql/users';

interface ReferralInviteSlotsProps extends WithClassNameProps {
  steps: ReferralLadderStep[];
  referredCount: number;
  friends: ReferralLadderFriend[];
  onCopyLink: () => void;
}

const slotClassName =
  'flex size-16 items-center justify-center overflow-hidden rounded-full border-2';

export const ReferralInviteSlots = ({
  steps,
  referredCount,
  friends,
  onCopyLink,
  className,
}: ReferralInviteSlotsProps): ReactElement => (
  <ul className={classNames('flex justify-center gap-4', className)}>
    {steps.map(({ step }, index) => {
      const friend = friends[index];

      if (index < referredCount) {
        return (
          <li
            key={step}
            title={friend?.name}
            className={classNames(
              slotClassName,
              'border-action-plus-default bg-action-plus-float text-action-plus-default',
            )}
          >
            {friend ? (
              <ProfilePicture
                user={friend}
                size={ProfileImageSize.XXXLarge}
                nativeLazyLoading
              />
            ) : (
              <UserIcon secondary size={IconSize.Large} />
            )}
          </li>
        );
      }

      return (
        <li key={step}>
          <button
            type="button"
            aria-label="Copy your invite link"
            onClick={onCopyLink}
            className={classNames(
              slotClassName,
              'border-dashed border-border-subtlest-secondary text-text-quaternary transition-colors hover:border-action-plus-default hover:bg-action-plus-float hover:text-action-plus-default',
            )}
          >
            <UserIcon size={IconSize.Large} />
          </button>
        </li>
      );
    })}
  </ul>
);
