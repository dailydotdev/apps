import React, { ReactElement } from 'react';
import { ImageProps, ImageType } from '../../image/Image';
import { VideoImageProps } from '../../image/VideoImage';
import ConditionalWrapper from '../../ConditionalWrapper';
import { CardImage, CardVideoImage } from '../Card';
import { CardCoverShare } from './CardCoverShare';
import { Post } from '../../../graphql/posts';

export interface CommonCardCoverProps {
  post?: Post;
  justUpvoted?: boolean;
  onShare?: (post: Post) => unknown;
}

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
  const coverShare = (
    <CardCoverShare post={post} onShare={() => onShare(post)} />
  );

  if (isVideoType) {
    return (
      <CardVideoImage
        {...videoProps}
        imageProps={imageProps}
        overlay={justUpvoted ? coverShare : undefined}
      />
    );
  }

  return (
    <ConditionalWrapper
      condition={justUpvoted}
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
