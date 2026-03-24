import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import Link from '../utilities/Link';
import { RelativeTime } from '../utilities/RelativeTime';
import type { PostHighlight } from '../../graphql/highlights';
import { webappUrl } from '../../lib/constants';
import CloseButton from '../CloseButton';
import { MinusIcon } from '../icons';

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
    <div className="h-4 flex-1 animate-pulse rounded-8 bg-surface-hover" />
    <div className="h-3 w-10 shrink-0 animate-pulse rounded-8 bg-surface-hover" />
  </div>
);

const HighlightRow = ({
  highlight,
  index,
  onHighlightClick,
  highlightAsNew,
}: {
  highlight: PostHighlight;
  index: number;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  highlightAsNew?: boolean;
}): ReactElement => (
  <Link href={highlight.post.commentsPermalink} passHref>
    <a
      href={highlight.post.commentsPermalink}
      className={`group motion-safe:[animation:notification-bubble-enter_420ms_cubic-bezier(0.22,1,0.36,1)] motion-safe:[animation-fill-mode:both] flex items-start gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2 transition-all hover:-translate-y-px hover:bg-surface-hover ${
        highlightAsNew ? 'feed-highlights-new-item-border' : ''
      }`}
      style={{ animationDelay: `${index * 70}ms` }}
      onClick={() => onHighlightClick?.(highlight, index + 1)}
    >
      <span className="line-clamp-2 flex-1 text-primary typo-callout">
        {highlight.headline}
      </span>
      <RelativeTime
        dateTime={highlight.highlightedAt}
        className="shrink-0 text-text-tertiary typo-caption2"
      />
    </a>
  </Link>
);

export const FeedHighlightsTopModule = ({
  highlights,
  loading,
  onHighlightClick,
  onAgentsLinkClick,
}: FeedHighlightsTopModuleProps): ReactElement | null => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shouldAnimateLatestHighlight, setShouldAnimateLatestHighlight] =
    useState(false);
  const previousLatestHighlightSignatureRef = useRef<string | null>(null);
  const latestHighlightSignature = `${highlights[0]?.post.id ?? 'none'}-${highlights[0]?.highlightedAt ?? 'none'}`;

  useEffect(() => {
    window.sessionStorage.setItem(FEED_HIGHLIGHTS_FORCE_NEW_ON_REFRESH_KEY, '1');
  }, []);

  useEffect(() => {
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

    setUnreadCount((currentCount) => currentCount + 1);
    setShouldAnimateLatestHighlight(true);
    setIsDismissed(false);
    setIsPopoverOpen(!isMinimizeCooldownActive());
  }, [latestHighlightSignature, highlights.length]);

  useEffect(() => {
    const handleSimulatedNewMessage = (): void => {
      setUnreadCount((currentCount) => currentCount + 1);
      setShouldAnimateLatestHighlight(true);
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
    if (!isPopoverOpen || unreadCount === 0) {
      return;
    }

    setUnreadCount(0);
  }, [isPopoverOpen, unreadCount]);

  useEffect(() => {
    if (!shouldAnimateLatestHighlight) {
      return;
    }

    const timer = window.setTimeout(() => setShouldAnimateLatestHighlight(false), 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shouldAnimateLatestHighlight]);

  if (!loading && highlights.length === 0) {
    return null;
  }

  const shouldShowCollapsedButton = !isDismissed;

  return (
    <>
      {!isDismissed && (
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
              {loading
                ? HIGHLIGHT_SKELETON_KEYS.map((key) => (
                    <HighlightRowSkeleton key={key} />
                  ))
                : highlights.map((highlight, index) => (
                    <HighlightRow
                      key={`${highlight.channel}-${highlight.post.id}`}
                      highlight={highlight}
                      index={index}
                      highlightAsNew={index === 0 && shouldAnimateLatestHighlight}
                      onHighlightClick={onHighlightClick}
                    />
                  ))}

              {!loading && (
                <Link href={`${webappUrl}agents`} passHref>
                  <a
                    href={`${webappUrl}agents`}
                    className="flex items-center rounded-12 border border-border-subtlest-tertiary bg-surface-float/70 px-4 py-2.5 backdrop-blur-xl transition-all hover:-translate-y-px hover:bg-surface-hover"
                    onClick={onAgentsLinkClick}
                  >
                    <span className="typo-callout">
                      <span className="text-primary">more at daily.dev/</span>
                      <span className="feed-highlights-title-gradient">agents</span>
                    </span>
                    <span
                      aria-hidden
                      className="feed-highlights-title-gradient ml-auto select-none leading-none typo-title1"
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
