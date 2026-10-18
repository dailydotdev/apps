import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { WithClassNameProps } from '../utilities';
import { ReferralInviteSlots } from './ReferralInviteSlots';
import { InviteLinkInput } from './InviteLinkInput';
import ReferralSocialShareButtons from '../widgets/ReferralSocialShareButtons';
import { useReferralLadder } from '../../hooks/referral/useReferralLadder';
import {
  getReferralInviteMessage,
  ReferralCampaignKey,
  REFERRAL_INVITE_COPIED_TOAST,
  REFERRAL_INVITE_TEXT,
} from '../../lib/referral';
import {
  getReferralLadderHeadline,
  ReferralLadderRewards,
} from './ReferralLadderRewards';
import { useCopyLink } from '../../hooks/useCopy';
import { useReferralCampaign } from '../../hooks/referral/useReferralCampaign';
import { link } from '../../lib/links';
import { useLogContext } from '../../contexts/LogContext';
import type { TargetId, TargetType } from '../../lib/log';
import { LogEvent } from '../../lib/log';

export const REFERRAL_LADDER_POPUP_TITLE = 'Invite friends, get Plus';

interface ReferralLadderPopupContentProps extends WithClassNameProps {
  logTargetId: TargetId;
  logTargetType: TargetType;
  origin?: TargetId;
  showShareOptions?: boolean;
}

export const ReferralLadderPopupContent = ({
  logTargetId,
  logTargetType,
  origin,
  showShareOptions = true,
  className,
}: ReferralLadderPopupContentProps): ReactElement => {
  const { referredCount, steps, friends, nextStep, remainingInvites } =
    useReferralLadder();
  const { url } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const inviteLink = url || link.referral.defaultUrl;
  const { logEvent } = useLogContext();
  const [copied, copyLink] = useCopyLink(() => inviteLink);
  const getCopyLogEvent = (trigger: 'slot' | 'input') => ({
    event_name: LogEvent.CopyReferralLink,
    target_id: logTargetId,
    extra: JSON.stringify({ trigger, origin }),
  });
  const onCopySlot = () => {
    copyLink({
      format: getReferralInviteMessage,
      message: REFERRAL_INVITE_COPIED_TOAST,
    });
    logEvent(getCopyLogEvent('slot'));
  };

  return (
    <div className={classNames('flex flex-col gap-5', className)}>
      <div className="flex flex-col items-center gap-4 text-center">
        <ReferralInviteSlots
          steps={steps}
          referredCount={referredCount}
          friends={friends}
          onCopyLink={onCopySlot}
        />
        <div className="flex flex-col gap-1">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            {getReferralLadderHeadline({
              referredCount,
              nextStep,
              remainingInvites,
            })}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {copied
              ? 'Invite copied. Paste it to a friend.'
              : 'Friends count as soon as they sign up with your link.'}
          </Typography>
        </div>
      </div>

      <ReferralLadderRewards steps={steps} />

      {showShareOptions && (
        <>
          <InviteLinkInput
            copyFormat={getReferralInviteMessage}
            copyMessage={REFERRAL_INVITE_COPIED_TOAST}
            logProps={getCopyLogEvent('input')}
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
              targetType={logTargetType}
              text={REFERRAL_INVITE_TEXT}
            />
          </div>
        </>
      )}

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="text-center"
      >
        Each reward is added to the end of any Plus time you already have.
      </Typography>
    </div>
  );
};
