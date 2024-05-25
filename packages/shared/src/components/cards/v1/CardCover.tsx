import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import ConditionalWrapper from '../../ConditionalWrapper';
import { CardImage as CardImageV1 } from './Card';
import { CommonCardCoverProps } from '../common';
import { usePostShareLoop } from '../../../hooks/post/usePostShareLoop';
import { CardCoverShare } from '../common/CardCoverShare';

interface CardCoverProps extends CommonCardCoverProps {
  imageProps: ImageProps;
  videoProps?: Omit<VideoImageProps, 'imageProps'>;
  isVideoType?: boolean;
}

export function CardCoverV1({
  imageProps,
  videoProps,
  isVideoType,
  onShare,
  post,
}: CardCoverProps): ReactElement {
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
        CardImageComponent={CardImageV1}
        overlay={shouldShowOverlay ? coverShare : undefined}
        imageProps={{
          ...imageProps,
          className: imageClasses,
        }}
      />
    );
  }

  return (
    <ConditionalWrapper
      condition={shouldShowOverlay}
      wrapper={(component) => (
        <div className="relative flex">
          {coverShare}
          {component}
        </div>
      )}
    >
      <CardImageV1
        {...imageProps}
        type={ImageType.Post}
        className={imageClasses}
      />
    </ConditionalWrapper>
  );
}
