import React, { forwardRef, ReactElement, ReactNode, Ref } from 'react';
import { Image } from '../image/Image';
import { ProfilePicture, ProfilePictureProps } from '../ProfilePicture';

export type HeroImageProps = ProfilePictureProps['user'] & {
  cover: string;
  children?: ReactNode;
};

function HeroImageComponent(
  { children, cover, ...profile }: HeroImageProps,
  ref: Ref<HTMLDivElement>,
): ReactElement {
  return (
    <div className="relative mx-4 flex h-24" ref={ref}>
      {cover ? (
        <Image
          src={cover}
          alt="cover"
          loading="eager"
          className="absolute left-0 top-0 -z-1 h-full w-full rounded-26 object-cover"
        />
      ) : (
        <div className="absolute left-0 top-0 -z-1 h-full w-full rounded-26 bg-theme-bg-secondary" />
      )}
      <ProfilePicture
        user={profile}
        nativeLazyLoading
        eager
        size="xxxxlarge"
        className="border-4 border-theme-bg-primary"
      />
      {children}
    </div>
  );
}

export const HeroImage = forwardRef(HeroImageComponent);
