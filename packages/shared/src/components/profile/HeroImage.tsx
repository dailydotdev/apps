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
    <div className="flex relative m-4 h-24" ref={ref}>
      <Image
        src={cover}
        alt="cover"
        loading="eager"
        className="object-cover absolute top-0 left-0 -z-1 w-full h-full rounded-26"
      />
      <ProfilePicture
        user={profile}
        nativeLazyLoading
        eager
        size="xxxxlarge"
        className="border-2 border-theme-bg-primary"
      />
      {children}
    </div>
  );
}

export const HeroImage = forwardRef(HeroImageComponent);
