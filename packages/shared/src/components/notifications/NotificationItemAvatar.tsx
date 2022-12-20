import React, { ReactElement } from 'react';
import {
  NotificationAvatar,
  NotificationAvatarType,
} from '../../graphql/notifications';
import { webappUrl } from '../../lib/constants';
import SourceButton from '../cards/SourceButton';
import { ProfileTooltip } from '../profile/ProfileTooltip';
import { ProfilePicture } from '../ProfilePicture';

function NotificationItemAvatar({
  type,
  image,
  name,
  referenceId,
}: NotificationAvatar): ReactElement {
  if (type === NotificationAvatarType.Source) {
    return <SourceButton source={{ id: referenceId, name, image }} />;
  }

  if (type === NotificationAvatarType.User) {
    return (
      <ProfileTooltip
        link={{ href: `${webappUrl}/${referenceId}` }}
        user={{ id: referenceId }}
      >
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
