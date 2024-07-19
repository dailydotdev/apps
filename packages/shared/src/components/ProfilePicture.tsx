import React, { forwardRef, ReactElement, ReactEventHandler, Ref } from 'react';
import classNames from 'classnames';
import { LazyImage, LazyImageProps } from './LazyImage';
import { PublicProfile } from '../lib/user';
import { fallbackImages } from '../lib/config';
import { Image, ImageType } from './image/Image';
import { useRequestProtocol } from '../hooks/useRequestProtocol';

export enum ProfileImageSize {
  Size16 = 'size16',
  XXXXLarge = 'xxxxlarge',
  XXXLarge = 'xxxlarge',
  XXLarge = 'xxlarge',
  XLarge = 'xlarge',
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
  XSmall = 'xsmall',
}

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
  fallbackSrc?: string;
}

export const sizeClasses: Record<ProfileImageSize, string> = {
  size16: 'size-4',
  xsmall: 'w-5 h-5',
  small: 'w-6 h-6',
  medium: 'w-8 h-8',
  large: 'w-10 h-10',
  xlarge: 'w-12 h-12',
  xxlarge: 'w-14 h-14',
  xxxlarge: 'w-16 h-16',
  xxxxlarge: 'w-24 h-24',
};
const roundClasses: Record<ProfileImageSize | 'full', string> = {
  size16: 'rounded-4',
  xsmall: 'rounded-6',
  small: 'rounded-8',
  medium: 'rounded-10',
  large: 'rounded-12',
  xlarge: 'rounded-14',
  xxlarge: 'rounded-16',
  xxxlarge: 'rounded-18',
  xxxxlarge: 'rounded-26',
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
    size = ProfileImageSize.XLarge,
    rounded = size,
    className,
    nativeLazyLoading,
    eager,
    fallbackSrc,
    ...props
  }: ProfilePictureProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement {
  const { isCompanion } = useRequestProtocol();
  const classes = classNames(
    getProfilePictureClasses(size, rounded),
    className,
  );

  if (!user) {
    return null;
  }

  if (nativeLazyLoading) {
    return (
      <Image
        {...props}
        ref={ref}
        src={user.image}
        alt={`${user.username || user.id}'s profile`}
        onError={onError}
        className={classes}
        loading={eager || isCompanion ? 'eager' : 'lazy'}
        type={ImageType.Avatar}
        fallbackSrc={fallbackSrc}
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
      fallbackSrc={fallbackSrc ?? fallbackImages.avatar}
    />
  );
}

const ProfilePicture = forwardRef(ProfilePictureComponent);
export { ProfilePicture };
