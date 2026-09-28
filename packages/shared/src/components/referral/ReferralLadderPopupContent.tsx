import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
  REFERRAL_FRIEND_REWARD,
  REFERRAL_INVITE_COPIED_TOAST,
  REFERRAL_INVITE_TEXT,
  REFERRAL_LADDER_ACTIVE_DAYS,
} from '../../lib/referral';
import {
  getReferralLadderHeadline,
  ReferralLadderRewards,
} from './ReferralLadderRewards';
import { useCopyLink } from '../../hooks/useCopy';
import { link } from '../../lib/links';
import { useLogContext } from '../../contexts/LogContext';
import type { TargetId, TargetType } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';
import { referredUsersPreviewQueryOptions } from '../../graphql/users';

export const REFERRAL_LADDER_POPUP_TITLE = 'Invite friends, get Plus';

interface ReferralLadderPopupContentProps extends WithClassNameProps {
  logTargetId: TargetId;
  logTargetType: TargetType;
  showShareOptions?: boolean;
}

export const ReferralLadderPopupContent = ({
  logTargetId,
  logTargetType,
  showShareOptions = true,
  className,
}: ReferralLadderPopupContentProps): ReactElement => {
  const { referredCount, nextStep, remainingInvites, url } =
    useReferralLadder();
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const { data: friends } = useQuery({
    ...referredUsersPreviewQueryOptions(user),
    enabled: !!user && referredCount > 0,
  });
  const [copied, copyLink] = useCopyLink(() => url || link.referral.defaultUrl);
  const onCopyLink = () => {
    copyLink({
      format: getReferralInviteMessage,
      message: REFERRAL_INVITE_COPIED_TOAST,
    });
    logEvent({
      event_name: LogEvent.CopyReferralLink,
      target_id: logTargetId,
    });
  };

  return (
    <div className={classNames('flex flex-col gap-5', className)}>
      <div className="flex flex-col items-center gap-4 text-center">
        <ReferralInviteSlots
          referredCount={referredCount}
          friends={friends}
          onCopyLink={onCopyLink}
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
              : `Your friend gets ${REFERRAL_FRIEND_REWARD} too.`}
          </Typography>
        </div>
      </div>

      <ReferralLadderRewards referredCount={referredCount} />

      {showShareOptions && (
        <>
          <InviteLinkInput
            copyFormat={getReferralInviteMessage}
            copyMessage={REFERRAL_INVITE_COPIED_TOAST}
            logProps={{
              event_name: LogEvent.CopyReferralLink,
              target_id: logTargetId,
            }}
            link={url || link.referral.defaultUrl}
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
        A friend counts once they sign up and stay active for{' '}
        {REFERRAL_LADDER_ACTIVE_DAYS} days. Each reward is added to the end of
        any Plus time you already have.
      </Typography>
    </div>
  );
};
