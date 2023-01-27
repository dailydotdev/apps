import React, { ReactElement } from 'react';
import {
  NotificationAvatar,
  NotificationAvatarType,
} from '../../graphql/notifications';
import { ProfileImageLink } from '../profile/ProfileImageLink';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfilePicture } from '../ProfilePicture';
import { LinkWithTooltip } from '../tooltips/LinkWithTooltip';

function NotificationItemAvatar({
  type,
  image,
  name,
  targetUrl,
  referenceId,
}: NotificationAvatar): ReactElement {
  if (type === NotificationAvatarType.Source) {
    return (
      <LinkWithTooltip
        href={targetUrl}
        prefetch={false}
        tooltip={{ content: name, placement: 'bottom' }}
      >
        <ProfileImageLink
          picture={{ size: 'medium', rounded: 'full' }}
          user={{
            id: referenceId,
            name,
            image,
            permalink: targetUrl,
            username: referenceId,
          }}
        />
      </LinkWithTooltip>
    );
  }

  if (type === NotificationAvatarType.User) {
    return (
      <ProfileTooltip link={{ href: targetUrl }} user={{ id: referenceId }}>
        <ProfilePicture
          user={{ image, id: referenceId }}
          nativeLazyLoading
          size="medium"
        />
      </ProfileTooltip>
    );
  }

  return null;
}

export default NotificationItemAvatar;
