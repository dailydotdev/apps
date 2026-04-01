import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSwipeable } from 'react-swipeable';
import type { SwipeEventData } from 'react-swipeable';
import type { ModalProps } from './common/Modal';
import BasePostModal from './BasePostModal';
import { PostContent } from '../post/PostContent';
import type { MenuItemProps } from '../dropdown/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Drawer } from '../drawers/Drawer';
import { Origin } from '../../lib/log';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import type { PostHighlight } from '../../graphql/highlights';
import { RelativeTime } from '../utilities/RelativeTime';
import type { Source } from '../../graphql/sources';
import { sourceQueryOptions } from '../../graphql/sources';
import { ArrowIcon, EyeIcon, MenuIcon, PlusIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../hooks';
import useFeedSettings from '../../hooks/useFeedSettings';
import { useSourceActions } from '../../hooks/source/useSourceActions';
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

const AGENTS_DIGEST_SOURCE_ID = 'agents_digest';

export function HappeningNowPostModal({
  selectedPostId,
  highlights,
  isOpen,
  onRequestClose,
  onSelectPost,
}: HappeningNowPostModalProps): ReactElement | null {
  const SWIPE_COMMIT_DURATION_MS = 220;
  const [lastLoadedPost, setLastLoadedPost] = useState<Post | null>(null);
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [isSwipeDragging, setIsSwipeDragging] = useState(false);
  const [isSwipeTransitioning, setIsSwipeTransitioning] = useState(false);
  const [showRightScrollGlow, setShowRightScrollGlow] = useState(false);
  const highlightsScrollRef = useRef<HTMLDivElement>(null);
  const drawerContainerRef = useRef<HTMLDivElement>(null);
  const articleViewportRef = useRef<HTMLDivElement>(null);
  const swipeTransitionTimeoutRef = useRef<number | null>(null);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldUseMobileLayout = hasHydrated && !isLaptop;
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { data: digestSource } = useQuery(
    sourceQueryOptions({ sourceId: AGENTS_DIGEST_SOURCE_ID }),
  );
  const { feedSettings, isLoading: isFeedSettingsLoading } = useFeedSettings({
    enabled: isLoggedIn && !!digestSource?.id,
  });
  const { isFollowing, toggleFollow } = useSourceActions({
    source: digestSource as Source,
  });
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
  const { onLoad } = usePostNavigationPosition({
    isDisplayed: isOpen,
    offset: 0,
  });

  useEffect(() => {
    setHasHydrated(true);
  }, []);
  useEffect(() => {
    if (!post?.id) {
      return;
    }

    setLastLoadedPost(post);
  }, [post]);
  useEffect(() => {
    if (!isOpen || !shouldUseMobileLayout) {
      return;
    }

    setIsDrawerMinimized(false);
  }, [isOpen, shouldUseMobileLayout]);
  const updateHighlightsRightGlow = useCallback((): void => {
    const scrollContainer = highlightsScrollRef.current;

    if (!scrollContainer) {
      setShowRightScrollGlow(false);
      return;
    }

    const hasScrollableRight =
      scrollContainer.scrollLeft + scrollContainer.clientWidth <
      scrollContainer.scrollWidth - 1;
    setShowRightScrollGlow(hasScrollableRight);
  }, []);
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (shouldUseMobileLayout && isDrawerMinimized) {
      return;
    }

    let rafId: number | null = null;
    let delayedRafId: number | null = null;
    let delayedTimeoutId: number | null = null;

    const scrollActiveIntoView = (): boolean => {
      const container = highlightsScrollRef.current;
      if (!container) {
        return false;
      }

      const activeButton = container.querySelector<HTMLElement>(
        `[data-highlight-index="${activeIndex}"]`,
      );
      if (!activeButton) {
        return false;
      }

      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      updateHighlightsRightGlow();
      return true;
    };

    const attemptScroll = (attempt = 0): void => {
      const hasScrolled = scrollActiveIntoView();
      if (hasScrolled || attempt >= 6) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        attemptScroll(attempt + 1);
      });
    };

    // First attempt immediately after mount/update.
    delayedRafId = window.requestAnimationFrame(() => {
      attemptScroll();
    });

    // On mobile, drawer render/transition can delay layout; run one more attempt.
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
    activeIndex,
    isOpen,
    isDrawerMinimized,
    shouldUseMobileLayout,
    updateHighlightsRightGlow,
  ]);
  useEffect(() => {
    if (!isOpen || !shouldUseMobileLayout || isDrawerMinimized) {
      setShowRightScrollGlow(false);
      return;
    }

    const rafId = window.requestAnimationFrame(updateHighlightsRightGlow);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    activeIndex,
    isDrawerMinimized,
    isOpen,
    shouldUseMobileLayout,
    updateHighlightsRightGlow,
  ]);
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
  const resetSwipeDrag = useCallback((): void => {
    setSwipeOffsetX(0);
    setIsSwipeDragging(false);
  }, []);
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
      const inOffset = direction === 'left' ? viewportWidth : -viewportWidth;

      setSwipeOffsetX(outOffset);
      swipeTransitionTimeoutRef.current = window.setTimeout(() => {
        navigate();
        setSwipeOffsetX(inOffset);
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setSwipeOffsetX(0);
          });
        });

        swipeTransitionTimeoutRef.current = window.setTimeout(() => {
          setIsSwipeTransitioning(false);
          swipeTransitionTimeoutRef.current = null;
        }, SWIPE_COMMIT_DURATION_MS);
      }, SWIPE_COMMIT_DURATION_MS);
    },
    [
      SWIPE_COMMIT_DURATION_MS,
      clearSwipeTransitionTimeout,
      getSwipeViewportWidth,
      isSwipeTransitioning,
    ],
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

      // Keep vertical reading scroll dominant.
      if (eventData.absY > eventData.absX) {
        return false;
      }

      return true;
    },
    [isLoadingNextPost, isSwipeTransitioning, shouldUseMobileLayout],
  );
  const compactOptions = useMemo<MenuItemProps[]>(() => {
    const isFollowStatePending =
      !isAuthReady || (isLoggedIn && (isFeedSettingsLoading || !feedSettings));
    const shouldShowSubscribeOption =
      !!digestSource?.id && !isFollowStatePending && !isFollowing;

    return [
      ...(shouldShowSubscribeOption
        ? [
            {
              label: 'Subscribe',
              icon: <PlusIcon />,
              action: async () => toggleFollow(),
            },
          ]
        : []),
      {
        label: 'Hide',
        icon: <EyeIcon />,
        action: () => onRequestClose?.(),
      },
    ];
  }, [
    digestSource?.id,
    feedSettings,
    isAuthReady,
    isFeedSettingsLoading,
    isFollowing,
    isLoggedIn,
    onRequestClose,
    toggleFollow,
  ]);
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
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      if (!shouldHandleArticleSwipe(eventData)) {
        return;
      }

      const deltaX = eventData.deltaX;
      const maxOffset = getSwipeViewportWidth() * 0.6;
      const nextOffset = Math.max(
        -maxOffset,
        Math.min(maxOffset, deltaX),
      );

      setSwipeOffsetX(nextOffset);
      setIsSwipeDragging(true);
    },
    onSwipedLeft: (eventData) => {
      if (!shouldHandleArticleSwipe(eventData)) {
        resetSwipeDrag();
        return;
      }

      if (!canNavigateNext) {
        resetSwipeDrag();
        return;
      }

      commitSwipeNavigation('left', onNextPostAndOpenDrawer);
    },
    onSwipedRight: (eventData) => {
      if (!shouldHandleArticleSwipe(eventData)) {
        resetSwipeDrag();
        return;
      }

      if (!canNavigatePrevious) {
        resetSwipeDrag();
        return;
      }

      commitSwipeNavigation('right', onPreviousPostAndOpenDrawer);
    },
    trackTouch: true,
    delta: 12,
  });
  useEffect(() => {
    return () => {
      clearSwipeTransitionTimeout();
    };
  }, [clearSwipeTransitionTimeout]);
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
      navigationContainerClassName="!py-2"
      navigationLeadingContent={
        <h2 className="feed-highlights-title-gradient feed-highlights-title-gradient-card-animation font-bold typo-title3">
          Happening Now
        </h2>
      }
      navigationCustomActions={
        <DropdownMenu>
          <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<MenuIcon />}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="!py-0.5">
            {compactOptions.map(({ label, icon, action, disabled }) => (
              <DropdownMenuItem
                key={label}
                onClick={action}
                disabled={disabled}
                className="!h-6 !px-1.5"
              >
                <button
                  type="button"
                  className="inline-flex flex-1 items-center gap-1.5"
                  role="menuitem"
                >
                  {icon} {label}
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="relative flex min-h-0 max-w-full flex-col laptop:h-full">
        {!shouldUseMobileLayout && (
          <section className="relative w-full max-w-full shrink-0 border-b border-border-subtlest-tertiary">
            <div className="flex items-center gap-2 px-3 py-3">
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-white text-background-default transition-colors enabled:hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous article"
                onClick={onPreviousPost}
                disabled={!canNavigatePrevious}
              >
                <ArrowIcon className="-rotate-90 [&_path]:fill-background-default" />
              </button>
              <div
                ref={highlightsScrollRef}
                className="min-w-0 flex-1 overflow-x-auto"
              >
                <div className="flex min-w-max gap-1 pr-2">
                  {highlights.map((highlight, index) => {
                    const isActive = index === activeIndex;

                    return (
                      <button
                        data-highlight-index={index}
                        key={`${highlight.channel}-${highlight.post.id}`}
                        type="button"
                        className={`flex w-56 min-w-56 shrink-0 flex-col items-start gap-0.5 rounded-8 px-2.5 py-2 text-left transition-colors ${
                          isActive
                            ? 'feed-highlights-new-item-border bg-surface-hover'
                            : 'border border-transparent hover:bg-surface-hover'
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
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-white text-background-default transition-colors enabled:hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next article"
                onClick={onNextPost}
                disabled={!canNavigateNext}
              >
                <ArrowIcon className="rotate-90 [&_path]:fill-background-default" />
              </button>
            </div>
          </section>
        )}
        <div
          ref={articleViewportRef}
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] ${
            shouldUseMobileLayout && !isDrawerMinimized ? 'pt-16' : ''
          }`}
          {...swipeHandlers}
        >
          <div className="relative overflow-hidden">
            <div
              className={`transition-opacity duration-200 ${
                isLoadingNextPost ? 'opacity-55' : 'opacity-100'
              } relative z-10`}
              style={{
                transform: `translate3d(${swipeOffsetX}px, 0, 0)`,
                transition: isSwipeDragging
                  ? 'opacity 200ms'
                  : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms',
                willChange: 'transform',
              }}
            >
              <PostContent
                post={resolvedPost}
                postPosition={postPosition}
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
          </div>
        </div>

        {shouldUseMobileLayout && isDrawerMinimized && (
          <div className="pointer-events-none fixed inset-x-0 bottom-2 z-modal px-2">
            <div className="pointer-events-auto">
              <button
                type="button"
                className="flex h-10 w-full items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-default/95 px-3 backdrop-blur-sm"
                onClick={() => setIsDrawerMinimized(false)}
              >
                <span className="feed-highlights-title-gradient font-bold typo-callout">
                  Happening Now
                </span>
                <span className="ml-auto text-text-tertiary">
                  <ArrowIcon className="[&_path]:fill-text-tertiary" />
                </span>
              </button>
            </div>
          </div>
        )}
        {shouldUseMobileLayout && (
          <Drawer
            isOpen={!isDrawerMinimized}
            onClose={() => setIsDrawerMinimized(true)}
            closeOnOutsideClick={false}
            isFullScreen
            className={{
              overlay: '!bg-transparent !pointer-events-none',
              wrapper:
                '!inset-auto !left-0 !right-0 !top-12 !bottom-auto !max-h-[calc(100%-8rem)] !rounded-b-16 !rounded-t-none !pointer-events-auto !pr-0',
              drawer: 'p-0',
            }}
          >
            <div ref={drawerContainerRef} className="flex items-center px-2 py-2">
              <div className="relative min-w-0 flex-1">
                <div
                  ref={highlightsScrollRef}
                  className="min-w-0 flex-1 overflow-x-auto"
                  onScroll={updateHighlightsRightGlow}
                >
                  <div className="flex min-w-max gap-1 pr-2">
                    {highlights.map((highlight, index) => {
                      const isActive = index === activeIndex;

                      return (
                        <button
                          data-highlight-index={index}
                          key={`${highlight.channel}-${highlight.post.id}`}
                          type="button"
                          className={`flex w-56 min-w-56 shrink-0 flex-col items-start gap-0.5 rounded-8 px-2.5 py-2 text-left transition-colors ${
                            isActive
                              ? 'feed-highlights-new-item-border bg-surface-hover'
                              : 'border border-transparent hover:bg-surface-hover'
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
                <div
                  className={`pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-12 bg-gradient-to-l from-background-default to-transparent transition-opacity duration-200 ${
                    showRightScrollGlow ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            </div>
          </Drawer>
        )}
      </div>
    </BasePostModal>
  );
}
