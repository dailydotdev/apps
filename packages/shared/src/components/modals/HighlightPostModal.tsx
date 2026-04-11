import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { useSwipeable } from 'react-swipeable';
import type { SwipeEventData } from 'react-swipeable';
import type { ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import PostLoadingSkeleton from '../post/PostLoadingSkeleton';
import { useViewSize, ViewSize } from '../../hooks';
import type { PostHighlight } from '../../graphql/highlights';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import usePostNavigationPosition from '../../hooks/usePostNavigationPosition';
import { LogEvent, Origin } from '../../lib/log';
import { postLogEvent } from '../../lib/feed';
import { useLogContext } from '../../contexts/LogContext';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import {
  HighlightDesktopRail,
  HighlightMobileRail,
  type HighlightSelectionHandler,
} from './highlight/HighlightRails';
import { HighlightMobileTrack } from './highlight/HighlightMobileTrack';
import {
  getHighlightMobileTrackStyle,
  highlightMobilePaneStyle,
} from './highlight/highlightPostModalUtils';
import { useHighlightModalNavigation } from './highlight/useHighlightModalNavigation';
import { useHighlightModalPosts } from './highlight/useHighlightModalPosts';
import { useHighlightModalRenderConfigs } from './highlight/useHighlightModalRenderConfigs';

interface HighlightPostModalProps extends Pick<ModalProps, 'isOpen'> {
  selectedHighlightId: string | null;
  highlights: PostHighlight[];
  onRequestClose: ModalProps['onRequestClose'];
  onHighlightClick?: HighlightSelectionHandler;
  onSelectHighlight: HighlightSelectionHandler;
}
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;
const SWIPE_COMMIT_DURATION_MS = 220;
const SWIPE_LOCK_DISTANCE_PX = 12;
const SWIPE_AXIS_RATIO = 1.35;
const DESKTOP_HIGHLIGHTS_RESTORE_IDLE_MS = 900;

export function HighlightPostModal({
  selectedHighlightId,
  highlights: initialHighlights,
  isOpen,
  onRequestClose,
  onHighlightClick,
  onSelectHighlight,
}: HighlightPostModalProps): ReactElement | null {
  const { logEvent } = useLogContext();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [isSwipeDragging, setIsSwipeDragging] = useState(false);
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
  const [showRightScrollGlow, setShowRightScrollGlow] = useState(false);
  const [isDesktopHighlightsHovered, setIsDesktopHighlightsHovered] =
    useState(false);
  const [isDesktopHighlightsScrolling, setIsDesktopHighlightsScrolling] =
    useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const drawerContainerRef = useRef<HTMLDivElement>(null);
  const articleViewportRef = useRef<HTMLDivElement | null>(null);
  const lastArticleScrollTopRef = useRef(0);
  const swipeTransitionTimeoutRef = useRef<number | null>(null);
  const desktopHighlightsScrollTimeoutRef = useRef<number | null>(null);
  const desktopHighlightsRestoreTimeoutRef = useRef<number | null>(null);
  const isDesktopHighlightsHoveredRef = useRef(false);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldUseMobileLayout = hasHydrated && !isLaptop;
  const {
    activeHighlight,
    activeIndex,
    canNavigateNext,
    canNavigatePrevious,
    highlights,
    nextHighlight,
    postPosition,
    previousHighlight,
  } = useHighlightModalNavigation({
    initialHighlights,
    isOpen,
    selectedHighlightId,
  });
  const {
    isInitialLoading,
    isLoadingNextPost,
    nextPost,
    previousPost,
    resolvedPost,
  } = useHighlightModalPosts({
    activeHighlight,
    isOpen,
    nextHighlight,
    previousHighlight,
    selectedHighlightId,
    shouldUseMobileLayout,
  });
  const { position, onLoad } = usePostNavigationPosition({
    isDisplayed: isOpen,
    offset: 0,
  });
  const modalPostPosition = isInitialLoading ? PostPosition.Only : postPosition;

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
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

  const clearDesktopHighlightsScrollTimeout = useCallback((): void => {
    if (desktopHighlightsScrollTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(desktopHighlightsScrollTimeoutRef.current);
    desktopHighlightsScrollTimeoutRef.current = null;
  }, []);

  const clearDesktopHighlightsRestoreTimeout = useCallback((): void => {
    if (desktopHighlightsRestoreTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(desktopHighlightsRestoreTimeoutRef.current);
    desktopHighlightsRestoreTimeoutRef.current = null;
  }, []);

  const scheduleDesktopHighlightsRestore = useCallback((): void => {
    if (shouldUseMobileLayout) {
      return;
    }

    clearDesktopHighlightsRestoreTimeout();
    desktopHighlightsRestoreTimeoutRef.current = window.setTimeout(() => {
      desktopHighlightsRestoreTimeoutRef.current = null;

      if (isDesktopHighlightsHoveredRef.current) {
        return;
      }

      scrollActiveHighlightIntoView('smooth');
    }, DESKTOP_HIGHLIGHTS_RESTORE_IDLE_MS);
  }, [
    clearDesktopHighlightsRestoreTimeout,
    scrollActiveHighlightIntoView,
    shouldUseMobileLayout,
  ]);

  const markDesktopHighlightsScrolling = useCallback((): void => {
    if (shouldUseMobileLayout) {
      return;
    }

    setIsDesktopHighlightsScrolling(true);
    clearDesktopHighlightsScrollTimeout();
    clearDesktopHighlightsRestoreTimeout();
    desktopHighlightsScrollTimeoutRef.current = window.setTimeout(() => {
      setIsDesktopHighlightsScrolling(false);
      desktopHighlightsScrollTimeoutRef.current = null;

      if (!isDesktopHighlightsHoveredRef.current) {
        scheduleDesktopHighlightsRestore();
      }
    }, 180);
  }, [
    clearDesktopHighlightsRestoreTimeout,
    clearDesktopHighlightsScrollTimeout,
    scheduleDesktopHighlightsRestore,
    shouldUseMobileLayout,
  ]);

  useEffect(() => {
    isDesktopHighlightsHoveredRef.current = isDesktopHighlightsHovered;
  }, [isDesktopHighlightsHovered]);

  useEffect(() => {
    return () => {
      clearDesktopHighlightsScrollTimeout();
      clearDesktopHighlightsRestoreTimeout();
    };
  }, [
    clearDesktopHighlightsRestoreTimeout,
    clearDesktopHighlightsScrollTimeout,
  ]);

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

  const {
    currentContent,
    nextPaneContent,
    postModalConfig,
    previousPaneContent,
  } = useHighlightModalRenderConfigs({
    activeIndex,
    highlightsLength: highlights.length,
    nextPost,
    onNextPost,
    onPreviousPost,
    onRequestClose,
    position,
    postPosition,
    previousPost,
    resolvedPost,
  });

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
  const onDesktopRailMouseEnter = useCallback((): void => {
    setIsDesktopHighlightsHovered(true);
    clearDesktopHighlightsRestoreTimeout();
  }, [clearDesktopHighlightsRestoreTimeout]);

  const onDesktopRailMouseLeave = useCallback((): void => {
    setIsDesktopHighlightsHovered(false);

    if (!isDesktopHighlightsScrolling) {
      scheduleDesktopHighlightsRestore();
    }
  }, [isDesktopHighlightsScrolling, scheduleDesktopHighlightsRestore]);

  const onRestoreMobileDrawer = useCallback((): void => {
    setIsDrawerMinimized(false);
  }, []);

  if (!isOpen || !selectedHighlightId || !activeHighlight) {
    return null;
  }

  const mobileTrackStyle = getHighlightMobileTrackStyle({
    isSwipeDragging,
    isSwipeTransitioning,
    swipeCommitDurationMs: SWIPE_COMMIT_DURATION_MS,
    swipeOffsetX,
  });

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
      navigationContainerClassName="pb-2 pt-safe"
      navigationHideSubscribeAction
      navigationLeadingContent={
        <h2 className="bg-gradient-to-r from-accent-blueCheese-default via-accent-cheese-default to-accent-avocado-default bg-clip-text font-bold text-transparent typo-title3">
          Happening Now
        </h2>
      }
    >
      <div className="relative flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-hidden laptop:h-full">
        {!shouldUseMobileLayout && (
          <HighlightDesktopRail
            activeIndex={activeIndex}
            highlights={highlights}
            isNavigationReady={isNavigationReady}
            onMouseEnter={onDesktopRailMouseEnter}
            onMouseLeave={onDesktopRailMouseLeave}
            onScroll={markDesktopHighlightsScrolling}
            onSelectHighlight={selectHighlightFromRail}
            scrollRef={tabsScrollRef}
          />
        )}
        {shouldUseMobileLayout && (
          <HighlightMobileRail
            activeIndex={activeIndex}
            drawerContainerRef={drawerContainerRef}
            highlights={highlights}
            isDrawerMinimized={isDrawerMinimized}
            isNavigationReady={isNavigationReady}
            onRestoreDrawer={onRestoreMobileDrawer}
            onSelectHighlight={selectHighlightFromRail}
            scrollRef={tabsScrollRef}
            showRightScrollGlow={showRightScrollGlow}
            updateHighlightsRightGlow={updateHighlightsRightGlow}
          />
        )}
        <div
          ref={setArticleViewportRef}
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]"
          {...swipeHandlers}
        >
          <div className="relative overflow-hidden">
            {shouldUseMobileLayout ? (
              <HighlightMobileTrack
                activeHighlight={activeHighlight}
                currentContent={currentContent}
                isLoadingNextPost={isLoadingNextPost}
                mobilePaneStyle={highlightMobilePaneStyle}
                mobileTrackStyle={mobileTrackStyle}
                nextHighlight={nextHighlight}
                nextPaneContent={nextPaneContent}
                previousHighlight={previousHighlight}
                previousPaneContent={previousPaneContent}
              />
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
      </div>
    </BasePostModal>
  );
}
