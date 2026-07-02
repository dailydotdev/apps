import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlusIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import { isExtension } from '../../lib/func';
import { SharedFeedPage } from '../utilities';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useDailyPage } from '../../hooks/feed/useDailyPage';
import { DailySwitcher } from '../../features/daily/DailySwitcher';
import type { ExploreCategory } from './exploreCategories';
import { findActiveChipId } from './exploreCategories';
import { LogEvent } from '../../lib/log';
import { NewStripCta } from './NewStripCta';

interface ExploreChipsBarProps {
  categories: ExploreCategory[];
  isPending?: boolean;
  className?: string;
  // v2 page-header strip: render the categories as directory-style tabs
  // (text + active Float background + bottom-border underline) so the chips
  // header matches the canonical tabbed page header. Off → legacy pills.
  compact?: boolean;
  onNavTabClick?: (tab: string) => void;
}

const PLACEHOLDER_WIDTHS = ['w-20', 'w-16', 'w-24', 'w-20', 'w-28', 'w-16'];

const FOR_YOU_CATEGORY_ID = 'foryou';

export function ExploreChipsBar({
  categories,
  isPending,
  className,
  compact,
  onNavTabClick,
}: ExploreChipsBarProps): ReactElement | null {
  const router = useRouter();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const { logEvent } = useLogContext();
  const { isLoggedIn } = useAuthContext();
  const { isEnabled } = useDailyPage();
  const showDailySwitcher = isLoggedIn && isEnabled;

  const onFeedClick =
    isExtension && onNavTabClick
      ? () => onNavTabClick(isCustomDefaultFeed ? SharedFeedPage.MyFeed : '/')
      : undefined;

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
    () => (showDailySwitcher ? categories : [forYouCategory, ...categories]),
    [showDailySwitcher, forYouCategory, categories],
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
        <NewStripCta
          className={compact ? 'h-8 rounded-10 px-2.5' : 'h-10 rounded-12 px-3'}
        />
        {showDailySwitcher && (
          <DailySwitcher reverse compact={compact} onFeedClick={onFeedClick} />
        )}
        {allCategories.map((category) => {
          const isActive = category.id === activeId;
          const onClick = () => {
            if (!category.tag) {
              return;
            }

            logEvent({
              event_name: LogEvent.ClickFeedTagChip,
              target_id: category.tag,
            });
          };

          // v2 strip: reuse the exact Squads directory tab (Button
          // Float/Tertiary + bottom-border underline) so the chips header
          // matches the canonical tabbed page header. The `py-3` wrapper makes
          // the tab the tallest item so its underline lands on the strip's
          // bottom border. We skip the directory's `capitalize` to preserve
          // tag casing.
          if (compact) {
            return (
              <span
                key={category.id}
                data-active={isActive ? 'true' : undefined}
                className={classNames(
                  'relative flex shrink-0 items-center py-3',
                  isActive &&
                    'after:absolute after:inset-x-0 after:bottom-0 after:mx-auto after:w-1/2 after:border-b-2 after:border-text-primary',
                )}
              >
                <Link href={category.path} legacyBehavior>
                  <Button
                    tag="a"
                    href={category.path}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={onClick}
                    size={ButtonSize.Small}
                    pressed={isActive}
                    variant={
                      isActive ? ButtonVariant.Float : ButtonVariant.Tertiary
                    }
                  >
                    {category.label}
                  </Button>
                </Link>
              </span>
            );
          }

          return (
            <Link key={category.id} href={category.path}>
              <a
                href={category.path}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive ? 'true' : undefined}
                onClick={onClick}
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
            className={classNames(
              'inline-flex shrink-0 items-center justify-center border border-transparent bg-background-subtle text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary',
              compact ? 'h-8 rounded-10 px-2.5' : 'h-10 rounded-12 px-3',
            )}
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
