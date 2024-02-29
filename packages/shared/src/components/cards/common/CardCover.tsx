import React, { ReactElement, useState } from 'react';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import ConditionalWrapper from '../../ConditionalWrapper';
import { CardImage } from '../Card';
import { CardCoverShare } from './CardCoverShare';
import { CommonCardCoverProps } from '../common';

interface CardCoverProps extends CommonCardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  isVideoType?: boolean;
}

export function CardCover({
  imageProps,
  videoProps,
  justUpvoted,
  isVideoType,
  onShare,
  post,
}: CardCoverProps): ReactElement {
  const [hasInteracted, setHasInteracted] = useState(false);
  const shouldShowOverlay = justUpvoted && !hasInteracted;
  const coverShare = (
    <CardCoverShare
      post={post}
      onShare={() => {
        setHasInteracted(true);
        onShare(post);
      }}
      onCopy={() => setHasInteracted(true)}
    />
  );

  if (isVideoType) {
    return (
      <VideoImage
        {...videoProps}
        imageProps={imageProps}
        overlay={shouldShowOverlay ? coverShare : undefined}
      />
    );
  }

  return (
    <ConditionalWrapper
      condition={shouldShowOverlay}
      wrapper={(component) => (
        <div className="relative">
          {coverShare}
          {component}
        </div>
      )}
    >
      <CardImage {...imageProps} type={ImageType.Post} />
    </ConditionalWrapper>
  );
}
