import React, {
  forwardRef,
  ImgHTMLAttributes,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import { cloudinary } from '../../lib/image';
import { fallbackImages } from '../../lib/config';

export enum ImageType {
  Post = 'post',
  Avatar = 'avatar',
  Squad = 'squad',
}

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  type?: ImageType;
}

const fallbackSrcByType: Record<ImageType, string> = {
  post: cloudinary.post.imageCoverPlaceholder,
  avatar: fallbackImages.avatar,
  squad: cloudinary.squads.imageFallback,
};

const ImageComponent = (
  { fallbackSrc, src, alt, ...props }: ImageProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement => {
  const finalFallbackSrc =
    fallbackSrc ?? fallbackSrcByType[props.type ?? ImageType.Post];

  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (finalFallbackSrc && finalFallbackSrc !== event.currentTarget.src) {
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = finalFallbackSrc;
    }
  };

  return (
    <img
      {...props}
      ref={ref}
      alt={alt}
      src={src ?? finalFallbackSrc}
      onError={onError}
    />
  );
};

export const Image = forwardRef(ImageComponent);
