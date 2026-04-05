import type { CSSProperties, ReactElement } from 'react';
import React from 'react';
import PostLoadingSkeleton from '../../post/PostLoadingSkeleton';
import type { PostModalRenderConfig } from '../getPostModalRenderConfig';
import type { PostType } from '../../../graphql/posts';
import { PostPosition } from '../../../hooks/usePostModalNavigation';

export const getHighlightPostPosition = (
  activeIndex: number,
  highlightsLength: number,
): PostPosition => {
  if (highlightsLength <= 1) {
    return PostPosition.Only;
  }

  if (activeIndex <= 0) {
    return PostPosition.First;
  }

  if (activeIndex >= highlightsLength - 1) {
    return PostPosition.Last;
  }

  return PostPosition.Middle;
};

export const buildHighlightPostPane = (
  paneConfig: PostModalRenderConfig | null,
  panePostType: PostType,
): ReactElement => {
  if (!paneConfig) {
    return (
      <div className="w-full">
        <PostLoadingSkeleton
          hasNavigation
          type={panePostType}
          className="!pb-2 tablet:pb-0"
        />
      </div>
    );
  }

  return <div className="w-full">{paneConfig.content}</div>;
};

export const getHighlightMobileTrackStyle = ({
  isSwipeDragging,
  isSwipeTransitioning,
  swipeCommitDurationMs,
  swipeOffsetX,
}: {
  isSwipeDragging: boolean;
  isSwipeTransitioning: boolean;
  swipeCommitDurationMs: number;
  swipeOffsetX: number;
}): CSSProperties => {
  let transition = 'none';

  if (isSwipeTransitioning) {
    transition = `transform ${swipeCommitDurationMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
  }

  if (isSwipeDragging) {
    transition = 'none';
  }

  return {
    transform: `translateX(calc(-33.333333% + ${swipeOffsetX}px))`,
    transition,
    willChange: 'transform',
  };
};

export const highlightMobilePaneStyle: CSSProperties = {
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
};
