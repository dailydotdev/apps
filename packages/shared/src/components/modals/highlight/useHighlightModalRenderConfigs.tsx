import React, { useMemo } from 'react';
import type { CSSProperties, ReactElement } from 'react';
import PostLoadingSkeleton from '../../post/PostLoadingSkeleton';
import type { ModalProps } from '../common/Modal';
import type { PostModalRenderConfig } from '../getPostModalRenderConfig';
import { getPostModalRenderConfig } from '../getPostModalRenderConfig';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import {
  buildHighlightPostPane,
  getHighlightPostPosition,
} from './highlightPostModalUtils';
import type { PostPosition } from '../../../hooks/usePostModalNavigation';

interface UseHighlightModalRenderConfigsProps {
  activeIndex: number;
  highlightsLength: number;
  nextPost?: Post;
  onNextPost: () => void;
  onPreviousPost: () => void;
  onRequestClose?: ModalProps['onRequestClose'];
  position: CSSProperties['position'];
  postPosition: PostPosition;
  previousPost?: Post;
  resolvedPost?: Post | null;
}

const emptyPostModalConfig: Pick<
  PostModalRenderConfig,
  'loadingClassName' | 'postType' | 'size'
> = {
  postType: PostType.Article,
  loadingClassName: '!pb-2 tablet:pb-0',
  size: undefined,
};

export const useHighlightModalRenderConfigs = ({
  activeIndex,
  highlightsLength,
  nextPost,
  onNextPost,
  onPreviousPost,
  onRequestClose,
  position,
  postPosition,
  previousPost,
  resolvedPost,
}: UseHighlightModalRenderConfigsProps) => {
  const postModalConfig = useMemo(() => {
    if (!resolvedPost) {
      return {
        ...emptyPostModalConfig,
        content: null,
      };
    }

    return getPostModalRenderConfig({
      position,
      post: resolvedPost,
      postPosition,
      onPreviousPost,
      onNextPost,
      onRequestClose,
      hideSubscribeAction: true,
    });
  }, [
    onNextPost,
    onPreviousPost,
    onRequestClose,
    position,
    postPosition,
    resolvedPost,
  ]);

  const previousPostModalConfig = useMemo(() => {
    if (!previousPost) {
      return null;
    }

    return getPostModalRenderConfig({
      position,
      post: previousPost,
      postPosition: getHighlightPostPosition(activeIndex - 1, highlightsLength),
      onPreviousPost,
      onNextPost,
      onRequestClose,
      hideSubscribeAction: true,
    });
  }, [
    activeIndex,
    highlightsLength,
    onNextPost,
    onPreviousPost,
    onRequestClose,
    position,
    previousPost,
  ]);

  const nextPostModalConfig = useMemo(() => {
    if (!nextPost) {
      return null;
    }

    return getPostModalRenderConfig({
      position,
      post: nextPost,
      postPosition: getHighlightPostPosition(activeIndex + 1, highlightsLength),
      onPreviousPost,
      onNextPost,
      onRequestClose,
      hideSubscribeAction: true,
    });
  }, [
    activeIndex,
    highlightsLength,
    nextPost,
    onNextPost,
    onPreviousPost,
    onRequestClose,
    position,
  ]);

  const currentContent = useMemo((): ReactElement => {
    if (resolvedPost) {
      return <div className="w-full">{postModalConfig.content}</div>;
    }

    return (
      <div className="w-full">
        <PostLoadingSkeleton
          hasNavigation
          type={postModalConfig.postType}
          className={postModalConfig.loadingClassName}
        />
      </div>
    );
  }, [
    postModalConfig.content,
    postModalConfig.loadingClassName,
    postModalConfig.postType,
    resolvedPost,
  ]);

  return {
    currentContent,
    nextPaneContent: buildHighlightPostPane(
      nextPostModalConfig,
      nextPostModalConfig?.postType ?? PostType.Article,
    ),
    postModalConfig,
    previousPaneContent: buildHighlightPostPane(
      previousPostModalConfig,
      previousPostModalConfig?.postType ?? PostType.Article,
    ),
  };
};
