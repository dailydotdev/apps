import type { ReactElement, Ref } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import type { ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import type { PostHighlight } from '../../graphql/highlights';
import {
  MAJOR_HEADLINES_MAX_FIRST,
  majorHeadlinesQueryOptions,
} from '../../graphql/highlights';
import { usePostById } from '../../hooks/usePostById';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import { LogEvent, Origin } from '../../lib/log';
import { postLogEvent } from '../../lib/feed';
import { useLogContext } from '../../contexts/LogContext';
import { PostType } from '../../graphql/posts';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import { RelativeTime } from '../utilities/RelativeTime';
import { getPostModalRenderConfig } from './getPostModalRenderConfig';

interface HighlightPostModalProps extends Pick<ModalProps, 'isOpen'> {
  selectedHighlightId: string | null;
  highlights: PostHighlight[];
  onRequestClose: ModalProps['onRequestClose'];
  onHighlightClick?: (
    highlight: PostHighlight,
    position: number,
    highlights: PostHighlight[],
  ) => void;
  onSelectHighlight: (
    highlight: PostHighlight,
    position: number,
    highlights: PostHighlight[],
  ) => void;
}

interface HighlightTabsProps {
  highlights: PostHighlight[];
  activeIndex: number;
  onSelectHighlight: (
    highlight: PostHighlight,
    position: number,
    highlights: PostHighlight[],
  ) => void;
  scrollRef?: Ref<HTMLDivElement>;
  isReady?: boolean;
}

const highlightTabsSkeletonItems = Array.from(
  { length: 4 },
  (_, index) => index,
);
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

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

const HighlightTabs = ({
  highlights,
  activeIndex,
  onSelectHighlight,
}: HighlightTabsProps): ReactElement => {
  return (
    <>
      {highlights.map((highlight, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={highlight.id}
            data-highlight-id={highlight.id}
            type="button"
            className={
              isActive
                ? 'flex w-56 min-w-56 shrink-0 flex-col items-start gap-0.5 rounded-8 border border-border-subtlest-tertiary bg-background-default px-2.5 py-2 text-left transition-colors'
                : 'flex w-56 min-w-56 shrink-0 flex-col items-start gap-0.5 rounded-8 border border-transparent px-2.5 py-2 text-left transition-colors hover:bg-surface-hover'
            }
            onClick={() => onSelectHighlight(highlight, index + 1, highlights)}
          >
            <RelativeTime
              dateTime={highlight.highlightedAt}
              className="text-text-tertiary typo-caption2"
            />
            <span
              className={
                isActive
                  ? 'line-clamp-2 text-text-primary typo-callout'
                  : 'line-clamp-2 text-text-secondary typo-callout'
              }
            >
              {highlight.headline}
            </span>
          </button>
        );
      })}
    </>
  );
};

