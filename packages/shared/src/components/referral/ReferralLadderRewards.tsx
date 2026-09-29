import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { LockIcon } from '../icons/Lock';
import { VIcon } from '../icons/V';
import { IconSize } from '../Icon';
import type { ReferralLadderStep } from '../../graphql/users';
import { getReferralLadderReward } from '../../lib/referral';
import type { WithClassNameProps } from '../utilities';

const pluralizeFriend = (count: number): string =>
  count === 1 ? 'friend' : 'friends';

export const getReferralLadderHeadline = ({
  referredCount,
  nextStep,
  remainingInvites,
}: {
  referredCount: number;
  nextStep?: ReferralLadderStep;
  remainingInvites: number;
}): string => {
  if (!nextStep) {
    return 'You climbed the whole ladder';
  }

  const more = referredCount > 0 ? ' more' : '';

  return `Invite ${remainingInvites}${more} ${pluralizeFriend(
    remainingInvites,
  )} to get ${getReferralLadderReward(nextStep.months)}`;
};

interface ReferralLadderRewardsProps extends WithClassNameProps {
  steps: ReferralLadderStep[];
}

export const ReferralLadderRewards = ({
  steps,
  className,
}: ReferralLadderRewardsProps): ReactElement => (
  <ul className={classNames('flex flex-col gap-2', className)}>
    {steps.map((step) => {
      const isUnlocked = !!step.unlockedAt;

      return (
        <li
          key={step.step}
          className={classNames(
            'flex items-center gap-3 rounded-12 border px-3 py-2.5',
            isUnlocked
              ? 'border-action-plus-default bg-action-plus-float'
              : 'border-border-subtlest-tertiary',
          )}
        >
          {isUnlocked ? (
            <VIcon
              aria-label="Unlocked"
              className="text-action-plus-default"
              size={IconSize.Small}
            />
          ) : (
            <LockIcon
              aria-label="Locked"
              className="text-text-quaternary"
              size={IconSize.Small}
            />
          )}
          <Typography
            type={TypographyType.Callout}
            color={
              isUnlocked ? TypographyColor.Primary : TypographyColor.Secondary
            }
            bold
            className="flex-1"
          >
            {getReferralLadderReward(step.months)}
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {step.invites} {pluralizeFriend(step.invites)}
          </Typography>
        </li>
      );
    })}
  </ul>
);
