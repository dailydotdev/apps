import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import { PostContent } from '../post/PostContent';
import { Origin } from '../../lib/log';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { PostHighlight } from '../../graphql/highlights';
import { RelativeTime } from '../utilities/RelativeTime';
import { ArrowIcon } from '../icons';
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
  const highlightsScrollRef = useRef<HTMLDivElement>(null);
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
  const scrollHighlights = useCallback((direction: 'left' | 'right'): void => {
    const scrollElement = highlightsScrollRef.current;

    if (!scrollElement) {
      return;
    }

    const offset = Math.max(220, Math.round(scrollElement.clientWidth * 0.75));
    const left = direction === 'right' ? offset : -offset;
    scrollElement.scrollBy({ left, behavior: 'smooth' });
  }, []);
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
      loadingClassName="!pb-2 tablet:pb-0"
      navigationLeadingContent={
        <h2 className="feed-highlights-title-gradient font-bold typo-title3">
          Happening Now
        </h2>
      }
    >
      <div className="flex min-h-0 max-w-full flex-col laptop:h-full">
        <section className="w-full max-w-full shrink-0 border-b border-border-subtlest-tertiary">
          <div className="flex items-center gap-1 px-2 py-2">
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-white text-text-primary transition-colors hover:bg-surface-hover"
              aria-label="Scroll highlights left"
              onClick={() => scrollHighlights('left')}
            >
              <ArrowIcon className="-rotate-90" />
            </button>
            <div
              ref={highlightsScrollRef}
              className="w-full max-w-full min-w-0 overflow-x-auto"
            >
              <div className="flex min-w-max gap-1 pr-2">
                {highlights.map((highlight, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${highlight.channel}-${highlight.post.id}`}
                      type="button"
                      className={`flex w-56 min-w-56 shrink-0 flex-col items-start gap-0.5 rounded-8 px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? 'border-b-2 border-b-accent-cheese-default bg-surface-hover'
                          : 'border-b-2 border-b-transparent hover:bg-surface-hover'
                      }`}
                      onClick={() => onSelectPost(highlight.post.id)}
                    >
                      <RelativeTime
                        dateTime={highlight.highlightedAt}
                        className="text-text-tertiary typo-caption2"
                      />
                      <span
                        className={`line-clamp-2 flex-1 typo-callout ${
                          isActive ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                      >
                        {highlight.headline}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-white text-text-primary transition-colors hover:bg-surface-hover"
              aria-label="Scroll highlights right"
              onClick={() => scrollHighlights('right')}
            >
              <ArrowIcon className="rotate-90" />
            </button>
          </div>
        </section>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
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
              onPreviousPost={canNavigatePrevious ? onPreviousPost : undefined}
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
