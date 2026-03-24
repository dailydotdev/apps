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

const HIGHLIGHT_SKELETON_KEYS = ['one', 'two', 'three', 'four'] as const;

const HighlightRowSkeleton = (): ReactElement => (
  <div className="flex items-start gap-2 rounded-8 border border-border-subtlest-tertiary px-2.5 py-2">
    <div className="h-4 flex-1 animate-pulse rounded-8 bg-surface-hover" />
    <div className="h-3 w-10 shrink-0 animate-pulse rounded-8 bg-surface-hover" />
  </div>
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

  return (
    <section className="group relative mb-4 flex h-full w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
      <header className="relative flex items-center px-4 py-3">
        <div className="flex items-center gap-2 pr-2">
          <h2 className="font-bold text-primary typo-title3">Happening Now</h2>
        </div>
        <span className="ml-auto flex flex-row laptop:mouse:invisible laptop:mouse:group-hover:visible">
          <Button
            tag="a"
            href={`${webappUrl}agents`}
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            className="mr-2"
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
            <DropdownMenuContent>
              <DropdownMenuOptions options={options} />
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </header>

      <div className="flex flex-col gap-1.5 px-2.5 py-2.5">
        {loading
          ? HIGHLIGHT_SKELETON_KEYS.map((key) => (
              <HighlightRowSkeleton key={key} />
            ))
          : highlights.slice(0, 4).map((highlight, index) => (
              <Link
                key={`${highlight.channel}-${highlight.post.id}`}
                href={highlight.post.commentsPermalink}
                passHref
              >
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
            ))}
      </div>

      <footer className="relative mt-auto flex items-center px-4 py-2.5">
        <span className="text-text-tertiary typo-caption2">More from</span>
        <Link href={`${webappUrl}agents`} passHref>
          <a
            href={`${webappUrl}agents`}
            className="ml-1.5 text-primary typo-caption1 underline-offset-2 hover:underline"
            onClick={onAgentsLinkClick}
          >
            daily.dev/agents
          </a>
        </Link>
      </footer>
    </section>
  );
};
