import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import ConditionalWrapper from '../../ConditionalWrapper';
import { CardImage } from './ListCard';
import { CommonCardCoverProps } from '../common';
import { useCardCover } from '../../../hooks/feed/useCardCover';

interface CardCoverProps extends CommonCardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  isVideoType?: boolean;
  className?: string;
}

export function CardCoverList({
  imageProps,
  videoProps,
  isVideoType,
  onShare,
  post,
  className,
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
    <ConditionalWrapper
      condition={!!overlay}
      wrapper={(component) => (
        <div className={classNames('relative flex', className)}>
          {overlay}
          {component}
        </div>
      )}
    >
      <CardImage
        {...imageProps}
        type={ImageType.Post}
        className={imageClasses}
      />
    </ConditionalWrapper>
  );
}
