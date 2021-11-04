import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { LazyImage } from './LazyImage';
import { LoggedUser } from '../lib/user';
import { fallbackImages } from '../lib/config';

export interface ProfilePictureProps {
  user: Pick<LoggedUser, 'image' | 'name'>;
  size?:
    | 'xsmall'
    | 'small'
    | 'medium'
    | 'large'
    | 'xlarge'
    | 'xxlarge'
    | 'xxxlarge';
  className?: string;
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
  className,
}: ProfilePictureProps): ReactElement {
  return (
    <LazyImage
      imgSrc={user.image}
      imgAlt={`${user.name}'s profile`}
      className={classNames(sizeClasses[size], className)}
      fallbackSrc={fallbackImages.avatar}
    />
  );
}
