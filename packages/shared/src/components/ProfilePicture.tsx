import React, { ReactElement } from 'react';
import { LazyImage } from './LazyImage';
import { LoggedUser } from '../lib/user';

export interface ProfilePictureProps {
  user: Pick<LoggedUser, 'image' | 'username'>;
  size?:
    | 'xsmall'
    | 'small'
    | 'medium'
    | 'large'
    | 'xlarge'
    | 'xxlarge'
    | 'xxxlarge';
  extraClasses?: string;
}

const sizeClasses = {
  xsmall: 'w-5 h-5 rounded-6',
  small: 'w-6 h-6 rounded-8',
  medium: 'w-8 h-8 rounded-10',
  large: 'w-10 h-10 rounded-12',
  xlarge: 'w-12 h-12 rounded-14',
  xxlarge: 'w-14 h-14 rounded-16',
  xxxlarge: 'w-24 h-24 rounded-26',
};

export function ProfilePicture({
  user,
  size = 'xlarge',
  extraClasses,
}: ProfilePictureProps): ReactElement {
  return (
    <LazyImage
      imgSrc={user.image}
      imgAlt={`${user.username} profile picture`}
      className={`${sizeClasses[size]} ${extraClasses}`}
    />
  );
}
