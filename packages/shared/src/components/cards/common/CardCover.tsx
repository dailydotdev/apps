import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import { CardImage } from '../Card';
import { CardImage as CardImageV1 } from '../v1/Card';
import { CardCoverShare } from './CardCoverShare';
import { CommonCardCoverProps } from '../common';
import { usePostShareLoop } from '../../../hooks/post/usePostShareLoop';
import { useFeedLayout } from '../../../hooks';

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
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const ImageComponent = shouldUseMobileFeedLayout ? CardImageV1 : CardImage;
  const { shouldShowOverlay, onInteract } = usePostShareLoop(post);
  const coverShare = (
    <CardCoverShare
      post={post}
      onShare={() => {
        onInteract();
        onShare(post);
      }}
      onCopy={onInteract}
    />
  );
  const imageClasses = classNames(
    imageProps?.className,
    shouldShowOverlay && 'opacity-16',
  );

  if (isVideoType) {
    return (
      <VideoImage
        {...videoProps}
        CardImageComponent={ImageComponent}
        overlay={shouldShowOverlay ? coverShare : undefined}
        imageProps={{
          ...imageProps,
          className: imageClasses,
        }}
      />
    );
  }

  return (
    <div className="relative flex flex-1">
      {shouldShowOverlay && coverShare}
      <ImageComponent
        {...imageProps}
        type={ImageType.Post}
        className={imageClasses}
      />
    </div>
  );
}
