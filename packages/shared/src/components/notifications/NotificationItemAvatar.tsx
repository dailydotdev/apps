import React, { ReactElement } from 'react';
import SourceButton from '../cards/SourceButton';
import { ProfilePicture } from '../ProfilePicture';

export enum NotificationAvatarType {
  User = 'user',
  Source = 'source',
}

export interface NotificationItemAvatarProps {
  type: NotificationAvatarType;
  image: string;
  name: string;
  targetUrl: string;
  referenceId: string;
}

function NotificationItemAvatar({
  type,
  image,
  name,
  referenceId,
}: NotificationItemAvatarProps): ReactElement {
  if (type === NotificationAvatarType.Source) {
    return <SourceButton source={{ id: referenceId, name, image }} />;
  }

  return <ProfilePicture user={{ image, id: referenceId }} />;
}

export default NotificationItemAvatar;
