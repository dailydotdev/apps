import React, { ReactElement } from 'react';
import {
  NotificationAvatar,
  NotificationAvatarType,
} from '../../graphql/notifications';
import SourceButton from '../cards/common/SourceButton';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileImageSize } from '../ProfilePicture';
import { MedalBadgeIcon } from '../icons/MedalBadge';
import { IconSize } from '../Icon';
import { BadgeIconGoldGradient } from '../badges/BadgeIcon';

function NotificationItemAvatar({
  type,
  image,
  name,
  targetUrl,
  referenceId,
  className,
}: NotificationAvatar): ReactElement {
  if (type === NotificationAvatarType.Source) {
    return (
      <SourceButton
        className={className}
        source={{
          id: referenceId,
          handle: referenceId,
          name,
          image,
          permalink: targetUrl,
        }}
      />
    );
  }

  if (type === NotificationAvatarType.User) {
    return (
      <ProfileTooltip link={{ href: targetUrl }} userId={referenceId}>
        <ProfileImageLink
          className={className}
          picture={{ size: ProfileImageSize.Medium }}
          user={{
            id: referenceId,
            username: referenceId,
            image,
            permalink: targetUrl,
          }}
        />
      </ProfileTooltip>
    );
  }

  if (type === NotificationAvatarType.TopReaderBadge) {
    return (
      <span className="rounded-8 bg-surface-float p-1">
        <MedalBadgeIcon
          secondary
          size={IconSize.Small}
          fill="url(#goldGradient)"
        />
        <BadgeIconGoldGradient />
      </span>
    );
  }

  return null;
}

export default NotificationItemAvatar;
