import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { CommonCardCoverProps } from '../common';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import { CardImage } from '../list/ListCard';
import { useCardCover } from '../../../hooks/feed/useCardCover';

interface RenderProps {
  overlay: ReactNode;
  image: ReactNode;
}

export interface SharedCardCoverProps extends CommonCardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  isVideoType?: boolean;
  renderOverlay: (props: RenderProps) => ReactNode;
}

export function SharedCardCover({
  imageProps,
  videoProps,
  isVideoType,
  onShare,
  post,
  renderOverlay,
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
        CardImageComponent={CardImage}
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
