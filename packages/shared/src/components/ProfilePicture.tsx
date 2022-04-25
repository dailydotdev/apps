import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { LazyImage, LazyImageProps } from './LazyImage';
import { PublicProfile } from '../lib/user';
import { fallbackImages } from '../lib/config';

export type ProfileImageSize =
  | 'xsmall'
  | 'small'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'xxlarge'
  | 'xxxlarge';

export interface ProfilePictureProps
  extends Omit<LazyImageProps, 'imgSrc' | 'imgAlt'> {
  user: Pick<PublicProfile, 'image' | 'username'>;
  size?: ProfileImageSize;
  className?: string;
  nativeLazyLoading?: boolean;
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
  nativeLazyLoading,
  ...props
}: ProfilePictureProps): ReactElement {
  if (nativeLazyLoading) {
    return (
      <img
        {...props}
        src={user.image}
        alt={`${user.username}'s profile`}
        className={classNames(sizeClasses[size], className)}
        loading="lazy"
      />
    );
  }

  return (
    <LazyImage
      {...props}
      imgSrc={user.image}
      imgAlt={`${user.username}'s profile`}
      className={classNames(sizeClasses[size], className)}
      fallbackSrc={fallbackImages.avatar}
    />
  );
}
