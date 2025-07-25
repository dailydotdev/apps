import type { ReactElement } from 'react';
import React from 'react';
import type { NotificationAvatar } from '../../graphql/notifications';
import { NotificationAvatarType } from '../../graphql/notifications';
import SourceButton from '../cards/common/SourceButton';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileImageSize } from '../ProfilePicture';
import { BriefGradientIcon, MedalBadgeIcon } from '../icons';
import { IconSize } from '../Icon';
import { BadgeIconGoldGradient } from '../badges/BadgeIcon';
import { Image, ImageType } from '../image/Image';

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
        pureTextTooltip
        tooltipPosition="bottom"
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

  if (type === NotificationAvatarType.Organization) {
    return (
      <Image
        className="size-8 rounded-full object-cover"
        src={image}
        alt={`Avatar of ${name}`}
        type={ImageType.Organization}
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

  if (type === NotificationAvatarType.Brief) {
    return (
      <span className="rounded-8 bg-surface-float p-1">
        <BriefGradientIcon secondary size={IconSize.Small} />
      </span>
    );
  }

  return null;
}

export default NotificationItemAvatar;
