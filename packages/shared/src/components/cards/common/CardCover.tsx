import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import { CardImage } from '../Card';
import { CommonCardCoverProps } from '../common';
import { useCardCover } from '../../../hooks/feed/useCardCover';

interface CardCoverProps extends CommonCardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  isVideoType?: boolean;
}

export function CardCover({
  imageProps,
  videoProps,
  isVideoType,
  onShare,
  post,
}: CardCoverProps): ReactElement {
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

  return (
    <div className="pointer-events-none relative flex flex-1">
      {overlay}
      <CardImage
        {...imageProps}
        type={ImageType.Post}
        className={imageClasses}
      />
    </div>
  );
}
