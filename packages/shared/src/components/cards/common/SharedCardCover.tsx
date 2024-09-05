import classNames from 'classnames';
import React, { ReactElement, ReactNode } from 'react';

import { useCardCover } from '../../../hooks/feed/useCardCover';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import { CardImage } from '../Card';
import { CommonCardCoverProps } from '../common';

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
}

export function SharedCardCover({
  imageProps,
  videoProps,
  isVideoType,
  onShare,
  post,
  renderOverlay,
  CardImageComponent,
}: SharedCardCoverProps): ReactElement {
  const { overlay } = useCardCover({ post, onShare });
  const imageClasses = classNames(
    imageProps?.className,
    !!overlay && 'opacity-16',
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
