import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { CommonCardCoverProps } from './common';
import type { ImageProps } from '../../image/Image';
import { ImageType } from '../../image/Image';
import type { VideoImageProps } from '../../image/VideoImage';
import VideoImage from '../../image/VideoImage';
import type { UseCardCoverProps } from '../../../hooks/feed/useCardCover';
import { useCardCover } from '../../../hooks/feed/useCardCover';
import { CardImage } from './Card';

interface RenderProps {
  overlay: ReactNode;
  image: ReactNode;
}

export type ReusedCardCoverProps = Omit<
  SharedCardCoverProps,
  'renderOverlay' | 'CardImageComponent'
>;

export interface SharedCardCoverProps extends CommonCardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  isVideoType?: boolean;
  CardImageComponent: typeof CardImage;
  renderOverlay: (props: RenderProps) => ReactNode;
  coverClassName?: UseCardCoverProps['className'];
}

export function SharedCardCover({
  imageProps,
  videoProps,
  isVideoType,
  onShare,
  post,
  renderOverlay,
  CardImageComponent,
  coverClassName,
}: SharedCardCoverProps): ReactElement {
  const { overlay, shouldDimImage } = useCardCover({
    post,
    onShare,
    className: coverClassName,
  });
  const imageClasses = classNames(
    imageProps?.className,
    shouldDimImage && 'opacity-16',
  );

  if (isVideoType) {
    return (
      <VideoImage
        {...videoProps}
        CardImageComponent={CardImageComponent}
        overlay={overlay}
        imageProps={{
          ...imageProps,
          className: imageClasses,
        }}
      />
    );
  }

  const view = renderOverlay({
    overlay,
    image: (
      <CardImage
        {...imageProps}
        type={ImageType.Post}
        className={imageClasses}
      />
    ),
  });

  return <>{view}</>;
}
