import React, { forwardRef, ReactElement, Ref } from 'react';
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

type ProfileImageRoundSize = ProfileImageSize | 'full';

export interface ProfilePictureProps
  extends Omit<LazyImageProps, 'imgSrc' | 'imgAlt'> {
  user: Pick<PublicProfile, 'image' | 'username'>;
  size?: ProfileImageSize;
  rounded?: ProfileImageRoundSize;
  className?: string;
  nativeLazyLoading?: boolean;
}

const sizeClasses = {
  xsmall: 'w-5 h-5',
  small: 'w-6 h-6',
  medium: 'w-8 h-8',
  large: 'w-10 h-10',
  xlarge: 'w-12 h-12',
  xxlarge: 'w-14 h-14',
  xxxlarge: 'w-24 h-24',
};
const roundClasses = {
  xsmall: 'rounded-6',
  small: 'rounded-8',
  medium: 'rounded-10',
  large: 'rounded-12',
  xlarge: 'rounded-14',
  xxlarge: 'rounded-16',
  xxxlarge: 'rounded-26',
  full: 'rounded-full',
};

function ProfilePictureComponent(
  {
    user,
    size = 'xlarge',
    rounded,
    className,
    nativeLazyLoading,
    ...props
  }: ProfilePictureProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement {
  if (nativeLazyLoading) {
    return (
      <img
        {...props}
        ref={ref}
        src={user.image}
        alt={`${user.username}'s profile`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = fallbackImages.avatar_base;
        }}
        className={classNames(
          sizeClasses[size],
          roundClasses[rounded ?? size],
          className,
        )}
        loading="lazy"
      />
    );
  }

  return (
    <LazyImage
      {...props}
      ref={ref}
      imgSrc={user.image}
      imgAlt={`${user.username}'s profile`}
      className={classNames(sizeClasses[size], className)}
      fallbackSrc={fallbackImages.avatar}
    />
  );
}

export const ProfilePicture = forwardRef(ProfilePictureComponent);
