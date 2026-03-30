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
import { webappUrl } from '../../lib/constants';
import { EyeIcon, MenuIcon, PlusIcon } from '../icons';
import { useAuthContext } from '../../contexts/AuthContext';
import useFeedSettings from '../../hooks/useFeedSettings';
import { useSourceActions } from '../../hooks/source/useSourceActions';

interface FeedHighlightsTopModuleProps {
  highlights: PostHighlight[];
  loading: boolean;
  onHighlightClick?: (
    highlight: PostHighlight,
    position: number,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  onAgentsLinkClick?: () => void;
}

const HIGHLIGHT_SKELETON_KEYS = [
  'one',
  'two',
  'three',
  'four',
  'five',
] as const;
const AGENTS_DIGEST_SOURCE_ID = 'agents_digest';

const HighlightRowSkeleton = (): ReactElement => (
  <div className="flex flex-1 items-start gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2">
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
  onHighlightClick?: (
    highlight: PostHighlight,
    position: number,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
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
        className={`group flex flex-1 flex-col rounded-8 border border-border-subtlest-tertiary px-2.5 py-1 transition-all hover:-translate-y-px hover:bg-surface-hover ${rowTextColorClass} ${
          isViewed && !isPressed ? 'bg-surface-hover/30' : ''
        } ${isPressed ? 'translate-y-0 bg-surface-hover' : ''}`}
        onMouseEnter={onViewed}
        onMouseDown={() => onPressedChange(true)}
        onMouseUp={() => onPressedChange(false)}
        onMouseLeave={() => onPressedChange(false)}
        onBlur={() => onPressedChange(false)}
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
          className={`line-clamp-2 transition-colors typo-callout group-active:text-text-secondary ${headlineTextColorClass}`}
        >
          {highlight.headline}
        </span>
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
  const [pressedHighlightId, setPressedHighlightId] = useState<string | null>(
    null,
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

  const topHighlights = highlights.slice(0, 4);
  const shouldShowSkeleton = loading;
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
      className="group relative mb-0 flex h-full w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float"
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

      <div className="flex flex-1 flex-col gap-1.5 px-2.5 pb-1 pt-0">
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
      </div>
      {!shouldShowSkeleton && (
        <div className="px-1 pb-1">
          <Link href={`${webappUrl}agents`} passHref>
            <a
              href={`${webappUrl}agents`}
              className="bg-surface-float/70 flex h-8 items-center rounded-10 px-3 backdrop-blur-xl"
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
        </div>
      )}
    </section>
  );
};
