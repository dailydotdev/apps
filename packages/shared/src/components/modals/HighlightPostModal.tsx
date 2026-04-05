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
import { useSwipeable } from 'react-swipeable';
import type { SwipeEventData } from 'react-swipeable';
import type { ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import { ArrowIcon } from '../icons';
import { useViewSize, ViewSize } from '../../hooks';
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
const SWIPE_COMMIT_DURATION_MS = 220;
const SWIPE_LOCK_DISTANCE_PX = 24;
const SWIPE_AXIS_RATIO = 1.35;

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
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [isSwipeDragging, setIsSwipeDragging] = useState(false);
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
  const [showRightScrollGlow, setShowRightScrollGlow] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const drawerContainerRef = useRef<HTMLDivElement>(null);
  const articleViewportRef = useRef<HTMLDivElement | null>(null);
  const lastArticleScrollTopRef = useRef(0);
  const swipeTransitionTimeoutRef = useRef<number | null>(null);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldUseMobileLayout = hasHydrated && !isLaptop;
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
  const previousHighlight =
    activeIndex > 0 ? highlights[activeIndex - 1] : undefined;
  const nextHighlight =
    activeIndex < highlights.length - 1
      ? highlights[activeIndex + 1]
      : undefined;
  const activeHighlight = highlights[activeIndex];
  const activePostId = isOpen ? activeHighlight?.post.id ?? '' : '';
  const { post } = usePostById({
    id: activePostId,
    options: { enabled: !!activePostId },
  });
  const { post: previousPost } = usePostById({
    id: isOpen && shouldUseMobileLayout ? previousHighlight?.post.id ?? '' : '',
    options: {
      enabled: !!previousHighlight?.post.id && isOpen && shouldUseMobileLayout,
    },
  });
  const { post: nextPost } = usePostById({
    id: isOpen && shouldUseMobileLayout ? nextHighlight?.post.id ?? '' : '',
    options: {
      enabled: !!nextHighlight?.post.id && isOpen && shouldUseMobileLayout,
    },
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
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!post?.id) {
      return;
    }

    setLastLoadedPost(post);
  }, [activeHighlight?.id, activePostId, post, selectedHighlightId]);

  useEffect(() => {
    if (!isOpen) {
      setLastLoadedPost(null);
      setIsNavigationReady(false);
      setIsDrawerMinimized(false);
      setSwipeOffsetX(0);
      setIsSwipeDragging(false);
      setIsSwipeTransitioning(false);
      return;
    }

    if (!shouldUseMobileLayout) {
      return;
    }

    setIsDrawerMinimized(false);
  }, [isOpen, shouldUseMobileLayout]);

  useEffect(() => {
    if (!isOpen || !shouldUseMobileLayout) {
      return undefined;
    }

    const viewport = articleViewportRef.current;
    if (!viewport) {
      return undefined;
    }

    lastArticleScrollTopRef.current = viewport.scrollTop;

    const onScroll = (): void => {
      const currentScrollTop = viewport.scrollTop;
      const scrollDelta = currentScrollTop - lastArticleScrollTopRef.current;

      if (Math.abs(scrollDelta) < 2) {
        return;
      }

      lastArticleScrollTopRef.current = currentScrollTop;
      if (scrollDelta > 0) {
        setIsDrawerMinimized(true);
        return;
      }

      setIsDrawerMinimized(false);
    };

    const onWheel = (event: WheelEvent): void => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      if (Math.abs(event.deltaX) < 4) {
        return;
      }

      setIsDrawerMinimized(false);
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    viewport.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      viewport.removeEventListener('scroll', onScroll);
      viewport.removeEventListener('wheel', onWheel);
    };
  }, [isOpen, shouldUseMobileLayout]);

  const updateHighlightsRightGlow = useCallback((): void => {
    const scrollContainer = tabsScrollRef.current;

    if (!scrollContainer) {
      setShowRightScrollGlow(false);
      return;
    }

    const hasScrollableRight =
      scrollContainer.scrollLeft + scrollContainer.clientWidth <
      scrollContainer.scrollWidth - 1;
    setShowRightScrollGlow(hasScrollableRight);
  }, []);

  const scrollActiveHighlightIntoView = useCallback(
    (behavior: ScrollBehavior = 'auto'): boolean => {
      const container = tabsScrollRef.current;
      if (!container) {
        return false;
      }

      const activeButton = container.querySelector<HTMLElement>(
        `[data-highlight-id="${activeHighlight?.id}"]`,
      );
      if (!activeButton) {
        return false;
      }

      activeButton.scrollIntoView({
        behavior,
        block: 'nearest',
        inline: 'center',
      });
      updateHighlightsRightGlow();

      return true;
    },
    [activeHighlight?.id, updateHighlightsRightGlow],
  );

  useIsomorphicLayoutEffect(() => {
    if (!isOpen || !highlights.length) {
      return undefined;
    }

    if (shouldUseMobileLayout && isDrawerMinimized) {
      setIsNavigationReady(true);
      return undefined;
    }

    let rafId: number | null = null;
    let delayedRafId: number | null = null;
    let delayedTimeoutId: number | null = null;

    const attemptScroll = (attempt = 0): void => {
      const hasScrolled = scrollActiveHighlightIntoView('auto');

      if (hasScrolled || attempt >= 6) {
        setIsNavigationReady(true);
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        attemptScroll(attempt + 1);
      });
    };

    delayedRafId = window.requestAnimationFrame(() => {
      attemptScroll();
    });

    if (shouldUseMobileLayout) {
      delayedTimeoutId = window.setTimeout(() => {
        delayedRafId = window.requestAnimationFrame(() => {
          attemptScroll();
        });
      }, 320);
    }

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }

      if (delayedRafId !== null) {
        window.cancelAnimationFrame(delayedRafId);
      }

      if (delayedTimeoutId !== null) {
        window.clearTimeout(delayedTimeoutId);
      }
    };
  }, [
    highlights.length,
    isDrawerMinimized,
    isOpen,
    scrollActiveHighlightIntoView,
    shouldUseMobileLayout,
  ]);

  useEffect(() => {
    if (!isOpen || !shouldUseMobileLayout || isDrawerMinimized) {
      setShowRightScrollGlow(false);
      return undefined;
    }

    const rafId = window.requestAnimationFrame(updateHighlightsRightGlow);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [
    activeIndex,
    isDrawerMinimized,
    isOpen,
    shouldUseMobileLayout,
    updateHighlightsRightGlow,
  ]);

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

  const onPreviousPostAndOpenDrawer = useCallback((): void => {
    onPreviousPost();
    if (shouldUseMobileLayout) {
      setIsDrawerMinimized(false);
    }
  }, [onPreviousPost, shouldUseMobileLayout]);

  const onNextPostAndOpenDrawer = useCallback((): void => {
    onNextPost();
    if (shouldUseMobileLayout) {
      setIsDrawerMinimized(false);
    }
  }, [onNextPost, shouldUseMobileLayout]);

  const clearSwipeTransitionTimeout = useCallback((): void => {
    if (swipeTransitionTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(swipeTransitionTimeoutRef.current);
    swipeTransitionTimeoutRef.current = null;
  }, []);

  const getSwipeViewportWidth = useCallback((): number => {
    return articleViewportRef.current?.clientWidth ?? window.innerWidth;
  }, []);

  const resetSwipePosition = useCallback((): void => {
    setIsSwipeTransitioning(false);
    setSwipeOffsetX(0);
  }, []);

  const commitSwipeNavigation = useCallback(
    (direction: 'left' | 'right', navigate: () => void): void => {
      if (isSwipeTransitioning) {
        return;
      }

      clearSwipeTransitionTimeout();
      setIsSwipeDragging(false);
      setIsSwipeTransitioning(true);
      const viewportWidth = getSwipeViewportWidth();
      const outOffset = direction === 'left' ? -viewportWidth : viewportWidth;

      setSwipeOffsetX(outOffset);
      swipeTransitionTimeoutRef.current = window.setTimeout(() => {
        navigate();
        resetSwipePosition();
        swipeTransitionTimeoutRef.current = null;
      }, SWIPE_COMMIT_DURATION_MS);
    },
    [
      clearSwipeTransitionTimeout,
      getSwipeViewportWidth,
      isSwipeTransitioning,
      resetSwipePosition,
    ],
  );

  const animateSwipeReset = useCallback((): void => {
    if (!swipeOffsetX) {
      setIsSwipeDragging(false);
      return;
    }

    clearSwipeTransitionTimeout();
    setIsSwipeDragging(false);
    setIsSwipeTransitioning(true);
    setSwipeOffsetX(0);
    swipeTransitionTimeoutRef.current = window.setTimeout(() => {
      setIsSwipeTransitioning(false);
      swipeTransitionTimeoutRef.current = null;
    }, SWIPE_COMMIT_DURATION_MS);
  }, [clearSwipeTransitionTimeout, swipeOffsetX]);

  const shouldCommitSwipeNavigation = useCallback(
    (eventData: SwipeEventData): boolean => {
      const swipeThreshold = getSwipeViewportWidth() * 0.18;

      return eventData.absX >= swipeThreshold;
    },
    [getSwipeViewportWidth],
  );

  const shouldHandleArticleSwipe = useCallback(
    (eventData: SwipeEventData): boolean => {
      if (!shouldUseMobileLayout) {
        return false;
      }

      if (isLoadingNextPost || isSwipeTransitioning) {
        return false;
      }

      const target = eventData.event.target as Node | null;
      if (target && drawerContainerRef.current?.contains(target)) {
        return false;
      }

      if (eventData.absX < SWIPE_LOCK_DISTANCE_PX) {
        return false;
      }

      if (eventData.absX <= eventData.absY * SWIPE_AXIS_RATIO) {
        return false;
      }

      return true;
    },
    [isLoadingNextPost, isSwipeTransitioning, shouldUseMobileLayout],
  );

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

  const previousPostModalConfig = useMemo(() => {
    if (!previousPost) {
      return null;
    }

    return getPostModalRenderConfig({
      position,
      post: previousPost,
      postPosition: getPostPosition(activeIndex - 1, highlights.length),
      onPreviousPost,
      onNextPost,
      onRequestClose,
      hideSubscribeAction: true,
    });
  }, [
    activeIndex,
    highlights.length,
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
      postPosition: getPostPosition(activeIndex + 1, highlights.length),
      onPreviousPost,
      onNextPost,
      onRequestClose,
      hideSubscribeAction: true,
    });
  }, [
    activeIndex,
    highlights.length,
    nextPost,
    onNextPost,
    onPreviousPost,
    onRequestClose,
    position,
  ]);

  const { ref: swipeableRef, ...swipeHandlers } = useSwipeable({
    onSwiping: (eventData) => {
      if (!shouldHandleArticleSwipe(eventData)) {
        return;
      }

      const { deltaX } = eventData;
      const maxOffset = getSwipeViewportWidth() * 0.6;
      const nextOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX));

      setSwipeOffsetX(nextOffset);
      setIsSwipeDragging(true);
    },
    onSwipedLeft: (eventData) => {
      if (!shouldHandleArticleSwipe(eventData)) {
        animateSwipeReset();
        return;
      }

      if (!canNavigateNext || !shouldCommitSwipeNavigation(eventData)) {
        animateSwipeReset();
        return;
      }

      commitSwipeNavigation('left', onNextPostAndOpenDrawer);
    },
    onSwipedRight: (eventData) => {
      if (!shouldHandleArticleSwipe(eventData)) {
        animateSwipeReset();
        return;
      }

      if (!canNavigatePrevious || !shouldCommitSwipeNavigation(eventData)) {
        animateSwipeReset();
        return;
      }

      commitSwipeNavigation('right', onPreviousPostAndOpenDrawer);
    },
    trackTouch: true,
    delta: 12,
  });

  const setArticleViewportRef = useCallback(
    (node: HTMLDivElement | null): void => {
      articleViewportRef.current = node;
      swipeableRef(node);
    },
    [swipeableRef],
  );

  useKeyboardNavigation(keyboardNavigationParent, keyboardNavigationEvents, {
    disableOnTags: ['textarea', 'select', 'input'],
  });

  useEffect(() => {
    return () => {
      clearSwipeTransitionTimeout();
    };
  }, [clearSwipeTransitionTimeout]);

  const renderPostPane = useCallback(
    (
      paneConfig: ReturnType<typeof getPostModalRenderConfig> | null,
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
    },
    [],
  );

  const selectHighlightFromRail = useCallback(
    (
      highlight: PostHighlight,
      highlightPosition: number,
      modalHighlights: PostHighlight[],
    ): void => {
      onHighlightClick?.(highlight, highlightPosition, modalHighlights);
      onSelectHighlight(highlight, highlightPosition, modalHighlights);
    },
    [onHighlightClick, onSelectHighlight],
  );

  if (!isOpen || !selectedHighlightId || !activeHighlight) {
    return null;
  }

  let mobileTrackTransition = 'none';
  if (isSwipeTransitioning) {
    mobileTrackTransition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
  }
  if (isSwipeDragging) {
    mobileTrackTransition = 'none';
  }
  const mobileTrackStyle = {
    transform: `translateX(calc(-33.333333% + ${swipeOffsetX}px))`,
    transition: mobileTrackTransition,
    willChange: 'transform',
  } as const;
  const mobilePaneStyle = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  } as const;

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
      <div className="relative flex min-h-0 max-w-full flex-col laptop:h-full">
        {!shouldUseMobileLayout && (
          <HighlightTabsSection
            highlights={highlights}
            activeIndex={activeIndex}
            onSelectHighlight={selectHighlightFromRail}
            scrollRef={tabsScrollRef}
            isReady={isNavigationReady}
          />
        )}
        {shouldUseMobileLayout && !isDrawerMinimized && (
          <section className="my-2 w-full border-b border-border-subtlest-tertiary bg-background-default">
            <div ref={drawerContainerRef} className="flex items-center">
              <div className="relative min-w-0 flex-1">
                <div
                  ref={tabsScrollRef}
                  className="min-w-0 flex-1 overflow-x-auto"
                  onScroll={updateHighlightsRightGlow}
                >
                  <div
                    className={classNames(
                      'flex min-w-max gap-1 px-3 pb-3',
                      !isNavigationReady && 'invisible',
                    )}
                  >
                    <HighlightTabs
                      highlights={highlights}
                      activeIndex={activeIndex}
                      onSelectHighlight={selectHighlightFromRail}
                    />
                  </div>
                </div>
                {!isNavigationReady && (
                  <div className="pointer-events-none absolute inset-x-3 top-0">
                    <div className="flex min-w-max gap-1 overflow-hidden pb-3">
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
                <div
                  className={classNames(
                    'pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-12 bg-gradient-to-l from-background-default to-transparent transition-opacity duration-200',
                    showRightScrollGlow ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </div>
            </div>
          </section>
        )}
        <div
          ref={setArticleViewportRef}
          className="min-h-0 min-w-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]"
          {...swipeHandlers}
        >
          <div className="relative overflow-hidden">
            {shouldUseMobileLayout ? (
              <div
                aria-busy={isLoadingNextPost}
                className="flex w-[300%]"
                style={mobileTrackStyle}
              >
                <div
                  key={previousHighlight?.id ?? 'previous-empty'}
                  className="w-1/3 shrink-0"
                  style={mobilePaneStyle}
                >
                  {previousHighlight ? (
                    renderPostPane(
                      previousPostModalConfig,
                      previousPostModalConfig?.postType ?? PostType.Article,
                    )
                  ) : (
                    <div className="w-full" />
                  )}
                </div>
                <div
                  key={activeHighlight.id}
                  className="w-1/3 shrink-0"
                  style={mobilePaneStyle}
                >
                  {resolvedPost ? (
                    <div className="w-full">{postModalConfig.content}</div>
                  ) : (
                    <div className="w-full">
                      <PostLoadingSkeleton
                        hasNavigation
                        type={postModalConfig.postType}
                        className={postModalConfig.loadingClassName}
                      />
                    </div>
                  )}
                </div>
                <div
                  key={nextHighlight?.id ?? 'next-empty'}
                  className="w-1/3 shrink-0"
                  style={mobilePaneStyle}
                >
                  {nextHighlight ? (
                    renderPostPane(
                      nextPostModalConfig,
                      nextPostModalConfig?.postType ?? PostType.Article,
                    )
                  ) : (
                    <div className="w-full" />
                  )}
                </div>
              </div>
            ) : (
              <>
                {resolvedPost ? (
                  <div
                    aria-busy={isLoadingNextPost}
                    className={classNames(
                      'z-10 relative w-full transition-opacity duration-200',
                      isLoadingNextPost ? 'opacity-55' : 'opacity-100',
                    )}
                  >
                    <div className="w-full">{postModalConfig.content}</div>
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
              </>
            )}
          </div>
        </div>
        {shouldUseMobileLayout && isDrawerMinimized && (
          <div className="pointer-events-none fixed inset-x-0 bottom-2 z-modal px-2">
            <div className="pointer-events-auto">
              <button
                type="button"
                className="bg-background-default/95 flex h-10 w-full items-center gap-2 rounded-12 border border-border-subtlest-tertiary px-3 backdrop-blur-sm"
                onClick={() => setIsDrawerMinimized(false)}
              >
                <span className="bg-gradient-to-r from-accent-blueCheese-default via-accent-cheese-default to-accent-avocado-default bg-clip-text font-bold text-transparent typo-callout">
                  Happening Now
                </span>
                <span className="ml-auto text-text-tertiary">
                  <ArrowIcon className="[&_path]:fill-text-tertiary" />
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </BasePostModal>
  );
}
