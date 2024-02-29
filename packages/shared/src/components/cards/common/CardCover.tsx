import React, { ReactElement } from 'react';
import { ImageProps, ImageType } from '../../image/Image';
import { VideoImageProps } from '../../image/VideoImage';
import ConditionalWrapper from '../../ConditionalWrapper';
import { CardImage, CardVideoImage } from '../Card';
import { CardCoverShare } from './CardCoverShare';

interface CardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  justUpvoted?: boolean;
  isVideoType?: boolean;
}

export function CardCover({
  imageProps,
  videoProps,
  justUpvoted,
  isVideoType,
}: CardCoverProps): ReactElement {
  if (isVideoType) {
    return (
      <CardVideoImage
        {...videoProps}
        imageProps={imageProps}
        overlay={justUpvoted ? CardCoverShare : undefined}
      />
    );
  }

  return (
    <ConditionalWrapper
      condition={justUpvoted}
      wrapper={(component) => (
        <div className="relative">
          <CardCoverShare className="absolute inset-0 bg-theme-highlight-blur" />
          {component}
        </div>
      )}
    >
      <CardImage {...imageProps} type={ImageType.Post} />
    </ConditionalWrapper>
  );
}
