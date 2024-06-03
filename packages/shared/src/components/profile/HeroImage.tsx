import React, { forwardRef, ReactElement, ReactNode, Ref } from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';
import {
  ProfileImageSize,
  ProfilePicture,
  ProfilePictureProps,
} from '../ProfilePicture';

export type HeroImageProps = ProfilePictureProps['user'] & {
  cover: string;
  children?: ReactNode;
  className?: {
    container?: string;
    cover?: string;
    profile?: string;
  };
};

function HeroImageComponent(
  { children, cover, className, ...profile }: HeroImageProps,
  ref: Ref<HTMLDivElement>,
): ReactElement {
  return (
    <div
      className={classNames('relative flex h-24', className?.container)}
      ref={ref}
    >
      {cover ? (
        <Image
          src={cover}
          alt="cover"
          loading="eager"
          className={classNames(
            'absolute left-0 top-0 -z-1 size-full rounded-26 object-cover',
            className?.cover,
          )}
        />
      ) : (
        <div
          className={classNames(
            'absolute left-0 top-0 -z-1 size-full rounded-26 bg-background-subtle',
            className?.cover,
          )}
        />
      )}
      <ProfilePicture
        user={profile}
        nativeLazyLoading
        eager
        size={ProfileImageSize.XXXXLarge}
        className={classNames(
          'border-4 border-background-default',
          className?.profile,
        )}
      />
      {children}
    </div>
  );
}

export const HeroImage = forwardRef(HeroImageComponent);
