import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ButtonSize } from '../buttons/Button';
import CloseButton from '../CloseButton';
import { UserIcon } from '../icons/User';
import { IconSize } from '../Icon';
import { PlusTitle } from '../plus/PlusTitle';
import type { WithClassNameProps } from '../utilities';
import { InviteLinkInput } from './InviteLinkInput';
import ReferralSocialShareButtons from '../widgets/ReferralSocialShareButtons';
import {
  getReferralLadderHeadline,
  pluralizeFriend,
} from './ReferralLadderRewards';
import type { ReferralLadderStep } from '../../graphql/users';
import { useReferralLadder } from '../../hooks/referral/useReferralLadder';
import { useReferralCampaign } from '../../hooks/referral/useReferralCampaign';
import {
  formatReferralLadderMonths,
  getReferralInviteMessage,
  getReferralLadderReward,
  ReferralCampaignKey,
  REFERRAL_INVITE_COPIED_TOAST,
  REFERRAL_INVITE_TEXT,
} from '../../lib/referral';
import { cloudinaryGiftedPlusModalImage } from '../../lib/image';
import { link } from '../../lib/links';
import { LogEvent, TargetId, TargetType } from '../../lib/log';

interface ReferralLadderPromoStepsProps {
  steps: ReferralLadderStep[];
  referredCount: number;
}

const ReferralLadderPromoSteps = ({
  steps,
  referredCount,
}: ReferralLadderPromoStepsProps): ReactElement => (
  <ol className="grid grid-cols-3 gap-2">
    {steps.map((step) => {
      const isUnlocked = !!step.unlockedAt;

      return (
        <li
          key={step.step}
          className={classNames(
            'flex flex-col items-center gap-0.5 rounded-12 border px-2 py-3 text-center',
            isUnlocked
              ? 'border-action-plus-default bg-action-plus-float'
              : 'border-transparent bg-surface-float',
          )}
        >
          <Typography type={TypographyType.Callout} bold>
            {formatReferralLadderMonths(step.months)}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {step.invites} {pluralizeFriend(step.invites)}
            {isUnlocked && <span className="sr-only">, unlocked</span>}
          </Typography>
          <span aria-hidden className="mt-1 flex gap-0.5">
            {Array.from({ length: step.invites }, (_, index) => (
              <UserIcon
                key={index}
                size={IconSize.Size16}
                className={
                  index < referredCount
                    ? 'text-action-plus-default'
                    : 'text-text-tertiary'
                }
              />
            ))}
          </span>
        </li>
      );
    })}
  </ol>
);

interface ReferralLadderPromoProps extends WithClassNameProps {
  onClose: (event: MouseEvent) => void;
}

export const ReferralLadderPromo = ({
  onClose,
  className,
}: ReferralLadderPromoProps): ReactElement => {
  const { referredCount, steps, nextStep, remainingInvites } =
    useReferralLadder();
  const { url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;
  const lastStep = steps[steps.length - 1];
  const headline =
    referredCount === 0 && lastStep
      ? `Invite friends, get up to ${getReferralLadderReward(lastStep.months)}`
      : getReferralLadderHeadline({
          referredCount,
          nextStep,
          remainingInvites,
        });

  return (
    <div className={classNames('flex flex-col gap-4 p-5', className)}>
      <div className="flex items-center justify-between">
        <PlusTitle type={TypographyType.Callout} bold />
        {/* The mobile drawer renders its own close button. */}
        <CloseButton
          type="button"
          size={ButtonSize.Small}
          className="hidden tablet:flex"
          onClick={onClose}
        />
      </div>
      <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
        {headline}
      </Typography>
      <img
        src={cloudinaryGiftedPlusModalImage}
        alt="Gift box with the daily.dev Plus logo"
        className="h-auto w-full"
      />
      <ReferralLadderPromoSteps steps={steps} referredCount={referredCount} />
      <InviteLinkInput
        copyFormat={getReferralInviteMessage}
        copyMessage={REFERRAL_INVITE_COPIED_TOAST}
        logProps={{
          event_name: LogEvent.CopyReferralLink,
          target_id: TargetId.ReferralLadderPromo,
          extra: JSON.stringify({ trigger: 'input' }),
        }}
        link={inviteLink}
      />
      <div className="flex items-center justify-center gap-3">
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Invite via
        </Typography>
        <ReferralSocialShareButtons
          url={url}
          targetType={TargetType.ReferralLadderPromo}
          text={REFERRAL_INVITE_TEXT}
        />
      </div>
    </div>
  );
};
