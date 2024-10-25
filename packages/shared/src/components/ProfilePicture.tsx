import React, {
  forwardRef,
  ReactElement,
  ReactEventHandler,
  Ref,
  useMemo,
} from 'react';
import classNames from 'classnames';
import { LazyImage, LazyImageProps } from './LazyImage';
import { PublicProfile } from '../lib/user';
import { fallbackImages } from '../lib/config';
import { Image, ImageType } from './image/Image';
import { useRequestProtocol } from '../hooks/useRequestProtocol';
import { SocialProvider } from './auth/common';
import { setQueryParams } from '../lib';

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
  Partial<Pick<PublicProfile, 'id' | 'username' | 'name'>>;

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
export const roundClasses: Record<ProfileImageSize | 'full', string> = {
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

const resizeSrcReplaceRule: Record<string, (src: string) => string> = {
  [SocialProvider.Google]: (src) => src.replace(/s96-c$/, 's64-c'),
  [SocialProvider.GitHub]: (src) => setQueryParams(src, { s: '64' }),
};

const getSocialProviderFromSrc = (src: string): SocialProvider | null => {
  if (src.includes('googleusercontent.')) {
    return SocialProvider.Google;
  }

  if (src.includes('githubusercontent.')) {
    return SocialProvider.GitHub;
  }

  return null;
};

const getResizedSrc = (src: string) => {
  const provider = getSocialProviderFromSrc(src);
  if (!provider) {
    return src;
  }

  const getReplacedSrc = resizeSrcReplaceRule[provider];
  return getReplacedSrc?.(src) ?? src;
};

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

  const imageSrc = useMemo(() => {
    if (!user) {
      return '';
    }

    const { image: src } = user;

    const isImageResizable =
      src &&
      [
        ProfileImageSize.XLarge,
        ProfileImageSize.Large,
        ProfileImageSize.Medium,
        ProfileImageSize.Small,
        ProfileImageSize.XSmall,
      ].includes(size);

    return isImageResizable ? getResizedSrc(src) : src;
  }, [user, size]);

  if (!user) {
    return null;
  }

  const imageAlt = `${user.username || user.name || user.id}'s profile`;

  if (nativeLazyLoading) {
    return (
      <Image
        {...props}
        ref={ref}
        alt={imageAlt}
        className={classes}
        fallbackSrc={fallbackSrc}
        loading={eager || isCompanion ? 'eager' : 'lazy'}
        onError={onError}
        src={imageSrc}
        type={ImageType.Avatar}
      />
    );
  }

  return (
    <LazyImage
      {...props}
      ref={ref}
      imgSrc={imageSrc}
      imgAlt={imageAlt}
      className={classes}
      fallbackSrc={fallbackSrc ?? fallbackImages.avatar}
      role="presentation"
    />
  );
}

const ProfilePicture = forwardRef(ProfilePictureComponent);
export { ProfilePicture };
