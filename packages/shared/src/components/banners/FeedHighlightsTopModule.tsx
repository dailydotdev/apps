import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { MenuItemProps } from '../dropdown/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuOptions,
  DropdownMenuTrigger,
} from '../dropdown/DropdownMenu';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Link from '../utilities/Link';
import { RelativeTime } from '../utilities/RelativeTime';
import type { PostHighlight } from '../../graphql/highlights';
import type { Source } from '../../graphql/sources';
import { sourceQueryOptions } from '../../graphql/sources';
import { webappUrl } from '../../lib/constants';
import CloseButton from '../CloseButton';
import { EyeIcon, MenuIcon, MinusIcon, PlusIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import { useFeedLayout } from '../../hooks';
import { useSourceActions } from '../../hooks/source/useSourceActions';

interface FeedHighlightsTopModuleProps {
  highlights: PostHighlight[];
  loading: boolean;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onAgentsLinkClick?: () => void;
}

const HIGHLIGHT_SKELETON_KEYS = ['one', 'two', 'three', 'four', 'five'] as const;
const FEED_HIGHLIGHTS_SIMULATE_EVENT = 'feed-highlights:simulate-new';
const FEED_HIGHLIGHTS_MINIMIZED_UNTIL_KEY = 'feed-highlights:minimized-until';
const FEED_HIGHLIGHTS_MINIMIZE_DURATION_MS = 24 * 60 * 60 * 1000;
const FEED_HIGHLIGHTS_FORCE_NEW_ON_REFRESH_KEY =
  'feed-highlights:force-new-on-refresh';
const FEED_HIGHLIGHTS_LATEST_SEEN_SIGNATURE_KEY =
  'feed-highlights:latest-seen-signature';
const isFeedHighlightsUi2Enabled = false;
const AGENTS_DIGEST_SOURCE_ID = 'agents_digest';

const getMinimizedUntil = (): number => {
  if (typeof window === 'undefined') {
    return 0;
  }

  const value = Number(window.localStorage.getItem(FEED_HIGHLIGHTS_MINIMIZED_UNTIL_KEY));
  return Number.isFinite(value) ? value : 0;
};

const isMinimizeCooldownActive = (): boolean =>
  getMinimizedUntil() > Date.now();

const HighlightRowSkeleton = (): ReactElement => (
  <div className="flex items-start gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2">
    <div className="h-4 flex-1 rounded-8 bg-surface-hover" />
    <div className="h-3 w-10 shrink-0 rounded-8 bg-surface-hover" />
  </div>
);

const HighlightRow = ({
  highlight,
  index,
  onHighlightClick,
  highlightAsNew,
  isViewed,
  isRead,
  isPressed,
  onViewed,
  onPressedChange,
  onRead,
}: {
  highlight: PostHighlight;
  index: number;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  highlightAsNew?: boolean;
  isViewed: boolean;
  isRead: boolean;
  isPressed: boolean;
  onViewed: () => void;
  onPressedChange: (isPressed: boolean) => void;
  onRead: () => void;
}): ReactElement => {
  const isInteracted = isViewed || isRead || isPressed;
  const rowTextColorClass = isInteracted
    ? 'text-secondary visited:text-secondary'
    : 'text-primary visited:text-secondary';
  const headlineTextColorClass = isInteracted
    ? 'text-text-secondary'
    : 'text-inherit';

  return (
    <Link href={highlight.post.commentsPermalink} passHref>
      <a
        href={highlight.post.commentsPermalink}
        className={`group flex items-start gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2 transition-all hover:-translate-y-px hover:bg-surface-hover ${rowTextColorClass} ${
          isViewed && !isPressed ? 'bg-surface-hover/30' : ''
        } ${isPressed ? 'translate-y-0 bg-surface-hover' : ''}`}
        onMouseEnter={onViewed}
        onMouseDown={() => onPressedChange(true)}
        onMouseUp={() => onPressedChange(false)}
        onMouseLeave={() => onPressedChange(false)}
        onBlur={() => onPressedChange(false)}
        onClick={() => {
          onRead();
          onHighlightClick?.(highlight, index + 1);
        }}
      >
        <span
          className={`line-clamp-2 flex-1 transition-colors group-active:text-text-secondary typo-callout ${headlineTextColorClass}`}
        >
          {highlight.headline}
        </span>
        {highlightAsNew ? (
          <span className="feed-highlights-title-gradient shrink-0 typo-caption2">
            Now
          </span>
        ) : (
          <RelativeTime
            dateTime={highlight.highlightedAt}
            className="shrink-0 text-text-tertiary typo-caption2"
          />
        )}
      </a>
    </Link>
  );
};

export const FeedHighlightsTopModule = ({
  highlights,
  loading,
  onHighlightClick,
  onAgentsLinkClick,
}: FeedHighlightsTopModuleProps): ReactElement | null => {
  const { shouldUseListFeedLayout } = useFeedLayout();
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isHiddenLocally, setIsHiddenLocally] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLatestHighlightNewForSession, setIsLatestHighlightNewForSession] =
    useState(false);
  const [viewedHighlightIds, setViewedHighlightIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [readHighlightIds, setReadHighlightIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [pressedHighlightId, setPressedHighlightId] = useState<string | null>(
    null,
  );
  const previousLatestHighlightSignatureRef = useRef<string | null>(null);
  const latestHighlightSignature = `${highlights[0]?.post.id ?? 'none'}-${highlights[0]?.highlightedAt ?? 'none'}`;

  useEffect(() => {
    if (!isFeedHighlightsUi2Enabled) {
      return;
    }

    window.sessionStorage.setItem(FEED_HIGHLIGHTS_FORCE_NEW_ON_REFRESH_KEY, '1');
  }, []);

  useEffect(() => {
    if (!isFeedHighlightsUi2Enabled) {
      return;
    }

    if (
      window.sessionStorage.getItem(FEED_HIGHLIGHTS_FORCE_NEW_ON_REFRESH_KEY) !==
      '1'
    ) {
      return;
    }

    setUnreadCount((currentCount) => currentCount + 1);
    setIsDismissed(false);
    setIsPopoverOpen(false);
  }, []);

  useEffect(() => {
    if (!highlights.length) {
      return;
    }

    const previousLatestHighlightSignature =
      previousLatestHighlightSignatureRef.current;
    previousLatestHighlightSignatureRef.current = latestHighlightSignature;

    if (!previousLatestHighlightSignature) {
      return;
    }

    if (previousLatestHighlightSignature === latestHighlightSignature) {
      return;
    }

    if (!isFeedHighlightsUi2Enabled) {
      return;
    }

    setUnreadCount((currentCount) => currentCount + 1);
    setIsDismissed(false);
    setIsPopoverOpen(!isMinimizeCooldownActive());
  }, [latestHighlightSignature, highlights.length]);

  useEffect(() => {
    if (!highlights.length || typeof window === 'undefined') {
      return;
    }

    const seenLatestHighlightSignature = window.sessionStorage.getItem(
      FEED_HIGHLIGHTS_LATEST_SEEN_SIGNATURE_KEY,
    );

    if (!seenLatestHighlightSignature) {
      window.sessionStorage.setItem(
        FEED_HIGHLIGHTS_LATEST_SEEN_SIGNATURE_KEY,
        latestHighlightSignature,
      );
      setIsLatestHighlightNewForSession(true);
      return;
    }

    if (seenLatestHighlightSignature === latestHighlightSignature) {
      setIsLatestHighlightNewForSession(false);
      return;
    }

    window.sessionStorage.setItem(
      FEED_HIGHLIGHTS_LATEST_SEEN_SIGNATURE_KEY,
      latestHighlightSignature,
    );
    setIsLatestHighlightNewForSession(true);
  }, [latestHighlightSignature, highlights.length]);

  useEffect(() => {
    if (!isFeedHighlightsUi2Enabled) {
      return;
    }

    const handleSimulatedNewMessage = (): void => {
      setUnreadCount((currentCount) => currentCount + 1);
      setIsDismissed(false);
      setIsPopoverOpen(!isMinimizeCooldownActive());
    };

    window.addEventListener(
      FEED_HIGHLIGHTS_SIMULATE_EVENT,
      handleSimulatedNewMessage,
    );

    return () => {
      window.removeEventListener(
        FEED_HIGHLIGHTS_SIMULATE_EVENT,
        handleSimulatedNewMessage,
      );
    };
  }, []);

  useEffect(() => {
    if (!isFeedHighlightsUi2Enabled) {
      return;
    }

    if (!isPopoverOpen) {
      return;
    }

    const handleScroll = (): void => {
      setIsPopoverOpen(false);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isPopoverOpen]);

  useEffect(() => {
    if (!isFeedHighlightsUi2Enabled) {
      return;
    }

    if (!isPopoverOpen || unreadCount === 0) {
      return;
    }

    setUnreadCount(0);
  }, [isPopoverOpen, unreadCount]);

  const options = useMemo<MenuItemProps[]>(
    () => {
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
          action: () => setIsHiddenLocally(true),
        },
      ];
    },
    [
      digestSource?.id,
      feedSettings,
      isAuthReady,
      isFeedSettingsLoading,
      isFollowing,
      isLoggedIn,
      toggleFollow,
    ],
  );

  if (isHiddenLocally) {
    return null;
  }

  if (!loading && highlights.length === 0) {
    return null;
  }

  const topHighlights = highlights.slice(0, 4);
  const shouldShowSkeleton = loading;
  const shouldShowCollapsedButton = isFeedHighlightsUi2Enabled && !isDismissed;
  const moduleBackgroundClass = shouldUseListFeedLayout
    ? 'bg-gradient-to-b from-surface-float to-transparent'
    : 'bg-surface-float';
  const moduleBorderClass = shouldUseListFeedLayout
    ? 'border-0 border-t border-border-subtlest-tertiary'
    : 'border border-border-subtlest-tertiary';
  const markHighlightViewed = (highlightId: string): void => {
    setViewedHighlightIds((currentIds) => {
      if (currentIds.has(highlightId)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.add(highlightId);
      return nextIds;
    });
  };
  const markHighlightRead = (highlightId: string): void => {
    setReadHighlightIds((currentIds) => {
      if (currentIds.has(highlightId)) {
        return currentIds;
      }

      const nextIds = new Set(currentIds);
      nextIds.add(highlightId);
      return nextIds;
    });
  };

  return (
    <>
      <section
        className={`group relative mb-4 flex h-full w-full flex-col overflow-hidden rounded-16 ${moduleBorderClass} ${moduleBackgroundClass}`}
      >
        <header className="relative flex items-center px-4 py-4">
          <h2 className="feed-highlights-title-gradient font-bold typo-title3">
            Happening Now
          </h2>
          <span className="ml-auto flex laptop:mouse:invisible laptop:mouse:group-hover:visible">
            <DropdownMenu>
              <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Small}
                  icon={<MenuIcon />}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuOptions options={options} />
              </DropdownMenuContent>
            </DropdownMenu>
          </span>
        </header>

        <div className="flex flex-col gap-1.5 px-2.5 pb-2.5 pt-0">
          {shouldShowSkeleton
            ? HIGHLIGHT_SKELETON_KEYS.slice(0, 4).map((key) => (
                <HighlightRowSkeleton key={key} />
              ))
            : topHighlights.map((highlight, index) => (
                <HighlightRow
                  key={`${highlight.channel}-${highlight.post.id}`}
                  highlight={highlight}
                  index={index}
                  highlightAsNew={index === 0}
                  isViewed={viewedHighlightIds.has(highlight.post.id)}
                  isRead={readHighlightIds.has(highlight.post.id)}
                  isPressed={pressedHighlightId === highlight.post.id}
                  onViewed={() => markHighlightViewed(highlight.post.id)}
                  onPressedChange={(isPressed) =>
                    setPressedHighlightId(isPressed ? highlight.post.id : null)
                  }
                  onRead={() => markHighlightRead(highlight.post.id)}
                  onHighlightClick={onHighlightClick}
                />
              ))}

          {!shouldShowSkeleton && (
            <Link href={`${webappUrl}agents`} passHref>
              <a
                href={`${webappUrl}agents`}
                className="flex items-center rounded-12 border border-border-subtlest-tertiary bg-surface-float/70 px-4 py-2.5 backdrop-blur-xl transition-all hover:-translate-y-px hover:bg-surface-hover"
                onClick={onAgentsLinkClick}
              >
                <span className="typo-callout">
                  <span className="feed-highlights-title-gradient">Show more</span>
                </span>
                <span
                  aria-hidden
                  className="feed-highlights-title-gradient ml-auto select-none leading-none typo-title3"
                >
                  →
                </span>
              </a>
            </Link>
          )}
        </div>
      </section>

      {isFeedHighlightsUi2Enabled && !isDismissed && (
        <section
          className={`fixed bottom-16 right-40 z-max hidden w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-2 backdrop-blur-[0.125rem] laptop:flex motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out ${
            isPopoverOpen
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-2 opacity-0'
          }`}
        >
          <header className="relative flex items-center px-4 py-4">
            <div className="flex items-center gap-2 pr-2">
              <h2 className="feed-highlights-title-gradient font-bold typo-title3">
                Happening Now
              </h2>
            </div>
            <Button
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              className="ml-auto mr-1"
              icon={<MinusIcon />}
              title="Minimize"
              onClick={() => {
                const minimizedUntil = Date.now() + FEED_HIGHLIGHTS_MINIMIZE_DURATION_MS;
                window.localStorage.setItem(
                  FEED_HIGHLIGHTS_MINIMIZED_UNTIL_KEY,
                  String(minimizedUntil),
                );
                setIsPopoverOpen(false);
              }}
            />
            <CloseButton
              type="button"
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={() => {
                setIsDismissed(true);
                setIsPopoverOpen(false);
              }}
            />
          </header>

          <div className="relative">
            <div className="flex max-h-[18rem] flex-col gap-1.5 overflow-y-auto px-2.5 py-2.5">
              {shouldShowSkeleton
                ? HIGHLIGHT_SKELETON_KEYS.map((key) => (
                    <HighlightRowSkeleton key={key} />
                  ))
                : highlights.map((highlight, index) => (
                    <HighlightRow
                      key={`${highlight.channel}-${highlight.post.id}`}
                      highlight={highlight}
                      index={index}
                      isViewed={viewedHighlightIds.has(highlight.post.id)}
                      isRead={readHighlightIds.has(highlight.post.id)}
                      isPressed={pressedHighlightId === highlight.post.id}
                      onViewed={() => markHighlightViewed(highlight.post.id)}
                      onPressedChange={(isPressed) =>
                        setPressedHighlightId(isPressed ? highlight.post.id : null)
                      }
                      onRead={() => markHighlightRead(highlight.post.id)}
                      onHighlightClick={onHighlightClick}
                    />
                  ))}

              {!shouldShowSkeleton && (
                <Link href={`${webappUrl}agents`} passHref>
                  <a
                    href={`${webappUrl}agents`}
                    className="flex items-center rounded-12 border border-border-subtlest-tertiary bg-surface-float/70 px-4 py-2.5 backdrop-blur-xl transition-all hover:-translate-y-px hover:bg-surface-hover"
                    onClick={onAgentsLinkClick}
                  >
                    <span className="typo-callout">
                      <span className="feed-highlights-title-gradient">
                        Show more
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="feed-highlights-title-gradient ml-auto select-none leading-none typo-title3"
                    >
                      →
                    </span>
                  </a>
                </Link>
              )}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background-default to-transparent"
            />
          </div>
        </section>
      )}

      {shouldShowCollapsedButton && (
        <div className="fixed bottom-4 right-40 z-max hidden overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default shadow-2 backdrop-blur-[0.125rem] laptop:flex">
          <button
            type="button"
            className="h-10 px-3 text-primary transition-colors hover:bg-surface-hover typo-callout font-bold"
            onClick={() =>
              setIsPopoverOpen((previousState) => {
                const isOpeningPopover = !previousState;
                if (isOpeningPopover) {
                  setUnreadCount(0);
                }

                return isOpeningPopover;
              })
            }
          >
            <span
              className={
                unreadCount > 0 && !isPopoverOpen
                  ? 'feed-highlights-title-gradient'
                  : 'text-primary'
              }
            >
              Happening now
            </span>
          </button>
        </div>
      )}
    </>
  );
};
