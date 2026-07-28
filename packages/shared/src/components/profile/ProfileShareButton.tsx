import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { LinkIcon, VIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { useShareOrCopyLink } from '../../hooks/useShareOrCopyLink';
import { ReferralCampaignKey } from '../../lib/referral';
import { LogEvent, Origin, TargetType } from '../../lib/log';
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
 * Copy-link control for a profile. One click copies the (shortened, referral-
 * tagged) profile URL and confirms twice over — the glyph flips to a green
 * check for a beat and a toast names what was copied. No share menu: picking a
 * network is a second decision, and the link on the clipboard covers every
 * destination. Mobile still gets the native share sheet where the platform
 * offers one.
 */
export function ProfileShareButton({
  user,
  isSameUser,
  buttonSize = ButtonSize.Small,
  buttonVariant = ButtonVariant.Subtle,
  className,
}: ProfileShareButtonProps): ReactElement {
  const text = isSameUser
    ? 'Check out my profile on daily.dev'
    : `Check out ${user.name}'s profile on daily.dev`;
  const label = isSameUser
    ? 'Copy link to your profile'
    : `Copy link to @${user.username}'s profile`;

  const [copying, shareOrCopy] = useShareOrCopyLink({
    link: user.permalink,
    text,
    cid: ReferralCampaignKey.ShareProfile,
    copyMessage: isSameUser
      ? '✅ Copied link to your profile'
      : `✅ Copied link to @${user.username}'s profile`,
    logObject: (provider: ShareProvider) => ({
      event_name: LogEvent.ShareProfile,
      target_id: user.id,
      target_type: TargetType.ProfilePage,
      extra: JSON.stringify({ provider, origin: Origin.Profile }),
    }),
  });

  return (
    <Tooltip content={label}>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        icon={
          copying ? <VIcon className="text-status-success" /> : <LinkIcon />
        }
        aria-label={label}
        className={className}
        onClick={() => shareOrCopy()}
      />
    </Tooltip>
  );
}