const HighlightTabsSection = ({
  highlights,
  activeIndex,
  onSelectHighlight,
  scrollRef,
  isReady = true,
}: HighlightTabsProps): ReactElement => {
  const shouldShowSkeleton = !highlights.length || !isReady;

  return (
    <section className="relative w-full max-w-full shrink-0 overflow-hidden border-b border-border-subtlest-tertiary">
      <div className="px-3 py-3">
        <div
          ref={scrollRef}
          className="w-full max-w-full overflow-x-auto overflow-y-hidden"
        >
          <div
            className={
              shouldShowSkeleton
                ? 'invisible flex min-w-max gap-1'
                : 'flex min-w-max gap-1'
            }
          >
            {highlights.length ? (
              <HighlightTabs
                highlights={highlights}
                activeIndex={activeIndex}
                onSelectHighlight={onSelectHighlight}
              />
            ) : null}
          </div>
        </div>
        {shouldShowSkeleton && (
          <div className="pointer-events-none absolute inset-x-3 top-3">
            <div className="flex min-w-max gap-1 overflow-hidden">
              {highlightTabsSkeletonItems.map((item) => (
                <div
                  key={item}
                  aria-hidden
                  className="flex h-[4.125rem] w-56 min-w-56 shrink-0 animate-pulse flex-col gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2"
                >
                  <div className="h-3 w-16 rounded-full bg-surface-hover" />
                  <div className="h-4 w-full rounded-full bg-surface-hover" />
                  <div className="h-4 w-4/5 rounded-full bg-surface-hover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export function HighlightPostModal({
  selectedHighlightId,
  highlights: initialHighlights,
  isOpen,
  onRequestClose,
  onHighlightClick,
  onSelectHighlight,
}: HighlightPostModalProps): ReactElement | null {
  const { logEvent } = useLogContext();
  const [lastLoadedPost, setLastLoadedPost] = useState<
    ReturnType<typeof usePostById>['post'] | null
  >(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const { data } = useQuery({
    ...majorHeadlinesQueryOptions({ first: MAJOR_HEADLINES_MAX_FIRST }),
    enabled: isOpen,
  });
  const fetchedHighlights =
    data?.majorHeadlines.edges.map(({ node }) => node) ?? [];
  const highlights = fetchedHighlights.length
    ? fetchedHighlights
    : initialHighlights;
  const activeIndex = useMemo(() => {
    const foundIndex = highlights.findIndex(
      ({ id }) => id === selectedHighlightId,
    );

    return foundIndex >= 0 ? foundIndex : 0;
  }, [highlights, selectedHighlightId]);
  const activeHighlight = highlights[activeIndex];
  const activePostId = isOpen ? activeHighlight?.post.id ?? '' : '';
  const { post } = usePostById({
    id: activePostId,
    options: { enabled: !!activePostId },
  });
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: isOpen,
    offset: 0,
  });
  const resolvedPost = post ?? lastLoadedPost;
  const isInitialLoading = !resolvedPost;
  const isLoadingNextPost =
    !!resolvedPost && post?.id !== activeHighlight?.post.id;
  const canNavigatePrevious = activeIndex > 0;
  const canNavigateNext =
    activeIndex >= 0 && activeIndex < highlights.length - 1;
  const postPosition = getPostPosition(activeIndex, highlights.length);
  const modalPostPosition = isInitialLoading ? PostPosition.Only : postPosition;

  useEffect(() => {
    if (!post?.id) {
      return;
    }
    setLastLoadedPost(post);
  }, [activeHighlight?.id, activePostId, post, selectedHighlightId]);

  useEffect(() => {
    if (isOpen) {
      return;
    }
    setLastLoadedPost(null);
    setIsNavigationReady(false);
  }, [isOpen, selectedHighlightId]);

  useIsomorphicLayoutEffect(() => {
    if (!isOpen || !highlights.length) {
      return;
    }

    const activeButton = tabsScrollRef.current?.querySelector<HTMLElement>(
      `[data-highlight-id="${activeHighlight?.id}"]`,
    );

    activeButton?.scrollIntoView({
      behavior: 'auto',
      block: 'nearest',
      inline: 'center',
    });
    setIsNavigationReady(true);
  }, [activeHighlight?.id, activeIndex, highlights.length, isOpen]);

  const onPreviousPost = useCallback((): void => {
    if (!canNavigatePrevious) {
      return;
    }

    if (resolvedPost) {
      logEvent(
        postLogEvent(LogEvent.NavigatePrevious, resolvedPost, {
          extra: { origin: Origin.ArticleModal, from_highlights: true },
        }),
      );
    }

    onSelectHighlight(highlights[activeIndex - 1], activeIndex, highlights);
  }, [
    activeIndex,
    canNavigatePrevious,
    highlights,
    logEvent,
    onSelectHighlight,
    resolvedPost,
  ]);

  const onNextPost = useCallback((): void => {
    if (!canNavigateNext) {
      return;
    }

    if (resolvedPost) {
      logEvent(
        postLogEvent(LogEvent.NavigateNext, resolvedPost, {
          extra: { origin: Origin.ArticleModal, from_highlights: true },
        }),
      );
    }

    onSelectHighlight(highlights[activeIndex + 1], activeIndex + 2, highlights);
  }, [
    activeIndex,
    canNavigateNext,
    highlights,
    logEvent,
    onSelectHighlight,
    resolvedPost,
  ]);

  const keyboardNavigationEvents = useMemo(
    (): [string, (event: KeyboardEvent) => void][] => [
      ['ArrowLeft', () => onPreviousPost()],
      ['ArrowRight', () => onNextPost()],
      ['j', () => onPreviousPost()],
      ['k', () => onNextPost()],
    ],
    [onNextPost, onPreviousPost],
  );
  const keyboardNavigationParent =
    isOpen && typeof window !== 'undefined' ? window : null;

  const postModalConfig = useMemo(() => {
    if (!resolvedPost) {
      return {
        postType: PostType.Article,
        loadingClassName: '!pb-2 tablet:pb-0',
        size: undefined,
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
  useKeyboardNavigation(keyboardNavigationParent, keyboardNavigationEvents, {
    disableOnTags: ['textarea', 'select', 'input'],
  });

  if (!isOpen || !selectedHighlightId || !activeHighlight) {
    return null;
  }

  return (
    <BasePostModal
      isOpen={isOpen}
      isLoading={false}
      size={postModalConfig.size}
      post={resolvedPost ?? undefined}
      postType={postModalConfig.postType}
      postPosition={modalPostPosition}
      onPreviousPost={onPreviousPost}
      onNextPost={onNextPost}
      onAfterOpen={onLoad}
      onRequestClose={onRequestClose}
      loadingClassName={postModalConfig.loadingClassName}
      navigationHideSubscribeAction
      navigationLeadingContent={
        <h2 className="bg-gradient-to-r from-accent-blueCheese-default via-accent-cheese-default to-accent-avocado-default bg-clip-text font-bold text-transparent typo-title3">
          Happening Now
        </h2>
      }
    >
      <HighlightTabsSection
        highlights={highlights}
        activeIndex={activeIndex}
        onSelectHighlight={(highlight, highlightPosition, modalHighlights) => {
          onHighlightClick?.(highlight, highlightPosition, modalHighlights);
          onSelectHighlight(highlight, highlightPosition, modalHighlights);
        }}
        scrollRef={tabsScrollRef}
        isReady={isNavigationReady}
      />
      {resolvedPost ? (
        <div
          aria-busy={isLoadingNextPost}
          className={classNames(
            'w-full transition-opacity',
            isLoadingNextPost && 'opacity-70',
          )}
        >
          {postModalConfig.content}
        </div>
      ) : (
        <div className="w-full">
          <PostLoadingSkeleton
            hasNavigation
            type={postModalConfig.postType}
            className={postModalConfig.loadingClassName}
          />
        </div>
      )}
    </BasePostModal>
  );
}
