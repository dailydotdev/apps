import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSwipeable } from 'react-swipeable';
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
  const [lastLoadedPost, setLastLoadedPost] = useState<Post | null>(null);
  const [isDrawerMinimized, setIsDrawerMinimized] = useState(false);
  const highlightsScrollRef = useRef<HTMLDivElement>(null);
  const drawerContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useViewSize(ViewSize.MobileL);
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
  useEffect(() => {
    if (!isOpen || !isMobile) {
      return;
    }

    setIsDrawerMinimized(false);
  }, [isMobile, isOpen]);
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = highlightsScrollRef.current;

    if (!container) {
      return;
    }

    const activeButton = container.querySelector<HTMLElement>(
      `[data-highlight-index="${activeIndex}"]`,
    );

    activeButton?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeIndex, isOpen]);
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
    if (isMobile) {
      setIsDrawerMinimized(false);
    }
  }, [isMobile, onPreviousPost]);
  const onNextPostAndOpenDrawer = useCallback((): void => {
    onNextPost();
    if (isMobile) {
      setIsDrawerMinimized(false);
    }
  }, [isMobile, onNextPost]);
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
    onSwipedLeft: (eventData) => {
      if (!isMobile || !canNavigateNext) {
        return;
      }

      const target = eventData.event.target as Node | null;
      if (target && drawerContainerRef.current?.contains(target)) {
        return;
      }

      onNextPostAndOpenDrawer();
    },
    onSwipedRight: (eventData) => {
      if (!isMobile || !canNavigatePrevious) {
        return;
      }

      const target = eventData.event.target as Node | null;
      if (target && drawerContainerRef.current?.contains(target)) {
        return;
      }

      onPreviousPostAndOpenDrawer();
    },
  });
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
        {!isMobile && (
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
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto" {...swipeHandlers}>
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
                  fixedNavigation: {
                    container:
                      '!left-1/2 !-translate-x-1/2 !w-[min(calc(100vw-2rem),69.25rem)] !max-w-[min(calc(100vw-2rem),69.25rem)]',
                  },
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

        {isMobile && (
          <div ref={drawerContainerRef} className="pointer-events-none absolute inset-x-0 bottom-0 z-1 px-2 pb-2">
            {isDrawerMinimized ? (
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
            ) : (
              <div className="pointer-events-auto rounded-12 border border-border-subtlest-tertiary bg-background-default/95 backdrop-blur-sm">
                <div className="flex items-center border-b border-border-subtlest-tertiary px-2.5 py-2">
                  <span className="feed-highlights-title-gradient font-bold typo-callout">
                    Happening Now
                  </span>
                  <button
                    type="button"
                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-white text-background-default transition-colors hover:bg-white/90"
                    aria-label="Minimize happening now drawer"
                    onClick={() => setIsDrawerMinimized(true)}
                  >
                    <ArrowIcon className="rotate-180 [&_path]:fill-background-default" />
                  </button>
                </div>
                <div className="flex items-center gap-2 px-2 py-2">
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-white text-background-default transition-colors enabled:hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Previous article"
                    onClick={onPreviousPostAndOpenDrawer}
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
                                isActive
                                  ? 'text-text-primary'
                                  : 'text-text-secondary'
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
                    onClick={onNextPostAndOpenDrawer}
                    disabled={!canNavigateNext}
                  >
                    <ArrowIcon className="rotate-90 [&_path]:fill-background-default" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </BasePostModal>
  );
}
