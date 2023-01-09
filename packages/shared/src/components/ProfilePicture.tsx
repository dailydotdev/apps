import React, { forwardRef, ReactElement, ReactEventHandler, Ref } from 'react';
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
type UserImageProps = Pick<PublicProfile, 'image'> &
  Partial<Pick<PublicProfile, 'id' | 'username'>>;

export interface ProfilePictureProps
  extends Omit<LazyImageProps, 'imgSrc' | 'imgAlt'> {
  user: UserImageProps;
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

export const getProfilePictureClasses = (
  size: ProfileImageSize,
  roundSize?: ProfileImageRoundSize,
): string =>
  classNames(
    'object-cover',
    sizeClasses[size],
    roundClasses[roundSize ?? size],
  );

let onError: ReactEventHandler<HTMLImageElement> = (e) => {
  const target = e.target as HTMLImageElement;
  target.onerror = null;
  target.src = fallbackImages.avatar;
};

export function setOnError(
  newOnError: ReactEventHandler<HTMLImageElement>,
): void {
  onError = newOnError;
}

function ProfilePictureComponent(
  {
    user,
    size = 'xlarge',
    rounded = size,
    className,
    nativeLazyLoading,
    ...props
  }: ProfilePictureProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement {
  const classes = classNames(
    getProfilePictureClasses(size, rounded),
    className,
  );

  if (nativeLazyLoading) {
    return (
      <img
        {...props}
        ref={ref}
        src={user.image}
        alt={`${user.username || user.id}'s profile`}
        onError={onError}
        className={classes}
        loading="lazy"
      />
    );
  }

  return (
    <LazyImage
      {...props}
      ref={ref}
      imgSrc={user.image}
      imgAlt={`${user.username || user.id}'s profile`}
      className={classes}
      fallbackSrc={fallbackImages.avatar}
    />
  );
}

export const ProfilePicture = forwardRef(ProfilePictureComponent);
