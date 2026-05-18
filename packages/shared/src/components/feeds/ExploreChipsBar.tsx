import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { webappUrl } from '../../lib/constants';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { useLogContext } from '../../contexts/LogContext';
import type { ExploreCategory } from './exploreCategories';
import { LogEvent } from '../../lib/log';

interface ExploreChipsBarProps {
  categories: ExploreCategory[];
  isPending?: boolean;
  className?: string;
}

const PLACEHOLDER_WIDTHS = ['w-20', 'w-16', 'w-24', 'w-20', 'w-28', 'w-16'];

const FOR_YOU_CATEGORY_ID = 'foryou';

const normalizePath = (p: string): string => {
  const noQuery = p.split('?')[0];
  if (!noQuery || noQuery === '/') {
    return '/';
  }
  return noQuery.replace(/\/$/, '');
};

export function ExploreChipsBar({
  categories,
  isPending,
  className,
}: ExploreChipsBarProps): ReactElement | null {
  const router = useRouter();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const { logEvent } = useLogContext();

  const forYouCategory: ExploreCategory = useMemo(
    () => ({
      id: FOR_YOU_CATEGORY_ID,
      label: 'For you',
      path: isCustomDefaultFeed ? `${webappUrl}my-feed` : webappUrl,
    }),
    [isCustomDefaultFeed],
  );
  const activePath = useMemo(
    () => normalizePath(router.asPath),
    [router.asPath],
  );

  const allCategories = useMemo(
    () => [forYouCategory, ...categories],
    [forYouCategory, categories],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = scrollRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    active?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [activePath, allCategories]);

  return (
    <div className={classNames('relative', className)}>
      <div
        ref={scrollRef}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12"
      >
        {allCategories.map((category) => {
          // For You owns the homepage. Match it against both `/` and `/my-feed`
          // so the user's default custom feed (also at `/`) doesn't steal the
          // active state.
          const isForYou = category.id === FOR_YOU_CATEGORY_ID;
          const candidates = isForYou
            ? [category.path, webappUrl, `${webappUrl}my-feed`]
            : [category.path];
          const isActive = candidates.some(
            (candidate) => normalizePath(candidate) === activePath,
          );
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
                  'inline-flex h-10 shrink-0 items-center rounded-12 border px-3 font-bold transition-colors typo-callout',
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
              className={classNames('h-10 shrink-0 rounded-12', width)}
            />
          ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
      />
    </div>
  );
}
