import type { MouseEvent, ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
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
import { EyeIcon, MenuIcon, PlusIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import { useSourceActions } from '../../hooks/source/useSourceActions';
import { useFeedLayout } from '../../hooks/useFeedLayout';
import { useViewSize, ViewSize } from '../../hooks/useViewSize';

interface FeedHighlightsTopModuleProps {
  highlights: PostHighlight[];
  loading: boolean;
  onHighlightClick?: (
    highlight: PostHighlight,
    position: number,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  onReadAllClick?: () => void;
}

const HIGHLIGHT_SKELETON_KEYS = [
  'one',
  'two',
  'three',
  'four',
  'five',
] as const;
const AGENTS_DIGEST_SOURCE_ID = 'agents_digest';
const FEED_HIGHLIGHTS_CARD_VERSION = 'v2' as const;
const FEED_HIGHLIGHTS_VISIBLE_COUNT = 4;

const HighlightRowSkeleton = (): ReactElement => (
  <div className="flex flex-1 items-start gap-2 border-b border-border-subtlest-tertiary px-2.5 py-2">
    <div className="h-4 flex-1 rounded-8 bg-surface-hover" />
    <div className="h-3 w-10 shrink-0 rounded-8 bg-surface-hover" />
  </div>
);

const HighlightRowV1 = ({
  highlight,
  index,
  onHighlightClick,
  highlightAsNew,
  isViewed,
  isRead,
  onViewed,
  onRead,
}: {
  highlight: PostHighlight;
  index: number;
  onHighlightClick?: (
    highlight: PostHighlight,
    position: number,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  highlightAsNew?: boolean;
  isViewed: boolean;
  isRead: boolean;
  onViewed: () => void;
  onRead: () => void;
}): ReactElement => {
  const isInteracted = isViewed || isRead;
  const rowTextColorClass = isInteracted
    ? 'text-secondary visited:text-secondary'
    : 'text-primary visited:text-secondary';
  const headlineTextColorClass = 'text-primary';

  return (
    <Link href={highlight.post.commentsPermalink} passHref>
      <a
        href={highlight.post.commentsPermalink}
        className={`group flex flex-1 flex-col gap-0 border-b border-border-subtlest-tertiary px-3 py-2 transition-all ${rowTextColorClass} ${
          isViewed ? 'bg-surface-hover/30' : ''
        }`}
        onMouseEnter={onViewed}
        onClick={(event) => {
          onRead();
          onHighlightClick?.(highlight, index + 1, event);
        }}
      >
        <div className="mt-0 leading-none">
          {highlightAsNew ? (
            <span className="feed-highlights-title-gradient typo-caption2">
              Now
            </span>
          ) : (
            <RelativeTime
              dateTime={highlight.highlightedAt}
              className="text-text-tertiary typo-caption2"
            />
          )}
        </div>
        <span
          className={`line-clamp-2 font-bold transition-colors typo-callout ${headlineTextColorClass}`}
        >
          {highlight.headline}
        </span>
      </a>
    </Link>
  );
};

const HighlightRowV2 = ({
  highlight,
  index,
  onHighlightClick,
  isViewed,
  isRead,
  onViewed,
  onRead,
}: {
  highlight: PostHighlight;
  index: number;
  onHighlightClick?: (
    highlight: PostHighlight,
    position: number,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  highlightAsNew?: boolean;
  isViewed: boolean;
  isRead: boolean;
  onViewed: () => void;
  onRead: () => void;
}): ReactElement => {
  const isInteracted = isViewed || isRead;
  const rowTextColorClass = isInteracted
    ? 'text-secondary visited:text-secondary'
    : 'text-primary visited:text-secondary';
  const headlineTextColorClass = 'text-primary';

  return (
    <Link href={highlight.post.commentsPermalink} passHref>
      <a
        href={highlight.post.commentsPermalink}
        className={`group flex flex-1 flex-col gap-0 border-b border-border-subtlest-tertiary px-3 py-2 transition-all ${rowTextColorClass} ${
          isViewed ? 'bg-surface-hover/30' : ''
        }`}
        onMouseEnter={onViewed}
        onClick={(event) => {
          onRead();
          onHighlightClick?.(highlight, index + 1, event);
        }}
      >
        <span
          className={`line-clamp-2 font-bold transition-colors typo-callout ${headlineTextColorClass}`}
        >
          {highlight.headline}
        </span>
        <div className="text-text-tertiary typo-footnote">
          <RelativeTime
            dateTime={highlight.highlightedAt}
            className="text-text-tertiary typo-footnote"
          />
        </div>
      </a>
    </Link>
  );
};

export const FeedHighlightsTopModule = ({
  highlights,
  loading,
  onHighlightClick,
  onReadAllClick,
}: FeedHighlightsTopModuleProps): ReactElement | null => {
  const isLaptop = useViewSize(ViewSize.Laptop);
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
  const [isHiddenLocally, setIsHiddenLocally] = useState(false);
  const [viewedHighlightIds, setViewedHighlightIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [readHighlightIds, setReadHighlightIds] = useState<Set<string>>(
    () => new Set(),
  );
  const options = useMemo<MenuItemProps[]>(() => {
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
  }, [
    digestSource?.id,
    feedSettings,
    isAuthReady,
    isFeedSettingsLoading,
    isFollowing,
    isLoggedIn,
    toggleFollow,
  ]);

  if (isHiddenLocally) {
    return null;
  }

  if (!loading && highlights.length === 0) {
    return null;
  }

  const topHighlights = highlights.slice(0, FEED_HIGHLIGHTS_VISIBLE_COUNT);
  const HighlightRowComponent =
    FEED_HIGHLIGHTS_CARD_VERSION === 'v2' ? HighlightRowV2 : HighlightRowV1;
  const shouldShowSkeleton = loading;
  const shouldUseMobileListStyles = shouldUseListFeedLayout && !isLaptop;
  const sectionClassName = shouldUseMobileListStyles
    ? 'rounded-16 border-t border-border-subtlest-tertiary bg-gradient-to-b from-surface-float to-background-default px-4 py-6'
    : 'rounded-16 border border-border-subtlest-tertiary bg-surface-float';
  const headerClassName = shouldUseMobileListStyles
    ? 'relative flex items-center pb-4'
    : 'relative flex items-center px-4 py-4';
  const contentClassName = shouldUseMobileListStyles
    ? 'flex flex-1 flex-col gap-2'
    : 'flex flex-1 flex-col gap-0 px-2.5 pb-1 pt-0';
  const footerClassName = shouldUseMobileListStyles ? 'pt-1.5' : 'px-1 pb-1';
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
    <section
      className={`group relative mb-0 flex h-full w-full flex-col overflow-hidden ${sectionClassName}`}
    >
      <header className={headerClassName}>
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

      <div className={contentClassName}>
        {shouldShowSkeleton
          ? HIGHLIGHT_SKELETON_KEYS.slice(0, FEED_HIGHLIGHTS_VISIBLE_COUNT).map((key) => (
              <HighlightRowSkeleton key={key} />
            ))
          : topHighlights.map((highlight, index) => (
              <HighlightRowComponent
                key={`${highlight.channel}-${highlight.post.id}`}
                highlight={highlight}
                index={index}
                highlightAsNew={index === 0}
                isViewed={viewedHighlightIds.has(highlight.post.id)}
                isRead={readHighlightIds.has(highlight.post.id)}
                onViewed={() => markHighlightViewed(highlight.post.id)}
                onRead={() => markHighlightRead(highlight.post.id)}
                onHighlightClick={onHighlightClick}
              />
            ))}
      </div>
      {!shouldShowSkeleton && (
        <div className={footerClassName}>
          <button
            type="button"
            className="bg-surface-float/70 flex h-8 w-full items-center rounded-10 px-3 backdrop-blur-xl"
            onClick={onReadAllClick}
          >
            <span className="typo-callout">
              <span className="feed-highlights-title-gradient">Read all</span>
            </span>
            <span
              aria-hidden
              className="feed-highlights-title-gradient ml-auto select-none leading-none typo-title3"
            >
              →
            </span>
          </button>
        </div>
      )}
    </section>
  );
};
