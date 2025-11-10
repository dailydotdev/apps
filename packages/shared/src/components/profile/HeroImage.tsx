import type { ReactElement, ReactNode, Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import { Image } from '../image/Image';
import type { ProfilePictureProps } from '../ProfilePicture';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';

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
            '-z-1 rounded-26 absolute left-0 top-0 size-full object-cover',
            className?.cover,
          )}
        />
      ) : (
        <div
          className={classNames(
            '-z-1 rounded-26 bg-background-subtle absolute left-0 top-0 size-full',
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
          'border-background-default border-4',
          className?.profile,
        )}
      />
      {children}
    </div>
  );
}

export const HeroImage = forwardRef(HeroImageComponent);
