import React, {
  ComponentPropsWithoutRef,
  forwardRef,
  ReactElement,
  Ref,
  SyntheticEvent,
} from 'react';
import {
  cloudinaryPostImageCoverPlaceholder,
  cloudinarySquadsImageFallback,
} from '../../lib/image';
import { fallbackImages } from '../../lib/config';

export enum ImageType {
  Post = 'post',
  Avatar = 'avatar',
  Squad = 'squad',
}

export interface ImageProps extends ComponentPropsWithoutRef<'img'> {
  fallbackSrc?: string;
  type?: ImageType;
}

const fallbackSrcByType: Record<ImageType, string> = {
  post: cloudinaryPostImageCoverPlaceholder,
  avatar: fallbackImages.avatar,
  squad: cloudinarySquadsImageFallback,
};

export const HIGH_PRIORITY_IMAGE_PROPS: Pick<
  ImageProps,
  'fetchPriority' | 'loading'
> = {
  fetchPriority: 'high',
  loading: 'eager',
};

const ImageComponent = (
  { fallbackSrc, src, alt, fetchPriority = 'auto', ...props }: ImageProps,
  ref?: Ref<HTMLImageElement>,
): ReactElement => {
  const finalFallbackSrc =
    fallbackSrc ?? fallbackSrcByType[props.type ?? ImageType.Post];

  const onError = (event: SyntheticEvent<HTMLImageElement>): void => {
    if (finalFallbackSrc && finalFallbackSrc !== event.currentTarget.src) {
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.src = finalFallbackSrc;
      if (event.currentTarget.srcset) {
        // eslint-disable-next-line no-param-reassign
        event.currentTarget.srcset = finalFallbackSrc;
      }
    }
  };

  return (
    <img
      {...props}
      /* @ts-expect-error - Not supported by react yet */ /* eslint-disable react/no-unknown-property */
      fetchpriority={fetchPriority}
      ref={ref}
      alt={alt}
      src={src ?? finalFallbackSrc}
      onError={onError}
    />
  );
};

export const Image = forwardRef(ImageComponent);
