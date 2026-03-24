import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
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
import { webappUrl } from '../../lib/constants';
import { EyeIcon, MenuIcon } from '../icons';

interface FeedHighlightsTopModuleProps {
  highlights: PostHighlight[];
  loading: boolean;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onAgentsLinkClick?: () => void;
  onSubscribeClick?: () => void;
}

const HIGHLIGHT_SKELETON_KEYS = ['one', 'two', 'three', 'four', 'five'] as const;

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
}: {
  highlight: PostHighlight;
  index: number;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
}): ReactElement => (
  <Link href={highlight.post.commentsPermalink} passHref>
    <a
      href={highlight.post.commentsPermalink}
      className="group motion-safe:[animation:notification-bubble-enter_420ms_cubic-bezier(0.22,1,0.36,1)] motion-safe:[animation-fill-mode:both] flex items-start gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2 transition-all hover:-translate-y-px hover:bg-surface-hover"
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
  onSubscribeClick,
}: FeedHighlightsTopModuleProps): ReactElement | null => {
  const [isHiddenLocally, setIsHiddenLocally] = useState(false);

  const options = useMemo<MenuItemProps[]>(
    () => [
      {
        label: 'Hide',
        icon: <EyeIcon />,
        action: () => setIsHiddenLocally(true),
      },
    ],
    [],
  );

  if (isHiddenLocally) {
    return null;
  }

  if (!loading && highlights.length === 0) {
    return null;
  }

  const topHighlights = highlights.slice(0, 4);

  return (
    <section className="group relative mb-4 flex h-[25.375rem] w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
      <header className="relative flex items-center px-4 py-4">
        <div className="flex items-center gap-2 pr-2">
          <h2 className="feed-highlights-title-gradient font-bold typo-title3">
            Happening Now
          </h2>
        </div>
        <span className="ml-auto flex flex-row laptop:mouse:invisible laptop:mouse:group-hover:visible">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="mr-2 w-28"
            onClick={onSubscribeClick}
          >
            Subscribe
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger tooltip={{ content: 'Options' }} asChild>
              <Button
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<MenuIcon />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="feed-highlights-menu-content">
              <DropdownMenuOptions options={options} />
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </header>

      <div className="flex flex-col gap-1.5 px-2.5 py-2.5 pb-[4rem]">
        {loading
          ? HIGHLIGHT_SKELETON_KEYS.slice(0, 4).map((key) => (
              <HighlightRowSkeleton key={key} />
            ))
          : topHighlights.map((highlight, index) => (
              <HighlightRow
                key={`${highlight.channel}-${highlight.post.id}`}
                highlight={highlight}
                index={index}
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

    </section>
  );
};
