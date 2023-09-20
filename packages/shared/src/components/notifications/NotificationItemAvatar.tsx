import React, { ReactElement } from 'react';
import {
  NotificationAvatar,
  NotificationAvatarType,
} from '../../graphql/notifications';
import SourceButton from '../cards/SourceButton';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfileImageLink } from '../profile/ProfileImageLink';

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
      <ProfileTooltip link={{ href: targetUrl }} user={{ id: referenceId }}>
        <ProfileImageLink
          className={className}
          picture={{ size: 'medium' }}
          user={{
            id: referenceId,
            username: name,
            image,
            permalink: targetUrl,
          }}
        />
      </ProfileTooltip>
    );
  }

  return null;
}

export default NotificationItemAvatar;
