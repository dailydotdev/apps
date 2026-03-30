import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import { PostContent } from '../post/PostContent';
import { Origin } from '../../lib/log';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { PostHighlight } from '../../graphql/highlights';
import { RelativeTime } from '../utilities/RelativeTime';
import { usePostById } from '../../hooks/usePostById';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import { ArrowKeyEnum, isSpecialKeyPressed } from '../../lib/func';
import { useEventListener } from '../../hooks/useEventListener';

interface HappeningNowPostModalProps extends Pick<ModalProps, 'isOpen'> {
  selectedPostId: string | null;
  highlights: PostHighlight[];
  onRequestClose: ModalProps['onRequestClose'];
  onSelectPost: (postId: string) => void;
}

const getPostPosition = (
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

export function HappeningNowPostModal({
  selectedPostId,
  highlights,
  isOpen,
  onRequestClose,
  onSelectPost,
}: HappeningNowPostModalProps): ReactElement | null {
  const [lastLoadedPost, setLastLoadedPost] = useState<Post | null>(null);
  const selectedHighlightIndex = useMemo(
    () =>
      highlights.findIndex((highlight) => highlight.post.id === selectedPostId),
    [highlights, selectedPostId],
  );

  const activeIndex = selectedHighlightIndex >= 0 ? selectedHighlightIndex : 0;
  const activeHighlight = highlights[activeIndex];
  const activePostId = activeHighlight?.post?.id;
  const { post } = usePostById({
    id: activePostId ?? '',
  });
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: isOpen,
    offset: 0,
  });

  useEffect(() => {
    if (!post?.id) {
      return;
    }

    setLastLoadedPost(post);
  }, [post]);

  const resolvedPost = post ?? lastLoadedPost;
  const isLoadingNextPost = post?.id !== activePostId;
  const canNavigatePrevious = activeIndex > 0;
  const canNavigateNext =
    activeIndex >= 0 && activeIndex < highlights.length - 1;
  const postPosition = getPostPosition(activeIndex, highlights.length);
  const onPreviousPost = useCallback((): void => {
    if (!canNavigatePrevious) {
      return;
    }

    onSelectPost(highlights[activeIndex - 1].post.id);
  }, [activeIndex, canNavigatePrevious, highlights, onSelectPost]);
  const onNextPost = useCallback((): void => {
    if (!canNavigateNext) {
      return;
    }

    onSelectPost(highlights[activeIndex + 1].post.id);
  }, [activeIndex, canNavigateNext, highlights, onSelectPost]);
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (!isOpen || isSpecialKeyPressed({ event })) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isEditableTarget =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.getAttribute('contenteditable') === 'true';

      if (isEditableTarget) {
        return;
      }

      if (event.key === ArrowKeyEnum.Up || event.key === ArrowKeyEnum.Left) {
        if (!canNavigatePrevious) {
          return;
        }

        event.preventDefault();
        onPreviousPost();
        return;
      }

      if (event.key === ArrowKeyEnum.Down || event.key === ArrowKeyEnum.Right) {
        if (!canNavigateNext) {
          return;
        }

        event.preventDefault();
        onNextPost();
      }
    },
    [canNavigateNext, canNavigatePrevious, isOpen, onNextPost, onPreviousPost],
  );
  const parent = typeof window !== 'undefined' ? window : null;
  useEventListener(parent, 'keydown', handleKeyDown);

  if (!isOpen || !highlights.length || !activePostId || !resolvedPost?.id) {
    return null;
  }

  return (
    <BasePostModal
      isOpen={isOpen}
      post={resolvedPost}
      postType={PostType.Article}
      onAfterOpen={onLoad}
      onRequestClose={onRequestClose}
      postPosition={postPosition}
      onPreviousPost={canNavigatePrevious ? onPreviousPost : undefined}
      onNextPost={canNavigateNext ? onNextPost : undefined}
      loadingClassName="!pb-2 tablet:pb-0"
    >
      <div className="flex flex-col laptop:h-full laptop:flex-row laptop:overflow-hidden">
        <aside className="max-h-[13rem] overflow-y-auto border-b border-border-subtlest-tertiary laptop:max-h-none laptop:w-64 laptop:shrink-0 laptop:border-b-0 laptop:border-r">
          <h2 className="feed-highlights-title-gradient px-4 pb-2 pt-4 font-bold typo-title3">
            Happening Now
          </h2>
          <div className="flex flex-col gap-1 px-2 pb-2">
            {highlights.map((highlight, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={`${highlight.channel}-${highlight.post.id}`}
                  type="button"
                  className={`flex items-start gap-2 rounded-8 px-2.5 py-2 text-left transition-colors ${
                    isActive
                      ? 'feed-highlights-new-item-border bg-surface-hover'
                      : 'border border-transparent hover:bg-surface-hover'
                  }`}
                  onClick={() => onSelectPost(highlight.post.id)}
                >
                  <span
                    className={`line-clamp-2 flex-1 typo-callout ${
                      isActive ? 'text-text-primary' : 'text-text-secondary'
                    }`}
                  >
                    {highlight.headline}
                  </span>
                  <RelativeTime
                    dateTime={highlight.highlightedAt}
                    className="shrink-0 text-text-tertiary typo-caption2"
                  />
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="relative">
            <div
              className={`transition-opacity duration-200 ${
                isLoadingNextPost ? 'opacity-55' : 'opacity-100'
              }`}
            >
              <PostContent
                position={position}
                post={resolvedPost}
                postPosition={postPosition}
                onPreviousPost={
                  canNavigatePrevious ? onPreviousPost : undefined
                }
                onNextPost={canNavigateNext ? onNextPost : undefined}
                inlineActions
                className={{
                  container: 'min-w-0',
                  onboarding: 'mt-8',
                  navigation: { actions: 'ml-auto tablet:hidden' },
                }}
                onClose={onRequestClose}
                origin={Origin.ArticleModal}
              />
            </div>
            {isLoadingNextPost && (
              <div className="via-background-default/20 to-background-default/35 pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent" />
            )}
            {isLoadingNextPost && (
              <div className="bg-surface-float/90 pointer-events-none absolute right-4 top-4 rounded-8 px-2 py-1 text-text-secondary backdrop-blur-sm typo-caption2">
                Loading preview...
              </div>
            )}
          </div>
        </div>
      </div>
    </BasePostModal>
  );
}
