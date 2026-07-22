import type { ReactElement } from 'react';
import React from 'react';
import { ShareActions } from '../share/ShareActions';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { ReferralCampaignKey } from '../../lib/referral';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import type { PublicProfile } from '../../lib/user';
import type { ShareProvider } from '../../lib/share';

export interface ProfileShareButtonProps {
  user: PublicProfile;
  isSameUser?: boolean;
  buttonSize?: ButtonSize;
  buttonVariant?: ButtonVariant;
  className?: string;
}

/**
 * Copy/share control for a profile. Wraps the shared `ShareActions` primitive
 * so every profile surface ships the same share text, referral campaign and
 * analytics payload.
 */
export function ProfileShareButton({
  user,
  isSameUser,
  buttonSize = ButtonSize.Medium,
  buttonVariant = ButtonVariant.Float,
  className,
}: ProfileShareButtonProps): ReactElement {
  const { logEvent } = useLogContext();
  const text = isSameUser
    ? 'Check out my profile on daily.dev'
    : `Check out ${user.name}'s profile on daily.dev`;
  const label = isSameUser
    ? 'Share your profile'
    : `Share @${user.username}'s profile`;

  const onShare = (provider: ShareProvider) =>
    logEvent({
      event_name: LogEvent.ShareProfile,
      target_id: user.id,
      target_type: TargetType.ProfilePage,
      extra: JSON.stringify({ provider, origin: Origin.Profile }),
    });

  return (
    <ShareActions
      link={user.permalink}
      text={text}
      cid={ReferralCampaignKey.ShareProfile}
      buttonSize={buttonSize}
      buttonVariant={buttonVariant}
      label={label}
      emailTitle={text}
      className={className}
      onShare={onShare}
    />
  );
}
