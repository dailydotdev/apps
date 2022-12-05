import React, { ReactElement } from 'react';
import {
  NotificationAvatar,
  NotificationAvatarType,
} from '../../graphql/notifications';
import SourceButton from '../cards/SourceButton';
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
    return <ProfilePicture user={{ image, id: referenceId }} />;
  }

  return null;
}

export default NotificationItemAvatar;
