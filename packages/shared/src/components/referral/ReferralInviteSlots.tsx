import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { UserIcon } from '../icons';
import { IconSize } from '../Icon';
import type { WithClassNameProps } from '../utilities';
import type { UserShortProfile } from '../../lib/user';
import { referralLadderSteps } from '../../lib/referral';

interface ReferralInviteSlotsProps extends WithClassNameProps {
  referredCount: number;
  friends?: Pick<UserShortProfile, 'id' | 'name' | 'image'>[];
  onCopyLink: () => void;
}

const slotClassName =
  'flex size-16 items-center justify-center overflow-hidden rounded-full border-2';

export const ReferralInviteSlots = ({
  referredCount,
  friends = [],
  onCopyLink,
  className,
}: ReferralInviteSlotsProps): ReactElement => (
  <ul className={classNames('flex justify-center gap-4', className)}>
    {referralLadderSteps.map(({ invites }, index) => {
      const friend = friends[index];

      if (referredCount >= invites) {
        return (
          <li
            key={invites}
            title={friend?.name}
            className={classNames(
              slotClassName,
              'border-action-plus-default bg-action-plus-float text-action-plus-default',
            )}
          >
            {friend?.image ? (
              <img
                src={friend.image}
                alt={friend.name}
                className="size-full object-cover"
              />
            ) : (
              <UserIcon secondary size={IconSize.Large} />
            )}
          </li>
        );
      }

      return (
        <li key={invites}>
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
