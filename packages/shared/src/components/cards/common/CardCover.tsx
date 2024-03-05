import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ImageProps, ImageType } from '../../image/Image';
import VideoImage, { VideoImageProps } from '../../image/VideoImage';
import ConditionalWrapper from '../../ConditionalWrapper';
import { CardImage } from '../Card';
import { CardCoverShare } from './CardCoverShare';
import { CommonCardCoverProps } from '../common';
import {
  upvoteMutationKey,
  useMutationSubscription,
  UseVotePostMutationProps,
} from '../../../hooks';
import { useActiveFeedNameContext } from '../../../contexts';
import { useFeatureIsOn } from '../../GrowthBookProvider';
import { feature } from '../../../lib/featureManagement';

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
  const { feedName } = useActiveFeedNameContext();
  const [justUpvoted, setJustUpvoted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const shareLoopsEnabled = useFeatureIsOn(feature.shareLoops);

  useMutationSubscription({
    matcher: ({ status, mutation }) => {
      const key = [...upvoteMutationKey, { feedName }];

      return (
        status === 'success' &&
        mutation?.options?.mutationKey?.toString() === key.toString()
      );
    },
    callback: ({ variables }) => {
      const vars = variables as UseVotePostMutationProps;

      if (vars.id !== post.id || !shareLoopsEnabled) {
        return;
      }

      setJustUpvoted(!!vars.vote);
    },
  });

  if (!shareLoopsEnabled) {
    return null;
  }

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
  const imageClasses = classNames(
    imageProps?.className,
    shouldShowOverlay && 'opacity-16',
  );

  if (isVideoType) {
    return (
      <VideoImage
        {...videoProps}
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
        <div className="relative">
          {coverShare}
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
