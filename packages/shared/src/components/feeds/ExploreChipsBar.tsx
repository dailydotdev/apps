import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { PlusIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import useCustomDefaultFeed from '../../hooks/feed/useCustomDefaultFeed';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import type { ExploreCategory } from './exploreCategories';
import { findActiveChipId } from './exploreCategories';
import { LogEvent } from '../../lib/log';
import { NewStripCta } from './NewStripCta';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureFeedChips } from '../../lib/featureManagement';
import { useLayoutV2Fixes } from '../../hooks/layout/useLayoutV2Fixes';

interface ExploreChipsBarProps {
  categories: ExploreCategory[];
  isPending?: boolean;
  className?: string;
  // Takes the place of the For you link while it is the page, so the lit
  // tab can open the feed's sort.
  renderForYou?: () => ReactNode;
}

const PLACEHOLDER_WIDTHS = ['w-20', 'w-16', 'w-24', 'w-20', 'w-28', 'w-16'];

const FOR_YOU_CATEGORY_ID = 'foryou';

// The layout v2 fixes experiment's second tab. Following otherwise lives only
// in the You panel on laptop.
const followingCategory: ExploreCategory = {
  id: 'following',
  label: 'Following',
  path: `${webappUrl}following`,
};

export function ExploreChipsBar({
  categories,
  isPending,
  className,
  renderForYou,
}: ExploreChipsBarProps): ReactElement | null {
  const router = useRouter();
  const { isCustomDefaultFeed } = useCustomDefaultFeed();
  const { logEvent } = useLogContext();
  const { isLoggedIn } = useAuthContext();
  const { value: variant, isLoading: isVariantLoading } = useConditionalFeature(
    {
      feature: featureFeedChips,
      shouldEvaluate: isLoggedIn,
    },
  );
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

  const isLayoutV2Fixes = useLayoutV2Fixes();
  const allCategories = useMemo(
    () => [
      forYouCategory,
      ...(isLayoutV2Fixes ? [followingCategory] : []),
      ...categories,
    ],
    [forYouCategory, isLayoutV2Fixes, categories],
  );

  const activeId = useMemo(
    () =>
      findActiveChipId(allCategories, router.asPath, {
        preferId: FOR_YOU_CATEGORY_ID,
      }),
    [allCategories, router.asPath],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCenteredIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeId) {
      lastCenteredIdRef.current = null;
      return;
    }
    if (lastCenteredIdRef.current === activeId) {
      return;
    }

    const active = scrollRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    if (typeof active?.scrollIntoView !== 'function') {
      return;
    }
    active.scrollIntoView({ block: 'nearest', inline: 'center' });
    lastCenteredIdRef.current = activeId;
  }, [activeId]);

  return (
    <div className={classNames('relative', className)}>
      <div
        ref={scrollRef}
        className="no-scrollbar flex items-center gap-2 overflow-x-auto pr-12"
      >
        <NewStripCta className="h-8 rounded-10 px-2.5" />
        {allCategories.map((category) => {
          const isActive = category.id === activeId;
          const onClick = () => {
            if (!category.tag) {
              return;
            }

            logEvent({
              event_name: LogEvent.ClickFeedTagChip,
              target_id: category.tag,
              extra: JSON.stringify({
                variant: isVariantLoading ? undefined : variant,
                origin: category.origin,
              }),
            });
          };

          // Reuse the exact Squads directory tab (Button Float/Tertiary +
          // bottom-border underline) so the chips header matches the
          // canonical tabbed page header. The `py-3` wrapper makes the tab
          // the tallest item so its underline lands on the strip's bottom
          // border. We skip the directory's `capitalize` to preserve tag
          // casing.
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
              {isActive &&
              category.id === FOR_YOU_CATEGORY_ID &&
              renderForYou ? (
                renderForYou()
              ) : (
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
              )}
            </span>
          );
        })}
        {isPending &&
          categories.length === 0 &&
          PLACEHOLDER_WIDTHS.map((width, index) => (
            <ElementPlaceholder
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              aria-hidden
              className={classNames('h-8 shrink-0 rounded-12', width)}
            />
          ))}
        <Link href={`${webappUrl}feeds/new`}>
          <a
            href={`${webappUrl}feeds/new`}
            aria-label="New feed"
            className={classNames(
              'inline-flex h-8 shrink-0 items-center justify-center rounded-10 border border-transparent bg-background-subtle px-2.5 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary',
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
