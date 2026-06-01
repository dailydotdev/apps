import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { PlusIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { useLogContext } from '../../contexts/LogContext';
import type { ExploreCategory } from './exploreCategories';
import { findActiveChipId } from './exploreCategories';
import { LogEvent } from '../../lib/log';
import { NewStripCta } from './NewStripCta';

interface ExploreChipsBarProps {
  categories: ExploreCategory[];
  isPending?: boolean;
  className?: string;
  // When true the chips render at the smaller h-8 size so they sit
  // uniformly inside the v2 page-header strip (min-h-14) next to the
  // h-8 action buttons.
  compact?: boolean;
}

const PLACEHOLDER_WIDTHS = ['w-20', 'w-16', 'w-24', 'w-20', 'w-28', 'w-16'];

const FOR_YOU_CATEGORY_ID = 'foryou';

export function ExploreChipsBar({
  categories,
  isPending,
  className,
  compact,
}: ExploreChipsBarProps): ReactElement | null {
  const router = useRouter();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const { logEvent } = useLogContext();

  const forYouCategory: ExploreCategory = useMemo(() => {
    const path = isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl;
    return {
      id: FOR_YOU_CATEGORY_ID,
      label: 'For you',
      path,
      // When a custom feed is the default, `/` shows that feed (not "For you"
      // content) — restrict matching to `/my-feed`. Without a custom default
      // `/` is MyFeed, so include both.
      matchPaths: isCustomDefaultFeed
        ? [`${webappUrl}my-feed`]
        : [path, webappUrl, `${webappUrl}my-feed`],
    };
  }, [isCustomDefaultFeed]);

  const allCategories = useMemo(
    () => [forYouCategory, ...categories],
    [forYouCategory, categories],
  );

  const activeId = useMemo(
    () =>
      findActiveChipId(allCategories, router.asPath, {
        preferId: FOR_YOU_CATEGORY_ID,
      }),
    [allCategories, router.asPath],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = scrollRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    if (typeof active?.scrollIntoView !== 'function') {
      return;
    }
    active.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [activeId, allCategories]);

  return (
    <div className={classNames('relative', className)}>
      <div
        ref={scrollRef}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12"
      >
        <NewStripCta className="h-10 rounded-12 px-3" />
        {allCategories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <Link key={category.id} href={category.path}>
              <a
                href={category.path}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive ? 'true' : undefined}
                onClick={() => {
                  if (!category.tag) {
                    return;
                  }

                  logEvent({
                    event_name: LogEvent.ClickFeedTagChip,
                    target_id: category.tag,
                  });
                }}
                className={classNames(
                  'inline-flex shrink-0 items-center rounded-12 border font-bold transition-colors',
                  compact
                    ? 'h-8 px-2.5 typo-footnote'
                    : 'h-10 px-3 typo-callout',
                  isActive
                    ? 'border-border-subtlest-tertiary bg-surface-float text-text-primary hover:bg-surface-hover'
                    : 'border-transparent bg-background-subtle text-text-tertiary hover:bg-surface-hover hover:text-text-primary',
                )}
              >
                {category.label}
              </a>
            </Link>
          );
        })}
        {isPending &&
          categories.length === 0 &&
          PLACEHOLDER_WIDTHS.map((width, index) => (
            <ElementPlaceholder
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              aria-hidden
              className={classNames(
                'shrink-0 rounded-12',
                compact ? 'h-8' : 'h-10',
                width,
              )}
            />
          ))}
        <Link href={`${webappUrl}feeds/new`}>
          <a
            href={`${webappUrl}feeds/new`}
            aria-label="New feed"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-12 border border-transparent bg-background-subtle px-3 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <PlusIcon />
          </a>
        </Link>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
      />
    </div>
  );
}
